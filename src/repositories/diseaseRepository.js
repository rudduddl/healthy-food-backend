import { getDB } from "../config/mongoDB.js";
import { ObjectId } from 'mongodb';

export async function findById(id){
    const db = getDB();

    return await db.collection("disease").findOne({ _id: new ObjectId(id) });
}

export async function findCautionByDiseaseId(id) {
    try {
        const db = getDB();

        const disease = await db
            .collection("disease")
            .findOne(
                { _id: new ObjectId(id) },
                { projection: { caution: 1, _id: 0 } } // caution 필드만 포함하고 _id는 제외
            );

        if (!disease) {
            console.log(`[diseaseRepository] Disease not found for id: ${id}`);
            return null; // 문서를 찾지 못했을 경우
        }

        // caution 필드 값만 반환
        return disease.caution || null;

    } catch (err) {
        console.error("[diseaseRepository] findCautionByDiseaseId error:", err);
        return null;
    }
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

export async function findAll() {
    const db = getDB();

    try {
        const diseasesWithCategory = await db.collection("disease").aggregate([
            // 1. $lookup: 'categoryId'를 사용하여 'category' 컬렉션과 조인합니다.
            {
                $lookup: {
                    from: "category",         // 조인할 컬렉션 이름
                    localField: "categoryId", // disease 컬렉션의 참조 필드 (ObjectId)
                    foreignField: "_id",      // category 컬렉션의 _id 필드
                    as: "categoryInfo"        // 조인 결과를 담을 임시 배열 필드
                }
            },
            // 2. $unwind: 조인 결과를 배열에서 단일 객체로 분해합니다.
            {
                $unwind: "$categoryInfo"
            },
            // 3. $project: 최종 결과에 필요한 필드만 포함하고 이름도 정리합니다.
            {
                $project: {
                    _id: 1,
                    name: 1, // 질병명
                    categoryId: 1,
                    // 프론트엔드에서 그룹화에 필요한 필드
                    categorySlug: "$categoryInfo.slug",
                    categoryName: "$categoryInfo.name"
                    // 여기에 다른 필요한 질병 필드를 추가할 수 있습니다.
                }
            },
            // 4. (선택) 질병 이름 순으로 정렬합니다.
            {
                $sort: { name: 1 }
            }
        ]).toArray(); // 결과를 배열로 반환

        return diseasesWithCategory;
    } catch (err) {
        console.error("findAll diseases with category error: ", err);
        return [];
    }
}

