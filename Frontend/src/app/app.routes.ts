import { Routes } from '@angular/router';
import { ProductsComponent } from './products/product-list/products.component';
import { ProductCreateComponent } from './products/product-create/product-create.component';
import { ProductDetailComponent } from './products/product-detail/product-detail.component';
import { MovementListComponent } from './stock-movements/movement-list/movement-list';
import { MovementFormComponent } from './stock-movements/movement-form/movement-form';
import { NotificationListComponent } from './notifications/notification-list/notification-list';

export const routes: Routes = [
    { path: '', redirectTo: 'products', pathMatch: 'full' },
    { path: 'products', component: ProductsComponent },
    { path: 'products/new', component: ProductCreateComponent },
    { path: 'products/:id', component: ProductDetailComponent },
    { path: 'movements', component: MovementListComponent },
    { path: 'movements/new', component: MovementFormComponent },
    { path: 'notifications', component: NotificationListComponent }
];
