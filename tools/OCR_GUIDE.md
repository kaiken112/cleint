# 🔍 OCR Card Cost Extractor

Automatically extract card costs from your card images using OCR (Optical Character Recognition).

## 🚀 Quick Start

### Option 1: Command Line (Node.js)

**Step 1: Install Dependencies**
```bash
npm install tesseract.js sharp
```

**Step 2: Run the Extractor**
```bash
node tools/cardCostExtractor.js public/textures src/utils/extractedCosts.js
```

This will:
- Scan all images in `public/textures`
- Extract costs using OCR
- Generate `extractedCosts.js` with card costs
- Create a review file for any failed extractions

### Option 2: Browser-Based (Simpler)

Open `tools/browserOCR.html` in your browser:
1. Drag and drop card images
2. See costs extracted in real-time
3. Copy generated JavaScript code
4. Paste into `cardDatabase.js`

---

## 📖 Detailed Usage

### Command Line Options

```bash
# Basic usage
node tools/cardCostExtractor.js <image_directory> [output_file]

# Scan subdirectories too
node tools/cardCostExtractor.js public/textures --recursive

# Generate detailed review file
node tools/cardCostExtractor.js public/textures --review

# Full example
node tools/cardCostExtractor.js public/textures src/utils/extractedCosts.js --recursive --review
```

### What It Does

1. **Scans Images**: Looks for .png, .jpg, .jpeg, .webp files
2. **Extracts Costs**: Uses OCR to read the cost number (usually in top-left corner)
3. **Guesses Type**: Determines if card is follower/spell/amulet from filename
4. **Generates Code**: Creates JavaScript code in cardDatabase.js format
5. **Flags Issues**: Cards with low confidence or errors go in review file

### Output Files

**Main Output** (`extractedCosts.js`):
```javascript
export const cardCosts = {
  "Card Name": { cost: 3, type: "follower" }, // Confidence: 95%
  "Another Card": { cost: 5, type: "spell" }, // Confidence: 87%
  // ...
};
```

**Review File** (`extractedCosts_REVIEW.txt`):
```
Cards that need manual review:
==================================================

Card: Mysterious Card
  File: BP15-123EN.png
  Extracted cost: FAILED
  Confidence: 0%
  Raw OCR: ""
  Error: Could not read image
  Action needed: Manually add cost to cardDatabase.js
```

---

## 🎯 How It Works

### OCR Process

1. **Image Loading**: Loads card image
2. **Region Detection**: Focuses on top-left corner (where cost usually is)
3. **Text Recognition**: Uses Tesseract.js to read numbers
4. **Validation**: Ensures cost is 0-10
5. **Confidence Check**: Flags if OCR confidence < 60%

### Card Name Extraction

Automatically extracts card names from filenames:
```
BP15-001EN.png          → "Card Name"
BP15-U01EN-CardName.png → "CardName"
card_name.jpg           → "card name"
```

### Type Guessing

Determines card type from filename:
```
token_fairy.png         → follower
fire_spell.png          → spell
amulet_shrine.png       → amulet
normal_card.png         → follower (default)
```

---

## 🔧 Configuration

Edit `cardCostExtractor.js` to customize:

```javascript
const OCR_CONFIG = {
  // Where to look for cost (percentage of image)
  costRegion: {
    x: 0,      // Left edge
    y: 0,      // Top edge
    width: 0.2,  // 20% of width
    height: 0.2  // 20% of height
  },
  
  // Minimum confidence to accept (0-100)
  minConfidence: 60,
  
  // Tesseract settings
  tesseractConfig: {
    lang: 'eng',
    psm: 7,  // Single text line
    tessedit_char_whitelist: '0123456789'  // Only numbers
  }
};
```

---

## 📊 Interpreting Results

### Good Results
```
Processing: BP15-001EN.png
  Raw OCR: "3" (confidence: 95%)
  ✅ Cost: 3
```
✅ High confidence, cost extracted correctly

### Low Confidence
```
Processing: BP15-002EN.png
  Raw OCR: "5" (confidence: 55%)
  ⚠️  Confidence 55% below threshold 60%
```
⚠️ Cost might be correct, but verify manually

### Failed Extraction
```
Processing: BP15-003EN.png
  Raw OCR: "O" (confidence: 45%)
  ⚠️  Could not parse cost as number
```
❌ OCR misread (0 vs O), needs manual entry

### Statistics Output
```
📊 Statistics:
  Total cards processed: 100
  Successfully extracted: 85 (85%)
  Average confidence: 82%
  Needs review: 15

  Cost distribution:
    Cost 0: 5 cards
    Cost 1: 12 cards
    Cost 2: 18 cards
    Cost 3: 20 cards
    ...
```

---

## 🐛 Troubleshooting

