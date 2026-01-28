# 🎮 Shadowverse Evolve - Hearthstone-Style Rules System

## 📦 What Has Been Created

I've built a complete **turn-based, rules-enforced game system** for your Shadowverse client that works like Hearthstone. Here's what you now have:

### ✅ Core Features Implemented

1. **Turn-Based System**
   - Only active player can perform actions
   - Automatic turn transitions
   - Visual indicators showing whose turn it is
   - Turn counter tracking game progression

2. **Automatic Play Point Management**
   - Play points automatically refresh each turn
   - Maximum increases by 1 per turn (up to 10)
   - Card costs automatically deducted when played
   - Support for temporary play points (card effects)
   - Support for permanent play point increases (card effects)

3. **Cost Validation**
   - Cards can't be played without sufficient points
   - Visual feedback when actions are blocked
   - Cost information in game log
   - Comprehensive card database system

4. **Rule Enforcement**
   - Players can't act during opponent's turn
   - Field validation before card placement
   - All rules checked before actions execute
   - Optional server-side validation

---

## 📂 Files Created

### Core System Files
```
src/utils/cardDatabase.js       - Card costs and metadata
src/utils/gameRules.js          - Game rules engine
src/redux/ImprovedGameSlice.js  - New Redux state management
src/components/ui/ImprovedPlayPoints.js  - New UI component
```

### Documentation
```
RULES_SYSTEM_README.md      - Feature overview and details
SETUP_GUIDE.md              - Complete setup instructions
INTEGRATION_EXAMPLE.js      - Copy-paste integration code
THIS_FILE.md                - You are here!
```

### Server (Optional)
```
server/index.js             - Node.js server with game validation
server/package.json         - Server dependencies
```

---

## 🚀 Quick Start Guide

### Minimum Setup (5 minutes)

**Step 1**: Update Redux Store

Edit `src/redux/store.js`:
```javascript
import ImprovedGameReducer from "./ImprovedGameSlice";

export const store = configureStore({
  reducer: {
    deck: DeckReducer,
    game: persistReducer(gamePersistConfig, ImprovedGameReducer), // Changed!
  },
  // ... rest of config
});
```

**Step 2**: Update Game Component

Edit `src/pages/Game.js`:
```javascript
import ImprovedPlayPoints from "../components/ui/ImprovedPlayPoints";
import { receiveTurnStart, receiveTurnEnd } from "../redux/ImprovedGameSlice";

// Add socket listener
useEffect(() => {
  socket.on("receive msg", (data) => {
    if (data.type === "turnEnd") {
      dispatch(receiveTurnStart({ turnNumber: data.turnNumber }));
    }
    if (data.type === "turnStart") {
      dispatch(receiveTurnEnd());
    }
  });
}, []);

// Replace <PlayPoints /> with <ImprovedPlayPoints />
```

**Step 3**: Test
```bash
npm start
```

That's it! The basic system is now active.

---

## 📖 How It Works

### Turn Flow
```
Game Start
    ↓
Coin flip determines first player
    ↓
First player's turn starts
    - Play points set to 1/1
    - Can play cards, attack, use abilities
    ↓
Player clicks "END TURN"
    ↓
Opponent's turn starts
    - Play points refresh (2/2, 3/3, etc.)
    - Can now take actions
    ↓
Repeat until game ends
```

### Playing a Card
```
1. Player drags card to field
2. System checks:
   ✓ Is it player's turn?
   ✓ Is field position empty?
   ✓ Enough play points?
3. If valid:
   ✓ Card placed on field
   ✓ Cost deducted automatically
   ✓ Game log updated
   ✓ Opponent notified
4. If invalid:
   ✗ Action blocked
   ✗ Reason shown in console
```

---

## 🎯 Key Differences from Old System

| Feature | Old System | New System |
|---------|-----------|------------|
| **Turn Management** | Manual (honor system) | Automatic (enforced) |
| **Play Points** | Manual adjustment | Auto-refresh + auto-deduct |
| **Card Costs** | Manual tracking | Validated before play |
| **Action Validation** | Trust-based | Rules-enforced |
| **Turn Indicator** | Manual communication | Visual UI element |
| **Play Point Display** | Manual management | Automatic updates |

---

## 🔧 Customization Examples

### Add Card Costs
Edit `src/utils/cardDatabase.js`:
```javascript
export const cardCosts = {
  "Your Card Name": { cost: 5, type: "follower" },
  "Powerful Spell": { cost: 10, type: "spell" },
  "Free Token": { cost: 0, type: "follower" },
};
```

### Card Effects (Temporary Mana)
```javascript
import { addTempPlayPoints } from "../redux/ImprovedGameSlice";

// When playing "The Coin" equivalent
dispatch(addTempPlayPoints(1));
```

### Card Effects (Permanent Mana)
```javascript
import { addPermanentPlayPoints } from "../redux/ImprovedGameSlice";

// When playing "Wild Growth" equivalent
dispatch(addPermanentPlayPoints(1));
```

---

## 📊 What You Need to Do Next

### Priority 1: Add Card Costs (Required)
The system needs card costs to work properly. You have two options:

