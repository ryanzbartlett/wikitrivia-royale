import { handleProfiles } from './routes/profiles.ts';

Bun.serve({
    port: 3000,
    async fetch(req) {
        const url = new URL(req.url);

        if (url.pathname === '/') {
            return new Response('Hello World!');
        }

        if (url.pathname.startsWith('/profiles')) {
            return handleProfiles(req, url);
        }

        return new Response('Not Found', { status: 404 });
    },
});

console.log('Server listening on port 3000');
