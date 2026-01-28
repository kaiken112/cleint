/**
 * Compatibility Middleware
 * Syncs CardSlice actions (old system) with ImprovedGameSlice (new turn system)
 * This allows existing code to work while automatically deducting play points
 */

import { getCardCost } from '../utils/cardDatabase';
import { cardImage } from '../decks/getCards';

// Helper to extract product code from image path
function extractProductCode(imagePath) {
  if (!imagePath) return null;
  const match = imagePath.match(/((?:CP01|ECP01|BP15)-[U\d]+EN)/);
  return match ? match[1] : null;
}

export const turnSystemMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  
  // When a card is played from hand to field in the old system
  // Automatically deduct cost in the new system
  if (action.type === 'card/placeToFieldFromHand') {
    const state = store.getState();
    const { card, index } = action.payload;
    
    // Try to get product code from image filename
    let productCode = card;
    try {
      const imagePath = cardImage(card);
      const extracted = extractProductCode(imagePath);
      if (extracted) {
        productCode = extracted;
      }
    } catch (error) {
      // If cardImage fails, use card name as-is
    }
    
    // Get cost from database (using product code if found)
    const cost = getCardCost(productCode);
    
    // Deduct from new game slice
    const gameState = state.game;
    const totalAvailable = gameState.playPoints.available + gameState.tempPlayPoints;
    
    // Track when card was played (for summoning sickness)
    const updatedPlayedTurn = [...gameState.cardPlayedTurn];
    updatedPlayedTurn[index] = gameState.turnNumber;
    store.dispatch({
      type: 'game/setCardPlayedTurn',
      payload: updatedPlayedTurn
    });
    
    // Show what's happening
    const message = `Card: ${card}\nCode: ${productCode}\nCost: ${cost}\nCurrent PP: ${totalAvailable}`;
    
    if (cost > 0 && cost <= totalAvailable) {
      // Deduct cost
      if (cost <= gameState.tempPlayPoints) {
        // Use temp PP first
        store.dispatch({
          type: 'game/setTempPlayPoints',
          payload: gameState.tempPlayPoints - cost
        });
      } else {
        // Use temp PP + regular PP
        const remainingCost = cost - gameState.tempPlayPoints;
        store.dispatch({
          type: 'game/setTempPlayPoints',
          payload: 0
        });
        store.dispatch({
          type: 'game/manualSetPlayPoints',
          payload: {
            available: gameState.playPoints.available - remainingCost,
            max: gameState.playPoints.max
          }
        });
      }
      
      // Success! PP deducted
      console.log(`✅ Deducted ${cost} PP for ${card} (${productCode})`);
    } else if (cost === 0) {
      // Evolve/token card - free
      console.log(`ℹ️ Free card: ${card}`);
    } else {
      // Cannot afford
      console.warn(`⚠️ Cannot afford ${card}! Need ${cost} PP, have ${totalAvailable}`);
    }
  }
  
  return result;
};
