import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";

const uri = process.env.DB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

//몽고DB 접속
export async function connect() {
  try {
    await client.connect();
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed", err);
    throw err;
  }
}

export function getDB() {
  return client.db("mydb");
}