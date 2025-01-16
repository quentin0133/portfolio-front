import { Injectable } from '@angular/core';
import {catchError, delay, Observable, throwError} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { Project } from '../../models/project';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private ENDPOINT = `${environment.API_URL}/api/projects`;

  /*projects: Project[] = [
    {
      title: 'A',
      status: 'Terminé',
      summary:
        "Dans un monde où le temps est une ressource tangible et monnayable, Liora, une horlogère de génie, découvre une ancienne montre capable de manipuler le flux temporel. Alors qu’elle cherche à comprendre son fonctionnement, elle attire l’attention du mystérieux Consortium des Veilleurs, une organisation qui contrôle secrètement l’économie du temps. Liora se retrouve rapidement traquée, accusée de perturber l'équilibre fragile qui maintient les riches éternellement jeunes et les pauvres à court de secondes.\n" +
        '\n' +
        'Avec l’aide d’un rebelle du système, Kael, qui prétend connaître les sombres secrets du Consortium, elle entreprend un périple à travers des zones hors du temps : des lieux figés dans une éternité silencieuse, peuplés de fantômes d’anciennes vies. Mais chaque utilisation de la montre la rapproche d’un prix à payer : la perte progressive de ses propres souvenirs.\n' +
        '\n' +
        'Alors que le compte à rebours final se déclenche, Liora doit choisir entre révéler la vérité au monde, risquant ainsi de plonger l’humanité dans un chaos incontrôlable, ou renoncer à ses idéaux pour sauver ceux qu’elle aime. Dans une course contre le temps, ses choix redéfiniront le destin de son univers et les liens fragiles entre passé, présent et futur.' +
        '\n' +
        "Dans un monde où le temps est une ressource tangible et monnayable, Liora, une horlogère de génie, découvre une ancienne montre capable de manipuler le flux temporel. Alors qu’elle cherche à comprendre son fonctionnement, elle attire l’attention du mystérieux Consortium des Veilleurs, une organisation qui contrôle secrètement l’économie du temps. Liora se retrouve rapidement traquée, accusée de perturber l'équilibre fragile qui maintient les riches éternellement jeunes et les pauvres à court de secondes. Avec l’aide d’un rebelle du système, Kael, qui prétend connaître les sombres secrets du Consortium, elle entreprend un périple à travers des zones hors du temps : des lieux figés dans une éternité silencieuse, peuplés de fantômes d’anciennes vies. Mais chaque utilisation de la montre la rapproche d’un prix à payer : la perte progressive de ses propres souvenirs. Alors que le compte à rebours final se déclenche, Liora doit choisir entre révéler la vérité au monde, risquant ainsi de plonger l’humanité dans un chaos incontrôlable, ou renoncer à ses idéaux pour sauver ceux qu’elle aime. Dans une course contre le temps, ses choix redéfiniront le destin de son univers et les liens fragiles entre passé, présent et futur.",
      features: [
        "Réalisation de la page d'accueil",
        'Utilisation de JWT Token',
        'Merise : MCD / MLD / MPD',
        "UML : Diagramme de cas d'utilisation, diagramme de séquence",
      ],
      categories: [
        {
          title: 'Java',
          categoryGroup: {
            title: 'Language',
            backgroundColor: '#bf5408',
            textColor: '#FFFFFF',
          },
        },
        {
          title: 'React',
          categoryGroup: {
            title: 'Technologies utilisées',
            backgroundColor: '#1bb544',
            textColor: '#FFFFFF',
          },
        },
      ],
      startDate: '2024-10-31',
    },
    {
      title: 'Jojo project',
      status: 'Terminé',
      summary: 'Un autre exemple de projet',
      features: [
        "Réalisation de la page d'accueil",
        'Utilisation de JWT Token',
      ],
      categories: [
        {
          title: 'Java',
          categoryGroup: {
            title: 'Language',
            backgroundColor: '#bf5408',
            textColor: '#FFFFFF',
          },
        },
        {
          title: 'React',
          categoryGroup: {
            title: 'Technologies utilisées',
            backgroundColor: '#1bb544',
            textColor: '#FFFFFF',
          },
        },
      ],
      startDate: '2024-10-31',
    },
    {
      title: "L'armoire en T",
      status: 'Terminé',
      summary:
        "Ce projet vise à créer une plateforme de gestion de tâches collaboratives en ligne. Il permet aux utilisateurs de créer, suivre et gérer leurs tâches dans un environnement intuitif et facile à utiliser. Le projet inclut des fonctionnalités de collaboration en temps réel, de notifications, ainsi qu'un tableau de bord interactif. L'objectif est d'améliorer la productivité des équipes et de faciliter la gestion des projets.",
      features: [
        "Réalisation de la page d'accueil",
        'Utilisation de JWT Token',
      ],
      categories: [
        {
          title: 'Java',
          categoryGroup: {
            title: 'Language',
            backgroundColor: '#bf5408',
            textColor: '#FFFFFF',
          },
        },
        {
          title: 'React',
          categoryGroup: {
            title: 'Technologies utilisées',
            backgroundColor: '#1bb544',
            textColor: '#FFFFFF',
          },
        },
      ],
      startDate: '2024-10-31',
    },
    {
      title: 'Sheesh',
      status: 'Terminé',
      summary:
        '<strong>Ce projet vise à créer une</strong> <span class="font-bold text-blue-600">plateforme de gestion de tâches collaboratives en ligne</span>. Il permet aux utilisateurs de <span class="font-bold text-blue-600">créer, suivre et gérer</span> leurs tâches dans un environnement <span class="text-green-600">intuitif</span> et facile à utiliser. Le projet inclut des fonctionnalités de <span class="font-bold text-red-500">collaboration en temps réel</span>, de <span class="font-semibold text-yellow-500">notifications</span>, ainsi qu\'un <span class="text-purple-600">tableau de bord interactif</span>. L\'objectif est d\'améliorer la <span class="font-bold text-teal-600">productivité des équipes</span> et de faciliter la gestion des <span class="font-medium text-indigo-600">projets</span>.\n',
      features: [
        "Réalisation de la page d'accueil",
        'Utilisation de JWT Token',
      ],
      categories: [
        {
          title: 'Java',
          categoryGroup: {
            title: 'Language',
            backgroundColor: '#bf5408',
            textColor: '#FFFFFF',
          },
        },
        {
          title: 'React',
          categoryGroup: {
            title: 'Technologies utilisées',
            backgroundColor: '#1bb544',
            textColor: '#FFFFFF',
          },
        },
      ],
      startDate: '2024-10-31',
    },
  ];*/

  constructor(private http: HttpClient) {}

  findAll(): Observable<Project[]> {
    return this.http.get<Project[]>(this.ENDPOINT)
      .pipe(
        catchError((error) => {
          console.error(error);
          return throwError(() => new Error('An error occurred in project service.'));
        })
      )
  }
}
