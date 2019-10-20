import http from 'http'
import micro, { sendError } from 'micro'
import { Router } from '../router'
import { EndpointMatcher } from '../matchers/EndpointMatcher'
import { ExactUrlPathnameMatcher } from '../matchers'

/*

Demo how to use router with micro@canary

run with:

pnpm run example-micro-start
npm run example-micro-start
yarn example-micro-start

*/

const router = new Router((req, res) => sendError(req, res, { statusCode: 404 }))

const [address, port] = ['localhost', 8080]

const server = http.createServer(micro(router.serve)).listen(port, address)
server.once('listening', () => {
	// eslint-disable-next-line no-console
	console.log(`started at http://${address}:${port}`)
})

router.addRoute({
	// it's not necessary to type the matcher, but it give you a confidence
	matcher: new EndpointMatcher<{groups: {name: string}}>('GET', /^\/hello\/(?<name>[^/]+)$/),
	handler: (req, res, match) => {
		return `Hello ${match.match.groups.name}!`
	},
})

router.addRoute({
	matcher: new ExactUrlPathnameMatcher(['/shutdown']),
	handler: () => {
		server.close()
		return 'Shutdown the server'
	},
})
