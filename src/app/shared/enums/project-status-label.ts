import { ProjectStatus } from './project-status';

export const ProjectStatusLabels: Record<ProjectStatus, string> = {
  [ProjectStatus.IN_PROGRESS]: 'En cours',
  [ProjectStatus.MAINTAINED]: 'Maintenu',
  [ProjectStatus.ARCHIVED]: 'Archivé',
  [ProjectStatus.CANCELLED]: 'Annulé',
};
