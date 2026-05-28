<script setup lang="ts">
import { ref } from 'vue';
import CreateProfileForm from '@/components/CreateProfileForm.vue';
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
  <div>
    <div
      v-if="!profile"
      class="card bg-black"
    >
      <div class="card-body">
        <CreateProfileForm />
      </div>
    </div>
    <div
      v-else
      class="flex flex-col gap-4"
    >
      <pre>{{ profile.name }}</pre>
      <button
        class="btn btn-primary"
        @click="handleCreateGame"
      >
        Create Game
      </button>
      <div class="flex flex-col gap-2">
        <div class="flex gap-2">
          <input
            v-model="joinCode"
            class="input input-bordered uppercase"
            maxlength="4"
            placeholder="Room code"
            @keyup.enter="handleJoinGame"
          >
          <button
            class="btn btn-secondary"
            @click="handleJoinGame"
          >
            Join Game
          </button>
        </div>
        <p
          v-if="joinError"
          class="text-error text-sm"
        >
          {{ joinError }}
        </p>
      </div>
      <button
        class="btn btn-error btn-sm"
        @click="unsetProfile"
      >
        Reset Profile
      </button>
    </div>
  </div>
</template>
