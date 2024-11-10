import * as jwt from 'jsonwebtoken';

export const generateAccessToken = (payload: {}, secret: string, expiresIn: string = '1h') => {
    return jwt.sign(payload, secret, {expiresIn});
};

export const generateRefreshToken = (userId: string, secret: string, expiresIn: string = '30d') => {
    const payload = { userId };
    return jwt.sign(payload, secret, {expiresIn});
};

export const verifyRefreshToken = (refreshToken: string) => {
    return jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
}

export const generateAdminRefreshToken = (adminId: string, secret: string, expiresIn: string = '30d') => {
    const payload = { adminId };
    return jwt.sign(payload, secret, {expiresIn});
};

export const verifyAdminRefreshToken = (refreshToken: string) => {
    return jwt.verify(refreshToken, process.env.ADMIN_JWT_REFRESH_SECRET)
}