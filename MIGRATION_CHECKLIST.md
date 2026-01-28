# 🔄 Migration Checklist

Use this checklist to migrate from the old honor-system to the new rules-enforced system.

## Phase 1: Setup (30 minutes)

### 1.1 Core Files
- [ ] Create `src/utils/cardDatabase.js`
- [ ] Create `src/utils/gameRules.js`
- [ ] Create `src/redux/ImprovedGameSlice.js`
- [ ] Create `src/components/ui/ImprovedPlayPoints.js`

### 1.2 Update Redux Store
- [ ] Open `src/redux/store.js`
- [ ] Import `ImprovedGameReducer`
- [ ] Replace `CardSlice` with `ImprovedGameReducer` in store config
- [ ] Keep `DeckSlice` unchanged
- [ ] Test that app still builds: `npm start`

### 1.3 Update Game Component
- [ ] Open `src/pages/Game.js`
- [ ] Import `ImprovedPlayPoints` component
- [ ] Import turn management actions
- [ ] Add socket listener `useEffect` for turn events
- [ ] Replace `<PlayPoints />` with `<ImprovedPlayPoints />`
- [ ] Test that game loads without errors

**Checkpoint**: App should build and run, turn indicator should appear

---

## Phase 2: Card Costs (2-4 hours)

### 2.1 Gather Card Data
- [ ] List all cards in your game
- [ ] Determine cost for each card
- [ ] Categorize cards by type (follower/spell/amulet)
- [ ] Note any special cost mechanics

