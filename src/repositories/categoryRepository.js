import { getDB } from "../config/mongoDB.js";

export async function findById(id){
    const db = getDB();

    return db.collection("category").findOne({_id: new ObjectId(id)})
}

export async function findAll() {
    const db = getDB();

    const categories = await db.collection("category")
        .find()
        .sort({ sortOrder : 1 })
        .toArray();

    return categories;
}

export async function findBySlug(slug){
    const db = getDB();

    return db.collection("category").findOne({slug : slug})
}