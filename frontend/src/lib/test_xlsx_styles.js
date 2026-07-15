import XLSX from 'xlsx';

const filePath = 'd:/Dikshant/Internship/BOOKING WITH FURN DETAILS original AI 25062026.xlsx';
const workbook = XLSX.readFile(filePath, { cellStyles: true });
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Check cell B61 (NTA1-802)
const cellB61 = worksheet['B61'];
console.log('Cell B61 (NTA1-802):', cellB61 ? { v: cellB61.v, s: cellB61.s } : 'undefined');

// Check cell B129 (NTA2-101A)
const cellB129 = worksheet['B129'];
console.log('Cell B129 (NTA2-101A):', cellB129 ? { v: cellB129.v, s: cellB129.s } : 'undefined');
