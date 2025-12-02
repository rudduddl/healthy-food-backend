import { getDB } from "../config/mongoDB.js";
import { ObjectId } from "mongodb";

// id로 레시피 1개 조회
export async function findById(id) {
    try {
        const db = getDB();
        const recipe = await db
            .collection("recipe")
            .findOne({ _id : new ObjectId(id) });

        return recipe;
    } catch (err) {
        console.error("[recipeRepository] findById error : ", err);

        return null;
    }
    
}

// 레시피명으로 검색 (텍스트 검색)
export async function findByRecipeNameContaining(keyword){
    try {
        const db = getDB();
        const recipes = await db
            .collection("recipe")
            .find({ $text : { $search : keyword } }, { projection : { RCP_NM : 1 } })
            .toArray();

        return recipes;

    } catch (err) {
        console.error("[recipeRepository] findByRecipeNameContaining error : ", err);

        return [];
    }

}

/**
 * 특정 질환의 주의 음식 제외 레시피 목록 조회 (페이지네이션/검색 적용)
 */
export async function findCautionRecipesByDiseaseId(
    diseaseId,
    startIndex,
    keyword,
    limit=20
) {
    console.log("DEBUG: 리포지토리 내 startIndex:", startIndex);
    try {
        const db = getDB();

        // 1. 질환별 주의 식품 목록을 disease 컬렉션에서 조회
        const disease = await db.collection("disease").findOne({ _id: new ObjectId(diseaseId) });

        // disease 객체가 없거나 caution 필드가 없으면 즉시 종료하고 빈 값 반환
        if (!disease || !disease.caution) {
            console.log(`[recipeRepository] No caution foods defined for diseaseId: ${diseaseId}`);
            // 주의 식품이 없으므로, 검색어 필터링만 진행하거나 (아래 로직), 일단 빈 값을 반환합니다.
            // 모든 레시피를 반환하고 싶다면, 아래 query 생성 로직을 그대로 따라가면 됩니다.
        }

        // disease.caution에 안전하게 접근 및 cautionFoods 초기화
        const rawCaution = disease?.caution || "";
        const cautionFoods = rawCaution.split(",").map(food => food.trim()).filter(food => food.length > 0);

        // 주의 식품이 하나라도 포함된 문서를 찾는 $or 조건 배열 생성
        const exclusionConditions = cautionFoods.map(food => ({
            $or: [
                { recipeName: { $regex: food } },
                { ingredients: { $regex: food } },
            ]
        }));

        let query = {};

        // 주의 식품 키워드가 하나라도 있으면 $nor 조건으로 제외
        if (exclusionConditions.length > 0) {
            query = {
                $nor: exclusionConditions,
            };
        }

        // 검색 키워드 필터링
        if (keyword) {
            const searchCondition = {
                $or: [
                    { recipeName: { $regex: keyword, $options: 'i' } },
                    { ingredients: { $regex: keyword, $options: 'i' } }
                ]
            };

            // 기존 query(주의 식품 제외)와 검색 조건을 $and로 결합
            query = {
                $and: [
                    query,
                    searchCondition
                ]
            };
        }

        // totalCount는 필터링된 문서의 전체 개수
        const totalCount = await db.collection("recipe").countDocuments(query);

        console.log("startIndex : ", startIndex)

        // 주의 식품이 포함된 레시피 '제외'하고 페이지네이션 적용하여 조회
        const recipes = await db
            .collection("recipe")
            .find(query)
            .project({
                _id: 1,
                recipeName: 1,
                recipeThumbnail: 1,
            })
            .skip(startIndex) // 시작 위치만큼 건너뛰기
            .limit(limit)     // 요청된 개수만큼만 가져오기
            .toArray();

        console.log(`[recipeRepository] recipes count: ${recipes.length} / Total: ${totalCount}`);

        return {
            recipes: recipes,
            totalCount: totalCount
        };
    } catch (err) {
        console.error("[recipeRepository] findCautionRecipesByDiseaseId error:", err);
        // 오류 발생 시 빈 목록 반환
        return { recipes: [], totalCount: 0 };
    }
}
// 즐겨찾기 추가
export async function saveFavoriteRecipe(userId, recipeId) {
    try {
        const db = await getDB();
        const collection = db.collection("favoriteRecipe");

        // 1. 중복 확인 (이 레시피 ID와 사용자 ID 조합이 이미 존재하는지 확인)
        const existingFavorite = await collection.findOne({
            id: userId,
            recipeId: recipeId,
        });

        if (existingFavorite) {
            // 💡 이미 존재함: 라우터에서 '0'을 받아 "이미 추가되어 있습니다" 메시지를 보냅니다.
            console.log("[saveFavoriteRecipe] 중복 추가 시도:", userId, recipeId);
            return 0;
        }

        // 2. 중복이 없으면 문서 삽입
        await collection.insertOne({
            id: userId,
            recipeId: recipeId,
            // createdAt: new Date(), // 필요하다면 시간 정보도 추가 가능
        });

        // 💡 성공: 라우터에서 '1'을 받아 "success" 메시지를 보냅니다.
        console.log("[saveFavoriteRecipe] 즐겨찾기 추가 성공:", userId, recipeId);
        return 1;

    } catch (err) {
        // 💡 DB 오류 발생 시
        console.error("[recipeRepository] saveFavoriteRecipe error : ", err);
        return -1; // 라우터에서 실패 처리 (else 블록)
    }
}


