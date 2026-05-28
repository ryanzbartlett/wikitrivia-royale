<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Room } from '../../../shared/types.ts';
import { useProfile } from '@/composables/useProfile';
import { useGameStore } from '@/stores/game';

const props = defineProps<{ room: Room }>();

const { profile } = useProfile();
const game = useGameStore();

const isHost = computed(() => props.room.hostId === profile.value?.id);
const selectedTimer = ref(30);
const timerOptions = [15, 30, 45, 60];
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="text-center">
      <p class="text-sm uppercase tracking-widest opacity-60">Room code</p>
      <p class="text-5xl font-bold tracking-widest">{{ props.room.code }}</p>
    </div>

    <div class="card bg-base-200">
      <div class="card-body">
        <h2 class="card-title">Players ({{ props.room.players.length }})</h2>
        <ul class="flex flex-col gap-1">
          <li
            v-for="player in props.room.players"
            :key="player.id"
            class="flex items-center gap-2"
          >
            <span>{{ player.name }}</span>
            <span v-if="player.id === props.room.hostId" class="badge badge-primary badge-sm">host</span>
          </li>
        </ul>
      </div>
    </div>

    <template v-if="isHost">
      <div class="flex flex-col gap-2">
        <p class="text-sm font-semibold">Timer per card</p>
        <div class="flex gap-2">
          <button
            v-for="t in timerOptions"
            :key="t"
            class="btn btn-sm"
            :class="selectedTimer === t ? 'btn-primary' : 'btn-ghost'"
            @click="selectedTimer = t"
          >{{ t }}s</button>
        </div>
      </div>
      <button
        class="btn btn-success btn-lg"
        :disabled="props.room.players.length < 1"
        @click="game.startGame(selectedTimer)"
      >
        Start Game
      </button>
    </template>
    <p v-else class="text-center opacity-60">Waiting for host to start…</p>
  </div>
</template>
