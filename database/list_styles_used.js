import fs from 'fs';

const stylesPath = 'd:/Dikshant/Internship/AAMS/AAMS/src/lib/extracted_excel/xl/styles.xml';
const sheetPath = 'd:/Dikshant/Internship/AAMS/AAMS/src/lib/extracted_excel/xl/worksheets/sheet1.xml';

const stylesXml = fs.readFileSync(stylesPath, 'utf8');
const sheetXml = fs.readFileSync(sheetPath, 'utf8');

// Parse cellXfs (Styles)
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

// Group cell refs by style ID
const cellsByStyle = {};
const cellRegex = /<c r="([A-Z]+[0-9]+)" s="([0-9]+)"[^>]*>/g;
let match;
while ((match = cellRegex.exec(sheetXml)) !== null) {
  const ref = match[1];
  const styleId = parseInt(match[2], 10);
  if (!cellsByStyle[styleId]) cellsByStyle[styleId] = [];
  cellsByStyle[styleId].push(ref);
}

// For each style ID, print details
console.log('--- STYLES USED IN SHEET1.XML ---');
Object.keys(cellsByStyle).forEach(styleId => {
  const xf = cellXfs[styleId] || {};
  const fillId = xf.fillId ? parseInt(xf.fillId, 10) : -1;
  console.log(`Style ID ${styleId}: fillId=${fillId}, count=${cellsByStyle[styleId].length}, first few:`, cellsByStyle[styleId].slice(0, 10));
});
