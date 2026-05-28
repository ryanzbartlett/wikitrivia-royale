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

const copied = ref(false);
function copyLink() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    copied.value = true;
    setTimeout(() => { copied.value = false; }, 2000);
  });
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center px-4">

    <!-- Top spacer + heading -->
    <section class="text-center pt-14 pb-6">
      <p class="text-primary text-xs uppercase tracking-[0.3em] font-medium opacity-80 mb-3">
        Game Lobby
      </p>
      <h1 class="font-display text-4xl font-bold mb-1">WikiTrivia Royale</h1>
    </section>

    <!-- Room code card -->
    <div class="w-full max-w-xs mb-6">
      <div class="bg-base-200 rounded-box px-6 py-5 text-center">
        <p class="text-base-content/40 text-xs uppercase tracking-widest mb-2">Room Code</p>
        <p class="font-display text-5xl font-bold tracking-[0.2em] text-base-content mb-4">
          {{ props.room.code }}
        </p>
        <button
          class="btn btn-ghost btn-xs text-base-content/50 hover:text-base-content/80 gap-1.5"
          @click="copyLink"
        >
          <span class="text-sm">{{ copied ? '✓' : '⎘' }}</span>
          {{ copied ? 'Copied!' : 'Copy invite link' }}
        </button>
      </div>
    </div>

    <!-- Players -->
    <div class="w-full max-w-xs mb-6">
      <div class="flex items-center gap-3 mb-3">
        <div class="flex-1 h-px bg-base-300" />
        <p class="text-base-content/40 text-xs uppercase tracking-widest shrink-0">
          Players ({{ props.room.players.length }})
        </p>
        <div class="flex-1 h-px bg-base-300" />
      </div>
      <ul class="flex flex-col">
        <li
          v-for="player in props.room.players"
          :key="player.id"
          class="flex items-center justify-between py-2.5 border-b border-base-200 last:border-0"
        >
          <span class="font-medium" :class="player.id === profile?.id ? 'text-primary' : ''">
            {{ player.name }}
            <span v-if="player.id === profile?.id" class="text-base-content/35 font-normal text-xs ml-1">(you)</span>
          </span>
          <span
            v-if="player.id === props.room.hostId"
            class="badge badge-sm bg-accent/15 text-accent border-0 font-medium"
          >host</span>
        </li>
      </ul>
    </div>

    <!-- Host controls -->
    <template v-if="isHost">
      <div class="w-full max-w-xs mb-6">
        <p class="text-base-content/40 text-xs uppercase tracking-widest text-center mb-3">
          Time per card
        </p>
        <div class="join w-full">
          <button
            v-for="t in timerOptions"
            :key="t"
            class="join-item btn flex-1"
            :class="selectedTimer === t ? 'btn-primary' : 'btn-ghost'"
            @click="selectedTimer = t"
          >
            {{ t }}s
          </button>
        </div>
      </div>

      <div class="w-full max-w-xs">
        <button
          class="btn btn-primary btn-lg w-full"
          :disabled="props.room.players.length < 1"
          @click="game.startGame(selectedTimer)"
        >
          Begin →
        </button>
      </div>
    </template>

    <!-- Non-host waiting -->
    <template v-else>
      <div class="flex flex-col items-center gap-3 mt-2 text-base-content/45">
        <span class="loading loading-dots loading-sm" />
        <p class="text-sm italic">Waiting for the host to begin…</p>
      </div>
    </template>

  </div>
</template>
