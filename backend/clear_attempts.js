const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://neondb_owner:npg_NCsHOdlKD07e@ep-hidden-cake-aoocspgi-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
});

async function run() {
  await client.connect();
  try {
    const res = await client.query('DELETE FROM assessment_attempts;');
    console.log('Cleared attempts:', res.rowCount);
  } catch (e) {
    console.log('Error clearing attempts:', e.message);
  }
  await client.end();
}

run().catch(console.error);
