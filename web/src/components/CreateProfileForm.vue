<script setup lang="ts">
import { generateName } from '@/utils/nameGen';
import { nanoid } from 'nanoid';
import { ref } from 'vue';
import { useProfile } from '@/composables/useProfile';

const username = ref(generateName());

function saveProfile() {
  useProfile().setProfile({
    id: nanoid(),
    name: username.value,
  });
}

function rerollName() {
  username.value = generateName();
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="text-center">
      <p class="text-base-content/45 text-xs uppercase tracking-widest mb-1">Choose your name</p>
    </div>
    <form class="flex flex-col gap-3" @submit.prevent="saveProfile">
      <div class="flex gap-2">
        <input
          v-model="username"
          type="text"
          class="input input-bordered flex-1"
          placeholder="Your name"
        >
        <button
          type="button"
          class="btn btn-ghost btn-square text-lg"
          title="Reroll name"
          @click="rerollName"
        >
          ↻
        </button>
      </div>
      <button type="submit" class="btn btn-primary w-full">
        Start Playing
      </button>
    </form>
  </div>
</template>
