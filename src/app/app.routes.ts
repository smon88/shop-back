import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CartComponent } from './cart/cart.component';
import { ProductComponent } from './product/product.component';
import { PaymentSuccessComponent } from './payment/payment-success/payment-success.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { ProductsComponent } from './products/products.component';
import { PaymentComponent } from './payment/payment.component';
import { PaymentErrorComponent } from './payment/payment-error/payment-error.component';

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
    path: 'payment',
    title: 'Zentra | Payment',
    component: PaymentComponent,
  },
  {
    path: 'payment/success',
    title: 'Zentra | Payment Success',
    component: PaymentSuccessComponent,
  },
  {
    path: 'payment/error',
    title: 'Zentra | Payment Error',
    component: PaymentErrorComponent,
  },
];
