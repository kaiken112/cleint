import React, { useState, useEffect, useRef, useCallback } from "react";
import { unstable_batchedUpdates } from "react-dom";
import {
    placeToFieldFromHand,
    addToHandFromField,
    placeToTopOfDeckFromField,
    placeToBotOfDeckFromField,
    moveCardOnField,
    moveEvoAndBaseOnField,
    transferToOpponentField,
    placeToFieldFromDeck,
    placeToFieldFromCemetery,
    placeToFieldFromBanish,
    placeTokenOnField,
    placeToBanishFromField,
    removeTokenOnField,
    evolveCardOnField,
    advancedToField,
    feedCardOnField,
    rideCardOnField,
    backToEvolveDeck,
    advancedBackToEvolveDeck,
    setField,
    setEnemyField,
    setEnemyEvoField,
    setEnemyEngaged,
    placeToCemeteryFromField,
    setEnemyCemetery,
    setEnemyEvoDeck,
    setEnemyCustomValues,
    showAtk,
    showDef,
    hideAtk,
    hideDef,
    modifyCounter,
    addAura,
    addBane,
    addWard,
    showStatus,
    hideStatus,
    duplicateCardOnField,
    clearValuesAtIndex,
    moveValuesAtIndex,
    moveCountersAtIndex,
    moveEngagedAtIndex,
    clearStatusAtIndex,
    moveStatusAtIndex,
    clearCountersAtIndex,
    clearEngagedAtIndex,
    setEnemyHand,
    setShowEnemyHand,
    setShowEnemyCard,
    setEnemyCard,
    setEnemyDeckSize,
    setEnemyEvoPoints,
    setEnemyPlayPoints,
    setEnemyHealth,
    setEnemyLeader,
    setEnemyCounter,
    setEnemyAura,
    setEnemyBane,
    setEnemyWard,
    setEnemyBanish,
    setEnemyViewingDeck,
    setEnemyViewingHand,
    setEnemyViewingCemetery,
    setEnemyViewingEvoDeck,
    setEnemyViewingCemeteryOpponent,
    setEnemyViewingEvoDeckOpponent,
    setEnemyViewingTopCards,
    setEnemyRematchStatus,
    setEnemyDice,
    setEnemyLog,
    setEnemyChat,
    setEnemyOnlineStatus,
    setLastChatMessage,
    setEnemyLeaderActive,
    setEnemyCardBack,
    setCardSelectedInHand,
    setEnemyCardSelectedInHand,
    setCardSelectedOnField,
    setEnemyCardSelectedOnField,
} from "../../redux/CardSlice";

// Import turn system actions
import {
    receiveTurnStart,
    receiveTurnEnd,
    startTurn,
    endTurn
} from "../../redux/ImprovedGameSlice";

// Import combat system
import {
    declareAttacker,
    cancelAttack,
    resolveCombat,
    canAttack,
    hasWardFollowers,
    getValidTargets
} from "../../redux/CombatSlice";

import { motion } from "framer-motion";
import CardMUI from "@mui/material/Card";
import { useDispatch, useSelector, useStore } from "react-redux";
import { Menu, MenuItem, Modal, Box, Typography, Tooltip } from "@mui/material";
import Card from "../hand/Card";
import Deck from "./Deck";
import Cemetery from "./Cemetery";
import EnemyCemetery from "./EnemyCemetery";
// import cardback from "../../assets/cardbacks/default.png";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EvoDeck from "./EvoDeck";
import EnemyEvoDeck from "./EnemyEvoDeck";
import img from "../../assets/pin_bellringer_angel.png";
import "../../css/AnimatedBorder.css";
import { useNavigate } from "react-router-dom";
import { socket } from "../../sockets";

import Token from "./Token";
import ShowDice from "./ShowDice";

import defaultCardBack from "../../assets/cardbacks/default.png";
import aeneaCardBack from "../../assets/cardbacks/aenea.png";
import dionneCardBack from "../../assets/cardbacks/dionne.png";
import dragonCardBack from "../../assets/cardbacks/dragon.png";
import fileneCardBack from "../../assets/cardbacks/filene.png";
import galmieuxCardBack from "../../assets/cardbacks/galmieux.png";
import jeanneCardBack from "../../assets/cardbacks/jeanne.png";
import kuonCardBack from "../../assets/cardbacks/kuon.png";
import ladicaCardBack from "../../assets/cardbacks/ladica.png";
import lishennaCardBack from "../../assets/cardbacks/lishenna.png";
import lishenna2CardBack from "../../assets/cardbacks/lishenna2.png";
import mistolinaCardBack from "../../assets/cardbacks/mistolina.png";
import monoCardBack from "../../assets/cardbacks/mono.png";
import orchisCardBack from "../../assets/cardbacks/orchis.png";
import piercyeCardBack from "../../assets/cardbacks/piercye.png";
import rosequeenCardBack from "../../assets/cardbacks/rosequeen.png";
import shikiCardBack from "../../assets/cardbacks/shiki.png";
import shutenCardBack from "../../assets/cardbacks/shuten.png";
import tidalgunnerCardBack from "../../assets/cardbacks/tidalgunner.png";
import viridiaCardBack from "../../assets/cardbacks/viridia.png";
import wilbertCardBack from "../../assets/cardbacks/wilbert.png";
import { getCardStats, cardStats } from "../../utils/cardStats";
import { cardImage } from "../../decks/getCards";
import { gameSyncManager } from "../../utils/GameSyncManager";

const style = {
    position: "relative",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "transparent",
    boxShadow: 24,
    p: 3,
    width: "55%",
};

