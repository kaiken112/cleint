/**
 * Improved Game Slice with Turn Management
 * This adds turn-based rules and automatic play point management
 */

import { createSlice } from "@reduxjs/toolkit";
import { socket } from "../sockets";
import { GameRules } from "../utils/gameRules";
import { getCardCost } from "../utils/cardDatabase";

// Helper to create log entry
const createLogEntry = (text, card = null) => {
  const date = new Date().toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return card 
    ? { text: `[${date}] (Me): ${text}`, card }
    : { text: `[${date}] (Me): ${text}` };
};

// Helper to emit socket message
const emitUpdate = (type, data, room) => {
  socket.emit("send msg", { type, data, room });
};

export const ImprovedCardSlice = createSlice({
  name: "game",
  initialState: {
    // Turn management
    isMyTurn: false,
    turnNumber: 0,
    firstPlayer: null, // 'player' or 'opponent'
    
    // Player state
    playPoints: { available: 0, max: 0 },
    tempPlayPoints: 0, // For card effects that give temporary mana
    playerHealth: 20,
    evoPoints: 0,
    
    // Opponent state  
    enemyPlayPoints: { available: 0, max: 0 },
    enemyHealth: 20,
    enemyEvoPoints: 0,
    
    // Game state (keep existing structure for compatibility)
    deck: [],
    evoDeck: [],
    initialDeck: [],
    initialEvoDeck: [],
    hand: [],
    enemyHand: [],
    field: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    evoField: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    enemyField: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    enemyEvoField: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    cardPlayedTurn: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Track when cards were played (for summoning sickness)
    cemetery: [],
    enemyCemetery: [],
    banish: [],
    enemyBanish: [],
    
    // UI state
    cardback: "",
    enemyCardback: "",
    leader: "",
    enemyLeader: "",
    leaderActive: false,
    enemyLeaderActive: false,
    currentCard: "",
    currentCardIndex: -1,
    
    // Logs
    gameLog: [],
    chatLog: [],
    
    // Connection
    room: "",
    enemyOnlineStatus: true,
    activeUsers: 0,
    
    // ... keep other existing state for compatibility
  },
  
  reducers: {
    /**
     * START TURN - Called when it becomes player's turn
     * Automatically refreshes play points and sets turn active
     */
    startTurn: (state) => {
      if (!state.isMyTurn) {
        state.isMyTurn = true;
        state.turnNumber += 1;
        
        // Automatically refresh play points
        const newPlayPoints = GameRules.calculateNewTurnPlayPoints(state.playPoints.max);
        state.playPoints = newPlayPoints;
        state.tempPlayPoints = 0; // Reset temp mana
        
        // Log turn start
        state.gameLog.push(createLogEntry(`Turn ${state.turnNumber} started`));
        
        // DON'T emit here - this is called when YOU manually start your turn
        // The opponent already knows you're starting because they clicked "End Turn"
      }
    },
    
    /**
     * END TURN - Called when player ends their turn
     * Automatically transitions turn to opponent
     */
    endTurn: (state) => {
      console.log(`🔍 END TURN - isMyTurn: ${state.isMyTurn}, turnNumber: ${state.turnNumber}, room: ${state.room}`);
      
      if (state.isMyTurn) {
        state.isMyTurn = false;
        state.leaderActive = false;
        state.tempPlayPoints = 0;
        
        // Log turn end
        state.gameLog.push(createLogEntry("Turn ended"));
        
        console.log(`📤 SENDING turnStart to room ${state.room}, turnNumber: ${state.turnNumber}`);
        
        // Notify opponent to START their turn (not just end)
        emitUpdate("turnStart", { 
          turnNumber: state.turnNumber
        }, state.room);
      } else {
        console.warn("⚠️ Can't end turn - not your turn!");
      }
    },
    
    /**
     * RECEIVE TURN START - Called when opponent ends their turn
     */
    receiveTurnStart: (state, action) => {
      // Calculate the NEXT turn number
      const nextTurnNumber = (action.payload?.turnNumber || state.turnNumber) + 1;
      
      console.log(`📥 RECEIVED turnStart - opponent turn: ${action.payload?.turnNumber}, my next turn: ${nextTurnNumber}, room: ${state.room}`);
      
      state.isMyTurn = true;
      state.turnNumber = nextTurnNumber; // INCREMENT the turn number!
      
      // Automatically refresh play points
      const newPlayPoints = GameRules.calculateNewTurnPlayPoints(state.playPoints.max);
      state.playPoints = newPlayPoints;
      state.tempPlayPoints = 0;
      
      // Add to game log with special marker so user can see it happened
      state.gameLog.push(createLogEntry(`✨ YOUR TURN! (Turn ${state.turnNumber})  ✨`));
    },
    
    /**
     * RECEIVE TURN END - Called when opponent starts their turn
     */
    receiveTurnEnd: (state) => {
      state.isMyTurn = false;
      state.enemyLeaderActive = true;
      
      state.gameLog.push({
        text: `[${new Date().toLocaleTimeString("it-IT", {
          hour: "2-digit",
          minute: "2-digit",
        })}] (Player 2): Turn started`,
      });
    },
    
    /**
     * PLAY CARD FROM HAND - With automatic cost deduction
     */
    playCardFromHandToField: (state, action) => {
      const { card, handIndex, fieldIndex } = action.payload;
      
      // Validate action
      if (!state.isMyTurn) {
        console.warn("Cannot play card: Not your turn");
        return;
      }
      
      const validation = GameRules.canPlayCardFromHand(
        card,
        state.playPoints.available + state.tempPlayPoints,
        state.isMyTurn
      );
      
      if (!validation.allowed) {
        console.warn(`Cannot play card: ${validation.reason}`);
        // Could dispatch a notification action here
        return;
      }
      
      const validation2 = GameRules.canPlaceCardOnField(
        state.field,
        fieldIndex,
        state.isMyTurn
      );
      
      if (!validation2.allowed) {
        console.warn(`Cannot place card: ${validation2.reason}`);
        return;
      }
      
      // Remove from hand
      state.hand = state.hand.filter((_, i) => i !== handIndex);
      
      // Place on field
      state.field[fieldIndex] = card;
      
      // Deduct cost
      const cost = getCardCost(card);
      const totalAvailable = state.playPoints.available + state.tempPlayPoints;
      
      if (cost <= state.tempPlayPoints) {
        state.tempPlayPoints -= cost;
      } else {
        const remainingCost = cost - state.tempPlayPoints;
        state.tempPlayPoints = 0;
        state.playPoints.available -= remainingCost;
      }
      
      // Log
      state.gameLog.push(createLogEntry(
        `Played ${card} (Cost: ${cost})`,
        card
      ));
      
      // Notify opponent
      emitUpdate("playCard", {
        hand: state.hand,
        field: state.field,
        playPoints: state.playPoints,
        log: { text: `Played a card (Cost: ${cost})`, card }
      }, state.room);
    },
    
    /**
     * ADD TEMPORARY PLAY POINTS - For card effects
     */
    addTempPlayPoints: (state, action) => {
      const amount = action.payload;
      state.tempPlayPoints += amount;
      
      state.gameLog.push(createLogEntry(
        `Gained ${amount} temporary play point${amount > 1 ? 's' : ''}`
      ));
      
      emitUpdate("playPointsChange", {
        playPoints: state.playPoints,
        tempPlayPoints: state.tempPlayPoints
      }, state.room);
    },
    
    /**
     * SET TEMPORARY PLAY POINTS - Direct setter for middleware
     */
    setTempPlayPoints: (state, action) => {
      state.tempPlayPoints = action.payload;
    },
    
    /**
     * ADD PERMANENT PLAY POINTS - For card effects that give permanent mana
     */
    addPermanentPlayPoints: (state, action) => {
      const amount = action.payload;
      const newMax = Math.min(state.playPoints.max + amount, 10);
      state.playPoints.max = newMax;
      state.playPoints.available = Math.min(
        state.playPoints.available + amount,
        newMax
      );
      
      state.gameLog.push(createLogEntry(
        `Gained ${amount} permanent play point${amount > 1 ? 's' : ''}`
      ));
      
      emitUpdate("playPointsChange", {
        playPoints: state.playPoints
      }, state.room);
    },
    
    /**
     * MANUAL PLAY POINT ADJUSTMENT - For special cases only
     * This should be rarely used in a rules-enforced system
     */
    manualSetPlayPoints: (state, action) => {
      state.playPoints = action.payload;
      emitUpdate("playPoints", state.playPoints, state.room);
    },
    
    /**
     * SET FIRST PLAYER - Determines who goes first
     */
    setFirstPlayer: (state, action) => {
      state.firstPlayer = action.payload; // 'player' or 'opponent'
      state.isMyTurn = action.payload === 'player';
      
      if (state.isMyTurn) {
        state.gameLog.push(createLogEntry("You go first!"));
      } else {
        state.gameLog.push(createLogEntry("Opponent goes first"));
      }
    },
    
    // Keep existing reducers for compatibility...
    setRoom: (state, action) => {
      state.room = action.payload;
    },
    
    setDeck: (state, action) => {
      state.deck = action.payload;
      state.initialDeck = action.payload;
    },
    
    drawFromDeck: (state) => {
      if (!state.isMyTurn) {
        console.warn("Cannot draw: Not your turn");
        return;
      }
      
      if (state.deck.length > 0) {
        const card = state.deck[0];
        state.deck = state.deck.slice(1);
        state.hand = [...state.hand, card];
        
        state.gameLog.push(createLogEntry(`Drew ${card}`, card));
        
        emitUpdate("draw", {
          hand: state.hand,
          deckSize: state.deck.length,
          log: { text: "Drew 1 card" }
        }, state.room);
      }
    },
    
    // Update enemy play points when received
    setEnemyPlayPoints: (state, action) => {
      state.enemyPlayPoints = action.payload;
    },
    
    // Set card played turn (for summoning sickness)
    setCardPlayedTurn: (state, action) => {
      state.cardPlayedTurn = action.payload;
    },
    
    // Health management
    setPlayerHealth: (state, action) => {
      state.playerHealth = action.payload;
      emitUpdate("playerHealth", action.payload, state.room);
    },
    
    setEnemyHealth: (state, action) => {
      state.enemyHealth = action.payload;
    },
    
    // ... include other essential reducers from original CardSlice
  }
});

export const {
  startTurn,
  endTurn,
  receiveTurnStart,
  receiveTurnEnd,
  playCardFromHandToField,
  addTempPlayPoints,
  setTempPlayPoints,
  addPermanentPlayPoints,
  manualSetPlayPoints,
  setFirstPlayer,
  setRoom,
  setDeck,
  drawFromDeck,
  setEnemyPlayPoints,
  setCardPlayedTurn,
  setPlayerHealth,
  setEnemyHealth,
} = ImprovedCardSlice.actions;

export default ImprovedCardSlice.reducer;
