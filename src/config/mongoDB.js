import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";

const uri = process.env.DB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// 몽고DB 접속
export async function connect() {
  try {
    await client.connect();

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (err) {
    console.error("MongoDB connection failed", err);
    throw err;
  }
}

export function getDB() {
  return client.db("mydb");
}