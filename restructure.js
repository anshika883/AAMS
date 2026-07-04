import fs from 'fs';
import path from 'path';

const root = 'd:/Dikshant/Internship/AAMS/AAMS';

const pathsToMove = [
  'src',
  'public',
  'index.html',
  'package.json',
  'package-lock.json',
  'vite.config.js',
  'tailwind.config.js',
  '.oxlintrc.json'
];

// Create target directories
const frontendDir = path.join(root, 'frontend');
const databaseDir = path.join(root, 'database');
const backendDir = path.join(root, 'backend');

if (!fs.existsSync(frontendDir)) fs.mkdirSync(frontendDir);
if (!fs.existsSync(databaseDir)) fs.mkdirSync(databaseDir);
if (!fs.existsSync(backendDir)) fs.mkdirSync(backendDir);

// Move files/folders to frontend/
pathsToMove.forEach(p => {
  const srcPath = path.join(root, p);
  const destPath = path.join(frontendDir, p);
  if (fs.existsSync(srcPath)) {
    console.log(`Moving ${srcPath} to ${destPath}`);
    fs.renameSync(srcPath, destPath);
  } else {
    console.log(`Path ${srcPath} does not exist`);
  }
});

// Move analyze files to database/
const dbFiles = [
  'src/lib/analyze_green_cells.js',
  'src/lib/analyze_green_cell_values.js',
  'src/lib/find_cell_nta1_802.js',
  'src/lib/inspect_b61.js',
  'src/lib/inspect_conditional_formatting.js',
  'src/lib/inspect_workbook_rels.js',
  'src/lib/inspect_workbook_xml.js',
  'src/lib/list_sheets.js',
  'src/lib/list_styles_used.js',
  'src/lib/print_first_rows.js',
  'src/lib/search_all_green_sheets.js',
  'src/lib/extracted_excel'
];

dbFiles.forEach(f => {
  const srcPath = path.join(frontendDir, f);
  const destPath = path.join(databaseDir, path.basename(f));
  if (fs.existsSync(srcPath)) {
    console.log(`Moving DB analysis file ${srcPath} to ${destPath}`);
    fs.renameSync(srcPath, destPath);
  }
});

console.log('Restructuring complete!');
