/**
 * IMPROVED Card Cost Extractor - Crops ONLY the cost circle
 * Much more accurate by focusing on just the top-left corner
 */

const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

/**
 * Crop configuration - adjust these if needed
 */
const CROP_CONFIG = {
  // Crop region (pixels from top-left)
  x: 0,
  y: 0,
  width: 120,   // Just the cost circle
  height: 140,  // Just the cost circle
};

/**
 * Crop and preprocess image to isolate cost number
 */
async function preprocessImage(imagePath, outputPath) {
  try {
    await sharp(imagePath)
      .extract({
        left: CROP_CONFIG.x,
        top: CROP_CONFIG.y,
        width: CROP_CONFIG.width,
        height: CROP_CONFIG.height
      })
       () // Auto-adjust contrast
      .toFile(outputPath);
    
    return outputPath;
    
  } catch (error) {
    throw new Error(`Failed to preprocess image: ${error.message}`);
  }
}

/**
 * Extract cost from preprocessed image
 */
async function extractCostFromImage(imagePath, debug = false) {
  const filename = path.basename(imagePath);
  console.log(`Processing: ${filename}`);
  
  try {
    // Create temp directory for preprocessed images
    const tempDir = path.join(__dirname, 'temp_crops');
    await fs.mkdir(tempDir, { recursive: true });
    
    const tempPath = path.join(tempDir, `crop_${filename}`);
    
    // Preprocess: crop to top-left corner only
    await preprocessImage(imagePath, tempPath);
    
    if (debug) {
      console.log(`  Cropped image saved to: ${tempPath}`);
    }
    
    // Perform OCR on cropped image
    const result = await Tesseract.recognize(tempPath, 'eng', {
      logger: debug ? (m) => {
        if (m.status === 'recognizing text') {
          process.stdout.write(`\r  OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      } : undefined,
      tessedit_char_whitelist: '0123456789', // Only recognize digits
      tessedit_pageseg_mode: 10, // Treat as single character
    });
    
    if (debug) {
      console.log(''); // New line after progress
    }
    
    const text = result.data.text.trim();
    const confidence = result.data.confidence;
    
    console.log(`  Raw OCR: "${text}" (confidence: ${Math.round(confidence)}%)`);
    
    // Clean up temp file
    if (!debug) {
      await fs.unlink(tempPath).catch(() => {});
    }
    
    // Parse the cost
    const cost = parseInt(text);
    
    if (isNaN(cost) || cost < 0 || cost > 10) {
      console.log(`  ❌ Invalid cost: ${text}`);
      return { cost: null, confidence: 0, raw: text };
    }
    
    if (confidence < 70) {
      console.log(`  ⚠️  Low confidence: ${Math.round(confidence)}%`);
      return { cost: cost, confidence: confidence, raw: text, warning: 'low_confidence' };
    }
    
    console.log(`  ✅ Cost: ${cost}`);
    return { cost: cost, confidence: confidence, raw: text };
    
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    return { cost: null, confidence: 0, error: error.message };
  }
}

/**
 * Extract card name from filename
 */
function extractCardName(filename) {
  let name = filename.replace(/\.(png|jpg|jpeg|webp)$/i, '');
  name = name.replace(/^BP\d+-[UL]?\d+[A-Z]+[-_]?/i, '');
  name = name.replace(/^[A-Z]+\d+-[UL]?\d+[A-Z]+[-_]?/i, '');
  name = name.replace(/[_-]/g, ' ');
  return name.trim() || filename;
}

/**
 * Guess card type from filename
 */
function guessCardType(filename) {
  const lower = filename.toLowerCase();
  if (lower.includes('token') || lower.includes('-t')) return 'follower';
  if (lower.includes('spell')) return 'spell';
  if (lower.includes('amulet')) return 'amulet';
  return 'follower'; // Default
}

/**
 * Process a directory of images
 */
async function processDirectory(directoryPath, options = {}) {
  const {
    outputPath = './extractedCosts.js',
    debug = false,
    limit = null
  } = options;
  
  console.log(`\n🎴 Improved Card Cost Extractor`);
  console.log(`📁 Scanning: ${directoryPath}\n`);
  
  const files = await fs.readdir(directoryPath);
  const imageFiles = files.filter(f => 
    /\.(png|jpg|jpeg|webp)$/i.test(f)
  );
  
  if (limit) {
    imageFiles.splice(limit);
  }
  
  console.log(`Found ${imageFiles.length} images\n`);
  
  const results = [];
  const needsReview = [];
  
  for (const file of imageFiles) {
    const filePath = path.join(directoryPath, file);
    const costData = await extractCostFromImage(filePath, debug);
    const cardName = extractCardName(file);
    const cardType = guessCardType(file);
    
    const result = {
      filename: file,
      cardName: cardName,
      type: cardType,
      cost: costData.cost,
      confidence: costData.confidence,
      raw: costData.raw,
      warning: costData.warning,
      error: costData.error
    };
    
    results.push(result);
    
    if (costData.warning || costData.error || costData.cost === null) {
      needsReview.push(result);
    }
    
    console.log(''); // Blank line between cards
  }
  
  // Generate output
  await generateOutput(results, needsReview, outputPath);
  
  // Cleanup temp directory
  const tempDir = path.join(__dirname, 'temp_crops');
  if (!debug) {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
  
  return { results, needsReview };
}

/**
 * Generate output files
 */
async function generateOutput(results, needsReview, outputPath) {
  console.log(`\n📝 Generating output...\n`);
  
  const successful = results.filter(r => r.cost !== null && !r.error);
  
  let output = '/**\n';
  output += ' * Auto-generated card costs from IMPROVED OCR\n';
  output += ' * (Cropped to top-left corner only)\n';
  output += ` * Generated: ${new Date().toISOString()}\n`;
  output += ` * Total: ${results.length} | Extracted: ${successful.length}\n`;
  output += ' */\n\n';
  output += 'export const cardCosts = {\n';
  
  for (const card of successful) {
    output += `  "${card.cardName}": { cost: ${card.cost}, type: "${card.type}" },`;
    output += ` // ${card.filename} - Confidence: ${Math.round(card.confidence)}%`;
    if (card.warning) {
      output += ` ⚠️`;
    }
    output += '\n';
  }
  
  output += '};\n';
  
  await fs.writeFile(outputPath, output, 'utf8');
  console.log(`✅ Wrote ${successful.length} cards to ${outputPath}`);
  
  // Generate review file
  if (needsReview.length > 0) {
    const reviewPath = outputPath.replace('.js', '_REVIEW.txt');
    let reviewOutput = 'Cards that need manual review:\n';
    reviewOutput += '='.repeat(50) + '\n\n';
    
    for (const card of needsReview) {
      reviewOutput += `Card: ${card.cardName}\n`;
      reviewOutput += `  File: ${card.filename}\n`;
      reviewOutput += `  Extracted cost: ${card.cost ?? 'FAILED'}\n`;
      reviewOutput += `  Confidence: ${Math.round(card.confidence)}%\n`;
      reviewOutput += `  Raw OCR: "${card.raw}"\n`;
      if (card.warning) reviewOutput += `  Warning: ${card.warning}\n`;
      if (card.error) reviewOutput += `  Error: ${card.error}\n`;
      reviewOutput += '\n';
    }
    
    await fs.writeFile(reviewPath, reviewOutput, 'utf8');
    console.log(`⚠️  ${needsReview.length} cards need review - see ${reviewPath}`);
  }
  
  // Statistics
  const avgConf = successful.length > 0
    ? successful.reduce((sum, c) => sum + c.confidence, 0) / successful.length
    : 0;
  
  console.log('\n📊 Statistics:');
  console.log(`  Total: ${results.length}`);
  console.log(`  Successful: ${successful.length} (${Math.round(successful.length / results.length * 100)}%)`);
  console.log(`  Average confidence: ${Math.round(avgConf)}%`);
  console.log(`  Needs review: ${needsReview.length}`);
}

/**
 * Main CLI
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node improvedCardCostExtractor.js <directory> [output.js] [--debug] [--limit N]');
    console.log('');
    console.log('Examples:');
    console.log('  node improvedCardCostExtractor.js ./public/textures');
    console.log('  node improvedCardCostExtractor.js ./public/textures ./costs.js');
    console.log('  node improvedCardCostExtractor.js ./public/textures --limit 10 --debug');
    process.exit(1);
  }
  
  const directoryPath = args[0];
  const outputPath = args.find(a => a.endsWith('.js')) || './extractedCosts.js';
  const debug = args.includes('--debug');
  const limitIndex = args.indexOf('--limit');
  const limit = limitIndex >= 0 ? parseInt(args[limitIndex + 1]) : null;
  
  const { results, needsReview } = await processDirectory(directoryPath, {
    outputPath,
    debug,
    limit
  });
  
  console.log('\n✅ Done!\n');
  
  if (needsReview.length > 0) {
    console.log(`⚠️  Review ${needsReview.length} cards and update costs manually`);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { extractCostFromImage, processDirectory };
