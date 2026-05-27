import { profileRoutes } from './routes/profiles.ts';

Bun.serve({
    port: 3000,
    routes: {
        ...profileRoutes,
    },
});

console.log('Server listening on port 3000');
