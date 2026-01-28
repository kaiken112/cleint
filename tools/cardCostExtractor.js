/**
 * Card Cost Extractor - Automatically extract costs from card images
 * Uses Tesseract.js OCR to read cost numbers from card images
 */

const Tesseract = require('tesseract.js');
const fs = require('fs').promises;
const path = require('path');

/**
 * Configuration for card image OCR
 */
const OCR_CONFIG = {
  // Where the cost typically appears on a card (percentage of image dimensions)
  costRegion: {
    x: 0,      // Left edge (0%)
    y: 0,      // Top edge (0%)
    width: 0.2, // 20% of card width
    height: 0.2 // 20% of card height
  },
  
  // Tesseract configuration
  tesseractConfig: {
    lang: 'eng',
    oem: 3, // LSTM neural net mode
    psm: 7, // Single text line
    tessedit_char_whitelist: '0123456789' // Only recognize numbers
  },
  
  // Confidence threshold (0-100)
  minConfidence: 60
};

/**
 * Extract cost from a single card image
 */
async function extractCostFromImage(imagePath) {
  try {
    console.log(`Processing: ${imagePath}`);
    
    // Perform OCR on the cost region
    const result = await Tesseract.recognize(
      imagePath,
      'eng',
      {
        logger: m => {
          if (m.status === 'recognizing text') {
            process.stdout.write(`\rProgress: ${Math.round(m.progress * 100)}%`);
          }
        }
      }
    );
    
    console.log(''); // New line after progress
    
    // Extract the text and confidence
    const text = result.data.text.trim();
    const confidence = result.data.confidence;
    
    console.log(`  Raw OCR: "${text}" (confidence: ${confidence}%)`);
    
    // Parse the cost (should be a number 0-10)
    const cost = parseInt(text);
    
    if (isNaN(cost)) {
      console.log(`  ⚠️  Could not parse cost as number`);
      return { cost: null, confidence: 0, raw: text };
    }
    
    if (cost < 0 || cost > 10) {
      console.log(`  ⚠️  Cost ${cost} out of valid range (0-10)`);
      return { cost: null, confidence: 0, raw: text };
    }
    
    if (confidence < OCR_CONFIG.minConfidence) {
      console.log(`  ⚠️  Confidence ${confidence}% below threshold ${OCR_CONFIG.minConfidence}%`);
      return { cost: cost, confidence: confidence, raw: text, warning: 'low_confidence' };
    }
    
    console.log(`  ✅ Cost: ${cost}`);
    return { cost: cost, confidence: confidence, raw: text };
    
  } catch (error) {
    console.error(`  ❌ Error processing ${imagePath}:`, error.message);
    return { cost: null, confidence: 0, error: error.message };
  }
}

/**
 * Determine card type from filename or path
 */
function guessCardType(filename) {
  const lower = filename.toLowerCase();
  
  if (lower.includes('token')) return 'follower';
  if (lower.includes('spell')) return 'spell';
  if (lower.includes('amulet')) return 'amulet';
  
  // Default to follower (most common)
  return 'follower';
}

/**
 * Extract card name from filename
 * Removes extension and card code (e.g., BP15-001EN)
 */
function extractCardName(filename) {
  // Remove extension
  let name = path.basename(filename, path.extname(filename));
  
  // Remove card codes like BP15-001EN, BP15-U01EN, etc.
  name = name.replace(/^BP\d+-[UL]?\d+[A-Z]+[-_]?/i, '');
  name = name.replace(/^[A-Z]+\d+-[UL]?\d+[A-Z]+[-_]?/i, '');
  
  // Replace underscores/hyphens with spaces
  name = name.replace(/[_-]/g, ' ');
  
  // Trim whitespace
  name = name.trim();
  
  return name;
}

/**
 * Scan directory for card images and extract costs
 */
async function scanDirectory(directoryPath, options = {}) {
  const {
    recursive = false,
    extensions = ['.png', '.jpg', '.jpeg', '.webp'],
    outputPath = null,
    reviewMode = false
  } = options;
  
  console.log(`\n📁 Scanning directory: ${directoryPath}\n`);
  
  try {
    const files = await fs.readdir(directoryPath);
    const results = [];
    const needsReview = [];
    
    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      const stat = await fs.stat(filePath);
      
      if (stat.isDirectory() && recursive) {
        // Recursively scan subdirectories
        const subResults = await scanDirectory(filePath, options);
        results.push(...subResults.results);
        needsReview.push(...subResults.needsReview);
        continue;
      }
      
      const ext = path.extname(file).toLowerCase();
      if (!extensions.includes(ext)) {
        continue;
      }
      
      // Extract cost from image
      const costData = await extractCostFromImage(filePath);
      const cardName = extractCardName(file);
      const cardType = guessCardType(file);
      
      const result = {
        filename: file,
        path: filePath,
        cardName: cardName,
        type: cardType,
        cost: costData.cost,
        confidence: costData.confidence,
        raw: costData.raw,
        warning: costData.warning,
        error: costData.error
      };
      
      results.push(result);
      
      // Flag for review if low confidence or error
      if (costData.warning || costData.error || costData.cost === null) {
        needsReview.push(result);
      }
    }
    
    // Generate output if requested
    if (outputPath) {
      await generateOutput(results, needsReview, outputPath, reviewMode);
    }
    
    return { results, needsReview };
    
  } catch (error) {
    console.error(`Error scanning directory: ${error.message}`);
    throw error;
  }
}

