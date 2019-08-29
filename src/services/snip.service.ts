import * as fs from 'fs'
import * as path from 'path'
import * as util from 'util'

const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)

export interface SnipRequest {
    command: string,
    parameters: Array<string>
}

export class SnipService {

    private possibleEventData: any

    constructor() {
        this.loadData()
    }

    private loadData() {
        readFile(path.join(__dirname, '../assets', 'events.json'), 'utf8')
            .then(data => {
                this.possibleEventData = JSON.parse(data)
            })
            .catch(error => {
                console.log(error)
                throw new Error('Could not read events.json asset file')
            })
    }

    public processRequest(request: SnipRequest): Promise<boolean> {
        switch (request.command) {
            case 'armAway':
            case 'armNight':
            case 'armStay':
            case 'disarm':
                return this.panelCommand(request)

            case 'turnOffSwitchBinaryControl':
            case 'turnOnSwitchBinaryControl':
                return this.deviceCommand(request)

            case 'setSwitchMultiLevelControl':
                return this.deviceCommand(request)

            case 'closeGarageControl':
            case 'openGarageControl':
                return this.deviceCommand(request)

            case 'lockEntryControl':
            case 'unlockEntryControl':
                return this.deviceCommand(request)

            case 'sensorBypass':
            case 'sensorUnbypass':
                return this.sensorCommand(request)

            case 'setThermostatFanMode':
            case 'setThermostatMode':
            case 'setThermostatTemperature':
            // case 'ZW_THERMOSTAT_SET_SETPOINT_AND_MODE':
                return this.deviceCommand(request)

            case 'ZWAVE_ADD_DEVICE':
            case 'ZWAVE_DELETE_DEVICE':
            case 'ZW_CANCEL_ALL_CONTROLLER_CMDS':
            case 'ZWAVE_DISCOVERY':
            case 'ZWAVE_OPTIMISE_NETWORK':
                break

            default:
                break
        }
    }

    private deviceCommand(request: SnipRequest): Promise<boolean> {
        return new Promise((resolve, reject) => {
            let newData = this.possibleEventData

            newData.deviceEvents.forEach(element => {
                if (element.id === Number(request.parameters[0]) && element.type === "entryControl") {
                    element.level = request.command === 'lockEntryControl' ? 255 : 0
                    element.status = request.command === 'lockEntryControl' ? 'locked' : 'unlocked'
                }
                else if (element.id === Number(request.parameters[0]) && element.type === "garageControl") {
                    element.level = request.command === 'closeGarageControl' ? 0 : 255
                    element.status = request.command === 'closeGarageControl' ? 'closed' : 'open'
                }
                else if (element.id === Number(request.parameters[0]) && element.type === "switchBinaryControl") {
                    element.level = request.command === 'turnOffSwitchBinaryControl' ? 0 : 255
                    element.status = request.command === 'turnOffSwitchBinaryControl' ? 'off' : 'on'
                }
                else if (element.id === Number(request.parameters[0]) && element.type === "switchMultiLevelControl") {
                    element.level = Number(request.parameters[1])
                    element.status = Number(request.parameters[1]) === 0 ? 'off' : 'on'
                }
                else if (element.id === Number(request.parameters[0]) && element.type === "thermostatControl") {
                    if (request.command === 'setThermostatFanMode') {
                        let value: String = request.parameters[1]
                        element.thermostatProperties.fanMode = value
                    }
                    else if (request.command === 'setThermostatMode') {
                        let value: String = request.parameters[1]
                        element.status = value
                        element.thermostatProperties.mode = value
                    }
                    else if (request.command === 'setThermostatTemperature') {
                        element.thermostatProperties.targetTemp = Number(request.parameters[1])
                    }
                }
                return writeFile(path.join(__dirname, '../assets', 'events.json'), JSON.stringify(newData, null, 4), 'utf8')
                    .then(() => {
                        resolve(true)
                    })
                    .catch(() => {
                        reject(false)
                    })
            })
        })
    }

    private panelCommand(request: SnipRequest): Promise<boolean> {
        return new Promise((resolve, reject) => {
            let newData = this.possibleEventData

            newData.panelEvents.forEach(element => {
                if (element.panelId === Number(request.parameters[0]) && element.id === Number(request.parameters[1])) {
                    let disarmedPayload = {
                        state: "disarmed",
                        sensorsOpen: false,
                        userMessaging: {
                            title: "Good Afternoon, David",
                            status: "Area 1 is currently disarmed",
                            statusTip: "All sensors are currently closed"
                        },
                        additionalProperties: null
                    }
                    let armedAwayPayload = {
                        state: "armedAway",
                        sensorsOpen: false,
                        userMessaging: {
                            title: "Good Evening, David",
                            status: "Area 1 is currently armed to away",
                            statusTip: "All sensors are currently closed"
                        },
                        additionalProperties: null
                    }
                    let armedNightPayload = {
                        state: "armedNight",
                        sensorsOpen: false,
                        userMessaging: {
                            title: "Good Evening, David",
                            status: "Area 1 is currently armed to night mode",
                            statusTip: "All sensors are currently closed"
                        },
                        additionalProperties: null
                    }
                    let armedStayPayload = {
                        state: "armedStay",
                        sensorsOpen: false,
                        userMessaging: {
                            title: "Good Evening, David",
                            status: "Area 1 is currently armed to stay",
                            statusTip: "All sensors are currently closed"
                        },
                        additionalProperties: null
                    }
                    element.status = request.command === 'armAway' ? armedAwayPayload : request.command === 'armNight' ? armedNightPayload : request.command === 'armStay' ? armedStayPayload : disarmedPayload
                    return writeFile(path.join(__dirname, '../assets', 'events.json'), JSON.stringify(newData, null, 4), 'utf8')
                        .then(() => {
                            resolve(true)
                        })
                        .catch(() => {
                            reject(false)
                        })
                }
            })
        })
    }

    private sensorCommand(request: SnipRequest): Promise<boolean> {
        return new Promise((resolve, reject) => {
            let newData = this.possibleEventData

            newData.sensorEvents.forEach(element => {
                if (element.id === Number(request.parameters[0])) {
                    element.bypass = request.command === 'sensorBypass' ? true : false

                    return writeFile(path.join(__dirname, '../assets', 'events.json'), JSON.stringify(newData, null, 4), 'utf8')
                        .then(() => {
                            resolve(true)
                        })
                        .catch(() => {
                            reject(false)
                        })
                }
            })
        })
    }

}