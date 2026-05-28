import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useProfile } from './useProfile';
import { useGameStore } from '@/stores/game';
import type { Room, ServerMessage } from '../../../shared/types.ts';

export function useRoom() {
    const router = useRouter();
    const { profile } = useProfile();

    const room = ref<Room | null>(null);
    const error = ref('');
    let ws: WebSocket | null = null;

    async function createRoom(): Promise<void> {
        if (!profile.value) return;
        const res = await fetch('/api/rooms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profile.value),
        });
        if (!res.ok) throw new Error('Failed to create room');
        const data = await res.json() as Room;
        router.push({ name: 'Game', params: { id: data.code } });
    }

    function joinRoom(code: string): void {
        router.push({ name: 'Game', params: { id: code.toUpperCase() } });
    }

    function connect(code: string): void {
        if (!profile.value) return;

        const gameStore = useGameStore();
        gameStore.myPlayerId = profile.value.id;

        const params = new URLSearchParams({
            roomCode: code,
            profileId: profile.value.id,
            profileName: profile.value.name,
        });

        const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
        ws = new WebSocket(`${protocol}://${location.host}/ws?${params}`);

        gameStore.setSendFn((msg) => ws?.send(JSON.stringify(msg)));

        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data as string) as ServerMessage;
            switch (msg.type) {
                case 'room_state':
                    room.value = msg.room;
                    break;
                case 'player_joined':
                    if (room.value) {
                        room.value = { ...room.value, players: [...room.value.players, msg.player] };
                    }
                    break;
                case 'player_left':
                    if (room.value) {
                        room.value = {
                            ...room.value,
                            players: room.value.players.filter(p => p.id !== msg.playerId),
                            ...(msg.newHostId ? { hostId: msg.newHostId } : {}),
                        };
                    }
                    break;
                default:
                    gameStore.handleMessage(msg);
            }
        };

        ws.onerror = () => { error.value = 'Connection error.'; };
        ws.onclose = (e) => { if (!e.wasClean) error.value = 'Connection lost.'; };
    }

    function disconnect(): void {
        ws?.close();
        ws = null;
        useGameStore().reset();
    }

    return { room, error, createRoom, joinRoom, connect, disconnect };
}
