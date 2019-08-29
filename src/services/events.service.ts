import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

const readFile = util.promisify(fs.readFile);

export class EventsService {

    private possibleEventData: any
    private deviceData: Array<any>
    private panelData: Array<any>
    private sensorData: Array<any>
    private deviceCount: number
    private panelCount: number
    private sensorCount: number

    constructor() {
        this.loadData()
    }

    private loadData() {
        this.deviceData = []
        this.panelData = []
        this.sensorData = []
        this.deviceCount = 0
        this.panelCount = 0
        this.sensorCount = 0
    }

    public emitMessage(): Promise<string> {
        let emitValue: string

        return readFile(path.join(__dirname, '../assets', 'events.json'), 'utf8')
            .then(data => {
                this.possibleEventData = JSON.parse(data)
                this.deviceData = this.possibleEventData.deviceEvents
                this.panelData = this.possibleEventData.panelEvents
                this.sensorData = this.possibleEventData.sensorEvents

                for (let i = 0; i < 3; i++) {
                    if (i === this.deviceCount) {
                        emitValue = 'event: device\n' + 'data: ' + JSON.stringify(this.deviceData[i]) + '\n\n'
                        this.deviceCount += 1
                        break
                    }
                    else if (i === this.panelCount) {
                        emitValue = 'event: panel\n' + 'data: ' + JSON.stringify(this.panelData[i]) + '\n\n'
                        this.panelCount += 1
                        break
                    } else if (i === this.sensorCount) {
                        emitValue = 'event: sensor\n' + 'data: ' + JSON.stringify(this.sensorData[i]) + '\n\n'
                        this.sensorCount += 1
                        if (this.deviceCount === 3 && this.panelCount === 3 && this.sensorCount === 3) {
                            this.deviceCount = 0
                            this.panelCount = 0
                            this.sensorCount = 0
                        }
                        break
                    }
                }

                return emitValue
            })
            .catch(error => {
                console.log(error)
                throw new Error('Could not read events.json asset file')
            })
    }

}