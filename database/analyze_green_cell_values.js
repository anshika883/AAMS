import fs from 'fs';

const stylesPath = 'd:/Dikshant/Internship/AAMS/AAMS/src/lib/extracted_excel/xl/styles.xml';
const sheetPath = 'd:/Dikshant/Internship/AAMS/AAMS/src/lib/extracted_excel/xl/worksheets/sheet1.xml';
const stringsPath = 'd:/Dikshant/Internship/AAMS/AAMS/src/lib/extracted_excel/xl/sharedStrings.xml';

const stylesXml = fs.readFileSync(stylesPath, 'utf8');
const sheetXml = fs.readFileSync(sheetPath, 'utf8');
const stringsXml = fs.readFileSync(stringsPath, 'utf8');

// Load shared strings
const strings = [];
const stringMatches = stringsXml.matchAll(/<si>(.*?)<\/si>/gs);
for (const match of stringMatches) {
  const tMatch = match[1].match(/<t[^>]*>(.*?)<\/t>/s);
  strings.push(tMatch ? tMatch[1] : '');
}

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

// Group cells by row
const rowsWithGreen = {};
const cellRegex = /<c r="([A-Z]+[0-9]+)" s="([0-9]+)"([^>]*?)(?:\/>|>(.*?)<\/c>)/gs;

let cellMatch;
while ((cellMatch = cellRegex.exec(sheetXml)) !== null) {
  const ref = cellMatch[1];
  const styleId = parseInt(cellMatch[2], 10);
  const extraAttrs = cellMatch[3];
  const cellContent = cellMatch[4] || '';
  
  const rowMatch = ref.match(/([0-9]+)/);
  const rowNum = rowMatch ? parseInt(rowMatch[1], 10) : 0;

  const typeMatch = extraAttrs.match(/t="([^"]+)"/);
  const type = typeMatch ? typeMatch[1] : '';
  const vMatch = cellContent.match(/<v>(.*?)<\/v>/);
  let val = vMatch ? vMatch[1] : '';
  if (type === 's' && val !== '') {
    val = strings[parseInt(val, 10)];
  }

  if (greenStyleIds.has(styleId)) {
    if (!rowsWithGreen[rowNum]) rowsWithGreen[rowNum] = [];
    rowsWithGreen[rowNum].push({ ref, val });
  }
}

console.log('--- ROWS WITH GREEN CELLS ---');
Object.keys(rowsWithGreen).forEach(row => {
  console.log(`Row ${row}:`, rowsWithGreen[row]);
});
