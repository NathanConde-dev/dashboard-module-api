import { Request, Response } from 'express';
import { UserService } from '../services/UserService';

export class RefreshController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    public refreshAccessToken = async (req: Request, res: Response): Promise<void> => {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            res.status(400).json({ message: 'Refresh token is required' });
            return;
        }

        try {
            const newToken = await this.userService.refreshAccessToken(refreshToken);
            res.json({ accessToken: newToken.accessToken, refreshToken: newToken.refreshToken });
        } catch (error: any) { // Aqui forçamos o TypeScript a considerar 'error' como qualquer tipo
            if (error.message === 'Refresh token not found' || error.message === 'Refresh token expired') {
                res.status(401).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'Internal Server Error' });
            }
        }
    }
}
