import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { MaintenanceComponent } from './layouts/maintenance/maintenance.component';
import { ServicesOverviewComponent } from './services-overview/services-overview.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  {path:'mantenimiento', component:MaintenanceComponent},
  {path:'servicios',component:ServicesOverviewComponent},
  // Rutas de servicios
  
  // Rutas de empresa
  { path: 'team', redirectTo: 'nosotros/equipo', pathMatch: 'full' },
  // Rutas legales
  { path: 'privacidad', redirectTo: 'legal/privacidad', pathMatch: 'full' },
  { path: 'cookies', redirectTo: 'legal/cookies', pathMatch: 'full' },
  { path: 'accesibilidad', redirectTo: 'legal/accesibilidad', pathMatch: 'full' },
  
  // Rutas de contacto
  
  // Rutas adicionales
  
  // Ruta de sitemap
  
  // Ruta de fallback
  { path: '**', redirectTo: 'mantenimiento' }
];