# 🎮 Shadowverse Evolve - Hearthstone-Style Implementation Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Detailed Setup](#detailed-setup)
4. [Testing the System](#testing)
5. [Customization](#customization)
6. [Troubleshooting](#troubleshooting)

---

## Overview

This implementation transforms your Shadowverse client into a Hearthstone-like rules-enforced game with:
- ✅ Automatic turn management
- ✅ Automatic play point refresh
- ✅ Cost validation when playing cards
- ✅ Server-side validation (optional)
- ✅ Visual turn indicators
- ✅ Temporary & permanent play point bonuses

## Quick Start

### Minimum Changes (Client-Side Only)

**Step 1**: Update `src/redux/store.js`
```javascript
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import DeckReducer from "./DeckSlice";
import ImprovedGameReducer from "./ImprovedGameSlice"; // ADD THIS

const gamePersistConfig = {
  key: "game",
  storage,
  blacklist: ["gameLog", "chatLog"],
};

export const store = configureStore({
  reducer: {
    deck: DeckReducer,
    game: persistReducer(gamePersistConfig, ImprovedGameReducer), // CHANGE THIS LINE
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);
```

**Step 2**: Update `src/pages/Game.js`
```javascript
// At top of file
import ImprovedPlayPoints from "../components/ui/ImprovedPlayPoints";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { receiveTurnStart, receiveTurnEnd } from "../redux/ImprovedGameSlice";
import { socket } from "../sockets";

// In component
export default function Game() {
  const dispatch = useDispatch();

  // Add socket listener for turn management
  useEffect(() => {
    socket.on("receive msg", (data) => {
      if (data.type === "turnEnd") {
        dispatch(receiveTurnStart({ turnNumber: data.turnNumber || 1 }));
      }
      if (data.type === "turnStart") {
        dispatch(receiveTurnEnd());
      }
    });

    return () => {
      socket.off("receive msg");
    };
  }, [dispatch]);

  // ... rest of component

  return (
    <div className="canvas">
      <div className="leftSideCanvas">
        {/* Replace PlayPoints with ImprovedPlayPoints */}
        <ImprovedPlayPoints name={selectedOption} />
      </div>
      {/* ... rest of JSX */}
    </div>
  );
}
```

**Step 3**: Update Hand component to use new card playing logic

In `src/components/hand/Hand.js`, update the card placement logic:
```javascript
import { useDispatch, useSelector } from "react-redux";
import { playCardFromHandToField } from "../../redux/ImprovedGameSlice";

// In component
const dispatch = useDispatch();
const isMyTurn = useSelector((state) => state.game.isMyTurn);

const handleCardPlace = (card, handIndex, fieldIndex) => {
  if (!isMyTurn) {
    console.warn("Not your turn!");
    return;
  }

  dispatch(playCardFromHandToField({
    card,
    handIndex,
    fieldIndex
  }));
};
```

**Step 4**: Test!
```bash
npm start
```

---

## Detailed Setup

### 1. Adding Card Costs

Edit `src/utils/cardDatabase.js` and add all your cards:

```javascript
export const cardCosts = {
  "Card Name Here": { cost: 5, type: "follower" },
  "Another Card": { cost: 3, type: "spell" },
  "Cheap Card": { cost: 1, type: "follower" },
  "Free Token": { cost: 0, type: "follower" },
  // ... add all cards
};
```

**Tips for adding cards**:
- Use exact card names from your AllCards.js
- Types: "follower", "spell", "amulet"
- Cost range: 0-10
- Free tokens should have cost: 0

### 2. Setting Up First Player

Add to your game initialization (e.g., when match starts):

```javascript
import { setFirstPlayer, startTurn } from "../redux/ImprovedGameSlice";

// Determine first player (coin flip, matchmaking, etc.)
const amIFirst = Math.random() < 0.5;
dispatch(setFirstPlayer(amIFirst ? 'player' : 'opponent'));

if (amIFirst) {
  dispatch(startTurn());
}
```

### 3. Handling Card Effects

For cards that give extra play points:

```javascript
import { addTempPlayPoints, addPermanentPlayPoints } from "../redux/ImprovedGameSlice";

// Temporary mana (like The Coin in Hearthstone)
dispatch(addTempPlayPoints(1));

// Permanent mana (like Wild Growth)
dispatch(addPermanentPlayPoints(1));
```

### 4. Server Setup (Optional but Recommended)

**Deploy the server**:

```bash
cd server
npm install
npm start
```

**For production (Render, Glitch, etc.)**:
1. Create new Node.js project on hosting platform
2. Upload `server/` directory
3. Set start command: `node index.js`
4. Note the deployed URL

**Update client to use new server**:

Edit `src/sockets.js`:
```javascript
export const socket = io("YOUR_SERVER_URL", {
  transports: ["websocket"],
});
```

---

## Testing

### Test Checklist

#### Basic Turn System
- [ ] First player determined correctly
- [ ] Turn indicator shows correct player
- [ ] Can only perform actions during own turn
- [ ] Turn transitions when "END TURN" clicked
- [ ] Turn counter increments

#### Play Points
- [ ] Start at 0/0
- [ ] Automatically refresh to 1/1 on first turn
- [ ] Increase by 1 each turn (max 10)
- [ ] Display shows correct available/max
- [ ] Visual crystals fill/empty correctly

#### Card Playing
- [ ] Cards can be played when enough points
- [ ] Cards blocked when insufficient points
- [ ] Cost automatically deducted
- [ ] Display updates immediately
- [ ] Opponent notified of play

#### Special Cases
- [ ] Temporary play points work
- [ ] Permanent play point increases work
- [ ] Temp points reset at end of turn
- [ ] Game log shows all actions
- [ ] Reconnection preserves state

### Testing Setup

**Two-Window Test**:
1. Open game in two browser windows
2. Use different accounts/incognito
3. Start a match between windows
4. Test all features above

**Debug Tools**:
- Redux DevTools - Monitor state changes
- Browser Console - Check for errors
- Network Tab - Verify socket messages

---

## Customization

### Change Starting Health
Edit `src/redux/ImprovedGameSlice.js`:
```javascript
initialState: {
  playerHealth: 30, // Change from 20
  enemyHealth: 30,
  // ...
}
```

### Change Max Play Points
Edit `src/utils/gameRules.js`:
```javascript
static calculateNewTurnPlayPoints(currentMax) {
  const newMax = Math.min(currentMax + 1, 15); // Change from 10
  return { available: newMax, max: newMax };
}
```

### Add Turn Timer
Add to `ImprovedGameSlice.js`:
```javascript
// In startTurn reducer
state.turnStartTime = Date.now();
state.turnTimeLimit = 90000; // 90 seconds

// Add timer check
setTimeout(() => {
  if (state.isMyTurn) {
    dispatch(endTurn()); // Auto-end after time limit
  }
}, state.turnTimeLimit);
```

### Custom Visual Styles
Edit `src/css/PlayPoints.css` or inline styles in `ImprovedPlayPoints.js`:
```javascript
style={{
  backgroundColor: isMyTurn ? "rgba(0, 255, 0, 0.3)" : "rgba(255, 0, 0, 0.3)",
  border: isMyTurn ? "3px solid lime" : "3px solid red",
  // ... custom styles
}}
```

---

## Troubleshooting

### Issue: "Not your turn" constantly
**Cause**: Turn state not synchronized
**Fix**:
1. Check socket connection is stable
2. Verify `receiveTurnStart` is being dispatched
3. Check Redux state: `store.getState().game.isMyTurn`
4. Ensure both players joined same room

### Issue: Play points not refreshing
**Cause**: `startTurn` not being called
**Fix**:
1. Check socket listener is active
2. Verify `dispatch(receiveTurnStart())` on turn receive
3. Check Redux DevTools for action dispatch
4. Add console.log to verify events firing

### Issue: Card costs showing as 0
**Cause**: Card not in database
**Fix**:
1. Add card to `src/utils/cardDatabase.js`
2. Ensure exact name match (case-sensitive)
3. Check console for warnings about missing cards
4. Add default fallback cost if needed

### Issue: Opponent can't see my actions
**Cause**: Socket not emitting properly
**Fix**:
1. Check network tab for socket messages
2. Verify `room` is set in Redux state
3. Ensure both players in same room
4. Check server logs for errors

### Issue: Game crashes on turn transition
**Cause**: Redux state corruption or missing data
**Fix**:
1. Check browser console for errors
2. Verify Redux state structure matches slice
3. Reset Redux persist: `localStorage.clear()`
4. Check socket event handlers for errors

### Issue: Cards can be played with insufficient points
**Cause**: Validation not running
**Fix**:
1. Verify you're using `playCardFromHandToField` action
2. Check `canAffordCard` logic in gameRules.js
3. Ensure card costs are in database
4. Add console.log to validation function

---

## Advanced Features

### Replay System
Store all actions in an array for replay:
```javascript
// In slice
state.actionHistory = [];

// On each action
state.actionHistory.push({
  type: 'playCard',
  timestamp: Date.now(),
  data: { card, handIndex, fieldIndex }
});
```

### Spectator Mode
Allow viewing without participating:
```javascript
socket.emit('spectate_game', { room });

socket.on('game_state_update', (state) => {
  // Update view-only state
  dispatch(setSpectatorState(state));
});
```

### AI Opponent
Create simple AI that follows rules:
```javascript
// AI makes decisions based on game state
function aiTakeTurn(gameState) {
  // Simple: play cheapest affordable card
  const affordableCards = gameState.hand.filter(card => 
    getCardCost(card) <= gameState.playPoints.available
  );
  
  if (affordableCards.length > 0) {
    const cardToPlay = affordableCards[0];
    const emptySlot = gameState.field.findIndex(slot => slot === 0);
    return { action: 'playCard', card: cardToPlay, slot: emptySlot };
  }
  
  return { action: 'endTurn' };
}
```

---

## Performance Tips

1. **Debounce rapid actions**: Prevent spam clicking
2. **Lazy load card images**: Only load visible cards
3. **Optimize Redux updates**: Use immer for immutable updates
4. **Cache card costs**: Don't recompute on every check
5. **Batch socket emissions**: Combine multiple updates

---

## Next Steps

Once basic system is working:
1. ✅ Populate full card database with all cards
2. ✅ Add card effect handlers for special abilities
3. ✅ Implement advanced game rules (evolutions, etc.)
4. ✅ Add matchmaking system
5. ✅ Create tournament support
6. ✅ Add replay/spectator features
7. ✅ Optimize performance
8. ✅ Add analytics/statistics

---

## Support

Need help? Check these resources:
- `RULES_SYSTEM_README.md` - Feature overview
- Redux DevTools - State debugging
- Browser Console - Error messages
- Network Tab - Socket messages
- Server logs - Backend issues

**Common Commands**:
```bash
# Start client
npm start

# Start server
cd server && npm start

# Clear Redux cache
localStorage.clear() # In browser console

# Check Redux state
store.getState() # In browser console
```

---

**Happy Gaming!** 🎮

If you have questions or issues, check the troubleshooting section or reach out!
