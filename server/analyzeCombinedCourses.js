import XLSX from 'xlsx';

const wb = XLSX.readFile('./data/Course_File.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws);

console.log('=== ANALYZING COMBINED COURSES ===\n');

// Look at the Br_Code&CrsN column which seems to combine dept and course number
const combined = data.slice(0, 20).map(r => ({
  Br_Code: r.Br_Code,
  CrsN: r.CrsN,
  Combined: r['Br_Code&CrsN'],
  Title: r.Title,
  Br: r.Br
}));

console.log('Sample Combined Course Codes:');
console.log(JSON.stringify(combined, null, 2));

// Find courses with special patterns
console.log('\n\n=== LOOKING FOR MULTI-DEPT COURSES ===\n');

// Check if any Br_Code&CrsN has multiple department codes
const multiDeptPattern = data.filter(r => {
  const combined = r['Br_Code&CrsN'] || '';
  // Look for patterns like COBEAELA or similar
  return combined.length > 20 || (combined.match(/BEA/g) || []).length > 1;
});

if (multiDeptPattern.length > 0) {
  console.log(`Found ${multiDeptPattern.length} courses with unusual patterns:`);
  multiDeptPattern.slice(0, 10).forEach(r => {
    console.log(`  ${r['Br_Code&CrsN']} - ${r.Title}`);
  });
} else {
  console.log('No multi-department combined codes found.');
}

// Check CrsN column for patterns
console.log('\n\n=== COURSE NUMBER PATTERNS ===\n');

const courseNumberSamples = [...new Set(data.map(r => r.CrsN))].slice(0, 30);
console.log('Sample Course Numbers:');
courseNumberSamples.forEach(c => console.log(`  "${c}"`));

// Check for courses offered to multiple departments
console.log('\n\n=== COURSES OFFERED TO MULTIPLE DEPARTMENTS ===\n');

const courseTitleMap = {};
data.forEach(r => {
  const title = r.Title;
  const code = r.CrsN ? r.CrsN.trim() : '';
  if (!courseTitleMap[code]) {
    courseTitleMap[code] = {
      title: title,
      depts: new Set(),
      count: 0
    };
  }
  courseTitleMap[code].depts.add(r.Br_Code);
  courseTitleMap[code].count++;
});

const sharedCourses = Object.entries(courseTitleMap)
  .filter(([code, info]) => info.depts.size > 1)
  .sort((a, b) => b[1].depts.size - a[1].depts.size)
  .slice(0, 15);

console.log(`Found ${sharedCourses.length} courses offered to multiple departments:\n`);
sharedCourses.forEach(([code, info]) => {
  console.log(`${code} - ${info.title}`);
  console.log(`  Offered to: ${[...info.depts].join(', ')}`);
  console.log(`  Total entries: ${info.count}\n`);
});
