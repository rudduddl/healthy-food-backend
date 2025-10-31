import { findById, findByDiseaseNameContaining } from "../repositories/diseaseRepository.js";

export async function getDisease(id){
    const disease = await findById(id);

    return disease || null;
}

export async function searchDisease(keyword) {
    const diseases = await findByDiseaseNameContaining(keyword);

    return diseases.length ? diseases : null;
}