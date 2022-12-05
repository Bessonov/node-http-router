import http from 'http'
import {
	send,
	serve,
} from 'micro'
import {
	EndpointMatcher,
	ExactUrlPathnameMatcher,
} from '../matchers'
import {
	BooleanMatcher,
} from '../matchers/BooleanMatcher'
import {
	NodeHttpRouter,
} from '../node/NodeHttpRouter'

/*

Demo how to use router with micro@canary

run with:

pnpm run example-micro-start
npm run example-micro-start
yarn example-micro-start

*/

const router = new NodeHttpRouter()

const [address, port] = ['localhost', 8080]

const server = http.createServer(serve(router.serve)).listen(port, address)
server.once('listening', () => {
	// eslint-disable-next-line no-console
	console.log(`started at http://${address}:${port}`)
})

router.addRoute({
	// it's not necessary to type the matcher, but it give you a confidence
	matcher: new EndpointMatcher<{ name: string }>('GET', /^\/hello\/(?<name>[^/]+)$/),
	handler: ({ match }) => {
		return `Hello ${match.result.match.groups.name}!`
	},
})

router.addRoute({
	matcher: new ExactUrlPathnameMatcher(['/shutdown']),
	handler: () => {
		server.close()
		return 'Shutdown the server'
	},
})

// 404 handler
router.addRoute({
	matcher: new BooleanMatcher(true),
	handler: ({ data: { res } }) => send(res, 404),
})
