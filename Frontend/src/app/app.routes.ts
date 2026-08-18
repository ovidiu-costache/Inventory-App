import { Routes } from '@angular/router';
import { MovementListComponent } from './stock-movements/movement-list/movement-list';
import { MovementFormComponent } from './stock-movements/movement-form/movement-form';

export const routes: Routes = [
    { path: '', redirectTo: 'movements', pathMatch: 'full' },
    // { path: 'products', ... } — to be added
    { path: 'movements', component: MovementListComponent },
    { path: 'movements/new', component: MovementFormComponent }
];
