import { Tag } from '@/app/shared/interfaces/tag';

export interface Folder {
  folder_id: number;
  name: string;
  parent_folder_id: number | null;
  tags: Tag[];
  dateOfCreation: Date;
}