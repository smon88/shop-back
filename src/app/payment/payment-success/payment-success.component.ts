import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartProduct } from '../../shared/models/cart-product';
import { PurchaseService } from '../../core/services/purchase.service';

@Component({
  selector: 'app-payment-success',
  imports: [RouterLink],
  templateUrl: './payment-success.component.html',
})
export class PaymentSuccessComponent implements OnInit {
  private readonly purchaseService = inject(PurchaseService);

  ngOnInit(): void {
    const cartProducts: CartProduct[] = JSON.parse(
      localStorage.getItem('cart-products') as string
    );

    const mappedProducts = cartProducts.map(({ quantity, productId }) => {
      return {
        id: productId,
        quantity,
      };
    });

    const total = cartProducts.reduce((acc, current) => {
      return acc + current.productPrice * current.quantity;
    }, 0);

    localStorage.removeItem('cart-products');

  /*   this.purchaseService.save({ total, products: mappedProducts }).subscribe({
      next: () => {
        console.log('Purchase saved successfully');
      },
      error: () => {
        // Redirect to Cancel
      },
    }); */
    setTimeout(() => {
      location.href = "/"
    }, 8000)
  }
}
