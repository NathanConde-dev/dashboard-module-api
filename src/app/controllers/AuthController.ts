import { Request, Response } from 'express';
import { UserService } from '../services/UserService';

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const userService = new UserService();

    try {
        const user = await userService.getUserByEmail(email);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordValid = await userService.validatePassword(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const tokens = await userService.generateToken(user); // Use await here

        res.json({
            message: 'Logged in successfully!',
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
