// server/cvdata.js


export const CV_DATA = {
  personalInfo: {
    fullName: "Zied Sayadi",
    professionalTitle: "Développeur Full-Stack web/mobile",
    avatarUrl: "/src/images/sd.png"
  },
  profile: "Développeur Web & Mobile avec 4 ans d'expérience en développement front-end et back-end. Spécialisé en React, Node.js, Drupal et Symfony, j'ai contribué au développement de solutions digitales pour des entreprises comme Thales.",
  contact: {
    email: "zieed.sayadi@gmail.com",
    phone: "+216 21 837 489",
    location: "Tunis",
    github: "https://github.com/ziedsayadi1992",
    linkedin: "linkedin.com/in/zied-sayadi"
  },
  skills: [
    "Conception technique",
    "Développement des API, Back-End et Front-End",
    "Résoudre les problèmes techniques est fonctionnelle",
    "Intégration des nouveaux packages",
    "Intégration et déploiement continue",
    "Optimisation du code avec les bonnes pratiques et les bonnes packages"
  ],
  technologies: {
    "Langages & Standards": [
      "PHP 7", "JavaScript", "TypeScript", "HTML", "CSS", "SASS", "JSON", "UML"
    ],
    "Frameworks & Bibliothèques": [
      "Symfony", "Node.js", "Express.js", "React.js", "Redux", "React Native", "PrestaShop", "Drupal"
    ],
    "Tests & Qualité": [
      "PhpUnit"
    ],
    "Bases de Données": [
      "MySQL", "MariaDB", "SQL Server", "MongoDB", "Redis"
    ],
    "DevOps & Hébergement": [
      "Docker", "Docker-Compose", "OVH", "CI/CD"
    ],
    "Architecture & Protocoles": [
      "MVC", "REST", "SOAP"
    ]
  },
  experiences: [
    {
      id: "1",
      jobTitle: "Développeur Web & Mobile",
      company: "Matuile Pro (Paris, France)",
      missions: [
        "Stack : CodeIgniter (PHP), React Native (Redux), OneSignal, OVH/CDN",
        "Conception des modèles de données (tuiles, utilisateurs, services) et architecture applicative.",
        "Développement du back-end avec CodeIgniter : API REST, gestion des réservations et des accès.",
        "Développement mobile en React Native (sans Expo) avec Redux pour la gestion d'état global.",
        "Mise en place de la messagerie (emails, SMS, push notifications via OneSignal).",
        "Déploiement sur OVH avec optimisation des performances via CDN."
      ]
    },
    {
      id: "2",
      jobTitle: "Développeur Symfony",
      company: "Macarto des Risques (AMRAE & MEDEF 79 – France)",
      missions: [
        "Stack : Symfony 5, Twig, EasyAdmin, DataTables, Leaflet.js",
        "Développement des formulaires de cartographie des risques et génération de rapports PDF (radar, analyses).",
        "Gestion multi-rôles utilisateurs (sociétés & administrateurs).",
        "Personnalisation du tableau de bord EasyAdmin pour le suivi des cartographies.",
        "Intégration de DataTables pour le tri, recherche et export des données.",
        "Ajout de visualisations (diagrammes, cartes géographiques via Leaflet.js)."
      ]
    },
    {
      id: "3",
      jobTitle: "Développeur Drupal",
      company: "Cyber Solutions by Thales (CDS)",
      missions: [
        "Stack : Drupal 10, MVC, Webform, JSON:API Views, LazyLoad, SEO modules",
        "Création et intégration du thème personnalisé Drupal 10 avec architecture MVC.",
        "Intégration de modules : Webform (formulaires avancés), SEO, Feeds, JSON:API Views, LazyLoad, AddToAny.",
        "Développement de modules custom adaptés aux besoins spécifiques.",
        "Optimisation du portail : performances, caching, lazy loading, CDN.",
        "Maintenance et corrections pour un site vitrine international en cybersécurité."
      ]
    },
    {
      id: "4",
      jobTitle: "Développeur Frontend",
      company: "Kepler Travel (Paris, France)",
      missions: [
        "Stack : React.js, TypeScript, Node.js",
        "Conception du frontend avec React & TypeScript (composants réutilisables, formulaires avancés).",
        "Intégration de React Hook Form + Controller pour la gestion fiable des réservations et devis.",
        "Développement de custom hooks pour centraliser le fetch et réduire les appels réseau.",
        "Optimisation des performances avec useMemo, useCallback et rendu conditionnel.",
        "Mise en place de vues dynamiques (catalogue, filtres, détail voyage, réservation en ligne)."
      ]
    }
  ],
  languages: [
    { name: "Français", flag: "", level: "Courant (C1)" },
    { name: "Arabe", flag: "", level: "Langue maternelle" },
    { name: "Anglais", flag: "", level: "Courant (C1)" }
  ],
  certifications: [
    { name: "Bootcamp Full-Stack-JS", issuer: "GoMyCode" },
    { name: "Création d'entreprise et formation d'entrepreneurs (CEFE)", issuer: "CEFE" }
  ]
};
