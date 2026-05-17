import XLSX from 'xlsx';

// Analyze Course_File.xlsx
console.log('=== COURSE_FILE.XLSX ===\n');
const courseWb = XLSX.readFile('./data/Course_File.xlsx');
const courseWs = courseWb.Sheets[courseWb.SheetNames[0]];
const courseData = XLSX.utils.sheet_to_json(courseWs);

console.log('Sheet Names:', courseWb.SheetNames);
console.log('Columns:', Object.keys(courseData[0] || {}));
console.log('Total Rows:', courseData.length);
console.log('\nFirst 5 rows:');
console.log(JSON.stringify(courseData.slice(0, 5), null, 2));

// Get unique values for key fields
console.log('\nUnique Categories:', [...new Set(courseData.map(r => r.Categ))]);
console.log('Unique Branches:', [...new Set(courseData.map(r => r.Br))]);
console.log('Unique T/P:', [...new Set(courseData.map(r => r['T/P']))]);

// Analyze St_file.xlsx
console.log('\n\n=== ST_FILE.XLSX ===\n');
const stWb = XLSX.readFile('./data/St_file.xlsx');
const stWs = stWb.Sheets[stWb.SheetNames[0]];
const stData = XLSX.utils.sheet_to_json(stWs);

console.log('Sheet Names:', stWb.SheetNames);
console.log('Columns:', Object.keys(stData[0] || {}));
console.log('Total Rows:', stData.length);
console.log('\nFirst 5 rows:');
console.log(JSON.stringify(stData.slice(0, 5), null, 2));

// Check for duplicate enrollment numbers
const enrollNos = stData.map(r => r.EnrollNo || r.enrollNo || r.Enroll_No);
const duplicates = enrollNos.filter((item, index) => enrollNos.indexOf(item) !== index);
console.log('\nDuplicate Enrollment Numbers:', duplicates.length > 0 ? duplicates : 'None');
