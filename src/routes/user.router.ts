import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { validationResult } from 'express-validator/check';
import * as path from 'path';
import { clientCheck, tokenGuard, versionCheck, badRequestResponse } from '../middlewares/utils.middleware';
import { UserService } from '../services/user.service';

const userService = new UserService();

export class UserRouter {

    public router: Router;

    constructor() {
        this.router = Router();
        this.init();
    }

    private init(): void {
        this.router
            .post('/login', [clientCheck(), versionCheck('1.0.0')], this.login)
            // .post('/login/account', [clientCheck(), versionCheck('1.0.0')], this.loginAndAccount)
            .post('/logout', [tokenGuard(), clientCheck(), versionCheck('1.0.0')], this.logout)
            .get('/test', [tokenGuard(), versionCheck('1.0.0')], this.testV1)
            .get('/test', [tokenGuard(), versionCheck('1.1.0')], this.testV11)
            // .get('/account', [tokenGuard(), versionCheck('1.0.0')], this.getAccount)
            // .get('/activities', [tokenGuard(), versionCheck('1.0.0')], this.getActivities)
    }

    private testV1(req: Request, res: Response, next: NextFunction): any {

        console.log('User Being Passed In Every Request -> ', res.locals.user);

        return res
            .status(200)
            .send({
                success: true,
                message: 'Version 1 of test'
            });
    }

    private testV11(req: Request, res: Response, next: NextFunction): Response {
        return res
            .status(200)
            .send({
                success: true,
                message: 'Version 1.1 of test'
            });
    }

    private login(req: Request, res: Response, next: NextFunction): Response {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.mapped() });
        }

        userService.login(res.locals.client, req.body.username, req.body.password)
            .then(value => {
                return res
                    .status(200)
                    .send({
                        success: true,
                        token: value
                    });
            })
            .catch(error => {
                return badRequestResponse(
                    res, 
                    401, 
                    'Check the username or password bcrypt compare method result', 
                    error.message || 'Unauthorized'
                )
            });
    }

    private loginAndAccount(req: Request, res: Response, next: NextFunction): Response {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.mapped() });
        }

        // setTimeout(() => {
            userService.login(res.locals.client, req.body.username, req.body.password)
                .then(value => {
                    userService.inputTokenToAccountPayload(value)
                        .then(() => {
                            return res
                                .status(200)
                                .sendFile(path.join(__dirname, '../assets', 'account.json'));
                        })
                        .catch(error => {
                            return badRequestResponse(
                                res, 
                                500, 
                                'Internal server error, check with back end service', 
                                error.message || 'Services are currently unavailable'
                            )
                        })
                })
                .catch(error => {
                    return badRequestResponse(
                        res, 
                        401, 
                        'Check the username or password bcrypt compare method result', 
                        error.message || 'Unauthorized'
                    )
                })
        // }, 3000)
    }

    private logout(req: Request, res: Response, next: NextFunction): Response {
        return res
            .status(200)
            .send({
                success: true
            })
    }

    private getAccount(req: Request, res: Response, next: NextFunction): any {
        return res
            .status(200)
            .sendFile(path.join(__dirname, '../assets', 'account.json'));
    }

    private getActivities(req: Request, res: Response, next: NextFunction): any {
        return res
            .status(200)
            .sendFile(path.join(__dirname, '../assets', 'activities.json'));
    }

}

export default new UserRouter().router;