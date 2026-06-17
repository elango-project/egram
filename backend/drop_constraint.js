const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://neondb_owner:npg_NCsHOdlKD07e@ep-hidden-cake-aoocspgi-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
});

async function run() {
  await client.connect();
  try {
    const res1 = await client.query('ALTER TABLE assessment_attempts DROP CONSTRAINT IF EXISTS idx_assessment_attempts_student_assessment CASCADE');
    console.log('Constraint drop result:', res1);
  } catch (e) {
    console.log('Error dropping constraint (may not exist):', e.message);
  }

  try {
    const res2 = await client.query('DROP INDEX IF EXISTS idx_assessment_attempts_student_assessment CASCADE');
    console.log('Index drop result:', res2);
  } catch (e) {
    console.log('Error dropping index (may not exist):', e.message);
  }

  await client.end();
}

run().catch(console.error);
