"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTranscriptionJob = exports.meetingQueue = void 0;
// src/queues/bull-queue.ts – Bull queue setup for background jobs (transcription, wiki updates)
const bull_1 = __importDefault(require("bull"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Create a queue named "meetingQueue"
exports.meetingQueue = new bull_1.default('meetingQueue', {
    redis: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
    },
});
// Example of adding a transcription job
const addTranscriptionJob = async (meetingId, audioUrl) => {
    await exports.meetingQueue.add('transcribe', { meetingId, audioUrl }, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: true,
    });
};
exports.addTranscriptionJob = addTranscriptionJob;
// Process jobs – the actual processor is defined in a separate file (transcription.job.ts)
exports.meetingQueue.process('transcribe', async (job) => {
    const { meetingId, audioUrl } = job.data;
    // Lazy import to avoid circular dependencies
    const { transcribeAudio } = await Promise.resolve().then(() => __importStar(require('../jobs/transcription.job')));
    await transcribeAudio(meetingId, audioUrl);
});
exports.default = exports.meetingQueue;
