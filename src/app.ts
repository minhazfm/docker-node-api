import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import { Router, Request, Response } from 'express';

import CameraRouter from './routes/camera.router';
import EventsRouter from './routes/events.router';
import RegistrationRouter from './routes/registration.router';
import SnipRouter from './routes/snip.router';
import UserRouter from './routes/user.router';

class App {

    public express: express.Application;

    constructor() {
        this.express = express();
        this.express.set('port', process.env.PORT || 8080);
        
        this.middleware();
        this.routes();
    }

    private middleware(): void {
        this.express.use(bodyParser.urlencoded({ extended: true }));
        this.express.use(bodyParser.json());
        this.express.use(cookieParser());
    }

    private routes(): void {
        let router: Router = express.Router();

        this.express.use('/', router);
        this.express.use('/rest/cameras', CameraRouter);
        this.express.use('/rest/events', EventsRouter);
        this.express.use('/rest/registration', RegistrationRouter);
        this.express.use('/rest/snip', SnipRouter);
        this.express.use('/rest/user', UserRouter);
    }

}

export default new App().express;