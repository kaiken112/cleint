/**
 * Game State Sync Manager
 * Handles state snapshots, desync detection, and recovery
 */

export class GameSyncManager {
  constructor() {
    this.snapshots = [];
    this.maxSnapshots = 10; // Keep last 10 game states
    this.lastSyncTime = Date.now();
  }

  /**
   * Create a snapshot of current game state
   */
  createSnapshot(state, action = 'unknown') {
    const snapshot = {
      timestamp: Date.now(),
      action: action,
      state: {
        // Player field state
        field: [...state.card.field],
        evoField: [...state.card.evoField],
        hand: [...state.card.hand],
        cemetery: [...state.card.cemetery],
        customValues: [...state.card.customValues],
        engaged: [...state.card.engagedField],
        counterField: [...state.card.counterField],
        auraField: [...state.card.auraField],
        baneField: [...state.card.baneField],
        wardField: [...state.card.wardField],
        
        // Enemy field state
        enemyField: [...state.card.enemyField],
        enemyEvoField: [...state.card.enemyEvoField],
        enemyHand: [...state.card.enemyHand],
        enemyCemetery: [...state.card.enemyCemetery],
        enemyCustomValues: [...state.card.enemyCustomValues],
        enemyEngaged: [...state.card.enemyEngagedField],
        enemyCounterField: [...state.card.enemyCounterField],
        enemyAuraField: [...state.card.enemyAuraField],
        enemyBaneField: [...state.card.enemyBaneField],
        enemyWardField: [...state.card.enemyWardField],
        
        // Game state
        isMyTurn: state.game.isMyTurn,
        turnNumber: state.game.turnNumber,
        playPoints: { ...state.game.playPoints },
        enemyPlayPoints: { ...state.game.enemyPlayPoints },
        playerHealth: state.game.playerHealth,
        enemyHealth: state.game.enemyHealth,
        evoPoints: state.game.evoPoints,
        enemyEvoPoints: state.game.enemyEvoPoints,
      }
    };

    this.snapshots.push(snapshot);
    
    // Keep only last N snapshots
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
    }

    console.log(`📸 Snapshot created: ${action} (Total: ${this.snapshots.length})`);
    return snapshot;
  }

  /**
   * Get the most recent snapshot
   */
  getLastSnapshot() {
    return this.snapshots[this.snapshots.length - 1];
  }

  /**
   * Get snapshot from N actions ago
   */
  getSnapshotAgo(n) {
    const index = this.snapshots.length - 1 - n;
    return index >= 0 ? this.snapshots[index] : null;
  }

  /**
   * Detect potential desync issues
   */
  detectDesync(localState, receivedState) {
    const issues = [];

    // Check field counts
    const localFieldCount = localState.field.filter(c => c !== 0).length;
    const receivedFieldCount = receivedState.enemyField?.filter(c => c !== 0).length;
    if (receivedFieldCount !== undefined && Math.abs(localFieldCount - receivedFieldCount) > 0) {
      issues.push({
        type: 'field_count_mismatch',
        local: localFieldCount,
        received: receivedFieldCount
      });
    }

    // Check turn number
    if (receivedState.turnNumber !== undefined && 
        Math.abs(localState.turnNumber - receivedState.turnNumber) > 1) {
      issues.push({
        type: 'turn_number_mismatch',
        local: localState.turnNumber,
        received: receivedState.turnNumber
      });
    }

    // Check play points
    if (receivedState.playPoints !== undefined && 
        localState.playPoints.max !== receivedState.playPoints.max) {
      issues.push({
        type: 'playpoints_mismatch',
        local: localState.playPoints,
        received: receivedState.playPoints
      });
    }

    return issues;
  }

  /**
   * Create a recovery action set to restore state
   */
  createRecoveryActions(snapshot) {
    const actions = [];

    // Restore all state from snapshot
    actions.push({ type: 'RESTORE_GAME_STATE', payload: snapshot.state });

    console.log(`🔄 Created ${actions.length} recovery actions from snapshot: ${snapshot.action}`);
    return actions;
  }

  /**
   * Get sync report for debugging
   */
  getSyncReport() {
    return {
      snapshotCount: this.snapshots.length,
      oldestSnapshot: this.snapshots[0]?.timestamp,
      newestSnapshot: this.getLastSnapshot()?.timestamp,
      lastSyncTime: this.lastSyncTime,
      timeSinceLastSync: Date.now() - this.lastSyncTime,
      recentActions: this.snapshots.slice(-5).map(s => ({
        action: s.action,
        timestamp: s.timestamp,
        turnNumber: s.state.turnNumber
      }))
    };
  }

  /**
   * Clear all snapshots (use when starting new game)
   */
  clearSnapshots() {
    this.snapshots = [];
    console.log('🧹 All snapshots cleared');
  }
}

// Singleton instance
export const gameSyncManager = new GameSyncManager();
