import { findBySlug, findAll } from "../repositories/categoryRepository.js";

export async function getCategory(slug) {
    const category = await findBySlug(slug);

    return category || null;
}

export async function getAllCategories(){
    const categories = await findAll();

    return categories || null;
}