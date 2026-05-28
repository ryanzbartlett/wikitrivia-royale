<script setup lang="ts">
import { ref } from 'vue';
import CreateProfileForm from '@/components/CreateProfileForm.vue';
import Leaderboard from '@/components/Leaderboard.vue';
import { useProfile } from '@/composables/useProfile';
import { useRoom } from '@/composables/useRoom';

const { profile, unsetProfile } = useProfile();
const { createRoom, joinRoom } = useRoom();

const joinCode = ref('');
const joinError = ref('');

async function handleCreateGame() {
  await createRoom();
}

function handleJoinGame() {
  joinError.value = '';
  if (joinCode.value.trim().length !== 4) {
    joinError.value = 'Code must be 4 characters.';
    return;
  }
  joinRoom(joinCode.value.trim());
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center px-4">

    <!-- Hero -->
    <section class="text-center pt-16 pb-8">
      <p class="text-primary text-xs uppercase tracking-[0.3em] font-medium mb-4 opacity-80">
        The Chronology Game
      </p>
      <h1 class="font-display text-5xl sm:text-6xl font-bold mb-4 leading-tight">
        WikiTrivia Royale
      </h1>
      <p class="text-base-content/55 text-base max-w-xs mx-auto leading-relaxed">
        Place historical events in order.<br>Outlast your rivals.
      </p>
    </section>

    <!-- Ornamental divider -->
    <div class="flex items-center gap-3 w-full max-w-xs mb-8">
      <div class="flex-1 h-px bg-base-300" />
      <span class="text-base-content/25 text-sm">✦</span>
      <div class="flex-1 h-px bg-base-300" />
    </div>

    <!-- Action section -->
    <div class="w-full max-w-xs mb-14">

      <!-- No profile yet -->
      <CreateProfileForm v-if="!profile" />

      <!-- Has profile -->
      <template v-else>
        <div class="text-center mb-6">
          <p class="text-base-content/45 text-xs uppercase tracking-widest mb-1">Playing as</p>
          <p class="font-display text-2xl font-semibold">{{ profile.name }}</p>
        </div>

        <div class="flex flex-col gap-3">
          <button
            class="btn btn-primary btn-lg w-full"
            @click="handleCreateGame"
          >
            Create Game
          </button>

          <div class="divider text-xs text-base-content/35 my-0">or join with a code</div>

          <div class="flex gap-2">
            <input
              v-model="joinCode"
              class="input input-bordered flex-1 uppercase tracking-[0.2em] text-center font-mono"
              maxlength="4"
              placeholder="CODE"
              @keyup.enter="handleJoinGame"
            >
            <button
              class="btn btn-secondary"
              @click="handleJoinGame"
            >
              Join
            </button>
          </div>

          <p v-if="joinError" class="text-error text-sm text-center -mt-1">
            {{ joinError }}
          </p>

          <div class="text-center mt-1">
            <button
              class="btn btn-ghost btn-xs text-base-content/35 hover:text-base-content/60"
              @click="unsetProfile"
            >
              Change name
            </button>
          </div>
        </div>
      </template>
    </div>

    <!-- Leaderboard -->
    <div class="w-full max-w-sm pb-16">
      <Leaderboard />
    </div>

  </div>
</template>
