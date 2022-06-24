import {
	IncomingMessage,
} from 'http'

export type ServerRequest = IncomingMessage & {
	url: string
	method: string
}

export function toServerRequest(req: IncomingMessage): ServerRequest {
	if (req.method === undefined) {
		throw new Error(`request missing 'method'`)
	}
	if (req.url === undefined) {
		throw new Error(`request missing 'url'`)
	}
	return req as ServerRequest
}
