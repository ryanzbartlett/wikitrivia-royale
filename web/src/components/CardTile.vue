<script setup lang="ts">
import type { Card } from '../../../shared/types.ts';

const props = withDefaults(defineProps<{
  card: Card;
  showYear?: boolean;
  variant?: 'default' | 'correct' | 'incorrect' | 'placed' | 'pending';
  size?: 'sm' | 'md';
}>(), { showYear: false, variant: 'default', size: 'md' });

const borderClass: Record<string, string> = {
  default: 'border-base-300',
  correct: 'border-success',
  incorrect: 'border-error',
  placed: 'border-base-300 opacity-70',
  pending: 'border-primary opacity-80',
};
</script>

<template>
  <div
    class="card border-2 bg-base-100 overflow-hidden"
    :class="[borderClass[props.variant], props.size === 'sm' ? 'w-28' : 'w-40']"
  >
    <figure v-if="props.card.image" class="h-20 bg-base-200">
      <img
        :src="`https://upload.wikimedia.org/wikipedia/commons/thumb/${props.card.image.charAt(0)}/${props.card.image.charAt(0)}${props.card.image.charAt(1)}/${props.card.image}/160px-${props.card.image}`"
        :alt="props.card.title"
        class="h-full w-full object-cover"
        @error="($event.target as HTMLImageElement).style.display='none'"
      />
    </figure>
    <div class="card-body p-2 gap-0.5">
      <p class="text-xs font-semibold leading-tight">{{ props.card.title }}</p>
      <p class="text-xs opacity-60 leading-tight">{{ props.card.subtitle }}</p>
      <p class="text-sm font-bold mt-1" :class="props.showYear ? '' : 'opacity-40'">
        {{ props.showYear ? props.card.year : '????' }}
      </p>
    </div>
  </div>
</template>
