import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export function autenticarJWT(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header && header.split(' ')[1];
  if (!token) return res.status(401).json({ erro: 'Token ausente' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    (req as any).usuario = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ erro: 'Token inválido' });
  }
}
