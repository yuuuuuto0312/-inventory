import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { InventoryComponent } from './inventory/inventory.component'; //在庫管理

export const routes: Routes = [
    {path: 'login', component: LoginComponent},
    { path:'',redirectTo:'login',pathMatch:'full'},
   { path: 'inventory', component: InventoryComponent }
];


