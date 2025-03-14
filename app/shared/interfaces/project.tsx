import { Tag } from '@/app/shared/interfaces/tag';

export interface Project {
    project_id: number;
    name: string;
    ownsProject: number;
    error: string;
    tags: Tag[];
    dateOfCreation: Date;
}