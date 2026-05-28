<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '@/stores/game';
import { useRoom } from '@/composables/useRoom';

const game = useGameStore();
const { disconnect } = useRoom();
const router = useRouter();

const ranked = computed(() =>
    [...game.allPlayerStats].sort((a, b) => b.score - a.score),
);

function leave() {
    disconnect();
    router.push('/');
}
</script>

<template>
  <div class="flex flex-col gap-6 items-center">
    <h2 class="text-3xl font-bold">Game Over</h2>

    <div class="card bg-base-200 w-full max-w-md">
      <div class="card-body">
        <h3 class="card-title">Final Scores</h3>
        <table class="table table-sm">
          <thead>
            <tr>
              <th>#</th>
              <th>Player</th>
              <th class="text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(p, i) in ranked" :key="p.playerId">
              <td>{{ i + 1 }}</td>
              <td>{{ p.playerName }}</td>
              <td class="text-right font-bold">{{ p.score }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <button class="btn btn-primary" @click="leave">Leave</button>
  </div>
</template>
