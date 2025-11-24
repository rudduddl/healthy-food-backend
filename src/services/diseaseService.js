import {
    findById,
    findByDiseaseNameContaining,
    findAll,
    findCautionByDiseaseId
} from "../repositories/diseaseRepository.js";

export async function getDisease(id){
    const disease = await findById(id);

    return disease || null;
}

export async function getCautionByDiseaseId(id) {
    const caution = await findCautionByDiseaseId(id);

    return caution || null;

}

export async function searchDisease(keyword) {
    const diseases = await findByDiseaseNameContaining(keyword);

    return diseases.length ? diseases : null;
}

export async function getAllDiseases() {
    const disease = await findAll();

    console.log("category별 disease : ", disease)

    return disease || [];
}