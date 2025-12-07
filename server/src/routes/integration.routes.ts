import { Router } from 'express';
import { oauthRedirectHandler, oauthCallbackHandler } from '../services/oauth.service';
import { handleZoomWebhook, handleGoogleWebhook, handleMicrosoftWebhook } from '../services/meeting-webhook.service';
import { getGoogleEvents, getIntegrationStatus } from '../controllers/integration.controller';
import { getImportableMeetings, importMeeting } from '../controllers/meeting-import.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// OAuth routes
router.get('/oauth/:provider', oauthRedirectHandler);
router.get('/oauth/:provider/callback', oauthCallbackHandler);

// Calendar routes
router.get('/google/events', authenticate, getGoogleEvents);
router.get('/status', authenticate, getIntegrationStatus);

// Meeting Import routes
router.get('/meetings/importable', authenticate, getImportableMeetings);
router.post('/meetings/import', authenticate, importMeeting);

// Webhook routes - Note: These might need to be public or have specific signature verification middleware
router.post('/webhooks/zoom', handleZoomWebhook);
router.post('/webhooks/google', handleGoogleWebhook);
router.post('/webhooks/microsoft', handleMicrosoftWebhook);

export default router;
