"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const project_members_controller_1 = require("../controllers/project-members.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/project/:projectId', project_members_controller_1.getProjectMembers);
exports.default = router;
