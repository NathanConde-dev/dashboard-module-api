import { AppDataSource } from '../../database/data-source';
import { User } from '../entities/Users';
import { RefreshToken } from '../entities/RefreshToken';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import ms from 'ms';

export class UserService {
    async createUser(name: string, email: string, password: string): Promise<User> {
        const userRepository = AppDataSource.getRepository(User);
        
        // Hash da senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = userRepository.create({ name, email, password: hashedPassword });
        await userRepository.save(user);
        return user;
    }

    async validateUser(email: string, password: string): Promise<User | null> {
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOneBy({ email });

        if (user && await bcrypt.compare(password, user.password)) {
            return user;
        }

        return null;
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

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await userRepository.save(user);

        return true;
    }

    async generateToken(user: User): Promise<{ accessToken: string, refreshToken: string }> {
        const accessToken = jwt.sign(
            { userId: user.id, name: user.name, email: user.email },
            process.env.ACCESS_TOKEN_SECRET!,
            { expiresIn: process.env.ACCESS_TOKEN_LIFETIME } // Time expire AcessToken
        );

        // Aguarda a criação do refreshToken antes de acessar .token
        const refreshToken = await this.createRefreshToken(user);
        return { accessToken, refreshToken: refreshToken.token };
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
    
}
