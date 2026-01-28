# Shadowverse Evolve - Hearthstone-Style Rules System

## Overview
This update transforms the Shadowverse client from an honor-system simulator into a rules-enforced game similar to Hearthstone, with automatic turn management, play point tracking, and cost validation.

## 🎮 Key Features

### 1. **Turn-Based System**
- Only the active player can perform actions
- Automatic turn transitions between players
- Visual indicator showing whose turn it is
- Turn counter tracking game progress

### 2. **Automatic Play Point Management**
- Play points automatically refresh at the start of each turn
- Maximum play points increase by 1 each turn (up to 10)
- Card costs are automatically deducted when played
- Support for temporary play points (from card effects)
- Support for permanent play point increases (from card effects)

### 3. **Cost Validation**
- Cards cannot be played without sufficient play points
- Visual feedback when actions are blocked
- Cost information displayed in game log
- Card database tracks all card costs

### 4. **Rule Enforcement**
- Players cannot take actions during opponent's turn
- Field positions must be empty to place cards
- All game rules validated before actions execute
- Server-side validation (when using improved server)

## 📁 New Files Created

### Core Systems
- `src/utils/cardDatabase.js` - Card costs and metadata
- `src/utils/gameRules.js` - Game rules engine
- `src/redux/ImprovedGameSlice.js` - Turn-based game state management
- `src/components/ui/ImprovedPlayPoints.js` - New play points UI component

### Server (Optional)
- `server/` - New Node.js server with game state validation

## 🚀 How to Use

### Option 1: Quick Start (Use Improved Client Only)
This works with the existing server but adds client-side validation:

1. **Update Redux Store** (`src/redux/store.js`):
```javascript
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import DeckReducer from "./DeckSlice";
import ImprovedGameReducer from "./ImprovedGameSlice"; // NEW

const gamePersistConfig = {
  key: "game",
  storage,
  blacklist: ["gameLog", "chatLog"], // Don't persist logs
};

export const store = configureStore({
  reducer: {
    deck: DeckReducer,
    game: persistReducer(gamePersistConfig, ImprovedGameReducer), // CHANGED
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

2. **Update Game Component** (`src/pages/Game.js`):
```javascript
import ImprovedPlayPoints from "../components/ui/ImprovedPlayPoints";

// Replace <PlayPoints /> with:
<ImprovedPlayPoints name={selectedOption} />
```

3. **Handle Socket Events** - Add to your Game component or create a socket handler:
```javascript
useEffect(() => {
  // Listen for opponent turn end
  socket.on("receive msg", (data) => {
    if (data.type === "turnEnd") {
      dispatch(receiveTurnStart({ turnNumber: data.turnNumber }));
    }
    if (data.type === "turnStart") {
      dispatch(receiveTurnEnd());
    }
    // ... handle other events
  });
}, []);
```

### Option 2: Full System (With New Server)
For complete server-side validation:

1. Follow Option 1 steps
2. Deploy the new server (see `server/README.md`)
3. Update `src/sockets.js` to point to your new server
4. Server will validate all actions and maintain authoritative game state

## 🎯 How It Works

### Turn Flow
```
1. Game starts → Coin flip determines first player
2. First player's turn begins
   - Play points automatically set to 1
   - Player can play cards, attack, use abilities
3. Player clicks "END TURN"
   - Turn transitions to opponent
   - Opponent's play points automatically refresh
4. Repeat until game ends
```

### Playing Cards
```
1. Player drags card from hand to field
2. System checks:
   - Is it player's turn?
   - Is field position empty?
   - Does player have enough play points?
3. If valid:
   - Card placed on field
   - Cost automatically deducted
   - Game log updated
   - Opponent notified
4. If invalid:
   - Action blocked
   - Reason displayed to player
```

### Play Point System
- **Base**: Increases by 1 each turn (max 10)
- **Temporary**: From card effects, resets at end of turn
- **Permanent**: From card effects, persists

## 🛠️ Customization

### Adding Card Costs
Edit `src/utils/cardDatabase.js`:

```javascript
export const cardCosts = {
  "Your Card Name": { cost: 5, type: "follower" },
  "Another Card": { cost: 3, type: "spell" },
  // Add all your cards here
};
```

### Modifying Game Rules
Edit `src/utils/gameRules.js` to change:
- Starting health
- Max play points
- Turn timer duration
- Victory conditions

### Custom Card Effects
Use the new actions for card effects:

```javascript
// Give temporary play points
dispatch(addTempPlayPoints(2));

// Give permanent play points
dispatch(addPermanentPlayPoints(1));

// Draw cards
dispatch(drawFromDeck());
```

## 🐛 Troubleshooting

### "Not your turn" errors
- Make sure socket events are properly connected
- Check that `receiveTurnStart` and `receiveTurnEnd` are dispatched
- Verify `isMyTurn` state in Redux DevTools

### Play points not refreshing
- Ensure `startTurn` action is dispatched at turn start
- Check that turn transitions are working
- Verify socket connection is stable

### Card costs showing as 0
- Add card to `cardDatabase.js`
- Check card name matches exactly
- Fallback to 0 for unknown cards (by design)

## 📊 Testing Checklist

- [ ] Turns alternate correctly between players
- [ ] Play points refresh automatically each turn
- [ ] Cards cannot be played without sufficient points
- [ ] Cost is deducted when cards are played
- [ ] Actions blocked during opponent's turn
- [ ] Temporary play points reset at end of turn
- [ ] Game log shows all actions correctly
- [ ] Socket synchronization works
- [ ] Reconnection handles game state properly

## 🔄 Migration from Old System

The improved system maintains compatibility with the existing codebase. You can:

1. **Gradual Migration**: Use both systems simultaneously
2. **Keep Old UI**: Old components still work with compatibility layer
3. **Selective Features**: Enable only the features you want

To revert to the old system, simply use the original `CardSlice` and `PlayPoints` components.

## 📝 Notes

### Current Limitations
- Card database needs to be manually populated with all card costs
- Some advanced card effects may need custom handlers
- Server validation requires deploying new server component

### Future Enhancements
- Automated card cost extraction from card images
- More sophisticated card effect system
- Replay system
- Spectator mode
- Tournament support

## 💡 Tips

1. **Start Simple**: Get basic turn system working first, then add card costs
2. **Test Thoroughly**: Test with two browser windows simulating both players
3. **Use Redux DevTools**: Monitor state changes to debug issues
4. **Check Network Tab**: Verify socket messages are being sent/received
5. **Read Game Log**: All actions are logged for debugging

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify Redux state in DevTools
3. Check socket connection status
4. Review game log for clues
5. Test with simplified deck (fewer card types)

---

**Version**: 1.0.0  
**Author**: Kai + Claude  
**Last Updated**: January 2026
