const fs = require('fs');
const path = require('path');

const files = [
  'src/pages/Assessments/AdminAssessments.jsx',
  'src/pages/Assessments/StudentAssessments.jsx',
  'src/pages/Courses/AdminCourses.jsx',
  'src/pages/Courses/StudentCourses.jsx',
  'src/pages/Jobs/AdminJobs.jsx',
  'src/pages/Jobs/StudentJobs.jsx',
  'src/pages/Reals/AdminReals.jsx',
  'src/pages/Videos/AdminVideos.jsx'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes('import toast')) {
    content = content.replace(/(import React.*?;)/, "$1\nimport toast from 'react-hot-toast';");
  }

  content = content.replace(/alert\((.*)\)/g, 'toast.error($1)');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
});