### Problem: All extractions fail
**Cause**: Images might not have clear cost numbers  
**Solution**: 
- Check if costs are visible in images
- Adjust `costRegion` to match your card layout
- Try with a few sample images first

### Problem: Wrong costs extracted
**Cause**: OCR misreading numbers  
**Solution**:
- Review the `_REVIEW.txt` file
- Manually fix incorrect costs
- Consider preprocessing images (increase contrast)

### Problem: Can't find card name
**Cause**: Filename doesn't match expected pattern  
**Solution**:
- Check `extractCardName()` function
- Add custom filename patterns
- Or manually rename after extraction

### Problem: Low success rate
**Cause**: Poor image quality or unusual layout  
**Solution**:
- Increase image resolution
- Ensure consistent card layout
- Adjust `minConfidence` threshold
- Preprocess images to enhance text

---

## 💡 Tips for Best Results

### Image Quality
- ✅ High resolution (300+ DPI)
- ✅ Clear, sharp text
- ✅ Good contrast
- ✅ Consistent lighting
- ❌ Blurry images
- ❌ Low resolution
- ❌ Watermarks over cost

### Card Layout
- Cost should be in consistent location
- Clear, readable font
- Not overlapped by artwork
- Good color contrast with background

### Batch Processing
1. Start with a small batch (10-20 cards)
2. Check accuracy
3. Adjust settings if needed
4. Process full collection
5. Review flagged cards

### Manual Review
Always review the output:
1. Check `_REVIEW.txt` for flagged cards
2. Spot-check random cards
3. Verify unusual costs (0, 10)
4. Fix any obvious mistakes

---

## 🔄 Workflow

### Complete Extraction Process

```bash
# 1. Install dependencies
npm install tesseract.js sharp

# 2. Run extractor
node tools/cardCostExtractor.js public/textures src/utils/extractedCosts.js --review

# 3. Review output
cat src/utils/extractedCosts_REVIEW.txt

# 4. Fix any issues manually in extractedCosts.js

# 5. Merge into cardDatabase.js
# Copy contents from extractedCosts.js to cardDatabase.js

# 6. Test in game
npm start
```

### Updating After New Cards

```bash
# Extract only new cards
node tools/cardCostExtractor.js public/textures/new_set src/utils/newCards.js

# Manually merge newCards.js into cardDatabase.js
```

---

## 📝 Integration with Main System

Once extraction is complete:

**Option A: Replace entire database**
```javascript
// In cardDatabase.js
import { cardCosts as extractedCosts } from './extractedCosts';
export const cardCosts = extractedCosts;
```

**Option B: Merge with existing**
```javascript
// In cardDatabase.js
import { cardCosts as extractedCosts } from './extractedCosts';

export const cardCosts = {
  ...extractedCosts,  // Auto-extracted costs
  
  // Manual overrides/additions
  "Special Card": { cost: 5, type: "follower" },
  "Another Card": { cost: 3, type: "spell" },
};
```

---

## 🎨 Alternative: Browser-Based Extractor

For a simpler approach without Node.js setup, use the browser version:

1. Open `tools/browserOCR.html`
2. Drag & drop images
3. See real-time extraction
4. Copy generated code
5. Paste into cardDatabase.js

Benefits:
- No installation needed
- Visual feedback
- Easier for small batches
- Can fix mistakes immediately

---

## 📈 Expected Accuracy

Based on typical card game images:

| Condition | Success Rate |
|-----------|-------------|
| High quality images | 85-95% |
| Medium quality | 70-85% |
| Low quality/blurry | 40-70% |
| Unusual fonts | 50-80% |
| Consistent layout | 90%+ |

**Plan for**: 10-20% of cards needing manual review

---

## 🆘 Getting Help

### Check These First
1. Are images loading correctly?
2. Is Tesseract.js installed?
3. Are costs visible in images?
4. Is output file being created?

### Debug Mode
Add console logging:
```javascript
// In cardCostExtractor.js
console.log('Debug info:', {
  imagePath,
  ocrResult,
  parsedCost
});
```

### Common Issues
- `Module not found`: Run `npm install`
- `Permission denied`: Check file permissions
- `No images found`: Check directory path
- `All costs null`: Images may not have readable costs

---

## 🚀 Next Steps

After extraction:
1. ✅ Review `_REVIEW.txt` file
2. ✅ Fix any obvious mistakes
3. ✅ Merge into `cardDatabase.js`
4. ✅ Test a few cards in game
5. ✅ Verify costs are correct
6. ✅ Deploy and play!

---

**Time Estimate**: 
- Setup: 5-10 minutes
- Extraction: 1-5 minutes per 100 cards
- Review: 10-30 minutes
- Total: 30-60 minutes for full collection

Much faster than manual entry! 🎉
