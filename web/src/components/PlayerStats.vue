<script setup lang="ts">
import type { PublicPlayerStats } from '../../../shared/types.ts';

defineProps<{
  stats: PublicPlayerStats;
  isSelf?: boolean;
}>();
</script>

<template>
  <div
    class="flex items-center gap-2 p-2 rounded-lg text-sm"
    :class="[
      stats.eliminated ? 'opacity-40' : '',
      isSelf ? 'bg-base-200 font-semibold' : '',
    ]"
  >
    <span class="flex-1 truncate">{{ stats.playerName }}<span v-if="isSelf" class="opacity-50 ml-1">(you)</span></span>
    <span v-if="stats.heat >= 2" class="badge badge-warning badge-sm">×{{ stats.heat }}</span>
    <span class="text-xs font-bold w-8 text-right">{{ stats.score }}</span>
    <span class="flex gap-0.5">
      <span v-for="i in 3" :key="i" class="text-base" :class="i <= stats.lives ? 'text-error' : 'text-base-300'">♥</span>
    </span>
    <span v-if="stats.hasPlaced && !stats.eliminated" class="text-success text-xs">✓</span>
    <span v-if="stats.eliminated" class="text-xs opacity-50">out</span>
  </div>
</template>
