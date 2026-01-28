/**
 * Combat System for Shadowverse Evolve
 * Handles attacking, damage resolution, and combat rules
 */

import { createSlice } from "@reduxjs/toolkit";

export const CombatSlice = createSlice({
  name: "combat",
  initialState: {
    // Combat state
    attackingCard: null, // { index: number, card: string, atk: number }
    combatMode: false, // true when selecting attack target
    validTargets: [], // Array of valid target indices
    
    // Combat log
    combatLog: [],
  },
  
  reducers: {
    /**
     * START ATTACK - Player selects a card to attack with
     */
    declareAttacker: (state, action) => {
      const { index, card, atk, canAttackLeader } = action.payload;
      
      state.attackingCard = { index, card, atk };
      state.combatMode = true;
      
      // Determine valid targets
      // In Shadowverse, you can attack:
      // 1. Opponent's leader (if no ward followers)
      // 2. Opponent's followers
      state.validTargets = canAttackLeader ? ['leader', ...Array.from({length: 10}, (_, i) => i)] : Array.from({length: 10}, (_, i) => i);
      
      state.combatLog.push(`${card} is attacking!`);
    },
    
    /**
     * CANCEL ATTACK - Player cancels attack selection
     */
    cancelAttack: (state) => {
      state.attackingCard = null;
      state.combatMode = false;
      state.validTargets = [];
    },
    
    /**
     * RESOLVE COMBAT - Calculate damage and destruction
     * This is called after target is selected
     */
    resolveCombat: (state, action) => {
      const { 
        attackerIndex, 
        attackerCard,
        attackerAtk, 
        attackerDef,
        targetIndex, 
        targetCard,
        targetAtk,
        targetDef,
        attackerHasBane,
        targetHasWard,
        isLeaderTarget
      } = action.payload;
      
      if (isLeaderTarget) {
        // Attacking leader
        state.combatLog.push(`${attackerCard} deals ${attackerAtk} damage to opponent's leader!`);
      } else {
        // Follower vs Follower combat
        const attackerSurvives = attackerDef > targetAtk;
        const targetSurvives = targetDef > attackerAtk && !attackerHasBane;
        
        state.combatLog.push(
          `${attackerCard} (${attackerAtk}/${attackerDef}) attacks ${targetCard} (${targetAtk}/${targetDef})!`
        );
        
        if (attackerHasBane && !targetSurvives) {
          state.combatLog.push(`${targetCard} is destroyed by Bane!`);
        }
        
        if (!attackerSurvives) {
          state.combatLog.push(`${attackerCard} is destroyed!`);
        }
        
        if (!targetSurvives && !attackerHasBane) {
          state.combatLog.push(`${targetCard} is destroyed!`);
        }
      }
      
      // Reset combat state
      state.attackingCard = null;
      state.combatMode = false;
      state.validTargets = [];
    },
    
    /**
     * CLEAR COMBAT LOG
     */
    clearCombatLog: (state) => {
      state.combatLog = [];
    }
  }
});

export const {
  declareAttacker,
  cancelAttack,
  resolveCombat,
  clearCombatLog
} = CombatSlice.actions;

export default CombatSlice.reducer;


/**
 * Combat Rules Helper Functions
 */

/**
 * Check if a card can attack
 */
export function canAttack(card, engaged, turnPlayed, currentTurn) {
  // Can't attack if engaged (tapped)
  if (engaged) return false;
  
  // Summoning sickness - can't attack on turn played
  if (turnPlayed === currentTurn) return false;
  
  return true;
}

/**
 * Check if there are ward followers on opponent's field
 */
export function hasWardFollowers(enemyField, enemyWardField) {
  for (let i = 0; i < enemyField.length; i++) {
    if (enemyField[i] !== 0 && enemyWardField[i] === 1) {
      return true;
    }
  }
  return false;
}

/**
 * Get valid attack targets
 */
export function getValidTargets(enemyField, enemyWardField) {
  const targets = [];
  const hasWard = hasWardFollowers(enemyField, enemyWardField);
  
  if (hasWard) {
    // If there are ward followers, can only attack them
    for (let i = 0; i < enemyField.length; i++) {
      if (enemyField[i] !== 0 && enemyWardField[i] === 1) {
        targets.push(i);
      }
    }
  } else {
    // Can attack any follower or leader
    targets.push('leader');
    for (let i = 0; i < enemyField.length; i++) {
      if (enemyField[i] !== 0) {
        targets.push(i);
      }
    }
  }
  
  return targets;
}

/**
 * Calculate combat result
 */
export function calculateCombatResult(
  attackerAtk,
  attackerDef,
  targetAtk,
  targetDef,
  attackerHasBane = false,
  targetHasWard = false
) {
  // Attacker takes damage equal to target's attack
  const attackerRemainingDef = attackerDef - targetAtk;
  const attackerDestroyed = attackerRemainingDef <= 0;
  
  // Target takes damage equal to attacker's attack
  const targetRemainingDef = targetDef - attackerAtk;
  const targetDestroyed = targetRemainingDef <= 0 || attackerHasBane;
  
  return {
    attackerDestroyed,
    targetDestroyed,
    attackerRemainingDef: Math.max(0, attackerRemainingDef),
    targetRemainingDef: Math.max(0, targetRemainingDef),
  };
}
