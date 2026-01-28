/**
 * Card Database with costs
 * Contains card costs for the Hearthstone-style turn system
 * Format: "Card Name/Code": { cost: number, type: "follower"|"spell"|"amulet" }
 */

export const cardCosts = {
  // ============================================
  // BP15 - Unkilling Annihilation
  // ============================================
  "Izudia, Unkilling Annihilation": { cost: 10, type: "follower" },
  "Amataz, Reverse Blader": { cost: 3, type: "follower" },
  "Piercye, Queen of Frost": { cost: 3, type: "follower" },
  "Inauspicious Puppeteer": { cost: 2, type: "follower" },
  "Erosive Annihilation": { cost: 2, type: "spell" },
  "Rejuvenating Resurrection": { cost: 2, type: "spell" },
  "Cryptid Keeper": { cost: 2, type: "follower" },
  "Adherent of Annihilation": { cost: 1, type: "follower" },
  "Fairy Healer": { cost: 1, type: "follower" },
  "Hermit of Unkilling": { cost: 1, type: "follower" },
  "Horned Beastie": { cost: 1, type: "follower" },
  "Bouquet Fairy": { cost: 1, type: "follower" },
  "Emerald Wildfox": { cost: 1, type: "follower" },
  "Wind Fairy": { cost: 0, type: "follower" },

  // BP15 - Hollow Usurpation
  "Octrice, Hollow Usurpation": { cost: 10, type: "follower" },
  "Kagemitsu, Lost Samurai": { cost: 3, type: "follower" },
  "Ralmia, Astrowing": { cost: 3, type: "follower" },
  "Arsène Lupin": { cost: 2, type: "follower" },
  "Ultimate Hollow": { cost: 2, type: "spell" },
  "Supersonic Breakthrough": { cost: 2, type: "spell" },
  "Adherent of Hollowness": { cost: 1, type: "follower" },
  "Sword General": { cost: 1, type: "follower" },
  "Serration Wave": { cost: 1, type: "spell" },
  "Penguin Guardian": { cost: 1, type: "follower" },
  "Hermit of Usurpation": { cost: 1, type: "follower" },
  "Chivalrous Bandit": { cost: 1, type: "follower" },
  "Flying Messenger Squirrel": { cost: 1, type: "follower" },
  "Brave Buccaneer": { cost: 1, type: "follower" },

  // ============================================
  // ECP01 - Umamusume: Pretty Derby EX Crossover (Reviewed)
  // ============================================
  "ECP01-042EN": { cost: 2, type: "follower" },
  "ECP01-043EN": { cost: 3, type: "follower" },
  "ECP01-044EN": { cost: 1, type: "follower" },
  "ECP01-045EN": { cost: 5, type: "follower" },
  "ECP01-050EN": { cost: 3, type: "follower" },
  "ECP01-051EN": { cost: 6, type: "follower" },
  "ECP01-052EN": { cost: 7, type: "follower" },
  "ECP01-053EN": { cost: 1, type: "follower" },
  "ECP01-054EN": { cost: 2, type: "follower" },
  "ECP01-055EN": { cost: 6, type: "follower" },
  "ECP01-056EN": { cost: 2, type: "follower" },
  "ECP01-057EN": { cost: 6, type: "follower" },
  "ECP01-058EN": { cost: 0, type: "follower" },
  "ECP01-059EN": { cost: 0, type: "follower" },
  "ECP01-060EN": { cost: 0, type: "follower" },
  "ECP01-061EN": { cost: 0, type: "follower" },
  "ECP01-062EN": { cost: 0, type: "follower" },
  "ECP01-SP01EN": { cost: 4, type: "follower" },
  "ECP01-SP02EN": { cost: 0, type: "follower" },
  "ECP01-SP03EN": { cost: 3, type: "follower" },
  "ECP01-SP04EN": { cost: 9, type: "follower" },
  "ECP01-SP05EN": { cost: 7, type: "follower" },
  "ECP01-SP06EN": { cost: 0, type: "follower" },
  "ECP01-SP07EN": { cost: 4, type: "follower" },
  "ECP01-SP08EN": { cost: 2, type: "follower" },
  "ECP01-SP09EN": { cost: 2, type: "follower" },
  "ECP01-SP10EN": { cost: 0, type: "follower" },
  "ECP01-SP11EN": { cost: 4, type: "follower" },
  "ECP01-SP12EN": { cost: 5, type: "follower" },
  "ECP01-SP13EN": { cost: 3, type: "follower" },
  "ECP01-SP14EN": { cost: 0, type: "follower" },
  "ECP01-SP15EN": { cost: 4, type: "follower" },
  "ECP01-SP16EN": { cost: 7, type: "follower" },
  "ECP01-SP17EN": { cost: 2, type: "follower" },
  "ECP01-SP18EN": { cost: 0, type: "follower" },
  "ECP01-SP19EN": { cost: 6, type: "follower" },
  "ECP01-SP20EN": { cost: 5, type: "follower" },
  "ECP01-SP21EN": { cost: 3, type: "follower" },
  "ECP01-SP22EN": { cost: 0, type: "follower" },
  "ECP01-SP23EN": { cost: 5, type: "follower" },
  "ECP01-SP24EN": { cost: 2, type: "follower" },
  "ECP01-005EN": { cost: 2, type: "follower" },
  "ECP01-006EN": { cost: 4, type: "follower" },
  "ECP01-007EN": { cost: 1, type: "follower" },
  "ECP01-008EN": { cost: 3, type: "follower" },
  "ECP01-009EN": { cost: 1, type: "follower" },
  "ECP01-014EN": { cost: 1, type: "follower" },
  "ECP01-015EN": { cost: 3, type: "follower" },
  "ECP01-016EN": { cost: 3, type: "follower" },
  "ECP01-017EN": { cost: 5, type: "follower" },
  "ECP01-018EN": { cost: 5, type: "follower" },
  "ECP01-023EN": { cost: 4, type: "follower" },
  "ECP01-024EN": { cost: 3, type: "follower" },
  "ECP01-025EN": { cost: 2, type: "follower" },
  "ECP01-026EN": { cost: 2, type: "follower" },
  "ECP01-027EN": { cost: 1, type: "follower" },
  "ECP01-032EN": { cost: 4, type: "follower" },
  "ECP01-033EN": { cost: 1, type: "follower" },
  "ECP01-034EN": { cost: 7, type: "follower" },
  "ECP01-035EN": { cost: 3, type: "follower" },
  "ECP01-036EN": { cost: 3, type: "follower" },
  "ECP01-041EN": { cost: 3, type: "follower" },

  // ============================================
  // CP01 - Umamusume: Pretty Derby Crossover (Reviewed)
  // ============================================
  "CP01-043EN": { cost: 3, type: "follower" },
  "CP01-044EN": { cost: 7, type: "follower" },
  "CP01-045EN": { cost: 6, type: "follower" },
  "CP01-046EN": { cost: 2, type: "follower" },
  "CP01-047EN": { cost: 1, type: "follower" },
  "CP01-048EN": { cost: 2, type: "follower" },
  "CP01-049EN": { cost: 3, type: "follower" },
  "CP01-050EN": { cost: 5, type: "follower" },
  "CP01-051EN": { cost: 6, type: "follower" },
  "CP01-052EN": { cost: 10, type: "follower" },
  "CP01-053EN": { cost: 3, type: "follower" },
  "CP01-054EN": { cost: 0, type: "follower" },
  "CP01-055EN": { cost: 5, type: "follower" },
  "CP01-056EN": { cost: 3, type: "follower" },
  "CP01-057EN": { cost: 5, type: "follower" },
  "CP01-058EN": { cost: 3, type: "follower" },
  "CP01-059EN": { cost: 1, type: "follower" },
  "CP01-060EN": { cost: 4, type: "follower" },
  "CP01-061EN": { cost: 1, type: "follower" },
  "CP01-062EN": { cost: 2, type: "follower" },
  "CP01-063EN": { cost: 3, type: "follower" },
  "CP01-064EN": { cost: 2, type: "follower" },
  "CP01-065EN": { cost: 4, type: "follower" },
  "CP01-066EN": { cost: 4, type: "follower" },
  "CP01-067EN": { cost: 0, type: "follower" },
  "CP01-068EN": { cost: 8, type: "follower" },
  "CP01-069EN": { cost: 3, type: "follower" },
  "CP01-070EN": { cost: 1, type: "follower" },
  "CP01-071EN": { cost: 3, type: "follower" },
  "CP01-072EN": { cost: 2, type: "follower" },
  "CP01-073EN": { cost: 4, type: "follower" },
  "CP01-074EN": { cost: 2, type: "follower" },
  "CP01-075EN": { cost: 2, type: "follower" },
  "CP01-076EN": { cost: 1, type: "follower" },
  "CP01-077EN": { cost: 4, type: "follower" },
  "CP01-078EN": { cost: 7, type: "follower" },
  "CP01-079EN": { cost: 6, type: "follower" },
  "CP01-080EN": { cost: 10, type: "follower" },
  "CP01-081EN": { cost: 2, type: "follower" },
  "CP01-082EN": { cost: 2, type: "follower" },
  "CP01-083EN": { cost: 2, type: "follower" },
  "CP01-084EN": { cost: 4, type: "follower" },
  "CP01-085EN": { cost: 0, type: "follower" },
  "CP01-SP01EN": { cost: 4, type: "follower" },
  "CP01-SP02EN": { cost: 0, type: "follower" },
  "CP01-SP03EN": { cost: 5, type: "follower" },
  "CP01-SP04EN": { cost: 5, type: "follower" },
  "CP01-SP05EN": { cost: 0, type: "follower" },
  "CP01-SP06EN": { cost: 8, type: "follower" },
  "CP01-SP07EN": { cost: 2, type: "follower" },
  "CP01-SP08EN": { cost: 0, type: "follower" },
  "CP01-SP09EN": { cost: 4, type: "follower" },
  "CP01-SP10EN": { cost: 2, type: "follower" },
  "CP01-SP11EN": { cost: 0, type: "follower" },
  "CP01-SP12EN": { cost: 6, type: "follower" },
  "CP01-SP13EN": { cost: 3, type: "follower" },
  "CP01-SP14EN": { cost: 0, type: "follower" },
  "CP01-SP15EN": { cost: 5, type: "follower" },
  "CP01-SP16EN": { cost: 4, type: "follower" },
  "CP01-SP17EN": { cost: 0, type: "follower" },
  "CP01-SP18EN": { cost: 8, type: "follower" },
  "CP01-SP19EN": { cost: 6, type: "follower" },
  "CP01-001EN": { cost: 4, type: "follower" },
  "CP01-002EN": { cost: 0, type: "follower" },
  "CP01-003EN": { cost: 5, type: "follower" },
  "CP01-004EN": { cost: 4, type: "follower" },
  "CP01-005EN": { cost: 2, type: "follower" },
  "CP01-006EN": { cost: 1, type: "follower" },
  "CP01-007EN": { cost: 3, type: "follower" },
  "CP01-008EN": { cost: 2, type: "follower" },
  "CP01-009EN": { cost: 2, type: "follower" },
  "CP01-010EN": { cost: 3, type: "follower" },
  "CP01-011EN": { cost: 6, type: "follower" },
  "CP01-012EN": { cost: 2, type: "follower" },
  "CP01-013EN": { cost: 2, type: "follower" },
  "CP01-014EN": { cost: 5, type: "follower" },
  "CP01-015EN": { cost: 0, type: "follower" },
  "CP01-016EN": { cost: 8, type: "follower" },
  "CP01-017EN": { cost: 3, type: "follower" },
  "CP01-018EN": { cost: 2, type: "follower" },
  "CP01-019EN": { cost: 2, type: "follower" },
  "CP01-020EN": { cost: 3, type: "follower" },
  "CP01-021EN": { cost: 1, type: "follower" },
  "CP01-022EN": { cost: 4, type: "follower" },
  "CP01-023EN": { cost: 2, type: "follower" },
  "CP01-024EN": { cost: 3, type: "follower" },
  "CP01-025EN": { cost: 1, type: "follower" },
  "CP01-026EN": { cost: 2, type: "follower" },
  "CP01-027EN": { cost: 2, type: "follower" },
  "CP01-028EN": { cost: 0, type: "follower" },
  "CP01-029EN": { cost: 4, type: "follower" },
  "CP01-030EN": { cost: 3, type: "follower" },
  "CP01-031EN": { cost: 2, type: "follower" },
  "CP01-032EN": { cost: 1, type: "follower" },
  "CP01-033EN": { cost: 1, type: "follower" },
  "CP01-034EN": { cost: 1, type: "follower" },
  "CP01-035EN": { cost: 2, type: "follower" },
  "CP01-036EN": { cost: 4, type: "follower" },
  "CP01-037EN": { cost: 9, type: "follower" },
  "CP01-038EN": { cost: 2, type: "follower" },
  "CP01-039EN": { cost: 3, type: "follower" },
  "CP01-040EN": { cost: 2, type: "follower" },
  "CP01-041EN": { cost: 0, type: "follower" }, // Evolve card
  "CP01-042EN": { cost: 6, type: "follower" },
};

