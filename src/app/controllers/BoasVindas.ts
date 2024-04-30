// src/app/controllers/BoasVindas.ts
import { Request, Response } from 'express';

export default class BoasVindasController {
  public boasVindas(req: Request, res: Response): Response {
    return res.status(200).json({ mensagem: "Bem-vindo(a) ao nosso serviço! Estamos felizes em tê-lo(a) aqui." });
  }
}
