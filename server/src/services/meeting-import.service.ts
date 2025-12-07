import { listZoomEvents } from './zoom.service';
import { listPastRecordings } from './google-calendar.service';
import { listRecentDriveRecordings } from './google-drive.service';
import prisma from '../lib/prisma';

export interface ImportableMeeting {
    id: string;
    topic: string;
    startTime: string;
    url: string;
    provider: 'zoom' | 'google';
    duration?: number;
    recordingFiles?: any[];
}

export const listImportableMeetings = async (userId: string): Promise<ImportableMeeting[]> => {
    const meetings: ImportableMeeting[] = [];

    // Fetch Zoom recordings
    try {
        const zoomRecordings = await listZoomEvents(userId);
        const zoomMeetings = zoomRecordings.map((rec: any) => ({
            id: rec.uuid,
            topic: rec.topic,
            startTime: rec.start_time,
            url: rec.share_url,
            provider: 'zoom' as const,
            duration: rec.duration,
            recordingFiles: rec.recording_files
        }));
        meetings.push(...zoomMeetings);
    } catch (error) {
        console.warn(`[MeetingImport] Failed to fetch Zoom recordings for user ${userId}`, error);
    }

    // Fetch Google Meet recordings
    try {
        const googleRecordings = await listPastRecordings(userId);
        const googleMeetings = googleRecordings.map((event: any) => ({
            id: event.id,
            topic: event.summary,
            startTime: event.start.dateTime || event.start.date,
            url: event.hangoutLink,
            provider: 'google' as const,
            // Find the video attachment
            recordingFiles: event.attachments.filter((att: any) => att.mimeType === 'video/mp4')
        }));
        meetings.push(...googleMeetings);
    } catch (error) {
        console.warn(`[MeetingImport] Failed to fetch Google recordings for user ${userId}`, error);
    }

    // Fetch Google Drive recordings (for instant meetings)
    try {
        const driveRecordings = await listRecentDriveRecordings(userId);
        const driveMeetings = driveRecordings.map((file: any) => ({
            id: file.id,
            topic: file.name, // Use filename as topic
            startTime: file.createdTime,
            url: file.webViewLink,
            provider: 'google' as const,
            recordingFiles: [file]
        }));

        // Deduplicate: Don't add if we already have a calendar event with this recording
        // This is a simple check; might need refinement if IDs don't match easily
        driveMeetings.forEach(dm => {
            const exists = meetings.some(m =>
                m.provider === 'google' &&
                m.recordingFiles?.some(rf => rf.fileId === dm.id || rf.webViewLink === dm.url)
            );
            if (!exists) {
                meetings.push(dm);
            }
        });
    } catch (error) {
        console.warn(`[MeetingImport] Failed to fetch Drive recordings for user ${userId}`, error);
    }

    // Sort by date descending
    return meetings.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
};

export const processMeeting = async (userId: string, meetingId: string, provider: 'zoom' | 'google', projectId: string) => {
    // 1. Fetch meeting details to get recording URL
    // For now, we'll mock the processing since we don't have real audio files to download easily without more setup

    console.log(`[MeetingImport] Processing meeting ${meetingId} from ${provider} for project ${projectId}`);

    // Mock delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock result
    const summary = "This was a productive meeting where the team discussed the Q4 roadmap. Key focus areas include performance optimization and new user onboarding.";

    const actionItems = [
        { content: "Update API documentation", assignee: "Dev Team", dueDate: new Date(Date.now() + 86400000 * 3) },
        { content: "Schedule follow-up with design", assignee: "Product Owner", dueDate: new Date(Date.now() + 86400000 * 7) }
    ];

    const decisions = [
        "Approved the new UI design for the dashboard",
        "Decided to use PostgreSQL for the new microservice"
    ];

    // Save to database
    // We need to create a Meeting entry. 
    // Assuming we have a Meeting model. If not, we might need to create one or use an existing one.
    // Let's check schema.prisma first to be sure.

    // For now, returning the result so the controller can send it back
    return {
        summary,
        actionItems,
        decisions
    };
};
