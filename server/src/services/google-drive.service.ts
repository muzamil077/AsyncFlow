import axios from 'axios';
import prisma from '../lib/prisma';
import { refreshAccessToken } from './oauth.service';

interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    webViewLink: string;
    createdTime: string;
}

export const listRecentDriveRecordings = async (userId: string): Promise<DriveFile[]> => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { googleAccessToken: true, googleRefreshToken: true },
    });

    if (!user || !user.googleAccessToken) {
        throw new Error('Google account not connected');
    }

    let accessToken = user.googleAccessToken;

    try {
        return await fetchDriveFiles(accessToken);
    } catch (error: any) {
        if (error.response && error.response.status === 401 && user.googleRefreshToken) {
            try {
                const tokens = await refreshAccessToken('google', user.googleRefreshToken);
                accessToken = tokens.access_token;
                await prisma.user.update({
                    where: { id: userId },
                    data: { googleAccessToken: accessToken },
                });
                return await fetchDriveFiles(accessToken);
            } catch (refreshError) {
                console.error(`[GoogleDrive] Failed to refresh token`, refreshError);
                throw new Error('Google authentication expired');
            }
        }
        throw error;
    }
};

const fetchDriveFiles = async (accessToken: string): Promise<DriveFile[]> => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const timeString = sevenDaysAgo.toISOString();

    // Query explanation:
    // mimeType contains 'video/' -> Look for video files
    // createdTime > ... -> Recent files
    // trashed = false -> Not in bin
    const q = `mimeType contains 'video/' and createdTime > '${timeString}' and trashed = false`;

    const response = await axios.get('https://www.googleapis.com/drive/v3/files', {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
            q: q,
            fields: 'files(id, name, mimeType, webViewLink, createdTime)',
            orderBy: 'createdTime desc',
            pageSize: 20,
        },
    });

    console.log(`[GoogleDrive] Fetched ${response.data.files.length} video files from Drive`);
    return response.data.files;
};
