import axios from 'axios';
import prisma from '../lib/prisma';

export const listZoomEvents = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { zoomAccessToken: true },
    });

    if (!user?.zoomAccessToken) {
        throw new Error('User not connected to Zoom');
    }

    const response = await axios.get('https://api.zoom.us/v2/users/me/recordings', {
        headers: { Authorization: `Bearer ${user.zoomAccessToken}` },
        params: { page_size: 10 },
    });

    // Zoom returns recordings under "meetings"
    return response.data.meetings || [];
};
