import fs from 'fs';
import path from 'path';

const xlDir = 'd:/Dikshant/Internship/AAMS/AAMS/database/extracted_excel/xl';
const stylesPath = path.join(xlDir, 'styles.xml');
const sheetPath = path.join(xlDir, 'worksheets/sheet1.xml');
const stringsPath = path.join(xlDir, 'sharedStrings.xml');

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

// Parse cells into grid
const grid = {};
const cellRegex = /<c r="([A-Z]+[0-9]+)" s="([0-9]+)"([^>]*?)(?:\/>|>(.*?)<\/c>)/gs;

let cellMatch;
while ((cellMatch = cellRegex.exec(sheetXml)) !== null) {
  const ref = cellMatch[1];
  const styleId = parseInt(cellMatch[2], 10);
  const extraAttrs = cellMatch[3];
  const cellContent = cellMatch[4] || '';

  const colMatch = ref.match(/([A-Z]+)/);
  const rowMatch = ref.match(/([0-9]+)/);
  if (!colMatch || !rowMatch) continue;

  const col = colMatch[1];
  const row = parseInt(rowMatch[1], 10);

  const typeMatch = extraAttrs.match(/t="([^"]+)"/);
  const type = typeMatch ? typeMatch[1] : '';
  const vMatch = cellContent.match(/<v>(.*?)<\/v>/);
  let val = vMatch ? vMatch[1] : '';
  if (type === 's' && val !== '') {
    val = strings[parseInt(val, 10)];
  }

  const xf = cellXfs[styleId] || {};
  const fillId = xf.fillId ? parseInt(xf.fillId, 10) : 0;
  const color = fills[fillId] || 'none';

  if (!grid[row]) grid[row] = {};
  grid[row][col] = { val, color, styleId };
}

// Print rows 1 to 150
for (let r = 1; r <= 150; r++) {
  const rowObj = grid[r];
  if (!rowObj) continue;

  const flat = rowObj['B'] ? rowObj['B'].val : '';
  const dept = rowObj['C'] ? rowObj['C'].val : '';
  const name = rowObj['D'] ? rowObj['D'].val : '';
  const count = rowObj['E'] ? rowObj['E'].val : '';
  const fColor = rowObj['B'] ? rowObj['B'].color : 'none';

  if (flat || dept || name || count) {
    console.log(`Row ${r}: Flat=[${flat}] Dept=[${dept}] Name=[${name}] Count=[${count}] FlatColor=[${fColor}]`);
  }
}
