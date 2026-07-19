const dbUrl = "https://ep-blue-cherry-ai05ptbu.c-4.us-east-1.aws.neon.tech/sql";

async function test() {
  try {
    const res = await fetch(dbUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer npg_WQKd9plZJD0z', // Using the password as bearer token for Neon HTTP API
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: 'SELECT * FROM projects LIMIT 1;' })
    });
    const data = await res.json();
    console.log("DB Projects Table Test:", data);
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

test();
