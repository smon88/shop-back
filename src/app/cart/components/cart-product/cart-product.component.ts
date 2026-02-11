import { Component, input, OnInit, output, signal } from '@angular/core';
import { Product } from '../../../shared/models/product';
import { CopCurrencyPipe } from '../../../shared/pipes/cop-currency.pipe';
import { CartProduct } from '../../../shared/models/cart-product';
import { ImageUrlPipe } from '../../../shared/pipes/image-url.pipe';

@Component({
  selector: 'app-cart-product',
  imports: [CopCurrencyPipe, ImageUrlPipe],
  templateUrl: './cart-product.component.html',
})
export class CartProductComponent implements OnInit {
  product = input.required<any>();
  quantity = input.required<number>();
  quantitySignal = signal<number>(0);
  quantityUpdatedEvent = output();

  ngOnInit(): void {
    this.quantitySignal.set(this.quantity());
  }

  removeProduct() {
    const storagedProducts: CartProduct[] = JSON.parse(
      localStorage.getItem('cart-products') as string
    );
    const filteredProducts = storagedProducts.filter(
      (cartProduct) => cartProduct.productId !== this.product().productId
    );

    localStorage.setItem('cart-products', JSON.stringify(filteredProducts));

    this.quantityUpdatedEvent.emit();
  }

  incrementQuantity() {
    this.quantitySignal.update((value) => value + 1);

    const storagedProducts: CartProduct[] = JSON.parse(
      localStorage.getItem('cart-products') as string
    );
    const cartProduct = storagedProducts.find(
      (cartProduct) => cartProduct.productId === this.product().productId
    ) as CartProduct;
    cartProduct.quantity++;

    localStorage.setItem('cart-products', JSON.stringify(storagedProducts));

    this.quantityUpdatedEvent.emit();
  }

  decrementQuantity() {
    if (this.quantitySignal() == 1) return;

    this.quantitySignal.update((value) => value - 1);

    const storagedProducts: CartProduct[] = JSON.parse(
      localStorage.getItem('cart-products') as string
    );
    const cartProduct = storagedProducts.find(
      (cartProduct) => cartProduct.productId === this.product().productId
    ) as CartProduct;
    cartProduct.quantity--;

    localStorage.setItem('cart-products', JSON.stringify(storagedProducts));

    this.quantityUpdatedEvent.emit();
  }
}
