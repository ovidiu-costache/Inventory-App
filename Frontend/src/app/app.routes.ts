import { Routes } from '@angular/router';
import { ProductsComponent } from './products/product-list/products.component';
import { ProductCreateComponent } from './products/product-create/product-create.component';
import { ProductDetailComponent } from './products/product-detail/product-detail.component';

export const routes: Routes = [
    { path: '', redirectTo: 'products', pathMatch: 'full' },
    { path: 'products', component: ProductsComponent },
    { path: 'products/new', component: ProductCreateComponent },
    { path: 'products/:id', component: ProductDetailComponent },
    // { path: 'movements', component: MovementsComponent }
];
