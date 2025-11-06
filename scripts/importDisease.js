import path from "path";
import fs from "fs";
import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.DB_URI;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

async function connectAndInsert() {
    try {
        await client.connect();
        console.log("MongoDB connected");

        const db = client.db("mydb");
        const filePath = path.resolve("scripts/질병분류데이터수정.csv");

        const csv = fs.readFileSync(filePath, { encoding: "utf8" });
        const rows = csv.split("\r\n");

        for (const row of rows) {
            if (!row.trim()) continue; // 빈 줄 건너뛰기
            const columns = row.split("|");
            const diseaseName = columns[1]?.trim();
            const caution = columns[3]?.trim();

            if (!diseaseName) continue;

            try {
                await db.collection("disease").updateOne(
                    { name: diseaseName },
                    { $set: { caution: caution } },
                    { upsert: true } // 없으면 새로 생성
                );
                console.log(`Updated: ${diseaseName}`);
            } catch (err) {
                console.error(`Error updating ${diseaseName}:`, err.message);
            }
        }

    } catch (err) {
        console.error("MongoDB connection failed:", err);
    } finally {
        await client.close();
        console.log("MongoDB connection closed");
    }
}

connectAndInsert();
