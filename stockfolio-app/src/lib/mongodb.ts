import { MongoClient, Db } from 'mongodb';

const DB_NAME = process.env.MONGODB_DB || 'stockfolio';

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient> | null = null;

if (process.env.MONGODB_URI) {
  const uri = process.env.MONGODB_URI;
  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = new MongoClient(uri).connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    clientPromise = new MongoClient(uri).connect();
  }
}

export async function getDb(): Promise<Db | null> {
  if (!clientPromise) return null;
  const client = await clientPromise;
  return client.db(DB_NAME);
}

export default clientPromise;
