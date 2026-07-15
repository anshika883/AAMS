import fs from 'fs';
import path from 'path';

const xlDir = 'd:/Dikshant/Internship/AAMS/AAMS/database/extracted_excel/xl';
const sheetPath = path.join(xlDir, 'worksheets/sheet1.xml');
const stringsPath = path.join(xlDir, 'sharedStrings.xml');

const sheetXml = fs.readFileSync(sheetPath, 'utf8');
const stringsXml = fs.readFileSync(stringsPath, 'utf8');

// Load shared strings
const strings = [];
const stringMatches = stringsXml.matchAll(/<si>(.*?)<\/si>/gs);
for (const match of stringMatches) {
  const tMatch = match[1].match(/<t[^>]*>(.*?)<\/t>/s);
  strings.push(tMatch ? tMatch[1] : '');
}

// Parse cells into grid
const grid = {};
const cellRegex = /<c r="([A-Z]+[0-9]+)" s="([0-9]+)"([^>]*?)(?:\/>|>(.*?)<\/c>)/gs;

let cellMatch;
while ((cellMatch = cellRegex.exec(sheetXml)) !== null) {
  const ref = cellMatch[1];
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

  if (!grid[row]) grid[row] = {};
  grid[row][col] = val;
}

// Print rows 1 to 20
for (let r = 1; r <= 20; r++) {
  const rowObj = grid[r];
  if (!rowObj) continue;
  console.log(`Row ${r}:`, JSON.stringify(rowObj));
}
