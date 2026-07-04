import fs from 'fs';

const relsPath = 'd:/Dikshant/Internship/AAMS/AAMS/src/lib/extracted_excel/xl/_rels/workbook.xml.rels';
const xml = fs.readFileSync(relsPath, 'utf8');
console.log('Workbook rels XML:', xml);
