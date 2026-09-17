import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
}

export const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || 'taskflow_default_secret_key';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign({ userId }, secret, {
    expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
  });
};

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'taskflow_default_secret_key';
    const decoded = jwt.verify(token, secret) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
};
