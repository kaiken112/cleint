/**
 * Game Rules Engine
 * Enforces Hearthstone-like game rules for Shadowverse
 */

import { getCardCost, canAffordCard } from './cardDatabase';

export class GameRules {
  /**
   * Check if it's the player's turn
   */
  static isPlayerTurn(isPlayerActive) {
    return isPlayerActive;
  }

  /**
   * Check if player can perform an action (must be their turn)
   */
  static canPerformAction(isPlayerActive) {
    return this.isPlayerTurn(isPlayerActive);
  }

  /**
   * Check if player can play a card from hand
   */
  static canPlayCardFromHand(card, availablePlayPoints, isPlayerActive) {
    if (!this.canPerformAction(isPlayerActive)) {
      return { allowed: false, reason: "Not your turn" };
    }

    if (!canAffordCard(availablePlayPoints, card)) {
      const cost = getCardCost(card);
      return { 
        allowed: false, 
        reason: `Insufficient play points (need ${cost}, have ${availablePlayPoints})` 
      };
    }

    return { allowed: true, reason: null };
  }

  /**
   * Calculate play points for a new turn
   */
  static calculateNewTurnPlayPoints(currentMax) {
    const newMax = Math.min(currentMax + 1, 10);
    return {
      available: newMax,
      max: newMax
    };
  }

  /**
   * Calculate play points after playing a card
   */
  static calculatePlayPointsAfterCardPlay(currentAvailable, cardName) {
    const cost = getCardCost(cardName);
    return Math.max(0, currentAvailable - cost);
  }

  /**
   * Check if player can end turn (always allowed)
   */
  static canEndTurn(isPlayerActive) {
    return this.canPerformAction(isPlayerActive);
  }

  /**
   * Validate card placement on field
   */
  static canPlaceCardOnField(field, targetIndex, isPlayerActive) {
    if (!this.canPerformAction(isPlayerActive)) {
      return { allowed: false, reason: "Not your turn" };
    }

    if (targetIndex < 0 || targetIndex >= field.length) {
      return { allowed: false, reason: "Invalid field position" };
    }

    if (field[targetIndex] !== 0) {
      return { allowed: false, reason: "Field position already occupied" };
    }

    return { allowed: true, reason: null };
  }

  /**
   * Get initial game state for a player
   */
  static getInitialGameState() {
    return {
      playPoints: { available: 0, max: 0 },
      health: 20,
      evoPoints: 0,
      isActive: false,
      field: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      hand: [],
      deck: [],
      cemetery: [],
      banish: []
    };
  }

  /**
   * Validate and process turn transition
   */
  static processTurnStart(player) {
    // Increment play points
    const newPlayPoints = this.calculateNewTurnPlayPoints(player.playPoints.max);
    
    return {
      ...player,
      playPoints: newPlayPoints,
      isActive: true
    };
  }

  /**
   * Process turn end
   */
  static processTurnEnd(player) {
    return {
      ...player,
      isActive: false
    };
  }
}

export default GameRules;
