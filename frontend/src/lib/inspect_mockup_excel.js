import XLSX from 'xlsx';

const filePath = 'd:/Dikshant/Internship/AAMS/AAMS/mockup/BOOKING_WITH_FURN_DETAILS_CLEANED (1).xlsx';
const workbook = XLSX.readFile(filePath, { cellStyles: true });
console.log('SheetNames:', workbook.SheetNames);

const worksheet = workbook.Sheets[workbook.SheetNames[0]];

// Find all cells that have style filled with color
const cellsWithColor = [];
const keys = Object.keys(worksheet).filter(k => !k.startsWith('!'));

keys.forEach(k => {
  const cell = worksheet[k];
  if (cell && cell.s && cell.s.patternType === 'solid' && cell.s.fgColor && cell.s.fgColor.rgb) {
    cellsWithColor.push({
      ref: k,
      val: cell.v,
      color: cell.s.fgColor.rgb
    });
  }
});

console.log('Total cells with fill color:', cellsWithColor.length);
console.log('Sample cells with color:', cellsWithColor.slice(0, 50));
