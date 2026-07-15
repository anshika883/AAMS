import XLSX from 'xlsx';

const filePath = 'd:/Dikshant/Internship/AAMS/AAMS/mockup/BOOKING_WITH_FURN_DETAILS_CLEANED (1).xlsx';
const workbook = XLSX.readFile(filePath, { cellStyles: true });
const worksheet = workbook.Sheets['Flat Occupancy'];

const json = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

for (let r = 0; r < 25; r++) {
  const rowVal = json[r];
  if (!rowVal) continue;
  
  // Also print the style of cell A (Flat No)
  const cellRef = XLSX.utils.encode_cell({ r, c: 0 });
  const cell = worksheet[cellRef];
  const color = cell && cell.s && cell.s.fgColor && cell.s.fgColor.rgb ? cell.s.fgColor.rgb : 'none';
  
  console.log(`Row ${r+1}:`, rowVal.slice(0, 8), `Cell A Style:`, color);
}
