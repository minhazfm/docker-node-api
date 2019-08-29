import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { validationResult } from 'express-validator/check';
import * as path from 'path';
import { tokenGuard, versionCheck } from '../middlewares/utils.middleware';

export class CameraRouter {

    public router: Router;

    constructor() {
        this.router = Router();
        this.init();
    }

    private init(): void {
        this.router
            .get('/:cameraId/events/:recordingId', [tokenGuard(), versionCheck('1.0.0')], this.getRecording);
    }

    private getRecording(req: Request, res: Response, next: NextFunction): any {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.mapped() });
        }

        if (req.params.cameraId !== '2' || req.params.recordingId !== '368572') {
            return res
                .status(404)
                .send({
                    success: false,
                    message: 'Camera or event recording does not exist'
                })
        }

        return res
            .status(200)
            .sendFile(path.join(__dirname, '../assets', 'singleVideoArchive.json'));
    }

}

export default new CameraRouter().router;