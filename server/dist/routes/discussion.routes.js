"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const discussion_controller_1 = require("../controllers/discussion.controller");
const router = express_1.default.Router();
router.use(auth_middleware_1.authenticate);
router.post('/', discussion_controller_1.createDiscussion);
router.get('/project/:projectId', discussion_controller_1.getDiscussions);
router.get('/:id', discussion_controller_1.getDiscussion);
router.post('/:id/posts', discussion_controller_1.createPost);
router.post('/:id/analyze', discussion_controller_1.analyzeThread);
exports.default = router;
