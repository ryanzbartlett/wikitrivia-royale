<script setup lang="ts">
import type { Card } from '../../../shared/types.ts';
import CardTile from './CardTile.vue';

const props = defineProps<{
  cards: Card[];
  disabled?: boolean;
  incorrectCardQids?: string[];
  pendingCardQid?: string | null;
}>();

const emit = defineEmits<{
  place: [afterIndex: number];
}>();
</script>

<template>
  <div class="flex items-stretch gap-0.5 overflow-x-auto pb-2 select-none">

    <!-- Drop zone before first card -->
    <button
      v-if="!props.disabled"
      class="group flex items-center justify-center w-7 shrink-0 rounded border-2 border-dashed border-base-300 hover:border-primary hover:bg-primary/5 transition-colors"
      @click="emit('place', -1)"
    >
      <span class="text-base-content/30 group-hover:text-primary text-xs transition-colors">+</span>
    </button>
    <div v-else class="w-1 shrink-0" />

    <template v-for="(card, i) in props.cards" :key="card.qid">
      <CardTile
        :card="card"
        :show-year="card.qid !== props.pendingCardQid"
        :variant="card.qid === props.pendingCardQid ? 'pending'
          : props.incorrectCardQids?.includes(card.qid) ? 'incorrect'
          : 'placed'"
        size="sm"
      />

      <!-- Drop zone after card i -->
      <button
        v-if="!props.disabled"
        class="group flex items-center justify-center w-7 shrink-0 rounded border-2 border-dashed border-base-300 hover:border-primary hover:bg-primary/5 transition-colors"
        @click="emit('place', i)"
      >
        <span class="text-base-content/30 group-hover:text-primary text-xs transition-colors">+</span>
      </button>
      <div v-else class="w-1 shrink-0" />
    </template>
  </div>
</template>
