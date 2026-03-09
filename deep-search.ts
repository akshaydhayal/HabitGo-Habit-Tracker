import { MongoClient, ObjectId } from 'mongodb';

async function deepSearch() {
  const url = 'mongodb+srv://akshay:akshay@cluster0.jy7weei.mongodb.net/SolanaHabits';
  const client = new MongoClient(url);
  try {
    await client.connect();
    const db = client.db('SolanaHabits');
    const cols = await db.listCollections().toArray();
    
    // The ID we saw in the session from the logs
    const targetId = '69ae7b136aeb360858440bc9';
    console.log(`Deep searching for string: ${targetId}`);

    for (const col of cols) {
      const all = await db.collection(col.name).find().toArray();
      for (const doc of all) {
        if (JSON.stringify(doc).includes(targetId)) {
          console.log(`FOUND MATCH in ${col.name}:`);
          console.log(JSON.stringify(doc, null, 2));
        }
      }
    }

    // Check Akshay's user record and its sessions
    const firstUser = await db.collection('user').findOne({ name: 'Akshay' });
    if (firstUser) {
      console.log('--- AKSHAY USER RECORD ---');
      console.log(JSON.stringify(firstUser, null, 2));
      const sessCount = await db.collection('session').countDocuments({ 
        $or: [
          { userId: firstUser._id.toString() },
          { userId: firstUser._id }
        ]
      });
      console.log(`Akshay has ${sessCount} sessions.`);
    }

  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}
deepSearch();
