import fs from 'fs';

const workbookPath = 'd:/Dikshant/Internship/AAMS/AAMS/src/lib/extracted_excel/xl/workbook.xml';
const xml = fs.readFileSync(workbookPath, 'utf8');
console.log('Workbook XML:', xml);
