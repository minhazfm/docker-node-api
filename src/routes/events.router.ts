import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { validationResult } from 'express-validator/check';
import { tokenGuard, versionCheck } from '../middlewares/utils.middleware';
import { EventsService } from '../services/events.service';

const eventsService = new EventsService();

export class EventsRouter {

    public router: Router

    constructor() {
        this.router = Router()
        this.init()
    }

    private init(): void {
        this.router
            .get('/gatewayId/:id', [tokenGuard(), versionCheck('1.0.0')], this.getEvents)
    }

    private getEvents(req: Request, res: Response, next: NextFunction): any {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.mapped() })
        }

        if (req.params.id !== '21') {
            return res
                .status(404)
                .send({
                    success: false,
                    message: 'Gateway does not exist'
                })
        }

        req.socket.setTimeout(Number.MAX_SAFE_INTEGER)

        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        })

        res.write('event: awk\n' + 'data: ' + JSON.stringify({ type: 'heartbeat' }) + '\n\n')

        setInterval(() => {
            eventsService.emitMessage()
                .then((value) => {
                    res.write(value);
                })
                .catch(()=> {
                    console.log('Error with setInterval for mock events')
                })
        }, 4000)
    }

}

export default new EventsRouter().router