<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface LeaderboardEntry {
  profile_id: string;
  profile_name: string;
  best_score: number;
  games_played: number;
}

const entries = ref<LeaderboardEntry[]>([]);

onMounted(async () => {
  try {
    const res = await fetch('/api/leaderboard?limit=10');
    if (res.ok) entries.value = await res.json() as LeaderboardEntry[];
  } catch { /* silently ignore */ }
});
</script>

<template>
  <div v-if="entries.length > 0" class="flex flex-col gap-4">
    <!-- Section heading -->
    <div class="flex items-center gap-3">
      <div class="flex-1 h-px bg-base-300" />
      <h2 class="font-display text-base font-semibold text-base-content/50 shrink-0">
        Hall of Fame
      </h2>
      <div class="flex-1 h-px bg-base-300" />
    </div>

    <!-- Table -->
    <table class="table table-sm">
      <thead>
        <tr class="text-base-content/40 text-xs uppercase tracking-wider border-b border-base-300">
          <th class="font-normal w-6">#</th>
          <th class="font-normal">Player</th>
          <th class="font-normal text-right">Best</th>
          <th class="font-normal text-right">Games</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(entry, i) in entries"
          :key="entry.profile_id"
          class="border-b border-base-200 last:border-0"
        >
          <td class="text-base-content/35 text-xs font-mono">{{ i + 1 }}</td>
          <td class="font-medium">{{ entry.profile_name }}</td>
          <td class="text-right font-bold text-primary">{{ entry.best_score }}</td>
          <td class="text-right text-base-content/40 text-xs">{{ entry.games_played }}×</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
