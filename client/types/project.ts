export interface Project {
    id: string;
    name: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
    ownerId: string;
}

export interface CreateProjectData {
    name: string;
    description?: string;
}

export interface UpdateProjectData {
    name?: string;
    description?: string;
}
