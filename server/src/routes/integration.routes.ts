import { Router } from 'express';
import { oauthRedirectHandler, oauthCallbackHandler } from '../services/oauth.service';
import { handleZoomWebhook, handleGoogleWebhook, handleMicrosoftWebhook } from '../services/meeting-webhook.service';

const router = Router();

// OAuth routes
router.get('/oauth/:provider', oauthRedirectHandler);
router.get('/oauth/:provider/callback', oauthCallbackHandler);

// Webhook routes - Note: These might need to be public or have specific signature verification middleware
router.post('/webhooks/zoom', handleZoomWebhook);
router.post('/webhooks/google', handleGoogleWebhook);
router.post('/webhooks/microsoft', handleMicrosoftWebhook);

export default router;
