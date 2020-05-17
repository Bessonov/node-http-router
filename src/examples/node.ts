import http from 'http'
import { Router } from '../router'
import {
	EndpointMatcher, ExactUrlPathnameMatcher,
} from '../matchers'

/*

Demo how to use router with native node native http server

run with:

pnpm run example-node-start
npm run example-node-start
yarn example-node-start

*/

const router = new Router((req, res) => {
	res.statusCode = 404
	res.end()
})

const [address, port] = ['localhost', 8080]

const server = http.createServer(router.serve).listen(port, address)
server.once('listening', () => {
	// eslint-disable-next-line no-console
	console.log(`started at http://${address}:${port}`)
})

router.addRoute({
	// it's not necessary to type the matcher, but it give you a confidence
	matcher: new EndpointMatcher<{groups: {name: string}}>('GET', /^\/hello\/(?<name>[^/]+)$/),
	handler: (req, res, match) => {
		res.write(`Hello ${match.match.groups.name}!`)
		res.end()
	},
})

router.addRoute({
	matcher: new ExactUrlPathnameMatcher(['/shutdown']),
	handler: (req, res) => {
		res.write('Shutdown the server')
		res.end()
		server.close()
	},
})
