import * as jwt from 'jsonwebtoken';
import * as semver from 'semver';
import { IncomingHttpHeaders } from 'http';
import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { UserService } from '../services/user.service';

const userService = new UserService();

export interface ErrorResponse {
    errorCode: number,
    developerMessage: string,
    userMessage: string
}

export function badRequestResponse(res: Response, errorCode: number, developerMessage: string, userMessage?: string) {
    let errorBody: ErrorResponse = {
        errorCode: errorCode,
        developerMessage: developerMessage,
        userMessage: userMessage
    }

    return res
        .status(errorBody.errorCode)
        .send(errorBody)
}

export function getTokenFromHeaders(headers: IncomingHttpHeaders): string {
    let header: any = headers.authorization;

    if (!header) {
        return null;
    }

    return header.split(' ')[1];
}

export function clientCheck(): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
        let client: string = req.get('client-type');

        if (!client || !client.includes('client')) {
            return badRequestResponse(
                res, 
                400, 
                'Check the HTTP headers in your request: Missing Client-Type header or no client defined', 
                'The request could not be completed at this time, please try again later'
            )
            // throw new Error ('No Client-Type defined');
        }

        let clientRequested: string = client.match(new RegExp('(?:client=)([\\w\\d\\s]+)(?=\\\;)'))[1];

        if (clientRequested !== 'snMobile' && clientRequested !== 'snPortal') {
            return badRequestResponse(
                res, 
                400, 
                'Check the HTTP headers in your request: Unsupported client defined', 
                'The request could not be completed at this time, please try again later'
            )
            // throw new Error ('Client not supported');
        }

        res.locals.client = clientRequested;
        return next();
    }
}

export function versionCheck(assignedVersion: string): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
        let version: string = req.get('client-type');

        if (!version || !version.includes('version')) {
            return badRequestResponse(
                res, 
                400, 
                'Check the HTTP headers in your request: Missing Client-Type header or no version defined', 
                'The request could not be completed at this time, please try again later'
            )
            // throw new Error ('No Client-Type defined');
        }

        let versionRequested: string = version.match(new RegExp('(?:version=)([\\W\\S]+)'))[1];

        return semver.satisfies(versionRequested, assignedVersion) ? next() : next('route');
    }
}

export function verifyToken(token: string): Promise<string> {
    return new Promise((resolve, reject) => {
        jwt.verify(token, this._jwtSecret, (err: any, decoded: any) => {
            if (err) {
                return reject(err);
            }

            return resolve(decoded);
        });
    });
}

export function tokenGuard(): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
        let token: string = this.getTokenFromHeaders(req.headers) || req.query.token || req.body.token || '';

        userService.verifyToken(token)
            .then(user => {
                if (!user) {
                    return badRequestResponse(
                        res, 
                        401, 
                        'The token needs to be renewed, or a user cannot be found from the uuid', 
                        'Please sign out and sign in again to establish a new session'
                    )
                }
                res.locals.user = user;
                return next();
            })
            .catch(error => {
                return badRequestResponse(
                    res, 
                    401, 
                    'There was an issue verifying your token', 
                    'Please sign out and sign in again to establish a new session'
                )
            });
    }
}