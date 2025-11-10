import {
    findById,
    findByRecipeNameContaining,
    findCautionRecipesByDiseaseId,
    findFavoriteRecipeByUser,
    saveFavoriteRecipe
} from "../repositories/recipeRepository.js";

export async function getRecipe(id){
    const recipe = await findById(id);

    return recipe || null;
}

export async function searchRecipe(keyword){
    const recipes = await findByRecipeNameContaining(keyword);

    return recipes.length ? recipes : null;
}

export async function getCautionRecipesByDisease(diseaseId) {
    const recipes = await findCautionRecipesByDiseaseId(diseaseId);
    return recipes;
}

export async function putFavoriteRecipe(user, recipeName) {
    await saveFavoriteRecipe(user, recipeName);
}

export async function getFavoriteRecipe(userId){
    const favoriteRecipes = await findFavoriteRecipeByUser(userId);

    return favoriteRecipes || null;
}