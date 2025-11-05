import { MongoClient, ServerApiVersion } from "mongodb";
import { searchRecipeFromAPI } from "../src/external/recipeApi.js";
import dotenv from "dotenv";
dotenv.config();

const dbName = "mydb";
const uri = process.env.DB_URL;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

async function importRecipes() {
    try {
        await client.connect();
        const db = client.db(dbName);
        const recipeCol = db.collection("recipe");

        const diseases = await db.collection("disease").find({}).toArray();

        for (const disease of diseases) {
            await new Promise((resolve) => {
                searchRecipeFromAPI(disease.name, async (recipes) => {
                    if (recipes.length > 0) {
                        await recipeCol.insertMany(
                            recipes.map((r) => ({
                                diseaseId: disease._id,
                                recipeName: r.RCP_NM,
                                ingredients: r.RCP_PARTS_DTLS,
                                manual: r.MANUAL01,
                            }))
                        );
                        console.log(`${disease.name} 관련 ${recipes.length}건 저장 완료`);
                    }
                    resolve();
                });
            });
        }
    } catch (err) {
        console.error("Import failed:", err);
    } finally {
        await client.close();
    }
}

(async () => {
    await importRecipes();
})();
