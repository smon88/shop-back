import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CartComponent } from './cart/cart.component';
import { ProductComponent } from './product/product.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { ProductsComponent } from './products/products.component';
import { AdminProductsComponent } from './admin/products/admin-products.component';
import { PaymentResultComponent } from './payment-result/payment-result.component';

export const routes: Routes = [
  {
    path: '',
    title: 'Zentra',
    component: HomeComponent,
  },
  {
    path: 'cart',
    title: 'Zentra | Cart',
    component: CartComponent,
  },
  {
    path: 'products',
    title: 'Zentra | Products',
    component: ProductsComponent,
  },
  {
    path: 'products/:id',
    title: 'Zentra | Product Details',
    component: ProductComponent,
  },
  {
    path: 'checkout',
    title: 'Zentra | Checkout',
    component: CheckoutComponent,
  },
  {
    path: 'finish',
    title: 'Zentra | Resultado de Pago',
    component: PaymentResultComponent,
  },
  {
    path: 'admin/products',
    title: 'Zentra | Admin - Productos',
    component: AdminProductsComponent,
  },
];
