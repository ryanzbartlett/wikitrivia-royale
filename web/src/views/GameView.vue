<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import CreateProfileForm from '@/components/CreateProfileForm.vue';
import { useProfile } from '@/composables/useProfile';
import { useRoom } from '@/composables/useRoom';

const route = useRoute();
const code = (route.params.id as string).toUpperCase();

const { profile } = useProfile();
const { room, error, connect, disconnect } = useRoom();

onMounted(() => {
  if (profile.value) connect(code);
});

watch(profile, (p) => {
  if (p && !room.value) connect(code);
});

onUnmounted(() => disconnect());
</script>

<template>
  <div class="flex flex-col gap-6">
    <template v-if="!profile">
      <p class="text-center opacity-60">
        Create a profile to join the game.
      </p>
      <div class="card bg-base-200">
        <div class="card-body">
          <CreateProfileForm />
        </div>
      </div>
    </template>

    <p v-else-if="error" class="text-error">{{ error }}</p>

    <template v-else-if="room">
      <div class="text-center">
        <p class="text-sm uppercase tracking-widest opacity-60">Room code</p>
        <p class="text-5xl font-bold tracking-widest">{{ room.code }}</p>
      </div>
      <div class="card bg-base-200">
        <div class="card-body">
          <h2 class="card-title">Players ({{ room.players.length }})</h2>
          <ul class="flex flex-col gap-1">
            <li
              v-for="player in room.players"
              :key="player.id"
              class="flex items-center gap-2"
            >
              <span>{{ player.name }}</span>
              <span
                v-if="player.id === room.hostId"
                class="badge badge-primary badge-sm"
              >host</span>
            </li>
          </ul>
        </div>
      </div>
    </template>

    <div v-else class="loading loading-spinner" />
  </div>
</template>
