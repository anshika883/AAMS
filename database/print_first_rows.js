import XLSX from 'xlsx';

const filePath = 'd:/Dikshant/Internship/AAMS/BOOKING WITH FURN DETAILS original AI 25062026.xlsx';
const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];

for (let r = 2; r <= 15; r++) {
  const row = [];
  ['A','B','C','D','E','F','G'].forEach(col => {
    const cell = sheet[col + r];
    row.push(cell ? cell.v : '');
  });
  console.log(`Row ${r}:`, row);
}
