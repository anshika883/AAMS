import XLSX from 'xlsx';

const filePath = 'd:/Dikshant/Internship/AAMS/AAMS/mockup/BOOKING_WITH_FURN_DETAILS_CLEANED (1).xlsx';
const workbook = XLSX.readFile(filePath, { cellStyles: true });
const worksheet = workbook.Sheets['Guesthouses'];

const json = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

for (let r = 0; r < 20; r++) {
  const rowVal = json[r];
  if (!rowVal) continue;
  console.log(`Row ${r+1}:`, rowVal.slice(0, 10));
}
