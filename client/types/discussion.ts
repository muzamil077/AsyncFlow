export interface DiscussionPost {
    id: string;
    content: string;
    discussionId: string;
    createdById: string;
    createdAt: string;
    updatedAt: string;
    createdBy: {
        id: string;
        name: string | null;
        email: string;
    };
}

export interface Discussion {
    id: string;
    title: string;
    content: string;
    projectId: string;
    createdById: string;
    createdAt: string;
    updatedAt: string;
    createdBy: {
        id: string;
        name: string | null;
        email: string;
    };
    posts?: DiscussionPost[];
    _count?: {
        posts: number;
    };
}

export interface CreateDiscussionData {
    title: string;
    content: string;
    projectId: string;
}

export interface CreatePostData {
    content: string;
}

export interface ThreadAnalysis {
    consensus: string[];
    disagreements: string[];
    summary: string;
}
