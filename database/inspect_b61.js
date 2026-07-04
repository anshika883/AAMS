import fs from 'fs';

const stylesPath = 'd:/Dikshant/Internship/AAMS/AAMS/src/lib/extracted_excel/xl/styles.xml';
const sheetPath = 'd:/Dikshant/Internship/AAMS/AAMS/src/lib/extracted_excel/xl/worksheets/sheet1.xml';

const stylesXml = fs.readFileSync(stylesPath, 'utf8');
const sheetXml = fs.readFileSync(sheetPath, 'utf8');

// Find Cell B61
// E.g. <c r="B61" s="23" ...
const match = sheetXml.match(/<c r="B61" s="([0-9]+)"/);
if (match) {
  const styleId = parseInt(match[1], 10);
  console.log('Cell B61 Style ID:', styleId);
  
  // Find style details
  const cellXfsSection = stylesXml.match(/<cellXfs[^>]*>(.*?)<\/cellXfs>/gs);
  if (cellXfsSection) {
    const xfs = cellXfsSection[0].match(/<xf (.*?)\/?>/gs);
    if (xfs && xfs[styleId]) {
      console.log('XF XML:', xfs[styleId]);
    }
  }
} else {
  console.log('B61 not found in sheet1.xml');
}
