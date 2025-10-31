import { getDB } from "../config/mongoDB.js";

export async function findUserById(id){
    const db = getDB();
    
    return await db.collection("user").findOne({id});
}

export async function createUser(user){
    const db = getDB();

    await db.collection("user").insertOne(user);
}