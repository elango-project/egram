const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://neondb_owner:npg_NCsHOdlKD07e@ep-hidden-cake-aoocspgi-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
});

async function run() {
  await client.connect();
  const res = await client.query("SELECT email, role FROM users WHERE email = 'admin@egram.com';");
  console.log(res.rows);
  await client.end();
}

run();
