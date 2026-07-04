import fs from 'fs';

const sheetPath = 'd:/Dikshant/Internship/AAMS/AAMS/src/lib/extracted_excel/xl/worksheets/sheet1.xml';
const sheetXml = fs.readFileSync(sheetPath, 'utf8');

const condFormatting = sheetXml.match(/<conditionalFormatting[^>]*>(.*?)<\/conditionalFormatting>/gs);
if (condFormatting) {
  console.log(`Found ${condFormatting.length} conditional formatting sections.`);
  condFormatting.forEach((cf, idx) => {
    console.log(`Section ${idx}:`, cf.substring(0, 500));
  });
} else {
  console.log('No conditional formatting found.');
}
