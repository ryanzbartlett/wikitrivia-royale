<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '@/stores/game';
import { useRoom } from '@/composables/useRoom';
import { useProfile } from '@/composables/useProfile';

const game = useGameStore();
const { disconnect } = useRoom();
const { profile } = useProfile();
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
  <div class="min-h-screen flex flex-col items-center px-4">

    <!-- Heading -->
    <section class="text-center pt-14 pb-8">
      <p class="text-primary text-xs uppercase tracking-[0.3em] font-medium opacity-80 mb-3">
        Game complete
      </p>
      <h1 class="font-display text-4xl font-bold mb-1">Final Scores</h1>
    </section>

    <!-- Scores -->
    <div class="w-full max-w-xs mb-8">

      <!-- Winner callout -->
      <div
        v-if="ranked[0]"
        class="bg-accent/10 border border-accent/25 rounded-box px-5 py-4 text-center mb-4"
      >
        <p class="text-accent/70 text-xs uppercase tracking-widest mb-1">Winner</p>
        <p class="font-display text-2xl font-bold">{{ ranked[0].playerName }}</p>
        <p class="text-primary font-bold text-lg mt-0.5">{{ ranked[0].score }} pts</p>
      </div>

      <!-- Full table -->
      <div v-if="ranked.length > 1">
        <div class="flex items-center gap-3 mb-3">
          <div class="flex-1 h-px bg-base-300" />
          <p class="text-base-content/40 text-xs uppercase tracking-widest shrink-0">All players</p>
          <div class="flex-1 h-px bg-base-300" />
        </div>
        <table class="table table-sm w-full">
          <tbody>
            <tr
              v-for="(p, i) in ranked"
              :key="p.playerId"
              class="border-b border-base-200 last:border-0"
              :class="p.playerId === profile?.id ? 'text-primary font-semibold' : ''"
            >
              <td class="text-base-content/35 text-xs font-mono w-6">{{ i + 1 }}</td>
              <td>
                {{ p.playerName }}
                <span v-if="p.playerId === profile?.id" class="text-base-content/35 font-normal text-xs ml-1">(you)</span>
              </td>
              <td class="text-right font-bold">{{ p.score }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Leave -->
    <button class="btn btn-primary btn-lg w-full max-w-xs" @click="leave">
      Back to Home
    </button>

  </div>
</template>
