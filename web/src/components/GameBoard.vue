<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '@/stores/game';
import { useProfile } from '@/composables/useProfile';
import CardTile from './CardTile.vue';
import Timeline from './Timeline.vue';
import PlayerStats from './PlayerStats.vue';

const game = useGameStore();
const { profile } = useProfile();

const isPlacing = computed(() => game.gamePhase === 'placing');
const isResults = computed(() => game.gamePhase === 'results');

const myResult = computed(() =>
    game.roundResults?.find(r => r.playerId === game.myPlayerId) ?? null,
);

const currentCardVariant = computed(() => {
    if (!isResults.value || !myResult.value) return 'default';
    return myResult.value.correct ? 'correct' : 'incorrect';
});

const activePlayers = computed(() => game.allPlayerStats.filter(p => !p.eliminated));
const placedCount   = computed(() => activePlayers.value.filter(p => p.hasPlaced).length);
</script>

<template>
  <div class="flex flex-col h-full">

    <!-- ── Top bar ─────────────────────────────────── -->
    <div class="shrink-0 flex items-center justify-between px-4 py-2 bg-base-200 border-b border-base-300">

      <!-- Lives + score + heat -->
      <div class="flex items-center gap-2">
        <div class="flex">
          <span
            v-for="i in 3"
            :key="i"
            class="text-base leading-none"
            :class="i <= game.myLives ? 'text-error' : 'text-base-300'"
          >♥</span>
        </div>
        <span class="font-bold text-sm">{{ game.myScore }}</span>
        <span v-if="game.myHeat >= 2" class="badge badge-xs bg-accent/20 text-accent border-0 font-bold">
          ×{{ game.myHeat }}
        </span>
      </div>

      <!-- Timer -->
      <div
        class="font-display text-2xl font-bold tabular-nums leading-none transition-colors"
        :class="game.timeLeft <= 5 ? 'text-error animate-pulse' : 'text-base-content'"
      >
        {{ game.timeLeft }}<span class="text-sm font-sans font-normal text-base-content/40 ml-0.5">s</span>
      </div>

      <!-- Placed count -->
      <div class="text-xs text-base-content/45 text-right">
        {{ placedCount }}/{{ activePlayers.length }}<br>
        <span class="text-base-content/30">placed</span>
      </div>
    </div>

    <!-- ── Main scroll area ───────────────────────── -->
    <div class="flex-1 overflow-y-auto flex flex-col items-center px-4 py-5 gap-4">

      <!-- Current card -->
      <div class="flex flex-col items-center gap-2">
        <p class="text-xs uppercase tracking-[0.2em] text-base-content/40">
          {{ isPlacing ? 'Where does this go?' : 'Answer revealed' }}
        </p>
        <CardTile
          v-if="game.currentCard"
          :card="game.currentCard"
          :show-year="isResults"
          :variant="currentCardVariant"
          size="lg"
        />
      </div>

      <!-- Result feedback banner -->
      <div
        v-if="isResults && myResult"
        class="w-full max-w-sm rounded-lg px-4 py-2.5 text-sm font-semibold text-center"
        :class="myResult.correct
          ? 'bg-success/15 text-success'
          : myResult.timedOut
            ? 'bg-warning/15 text-warning'
            : 'bg-error/15 text-error'"
      >
        <template v-if="myResult.correct">
          ✓ Correct! +{{ myResult.scoreDelta }} point{{ myResult.scoreDelta !== 1 ? 's' : '' }}
          <span v-if="myResult.newHeat >= 2" class="opacity-75 font-normal"> · ×{{ myResult.newHeat }} streak</span>
        </template>
        <template v-else-if="myResult.timedOut">⏱ Time's up! −1 life</template>
        <template v-else>✗ Incorrect! −1 life</template>
      </div>

      <!-- Timeline -->
      <div class="w-full">
        <p class="text-xs uppercase tracking-[0.2em] text-base-content/40 mb-2">Your timeline</p>
        <Timeline
          :cards="game.myTimeline"
          :disabled="!isPlacing || game.myHasPlaced"
          :incorrect-card-qids="game.myIncorrectCardQids"
          :pending-card-qid="game.myPendingCardQid"
          @place="game.placeCard"
        />
      </div>
    </div>

    <!-- ── Player strip ───────────────────────────── -->
    <div class="shrink-0 flex flex-wrap gap-1.5 px-4 py-2.5 border-t border-base-200 bg-base-100">
      <PlayerStats
        v-for="stats in game.allPlayerStats"
        :key="stats.playerId"
        :stats="stats"
        :is-self="stats.playerId === (profile?.id ?? '')"
      />
    </div>

  </div>
</template>
