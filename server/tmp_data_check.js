import fs from 'fs';
const data = JSON.parse(fs.readFileSync('courses_data.json', 'utf-8'));
const sem8 = data.filter(c => c.semester === 8);
const byDept = sem8.reduce((acc, c) => { const dept = String(c.dept || '').trim(); acc[dept] = (acc[dept] || 0) + 1; return acc; }, {});
console.log('sem8 total:', sem8.length);
console.log('dept counts:', byDept);
const csBad = sem8.filter(c => String(c.dept || '').trim().toUpperCase().includes('CS'));
console.log('sem8 CS-like count:', csBad.length);
console.log(csBad.slice(0,20));
