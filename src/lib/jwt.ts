import jwt from "jsonwebtoken";

export function createToken(data: string) {

    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET is missing");
    }

    const token = jwt.sign({ id: data }, secret, {
        expiresIn: "7d",
    });

    return token;
}

export function verifyToken(token: string) {

    try {

        const secret = process.env.JWT_SECRET;

        if (!secret) {
            throw new Error("JWT_SECRET is missing");
        }

        const data = jwt.verify(token, secret);

        return data;

    } catch {
        return null;
    }
}