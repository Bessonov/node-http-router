import {
	IncomingMessage,
	ServerResponse,
} from 'http'
import {
	MatchedResult,
} from '../matchers'
import {
	Router,
} from '../Router'
import {
	ServerRequest,
	toServerRequest,
} from './ServerRequest'

export interface NodeHttpRouterParams<MR> {
	data: {
		req: ServerRequest
		res: ServerResponse
	}
	match: MatchedResult<MR>
}

export class NodeHttpRouter extends Router<{
	req: ServerRequest
	res: ServerResponse
}> {
	constructor() {
		super()
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
