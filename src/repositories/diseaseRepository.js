import { getDB } from "../config/mongoDB.js";

export async function findById(id){
    const db = getDB();

    return await db.collection("disease").findOne({id});
}

export async function findByDiseaseNameContaining(keyword) {
    try {
        const db = getDB();
        const condition = keyword ? { name : { $regex : keyword, $options : "i" } } : {};

        const diseases = await db
            .collection("disease")
            .find(condition)
            .sort({ name : 1})
            .toArray();

        return diseases;

    } catch (err) {
        console.error("findByDiseaseNameContaining error : ", err);

        return [];
    }
    
}

