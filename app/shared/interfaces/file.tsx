import { Tag } from '@/app/shared/interfaces/tag';

export interface File {
  object_id: number;
  name: string;
  tags: Tag[];
  dateOfCreation: Date;
}