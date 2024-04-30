import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import bcrypt from 'bcryptjs';

export const registerUser = async (req: Request, res: Response): Promise<Response> => {
    const { name, email, password } = req.body;
    const userService = new UserService();

    try {
        const user = await userService.createUser(name, email, password);
        return res.status(201).send({ message: "Usuário registrado com sucesso!", userId: user.id });
    } catch (error) {
        console.error("Erro ao registrar o usuário:", error);
        return res.status(500).send({ message: "Erro ao registrar o usuário." });
    }
};

export async function updatePassword(req: Request, res: Response) {
    const userId = req.user.userId; // Extraia o ID do usuário do token
    const { currentPassword, newPassword } = req.body;

    try {
        const userService = new UserService();
        const user = await userService.getUserById(userId);

        // Verifique se o usuário existe
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        // Verifique se a senha atual fornecida corresponde à senha armazenada no banco de dados
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Senha atual incorreta' });
        }

        // Hash da nova senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Atualize a senha do usuário no banco de dados
        await userService.updateUserPassword(userId, currentPassword, hashedPassword);

        return res.status(200).json({ message: 'Senha atualizada com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar senha:', error);
        return res.status(500).json({ message: 'Erro ao atualizar senha' });
    }
}

