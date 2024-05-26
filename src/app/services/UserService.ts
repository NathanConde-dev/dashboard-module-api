import { AppDataSource } from '../../database/data-source';
import { User } from '../entities/Users';
import { RefreshToken } from '../entities/RefreshToken';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import ms from 'ms';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { MoreThanOrEqual } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

export class UserService {
    private async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    }

    async createUser(name: string, email: string, password: string): Promise<User> {
        const userRepository = AppDataSource.getRepository(User);

        // Hash da senha
        const hashedPassword = await this.hashPassword(password);

        const user = userRepository.create({ name, email, password: hashedPassword });
        await userRepository.save(user);
        return user;
    }

    async validateUser(email: string, password: string): Promise<User | null> {
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOneBy({ email });

        if (!user) {
            console.log('User not found with email:', email);
            return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('Password comparison result:', isPasswordValid);

        if (!isPasswordValid) {
            console.log('Invalid password for user:', email);
            return null;
        }

        return user;
    }

    async getUserByEmail(email: string): Promise<User | null> {
        const userRepository = AppDataSource.getRepository(User);
        return await userRepository.findOneBy({ email });
    }

    async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(password, hashedPassword);
    }

    async getUserById(userId: number): Promise<User | undefined> {
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { id: userId } });
        return user || undefined;
    }
    
    async updateUserPassword(userId: number, newPassword: string): Promise<boolean> {
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { id: userId } });

        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        // Hash da senha
        const hashedPassword = await this.hashPassword(newPassword);

        // Atualize a senha do usuário no banco de dados
        user.password = hashedPassword;
        await userRepository.save(user);

        // Log para verificar a atualização da senha
        console.log(`Senha atualizada para o usuário ${user.email}. Nova senha hash: ${hashedPassword}`);

        return true;
    }


    async generateToken(user: User): Promise<{ accessToken: string, refreshToken: string }> {
        const accessToken = jwt.sign(
            { userId: user.id, name: user.name, email: user.email },
            process.env.ACCESS_TOKEN_SECRET!,
            { expiresIn: process.env.ACCESS_TOKEN_LIFETIME } // Time expire AcessToken
        );

        // Verifique se já existe um refresh token para o usuário
        const existingRefreshToken = await this.findRefreshTokenByUserId(user.id);

        if (existingRefreshToken) {
            // Atualize o refresh token existente
            existingRefreshToken.token = jwt.sign(
                { userId: user.id, name: user.name, email: user.email },
                process.env.REFRESH_TOKEN_SECRET!,
                { expiresIn: process.env.REFRESH_TOKEN_LIFETIME || '7d' }
            );
            existingRefreshToken.expiryDate = new Date(Date.now() + ms(process.env.REFRESH_TOKEN_LIFETIME || '7d'));

            await AppDataSource.getRepository(RefreshToken).save(existingRefreshToken);
            return { accessToken, refreshToken: existingRefreshToken.token };
        }

        // Crie um novo refresh token se não houver um existente
        const refreshToken = await this.createRefreshToken(user);
        return { accessToken, refreshToken: refreshToken.token };
    }

    async findRefreshTokenByUserId(userId: number): Promise<RefreshToken | null> {
        const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
        return await refreshTokenRepository.findOne({ where: { user: { id: userId } } }) || null;
    }

    async createRefreshToken(user: User): Promise<RefreshToken> {
        const refreshTokenDuration = process.env.REFRESH_TOKEN_LIFETIME || '7d'; // Valor padrão se não configurado
        const refreshTokenDurationMs = ms(refreshTokenDuration); // Converte, por exemplo, '7d' para milissegundos

        const refreshToken = new RefreshToken();
        refreshToken.user = user;
        refreshToken.token = jwt.sign(
            { userId: user.id, name: user.name, email: user.email },
            process.env.REFRESH_TOKEN_SECRET!,
            { expiresIn: refreshTokenDuration }
        );
        refreshToken.expiryDate = new Date(Date.now() + refreshTokenDurationMs);

        const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
        await refreshTokenRepository.save(refreshToken);

        return refreshToken;
    }

    async validateRefreshToken(token: string): Promise<RefreshToken | null> {
        const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
        const refreshToken = await refreshTokenRepository.findOne({
            where: { token },
            relations: ['user']
        });
        if (!refreshToken || refreshToken.expiryDate < new Date()) {
            return null;
        }
        return refreshToken;
    }

    async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string, refreshToken: string }> {
        const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
        const tokenRecord = await refreshTokenRepository.findOne({
            where: { token: refreshToken },
            relations: ['user']
        });

        if (!tokenRecord) {
            throw new Error('Refresh token not found');
        }

        if (tokenRecord.expiryDate < new Date()) {
            throw new Error('Refresh token expired');
        }

        const user = tokenRecord.user;
        const newAccessToken = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.ACCESS_TOKEN_SECRET || 'default_secret', // Use a default secret for development
            { expiresIn: process.env.ACCESS_TOKEN_LIFETIME || '15m' }
        );

        return {
            accessToken: newAccessToken,
            refreshToken: refreshToken // You might choose to return a new refreshToken or the same one
        };
    }

    async sendResetPasswordEmail(email: string): Promise<void> {
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOneBy({ email });

        if (!user) {
            throw new Error('Usuário não encontrado.');
        }

        const token = crypto.randomBytes(20).toString('hex');
        const tokenExpiration = new Date(Date.now() + 3600000); // 1 hora a partir de agora

        user.resetPasswordToken = token;
        user.resetPasswordExpires = tokenExpiration;
        await userRepository.save(user);

        const resetLink = `http://localhost:3000/reset-password/${token}`;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS,
            },
        });

        const mailOptions = {
            to: user.email,
            from: process.env.GMAIL_USER!,
            subject: 'Redefinição de senha',
            text: `Você está recebendo este e-mail porque você (ou outra pessoa) solicitou a redefinição da senha da sua conta.\n\n
                   Por favor, clique no seguinte link, ou cole-o em seu navegador para concluir o processo dentro de uma hora a partir de recebimento deste e-mail:\n\n
                   ${resetLink}\n\n
                   Se você não solicitou isso, por favor, ignore este e-mail e sua senha permanecerá inalterada.\n`,
        };

        try {
            await transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Erro ao enviar o e-mail de redefinição de senha:', error);
            throw new Error('Erro ao enviar o e-mail de redefinição de senha.');
        }
    }

    async resetPassword(token: string, newPassword: string): Promise<void> {
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: MoreThanOrEqual(new Date()),
            },
        });

        if (!user) {
            throw new Error('Token de redefinição de senha é inválido ou expirou.');
        }

        // Hash da nova senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await userRepository.save(user);
    }
}
