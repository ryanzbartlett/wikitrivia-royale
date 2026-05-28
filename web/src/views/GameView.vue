<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProfile } from '@/composables/useProfile';
import { useRoom } from '@/composables/useRoom';
import { useGameStore } from '@/stores/game';
import CreateProfileForm from '@/components/CreateProfileForm.vue';
import LobbyPanel from '@/components/LobbyPanel.vue';
import GameBoard from '@/components/GameBoard.vue';
import EndGame from '@/components/EndGame.vue';

const route = useRoute();
const router = useRouter();
const code = (route.params.id as string).toUpperCase();

const { profile } = useProfile();
const { room, error, connect, disconnect } = useRoom();
const game = useGameStore();

onMounted(() => {
  if (profile.value) connect(code);
});

watch(profile, (p) => {
  if (p && !room.value) connect(code);
});

onUnmounted(() => disconnect());

function leaveGame() {
  disconnect();
  router.push('/');
}
</script>

<template>
  <div class="min-h-screen flex flex-col">

    <!-- Slim top bar — shown outside the game board so it doesn't eat play space -->
    <header
      v-if="game.gamePhase !== 'placing' && game.gamePhase !== 'results'"
      class="flex items-center justify-between px-4 py-3 border-b border-base-200"
    >
      <button
        class="btn btn-ghost btn-sm text-base-content/50 hover:text-base-content/80 gap-1 -ml-2"
        @click="leaveGame"
      >
        ← Home
      </button>
      <span class="font-display text-base font-semibold text-base-content/60">
        WikiTrivia Royale
      </span>
      <!-- spacer to balance the back button -->
      <div class="w-16" />
    </header>

    <!-- Content -->
    <div class="flex-1">

      <!-- No profile -->
      <template v-if="!profile">
        <div class="flex flex-col items-center px-4 pt-14 gap-6">
          <div class="text-center">
            <p class="font-display text-2xl font-semibold mb-1">Join the game</p>
            <p class="text-base-content/50 text-sm">Create a profile to take your seat.</p>
          </div>
          <div class="w-full max-w-xs">
            <CreateProfileForm />
          </div>
        </div>
      </template>

      <!-- Connection error -->
      <div v-else-if="error" class="flex items-center justify-center h-40">
        <p class="text-error text-sm">{{ error }}</p>
      </div>

      <!-- Room connected -->
      <template v-else-if="room">
        <LobbyPanel v-if="game.gamePhase === 'lobby'" :room="room" />
        <GameBoard v-else-if="game.gamePhase === 'placing' || game.gamePhase === 'results'" />
        <EndGame v-else-if="game.gamePhase === 'ended'" />
      </template>

      <!-- Connecting -->
      <div v-else class="flex items-center justify-center h-40">
        <span class="loading loading-dots loading-md text-primary" />
      </div>

    </div>
  </div>
</template>
