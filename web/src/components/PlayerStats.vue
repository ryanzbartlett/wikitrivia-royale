<script setup lang="ts">
import type { PublicPlayerStats } from '../../../shared/types.ts';

defineProps<{
  stats: PublicPlayerStats;
  isSelf?: boolean;
}>();
</script>

<template>
  <div
    class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-opacity"
    :class="[
      stats.eliminated ? 'opacity-35' : '',
      isSelf ? 'bg-primary/10 ring-1 ring-primary/20' : 'bg-base-200',
    ]"
  >
    <!-- Name -->
    <span class="font-medium truncate max-w-[72px]" :class="isSelf ? 'text-primary' : ''">
      {{ stats.playerName }}
    </span>

    <!-- Heat multiplier -->
    <span v-if="stats.heat >= 2" class="text-accent font-bold shrink-0">×{{ stats.heat }}</span>

    <!-- Score -->
    <span class="font-bold shrink-0" :class="isSelf ? 'text-primary' : ''">{{ stats.score }}</span>

    <!-- Lives -->
    <span class="flex shrink-0">
      <span
        v-for="i in 3"
        :key="i"
        :class="i <= stats.lives ? 'text-error' : 'text-base-300'"
      >♥</span>
    </span>

    <!-- Status -->
    <span v-if="stats.hasPlaced && !stats.eliminated" class="text-success shrink-0">✓</span>
    <span v-if="stats.eliminated" class="text-base-content/40 shrink-0 italic">out</span>
  </div>
</template>
