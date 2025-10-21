import { Routes } from '@angular/router';


export const routes: Routes = [
  {
    path: '',
    redirectTo: '/inicio',
    pathMatch: 'full'
  },
  {
    path: 'inicio',
    loadComponent: () => import('./Pages/inicio/inicio').then(m => m.Inicio)
  },
  
  {
    path: 'ubi-programa',
    loadComponent: () => import('./Pages/ubi-programa/ubi-programa').then(m => m.UbiPrograma)
  },
  {
    path: 'quienes-somos',
    loadComponent: () => import('./Pages/quienes-somos/quienes-somos').then(m => m.QuienesSomos)
  },
  {
    path: 'que-hacemos',
    loadComponent: () => import('./Pages/que-hacemos/que-hacemos').then(m => m.QueHacemos)
  },
  {
    path: 'contactanos',
    loadComponent: () => import('./Pages/contactanos/contactanos').then(m => m.Contactanos)
  },
  {
    path: 'ninos-en-problemas',
    loadComponent: () => import('./Pages/ninos-en-problemas/ninos-en-problemas').then(m => m.NinosEnProblemasPage)
  },
  {
    path: 'mi-ubicacion',
    loadComponent: () => import('./Pages/mi-ubicacion/mi-ubicacion').then(m => m.MiUbicacionComponent)
  },
  {
    path: '**',
    redirectTo: '/inicio'
  }
];
