import { FileInfo } from './file-info';
import { ProjectCategory } from '../../shared/enums/project-category';
import { Tag } from './tag';
import { ProjectStatus } from '../../shared/enums/project-status';

export interface Project {
  tags: Tag[];
  title: string;
  summary: string;
  coverImage: FileInfo;
  files: FileInfo[];
  features: string[];
  category: ProjectCategory;
  startDate: string;
  idVideo?: string;
  gitLink?: string;
  demoLink?: string;
  status: ProjectStatus;
}
