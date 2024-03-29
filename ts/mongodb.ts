import {Collection, MongoClient, ServerApiVersion} from 'mongodb';
const MONGODB_URI = process.env.MONGODB_URI;
import * as dotenv from 'dotenv';
dotenv.config();
const client = new MongoClient(MONGODB_URI!, {
  //   useNewUrlParser: true,
  //   useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
let logCollection: Collection;
export async function connectMongodb() {
  try {
    console.log('> connecting to MongoDB');
    await client.connect();
    const db = client.db('discord');
    const collection = db.collection('interaction_log');
    logCollection = collection;
    console.log(
      `> connected to mongodb, database: ${db.databaseName}, collection: ${collection.collectionName}`
    );
  } catch (err) {
    console.log(err);
  }
}

export async function log(name: string, message: string) {
  try {
    const object = {name: name, message: message};
    if (logCollection) {
      logCollection.insertOne(object);
    } else {
      return;
    }
  } catch (err) {
    console.log(err);
  }
}
