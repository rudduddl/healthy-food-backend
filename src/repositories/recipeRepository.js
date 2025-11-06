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
 * 특정 질환의 주의 레시피 목록 조회
 * (주의 성분이 포함된 레시피를 가져옴)
 */
export async function findCautionRecipesByDiseaseId(diseaseId) {
    try {
        const db = getDB();

        // 질환별 주의 식품 목록을 disease 컬렉션에서 조회
        const disease = await db.collection("disease").findOne({ _id: diseaseId });

        if (!disease || !disease.caution) {
            return [];
        }

        const cautionFoods = disease.caution.split(",").map(food => food.trim());

        // 주의 식품이 포함된 레시피 찾기
        const recipes = await db
            .collection("recipe")
            .find({
                RCP_PARTS_DTLS: {
                    $in: cautionFoods.map(food => new RegExp(food, "i")),
                },
            })
            .project({ RCP_NM: 1, ATT_FILE_NO_MK: 1 })
            .toArray();

        return recipes;
    } catch (err) {
        console.error("[recipeRepository] findCautionRecipesByDiseaseId error:", err);
        return [];
    }
}

// 즐겨찾기 추가
export async function saveFavoriteRecipe(user, receipeName){
    try {
        const db = getDB();
        await db.collection("favoriteRecipe").insertOne({
            id : user,
            recipeId : receipeName,
        });

        return true;
    } catch (err) {
        console.err("[recipeRepository] saveFavoriteReceipe error : ", err);
        
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