// src/app/controllers/BoasVindas.ts
import { Request, Response } from 'express';

export const dashboard = async (req: Request, res: Response): Promise<Response> => {
  return res.status(200).json({ mensagem: "Bem-vindo(a) ao Dashboard!" });
};