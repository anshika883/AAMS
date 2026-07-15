import XLSX from 'xlsx';

const filePath = 'd:/Dikshant/Internship/AAMS/AAMS/mockup/BOOKING_WITH_FURN_DETAILS_CLEANED (1).xlsx';
const workbook = XLSX.readFile(filePath, { cellStyles: true });
const worksheet = workbook.Sheets['Flat Occupancy'];

const range = XLSX.utils.decode_range(worksheet['!ref']);
console.log('Range:', range);

for (let r = range.s.r; r <= range.e.r; r++) {
  const cellRef = XLSX.utils.encode_cell({ r, c: 0 });
  const cell = worksheet[cellRef];
  if (cell && cell.v) {
    if (cell.s && cell.s.fgColor) {
      console.log(`Row ${r+1}: Flat="${cell.v}" Style=`, cell.s);
    }
  }
}
