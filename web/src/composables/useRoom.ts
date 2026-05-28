import { useRouter } from 'vue-router';
import { useProfile } from './useProfile';
import type { Room } from '../../../shared/types.ts';

export function useRoom() {
    const router = useRouter();
    const { profile } = useProfile();

    async function createRoom(): Promise<void> {
        if (!profile.value) return;
        const res = await fetch('/api/rooms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profile.value),
        });
        if (!res.ok) throw new Error('Failed to create room');
        const room = await res.json() as Room;
        router.push({ name: 'Game', params: { id: room.code } });
    }

    function joinRoom(code: string): void {
        router.push({ name: 'Game', params: { id: code.toUpperCase() } });
    }

    return { createRoom, joinRoom };
}
