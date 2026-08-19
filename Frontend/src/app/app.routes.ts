import { Routes } from '@angular/router';
import { ProductsComponent } from './products/product-list/products.component';
import { ProductCreateComponent } from './products/product-create/product-create.component';
import { ProductDetailComponent } from './products/product-detail/product-detail.component';
import { MovementListComponent } from './stock-movements/movement-list/movement-list';
import { MovementFormComponent } from './stock-movements/movement-form/movement-form';
import { NotificationListComponent } from './notifications/notification-list/notification-list';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'products', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'products', component: ProductsComponent, canActivate: [AuthGuard] },
    { path: 'products/new', component: ProductCreateComponent, canActivate: [AuthGuard] },
    { path: 'products/:id', component: ProductDetailComponent, canActivate: [AuthGuard] },
    { path: 'movements', component: MovementListComponent, canActivate: [AuthGuard] },
    { path: 'movements/new', component: MovementFormComponent, canActivate: [AuthGuard] },
    { path: 'notifications', component: NotificationListComponent, canActivate: [AuthGuard] },
    { path: '**', redirectTo: 'products' } // Catch-all route
];
