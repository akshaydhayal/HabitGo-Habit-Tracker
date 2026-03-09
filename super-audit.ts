import { MongoClient, ObjectId } from 'mongodb';

async function superAudit() {
  const url = 'mongodb+srv://akshay:akshay@cluster0.jy7weei.mongodb.net/SolanaHabits';
  const client = new MongoClient(url);
  try {
    await client.connect();
    const admin = client.db().admin();
    const dbsResult = await admin.listDatabases();
    const dbNames = dbsResult.databases.map(d => d.name);
    console.log('Available Databases:', dbNames);

    const targetUserId = '69ae7b136aeb360858440bc9';
    console.log(`Searching for phantom user ID: ${targetUserId}`);

    for (const dbName of dbNames) {
      if (dbName === 'admin' || dbName === 'local' || dbName === 'config') continue;
      
      const db = client.db(dbName);
      const collections = await db.listCollections().toArray();
      
      for (const col of collections) {
        const query: any = { 
          $or: [
            { _id: targetUserId },
            { id: targetUserId },
            { userId: targetUserId }
          ] 
        };
        
        // Try with ObjectId too
        try {
          const oid = new ObjectId(targetUserId);
          query.$or.push({ _id: oid });
          query.$or.push({ userId: oid });
        } catch(e) {}

        const match = await db.collection(col.name).findOne(query);
        if (match) {
          console.log(`!!! MATCH FOUND IN ${dbName}.${col.name} !!!`);
          console.log(JSON.stringify(match, null, 2));
        }
      }
    }

    // Also list counts for SolanaHabits specifically
    const shDb = client.db('SolanaHabits');
    const shCols = await shDb.listCollections().toArray();
    console.log('--- SolanaHabits Collection Counts ---');
    for (const col of shCols) {
      const count = await shDb.collection(col.name).countDocuments();
      console.log(`${col.name}: ${count}`);
    }

  } catch (e) {
    console.error('Audit failed:', e);
  } finally {
    await client.close();
  }
}

superAudit();
