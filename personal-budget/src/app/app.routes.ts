import { Routes } from '@angular/router';
import { Homepage } from './homepage/homepage';
import { Login } from './login/login';
import { About } from './about/about';
import { Contact } from './contact/contact';
import { P404 } from './p404/p404';

export const routes: Routes = [
  {
    path: '',
    component: Homepage,
    pathMatch: 'full'
  },
  {
    path: 'about',
    component: About
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'contact',
    component: Contact
  },
  {
  path: '**',
  component: P404
  }
];
