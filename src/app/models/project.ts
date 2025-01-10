import {Category} from "./category";

export interface Project {
  title: string;
  summary: string;
  features: string[];
  categories: Category[];
  startDate: string;
  videoLink?: string;
  gitLink?: string;
  demoLink?: string;
  status: string;
}
