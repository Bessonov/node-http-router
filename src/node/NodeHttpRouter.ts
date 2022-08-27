import {
	IncomingMessage,
	ServerResponse,
} from 'http'
import {
	MatchResult,
	MatchedResult,
} from '../matchers'
import {
	Handler,
	Router,
} from '../Router'
import {
	ServerRequest,
	toServerRequest,
} from './ServerRequest'

interface ServerRequestResponse {
	req: ServerRequest
	res: ServerResponse
}

export interface NodeHttpRouterParams<MR> {
	data: ServerRequestResponse
	match: MatchedResult<MR>
}

export class NodeHttpRouter extends Router<ServerRequestResponse> {
	constructor(defaultHandler?: Handler<MatchResult<unknown>, ServerRequestResponse>) {
		super(defaultHandler)
		this.serve = this.serve.bind(this)
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	serve(req: IncomingMessage, res: ServerResponse): any {
		return this.exec({
			req: toServerRequest(req),
			res,
		})
	}
}
