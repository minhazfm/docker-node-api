import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { validationResult } from 'express-validator/check';
import * as path from 'path';
import { badRequestResponse, versionCheck } from '../middlewares/utils.middleware';

export class RegistrationRouter {

    public router: Router

    constructor() {
        this.router = Router()
        this.init()
    }

    private init(): void {
        this.router
            .post('/', versionCheck('1.0.0'), this.getEnvironment)
    }

    private getEnvironment(req: Request, res: Response, next: NextFunction): any {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.mapped() })
        }

        if (req.body.username === 'mobteam') {
            return res
                .status(200)
                .sendFile(path.join(__dirname, '../assets', 'environmentOne.json'))
        }
        else if (req.body.username === 'testuser') {
            return res
                .status(200)
                .sendFile(path.join(__dirname, '../assets', 'environmentTwo.json'))
        }

        return badRequestResponse(
            res,
            404,
            'The requested username was not found on any server',
            'Username does not exist'
        )
        // throw new Error('Environment for user not found');
    }

}

export default new RegistrationRouter().router;