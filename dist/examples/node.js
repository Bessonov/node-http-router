import http from 'http';
import { bool, endpoint, exactUrlPathname, } from '../matchers/index.js';
import { NodeHttpRouter, } from '../node/NodeHttpRouter.js';
/*

Demo how to use router with native node native http server

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
    // it's not necessary to type the matcher, but it give you a confidence
    matcher: endpoint('GET', /^\/hello\/(?<name>[^/]+)$/),
    handler: ({ data: { res }, match }) => {
        res.write(`Hello ${match.result.match.groups.name}!`);
        res.end();
    },
});
router.addRoute({
    matcher: exactUrlPathname(['/shutdown']),
    handler: ({ data: { res } }) => {
        res.write('Shutdown the server');
        res.end();
        server.close();
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