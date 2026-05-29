import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { Card, PublicPlayerStats, RoundResult, ServerMessage, ClientMessage } from '../../../shared/types.ts';

let countdownInterval: ReturnType<typeof setInterval> | null = null;
let sendFn: ((msg: ClientMessage) => void) | null = null;

export const useGameStore = defineStore('game', () => {
    const gamePhase = ref<'lobby' | 'placing' | 'results' | 'ended'>('lobby');
    const currentCard = ref<Card | null>(null);
    const myTimeline = ref<Card[]>([]);
    const myLives = ref(3);
    const myScore = ref(0);
    const myHeat = ref(0);
    const myHasPlaced = ref(false);
    const allPlayerStats = ref<PublicPlayerStats[]>([]);
    const roundResults = ref<RoundResult[] | null>(null);
    const timerSeconds = ref(30);
    const timeLeft = ref(0);
    const myIncorrectCardQids = ref<string[]>([]);
    const myPendingCardQid = ref<string | null>(null);
    const myEliminated = ref(false);

    function setSendFn(fn: (msg: ClientMessage) => void) {
        sendFn = fn;
    }

    function startCountdown(seconds: number) {
        if (countdownInterval) clearInterval(countdownInterval);
        timeLeft.value = seconds;
        countdownInterval = setInterval(() => {
            if (timeLeft.value > 0) timeLeft.value--;
        }, 1000);
    }

    function stopCountdown() {
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
    }

    function handleMessage(msg: ServerMessage) {
        switch (msg.type) {
            case 'game_started':
                myTimeline.value = [msg.startingCard];
                allPlayerStats.value = msg.playerStats;
                timerSeconds.value = msg.timerSeconds;
                myLives.value = 3;
                myScore.value = 0;
                myHeat.value = 0;
                myHasPlaced.value = false;
                roundResults.value = null;
                myIncorrectCardQids.value = [];
                myPendingCardQid.value = null;
                myEliminated.value = false;
                break;

            case 'card_revealed':
                currentCard.value = msg.card;
                myHasPlaced.value = false;
                myPendingCardQid.value = null;
                roundResults.value = null;
                allPlayerStats.value = allPlayerStats.value.map(p => ({ ...p, hasPlaced: false }));
                gamePhase.value = 'placing';
                startCountdown(timerSeconds.value);
                break;

            case 'player_placed':
                allPlayerStats.value = allPlayerStats.value.map(p =>
                    p.playerId === msg.playerId ? { ...p, hasPlaced: true } : p,
                );
                break;

            case 'round_results': {
                stopCountdown();
                gamePhase.value = 'results';
                allPlayerStats.value = msg.playerStats;
                roundResults.value = msg.results;

                // Remove the optimistically placed card so we can re-insert at correct position
                if (myPendingCardQid.value) {
                    myTimeline.value = myTimeline.value.filter(c => c.qid !== myPendingCardQid.value);
                    myPendingCardQid.value = null;
                }

                const myResult = msg.results.find(r => r.playerId === myPlayerId.value);
                if (myResult) {
                    myScore.value = myResult.newScore;
                    myLives.value = myResult.newLives;
                    myHeat.value = myResult.newHeat;
                    if (myResult.eliminated) myEliminated.value = true;
                    if (currentCard.value) {
                        const card = currentCard.value;
                        if (!myResult.correct) {
                            myIncorrectCardQids.value = [...myIncorrectCardQids.value, card.qid];
                        }
                        // Always add the card to the timeline at the correct chronological position
                        const idx = myTimeline.value.findIndex(c => c.year > card.year);
                        if (idx === -1) myTimeline.value.push(card);
                        else myTimeline.value.splice(idx, 0, card);
                    }
                }
                break;
            }

            case 'game_ended':
                stopCountdown();
                gamePhase.value = 'ended';
                allPlayerStats.value = msg.finalScores;
                currentCard.value = null;
                break;
        }
    }

    // Set by GameView after the WebSocket connects; used to identify which stats are "mine"
    const myPlayerId = ref('');

    function isMe(stats: PublicPlayerStats): boolean {
        return stats.playerId === myPlayerId.value;
    }

    function startGame(seconds: number) {
        sendFn?.({ type: 'start_game', timerSeconds: seconds } satisfies ClientMessage);
    }

    function placeCard(afterIndex: number) {
        if (gamePhase.value !== 'placing' || myHasPlaced.value || myEliminated.value) return;
        myHasPlaced.value = true;

        // Optimistically insert the card into the timeline at the chosen position
        // afterIndex -1 → insert before all (index 0); afterIndex i → insert after card i (index i+1)
        if (currentCard.value) {
            const card = currentCard.value;
            myPendingCardQid.value = card.qid;
            const insertAt = afterIndex + 1;
            myTimeline.value = [
                ...myTimeline.value.slice(0, insertAt),
                card,
                ...myTimeline.value.slice(insertAt),
            ];
        }

        sendFn?.({ type: 'place_card', afterIndex } satisfies ClientMessage);
    }

    function reset() {
        stopCountdown();
        gamePhase.value = 'lobby';
        currentCard.value = null;
        myTimeline.value = [];
        myLives.value = 3;
        myScore.value = 0;
        myHeat.value = 0;
        myHasPlaced.value = false;
        allPlayerStats.value = [];
        roundResults.value = null;
        timerSeconds.value = 30;
        timeLeft.value = 0;
        myPlayerId.value = '';
        myIncorrectCardQids.value = [];
        myPendingCardQid.value = null;
        myEliminated.value = false;
        sendFn = null;
    }

    return {
        gamePhase, currentCard, myTimeline,
        myLives, myScore, myHeat, myHasPlaced,
        allPlayerStats, roundResults, timerSeconds, timeLeft,
        myPlayerId, myIncorrectCardQids, myPendingCardQid, myEliminated,
        setSendFn, handleMessage, startGame, placeCard, reset,
    };
});
