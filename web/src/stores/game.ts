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
                break;

            case 'card_revealed':
                currentCard.value = msg.card;
                myHasPlaced.value = false;
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

                const myResult = msg.results.find(r => {
                    const me = allPlayerStats.value.find(p => p.playerId === r.playerId);
                    return me && isMe(me);
                });
                if (myResult) {
                    myScore.value = myResult.newScore;
                    myLives.value = myResult.newLives;
                    myHeat.value = myResult.newHeat;
                    if (myResult.correct && currentCard.value) {
                        const card = currentCard.value;
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
        if (gamePhase.value !== 'placing' || myHasPlaced.value) return;
        myHasPlaced.value = true;
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
        sendFn = null;
    }

    return {
        gamePhase, currentCard, myTimeline,
        myLives, myScore, myHeat, myHasPlaced,
        allPlayerStats, roundResults, timerSeconds, timeLeft,
        myPlayerId,
        setSendFn, handleMessage, startGame, placeCard, reset,
    };
});
