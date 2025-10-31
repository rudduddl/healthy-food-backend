import { findById, findByCautionRecipeContaining, findByRecipeNameContaining, findFavoriteReceipeByUser, saveFavoriteRecipe} from "../repositories/recipeRepository.js";

export async function getRecipe(id){
    const recipe = await findById(id);

    return recipe || null;
}

export async function searchRecipe(keyword){
    const recipes = await findByRecipeNameContaining(keyword);

    return recipes.length ? recipes : null;
}

export async function getCautionRecipe(caution, keyword, start) {
    const { recipe, totalCount } = await findByCautionRecipeContaining(caution, keyword, start);

    return recipe.length ? { recipe, totalCount } : null;
}

export async function putFavoriteRecipe(user, receipeName) {
    await saveFavoriteRecipe(user, receipeName);
}

export async function getFavoriteRecipe(userId){
    const favoriteRecipes = await findFavoriteReceipeByUser(userId);

    return favoriteRecipes || null;
}