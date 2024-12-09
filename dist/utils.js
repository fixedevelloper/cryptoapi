import crypto from 'crypto';
export const generateUniqueId = () => {
    return crypto.randomBytes(16).toString('hex');
};
