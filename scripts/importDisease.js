import path from "path";
import fs from "fs";
import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.DB_URI;
console.log("DB_URI:", uri);

const client = new MongoClient(uri, {
    serverApi: ServerApiVersion.v1
});

async function connectAndInsert() {
    try {
        await client.connect();
        console.log("MongoDB connected");

        const db = client.db("mydb");
        const filePath = path.resolve("scripts/질병분류데이터수정.csv");

        const csv = fs.readFileSync(filePath, "utf8");
        const rows = csv.split("\r\n");

        for (const row of rows) {
            if (!row.trim()) continue;

            const columns = row.split("|");
            const categoryName = columns[0]?.trim();
            const diseaseName = columns[1]?.trim();
            const recommended = columns[2]?.trim();
            const caution = columns[3]?.trim();
            const etc = columns[4]?.trim();
            const foodCategory = columns[5]?.trim();

            if (!diseaseName) continue;

            await db.collection("disease").updateOne(
                { name: diseaseName },
                {
                    $set: {
                        category: categoryName,
                        recommended: recommended,
                        caution: caution,
                        etc: etc,
                        foodCategory: foodCategory
                    }
                },
                { upsert: true }
            );
            console.log(`Updated: ${diseaseName}`);
        }

    } catch (err) {
        console.error("MongoDB connection failed:", err);
    } finally {
        await client.close();
        console.log("MongoDB connection closed");
    }
}

connectAndInsert();
