import { profileRoutes } from './routes/profiles.ts';
import { roomRoutes } from './routes/rooms.ts';

Bun.serve({
    port: 3000,
    routes: {
        ...profileRoutes,
        ...roomRoutes,
    },
});

console.log('Server listening on port 3000');
