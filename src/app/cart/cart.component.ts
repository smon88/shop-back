import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartProductComponent } from './components/cart-product/cart-product.component';
import { CartProduct } from '../shared/models/cart-product';
import { CartProductLoadingComponent } from './components/cart-product-loading/cart-product-loading.component';
import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { PaymentService } from '../core/services/payment.service';

@Component({
  selector: 'app-cart',
  imports: [
    RouterLink,
    CartProductComponent,
    CartProductLoadingComponent,
    CurrencyPipe,
    NgOptimizedImage,
  ],
  templateUrl: './cart.component.html',
})
export class CartComponent implements OnInit {
  cartProducts?: CartProduct[];
  total: number = 0;

  paymentService = inject(PaymentService);
  router = inject(Router);
  showErrorToast = false;

  ngOnInit(): void {
    this.updateTotal();
  }

  updateTotal() {
    const storagedProducts: CartProduct[] =
      JSON.parse(localStorage.getItem('cart-products') as string) || [];

    this.cartProducts = storagedProducts;


    let total = 0;

    this.cartProducts.forEach((cartProduct) => {
      total +=
        Math.round(cartProduct.productPrice * cartProduct.quantity * 100) / 100;
    });

    this.total = total;
  }

  proceedToCheckout(): void {
    // Check if cart has products
    if (!this.cartProducts || this.cartProducts.length === 0) {
      this.showErrorToast = true;
      setTimeout(() => {
        this.showErrorToast = false;
      }, 3000);
      return;
    }

    // Save cart to localStorage with 'cart' key (used by checkout)
    localStorage.setItem('cart', JSON.stringify(this.cartProducts));

    // Navigate to checkout
    this.router.navigate(['/checkout']);
  }

}
