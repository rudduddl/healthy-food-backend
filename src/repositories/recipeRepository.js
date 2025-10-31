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

// 주의 식품이 포함된 레시피 제외 검색
export async function findByCautionRecipeContaining(caution, keyword, start){
    try {
        const db = getDB();

        const regExp = (str) => {
            const reg = /[\{\}\[\]\/?.;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;
            
            return reg.test(str) ? str.replaceAll(reg, "") : str;
        };

        caution = regExp(caution);
        let split = caution.replace(" ", "").split(",");

        // "류"가 포함된 식품 분류만 필터링
        const filtered = split.filter((element) => element.includes("류"));

        for (const element of filtered) {
            const result = await db
                .collection("foodClass")
                .findOne({ class : element });

            if (result) {
                const reg = result.value.map((v) => regExp(v));
                split = split.concat(reg);
            }
        }

        const option = split.map((s) => ({ RCP_PARTS_DTLS : { $not : { $regex : s } } }));

        const query = { $and : option };
        if (keyword) query.$text = { $search : keyword };

        const recipe = await db
            .collection("recipe")
            .find(query, { projection : { RCP_NM : 1, ATT_FILE_NO_MK : 1 } })
            .skip(start)
            .limit(20)
            .toArray();

        // 전체 개수 구하기
        const cursor = db.collection("recipe").aggregate([
            { $match : query },
            { $count : "total" },
        ]);

        // 다음 페이지가 있는지, 마지막인지 판단하기 위함
        let recipeTotalCount = 0;
        try {
            const result = await cursor.toArray();
            recipeTotalCount = result.length > 0 ? result[0].total : 0;
        } catch (err) {
            console.warn("[recipeRepository] count aggregation error : ", err);
        }

        return { recipe, totalCount : recipeTotalCount };
    } catch (err) {
        console.error("[recipeRepository] findByCautionRecipeContaining error : ", err);
        return { recipe : [], totalCount : 0 };
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
export async function findFavoriteReceipeByUser(userId) {
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
        console.error("[recipeRepository] findFavoriteReceipeByUser error : ", err);

        return [];
    }
}