import bcrypt from 'bcryptjs';
import { BCRYPT_ROUNDS } from '../config/constants.js';

export const hashPassword = async (password) => {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
};

export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};
