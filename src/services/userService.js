import { compareSync, hashSync } from "bcrypt";
import {findUserById, createUser} from "../repositories/userRepository.js";

export async function login(id, password) {
    const user = await findUserById(id);
    if (!user) return null;

    const isSame = compareSync(password, user.password);

    return isSame ? user : null;
}

export async function signup(userData) {
    const existing = await findUserById(userData.id);
    if (existing) return "ERR_DUPLICATE";

    const hashed = hashSync(userData.password, 10);
    const newUser = { ...userData, password: hashed };

    await createUser(newUser);

    return "SUCCESS";
}