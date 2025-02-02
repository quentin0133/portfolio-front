import {Category} from "./category";
import {File} from "./file";

export interface Project {
  title: string;
  summary: string;
  coverImage: File;
  files: File[];
  features: string[];
  categories: Category[];
  startDate: string;
  idVideo?: string;
  gitLink?: string;
  demoLink?: string;
  status: string;
}
