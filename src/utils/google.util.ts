import {OAuth2Client, TokenPayload} from 'google-auth-library';

let client: OAuth2Client | null = null;

const getClient = (): OAuth2Client => {
    if (!client) {
        client = new OAuth2Client();
    }
    return client;
};

/**
 * Parses GOOGLE_CLIENT_ID env var. Supports a single client id or a comma
 * separated list (useful when the mobile app has separate web/android/ios
 * OAuth client ids). All listed ids are accepted as valid audiences.
 */
const getAllowedAudiences = (): string[] => {
    const raw = process.env.GOOGLE_CLIENT_ID || '';
    return raw
        .split(',')
        .map((id) => id.trim())
        .filter((id) => id.length > 0);
};

/**
 * Verifies a Google ID token (obtained on the client via Google Sign-In) and
 * returns its decoded payload. Throws if the token is invalid, expired, or
 * issued for an audience we do not trust.
 */
export const verifyGoogleIdToken = async (idToken: string): Promise<TokenPayload> => {
    const audience = getAllowedAudiences();
    if (audience.length === 0) {
        throw new Error('GOOGLE_CLIENT_ID is not configured');
    }

    const ticket = await getClient().verifyIdToken({
        idToken,
        audience,
    });

    const payload = ticket.getPayload();
    if (!payload) {
        throw new Error('Unable to read Google token payload');
    }
    return payload;
};
