import { IncomingMessage, ServerResponse, } from 'http';
import { Router, } from '../Router';
import { toServerRequest, } from './ServerRequest';
export class NodeHttpRouter extends Router {
    constructor(defaultHandler) {
        super(defaultHandler);
        this.serve = this.serve.bind(this);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    serve(req, res) {
        return this.exec({
            req: toServerRequest(req),
            res,
        });
    }
}
//# sourceMappingURL=NodeHttpRouter.js.map