/**
 * Generate output files with extracted costs
 */
async function generateOutput(results, needsReview, outputPath, reviewMode) {
  console.log(`\n📝 Generating output files...\n`);
  
  // Generate cardDatabase.js format
  const successfulCards = results.filter(r => r.cost !== null && !r.error);
  
  let output = '/**\n';
  output += ' * Auto-generated card costs from OCR\n';
  output += ` * Generated: ${new Date().toISOString()}\n`;
  output += ` * Total cards: ${results.length}\n`;
  output += ` * Successfully extracted: ${successfulCards.length}\n`;
  output += ` * Needs review: ${needsReview.length}\n`;
  output += ' */\n\n';
  output += 'export const cardCosts = {\n';
  
  for (const card of successfulCards) {
    output += `  "${card.cardName}": { cost: ${card.cost}, type: "${card.type}" },`;
    output += ` // Confidence: ${card.confidence}%`;
    if (card.warning) {
      output += ` ⚠️ ${card.warning}`;
    }
    output += '\n';
  }
  
  output += '};\n';
  
  // Write main output
  await fs.writeFile(outputPath, output, 'utf8');
  console.log(`✅ Wrote ${successfulCards.length} cards to ${outputPath}`);
  
  // Generate review file if there are issues
  if (needsReview.length > 0) {
    const reviewPath = outputPath.replace('.js', '_REVIEW.txt');
    let reviewOutput = 'Cards that need manual review:\n';
    reviewOutput += '='.repeat(50) + '\n\n';
    
    for (const card of needsReview) {
      reviewOutput += `Card: ${card.cardName}\n`;
      reviewOutput += `  File: ${card.filename}\n`;
      reviewOutput += `  Extracted cost: ${card.cost ?? 'FAILED'}\n`;
      reviewOutput += `  Confidence: ${card.confidence}%\n`;
      reviewOutput += `  Raw OCR: "${card.raw}"\n`;
      if (card.warning) {
        reviewOutput += `  Warning: ${card.warning}\n`;
      }
      if (card.error) {
        reviewOutput += `  Error: ${card.error}\n`;
      }
      reviewOutput += `  Action needed: `;
      if (card.cost === null) {
        reviewOutput += 'Manually add cost to cardDatabase.js\n';
      } else {
        reviewOutput += 'Verify cost is correct\n';
      }
      reviewOutput += '\n';
    }
    
    await fs.writeFile(reviewPath, reviewOutput, 'utf8');
    console.log(`⚠️  ${needsReview.length} cards need review - see ${reviewPath}`);
  }
  
  // Generate statistics
  const stats = {
    total: results.length,
    successful: successfulCards.length,
    needsReview: needsReview.length,
    avgConfidence: successfulCards.reduce((sum, c) => sum + c.confidence, 0) / successfulCards.length,
    costDistribution: {}
  };
  
  for (const card of successfulCards) {
    stats.costDistribution[card.cost] = (stats.costDistribution[card.cost] || 0) + 1;
  }
  
  console.log('\n📊 Statistics:');
  console.log(`  Total cards processed: ${stats.total}`);
  console.log(`  Successfully extracted: ${stats.successful} (${Math.round(stats.successful / stats.total * 100)}%)`);
  console.log(`  Average confidence: ${Math.round(stats.avgConfidence)}%`);
  console.log(`  Needs review: ${stats.needsReview}`);
  console.log('\n  Cost distribution:');
  for (let cost = 0; cost <= 10; cost++) {
    const count = stats.costDistribution[cost] || 0;
    if (count > 0) {
      console.log(`    Cost ${cost}: ${count} cards`);
    }
  }
}

/**
 * Command-line interface
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node cardCostExtractor.js <directory> [output.js]');
    console.log('');
    console.log('Examples:');
    console.log('  node cardCostExtractor.js ./public/textures');
    console.log('  node cardCostExtractor.js ./public/textures ./src/utils/extractedCosts.js');
    console.log('');
    console.log('Options:');
    console.log('  --recursive    Scan subdirectories');
    console.log('  --review       Generate detailed review file');
    process.exit(1);
  }
  
  const directoryPath = args[0];
  const outputPath = args[1] || './extractedCosts.js';
  const recursive = args.includes('--recursive');
  const reviewMode = args.includes('--review');
  
  console.log('🎴 Card Cost Extractor');
  console.log('='.repeat(50));
  
  const { results, needsReview } = await scanDirectory(directoryPath, {
    recursive,
    outputPath,
    reviewMode
  });
  
  console.log('\n✅ Done!\n');
  
  if (needsReview.length > 0) {
    console.log(`⚠️  ${needsReview.length} cards need manual review`);
    console.log('Please check the _REVIEW.txt file and update cardDatabase.js');
  }
}

// Export for use as module
module.exports = {
  extractCostFromImage,
  scanDirectory,
  extractCardName,
  guessCardType
};

// Run CLI if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
