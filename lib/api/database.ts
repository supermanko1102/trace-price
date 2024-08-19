import { MongoClient } from "mongodb";

const REGIONS = ["taipei", "newTaipei", "taoyuan"] as const;
export type Region = (typeof REGIONS)[number];

let client: MongoClient;

export async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(process.env.MONGODB_URI as string);
    await client.connect();
  }
  return client;
}

export function getCollection(db: any, region: Region) {
  return db.collection(`presale_houses_${region}`);
}

export { REGIONS };
