import { Routes } from '@angular/router';
import { ProductsComponent } from './products/product-list/products.component';

export const routes: Routes = [
    { path: '', redirectTo: 'products', pathMatch: 'full' },
    { path: 'products', component: ProductsComponent },
    // { path: 'movements', component: MovementsComponent }
];
