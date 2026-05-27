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
  <div class="create-profile-form">
    <form @submit.prevent="saveProfile">
      <p>Create your player profile.</p>
      <fieldset class="fieldset">
        <legend class="fieldset-legend">
          Name
        </legend>
        <input
          v-model="username"
          type="text"
          class="input"
        >
        <button
          type="button"
          @click="rerollName"
        >
          Roll
        </button>
      </fieldset>
      <button
        type="submit"
        class="btn"
      >
        Save
      </button>
    </form>
  </div>
</template>
