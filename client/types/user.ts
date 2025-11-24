export enum SkillLevel {
    BEGINNER = 'BEGINNER',
    INTERMEDIATE = 'INTERMEDIATE',
    ADVANCED = 'ADVANCED',
    EXPERT = 'EXPERT'
}

export interface UserSkill {
    id: string;
    userId: string;
    skill: string;
    level: SkillLevel;
}
