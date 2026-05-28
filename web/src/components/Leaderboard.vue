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
  <div v-if="entries.length > 0" class="card bg-base-200">
    <div class="card-body">
      <h2 class="card-title">Leaderboard</h2>
      <table class="table table-sm">
        <thead>
          <tr>
            <th>#</th>
            <th>Player</th>
            <th class="text-right">Best score</th>
            <th class="text-right">Games</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(entry, i) in entries" :key="entry.profile_id">
            <td>{{ i + 1 }}</td>
            <td>{{ entry.profile_name }}</td>
            <td class="text-right font-bold">{{ entry.best_score }}</td>
            <td class="text-right opacity-60">{{ entry.games_played }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
