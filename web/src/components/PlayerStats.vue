<script setup lang="ts">
import { computed } from 'vue';
import type { PublicPlayerStats } from '../../../shared/types.ts';

const props = defineProps<{
  stats: PublicPlayerStats;
  isSelf?: boolean;
  history?: { year: number; result: 'correct' | 'incorrect' }[];
}>();

// Sort by year so dots mirror the chronological timeline order
const sortedHistory = computed(() =>
  props.history ? [...props.history].sort((a, b) => a.year - b.year) : [],
);
</script>

<template>
  <div
    class="flex flex-col px-2.5 py-1.5 rounded-lg text-xs transition-opacity"
    :class="[
      stats.eliminated ? 'opacity-35' : '',
      isSelf ? 'bg-primary/10 ring-1 ring-primary/20' : 'bg-base-200',
    ]"
  >
    <!-- Name + stats row -->
    <div class="flex items-center gap-1.5">
      <span class="font-medium truncate max-w-[72px]" :class="isSelf ? 'text-primary' : ''">
        {{ stats.playerName }}
      </span>
      <span v-if="stats.heat >= 2" class="text-accent font-bold shrink-0">×{{ stats.heat }}</span>
      <span class="font-bold shrink-0" :class="isSelf ? 'text-primary' : ''">{{ stats.score }}</span>
      <span class="flex shrink-0">
        <span v-for="i in 3" :key="i" :class="i <= stats.lives ? 'text-error' : 'text-base-300'">♥</span>
      </span>
      <span v-if="stats.hasPlaced && !stats.eliminated" class="text-success shrink-0">✓</span>
      <span v-if="stats.eliminated" class="text-base-content/40 shrink-0 italic">out</span>
    </div>

    <!-- Timeline dots — sorted chronologically to mirror the actual timeline -->
    <div v-if="sortedHistory.length > 0" class="flex flex-wrap gap-0.5 mt-1.5">
      <span
        v-for="(entry, i) in sortedHistory"
        :key="i"
        class="w-2 h-2 rounded-full shrink-0"
        :class="entry.result === 'correct' ? 'bg-success' : 'bg-error'"
      />
    </div>
  </div>
</template>
