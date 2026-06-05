<script setup lang="ts">
import { ref } from 'vue';
import type { Card } from '../../../shared/types.ts';
import CardTile from './CardTile.vue';

const props = defineProps<{
  cards: Card[];
  disabled?: boolean;
  incorrectCardQids?: string[];
  pendingCardQid?: string | null;
  isDragging?: boolean;
}>();

const emit = defineEmits<{
  place: [afterIndex: number];
}>();

// null = no zone active; number = afterIndex of the active zone
const dragOverIndex = ref<number | null>(null);

function onDragEnter(afterIndex: number) {
  if (props.disabled) return;
  dragOverIndex.value = afterIndex;
}

function onDragLeave() {
  dragOverIndex.value = null;
}

function onDrop(afterIndex: number) {
  dragOverIndex.value = null;
  if (!props.disabled) {
    emit('place', afterIndex);
  }
}
</script>

<template>
  <div class="flex items-stretch gap-0.5 overflow-x-auto pb-2 select-none">

    <!-- Drop zone before first card -->
    <button
      v-if="!props.disabled"
      class="group shrink-0 rounded border-2 border-dashed transition-all duration-150 flex flex-col overflow-hidden"
      :class="dragOverIndex === -1
        ? 'w-24 border-primary bg-primary/10'
        : 'w-7 border-base-300 hover:border-primary hover:bg-primary/5 items-center justify-center'"
      @click="emit('place', -1)"
      @dragenter.prevent="onDragEnter(-1)"
      @dragover.prevent="onDragEnter(-1)"
      @dragleave="onDragLeave"
      @drop.prevent="onDrop(-1)"
    >
      <!-- Ghost card interior when drag-active -->
      <template v-if="dragOverIndex === -1">
        <div class="pointer-events-none h-14 w-full bg-primary/10 flex items-center justify-center">
          <svg class="w-5 h-5 text-primary/50" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
        </div>
        <div class="pointer-events-none flex-1 flex items-center justify-center p-1">
          <span class="text-[10px] text-primary/60 font-semibold leading-tight text-center">Drop here</span>
        </div>
      </template>
      <!-- Slim strip when idle -->
      <template v-else>
        <span class="pointer-events-none text-base-content/30 group-hover:text-primary text-xs transition-colors">+</span>
      </template>
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
        class="group shrink-0 rounded border-2 border-dashed transition-all duration-150 flex flex-col overflow-hidden"
        :class="dragOverIndex === i
          ? 'w-24 border-primary bg-primary/10'
          : 'w-7 border-base-300 hover:border-primary hover:bg-primary/5 items-center justify-center'"
        @click="emit('place', i)"
        @dragenter.prevent="onDragEnter(i)"
        @dragover.prevent="onDragEnter(i)"
        @dragleave="onDragLeave"
        @drop.prevent="onDrop(i)"
      >
        <!-- Ghost card interior when drag-active -->
        <template v-if="dragOverIndex === i">
          <div class="pointer-events-none h-14 w-full bg-primary/10 flex items-center justify-center">
            <svg class="w-5 h-5 text-primary/50" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          </div>
          <div class="pointer-events-none flex-1 flex items-center justify-center p-1">
            <span class="text-[10px] text-primary/60 font-semibold leading-tight text-center">Drop here</span>
          </div>
        </template>
        <!-- Slim strip when idle -->
        <template v-else>
          <span class="pointer-events-none text-base-content/30 group-hover:text-primary text-xs transition-colors">+</span>
        </template>
      </button>
      <div v-else class="w-1 shrink-0" />
    </template>
  </div>
</template>
