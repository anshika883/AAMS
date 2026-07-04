import XLSX from 'xlsx';

const filePath = 'd:/Dikshant/Internship/AAMS/BOOKING WITH FURN DETAILS original AI 25062026.xlsx';
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const range = XLSX.utils.decode_range(worksheet['!ref']);

console.log('--- POTENTIAL GUESTHOUSES IN SHEET ---');
for (let r = 0; r <= range.e.r; r++) {
  const flatCell = worksheet[XLSX.utils.encode_cell({ r, c: 1 })];
  const deptCell = worksheet[XLSX.utils.encode_cell({ r, c: 2 })];
  const nameCell = worksheet[XLSX.utils.encode_cell({ r, c: 3 })];

  const flatVal = flatCell ? String(flatCell.v).trim() : '';
  const deptVal = deptCell ? String(deptCell.v).trim() : '';
  const nameVal = nameCell ? String(nameCell.v).trim() : '';

  if (flatVal && (
    deptVal.toLowerCase().includes('gh') || 
    deptVal.toLowerCase().includes('guest house') ||
    nameVal.toLowerCase() === 'gh' || 
    nameVal.toLowerCase() === 'guest house'
  )) {
    console.log(`Row ${r}: Flat: ${flatVal}, Deptt: ${deptVal}, Name: ${nameVal}`);
  }
}
