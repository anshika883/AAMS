import XLSX from 'xlsx';
import path from 'path';

const filePath = 'd:/Dikshant/Internship/AAMS/BOOKING WITH FURN DETAILS original AI 25062026.xlsx';
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

console.log('Sheet Name:', sheetName);

// Let's print the first 50 rows, specifically column B (Flat) and C (Deptt), D (Name), E (People count), F (Furni&Fix) etc.
const range = XLSX.utils.decode_range(worksheet['!ref']);
console.log('Range:', range);

for (let r = 0; r <= Math.min(100, range.e.r); r++) {
  const rowData = [];
  for (let c = 0; c <= Math.min(15, range.e.c); c++) {
    const cellRef = XLSX.utils.encode_cell({ r, c });
    const cell = worksheet[cellRef];
    rowData.push(cell ? cell.v : '');
  }
  if (rowData.some(v => v !== '')) {
    console.log(`Row ${r}:`, rowData.slice(0, 10).map(v => String(v).substring(0, 20)));
  }
}
