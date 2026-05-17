import XLSX from 'xlsx';

const wb = XLSX.readFile('./data/Course_File.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws);

// Extract unique Br_Code values
const brCodes = [...new Set(data.map(r => r.Br_Code))].sort();

console.log('All Unique Branch Codes (Br_Code):');
console.log(brCodes);

// Extract dept prefix (first 2 chars before BEA)
const deptCodes = [...new Set(brCodes.map(code => {
  if (code && code.includes('BEA')) {
    return code.replace('BEA', '');
  }
  return code;
}))].sort();

console.log('\n\nExtracted Department Codes:');
console.log(deptCodes);

// Count courses per department
console.log('\n\nCourses per Department:');
const deptCount = {};
data.forEach(row => {
  const code = row.Br_Code;
  if (code && code.includes('BEA')) {
    const dept = code.replace('BEA', '');
    deptCount[dept] = (deptCount[dept] || 0) + 1;
  }
});

Object.entries(deptCount)
  .sort((a, b) => b[1] - a[1])
  .forEach(([dept, count]) => {
    console.log(`${dept}: ${count} courses`);
  });

// Also check Br column mapping
console.log('\n\nBr_Code to Br mapping (sample):');
const mapping = {};
data.forEach(row => {
  const brCode = row.Br_Code;
  const br = row.Br;
  if (brCode && br) {
    const dept = brCode.replace('BEA', '');
    if (!mapping[dept]) {
      mapping[dept] = br;
    }
  }
});

Object.entries(mapping).sort().forEach(([deptCode, brShort]) => {
  console.log(`${deptCode}BEA → ${brShort}`);
});