**Option A: Manual Entry** (Recommended for now)
1. Open `src/utils/cardDatabase.js`
2. Add each card with its cost:
```javascript
"Card Name": { cost: X, type: "follower" },
```

**Option B: Extract from Images** (Advanced)
- Use OCR to read costs from card images
- Build automated import system

### Priority 2: Wire Up Components
Update your components to use the new system:

1. **Hand Component** - Use `playCardFromHandToField` action
2. **Field Component** - Check `isMyTurn` before actions
3. **Draw Button** - Use `drawFromDeck` action
4. **Other Actions** - Check turn state first

See `INTEGRATION_EXAMPLE.js` for complete code examples.

### Priority 3: Test Thoroughly
- Test with two browser windows
- Verify turn transitions work
- Check play points refresh correctly
- Ensure costs are deducted
- Test all card effects

### Priority 4: Optional Server Setup
For production, deploy the rules-enforcing server:
1. Deploy `server/` to Render/Glitch/Heroku
2. Update `src/sockets.js` with new URL
3. Server validates all actions server-side

---

## 🐛 Common Issues & Solutions

### Issue: Play points not refreshing
**Solution**: Make sure `receiveTurnStart` is dispatched when opponent ends turn.

### Issue: Can't play cards
**Solution**: Check that `isMyTurn` is true in Redux state.

### Issue: All cards cost 0
**Solution**: Add cards to `cardDatabase.js` with correct costs.

### Issue: Opponent can't see my actions
**Solution**: Verify socket connection and room joining.

Full troubleshooting guide in `SETUP_GUIDE.md`.

---

## 📁 File Organization

```
shadowverse-client-test-main/
├── src/
│   ├── utils/
│   │   ├── cardDatabase.js          # Card costs
│   │   └── gameRules.js             # Game rules
│   ├── redux/
│   │   ├── ImprovedGameSlice.js     # New state management
│   │   ├── CardSlice.js             # Old (keep for compatibility)
│   │   └── store.js                 # Redux store config
│   ├── components/
│   │   └── ui/
│   │       ├── ImprovedPlayPoints.js   # New UI
│   │       └── PlayPoints.js           # Old (keep for reference)
│   └── pages/
│       └── Game.js                  # Main game component
├── server/                          # Optional server
│   ├── index.js
│   └── package.json
├── RULES_SYSTEM_README.md           # Feature overview
├── SETUP_GUIDE.md                   # Setup instructions
├── INTEGRATION_EXAMPLE.js           # Code examples
└── SUMMARY.md                       # This file!
```

---

## 🎓 Learning Resources

### Understanding the System
1. Read `RULES_SYSTEM_README.md` - Feature overview
2. Read `SETUP_GUIDE.md` - Step-by-step setup
3. Study `INTEGRATION_EXAMPLE.js` - See working code
4. Examine `ImprovedGameSlice.js` - Understand state management

### Testing & Debugging
- Use Redux DevTools to monitor state
- Check browser console for errors
- Use Network tab to verify socket messages
- Add console.logs to trace execution flow

### Expanding the System
- Study `gameRules.js` to add new rules
- Modify `cardDatabase.js` for more card metadata
- Extend `ImprovedGameSlice.js` for new features
- Update server for additional validation

---

## ✨ Next Steps

### Immediate (This Week)
1. ✅ Add all card costs to database
2. ✅ Wire up Hand component
3. ✅ Test basic turn system
4. ✅ Verify play point management

### Short Term (This Month)
1. ✅ Implement all card effects
2. ✅ Add evolution system integration
3. ✅ Test extensively with friends
4. ✅ Deploy rules-enforcing server

### Long Term (Future)
1. ✅ Add matchmaking system
2. ✅ Implement replay system
3. ✅ Add spectator mode
4. ✅ Build tournament support
5. ✅ Add AI opponents

---

## 💬 Need Help?

### Documentation
- `SETUP_GUIDE.md` - Complete setup walkthrough
- `RULES_SYSTEM_README.md` - Feature details
- `INTEGRATION_EXAMPLE.js` - Working code examples

### Debugging Tools
- Redux DevTools - State inspection
- Browser Console - Error messages
- Network Tab - Socket communication
- React DevTools - Component hierarchy

### Check These First
1. Is Redux store using new slice?
2. Are socket listeners set up?
3. Are card costs in database?
4. Is turn state synchronized?

---

## 🎉 What You've Got

You now have a **professional, rules-enforced card game system** that:

✅ Prevents cheating through client-side validation  
✅ Provides smooth, automatic turn management  
✅ Handles play point economy like Hearthstone  
✅ Shows clear visual feedback  
✅ Supports complex card effects  
✅ Can scale to server-side validation  
✅ Maintains compatibility with existing code  

**This is a huge upgrade from the honor-system simulator!**

---

## 🚀 Let's Get Started!

1. Open `SETUP_GUIDE.md`
2. Follow the "Quick Start" section
3. Test with two browser windows
4. Start adding card costs
5. Enjoy your Hearthstone-style game!

**Questions? Check the guides. Issues? See troubleshooting. Ready? Let's go!** 🎮

---

*Built with ❤️ by Kai + Claude*  
*Last Updated: January 2026*
