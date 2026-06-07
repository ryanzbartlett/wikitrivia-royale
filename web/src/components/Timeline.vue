<script setup lang="ts">
import { ref, onUnmounted, computed } from 'vue';
import { useEventListener } from '@vueuse/core';
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

// ── Drag-drop state ─────────────────────────────────────────────────────────
const timelineRef = ref<HTMLElement | null>(null);
const previewIndex = ref<number | null>(null);

function getAfterIndexFromClientX(clientX: number): number {
  const cardEls = timelineRef.value?.querySelectorAll<HTMLElement>('[data-timeline-card]') ?? [];
  if (cardEls.length === 0) return -1;
  for (let i = 0; i < cardEls.length; i++) {
    const el = cardEls[i];
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    if (clientX < rect.left + rect.width / 2) return i - 1;
  }
  return cardEls.length - 1;
}

// ── Flat item list for TransitionGroup ──────────────────────────────────────
// A single keyed array avoids <template v-for> key placement issues and gives
// TransitionGroup a clean flat list to FLIP-animate.
interface GhostItem { key: string; isGhost: true }
interface CardItem  { key: string; isGhost: false; card: Card; idx: number }
type TLItem = GhostItem | CardItem;

const timelineItems = computed((): TLItem[] => {
  const result: TLItem[] = [];
  if (previewIndex.value === -1) {
    result.push({ key: 'ghost', isGhost: true });
  }
  props.cards.forEach((card, i) => {
    result.push({ key: card.qid, isGhost: false, card, idx: i });
    if (previewIndex.value === i) {
      result.push({ key: 'ghost', isGhost: true });
    }
  });
  return result;
});

// ── Auto-scroll while dragging near edges ───────────────────────────────────
const SCROLL_ZONE = 64;
const SCROLL_SPEED = 8;
let scrollDir: -1 | 0 | 1 = 0;
let rafId: number | null = null;

function runScroll() {
  if (!timelineRef.value || scrollDir === 0) return;
  timelineRef.value.scrollLeft += scrollDir * SCROLL_SPEED;
  rafId = requestAnimationFrame(runScroll);
}

function checkAutoScroll(clientX: number) {
  if (!timelineRef.value) return;
  const { left, right } = timelineRef.value.getBoundingClientRect();
  const next: -1 | 0 | 1 =
    clientX < left  + SCROLL_ZONE ? -1 :
    clientX > right - SCROLL_ZONE ?  1 : 0;
  if (next === scrollDir) return;
  scrollDir = next;
  if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
  if (scrollDir !== 0) rafId = requestAnimationFrame(runScroll);
}

function stopAutoScroll() {
  scrollDir = 0;
  if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
}

onUnmounted(stopAutoScroll);

// ── Drop-zone event listeners ────────────────────────────────────────────────
let enterCount = 0;

useEventListener(timelineRef, 'dragenter', (e: DragEvent) => {
  e.preventDefault();
  if (props.disabled) return;
  enterCount++;
  previewIndex.value = getAfterIndexFromClientX(e.clientX);
});

useEventListener(timelineRef, 'dragover', (e: DragEvent) => {
  e.preventDefault();
  if (props.disabled) return;
  checkAutoScroll(e.clientX);
  previewIndex.value = getAfterIndexFromClientX(e.clientX);
});

useEventListener(timelineRef, 'dragleave', () => {
  enterCount--;
  if (enterCount <= 0) {
    enterCount = 0;
    stopAutoScroll();
    previewIndex.value = null;
  }
});

useEventListener(timelineRef, 'drop', (e: DragEvent) => {
  e.preventDefault();
  enterCount = 0;
  stopAutoScroll();
  if (props.disabled || previewIndex.value === null) return;
  const idx = previewIndex.value;
  previewIndex.value = null;
  emit('place', idx);
});
</script>

<template>
  <div ref="timelineRef" class="w-full overflow-x-auto pb-2 select-none flex">
    <TransitionGroup name="tl" tag="div" class="flex items-stretch gap-1 mx-auto">
      <div
        v-for="item in timelineItems"
        :key="item.key"
        :data-timeline-card="!item.isGhost ? '' : undefined"
        :class="item.isGhost
          ? 'tl-ghost w-24 shrink-0 pointer-events-none rounded border-2 border-dashed border-primary/50 bg-primary/8'
          : 'shrink-0 flex flex-col'"
      >
        <CardTile
          v-if="!item.isGhost"
          :card="item.card"
          :show-year="item.card.qid !== props.pendingCardQid"
          :variant="item.card.qid === props.pendingCardQid ? 'pending'
            : props.incorrectCardQids?.includes(item.card.qid) ? 'incorrect'
            : 'placed'"
          size="sm"
          class="flex-1"
        />
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
/* Surrounding cards slide to make/close room */
.tl-move {
  transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1);
}

/* Ghost scales in/out from its left edge */
.tl-ghost { transform-origin: left center; }
.tl-enter-active.tl-ghost {
  transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.15s ease;
}
.tl-leave-active.tl-ghost {
  transition: transform 0.15s ease-in, opacity 0.1s ease;
  position: absolute; /* out of flow so FLIP measures correctly */
}
.tl-enter-from.tl-ghost,
.tl-leave-to.tl-ghost {
  transform: scaleX(0);
  opacity: 0;
}
</style>