export default function Field({
    ready,
    setReady,
    setHovering,
    readyToPlaceOnFieldFromHand,
    setReadyToPlaceOnFieldFromHand,
}) {
    const dispatch = useDispatch();
    const store = useStore();
    const navigate = useNavigate();

    // redux state
    const reduxRoom = useSelector((state) => state.card.room);
    const reduxField = useSelector((state) => state.card.field);
    const reduxCurrentCard = useSelector((state) => state.card.currentCard);
    const reduxCurrentCardIndex = useSelector(
        (state) => state.card.currentCardIndex
    );
    const reduxEvoField = useSelector((state) => state.card.evoField);
    const reduxEngaged = useSelector((state) => state.card.engagedField);
    const reduxCustomStatus = useSelector((state) => state.card.customStatus);
    const reduxCustomValues = useSelector((state) => state.card.customValues);
    const reduxEnemyCustomValues = useSelector(
        (state) => state.card.enemyCustomValues
    );
    const reduxEnemyField = useSelector((state) => state.card.enemyField);
    const reduxEnemyEvoField = useSelector((state) => state.card.enemyEvoField);
    const reduxEnemyEngaged = useSelector(
        (state) => state.card.enemyEngagedField
    );
    const reduxCurrentDeck = useSelector((state) => state.card.deck);
    const reduxCurrentRoom = useSelector((state) => state.card.room);
    const reduxEnemyHand = useSelector((state) => state.card.enemyHand);
    const reduxEnemyDeckSize = useSelector((state) => state.card.enemyDeckSize);
    const reduxShowEnemyHand = useSelector((state) => state.card.showEnemyHand);
    const reduxShowEnemyCard = useSelector((state) => state.card.showEnemyCard);
    const reduxEnemyCard = useSelector((state) => state.card.enemyCard);
    const reduxCounterField = useSelector((state) => state.card.counterField);
    const reduxEnemyCounterField = useSelector(
        (state) => state.card.enemyCounterField
    );
    const reduxAuraField = useSelector((state) => state.card.auraField);
    const reduxEnemyAuraField = useSelector((state) => state.card.enemyAuraField);
    const reduxBaneField = useSelector((state) => state.card.baneField);
    const reduxEnemyBaneField = useSelector((state) => state.card.enemyBaneField);
    const reduxWardField = useSelector((state) => state.card.wardField);
    const reduxEnemyWardField = useSelector((state) => state.card.enemyWardField);
    const reduxEnemyCardBack = useSelector((state) => state.card.enemyCardback);
    const reduxEnemyCemetery = useSelector((state) => state.card.enemyCemetery);
    const reduxCemetery = useSelector((state) => state.card.cemetery);
    const reduxCardSelectedInHand = useSelector(
        (state) => state.card.cardSelectedInHand
    );
    const reduxCardSelectedOnField = useSelector(
        (state) => state.card.cardSelectedOnField
    );

    // Turn system selectors
    const reduxIsMyTurn = useSelector((state) => state.game.isMyTurn);
    const reduxTurnNumber = useSelector((state) => state.game.turnNumber);
    const reduxCardPlayedTurn = useSelector((state) => state.game.cardPlayedTurn);
    const reduxEnemyHealth = useSelector((state) => state.game.enemyHealth);
    const reduxHealth = useSelector((state) => state.game.playerHealth || 20);
    const reduxPlayPoints = useSelector((state) => state.game.playPoints || { available: 0, max: 0 });
    const reduxEnemyPlayPoints = useSelector((state) => state.game.enemyPlayPoints || { available: 0, max: 0 });
    const reduxEvoPoints = useSelector((state) => state.game.evoPoints || 0);

    // Combat selectors
    const combatMode = useSelector((state) => state.combat.combatMode);
    const attackingCard = useSelector((state) => state.combat.attackingCard);
    const validTargets = useSelector((state) => state.combat.validTargets);

    // VERSION CHECK - Make sure both players have latest code
    useEffect(() => {
        console.log("🔵 Field.js VERSION: 2025-01-25-FINAL");
        console.log("📍 My room:", reduxRoom);
        return () => console.log("❌ Field unmounting");
    }, []);

    // useState
    const [cardback, setCardback] = useState();
    const [contextMenu, setContextMenu] = useState(null);
    const [contextEvoMenu, setContextEvoMenu] = useState(null);
    const [index, setIndex] = useState(0);
    const [deckIndex, setDeckIndex] = useState(0);
    const [name, setName] = useState("");
    const [readyToMoveOnField, setReadyToMoveOnField] = useState(false);
    const [readyToMoveEvoOnField, setReadyToMoveEvoOnField] = useState(false);
    const [readyToDuplicateOnField, setReadyToDuplicateOnField] = useState(false);
    const [readyFromDeck, setReadyFromDeck] = useState(false);
    const [readyFromCemetery, setReadyFromCemetery] = useState(false);
    const [readyFromBanish, setReadyFromBanish] = useState(false);
    const [readyToEvo, setReadyToEvo] = useState(false);
    const [readyToAdvanced, setReadyToAdvanced] = useState(false);
    const [readyToFeed, setReadyToFeed] = useState(false);
    const [readyToRide, setReadyToRide] = useState(false);
    const [tokenReady, setTokenReady] = useState(false);
    const [turnDebugLog, setTurnDebugLog] = useState([]);

    // useSocketStateSync();
    // useReceiveFullState();

    useEffect(() => {
        socket.on("connect", () => {
            console.log("Reconnected with socket id:", socket.id);
            socket.emit("join_room", reduxRoom); // rejoin room
            socket.emit("request_state", { room: reduxRoom });
        });

        return () => {
            socket.off("connect");
        };
    }, [reduxRoom]);

    // Create snapshots on important state changes
    useEffect(() => {
        const logEntry = `${new Date().toLocaleTimeString()} - Turn ${reduxTurnNumber}: ${reduxIsMyTurn ? 'MY TURN' : 'OPPONENT TURN'}`;
        console.log(`🔄 TURN CHANGED: isMyTurn=${reduxIsMyTurn}, turnNumber=${reduxTurnNumber}`);
        setTurnDebugLog(prev => [...prev.slice(-4), logEntry]); // Keep last 5 entries
    }, [reduxIsMyTurn, reduxTurnNumber]);

    useEffect(() => {
        // Create snapshot using current Redux state from selectors
        const currentState = {
            card: {
                field: reduxField,
                evoField: reduxEvoField,
                enemyField: reduxEnemyField,
                enemyEvoField: reduxEnemyEvoField,
                cemetery: reduxCemetery,
                enemyCemetery: reduxEnemyCemetery,
                customValues: reduxCustomValues,
                enemyCustomValues: reduxEnemyCustomValues,
                engagedField: reduxEngaged,
                enemyEngagedField: reduxEnemyEngaged,
                counterField: reduxCounterField,
                enemyCounterField: reduxEnemyCounterField,
                auraField: reduxAuraField,
                enemyAuraField: reduxEnemyAuraField,
                baneField: reduxBaneField,
                enemyBaneField: reduxEnemyBaneField,
                wardField: reduxWardField,
                enemyWardField: reduxEnemyWardField,
                hand: [],
                enemyHand: reduxEnemyHand,
            },
            game: {
                isMyTurn: reduxIsMyTurn,
                turnNumber: reduxTurnNumber,
                playPoints: reduxPlayPoints,
                enemyPlayPoints: reduxEnemyPlayPoints,
                playerHealth: reduxHealth,
                enemyHealth: reduxEnemyHealth,
                evoPoints: reduxEvoPoints,
                enemyEvoPoints: 0,
            }
        };

        gameSyncManager.createSnapshot(currentState, 'state_change');
    }, [reduxField, reduxEnemyField, reduxCemetery, reduxEnemyCemetery, reduxTurnNumber]);

    // Manual desync recovery function
    const handleManualSync = useCallback(() => {
        console.log('🔄 MANUAL SYNC REQUESTED');
        const report = gameSyncManager.getSyncReport();
        console.log('📊 Sync Report:', report);

        // Request full state from opponent
        socket.emit("request_state", { room: reduxRoom });
        alert('Sync requested from opponent. They will send their game state.');
    }, [reduxRoom]);

    // Manual rollback function
    const handleRollback = useCallback(() => {
        const snapshot = gameSyncManager.getSnapshotAgo(1);
        if (snapshot) {
            console.log('⏪ ROLLING BACK to:', snapshot.action);

            // Restore state from snapshot
            dispatch(setField(snapshot.state.field));
            dispatch(setEnemyField(snapshot.state.enemyField));
            dispatch(setEnemyCemetery(snapshot.state.enemyCemetery));

            alert(`Rolled back to: ${snapshot.action}`);
        } else {
            alert('No snapshots available to roll back to');
        }
    }, [dispatch]);

    // Manual test - destroy card at position 2
    const handleManualDestroy = useCallback(() => {
        const currentState = store.getState();
        const currentField = currentState.card.field;

        const fieldNow = currentField.map((c, i) => `[${i}]: ${c === 0 ? 'EMPTY' : c}`).join('\n');

        alert(`🧪 MANUAL DESTROY TEST\n\nCurrent field:\n${fieldNow}\n\nWill try to destroy position 2...`);

        const card = currentField[2];
        if (card && card !== 0) {
            alert(`Found card: ${card}\n\nCalling placeToCemeteryFromField...`);

            dispatch(placeToCemeteryFromField({
                card: card,
                index: 2
            }));

            setTimeout(() => {
                const newField = store.getState().card.field;
                const stillThere = newField[2];
                alert(`Result:\nOld: ${card}\nNow: ${stillThere === 0 ? 'EMPTY' : stillThere}\n\n${stillThere === 0 ? '✅ Destroyed!' : '❌ Still there!'}`);
            }, 100);
        } else {
            alert(`Position 2 is empty!`);
        }
    }, [dispatch, store]);
    const handleForceTurn = useCallback(() => {
        console.log('🚨 FORCING MY TURN');
        dispatch(startTurn());
        alert('Forced turn to YOU. Use carefully!');
    }, [dispatch]);

    // Test End Turn button
    const handleTestEndTurn = useCallback(() => {
        console.log('═══════════════════════════════════════');
        console.log('📤 TEST END TURN CLICKED');
        console.log('  Current state:');
        console.log('    - isMyTurn:', reduxIsMyTurn);
        console.log('    - turnNumber:', reduxTurnNumber);
        console.log('    - room:', reduxRoom);
        console.log('  Dispatching endTurn()...');

        dispatch(endTurn());

        console.log('✅ endTurn() dispatched');
        console.log('  This should:');
        console.log('    1. Set isMyTurn=false locally');
        console.log('    2. Send "turnStart" message to opponent');
        console.log('═══════════════════════════════════════');
    }, [dispatch, reduxIsMyTurn, reduxTurnNumber, reduxRoom]);

    // Message queue to handle out-of-order messages
    const messageQueueRef = useRef([]);
    const lastSequenceRef = useRef(-1);
    const processingRef = useRef(false);

    // Process a single update (batched with others)
    const handleUpdate = useCallback(
        (update) => {
            // DEBUG: Log ALL messages with details
            console.log(`📨 [handleUpdate] Received:`, {
                type: update.type,
                data: update.data,
                timestamp: new Date().toISOString()
            });

            switch (update.type) {
                case "field":
                    dispatch(setEnemyField(update.data));
                    break;
                case "evoField":
                    dispatch(setEnemyEvoField(update.data));
                    break;
                case "engaged":
                    dispatch(setEnemyEngaged(update.data));
                    break;
                case "cemetery":
                    dispatch(setEnemyCemetery(update.data));
                    break;
                case "evoDeck":
                    dispatch(setEnemyEvoDeck(update.data));
                    break;
                case "values":
                    dispatch(setEnemyCustomValues(update.data));
                    break;
                case "fieldUpdate":
                    // Server is telling us our field state
                    console.log(`📥 SERVER FIELD UPDATE:`, update.data.field);
                    alert(`🔄 SERVER: Field updated!\n\n${update.data.field.map((c, i) => `[${i}]:${c === 0 ? 'EMPTY' : c}`).join(' ')}`);
                    dispatch(setField([...update.data.field]));
                    break;
                case "manualDestroy":
                    // Opponent wants us to destroy our card at a position
                    const destroyPos = update.data.position;
                    console.log(`📥 MANUAL DESTROY REQUEST for position ${destroyPos}`);

                    const stateNow = store.getState();
                    const fieldNow = stateNow.card.field;
                    const cardToKill = fieldNow[destroyPos];

                    if (cardToKill && cardToKill !== 0) {
                        console.log(`💀 Destroying: ${cardToKill} at position ${destroyPos}`);
                        dispatch(placeToCemeteryFromField({
                            card: cardToKill,
                            index: destroyPos
                        }));
                        alert(`💀 CARD DESTROYED!\n\n${cardToKill} at position ${destroyPos}`);
                    } else {
                        alert(`⚠️ No card at position ${destroyPos}`);
                    }
                    break;
                case "destroyConfirmed":
                    console.log(`✅ Server confirmed destroy:`, update.data);
                    alert(`✅ SERVER: Destroy confirmed!\n\nCard: ${update.data.cardName}\nPosition: ${update.data.index}`);
                    break;
                case "destroyFailed":
                    console.log(`❌ Server destroy failed:`, update.data);
                    alert(`❌ SERVER: Destroy failed!\n\n${update.data.error}`);
                    break;
                case "hand":
                    dispatch(setEnemyHand(update.data));
                    break;
                case "deckSize":
                    dispatch(setEnemyDeckSize(update.data));
                    break;
                case "evoPoints":
                    dispatch(setEnemyEvoPoints(update.data));
                    break;
                case "playPoints":
                    dispatch(setEnemyPlayPoints(update.data));
                    break;
                case "health":
                    dispatch(setEnemyHealth(update.data));
                    break;
                case "leader":
                    dispatch(setEnemyLeader(update.data));
                    break;
                case "showHand":
                    dispatch(setShowEnemyHand(update.data));
                    break;
                case "showCard":
                    dispatch(setShowEnemyCard(update.data));
                    break;
                case "cardRevealed":
                    dispatch(setEnemyCard(update.data));
                    break;
                case "transfer":
                    dispatch(setField(update.data));
                    break;
                case "counter":
                    dispatch(setEnemyCounter(update.data));
                    break;
                case "aura":
                    dispatch(setEnemyAura(update.data));
                    break;
                case "bane":
                    dispatch(setEnemyBane(update.data));
                    break;
                case "ward":
                    dispatch(setEnemyWard(update.data));
                    break;
                case "banish":
                    dispatch(setEnemyBanish(update.data));
                    break;
                case "viewingHand":
                    dispatch(setEnemyViewingHand(update.data));
                    break;
                case "viewingDeck":
                    dispatch(setEnemyViewingDeck(update.data));
                    break;
                case "viewingTopCards":
                    dispatch(setEnemyViewingTopCards(update.data));
                    break;
                case "viewingCemetery":
                    dispatch(setEnemyViewingCemetery(update.data));
                    break;
                case "viewingEvoDeck":
                    dispatch(setEnemyViewingEvoDeck(update.data));
                    break;
                case "viewingCemeteryOpponent":
                    dispatch(setEnemyViewingCemeteryOpponent(update.data));
                    break;
                case "viewingEvoDeckOpponent":
                    dispatch(setEnemyViewingEvoDeckOpponent(update.data));
                    break;
                case "dice":
                    dispatch(setEnemyDice(update.data));
                    break;
                case "leaderActive":
                    dispatch(setEnemyLeaderActive(update.data));
                    break;
                case "log":
                    dispatch(setEnemyLog(update.data));
                    break;
                case "cardback":
                    dispatch(setEnemyCardBack(update.data));
                    break;
                case "rematch":
                    dispatch(setEnemyRematchStatus(update.data));
                    break;
                case "cardSelected":
                    dispatch(setEnemyCardSelectedInHand(update.data));
                    break;
                case "cardSelectedField":
                    dispatch(setEnemyCardSelectedOnField(update.data));
                    break;
                case "chat":
                    dispatch(setEnemyChat(update.data));
                    dispatch(setLastChatMessage(update.data));
                    break;
                case "destroyCard":
                    // Opponent destroyed one of YOUR cards
                    const { index } = update.data;
                    console.log(`📥 RECEIVED destroyCard message! Index: ${index}`);
                    console.log(`💀 Your card at index ${index} was destroyed by opponent!`);

                    // Get the card at that position
                    const cardToDestroy = reduxField[index];
                    console.log("🔍 Card to destroy:", cardToDestroy, "Type:", typeof cardToDestroy);
                    console.log("🗂️ Current field:", reduxField);

                    // Destroy YOUR OWN card (not enemy card)
                    if (cardToDestroy && cardToDestroy !== 0) {
                        console.log(`✅ Destroying card: ${cardToDestroy} at index ${index}`);
                        dispatch(placeToCemeteryFromField({
                            card: typeof cardToDestroy === 'string' ? cardToDestroy : String(cardToDestroy),
                            index: index
                        }));
                        console.log(`✅ placeToCemeteryFromField dispatched`);
                    } else {
                        console.warn(`⚠️ No card to destroy at index ${index}! Card value:`, cardToDestroy);
                    }
                    break;
                case "full_state_sync":
                    // Handle full state synchronization (used on reconnection)
                    // This bypasses the queue and directly updates all state
                    const fullState = update.data;
                    if (fullState) {
                        unstable_batchedUpdates(() => {
                            if (fullState.enemyField !== undefined)
                                dispatch(setEnemyField(fullState.enemyField));
                            if (fullState.enemyEvoField !== undefined)
                                dispatch(setEnemyEvoField(fullState.enemyEvoField));
                            if (fullState.enemyHand !== undefined)
                                dispatch(setEnemyHand(fullState.enemyHand));
                            if (fullState.enemyLeader !== undefined)
                                dispatch(setEnemyLeader(fullState.enemyLeader));
                            if (fullState.enemyHealth !== undefined)
                                dispatch(setEnemyHealth(fullState.enemyHealth));
                            if (fullState.enemyPlayPoints !== undefined)
                                dispatch(setEnemyPlayPoints(fullState.enemyPlayPoints));
                            if (fullState.enemyEvoPoints !== undefined)
                                dispatch(setEnemyEvoPoints(fullState.enemyEvoPoints));
                            if (fullState.enemyDeckSize !== undefined)
                                dispatch(setEnemyDeckSize(fullState.enemyDeckSize));
                            if (fullState.enemyCemetery !== undefined)
                                dispatch(setEnemyCemetery(fullState.enemyCemetery));
                            if (fullState.enemyCardBack !== undefined)
                                dispatch(setEnemyCardBack(fullState.enemyCardBack));
                            if (fullState.enemyCounter !== undefined)
                                dispatch(setEnemyCounter(fullState.enemyCounter));
                            if (fullState.enemyAura !== undefined)
                                dispatch(setEnemyAura(fullState.enemyAura));
                            if (fullState.enemyBane !== undefined)
                                dispatch(setEnemyBane(fullState.enemyBane));
                            if (fullState.enemyWard !== undefined)
                                dispatch(setEnemyWard(fullState.enemyWard));
                            if (fullState.enemyBanish !== undefined)
                                dispatch(setEnemyBanish(fullState.enemyBanish));
                            if (fullState.enemyCustomValues !== undefined)
                                dispatch(setEnemyCustomValues(fullState.enemyCustomValues));
                            if (fullState.enemyDice !== undefined)
                                dispatch(setEnemyDice(fullState.enemyDice));
                            if (fullState.enemyLeaderActive !== undefined)
                                dispatch(setEnemyLeaderActive(fullState.enemyLeaderActive));
                            if (fullState.enemyLog !== undefined)
                                dispatch(setEnemyLog(fullState.enemyLog));
                        });
                        // Reset sequence after full state sync
                        lastSequenceRef.current = -1;
                    }
                    break;
                case "turnStart":
                    // Handle opponent ending their turn (our turn starts)
                    console.log("═══════════════════════════════════════");
                    console.log("📥 RECEIVED TURN START MESSAGE");
                    console.log("  From opponent, they ended their turn");
                    console.log("  Current state BEFORE:");
                    console.log("    - isMyTurn:", reduxIsMyTurn);
                    console.log("    - turnNumber:", reduxTurnNumber);
                    console.log("  Data received:", update.data);
                    console.log("🔔 [HANDLER] Processing turnStart, dispatching receiveTurnStart");

                    dispatch(receiveTurnStart(update.data));

                    console.log("✅ [HANDLER] receiveTurnStart dispatched");
                    console.log("  Expected AFTER: isMyTurn=true, turnNumber incremented");
                    console.log("═══════════════════════════════════════");
                    break;
                case "turnEnd":
                    // Handle opponent starting their turn (our turn ends)
                    console.log("📥 RECEIVED TURN END - Opponent started their turn");
                    dispatch(receiveTurnEnd());
                    break;
                default:
                    console.warn("Unknown update type:", update.type);
            }
        },
        [dispatch]
    );

    // Process queued messages in order
    const processQueue = useCallback(() => {
        if (processingRef.current) return;
        processingRef.current = true;

        // Sort queue by sequence number if available, otherwise by timestamp
        messageQueueRef.current.sort((a, b) => {
            if (a.sequence !== undefined && b.sequence !== undefined) {
                return a.sequence - b.sequence;
            }
            return a.timestamp - b.timestamp;
        });

        // Process all ready messages
        while (messageQueueRef.current.length > 0) {
            const message = messageQueueRef.current[0];

            // If sequence numbers are used, only process if it's the next expected one
            if (message.sequence !== undefined) {
                if (message.sequence !== lastSequenceRef.current + 1) {
                    // Wait for the correct sequence
                    break;
                }
                lastSequenceRef.current = message.sequence;
            }

            // Remove from queue
            messageQueueRef.current.shift();

            // Process all updates in this message atomically using batched updates
            if (message.updates && Array.isArray(message.updates)) {
                // Batch all dispatches together to prevent intermediate renders
                unstable_batchedUpdates(() => {
                    message.updates.forEach((update) => {
                        handleUpdate(update);
                    });
                });
            } else {
                // Single update - still batch it
                unstable_batchedUpdates(() => {
                    handleUpdate(message);
                });
            }
        }

        processingRef.current = false;
    }, [handleUpdate]);

    useEffect(() => {
        const handleMessage = (data) => {
            // Add sequence number and timestamp if not present
            const message = {
                ...data,
                sequence: data.sequence,
                timestamp: data.timestamp || Date.now(),
            };

            // Add to queue
            messageQueueRef.current.push(message);

            // Process queue
            processQueue();
        };

        socket.on("receive msg", handleMessage);
        socket.on("online", () => dispatch(setEnemyOnlineStatus(true)));
        socket.on("offline", () => dispatch(setEnemyOnlineStatus(false)));

        // NOTE: Turn syncing is handled in the main "receive msg" handler above
        // with "turnStart" and "turnEnd" cases. No separate listeners needed.

        return () => {
            socket.off("receive msg", handleMessage);
            socket.off("online");
            socket.off("offline");
        };
    }, [dispatch, processQueue]);

    useEffect(() => {
        if (reduxCurrentRoom.length === 0) {
            navigate("/");
        }
    }, [reduxCurrentRoom, navigate]);

    useEffect(() => {
        dispatch(setCardSelectedInHand(-1));
    }, [reduxEnemyHand, dispatch]);

    useEffect(() => {
        dispatch(setCardSelectedOnField(-1));
    }, [reduxEnemyField, dispatch]);

    const handleModalClose = () => {
        dispatch(setShowEnemyHand(false));
    };

    const handleShowCardModalClose = () => {
        dispatch(setShowEnemyCard(false));
    };

    const cardPos = (idx) => {
        if (idx === -1) return -1;
        else if (idx < 5) return idx + 5;
        else return idx - 5;
    };

    const isToken = (name) => {
        return typeof name === 'string' && name.slice(-5) === "TOKEN";
    };
    const isAdvanced = (name) => {
        return typeof name === 'string' && name.slice(-8) === "ADVANCED";
    };

    /**
     * Handle clicking your own card to attack
     */
    const handleAttackClick = (index) => {
        console.log("🔍 DEBUG: handleAttackClick called", { index });

        const card = reduxField[index];
        if (card === 0) {
            console.log("❌ No card at index", index);
            return;
        }

        console.log("🔍 Card found:", card);

        const engaged = reduxEngaged[index];
        const turnPlayed = reduxCardPlayedTurn[index];
        const atk = reduxCustomValues[index].atk || 0;

        console.log("🔍 Card stats:", {
            engaged,
            turnPlayed,
            currentTurn: reduxTurnNumber,
            atk,
            isMyTurn: reduxIsMyTurn
        });

        // Check if card can attack
        if (!canAttack(card, engaged, turnPlayed, reduxTurnNumber)) {
            if (engaged) {
                console.log("❌ Card can't attack: ENGAGED (already attacked this turn)");
            } else if (turnPlayed === reduxTurnNumber) {
                console.log("❌ Card can't attack: SUMMONING SICKNESS (played this turn)");
            } else {
                console.log("❌ Card can't attack: Unknown reason");
            }
            return;
        }

        if (!reduxIsMyTurn) {
            console.log("❌ Not your turn!");
            return;
        }

        // Enter combat mode
        dispatch(declareAttacker({
            index,
            card,
            atk,
            canAttackLeader: !hasWardFollowers(reduxEnemyField, reduxEnemyWardField)
        }));

        alert(`🗡️ COMBAT MODE!\n${card} ready to attack!\n\nClick enemy card OR press L for leader`);
    };

    /**
     * Handle attacking opponent's follower
     */
    const handleAttackTarget = (targetIndex) => {
        if (!combatMode || !attackingCard) return;

        const target = reduxEnemyField[targetIndex];
        if (target === 0) return; // No target here

        // Check if valid target
        if (!validTargets.includes(targetIndex)) {
            console.log("❌ Invalid target!");
            return;
        }

        const attacker = attackingCard;

        // Extract product code from image path (same way Card component renders it!)
        const extractCodeFromImagePath = (cardName) => {
            const imagePath = cardImage(cardName); // e.g., "../textures/ECP01-042EN.png"
            const filename = imagePath.split('/').pop(); // "ECP01-042EN.png"
            const code = filename.replace('.png', ''); // "ECP01-042EN"
            return code;
        };

        const attackerCode = extractCodeFromImagePath(attacker.card);
        const targetCard = reduxEnemyField[targetIndex];
        const targetCode = extractCodeFromImagePath(targetCard);

        // Get ATK/DEF from cardStats database
        console.log("🔍 Looking up attacker:", attacker.card, "→ Code:", attackerCode);
        let attackerStats = getCardStats(attackerCode);
        console.log("📊 Attacker stats:", attackerStats);

        // If default stats returned (2/2 fallback), ask user
        if (attackerStats.atk === 2 && attackerStats.def === 2 && !cardStats[attackerCode]) {
            const input = prompt(`${attacker.card} not in database!\n\nEnter ATK/DEF (format: 3/3)`, "2/2");
            if (input) {
                const [atk, def] = input.split("/").map(n => parseInt(n.trim()));
                attackerStats = { atk: atk || 2, def: def || 2 };
            }
        }

        let attackerAtk = attackerStats.atk;
        let attackerDef = attackerStats.def;

        console.log("🔍 Looking up target:", targetCard, "→ Code:", targetCode);
        let targetStats = getCardStats(targetCode);
        console.log("📊 Target stats:", targetStats);

        // If default stats returned, ask user  
        if (targetStats.atk === 2 && targetStats.def === 2 && !cardStats[targetCode]) {
            const input = prompt(`${targetCard} not in database!\n\nEnter ATK/DEF (format: 3/3)`, "2/2");
            if (input) {
                const [atk, def] = input.split("/").map(n => parseInt(n.trim()));
                targetStats = { atk: atk || 2, def: def || 2 };
            }
        }

        const targetAtk = targetStats.atk;
        const targetDef = targetStats.def;

        const attackerHasBane = reduxBaneField[attacker.index] === 1;

        // DETAILED DEBUG
        console.log(`⚔️ COMBAT: ${attacker.card}(${attackerAtk}/${attackerDef}) vs ${targetCard}(${targetAtk}/${targetDef})`);

        console.log(`⚔️ Combat Start:
    Attacker: ${attacker.card} (${attackerAtk}/${attackerDef}) ${attackerHasBane ? '[BANE]' : ''}
    Target: ${target} (${targetAtk}/${targetDef})`);

        // Calculate combat result
        const attackerTakesDamage = targetAtk;
        const targetTakesDamage = attackerAtk;

        const attackerNewDef = attackerDef - attackerTakesDamage;
        const targetNewDef = targetDef - targetTakesDamage;

        const attackerDestroyed = attackerNewDef <= 0;
        const targetDestroyed = targetNewDef <= 0 || attackerHasBane;

        console.log(`🎯 DESTRUCTION CHECK:`);
        console.log(`   Attacker destroyed: ${attackerDestroyed} (DEF: ${attackerNewDef})`);
        console.log(`   Target destroyed: ${targetDestroyed} (DEF: ${targetNewDef}, Bane: ${attackerHasBane})`);

        // DETAILED RESULT
        console.log(`💥 Combat: Attacker ${attackerDestroyed ? "destroyed" : "survives"}, Target ${targetDestroyed ? "destroyed" : "survives"}`);

        console.log(`💥 Damage:
    Attacker takes ${attackerTakesDamage} damage → ${attackerNewDef} DEF ${attackerDestroyed ? '💀 DESTROYED' : ''}
    Target takes ${targetTakesDamage} damage → ${targetNewDef} DEF ${targetDestroyed ? '💀 DESTROYED' : ''}`);

        // Resolve combat in state
        dispatch(resolveCombat({
            attackerIndex: attacker.index,
            attackerCard: attacker.card,
            attackerAtk,
            attackerDef,
            targetIndex,
            targetCard: target,
            targetAtk,
            targetDef,
            attackerHasBane,
            targetHasWard: reduxEnemyWardField[targetIndex] === 1,
            isLeaderTarget: false
        }));

        console.log(`🔧 APPLYING COMBAT RESULTS...`);
        console.log(`   Attacker destroyed: ${attackerDestroyed}`);
        console.log(`   Target destroyed: ${targetDestroyed}`);

        // Apply results
        if (attackerDestroyed) {
            // Attacker dies - move to cemetery
            dispatch(placeToCemeteryFromField({
                card: attacker.card,
                index: attacker.index
            }));
            console.log(`💀 ${attacker.card} destroyed!`);
        } else {
            // Attacker survives - mark engaged and update DEF display
            dispatch(moveEngagedAtIndex({ index: attacker.index, engaged: true }));

            // Defense has been reduced but we're just logging it for now
            console.log(`✅ ${attacker.card} survives with ${attackerNewDef} DEF`);
        }

        if (targetDestroyed) {
            // Target destroyed
            console.log(`💀 ${targetCard} destroyed at index ${targetIndex}!`);

            // Immediately update local state - move enemy card to cemetery
            const destroyedCard = reduxEnemyField[targetIndex];
            if (destroyedCard && destroyedCard !== 0) {
                console.log(`📤 Moving ${destroyedCard} to enemy cemetery locally`);
                // Add to enemy cemetery
                dispatch(setEnemyCemetery([...reduxEnemyCemetery, destroyedCard]));
                // Remove from enemy field
                const newEnemyField = [...reduxEnemyField];
                newEnemyField[targetIndex] = 0;
                dispatch(setEnemyField(newEnemyField));
            }

            // Send socket message - tell opponent to destroy their card
            console.log(`💥 Telling opponent to destroy their card at position ${targetIndex}`);

            if (!reduxRoom) {
                alert(`ERROR: Room not set!`);
                return;
            }

            // Send simple message to opponent
            socket.emit("send msg", {
                type: "manualDestroy",
                data: { position: targetIndex },
                room: reduxRoom
            });

            console.log(`✅ Destroy message sent`);
        } else {
            console.log(`✅ ${targetCard} survives with ${targetNewDef} DEF`);
            // TODO: Send socket message for opponent to update DEF
        }
    };

    /**
     * Handle attacking opponent's leader
     */
    const handleAttackLeader = () => {
        if (!combatMode || !attackingCard) return;

        // Check if leader is valid target
        if (!validTargets.includes('leader')) {
            console.log("❌ Can't attack leader (ward followers present)!");
            return;
        }

        const attacker = attackingCard;
        const attackerAtk = reduxCustomValues[attacker.index].atk || 0;

        // Resolve combat
        dispatch(resolveCombat({
            attackerIndex: attacker.index,
            attackerCard: attacker.card,
            attackerAtk,
            isLeaderTarget: true
        }));

        // Deal damage to opponent's health
        const newHealth = Math.max(0, reduxEnemyHealth - attackerAtk);
        dispatch(setEnemyHealth(newHealth));

        // Mark attacker as engaged
        dispatch(moveEngagedAtIndex({ index: attacker.index, engaged: true }));

        console.log(`👑 ${attacker.card} deals ${attackerAtk} damage to leader! (${reduxEnemyHealth} → ${newHealth})`);

        if (newHealth === 0) {
            console.log("🎉 Victory! Opponent's leader defeated!");
        }
    };

    // ESC key to cancel combat mode, L key to attack leader
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === 'Escape' && combatMode) {
                dispatch(cancelAttack());
                console.log("❌ Combat cancelled");
            } else if (e.key === 'l' && combatMode && validTargets.includes('leader')) {
                handleAttackLeader();
            } else if (e.key === 'L' && combatMode && validTargets.includes('leader')) {
                handleAttackLeader();
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [combatMode, validTargets, dispatch]);

    const handleClick = (name, indexClicked) => {
        // Turn validation - prevent playing on opponent's turn
        if (!reduxIsMyTurn && readyToPlaceOnFieldFromHand) {
            console.warn("❌ Cannot play cards: Not your turn!");
            return;
        }

        if (reduxField[indexClicked] === 0 && !readyToEvo && !readyToFeed) {
            if (readyToPlaceOnFieldFromHand) {
                setReadyToPlaceOnFieldFromHand(false);
                dispatch(
                    placeToFieldFromHand({
                        card: reduxCurrentCard,
                        indexInHand: reduxCurrentCardIndex,
                        index: indexClicked,
                    })
                );
            }
            if (tokenReady) {
                setTokenReady(false);
                dispatch(
                    placeTokenOnField({
                        card: name,
                        index: indexClicked,
                    })
                );
                // dispatch(clearValuesAtIndex(index));
                // dispatch(clearEngagedAtIndex(index));
                // dispatch(clearCountersAtIndex(index));
            }
            if (readyToAdvanced) {
                setReadyToAdvanced(false);
                dispatch(
                    advancedToField({
                        card: name,
                        indexInEvolveDeck: reduxCurrentCardIndex,
                        index: indexClicked,
                    })
                );
            }
            if (readyToMoveOnField) {
                setReadyToMoveOnField(false);
                dispatch(
                    moveCardOnField({
                        card: name,
                        prevIndex: index,
                        index: indexClicked,
                    })
                );
                dispatch(
                    moveValuesAtIndex({
                        prevIndex: index,
                        index: indexClicked,
                    })
                );
                dispatch(
                    moveCountersAtIndex({
                        prevIndex: index,
                        index: indexClicked,
                    })
                );
                dispatch(
                    moveEngagedAtIndex({
                        prevIndex: index,
                        index: indexClicked,
                    })
                );
                dispatch(
                    moveStatusAtIndex({
                        prevIndex: index,
                        index: indexClicked,
                    })
                );
                dispatch(clearValuesAtIndex(index));
                dispatch(clearEngagedAtIndex(index));
                dispatch(clearCountersAtIndex(index));
                dispatch(clearStatusAtIndex(index));
            }
            if (readyToMoveEvoOnField) {
                setReadyToMoveEvoOnField(false);
                dispatch(
                    moveEvoAndBaseOnField({
                        card: name,
                        evoCard: name,
                        prevIndex: index,
                        index: indexClicked,
                    })
                );
                dispatch(
                    moveValuesAtIndex({
                        prevIndex: index,
                        index: indexClicked,
                    })
                );
                dispatch(
                    moveCountersAtIndex({
                        prevIndex: index,
                        index: indexClicked,
                    })
                );
                dispatch(
                    moveEngagedAtIndex({
                        prevIndex: index,
                        index: indexClicked,
                    })
                );
                dispatch(
                    moveStatusAtIndex({
                        prevIndex: index,
                        index: indexClicked,
                    })
                );
                dispatch(clearValuesAtIndex(index));
                dispatch(clearEngagedAtIndex(index));
                dispatch(clearCountersAtIndex(index));
                dispatch(clearStatusAtIndex(index));
            }
            if (readyToDuplicateOnField) {
                setReadyToDuplicateOnField(false);
                dispatch(
                    duplicateCardOnField({
                        card: name,
                        index: indexClicked,
                    })
                );
                dispatch(
                    moveValuesAtIndex({
                        prevIndex: index,
                        index: indexClicked,
                    })
                );
                // dispatch(clearValuesAtIndex(indexClicked));
                dispatch(clearEngagedAtIndex(indexClicked));
                dispatch(clearCountersAtIndex(indexClicked));
            }
            if (readyFromDeck) {
                setReadyFromDeck(false);
                console.log("name", name);
                console.log("indexClicked", indexClicked);
                dispatch(
                    placeToFieldFromDeck({
                        card: name,
                        index: indexClicked,
                        deckIndex: deckIndex,
                    })
                );
            }
            if (readyFromCemetery) {
                setReadyFromCemetery(false);
                dispatch(
                    placeToFieldFromCemetery({
                        card: name,
                        indexInHand: reduxCurrentCardIndex,
                        index: indexClicked,
                    })
                );
            }
            if (readyFromBanish) {
                setReadyFromBanish(false);
                dispatch(
                    placeToFieldFromBanish({
                        card: name,
                        indexInHand: reduxCurrentCardIndex,
                        index: indexClicked,
                    })
                );
            }
        } else if (
            (readyToFeed || readyToEvo || readyToRide) &&
            reduxField[indexClicked] !== 0 &&
            reduxEvoField[indexClicked] === 0
        ) {
            if (readyToEvo) {
                setReadyToEvo(false);
                dispatch(
                    evolveCardOnField({
                        card: name,
                        indexInEvolveDeck: reduxCurrentCardIndex,
                        index: indexClicked,
                    })
                );
            }
            if (readyToRide) {
                setReadyToRide(false);
                dispatch(
                    rideCardOnField({
                        card: name,
                        index: indexClicked,
                        indexInEvolveDeck: reduxCurrentCardIndex,
                    })
                );
            }
            if (readyToFeed) {
                setReadyToFeed(false);
                dispatch(
                    feedCardOnField({
                        card: name,
                        index: indexClicked,
                        carrots: 1,
                        indexInEvolveDeck: reduxCurrentCardIndex,
                    })
                );
            }
        } else if (
            readyToFeed &&
            reduxField[indexClicked] !== 0 &&
            reduxEvoField[indexClicked].slice(0, 6) === "Carrot"
        ) {
            dispatch(
                feedCardOnField({
                    card: name,
                    index: indexClicked,
                    carrots: 2,
                    indexInEvolveDeck: reduxCurrentCardIndex,
                })
            );
        } else {
            console.log("there is already a card here");
            setReadyToEvo(false);
            setReadyToAdvanced(false);
            setReadyToFeed(false);
            setReadyFromCemetery(false);
            setReadyFromBanish(false);
            setReadyToPlaceOnFieldFromHand(false);
            setReadyToMoveOnField(false);
            setReadyToMoveEvoOnField(false);
            setTokenReady(false);
        }
        setReady(false);
    };

    const cancelClick = () => {
        setReady(false);

        setReadyToEvo(false);
        setReadyToAdvanced(false);
        setReadyToFeed(false);
        setReadyFromCemetery(false);
        setReadyFromBanish(false);
        setReadyToPlaceOnFieldFromHand(false);
        setReadyToMoveOnField(false);
        setReadyToMoveEvoOnField(false);
        setTokenReady(false);
    };

    const handleContextMenu = (event, index, name) => {
        setIndex(index);
        setName(name);
        event.preventDefault();
        setContextMenu(
            contextMenu === null
                ? {
                    mouseX: event.clientX + 2,
                    mouseY: event.clientY - 6,
                }
                : null
        );
    };
    const handleEvoContextMenu = (event, index, name) => {
        setIndex(index);
        setName(name);
        event.preventDefault();
        setContextEvoMenu(
            contextEvoMenu === null
                ? {
                    mouseX: event.clientX + 2,
                    mouseY: event.clientY - 6,
                }
                : null
        );
    };
    const handleClose = () => {
        setContextMenu(null);
    };
    const handleEvoClose = () => {
        setContextEvoMenu(null);
    };
    const handleCardToHandFromField = () => {
        handleClose();
        dispatch(
            addToHandFromField({
                card: name,
                index: index,
            })
        );
        dispatch(clearValuesAtIndex(index));
        dispatch(clearEngagedAtIndex(index));
        dispatch(clearCountersAtIndex(index));
        dispatch(clearStatusAtIndex(index));
    };
    const handleCardToTopDeck = () => {
        handleClose();
        dispatch(
            placeToTopOfDeckFromField({
                card: name,
                index: index,
            })
        );
        dispatch(clearValuesAtIndex(index));
        dispatch(clearEngagedAtIndex(index));
        dispatch(clearCountersAtIndex(index));
        dispatch(clearStatusAtIndex(index));
    };
    const handleCardToBotDeck = () => {
        handleClose();
        dispatch(
            placeToBotOfDeckFromField({
                card: name,
                index: index,
            })
        );
        dispatch(clearValuesAtIndex(index));
        dispatch(clearEngagedAtIndex(index));
        dispatch(clearCountersAtIndex(index));
        dispatch(clearStatusAtIndex(index));
    };
    const handleRemoveTokenFromField = () => {
        handleClose();
        dispatch(
            removeTokenOnField({
                card: name,
                index: index,
            })
        );
        dispatch(clearValuesAtIndex(index));
        dispatch(clearEngagedAtIndex(index));
        dispatch(clearCountersAtIndex(index));
        dispatch(clearStatusAtIndex(index));
    };
    const handleDuplicateToken = () => {
        handleClose();
        setReady(true);
        setReadyToDuplicateOnField(true);
    };

    const handleCardToCemetery = () => {
        handleClose();
        dispatch(placeToCemeteryFromField({
            card: name,
            index: index,
        }));
        dispatch(clearValuesAtIndex(index));
        dispatch(clearEngagedAtIndex(index));
        dispatch(clearCountersAtIndex(index));
        dispatch(clearStatusAtIndex(index));
    };
    const handleCardToBanish = () => {
        handleClose();
        dispatch(
            placeToBanishFromField({
                card: name,
                index: index,
            })
        );
        dispatch(clearValuesAtIndex(index));
        dispatch(clearEngagedAtIndex(index));
        dispatch(clearCountersAtIndex(index));
        dispatch(clearStatusAtIndex(index));
    };

    const handleShowAtkDef = () => {
        handleClose();
        handleEvoClose();
        dispatch(showAtk(index));
        dispatch(showDef(index));
    };

    const handleHideAtkDef = () => {
        handleClose();
        handleEvoClose();
        dispatch(hideAtk(index));
        dispatch(hideDef(index));
    };

    const handleShowStatus = () => {
        // handleClose();
        // handleEvoClose();
        dispatch(showStatus(index));
    };

    const handleHideStatus = () => {
        // handleClose();
        // handleEvoClose();
        dispatch(hideStatus(index));
    };

    const handleAddCounter = () => {
        handleClose();
        handleEvoClose();
        dispatch(
            modifyCounter({
                value: 1,
                index: index,
            })
        );
    };

    const handleAddAura = () => {
        handleClose();
        handleEvoClose();
        dispatch(
            addAura({
                value: 1,
                index: index,
            })
        );
    };
    const handleRemoveAura = () => {
        handleClose();
        handleEvoClose();
        dispatch(
            addAura({
                value: 0,
                index: index,
            })
        );
        dispatch(hideStatus(index));
    };
    const handleAddBane = () => {
        handleClose();
        handleEvoClose();
        dispatch(
            addBane({
                value: 1,
                index: index,
            })
        );
    };
    const handleRemoveBane = () => {
        handleClose();
        handleEvoClose();
        dispatch(
            addBane({
                value: 0,
                index: index,
            })
        );
        dispatch(hideStatus(index));
    };
    const handleAddWard = () => {
        handleClose();
        handleEvoClose();
        dispatch(
            addWard({
                value: 1,
                index: index,
            })
        );
    };
    const handleRemoveWard = () => {
        handleClose();
        handleEvoClose();
        dispatch(
            addWard({
                value: 0,
                index: index,
            })
        );
        dispatch(hideStatus(index));
    };

    const handleMoveOnField = () => {
        handleClose();
        setReady(true);
        setReadyToMoveOnField(true);
    };
    const handleMoveEvoOnField = () => {
        handleEvoClose();
        setReady(true);
        setReadyToMoveEvoOnField(true);
    };

    const handleTransfer = () => {
        handleClose();
        dispatch(
            transferToOpponentField({
                card: name,
                prevIndex: index,
            })
        );
    };

    const handleReturnToEvolveDeck = () => {
        handleEvoClose();
        dispatch(
            backToEvolveDeck({
                card: name,
                index: index,
            })
        );
    };
    const handleReturnAdvancedToEvolveDeck = () => {
        handleClose();
        dispatch(
            advancedBackToEvolveDeck({
                card: name,
                index: index,
            })
        );
    };

    const handleSelectEnemyCardInHand = (idx) => {
        if (idx === reduxCardSelectedInHand) dispatch(setCardSelectedInHand(-1));
        else dispatch(setCardSelectedInHand(idx));
    };

    const handleSelectEnemyCardOnField = (idx) => {
        if (idx === reduxCardSelectedOnField) dispatch(setCardSelectedOnField(-1));
        else dispatch(setCardSelectedOnField(idx));
    };

    useEffect(() => {
        switch (reduxEnemyCardBack) {
            case "Aenea":
                setCardback(aeneaCardBack);
                break;
            case "Dionne":
                setCardback(dionneCardBack);
                break;
            case "Dragon":
                setCardback(dragonCardBack);
                break;
            case "Filene":
                setCardback(fileneCardBack);
                break;
            case "Galmieux":
                setCardback(galmieuxCardBack);
                break;
            case "Jeanne":
                setCardback(jeanneCardBack);
                break;
            case "Kuon":
                setCardback(kuonCardBack);
                break;
            case "Ladica":
                setCardback(ladicaCardBack);
                break;
            case "Lishenna":
                setCardback(lishennaCardBack);
                break;
            case "Lishenna2":
                setCardback(lishenna2CardBack);
                break;
            case "Mistolina":
                setCardback(mistolinaCardBack);
                break;
            case "Mono":
                setCardback(monoCardBack);
                break;
            case "Orchis":
                setCardback(orchisCardBack);
                break;
            case "Piercye":
                setCardback(piercyeCardBack);
                break;
            case "RoseQueen":
                setCardback(rosequeenCardBack);
                break;
            case "Shikigami":
                setCardback(shikiCardBack);
                break;
            case "Shuten":
                setCardback(shutenCardBack);
                break;
            case "TidalGunner":
                setCardback(tidalgunnerCardBack);
                break;
            case "Viridia":
                setCardback(viridiaCardBack);
                break;
            case "Wilbert":
                setCardback(wilbertCardBack);
                break;
            default:
                setCardback(defaultCardBack);
        }
    }, [reduxEnemyCardBack]);

    return (
        <>
            {/* Sync Recovery Buttons */}
            <div style={{
                position: "absolute",
                top: 10,
                right: 10,
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                zIndex: 1000
            }}>
                {/* Turn Status Display */}
                <div style={{
                    backgroundColor: reduxIsMyTurn ? "#4caf50" : "#f44336",
                    color: "white",
                    padding: "10px 15px",
                    borderRadius: "5px",
                    fontWeight: "bold",
                    textAlign: "center"
                }}>
                    {reduxIsMyTurn ? "🟢 YOUR TURN" : "🔴 OPPONENT'S TURN"}
                    <br />
                    Turn #{reduxTurnNumber}
                </div>

                {/* Turn Debug Log */}
                {turnDebugLog.length > 0 && (
                    <div style={{
                        backgroundColor: "rgba(0,0,0,0.8)",
                        color: "#0f0",
                        padding: "8px",
                        borderRadius: "5px",
                        fontSize: "10px",
                        fontFamily: "monospace",
                        maxWidth: "300px",
                        maxHeight: "100px",
                        overflow: "auto"
                    }}>
                        <div style={{ fontWeight: "bold", marginBottom: "4px" }}>Turn History:</div>
                        {turnDebugLog.map((log, i) => (
                            <div key={i}>{log}</div>
                        ))}
                    </div>
                )}

                {/* Sync Buttons */}
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <button
                        onClick={handleTestEndTurn}
                        disabled={!reduxIsMyTurn}
                        style={{
                            backgroundColor: reduxIsMyTurn ? "#2196f3" : "#666",
                            color: "white",
                            border: "none",
                            padding: "10px 15px",
                            borderRadius: "5px",
                            cursor: reduxIsMyTurn ? "pointer" : "not-allowed",
                            fontWeight: "bold"
                        }}
                        title="Test end turn (only works on your turn)"
                    >
                        🔚 End Turn (Test)
                    </button>

                    <button
                        onClick={handleManualDestroy}
                        style={{
                            backgroundColor: "#ff5722",
                            color: "white",
                            border: "none",
                            padding: "10px 15px",
                            borderRadius: "5px",
                            cursor: "pointer",
                            fontWeight: "bold"
                        }}
                        title="Test if destroy works locally"
                    >
                        🧪 Test Destroy (Pos 2)
                    </button>

                    <div style={{ display: "flex", gap: "5px" }}>
                        <button
                            onClick={handleForceTurn}
                            style={{
                                backgroundColor: "#9c27b0",
                                color: "white",
                                border: "none",
                                padding: "8px 12px",
                                borderRadius: "5px",
                                cursor: "pointer",
                                fontWeight: "bold",
                                fontSize: "12px"
                            }}
                            title="Force turn to be yours (emergency)"
                        >
                            ⚡ Force
                        </button>
                        <button
                            onClick={handleManualSync}
                            style={{
                                backgroundColor: "#ff9800",
                                color: "white",
                                border: "none",
                                padding: "8px 12px",
                                borderRadius: "5px",
                                cursor: "pointer",
                                fontWeight: "bold",
                                fontSize: "12px"
                            }}
                            title="Request full state sync from opponent"
                        >
                            🔄 Sync
                        </button>
                        <button
                            onClick={handleRollback}
                            style={{
                                backgroundColor: "#f44336",
                                color: "white",
                                border: "none",
                                padding: "8px 12px",
                                borderRadius: "5px",
                                cursor: "pointer",
                                fontWeight: "bold",
                                fontSize: "12px"
                            }}
                            title="Rollback to previous game state"
                        >
                            ⏪ Back
                        </button>
                    </div>
                </div>
            </div>

            <Tooltip title="Copy" placement="top">
                <div
                    style={{
                        backgroundColor: "black",
                        color: "white",
                        height: "40px",
                        minWidth: "150px",
                        position: "absolute",
                        fontSize: "20px ",
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: ".5em",
                        bottom: 3,
                        left: 0,
                        // pointerEvents: "auto",
                        cursor: "pointer",
                    }}
                    onClick={() => {
                        navigator.clipboard.writeText(reduxCurrentRoom);
                    }}
                >
                    <div>{reduxCurrentRoom}</div>

                    <ContentCopyIcon sx={{ fontSize: "20px" }} />
                </div>
            </Tooltip>
            <Menu
                open={contextMenu !== null}
                onClose={handleClose}
                anchorReference="anchorPosition"
                anchorPosition={
                    contextMenu !== null
                        ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                        : undefined
                }
            >
                {isAdvanced(name) && (
                    <MenuItem onClick={() => handleReturnAdvancedToEvolveDeck()}>
                        Return
                    </MenuItem>
                )}
                {isToken(name) && (
                    <MenuItem onClick={handleRemoveTokenFromField}>Remove</MenuItem>
                )}
                {isToken(name) && (
                    <MenuItem onClick={handleDuplicateToken}>Duplicate</MenuItem>
                )}
                {!isToken(name) && !isAdvanced(name) && (
                    <MenuItem onClick={handleCardToCemetery}>Cemetery</MenuItem>
                )}
                {!reduxCustomValues[index].showAtk && (
                    <MenuItem onClick={handleShowAtkDef}>Modify Atk/Def</MenuItem>
                )}
                {reduxCustomValues[index].showAtk && (
                    <MenuItem onClick={handleHideAtkDef}>Hide Atk/Def</MenuItem>
                )}
                {reduxCounterField[index] < 1 && (
                    <MenuItem onClick={handleAddCounter}>Add Counter</MenuItem>
                )}
                {!isToken(name) && !isAdvanced(name) && (
                    <MenuItem onClick={handleCardToHandFromField}>Hand</MenuItem>
                )}
                <MenuItem onClick={handleMoveOnField}>Move</MenuItem>
                {!isToken(name) && !isAdvanced(name) && (
                    <MenuItem onClick={handleCardToTopDeck}>Top of Deck</MenuItem>
                )}
                {!isToken(name) && !isAdvanced(name) && (
                    <MenuItem onClick={handleCardToBotDeck}>Bot of Deck</MenuItem>
                )}
                {!isToken(name) && !isAdvanced(name) && (
                    <MenuItem onClick={handleCardToBanish}>Banish</MenuItem>
                )}

                {!isToken(name) && !isAdvanced(name) && (
                    <MenuItem onClick={handleTransfer}>Transfer</MenuItem>
                )}
                {!reduxCustomStatus[index] && (
                    <MenuItem onClick={handleShowStatus}>Add Status</MenuItem>
                )}
                {reduxCustomStatus[index] && (
                    <MenuItem onClick={handleHideStatus}>Hide Status</MenuItem>
                )}
                {reduxAuraField[index] === 0 &&
                    reduxBaneField[index] === 0 &&
                    reduxWardField[index] === 0 &&
                    reduxCustomStatus[index] && (
                        <MenuItem onClick={handleAddAura}>Add Aura</MenuItem>
                    )}
                {reduxAuraField[index] === 0 &&
                    reduxBaneField[index] === 0 &&
                    reduxWardField[index] === 0 &&
                    reduxCustomStatus[index] && (
                        <MenuItem onClick={handleAddBane}>Add Bane</MenuItem>
                    )}
                {reduxAuraField[index] === 0 &&
                    reduxBaneField[index] === 0 &&
                    reduxWardField[index] === 0 &&
                    reduxCustomStatus[index] && (
                        <MenuItem onClick={handleAddWard}>Add Ward</MenuItem>
                    )}
                {reduxAuraField[index] === 1 && reduxCustomStatus[index] && (
                    <MenuItem onClick={handleRemoveAura}>Remove Aura</MenuItem>
                )}
                {reduxBaneField[index] === 1 && reduxCustomStatus[index] && (
                    <MenuItem onClick={handleRemoveBane}>Remove Bane</MenuItem>
                )}
                {reduxWardField[index] === 1 && reduxCustomStatus[index] && (
                    <MenuItem onClick={handleRemoveWard}>Remove Ward</MenuItem>
                )}
            </Menu>
            <Menu
                open={contextEvoMenu !== null}
                onClose={handleEvoClose}
                anchorReference="anchorPosition"
                anchorPosition={
                    contextEvoMenu !== null
                        ? { top: contextEvoMenu.mouseY, left: contextEvoMenu.mouseX }
                        : undefined
                }
            >
                <MenuItem onClick={() => handleReturnToEvolveDeck()}>Return</MenuItem>
                <MenuItem onClick={handleMoveEvoOnField}>Move</MenuItem>
                {!reduxCustomValues[index].showAtk && (
                    <MenuItem onClick={handleShowAtkDef}>Modify Atk/Def</MenuItem>
                )}
                {reduxCustomValues[index].showAtk && (
                    <MenuItem onClick={handleHideAtkDef}>Hide Atk/Def</MenuItem>
                )}
                {!reduxCustomStatus[index] && (
                    <MenuItem onClick={handleShowStatus}>Add Status</MenuItem>
                )}
                {reduxCustomStatus[index] && (
                    <MenuItem onClick={handleHideStatus}>Hide Status</MenuItem>
                )}
                {reduxCounterField[index] < 1 && reduxCustomStatus[index] && (
                    <MenuItem onClick={handleAddCounter}>Add Counter</MenuItem>
                )}
                {reduxAuraField[index] === 0 &&
                    reduxBaneField[index] === 0 &&
                    reduxWardField[index] === 0 &&
                    reduxCustomStatus[index] && (
                        <MenuItem onClick={handleAddAura}>Add Aura</MenuItem>
                    )}
                {reduxAuraField[index] === 0 &&
                    reduxBaneField[index] === 0 &&
                    reduxWardField[index] === 0 &&
                    reduxCustomStatus[index] && (
                        <MenuItem onClick={handleAddBane}>Add Bane</MenuItem>
                    )}
                {reduxAuraField[index] === 0 &&
                    reduxBaneField[index] === 0 &&
                    reduxWardField[index] === 0 &&
                    reduxCustomStatus[index] && (
                        <MenuItem onClick={handleAddWard}>Add Ward</MenuItem>
                    )}
                {reduxAuraField[index] === 1 && reduxCustomStatus[index] && (
                    <MenuItem onClick={handleRemoveAura}>Remove Aura</MenuItem>
                )}
                {reduxBaneField[index] === 1 && reduxCustomStatus[index] && (
                    <MenuItem onClick={handleRemoveBane}>Remove Bane</MenuItem>
                )}
                {reduxWardField[index] === 1 && reduxCustomStatus[index] && (
                    <MenuItem onClick={handleRemoveWard}>Remove Ward</MenuItem>
                )}
            </Menu>

            {/* Show Enemy Hand Modal */}

            <Modal
                open={reduxShowEnemyHand}
                onClose={handleModalClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                sx={{
                    "& > .MuiBackdrop-root": {
                        backgroundColor: "transparent",
                    },
                }}
            >
                <Box sx={style}>
                    <Typography
                        sx={{
                            color: "white",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            fontFamily: "Noto Serif JP, serif",
                            fontSize: "20px",
                        }}
                        id="modal-modal-title"
                        variant="h6"
                        component="h2"
                    >
                        Viewing Opponent's Hand
                    </Typography>
                    <CardMUI
                        sx={{
                            backgroundColor: "rgba(0, 0, 0, 0.7)",
                            minHeight: "250px",
                            padding: "3%",
                            width: "100%",
                            display: "flex",
                            flexDirection: "row",
                            flexWrap: "wrap",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                        variant="outlined"
                    >
                        {reduxEnemyHand.map((card, idx) => (
                            <div key={`card-${idx}`}>
                                <Card name={card} setHovering={setHovering} />
                            </div>
                        ))}
                    </CardMUI>
                </Box>
            </Modal>

            {/* Show Enemy Card Modal */}

            <Modal
                open={reduxShowEnemyCard}
                onClose={handleShowCardModalClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                sx={{
                    "& > .MuiBackdrop-root": {
                        backgroundColor: "transparent",
                    },
                }}
            >
                <Box
                    sx={{
                        position: "relative",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        backgroundColor: "transparent",
                        boxShadow: 24,
                        // p: 3,
                        width: 0,
                        border: "none",
                    }}
                >
                    <CardMUI
                        sx={{
                            backgroundColor: "transparent",
                            width: "100%",
                            // height: "80vh",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            border: "none",
                            overflow: "visible",
                        }}
                        variant="outlined"
                    >
                        <motion.div
                            initial={{ scale: 1.0, rotateY: 180 }}
                            transition={{ duration: 0.8 }}
                            animate={{ scale: 4.5, rotateY: 0 }}
                        // variants={{
                        //   start: {
                        //     scale: 4.5,
                        //     rotateY: [0, 360],
                        //     transition: {
                        //       duration: 0.8,
                        //       ease: "linear",
                        //     },
                        //   },
                        // }}
                        // animate={["start"]}
                        >
                            <img
                                className={"cardStyle"}
                                src={cardImage(reduxEnemyCard)}
                                alt={reduxEnemyCard}
                            />
                        </motion.div>
                    </CardMUI>
                </Box>
            </Modal>

            {/* Enemy */}
            <div
                style={{
                    // backgroundColor: "yellow",
                    display: "flex",
                    flexDirection: "row",
                    width: "100%",
                    minHeight: "130px",
                    justifyContent: "center",
                    alignItems: "center",
                    paddingBottom: "2em",
                    // marginTop: "-2em",
                    // zIndex: 100,
                }}
            >
                {reduxEnemyHand.map((_, idx) => (
                    <img
                        style={
                            reduxCardSelectedInHand === idx
                                ? {
                                    filter:
                                        "sepia() saturate(4) hue-rotate(315deg) brightness(100%) opacity(5)",
                                    cursor: `url(${img}) 55 55, auto`,
                                }
                                : { cursor: `url(${img}) 55 55, auto` }
                        }
                        key={idx}
                        className={"cardStyle"}
                        src={cardback}
                        alt={"cardback"}
                        onClick={() => handleSelectEnemyCardInHand(idx)}
                    />
                ))}
            </div>

            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    width: "100%",
                    minHeight: "330px",
                    alignItems: "end",
                }}
            >
                {/* Enemy Deck and Cemetery */}

                <div
                    style={{
                        height: "35vh",
                        minHeight: "330px",
                        width: "175px",
                        display: "flex",
                        flexDirection: "column",
                        // backgroundColor: "rgba(0, 0, 0, 0.60)",
                        // background: "linear-gradient(to bottom, #09203f 0%, #537895 100%)",
                        alignItems: "center",
                        justifyContent: "space-evenly",
                    }}
                >
                    <div style={{ position: "relative" }}>
                        <div
                        // style={{
                        //   cursor: `url(${img}) 55 55, auto`,
                        // }}
                        >
                            <img className={"cardStyle"} src={cardback} alt={"cardback"} />
                        </div>
                        {/* {showOpponentDeckSize && ( */}
                        <div
                            style={{
                                width: "50px",
                                position: "absolute",
                                backgroundColor: "rgba(0, 0, 0, 0.4)",
                                top: "5%",
                                right: "30%",
                                color: "rgba(255, 255, 255, 1)",
                                fontSize: "30px",
                                fontFamily: "Noto Serif JP, serif",
                            }}
                        >
                            {reduxEnemyDeckSize}
                        </div>
                        {/* )} */}
                    </div>

                    <EnemyCemetery setHovering={setHovering} ready={ready} />
                </div>

                {/* Enemy Field (1-5) & Ex Area (6-10) */}
                <div
                    style={{
                        height: "35vh",
                        minHeight: "330px",
                        minWidth: "600px",
                        width: "100%",
                        // backgroundColor: "black",
                        // backgroundColor: "#131219",
                        // backgroundColor: "rgba(0, 0, 0, 0.60)",
                        // background: "linear-gradient(to bottom, #09203f 0%, #537895 100%)",
                        display: "grid",
                        gridTemplateColumns: "repeat(5, 1fr)",
                        alignItems: "center",
                        justifyItems: "center",
                        // zIndex: 0,
                    }}
                >
                    {/* <span
            style={{
              fontFamily: "Noto Serif JP, serif",
              fontSize: "1.2em",
              color: "#E0FFFF",
              textShadow: "1px 1px 10px #E0FFFF, 1px 1px 10px #ccc",
              position: "absolute",
              top: "35%",
              width: "50px",
              pointerEvents: "none",
            }}
          >
            Field
          </span>
          <span
            style={{
              fontFamily: "Noto Serif JP, serif",
              fontSize: "1.2em",
              color: "#E0FFFF",
              textShadow: "1px 1px 10px #E0FFFF, 1px 1px 10px #ccc",
              position: "absolute",
              top: "18%",
              width: "100px",
              pointerEvents: "none",
            }}
          >
            EX Area
          </span> */}
                    {reduxField.map((x, idx) => (
                        <motion.div
                            key={`enemy1-${idx}`}
                            style={{
                                zIndex: 2,
                                // Combat mode: Show red border if valid target
                                border: combatMode && validTargets.includes(cardPos(idx)) && reduxEnemyField[cardPos(idx)] !== 0
                                    ? '4px solid #ff0000'
                                    : 'none',
                                borderRadius: '10px',
                                cursor: combatMode && validTargets.includes(cardPos(idx)) && reduxEnemyField[cardPos(idx)] !== 0
                                    ? 'crosshair'
                                    : 'default',
                            }}
                            className={"cardStyle"}
                            onClick={() => {
                                // In combat mode, clicking enemy card attacks it
                                if (combatMode && validTargets.includes(cardPos(idx))) {
                                    handleAttackTarget(cardPos(idx));
                                } else {
                                    handleSelectEnemyCardOnField(cardPos(idx));
                                }
                            }}
                        >
                            {reduxEnemyField[cardPos(idx)] !== 0 &&
                                reduxEnemyEvoField[cardPos(idx)] === 0 && (
                                    <Card
                                        atkVal={reduxEnemyCustomValues[cardPos(idx)].atk}
                                        defVal={reduxEnemyCustomValues[cardPos(idx)].def}
                                        showAtk={reduxEnemyCustomValues[cardPos(idx)].showAtk}
                                        showDef={reduxEnemyCustomValues[cardPos(idx)].showDef}
                                        engaged={reduxEnemyEngaged[cardPos(idx)]}
                                        counterVal={reduxEnemyCounterField[cardPos(idx)]}
                                        aura={reduxEnemyAuraField[cardPos(idx)]}
                                        bane={reduxEnemyBaneField[cardPos(idx)]}
                                        ward={reduxEnemyWardField[cardPos(idx)]}
                                        opponentField={true}
                                        onField={true}
                                        idx={idx}
                                        key={`enemy-card-${cardPos(idx)}`}
                                        name={reduxEnemyField[cardPos(idx)]}
                                        setHovering={setHovering}
                                        ready={ready}
                                    />
                                )}
                            {reduxEnemyEvoField[cardPos(idx)] !== 0 && (
                                <Card
                                    atkVal={reduxEnemyCustomValues[cardPos(idx)].atk}
                                    defVal={reduxEnemyCustomValues[cardPos(idx)].def}
                                    showAtk={reduxEnemyCustomValues[cardPos(idx)].showAtk}
                                    showDef={reduxEnemyCustomValues[cardPos(idx)].showDef}
                                    engaged={reduxEnemyEngaged[cardPos(idx)]}
                                    counterVal={reduxEnemyCounterField[cardPos(idx)]}
                                    aura={reduxEnemyAuraField[cardPos(idx)]}
                                    bane={reduxEnemyBaneField[cardPos(idx)]}
                                    ward={reduxEnemyWardField[cardPos(idx)]}
                                    opponentField={true}
                                    onField={true}
                                    idx={idx}
                                    key={`enemy-evo-${cardPos(idx)}`}
                                    name={reduxEnemyEvoField[cardPos(idx)]}
                                    setHovering={setHovering}
                                    ready={ready}
                                    cardBeneath={reduxEnemyField[cardPos(idx)]}
                                />
                            )}
                        </motion.div>
                    ))}
                </div>
                {/* Enemy Evolve Deck */}
                <div
                    style={{
                        height: "35vh",
                        minHeight: "330px",
                        width: "175px",
                        display: "flex",
                        flexDirection: "column",
                        // backgroundColor: "black",
                        // backgroundColor: "#131219",
                        // background: "linear-gradient(to bottom, #09203f 0%, #537895 100%)",
                        // backgroundColor: "rgba(0, 0, 0, 0.60)",
                        alignItems: "center",
                        justifyContent: "space-evenly",

                        // cursor: `url(${img}) 55 55, auto`,
                    }}
                >
                    <EnemyEvoDeck setHovering={setHovering} ready={ready} />
                </div>
            </div>

            {/* Player */}

            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    width: "100%",
                    minHeight: "330px",
                    cursor: ready && `url(${img}) 55 55, auto`,
                }}
            >
                {/* Player Evolve Deck */}
                <div
                    style={{
                        height: "35vh",
                        minHeight: "330px",
                        width: "175px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "space-evenly",
                    }}
                >
                    <EvoDeck
                        setReadyToEvo={setReadyToEvo}
                        setReadyToAdvanced={setReadyToAdvanced}
                        setReadyToFeed={setReadyToFeed}
                        setReadyToRide={setReadyToRide}
                        setReady={setReady}
                        setHovering={setHovering}
                        ready={ready}
                    />
                    <ShowDice />
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-evenly",
                            flexDirection: "row",
                            width: "100%",
                        }}
                    >
                        <Token
                            setReady={setReady}
                            setHovering={setHovering}
                            ready={ready}
                            setTokenReady={setTokenReady}
                        />
                        {/* <Lesson /> */}
                    </div>
                </div>
                {/* Player Field (1-5) & Ex Area (6-10) */}
                <div
                    style={{
                        height: "35vh",
                        minHeight: "330px",
                        minWidth: "600px",
                        width: "100%",
                        // backgroundColor: "black",
                        // backgroundColor: "#131219",
                        // backgroundColor: "rgba(0, 0, 0, 0.60)",
                        // padding: "2em",
                        // background: "linear-gradient(to top, #09203f 0%, #537895 100%)",
                        display: "grid",
                        gridTemplateColumns: "repeat(5, 1fr)",
                        alignItems: "center",
                        justifyItems: "center",
                        // zIndex: 0,
                    }}
                >
                    <span
                        style={{
                            fontFamily: "Noto Serif JP, serif",
                            fontSize: "1.2em",
                            color: "#E0FFFF",
                            textShadow: "1px 1px 10px #E0FFFF, 1px 1px 10px #ccc",
                            position: "absolute",
                            bottom: "45%",
                            width: "50px",
                            pointerEvents: "none",
                            zIndex: 0,
                        }}
                    >
                        Field
                    </span>
                    <span
                        style={{
                            fontFamily: "Noto Serif JP, serif",
                            fontSize: "1.2em",
                            color: "#E0FFFF",
                            textShadow: "1px 1px 10px #E0FFFF, 1px 1px 10px #ccc",
                            position: "absolute",
                            bottom: "28%",
                            width: "100px",
                            pointerEvents: "none",
                        }}
                    >
                        EX Area
                    </span>
                    {reduxField.map((card, idx) => (
                        <div style={{ zIndex: 2 }} key={`card-${idx}-${card}`}>
                            {ready && (
                                <motion.div
                                    onClick={() => {
                                        handleClick(reduxCurrentCard, idx);
                                    }}
                                    onContextMenu={() => {
                                        cancelClick();
                                    }}
                                    key={`player1-${idx}`}
                                    style={
                                        {
                                            // height: "160px",
                                            // width: "115px",
                                            // backgroundColor: "rgba(255, 255, 255, 0.1)",
                                            // backgroundColor: "#131219",
                                            // borderRadius: "10px",
                                        }
                                    }
                                    className={
                                        reduxField[idx] !== 0 &&
                                            reduxEvoField[idx] === 0 &&
                                            (readyToEvo || readyToFeed || readyToRide)
                                            ? "box"
                                            : reduxField[idx] === 0 &&
                                                !readyToEvo &&
                                                !readyToFeed &&
                                                !readyToRide
                                                ? "box"
                                                : "none"
                                    }
                                >
                                    {reduxField[idx] !== 0 && reduxEvoField[idx] === 0 && (
                                        <Card
                                            showAtk={reduxCustomValues[idx].showAtk}
                                            showDef={reduxCustomValues[idx].showDef}
                                            atkVal={reduxCustomValues[idx].atk}
                                            defVal={reduxCustomValues[idx].def}
                                            engaged={reduxEngaged[idx]}
                                            counterVal={reduxCounterField[idx]}
                                            aura={reduxAuraField[idx]}
                                            bane={reduxBaneField[idx]}
                                            ward={reduxWardField[idx]}
                                            idx={idx}
                                            onField={true}
                                            key={`card1-${idx}`}
                                            name={card}
                                            setHovering={setHovering}
                                            ready={ready}
                                        />
                                    )}
                                    {reduxEvoField[idx] !== 0 && (
                                        <Card
                                            showAtk={reduxCustomValues[idx].showAtk}
                                            showDef={reduxCustomValues[idx].showDef}
                                            atkVal={reduxCustomValues[idx].atk}
                                            defVal={reduxCustomValues[idx].def}
                                            engaged={reduxEngaged[idx]}
                                            counterVal={reduxCounterField[idx]}
                                            idx={idx}
                                            onField={true}
                                            key={`evo1-${idx}`}
                                            name={reduxEvoField[idx]}
                                            setHovering={setHovering}
                                            ready={ready}
                                            cardBeneath={reduxField[idx]}
                                        />
                                    )}
                                </motion.div>
                            )}
                            {!ready && (
                                <div
                                    onContextMenu={(e) => {
                                        if (reduxField[idx] !== 0 && reduxEvoField[idx] === 0)
                                            handleContextMenu(e, idx, reduxField[idx]);
                                        else if (reduxField[idx] !== 0)
                                            handleEvoContextMenu(e, idx, reduxEvoField[idx]);
                                    }}
                                    onDoubleClick={() => {
                                        // Double-click to attack
                                        if (reduxField[idx] !== 0 && reduxIsMyTurn) {
                                            handleAttackClick(idx);
                                        } else if (reduxField[idx] === 0) {
                                            alert("❌ No card here!");
                                        } else if (!reduxIsMyTurn) {
                                            alert("❌ Not your turn!");
                                        }
                                    }}
                                    key={`player2-${idx}`}
                                    style={{
                                        // Combat mode: Show green border if attacking card
                                        border: combatMode && attackingCard?.index === idx
                                            ? '4px solid #00ff00'
                                            : 'none',
                                        borderRadius: '10px',
                                        cursor: reduxField[idx] !== 0 && reduxIsMyTurn ? 'pointer' : 'default',
                                    }}
                                    className={"cardStyle"}
                                >
                                    {reduxField[idx] !== 0 && reduxEvoField[idx] === 0 && (
                                        <Card
                                            showAtk={reduxCustomValues[idx].showAtk}
                                            showDef={reduxCustomValues[idx].showDef}
                                            atkVal={reduxCustomValues[idx].atk}
                                            defVal={reduxCustomValues[idx].def}
                                            engaged={reduxEngaged[idx]}
                                            counterVal={reduxCounterField[idx]}
                                            aura={reduxAuraField[idx]}
                                            bane={reduxBaneField[idx]}
                                            ward={reduxWardField[idx]}
                                            idx={idx}
                                            onField={true}
                                            key={`card2-${idx}`}
                                            name={reduxField[idx]}
                                            setHovering={setHovering}
                                            ready={ready}
                                        />
                                    )}
                                    {reduxEvoField[idx] !== 0 && (
                                        <Card
                                            showAtk={reduxCustomValues[idx].showAtk}
                                            showDef={reduxCustomValues[idx].showDef}
                                            atkVal={reduxCustomValues[idx].atk}
                                            defVal={reduxCustomValues[idx].def}
                                            engaged={reduxEngaged[idx]}
                                            counterVal={reduxCounterField[idx]}
                                            aura={reduxAuraField[idx]}
                                            bane={reduxBaneField[idx]}
                                            ward={reduxWardField[idx]}
                                            idx={idx}
                                            onField={true}
                                            key={`evo2-${idx}`}
                                            name={reduxEvoField[idx]}
                                            setHovering={setHovering}
                                            ready={ready}
                                            cardBeneath={reduxField[idx]}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Player Deck and Cementery */}
                <div
                    style={{
                        height: "35vh",
                        minHeight: "330px",
                        width: "175px",
                        display: "flex",
                        flexDirection: "column",
                        // backgroundColor: "black",
                        // backgroundColor: "#131219",
                        zIndex: 0,
                        // background: "linear-gradient(to top, #09203f 0%, #537895 100%)",
                        // backgroundColor: "rgba(0, 0, 0, 0.60)",
                        alignItems: "center",
                        justifyContent: "space-evenly",
                        // cursor: `url(${img}) 55 55, auto`,
                    }}
                >
                    <Cemetery
                        setReadyFromCemetery={setReadyFromCemetery}
                        setReadyFromBanish={setReadyFromBanish}
                        setReady={setReady}
                        setHovering={setHovering}
                        ready={ready}
                    />
                    <div style={{ zIndex: -1, position: "relative" }}>
                        <Deck
                            setHovering={setHovering}
                            ready={ready}
                            setReadyFromDeck={setReadyFromDeck}
                            setReady={setReady}
                            setDeckIndex={setDeckIndex}
                        />
                        {/* {showOpponentDeckSize && ( */}
                        <div
                            style={{
                                position: "absolute",
                                width: "50px",
                                backgroundColor: "rgba(0, 0, 0, 0.4)",
                                top: "65%",
                                right: "27%",
                                color: "rgba(255, 255, 255, 1)",
                                fontSize: "30px",
                                fontFamily: "Noto Serif JP, serif",
                            }}
                        >
                            {reduxCurrentDeck.length || 0}
                        </div>
                        {/* )} */}
                    </div>
                </div>
            </div>
        </>
    );
}