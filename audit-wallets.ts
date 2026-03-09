import { MongoClient } from 'mongodb';

async function auditWallets() {
  const url = 'mongodb+srv://akshay:akshay@cluster0.jy7weei.mongodb.net/SolanaHabits';
  const client = new MongoClient(url);
  try {
    await client.connect();
    const db = client.db();
    
    for (const col of ['user', 'users', 'session', 'sessions', 'walletAddress']) {
      console.log(`--- ${col.toUpperCase()} ---`);
      const data = await db.collection(col).find().toArray();
      console.log(`Count: ${data.length}`);
      if (data.length > 0) {
        console.log(JSON.stringify(data.slice(0, 5), null, 2));
      }
    }

  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

auditWallets();
