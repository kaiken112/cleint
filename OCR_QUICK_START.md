# 🔍 OCR Card Cost Extraction - Quick Start

## Two Options Available

### Option 1: Browser-Based (Easiest!) ⭐

**Perfect for**: Quick extraction, no setup required

1. **Open** `tools/browserOCR.html` in your browser
2. **Drag & drop** your card images
3. **See** costs extracted in real-time
4. **Copy** the generated JavaScript code
5. **Paste** into `src/utils/cardDatabase.js`

**Time**: 5-10 minutes for 100 cards  
**Setup**: None!  
**Accuracy**: 70-90%

---

### Option 2: Command Line (More Powerful)

**Perfect for**: Large batches, automation

```bash
# 1. Install dependencies
npm install tesseract.js sharp

# 2. Run extractor
node tools/cardCostExtractor.js public/textures src/utils/extractedCosts.js

# 3. Check output
cat src/utils/extractedCosts.js
cat src/utils/extractedCosts_REVIEW.txt

# 4. Merge into cardDatabase.js
```

**Time**: 10-15 minutes for 1000 cards  
**Setup**: npm install  
**Accuracy**: 80-95%

---

## What Gets Extracted

From this image filename:
```
BP15-001EN-FireSpell.png
```

Extracts:
```javascript
"FireSpell": { cost: 3, type: "spell" }
```

The OCR reads the cost number from the top-left corner of the card image.

---

## Quick Tips

### For Best Results
✅ High-resolution images (300+ DPI)  
✅ Clear, readable cost numbers  
✅ Consistent card layout  
✅ Good contrast between cost and background

### Common Issues
- **Cost shows as null**: OCR couldn't read the number - add manually
- **Wrong cost**: OCR misread (like 0 vs O) - check review file
- **Low confidence**: Might be correct, but verify manually

---

## Full Documentation

See `tools/OCR_GUIDE.md` for:
- Detailed usage instructions
- Configuration options
- Troubleshooting guide
- Accuracy tips
- Integration with main system

---

## Integration Example

After extraction, add to your cardDatabase.js:

```javascript
// In src/utils/cardDatabase.js
import { cardCosts as extractedCosts } from './extractedCosts';

export const cardCosts = {
  ...extractedCosts,  // Auto-extracted costs
  
  // Manual overrides if needed
  "Special Card": { cost: 5, type: "follower" },
};
```

---

## What You Get

✅ Saves hours of manual data entry  
✅ Works on hundreds of cards at once  
✅ Generates clean JavaScript code  
✅ Flags uncertain extractions for review  
✅ Shows confidence levels  
✅ Easy to use (especially browser version)

---

**Recommendation**: Start with browser version for 10-20 cards to test, then use command line for full collection if you have many cards.

Read `tools/OCR_GUIDE.md` for complete instructions!
