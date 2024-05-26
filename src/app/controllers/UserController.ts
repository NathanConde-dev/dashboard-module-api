import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import bcrypt from 'bcryptjs';
import { AppDataSource } from '../../database/data-source';
import { User } from '../entities/Users';

interface AuthenticatedRequest extends Request {
  user?: { userId: string }; // Defina o tipo da propriedade 'user' aqui conforme necessário
}

// Usuários terciários do sistema
// Registrar Usuário
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

// Atualizar Usuário
export const updateUser = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const { name, email } = req.body;
    const userRepository = AppDataSource.getRepository(User);

    try {
        const user = await userRepository.findOneBy({ id: parseInt(id, 10) });

        if (!user) {
            return res.status(404).send({ message: 'Usuário não encontrado.' });
        }

        user.name = name || user.name;
        user.email = email || user.email;

        await userRepository.save(user);
        return res.status(200).send({ message: 'Usuário atualizado com sucesso.' });
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).send({ message: 'Erro ao atualizar usuário.' });
    }
};

// Deletar Usuário
export const deleteUser = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const userRepository = AppDataSource.getRepository(User);

    try {
        const user = await userRepository.findOneBy({ id: parseInt(id, 10) });

        if (!user) {
            return res.status(404).send({ message: 'Usuário não encontrado.' });
        }

        await userRepository.remove(user);
        return res.status(200).send({ message: 'Usuário deletado com sucesso.' });
    } catch (error) {
        console.error('Error deleting user:', error);
        return res.status(500).send({ message: 'Erro ao deletar usuário.' });
    }
};

// Usuários administradores do sistema
// Update Password
export const updatePassword = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId; // Acesse a propriedade 'user' da requisição
    if (!userId) {
        return res.status(400).json({ message: 'ID do usuário não fornecido' });
    }

    const { currentPassword, newPassword } = req.body;

    try {
        const userService = new UserService();
        const user = await userService.getUserById(parseInt(userId)); // Parse userId para number

        // Verifique se o usuário existe
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        // Verifique se a senha atual fornecida corresponde à senha armazenada no banco de dados
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        console.log('Password comparison result:', isPasswordValid);

        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Senha atual incorreta' });
        }

        // Atualize a senha do usuário no banco de dados
        const result = await userService.updateUserPassword(parseInt(userId), newPassword);
        if (result) {
            console.log(`Senha atualizada com sucesso para o usuário ${user.email}`);
        }

        return res.status(200).json({ message: 'Senha atualizada com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar senha:', error);
        return res.status(500).json({ message: 'Erro ao atualizar senha' });
    }
};

// Atualizar Informações do Usuário
export const updateInfo = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    const userId = req.user?.userId; // Acesse a propriedade 'user' da requisição
    if (!userId) {
        return res.status(400).json({ message: 'ID do usuário não fornecido' });
    }

    const { name, email } = req.body;

    try {
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOneBy({ id: parseInt(userId, 10) });

        if (!user) {
            return res.status(404).send({ message: 'Usuário não encontrado.' });
        }

        user.name = name || user.name;
        user.email = email || user.email;

        await userRepository.save(user);
        return res.status(200).send({ message: 'Informações do usuário atualizadas com sucesso.' });
    } catch (error) {
        console.error('Erro ao atualizar informações do usuário:', error);
        return res.status(500).send({ message: 'Erro ao atualizar informações do usuário.' });
    }
};

// Obter Informações do Usuário
export const getUserInfo = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        // Assuming you are using JWT middleware to decode the token and attach it to req.user
        const user = req.user;

        return res.status(200).json(user);
    } catch (error) {
        console.error('Error getting user information:', error);
        return res.status(500).json({ message: 'Unexpected error while fetching user information.' });
    }
};

// Esqueci a senha
export const forgotPassword = async (req: Request, res: Response): Promise<Response> => {
    const { email } = req.body;
    const userService = new UserService();

    try {
        await userService.sendResetPasswordEmail(email);
        return res.status(200).send({ message: 'E-mail de redefinição de senha enviado com sucesso.' });
    } catch (error) {
        console.error('Erro ao enviar e-mail de redefinição de senha:', error);
        return res.status(500).send({ message: 'Erro ao enviar e-mail de redefinição de senha.' });
    }
};

// Redefinir Senha
export const resetPassword = async (req: Request, res: Response): Promise<Response> => {
    const { token, newPassword } = req.body;
    const userService = new UserService();

    try {
        await userService.resetPassword(token, newPassword);
        return res.status(200).send({ message: 'Senha redefinida com sucesso.' });
    } catch (error) {
        console.error('Erro ao redefinir a senha:', error);
        return res.status(500).send({ message: 'Erro ao redefinir a senha.' });
    }
};
