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
 * 특정 질환의 주의 음식 제외 레시피 목록 조회
 * (주의 성분이 포함되지 않은 레시피를 가져옴)
 */
export async function findCautionRecipesByDiseaseId(diseaseId) {
    try {
        const db = getDB();

        // 1. 질환별 주의 식품 목록을 disease 컬렉션에서 조회
        const disease = await db.collection("disease").findOne({ _id: new ObjectId(diseaseId) });

        // 주의 식품이 없으면 모든 레시피를 반환 (또는 빈 배열)
        if (!disease || !disease.caution) {
            console.log(`[recipeRepository] No caution foods defined for diseaseId: ${diseaseId}`);
        }

        // 주의 식품에 해당하는 정규 표현식 배열 생성
        // 예시 : ["잡곡류밥", "시금치", "바나나"] => [/잡곡류밥/, /시금치/, /바나나/]
        const cautionFoods = disease.caution.split(",").map(food => food.trim()).filter(food => food.length > 0);

        // 주의 식품이 하나라도 포함된 문서를 찾는 $or 조건 배열 생성
        const exclusionConditions = cautionFoods.map(food => ({
            // 레시피 이름, 재료에서 주의 식품이 포함되어 있는지 검색
            $or: [
                { recipeName: { $regex: food } },
                { ingredients: { $regex: food } },
            ]
        }));

        let query = {};

        // 주의 식품 키워드가 하나라도 있으면 조건 실행

        if (exclusionConditions.length > 0) {
            query = {
                $nor: exclusionConditions,
            };
        }

        if (keyword) {
            const searchCondition = {
                $or: [
                    { recipeName: { $regex: keyword, $options: 'i' } },
                    { ingredients: { $regex: keyword, $options: 'i' } }
                ]
            };

            // 💡 수정: 기존 query(주의 식품 제외)와 검색 조건을 $and로 결합
            query = {
                $and: [
                    query,
                    searchCondition
                ]
            };
        }

        const totalCount = await db.collection("recipe").countDocuments(query);

        // 주의 식품이 포함된 레시피 '제외'하고 조회
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

        console.log("[recipeRepository] recipes count: ", recipes.length);
        return {
            recipes: recipes,
            totalCount: totalCount
        };
    } catch (err) {
        console.error("[recipeRepository] findCautionRecipesByDiseaseId error:", err);
        return { recipes: [], totalCount: 0 };
    }
}

// 즐겨찾기 추가
export async function saveFavoriteRecipe(user, recipeName){
    try {
        const db = getDB();
        await db.collection("favoriteRecipe").insertOne({
            id : user,
            recipeId : recipeName,
        });

        return true;
    } catch (err) {
        console.err("[recipeRepository] saveFavoriteRecipe error : ", err);
        
        return false;
    }
}


// 즐겨찾기 목록 조회
export async function findFavoriteRecipeByUser(userId) {
    try {
        const db = getDB();
        const result = [];
        const favoriteRecipeIds = await db
            .collection("favoriteRecipe")
            .find({ id : userId })
            .toArray();
        
        for (const favoriteRecipe of favoriteRecipeIds) {
            const recipe = await db.collection("recipe").findOne(
                { _id : new ObjectId(favoriteRecipe.recipeId) },
                { projection : { RCP_NM : 1, ATT_FILE_NO_MK : 1 } }
            );
        
            if (recipe) result.push(recipe);
        }

        return result;
    } catch (err) {
        console.error("[recipeRepository] findFavoriteRecipeByUser error : ", err);

        return [];
    }
}