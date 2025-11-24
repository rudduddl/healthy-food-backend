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
                        recipeThumnail: r.ATT_FILE_NO_MK,
                        ingredients: r.RCP_PARTS_DTLS,
                        // 구조화된 매뉴얼 단계 및 이미지 저장
                        manualSteps: extractStructuredManual(r),
                    }));

                    // 👈 **처음 넣는 것 처럼 insertMany만 실행합니다.**
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

        // 텍스트 필드와 이미지 필드가 모두 존재하지 않거나 빈 문자열인 경우,
        // 해당 단계가 끝났다고 판단하고 루프를 종료합니다.
        // 다만, API 데이터는 마지막 필드까지 키가 존재하는 경향이 있으므로,
        // 텍스트가 있을 경우에만 저장하도록 합니다.
        if (!manualTextRaw || manualTextRaw.trim() === "") {
            // 텍스트가 없으면 해당 단계는 유효하지 않다고 보고 다음 단계로 넘어가지 않습니다.
            // (만약 04가 비어있는데 05에 값이 있을 가능성이 있다면 continue를 써야 하지만, 공공데이터는 순차적임)
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