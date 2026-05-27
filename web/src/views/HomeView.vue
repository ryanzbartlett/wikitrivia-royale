<script setup lang="ts">
import CreateProfileForm from '@/components/CreateProfileForm.vue';
import { useProfile } from '@/composables/useProfile';

const {
  profile,
  unsetProfile,
} = useProfile();

function createGame() {}
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
    <div v-else>
      <pre>{{ profile.name }}</pre>
      <button
        class="btn btn-error"
        @click="unsetProfile"
      >
        Reset Profile
      </button>
      <button
        class="btn btn-primary"
        @click="createGame"
      >
        Create Game
      </button>
    </div>
  </div>
</template>
