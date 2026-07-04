import fs from 'fs';
import path from 'path';

const xlDir = 'd:/Dikshant/Internship/AAMS/AAMS/src/lib/extracted_excel/xl';
const stylesPath = path.join(xlDir, 'styles.xml');
const stylesXml = fs.readFileSync(stylesPath, 'utf8');

// Load fills
const fills = [];
const fillMatches = stylesXml.matchAll(/<fill>(.*?)<\/fill>/gs);
for (const match of fillMatches) {
  const content = match[1];
  const fgColorMatch = content.match(/<fgColor[^>]*?rgb="([A-Fa-f0-9]{8})"/i);
  fills.push(fgColorMatch ? fgColorMatch[1] : null);
}

// Load cellXfs
const cellXfs = [];
const cellXfsSection = stylesXml.match(/<cellXfs[^>]*>(.*?)<\/cellXfs>/gs);
if (cellXfsSection) {
  const xfMatches = cellXfsSection[0].matchAll(/<xf (.*?)\/?>/gs);
  for (const match of xfMatches) {
    const attrs = {};
    match[1].matchAll(/(\w+)="([^"]*)"/g).forEach(m => {
      attrs[m[1]] = m[2];
    });
    cellXfs.push(attrs);
  }
}

// Identify green fills
const greenFillIds = new Set();
fills.forEach((fgColor, idx) => {
  if (fgColor) {
    const r = parseInt(fgColor.substring(2, 4), 16);
    const g = parseInt(fgColor.substring(4, 6), 16);
    const b = parseInt(fgColor.substring(6, 8), 16);
    if (g > r && g > b && g > 150) {
      greenFillIds.add(idx);
    } else if (fgColor === 'FFC6EFCE' || fgColor === 'FF90EE90' || fgColor === 'FF00FF00' || fgColor === 'FFD9EAD3' || fgColor === 'FFE2EFDA') {
      greenFillIds.add(idx);
    }
  }
});

const greenStyleIds = new Set();
cellXfs.forEach((xf, idx) => {
  const fillId = parseInt(xf.fillId, 10);
  if (greenFillIds.has(fillId)) {
    greenStyleIds.add(idx);
  }
});

// Search all sheet xmls
const worksheetsDir = path.join(xlDir, 'worksheets');
const files = fs.readdirSync(worksheetsDir);

files.forEach(file => {
  if (!file.endsWith('.xml')) return;
  const sheetXml = fs.readFileSync(path.join(worksheetsDir, file), 'utf8');
  
  const greenCells = [];
  const cellRegex = /<c r="([A-Z]+[0-9]+)" s="([0-9]+)"[^>]*>/g;
  let match;
  while ((match = cellRegex.exec(sheetXml)) !== null) {
    const ref = match[1];
    const styleId = parseInt(match[2], 10);
    if (greenStyleIds.has(styleId)) {
      greenCells.push(ref);
    }
  }
  if (greenCells.length > 0) {
    console.log(`File ${file} has ${greenCells.length} green cells:`, greenCells.slice(0, 10));
  }
});
