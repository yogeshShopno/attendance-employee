import CryptoJS from 'crypto-js';

const SECRET_KEY = 'sanito-ergo-sum'; 
const STORAGE_KEY = 'permissions';

const encrypt = (data) => {
  return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
};

const decrypt = (ciphertext) => {
  return CryptoJS.AES.decrypt(ciphertext, SECRET_KEY).toString(CryptoJS.enc.Utf8);
};


export const savePermissions = (permissions) => {
  try {
    const json = JSON.stringify(permissions);
    const encrypted = encrypt(json);
    sessionStorage.setItem(STORAGE_KEY, encrypted);
  } catch (error) {
    console.error('Failed to save permissions:', error);
  }
};


export const getPermissions = () => {
  const encrypted = sessionStorage.getItem(STORAGE_KEY);
  if (!encrypted) return null;

  try {
    const decrypted = decrypt(encrypted);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Failed to decrypt permissions:', error);
    return null;
  }
};

export const clearPermissionsStorage = () => {
  sessionStorage.removeItem(STORAGE_KEY);
};
