import fs from 'fs';
import path from 'path';

const stylesPath = 'd:/Dikshant/Internship/AAMS/AAMS/src/lib/extracted_excel/xl/styles.xml';
const sheetPath = 'd:/Dikshant/Internship/AAMS/AAMS/src/lib/extracted_excel/xl/worksheets/sheet1.xml';

const stylesXml = fs.readFileSync(stylesPath, 'utf8');
const sheetXml = fs.readFileSync(sheetPath, 'utf8');

// Let's find all fills
// Fills are inside <fills count="...">...</fills>
// E.g. <fill><patternFill patternType="solid"><fgColor rgb="FF00FF00"/></patternFill></fill>
// Let's extract them
const fills = [];
const fillMatches = stylesXml.matchAll(/<fill>(.*?)<\/fill>/gs);
for (const match of fillMatches) {
  const content = match[1];
  const fgColorMatch = content.match(/<fgColor[^>]*?rgb="([A-Fa-f0-9]{8})"/i);
  const patternMatch = content.match(/patternType="([^"]+)"/);
  fills.push({
    xml: content,
    fgColor: fgColorMatch ? fgColorMatch[1] : null,
    patternType: patternMatch ? patternMatch[1] : null
  });
}

console.log('--- Fills found: ---');
fills.forEach((f, idx) => {
  console.log(`Fill ${idx}: color=${f.fgColor}, pattern=${f.patternType}`);
});

// Now let's extract cellXfs (Styles)
// E.g. <xf numFmtId="0" fontId="0" fillId="2" borderId="0" xfId="0" applyFill="1"/>
// The index of <xf> inside <cellXfs> represents the style index 's' used in sheet1.xml
const cellXfs = [];
const cellXfsSection = stylesXml.match(/<cellXfs[^>]*>(.*?)<\/cellXfs>/gs);
if (cellXfsSection) {
  const xfMatches = cellXfsSection[0].matchAll(/<xf (.*?)\/?>/gs);
  for (const match of xfMatches) {
    const attrs = {};
    const attrString = match[1];
    attrString.matchAll(/(\w+)="([^"]*)"/g).forEach(m => {
      attrs[m[1]] = m[2];
    });
    cellXfs.push(attrs);
  }
}

console.log('\n--- Cell Styles (cellXfs) count: ---', cellXfs.length);

// Now let's check which cellXfs point to a green-ish fill.
// Green color might have high G component, e.g. "FFC6EFCE" (light green in Excel) or similar.
// Let's print styles that have a fill.
const greenFillIds = new Set();
fills.forEach((f, idx) => {
  if (f.fgColor) {
    const rgb = f.fgColor;
    const r = parseInt(rgb.substring(2, 4), 16);
    const g = parseInt(rgb.substring(4, 6), 16);
    const b = parseInt(rgb.substring(6, 8), 16);
    // Green color usually has green larger than red/blue, or we can look for specific green hexes like C6EFCE (Excel standard green) or 00FF00
    // Let's inspect which fillIds are green
    if (g > r && g > b && g > 150) {
      console.log(`Potential Green Fill ID: ${idx} with color ${rgb}`);
      greenFillIds.add(idx);
    } else if (rgb === 'FFC6EFCE' || rgb === 'FF90EE90' || rgb === 'FF00FF00' || rgb === 'FFD9EAD3' || rgb === 'FFE2EFDA') {
      console.log(`Exact Match Green Fill ID: ${idx} with color ${rgb}`);
      greenFillIds.add(idx);
    }
  }
});

const greenStyleIds = new Set();
cellXfs.forEach((xf, idx) => {
  const fillId = parseInt(xf.fillId, 10);
  if (greenFillIds.has(fillId)) {
    console.log(`Style S="${idx}" uses Green Fill ID: ${fillId}`);
    greenStyleIds.add(idx);
  }
});

// Let's parse sheet1.xml cells and find which cells have style in greenStyleIds
const greenCells = [];
// E.g. <c r="B60" s="12" t="s"><v>45</v></c>
const cellMatches = sheetXml.matchAll(/<c r="([A-Z]+[0-9]+)" s="([0-9]+)"[^>]*>/g);
for (const match of cellMatches) {
  const cellRef = match[1];
  const styleId = parseInt(match[2], 10);
  if (greenStyleIds.has(styleId)) {
    greenCells.push(cellRef);
  }
}

console.log(`\nFound ${greenCells.length} cells with green background:`, greenCells.slice(0, 50));
