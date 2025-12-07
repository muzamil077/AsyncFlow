import { Request, Response } from 'express';
import { listGoogleEvents } from '../services/google-calendar.service';
import { listZoomEvents } from '../services/zoom.service';
import prisma from '../lib/prisma';

export const getGoogleEvents = async (req: Request, res: Response) => {
    try {
        // @ts-ignore - user is attached by auth middleware
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const events = await listGoogleEvents(userId);
        res.json(events);
    } catch (error: any) {
        console.error('Error fetching Google events:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch events' });
    }
};

export const getIntegrationStatus = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { googleAccessToken: true, zoomAccessToken: true }
        });

        res.json({
            google: !!user?.googleAccessToken,
            zoom: !!user?.zoomAccessToken,
            // Add other providers here as they are implemented
            microsoft: false
        });
    } catch (error) {
        console.error('Error checking integration status:', error);
        res.status(500).json({ error: 'Failed to check status' });
    }
};
