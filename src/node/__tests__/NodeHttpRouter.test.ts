import {
	IncomingMessage,
	ServerResponse,
} from 'http'
import {
	NodeHttpRouter,
} from '../NodeHttpRouter'

it('missing method in request', () => {
	const nodeRouter = new NodeHttpRouter()
	expect(() => nodeRouter.serve({} as IncomingMessage, {} as ServerResponse)).toThrowError(`request missing 'method'`)
})

it('missing url in request', () => {
	const nodeRouter = new NodeHttpRouter()
	expect(() => nodeRouter.serve({ method: 'GET' } as IncomingMessage, {} as ServerResponse)).toThrowError(`request missing 'url'`)
})
