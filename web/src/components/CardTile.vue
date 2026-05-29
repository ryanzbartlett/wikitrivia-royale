<script setup lang="ts">
import type { Card } from '../../../shared/types.ts';

const props = withDefaults(defineProps<{
  card: Card;
  showYear?: boolean;
  variant?: 'default' | 'correct' | 'incorrect' | 'placed' | 'pending';
  size?: 'sm' | 'md' | 'lg';
}>(), { showYear: false, variant: 'default', size: 'md' });

const borderClass: Record<string, string> = {
  default:   'border-base-300',
  correct:   'border-success',
  incorrect: 'border-error',
  placed:    'border-base-200 opacity-80',
  pending:   'border-primary',
};

const sizeClass: Record<string, string> = {
  sm: 'w-24',
  md: 'w-40',
  lg: 'w-52',
};

const imageHeightClass: Record<string, string> = {
  sm: 'h-14',
  md: 'h-24',
  lg: 'h-36',
};
</script>

<template>
  <div
    class="flex flex-col border-2 bg-base-100 rounded-lg overflow-hidden shrink-0"
    :class="[borderClass[props.variant], sizeClass[props.size]]"
  >
    <!-- Image -->
    <div :class="[imageHeightClass[props.size], 'bg-base-200 overflow-hidden']">
      <img
        v-if="props.card.image"
        :src="`https://upload.wikimedia.org/wikipedia/commons/thumb/${props.card.imageHash}/${props.card.image}/250px-${props.card.image}`"
        :alt="props.card.title"
        class="h-full w-full object-cover"
        @error="($event.target as HTMLImageElement).style.display='none'"
      />
    </div>

    <!-- Text body -->
    <div class="p-2 flex flex-col gap-0.5 flex-1">
      <p
        class="font-semibold leading-tight"
        :class="props.size === 'lg' ? 'text-sm' : 'text-xs'"
      >{{ props.card.title }}</p>
      <p
        class="text-base-content/55 leading-tight"
        :class="props.size === 'lg' ? 'text-xs' : 'text-[10px]'"
      >{{ props.card.subtitle }}</p>
      <p
        class="mt-auto pt-1.5 font-bold"
        :class="[
          props.size === 'lg' ? 'text-base' : 'text-xs',
          props.showYear ? 'text-base-content' : 'text-base-content/30 italic',
        ]"
      >{{ props.showYear ? props.card.year : '????' }}</p>
    </div>
  </div>
</template>
