import { Tag } from '@/app/shared/interfaces/tag';

export interface File {
  object_id: number;
  name: string;
  tags: Tag[];
  folder_id: number;
  archived: boolean;
  bucket_id: number;
  dateOfCreation: Date;
  encoded_urn: string;
  thumbnail: Blob;
}