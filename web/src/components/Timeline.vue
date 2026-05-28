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
  <div class="flex items-center gap-1 overflow-x-auto pb-2">
    <!-- Gap before first card: afterIndex = -1 -->
    <button
      v-if="!props.disabled"
      class="btn btn-xs btn-ghost min-w-6 h-12 border-dashed border-2 border-base-300 hover:border-primary"
      @click="emit('place', -1)"
    >+</button>
    <div v-else class="w-2" />

    <template v-for="(card, i) in props.cards" :key="card.qid">
      <CardTile
        :card="card"
        :show-year="card.qid !== props.pendingCardQid"
        :variant="card.qid === props.pendingCardQid ? 'pending'
          : props.incorrectCardQids?.includes(card.qid) ? 'incorrect'
          : 'placed'"
        size="sm"
      />

      <!-- Gap after card i: afterIndex = i -->
      <button
        v-if="!props.disabled"
        class="btn btn-xs btn-ghost min-w-6 h-12 border-dashed border-2 border-base-300 hover:border-primary"
        @click="emit('place', i)"
      >+</button>
      <div v-else class="w-2" />
    </template>
  </div>
</template>
