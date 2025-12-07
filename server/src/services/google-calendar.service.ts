import axios from 'axios';
import prisma from '../lib/prisma';
import { refreshAccessToken } from './oauth.service';

interface CalendarEvent {
    id: string;
    summary: string;
    description?: string;
    start: { dateTime?: string; date?: string };
    end: { dateTime?: string; date?: string };
    htmlLink: string;
    hangoutLink?: string; // Google Meet link
}

export const listGoogleEvents = async (userId: string): Promise<CalendarEvent[]> => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { googleAccessToken: true, googleRefreshToken: true },
    });

    if (!user || !user.googleAccessToken) {
        throw new Error('Google account not connected. Please connect your Google account in settings.');
    }

    let accessToken = user.googleAccessToken;

    try {
        return await fetchEvents(accessToken);
    } catch (error: any) {
        // If unauthorized (401), try to refresh token
        if (error.response && error.response.status === 401 && user.googleRefreshToken) {
            console.log(`[GoogleCalendar] Access token expired for user ${userId}, refreshing...`);
            try {
                const tokens = await refreshAccessToken('google', user.googleRefreshToken);
                accessToken = tokens.access_token;

                // Update new access token in DB
                await prisma.user.update({
                    where: { id: userId },
                    data: { googleAccessToken: accessToken },
                });

                // Retry fetch with new token
                return await fetchEvents(accessToken);
            } catch (refreshError: any) {
                console.error(`[GoogleCalendar] Failed to refresh token for user ${userId}`, refreshError);
                // Clear invalid tokens from database
                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        googleAccessToken: null,
                        googleRefreshToken: null
                    },
                });
                throw new Error('Google authentication expired. Please reconnect your Google account in settings.');
            }
        }
        // If it's a different error, provide helpful message
        if (error.response?.status === 403) {
            const errorDetails = JSON.stringify(error.response.data?.error || error.response.data, null, 2);
            console.error('[GoogleCalendar] 403 Error Details:', errorDetails);
            throw new Error(`Permission denied. Google says: ${errorDetails}`);
        }
        throw error;
    }
};

export const listPastRecordings = async (userId: string): Promise<CalendarEvent[]> => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { googleAccessToken: true, googleRefreshToken: true },
    });

    if (!user || !user.googleAccessToken) {
        throw new Error('Google account not connected');
    }

    let accessToken = user.googleAccessToken;

    try {
        return await fetchPastEventsWithRecordings(accessToken);
    } catch (error: any) {
        if (error.response && error.response.status === 401 && user.googleRefreshToken) {
            try {
                const tokens = await refreshAccessToken('google', user.googleRefreshToken);
                accessToken = tokens.access_token;
                await prisma.user.update({
                    where: { id: userId },
                    data: { googleAccessToken: accessToken },
                });
                return await fetchPastEventsWithRecordings(accessToken);
            } catch (refreshError) {
                console.error(`[GoogleCalendar] Failed to refresh token`, refreshError);
                throw new Error('Google authentication expired');
            }
        }
        throw error;
    }
};

const fetchPastEventsWithRecordings = async (accessToken: string): Promise<CalendarEvent[]> => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const response = await axios.get('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
            timeMin: sevenDaysAgo.toISOString(),
            timeMax: new Date().toISOString(),
            maxResults: 50,
            singleEvents: true,
            orderBy: 'startTime',
        },
    });

    console.log(`[GoogleCalendar] Fetched ${response.data.items.length} events from the last 7 days`);

    // Debug: Log all events to see what we got
    response.data.items.forEach((event: any) => {
        console.log(`[GoogleCalendar] Event: "${event.summary}" | Link: ${!!event.hangoutLink} | Attachments: ${event.attachments?.length || 0}`);
    });

    // Filter for events that have attachments (recordings) and are Google Meet
    const meetings = response.data.items.filter((event: any) => {
        const hasHangoutLink = !!event.hangoutLink;
        // Relaxed check: For now, just check if it was a Google Meet. 
        // In production, we'd strictly require the recording attachment, 
        // but for testing/demo, let's show all past Meets.

        // const hasAttachments = event.attachments && event.attachments.length > 0;
        // const hasVideoAttachment = hasAttachments && event.attachments.some((att: any) => att.mimeType === 'video/mp4');

        // return hasHangoutLink && hasVideoAttachment;
        return hasHangoutLink;
    });

    console.log(`[GoogleCalendar] Found ${meetings.length} importable meetings after filtering`);
    return meetings;
};

const fetchEvents = async (accessToken: string): Promise<CalendarEvent[]> => {
    const response = await axios.get('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
            timeMin: new Date().toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: 'startTime',
        },
    });
    return response.data.items;
};
