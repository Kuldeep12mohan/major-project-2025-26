import XLSX from 'xlsx';

const wb = XLSX.readFile('./data/St_file.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws);

console.log('Student Faculty Number Analysis:\n');

// Extract dept codes from F_No (format: 24AEBEA121)
const samples = data.slice(0, 20).map(r => {
  const fNo = r.F_No || '';
  const year = fNo.substring(0, 2);  // 24
  const deptCode = fNo.substring(2, 4); // AE
  const suffix = fNo.substring(4, 7); // BEA
  const rollNo = fNo.substring(7); // 121
  return { F_No: fNo, year, deptCode, suffix, rollNo, Name: r.Name };
});

console.log('Sample Faculty Numbers:');
samples.forEach(s => console.log(s));

// Get unique dept codes from F_No
const deptCodes = [...new Set(data.map(r => {
  const fNo = r.F_No || '';
  return fNo.substring(2, 4);
}))].sort();

console.log('\n\nUnique Department Codes from F_No:');
console.log(deptCodes);

// Count students per dept
const deptCount = {};
data.forEach(row => {
  const fNo = row.F_No || '';
  const dept = fNo.substring(2, 4);
  deptCount[dept] = (deptCount[dept] || 0) + 1;
});

console.log('\n\nStudents per Department:');
Object.entries(deptCount)
  .sort((a, b) => b[1] - a[1])
  .forEach(([dept, count]) => {
    console.log(`${dept}: ${count} students`);
  });
