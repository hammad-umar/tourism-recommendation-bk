import { hash, compare, genSalt } from 'bcryptjs';

export const hashPassword = async (password: string): Promise<string> => {
  const saltOrRounds = await genSalt(10);
  return hash(password, saltOrRounds);
};

export const comparePassword = async (
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> => {
  return compare(plainPassword, hashedPassword);
};
