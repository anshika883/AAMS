import XLSX from 'xlsx';

const filePath = 'd:/Dikshant/Internship/AAMS/BOOKING WITH FURN DETAILS original AI 25062026.xlsx';
const workbook = XLSX.readFile(filePath, { cellStyles: true, cellHTML: true, cellNF: true, cellDates: true });
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Check row 60 (B61)
const cellB61 = worksheet['B61'];
console.log('Cell B61 (NTA1-802):', JSON.stringify(cellB61, null, 2));

const cellB33 = worksheet['B33']; // NTA1-402 (usually a normal flat)
console.log('Cell B33 (NTA1-402):', JSON.stringify(cellB33, null, 2));

// Let's search for "green" or "fill" or style in worksheet properties
console.log('Worksheet properties keys:', Object.keys(worksheet).filter(k => !k.startsWith('!')));
