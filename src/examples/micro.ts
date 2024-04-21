import http from 'http'
import {
	send,
	serve,
} from 'micro'
import {
	bool,
	endpoint,
	exactUrlPathname,
} from '../matchers/index.js'
import {
	NodeHttpRouter,
} from '../node/NodeHttpRouter.js'
import {
	chain,
	getNthVal,
	requiredVal,
} from '../validators.js'

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
	matcher: endpoint('GET', /^\/hello\/(?<name>[^/]+)$/, {
		url: {
			name: chain(getNthVal(), requiredVal()),
		},
	}),
	handler: ({ match }) => {
		return `Hello ${match.result.pathname.params.name}!`
	},
})

router.addRoute({
	matcher: exactUrlPathname(['/shutdown']),
	handler: () => {
		server.close()
		return 'Shutdown the server'
	},
})

// 404 handler
router.addRoute({
	matcher: bool(true),
	handler: ({ data: { res } }) => send(res, 404),
})
