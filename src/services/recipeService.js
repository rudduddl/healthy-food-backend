import {
    findById,
    findByRecipeNameContaining,
    findCautionRecipesByDiseaseId,
    findFavoriteRecipeByUser, findRecommendedRecipes,
    saveFavoriteRecipe
} from "../repositories/recipeRepository.js";

export async function getRecipe(id){
    const recipe = await findById(id);
    if(!recipe){
        return null
    }

    const cautionRecipes = await findRecommendedRecipes(recipe.diseaseId, id)

    return {
        recipe: recipe,
        cautionRecipes: cautionRecipes || [] // 목록이 없을 경우 빈 배열 반환
    };
}

export async function searchRecipe(keyword){
    const recipes = await findByRecipeNameContaining(keyword);

    return recipes.length ? recipes : null;
}

export async function getCautionRecipesByDisease(diseaseId, startIndex, keyword) {
    const recipes = await findCautionRecipesByDiseaseId(diseaseId, startIndex, keyword);
    return recipes;
}

export async function putFavoriteRecipe(userId, recipeId) {
    return await saveFavoriteRecipe(userId, recipeId);
}

export async function getFavoriteRecipe(userId){
    const favoriteRecipes = await findFavoriteRecipeByUser(userId);

    return favoriteRecipes || null;
}