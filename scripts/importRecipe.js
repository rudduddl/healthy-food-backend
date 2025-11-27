import { MongoClient, ServerApiVersion } from "mongodb";
import { searchRecipeFromAPI } from "../src/external/recipeApi.js";
import dotenv from "dotenv";
dotenv.config();

const dbName = "mydb";
const uri = process.env.DB_URI;
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

        // 질병 검색 기준 없이, 전체 레시피를 한 번에 요청합니다.
        const searchKeyword = "";

        await new Promise((resolve) => {
            // 외부 API 호출: 모든 레시피를 가져온다고 가정
            searchRecipeFromAPI(searchKeyword, async (recipes) => {
                if (recipes.length > 0) {

                    // 레시피 문서에 diseaseId 없이 순수 레시피 정보만 저장
                    const recipesToInsert = recipes.map((r) => ({
                        recipeName: r.RCP_NM,
                        recipeThumbnail: r.ATT_FILE_NO_MK,
                        ingredients: r.RCP_PARTS_DTLS,
                        // 구조화된 매뉴얼 단계 및 이미지 저장
                        manualSteps: extractStructuredManual(r),
                    }));

                    await recipeCol.insertMany(recipesToInsert);
                    console.log(`총 ${recipes.length}건의 레시피 저장 완료`);
                } else {
                    console.log("API로부터 가져올 레시피 데이터가 없습니다.");
                }
                resolve();
            });
        });

    } catch (err) {
        console.error("Import failed:", err);
    } finally {
        await client.close();
    }
}

(async () => {
    await importRecipes();
})();

function extractStructuredManual(recipe) {
    const manualSteps = [];
    let step = 1;

    const cleanupRegex = /(?<=\.)[a-z]$/i;

    while (true) {
        // MANUAL 뒤에 두 자리 숫자 포맷 (01, 02, ...)
        const keyText = `MANUAL${String(step).padStart(2, '0')}`;
        const keyImage = `MANUAL_IMG${String(step).padStart(2, '0')}`;

        const manualTextRaw = recipe[keyText];
        const manualImage = recipe[keyImage];

        // API 데이터가 MANUAL20까지만 존재하므로, 그 이상은 순회하지 않습니다.
        if (step > 20) {
            break;
        }

        if (!manualTextRaw || manualTextRaw.trim() === "") {
            break;
        }

        let cleanedText = manualTextRaw.trim();

        cleanedText = cleanedText.replace(cleanupRegex, '').trim();

        // 유효한 텍스트가 있는 경우에만 저장
        manualSteps.push({
            step: step,
            text: cleanedText.trim(),
            imageUrl: (manualImage || "").trim() // 이미지가 없으면 빈 문자열로 저장
        });

        step++;
    }

    return manualSteps;
}