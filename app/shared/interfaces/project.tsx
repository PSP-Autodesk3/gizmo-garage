import { Tag } from '@/app/shared/interfaces/tag';
import { User } from 'firebase/auth';

export interface Project {
    project_id: number;
    name: string;
    ownsProject: number;
    error: string;
    tags: Tag[];
    dateOfCreation: Date;
    editors: User[];
}