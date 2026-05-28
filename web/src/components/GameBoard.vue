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
</script>

<template>
  <div class="flex flex-col gap-4 h-full">
    <!-- Header bar -->
    <div class="flex items-center justify-between">
      <span class="text-xs opacity-50">Card {{ (game.currentCard ? game.allPlayerStats[0]?.hasPlaced : false) ? '' : '' }}
        {{ game.currentCard ? game.allPlayerStats.filter(p => p.hasPlaced && !p.eliminated).length : 0 }}/{{ game.allPlayerStats.filter(p => !p.eliminated).length }} placed</span>
      <div
        class="badge text-lg font-bold px-4 py-3"
        :class="game.timeLeft <= 5 ? 'badge-error' : 'badge-neutral'"
      >
        {{ game.timeLeft }}s
      </div>
      <div class="flex gap-2 items-center">
        <span class="text-xs opacity-50">Score</span>
        <span class="font-bold text-lg">{{ game.myScore }}</span>
        <span v-if="game.myHeat >= 2" class="badge badge-warning">×{{ game.myHeat }}</span>
      </div>
    </div>

    <div class="flex gap-4 flex-1 min-h-0">
      <!-- Main play area -->
      <div class="flex-1 flex flex-col gap-4">
        <!-- Current card -->
        <div class="flex justify-center">
          <div class="flex flex-col items-center gap-2">
            <p class="text-xs uppercase tracking-widest opacity-50">
              {{ isPlacing ? 'Where does this go?' : 'Answer revealed' }}
            </p>
            <CardTile
              v-if="game.currentCard"
              :card="game.currentCard"
              :show-year="isResults"
              :variant="currentCardVariant"
              size="md"
            />
          </div>
        </div>

        <!-- Result feedback -->
        <div v-if="isResults && myResult" class="text-center">
          <p v-if="myResult.correct" class="text-success font-bold">
            Correct! +{{ myResult.scoreDelta }} point{{ myResult.scoreDelta !== 1 ? 's' : '' }}
            <span v-if="myResult.newHeat >= 2"> (×{{ myResult.newHeat }} heat)</span>
          </p>
          <p v-else-if="myResult.timedOut" class="text-warning font-bold">Time's up! -1 life</p>
          <p v-else class="text-error font-bold">Incorrect! -1 life</p>
        </div>

        <!-- Timeline -->
        <div class="flex flex-col gap-1">
          <p class="text-xs uppercase tracking-widest opacity-50">Your timeline</p>
          <Timeline
            :cards="game.myTimeline"
            :disabled="!isPlacing || game.myHasPlaced"
            :incorrect-card-qids="game.myIncorrectCardQids"
            :pending-card-qid="game.myPendingCardQid"
            @place="game.placeCard"
          />
        </div>

        <!-- Lives -->
        <div class="flex gap-1">
          <span
            v-for="i in 3"
            :key="i"
            class="text-2xl"
            :class="i <= game.myLives ? 'text-error' : 'text-base-300'"
          >♥</span>
        </div>
      </div>

      <!-- Player sidebar -->
      <div class="w-44 flex flex-col gap-1">
        <p class="text-xs uppercase tracking-widest opacity-50 mb-1">Players</p>
        <PlayerStats
          v-for="stats in game.allPlayerStats"
          :key="stats.playerId"
          :stats="stats"
          :is-self="stats.playerId === (profile?.id ?? '')"
        />
      </div>
    </div>
  </div>
</template>
