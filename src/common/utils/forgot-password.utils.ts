import * as crypto from 'crypto';

export const getResetAndHashedTokens = () => {
  const resetToken = crypto.randomBytes(20).toString('hex');
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  return { resetToken, hashedToken };
};

export const getResetPasswordExpire = (): number => {
  return Date.now() + 30 * 60 * 1000;
};