/**
 * Get the cost of a card
 * @param {string} cardName - Name or code of the card
 * @returns {number} - Cost of the card
 */
export function getCardCost(cardName) {
  if (!cardName || cardName === 0 || cardName === "0") {
    return 0;
  }
  
  // Check if card exists in database by name
  let cardData = cardCosts[cardName];
  if (cardData) {
    return cardData.cost;
  }
  
  // Try extracting product code from name if it contains brackets like [CP01-001EN]
  const bracketMatch = cardName.match(/\[((?:CP01|ECP01)-\d+EN)\]/);
  if (bracketMatch) {
    cardData = cardCosts[bracketMatch[1]];
    if (cardData) {
      return cardData.cost;
    }
  }
  
  // For unknown cards, try to parse cost from name if it contains "(X)"
  const costMatch = cardName.match(/\((\d+)\)/);
  if (costMatch) {
    return parseInt(costMatch[1]);
  }
  
  // Default to 0 for unknown cards
  console.warn(`Card "${cardName}" not found in database, defaulting to cost 0`);
  return 0;
}

/**
 * Get card type
 * @param {string} cardName - Name or code of the card
 * @returns {string} - Type of card ("follower", "spell", "amulet")
 */
export function getCardType(cardName) {
  const cardData = cardCosts[cardName];
  return cardData ? cardData.type : "follower";
}

/**
 * Check if player can afford to play a card
 * @param {number} availablePlayPoints - Current available play points
 * @param {string} cardName - Name or code of the card to play
 * @returns {boolean} - True if player can afford the card
 */
export function canAffordCard(availablePlayPoints, cardName) {
  const cost = getCardCost(cardName);
  return availablePlayPoints >= cost;
}
