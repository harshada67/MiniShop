import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { ProfileComponent } from './profile/profile.component';
import { LoginComponent } from './login/login.component';
import {
  OrdersComponent
} from './orders/orders.component';
import {
  OrderDetailsComponent
} from './order-details/order-details.component';
const routes: Routes = [
  {
    path: "",
    component: HomeComponent,
   // pathMatch: "full"
  },
    {
    path: 'login',
    component: LoginComponent
  },
  // {
  //   path: 'product',
  //   loadChildren: () =>
  //     import('products/ProductsModule').then(
  //       m => m.ProductsModule
  //     )
  // },
    {
    path: 'productsNew',
    loadChildren: () =>
      import('productsNew/ProductsModule').then(
        m => m.ProductsModule
      )
  },

  {
  path: 'cart',
  loadChildren: () =>
    import('cart/CartModule').then(
      ({ CartModule }) => CartModule
    )
},

{
    path: 'checkout',
    component: CheckoutComponent
},
{
  path: 'orders',
  component: OrdersComponent
},
{
  path: 'orders/:id',
  component: OrderDetailsComponent
},
{
  path: 'profile',
  component: ProfileComponent
}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
