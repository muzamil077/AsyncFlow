"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const skills_controller_1 = require("../controllers/skills.controller");
const router = express_1.default.Router();
router.use(auth_middleware_1.authenticate);
router.get('/', skills_controller_1.getUserSkills);
router.get('/:userId', skills_controller_1.getUserSkills);
router.post('/', skills_controller_1.addSkill);
router.delete('/:skillId', skills_controller_1.removeSkill);
exports.default = router;
