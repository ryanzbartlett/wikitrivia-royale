<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useProfile } from '@/composables/useProfile';
import { useRoom } from '@/composables/useRoom';
import { useGameStore } from '@/stores/game';
import CreateProfileForm from '@/components/CreateProfileForm.vue';
import LobbyPanel from '@/components/LobbyPanel.vue';
import GameBoard from '@/components/GameBoard.vue';
import EndGame from '@/components/EndGame.vue';

const route = useRoute();
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
</script>

<template>
  <div class="flex flex-col gap-6 p-4">
    <template v-if="!profile">
      <p class="text-center opacity-60">Create a profile to join the game.</p>
      <div class="card bg-base-200">
        <div class="card-body">
          <CreateProfileForm />
        </div>
      </div>
    </template>

    <p v-else-if="error" class="text-error">{{ error }}</p>

    <template v-else-if="room">
      <LobbyPanel v-if="game.gamePhase === 'lobby'" :room="room" />
      <GameBoard v-else-if="game.gamePhase === 'placing' || game.gamePhase === 'results'" />
      <EndGame v-else-if="game.gamePhase === 'ended'" />
    </template>

    <div v-else class="loading loading-spinner mx-auto" />
  </div>
</template>
