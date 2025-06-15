import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { MaintenanceComponent } from './layouts/maintenance/maintenance.component';
import { ServicesOverviewComponent } from './services-overview/services-overview.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { TermsConditionsComponent } from './legal/terms-conditions/terms-conditions.component';
import { PrivacyPolicyComponent } from './legal/privacy-policy/privacy-policy.component';
import { AccessibilityStatementComponent } from './legal/accessibility-statement/accessibility-statement.component';
import { CookiePolicyComponent } from './legal/cookie-policy/cookie-policy.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  {path:'mantenimiento', component:MaintenanceComponent},
  {path:'servicios',component:ServicesOverviewComponent},
  { path:'nosotros',component:AboutUsComponent},

  //rutas legales
  {path:"terminos", component:TermsConditionsComponent},
  {path:"privacidad",component:PrivacyPolicyComponent},
  {path:"accesibilidad",component:AccessibilityStatementComponent},
  {path:"politica-cookies",component:CookiePolicyComponent},
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