import { IncomingMessage } from 'http';
export type ServerRequest = IncomingMessage & {
    url: string;
    method: string;
};
export declare function toServerRequest(req: IncomingMessage): ServerRequest;
