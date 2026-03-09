import { MongoClient } from 'mongodb';

async function findToken() {
  const url = 'mongodb+srv://akshay:akshay@cluster0.jy7weei.mongodb.net/SolanaHabits';
  const client = new MongoClient(url);
  try {
    await client.connect();
    const db = client.db();
    const prefix = 'DDgfE'; // The prefix from the user's log
    console.log(`Searching for prefix: ${prefix}`);
    
    const matches = await db.collection('session').find({ 
      $or: [
        { token: { $regex: '^' + prefix } },
        { sessionToken: { $regex: '^' + prefix } },
        { _id: { $regex: '^' + prefix } },
        { userId: { $regex: '^' + prefix } }
      ]
    }).toArray();
    
    console.log('Matches:', JSON.stringify(matches, null, 2));
    
    if (matches.length === 0) {
      console.log('No matches found. Listing top 5 sessions:');
      const top = await db.collection('session').find().sort({ createdAt: -1 }).limit(5).toArray();
      console.log(JSON.stringify(top, null, 2));
    }
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

findToken();