### 2.2 Populate Database
- [ ] Open `src/utils/cardDatabase.js`
- [ ] Add entries for all cards in this format:
```javascript
"Card Name": { cost: X, type: "follower" },
```
- [ ] Start with your most-used cards
- [ ] Add less common cards later
- [ ] Set unknown cards to cost 0 (they'll warn in console)

### 2.3 Test Card Costs
- [ ] Try to play various cards
- [ ] Check console for "card not found" warnings
- [ ] Verify costs are correct
- [ ] Add missing cards as you find them

**Checkpoint**: Cards should show correct costs in game log

---

## Phase 3: Component Integration (2-3 hours)

### 3.1 Update Hand Component
- [ ] Open Hand component (`src/components/hand/Hand.js`)
- [ ] Import `playCardFromHandToField` action
- [ ] Import `isMyTurn` selector
- [ ] Replace old card play logic with new action
- [ ] Add turn validation before allowing drags
```javascript
if (!isMyTurn) {
  console.warn("Not your turn!");
  return;
}
dispatch(playCardFromHandToField({ card, handIndex, fieldIndex }));
```
- [ ] Test card playing from hand

### 3.2 Update Field Component
- [ ] Open Field component
- [ ] Import `isMyTurn` selector
- [ ] Add turn check before field interactions
- [ ] Update any card movement logic
- [ ] Test field interactions

### 3.3 Update Other Game Actions
For each game action that should be turn-restricted:
- [ ] Draw cards
- [ ] Play spells
- [ ] Attack with followers
- [ ] Use abilities
- [ ] Evolve cards

Add this check before each action:
```javascript
const isMyTurn = useSelector((state) => state.game.isMyTurn);
if (!isMyTurn) return;
```

### 3.4 Update UI Components
- [ ] PlayerUI - Show turn indicator
- [ ] EnemyUI - Show opponent's turn state
- [ ] GameLog - Test that actions log correctly
- [ ] Any other UI that should reflect turn state

**Checkpoint**: All game actions should respect turn order

---

## Phase 4: Socket Integration (1 hour)

### 4.1 Turn Management Sockets
- [ ] Add `receiveTurnStart` dispatch on "turnEnd" event
- [ ] Add `receiveTurnEnd` dispatch on "turnStart" event
- [ ] Test turn transitions between players
- [ ] Verify socket messages are sent/received

### 4.2 Game State Sockets
- [ ] Update socket handlers for field updates
- [ ] Update socket handlers for hand updates
- [ ] Update socket handlers for play point updates
- [ ] Test that opponent sees your actions
- [ ] Test that you see opponent's actions

### 4.3 Room Management
- [ ] Ensure `setRoom` is dispatched when joining room
- [ ] Test room joining/leaving
- [ ] Verify game state persists in room
- [ ] Test reconnection handling

**Checkpoint**: Two browser windows can play against each other

---

## Phase 5: Game Start Logic (30 minutes)

### 5.1 First Player Determination
- [ ] Add coin flip logic (or let server decide)
- [ ] Dispatch `setFirstPlayer` when game starts
- [ ] Dispatch `startTurn` for first player
- [ ] Test that correct player goes first
- [ ] Test play points start at correct values

### 5.2 Mulligan Phase
- [ ] Implement mulligan if you don't have it
- [ ] Ensure mulligan happens before turn 1
- [ ] Test mulligan with new system
- [ ] Verify turn starts after mulligan

**Checkpoint**: Game starts properly with correct first player

---

## Phase 6: Advanced Features (Optional)

### 6.1 Card Effects
- [ ] Implement temporary play point cards (like "The Coin")
- [ ] Implement permanent play point cards (like "Wild Growth")
- [ ] Test all card effects that modify play points
- [ ] Add any custom effects your game needs

### 6.2 Evolution System
- [ ] Integrate evolution with turn system
- [ ] Ensure evolutions respect turn order
- [ ] Test evolution point tracking
- [ ] Verify evolved cards work correctly

### 6.3 Special Mechanics
- [ ] Test any special game mechanics
- [ ] Ensure all mechanics respect turn order
- [ ] Add custom validations as needed
- [ ] Test edge cases

**Checkpoint**: All game features work with new system

---

## Phase 7: Server Deployment (Optional)

### 7.1 Server Setup
- [ ] Install Node.js if needed
- [ ] Navigate to `server/` directory
- [ ] Run `npm install`
- [ ] Test server locally: `npm start`
- [ ] Verify server responds on http://localhost:5000

### 7.2 Server Deployment
- [ ] Choose hosting platform (Render/Glitch/Heroku)
- [ ] Create new project on platform
- [ ] Upload server files
- [ ] Set start command: `node index.js`
- [ ] Deploy and note the URL

### 7.3 Client Update
- [ ] Open `src/sockets.js`
- [ ] Update socket URL to deployed server
- [ ] Test connection to new server
- [ ] Verify game works with deployed server

**Checkpoint**: Game works with remote server

---

## Phase 8: Testing (2-3 hours)

### 8.1 Basic Functionality
- [ ] Test turn alternation
- [ ] Test play point refresh
- [ ] Test card playing
- [ ] Test cost deduction
- [ ] Test turn restrictions

### 8.2 Edge Cases
- [ ] Test with 0-cost cards
- [ ] Test with 10-cost cards
- [ ] Test with full hand
- [ ] Test with empty deck
- [ ] Test with full field
- [ ] Test disconnect/reconnect

### 8.3 Multi-Player Testing
- [ ] Test with 2 browser windows
- [ ] Test with different devices
- [ ] Test with friend remotely
- [ ] Test latency scenarios
- [ ] Test rapid action spam

### 8.4 Card Database
- [ ] Verify all cards have costs
- [ ] Check for typos in card names
- [ ] Test that console warnings appear for missing cards
- [ ] Add any missing cards found during testing

**Checkpoint**: Game is stable and all features work

---

## Phase 9: Cleanup (30 minutes)

### 9.1 Code Cleanup
- [ ] Remove any debug console.logs
- [ ] Remove unused imports
- [ ] Remove old commented code
- [ ] Format code consistently

### 9.2 Documentation
- [ ] Update README with new features
- [ ] Document any custom modifications
- [ ] Note known issues
- [ ] Add contribution guidelines

### 9.3 Optimization
- [ ] Check bundle size
- [ ] Optimize images if needed
- [ ] Remove unused dependencies
- [ ] Test performance

**Checkpoint**: Code is clean and documented

---

## Phase 10: Production (1 hour)

### 10.1 Pre-Production Checks
- [ ] All tests pass
- [ ] No console errors
- [ ] Game plays smoothly
- [ ] Server is stable
- [ ] Documentation is complete

### 10.2 Deployment
- [ ] Build production version: `npm run build`
- [ ] Test production build locally
- [ ] Deploy to hosting (Vercel/Netlify)
- [ ] Verify deployed version works
- [ ] Test with multiple users

### 10.3 Post-Launch
- [ ] Monitor for errors
- [ ] Collect user feedback
- [ ] Fix any critical bugs
- [ ] Plan next features

**Checkpoint**: Game is live and working!

---

## Rollback Plan

If something goes wrong:

### Quick Rollback
1. Revert `src/redux/store.js` to use `CardSlice`
2. Replace `<ImprovedPlayPoints />` with `<PlayPoints />`
3. Remove socket listeners from Game.js
4. App should work like before

### Keep Both Systems
You can run both systems side-by-side:
```javascript
// In store.js
reducer: {
  deck: DeckReducer,
  card: CardReducer,      // Old system
  game: ImprovedGameReducer,  // New system
}

// Use whichever you need
const oldSystem = useSelector((state) => state.card);
const newSystem = useSelector((state) => state.game);
```

---

## Progress Tracking

### Completed Phases
- [ ] Phase 1: Setup
- [ ] Phase 2: Card Costs
- [ ] Phase 3: Component Integration
- [ ] Phase 4: Socket Integration
- [ ] Phase 5: Game Start Logic
- [ ] Phase 6: Advanced Features
- [ ] Phase 7: Server Deployment
- [ ] Phase 8: Testing
- [ ] Phase 9: Cleanup
- [ ] Phase 10: Production

### Time Estimate
- Minimum (basic setup): **4-6 hours**
- Full migration: **10-15 hours**
- With server: **+2-3 hours**

### Difficulty
- Phases 1-2: ⭐⭐ Easy
- Phases 3-5: ⭐⭐⭐ Medium
- Phases 6-7: ⭐⭐⭐⭐ Advanced
- Phases 8-10: ⭐⭐⭐ Medium

---

## Need Help?

### Stuck on a phase?
1. Check the corresponding documentation file
2. Review the integration example
3. Check Redux DevTools for state issues
4. Look at browser console for errors

### Documentation by Phase
- Phase 1-2: `SETUP_GUIDE.md`
- Phase 3-5: `INTEGRATION_EXAMPLE.js`
- Phase 6: `RULES_SYSTEM_README.md`
- Phase 7: `server/` directory
- Phase 8-10: `QUICK_REFERENCE.md`

---

**Take it one phase at a time, test thoroughly, and you'll have a fully functional Hearthstone-style game!** 🎮

Good luck! 🚀
