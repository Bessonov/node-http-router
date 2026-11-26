import http from 'http';
import { bool, endpoint, } from '../matchers/index.js';
import { NodeHttpRouter, } from '../node/NodeHttpRouter.js';
import { chain, getNthVal, requiredVal, } from '../validators.js';
/*

Demo how to use router with node's native http server

run with:

pnpm run example-node-start
npm run example-node-start
yarn example-node-start

*/
const router = new NodeHttpRouter();
const [address, port] = ['localhost', 8080];
const server = http.createServer(router.serve).listen(port, address);
server.once('listening', () => {
    // eslint-disable-next-line no-console
    console.log(`started at http://${address}:${port}`);
});
router.addRoute({
    matcher: endpoint('GET', /^\/hello\/(?<name>[^/]+)$/, {
        url: {
            name: chain(getNthVal(), requiredVal()),
        },
    }),
    handler: ({ data: { res }, match }) => {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end(`Hello ${match.result.pathname.params.name}!`);
    },
});
// 404 handler
router.addRoute({
    matcher: bool(true),
    handler: ({ data: { res } }) => {
        res.statusCode = 404;
        res.end();
    },
});
//# sourceMappingURL=node.js.map