// 즐겨찾기 목록 조회
export async function findFavoriteRecipeByUser(userId) {
    try {
        const db = getDB();
        const result = [];
        const favoriteRecipeIds = await db
            .collection("favoriteRecipe")
            .find({ _id : new ObjectId(userId) })
            .toArray();

        console.log("favoriteRecipeIds : ", favoriteRecipeIds.toString())
        
        for (const favoriteRecipe of favoriteRecipeIds) {
            const recipe = await db.collection("recipe").findOne(
                { _id : new ObjectId(favoriteRecipe.recipeId) },
                { projection : { recipeName : 1, recipeThumbnail : 1 } }
            );
        
            if (recipe) result.push(recipe);
        }

        return result;
    } catch (err) {
        console.error("[recipeRepository] findFavoriteRecipeByUser error : ", err);

        return [];
    }
}

// 해당 레시피 제외 나머지 레시피(주의 음식 제외) 중 5개씩 추천
export async function findRecommendedRecipes(diseaseId, mainRecipeId) {
    try {
        const db = getDB();

        const disease = await db.collection("disease").findOne({ _id: new ObjectId(diseaseId) });

        const rawCaution = disease?.caution || "";
        const cautionFoods = rawCaution.split(",").map(food => food.trim()).filter(food => food.length > 0);

        const exclusionConditions = cautionFoods.map(food => ({
            $or: [
                { recipeName: { $regex: food } },
                { ingredients: { $regex: food } },
            ]
        }));

        let exclusionQuery = {};

        if (exclusionConditions.length > 0) {
            exclusionQuery = {
                $nor: exclusionConditions,
            };
        }

        const pipeline = [
            { $match : {diseaseId : diseaseId } },
            { $match: {"_id": { "$ne": new ObjectId(mainRecipeId) } } },
        ]

        // 모든 $match 조건을 하나의 객체로 결합
        const combinedMatch = {
            diseaseId: diseaseId,
            "_id": { "$ne": new ObjectId(mainRecipeId) },
            ...exclusionQuery // 주의 식품 제외 조건 합치기
        };


        // Aggregate Pipeline 최종 구성 및 실행
        const finalPipeline = [
            { $match: combinedMatch }, // 결합된 조건 사용
            { $sample: { size: 5} }    // 무작위 5개 추출
        ];

        const recommended = await db
            .collection("recipe")
            .aggregate(finalPipeline)
            .toArray()

        return recommended
    } catch (err) {
        console.error("[recipeRepository] findRecommendedRecipes error : ", err)
        return []
    }
}