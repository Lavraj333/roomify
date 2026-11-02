import puter from "@heyputer/puter.js";

export const signIn = async () => await puter.auth.signIn();

export const signOut = async () => puter.auth.signOut();

export const getCurrentUser = async () => {
    try {
        return await puter.auth.getUser();
    } catch (error) {
        if (
            typeof error === "object" &&
            error !== null &&
            "status" in error &&
            error.status === 401
        ) {
            return null;
        }

        throw error;
    }
}