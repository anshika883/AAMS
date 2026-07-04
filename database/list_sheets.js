import XLSX from 'xlsx';

const filePath = 'd:/Dikshant/Internship/AAMS/BOOKING WITH FURN DETAILS original AI 25062026.xlsx';
const workbook = XLSX.readFile(filePath);
console.log('Sheet Names:', workbook.SheetNames);
