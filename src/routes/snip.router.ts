import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { validationResult } from 'express-validator/check';
import { badRequestResponse, tokenGuard, versionCheck } from '../middlewares/utils.middleware';
import { SnipService } from '../services/snip.service';

const snipService = new SnipService();

export class SnipRouter {

    public router: Router

    constructor() {
        this.router = Router()
        this.init()
    }

    private init(): void {
        this.router
            .post('/gatewayId/:id', [tokenGuard(), versionCheck('1.0.0')], this.postRequest)
    }

    private postRequest(req: Request, res: Response, next: NextFunction): any {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.mapped() })
        }

        if (req.body.command.includes('arm') && (Number(req.body.parameters[0]) !== 0 || Number(req.body.parameters[1]) === 3)) {
            return badRequestResponse(
                res,
                404,
                'The requested gateway or partition could not be found',
                'The gateway or partition does not exist on this account'
            )
        } else if (req.body.command.includes('sensor') && Number(req.body.parameters[0]) !== 4) {
            return badRequestResponse(
                res,
                404,
                'The requested sensor could not be found',
                'The sensor does not exist on this account'
            )
        } else if ((req.body.command.includes('close') || req.body.command.includes('open') 
                    || req.body.command.includes('lock') || req.body.command.includes('unlock')
                    || req.body.command.includes('set') || req.body.command.includes('turn')) && 
                   !req.body.parameters.includes('2') && 
                   !req.body.parameters.includes('3') && 
                   !req.body.parameters.includes('5') && 
                   !req.body.parameters.includes('11') &&
                   !req.body.parameters.includes('19')) {
            return badRequestResponse(
                res,
                404,
                'The requested device id could not be found',
                'The device was not found on your account'
            )
        }

        setTimeout(() => {
            snipService.processRequest(req.body)
                .then(() => {
                    return res
                        .status(200)
                        .send({
                            success: true
                        });
                })
                .catch(() => {
                    return res
                        .status(412)
                        .send({
                            success: false
                        });
                })
        }, 1000)
    }

}

export default new SnipRouter().router