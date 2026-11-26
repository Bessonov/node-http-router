import { IncomingMessage, } from 'http';
export function toServerRequest(req) {
    if (req.method === undefined) {
        throw new Error(`request missing 'method'`);
    }
    if (req.url === undefined) {
        throw new Error(`request missing 'url'`);
    }
    return req;
}
//# sourceMappingURL=ServerRequest.js.map