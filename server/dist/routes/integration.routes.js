"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const oauth_service_1 = require("../services/oauth.service");
const meeting_webhook_service_1 = require("../services/meeting-webhook.service");
const router = (0, express_1.Router)();
// OAuth routes
router.get('/oauth/:provider', oauth_service_1.oauthRedirectHandler);
router.get('/oauth/:provider/callback', oauth_service_1.oauthCallbackHandler);
// Webhook routes - Note: These might need to be public or have specific signature verification middleware
router.post('/webhooks/zoom', meeting_webhook_service_1.handleZoomWebhook);
router.post('/webhooks/google', meeting_webhook_service_1.handleGoogleWebhook);
router.post('/webhooks/microsoft', meeting_webhook_service_1.handleMicrosoftWebhook);
exports.default = router;
