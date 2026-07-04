import fs from 'fs';

const sheetPath = 'd:/Dikshant/Internship/AAMS/AAMS/src/lib/extracted_excel/xl/worksheets/sheet1.xml';
const stringsPath = 'd:/Dikshant/Internship/AAMS/AAMS/src/lib/extracted_excel/xl/sharedStrings.xml';

const sheetXml = fs.readFileSync(sheetPath, 'utf8');
const stringsXml = fs.readFileSync(stringsPath, 'utf8');

// Load shared strings
const strings = [];
const stringMatches = stringsXml.matchAll(/<si>(.*?)<\/si>/gs);
for (const match of stringMatches) {
  const tMatch = match[1].match(/<t[^>]*>(.*?)<\/t>/s);
  strings.push(tMatch ? tMatch[1] : '');
}

// Find index of "NTA1-802" in strings
const strIdx = strings.findIndex(s => s === 'NTA1-802');
console.log('NTA1-802 index in sharedStrings:', strIdx);

if (strIdx !== -1) {
  // Find where it's used in sheetXml
  // E.g. <v>strIdx</v>
  // Let's search for `<v>strIdx</v>`
  const searchPattern = new RegExp(`<c r="([A-Z]+[0-9]+)" s="([0-9]+)"[^>]*?><v>${strIdx}</v></c>`);
  const match = sheetXml.match(searchPattern);
  if (match) {
    console.log('Found NTA1-802 cell:', match[0]);
  } else {
    // try looser match
    const loosePattern = new RegExp(`<c r="([A-Z]+[0-9]+)" s="([0-9]+)"[^>]*?>.*?${strIdx}.*?</c>`);
    const looseMatch = sheetXml.match(loosePattern);
    if (looseMatch) {
      console.log('Loose match NTA1-802 cell:', looseMatch[0]);
    } else {
      console.log('Could not find cell containing index', strIdx);
    }
  }
}
