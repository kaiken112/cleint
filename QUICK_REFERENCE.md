# 🎮 Quick Reference Card

## Essential Commands

### Starting Development
```bash
npm start                    # Start client
cd server && npm start       # Start server (optional)
```

### Debugging
```javascript
// In browser console
store.getState()             # Check Redux state
store.getState().game.isMyTurn    # Check if your turn
localStorage.clear()         # Reset Redux persist
```

## Key Files to Edit

| Task | File | What to Change |
|------|------|----------------|
| Add card costs | `src/utils/cardDatabase.js` | Add card entries |
| Change game rules | `src/utils/gameRules.js` | Modify rule functions |
| Update UI | `src/components/ui/ImprovedPlayPoints.js` | Change component |
| Wire up components | `src/pages/Game.js` | Add socket listeners |
| Deploy server | `server/index.js` | Deploy to hosting |

## Quick Actions

### Playing a Card
```javascript
dispatch(playCardFromHandToField({
  card: "Card Name",
  handIndex: 0,
  fieldIndex: 2
}));
```

### Ending Turn
```javascript
dispatch(endTurn());
```

### Drawing Card
```javascript
dispatch(drawFromDeck());
```

### Card Effects
```javascript
// Temporary mana
dispatch(addTempPlayPoints(1));

// Permanent mana
dispatch(addPermanentPlayPoints(1));
```

## Testing Checklist

- [ ] Turn indicator shows correctly
- [ ] Can only act on my turn
- [ ] Play points refresh each turn
- [ ] Cards cost correct amount
- [ ] Can't play without enough mana
- [ ] Opponent sees my actions
- [ ] Game log updates properly

## Common Redux State Paths

```javascript
state.game.isMyTurn              // Am I active?
state.game.turnNumber            // Current turn
state.game.playPoints.available  // Current mana
state.game.playPoints.max        // Max mana
state.game.tempPlayPoints        // Temporary mana
state.game.hand                  // Cards in hand
state.game.field                 // Cards on field
state.game.room                  // Game room ID
```

## Socket Events to Handle

```javascript
socket.on("receive msg", (data) => {
  switch (data.type) {
    case "turnEnd":        // Opponent ended turn
    case "turnStart":      // Opponent started turn
    case "playCard":       // Opponent played card
    case "drawCard":       // Opponent drew card
    case "playPoints":     // Play points updated
    case "field":          // Field updated
  }
});
```

## Troubleshooting Quick Fixes

| Problem | Quick Fix |
|---------|-----------|
| Not my turn | Check `isMyTurn` in Redux |
| No play points | Dispatch `startTurn()` |
| Cards cost 0 | Add to `cardDatabase.js` |
| Opponent can't see | Check socket connection |
| State corrupted | `localStorage.clear()` |

## File Structure

```
src/
├── utils/
│   ├── cardDatabase.js    ← Add card costs here
│   └── gameRules.js       ← Modify game rules here
├── redux/
│   ├── ImprovedGameSlice.js  ← State management
│   └── store.js           ← Wire up Redux here
└── components/
    └── ui/
        └── ImprovedPlayPoints.js  ← UI component
```

## Import Statements You'll Need

```javascript
// Actions
import {
  startTurn,
  endTurn,
  receiveTurnStart,
  receiveTurnEnd,
  playCardFromHandToField,
  addTempPlayPoints,
  addPermanentPlayPoints,
  setFirstPlayer,
  drawFromDeck,
} from "../redux/ImprovedGameSlice";

// Selectors
import { useSelector } from "react-redux";

const isMyTurn = useSelector((state) => state.game.isMyTurn);
const playPoints = useSelector((state) => state.game.playPoints);
const turnNumber = useSelector((state) => state.game.turnNumber);
```

## Documentation Files

| File | Purpose |
|------|---------|
| `SUMMARY.md` | Overview of everything |
| `SETUP_GUIDE.md` | Detailed setup instructions |
| `RULES_SYSTEM_README.md` | Feature documentation |
| `INTEGRATION_EXAMPLE.js` | Copy-paste code examples |
| `QUICK_REFERENCE.md` | This file! |

## Next Steps

1. ✅ Follow `SETUP_GUIDE.md`
2. ✅ Add card costs
3. ✅ Test with two windows
4. ✅ Deploy server (optional)
5. ✅ Play and enjoy!

---

**Keep this file open while coding!** 📌
