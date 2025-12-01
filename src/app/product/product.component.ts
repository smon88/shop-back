import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '../core/services/product.service';
import { Product } from '../shared/models/product';
import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { CartProduct } from '../shared/models/cart-product';

@Component({
  selector: 'app-product',
  imports: [NgOptimizedImage, CurrencyPipe],
  templateUrl: './product.component.html',
})
export class ProductComponent implements OnInit {
  showSuccessToast = false;
  route = inject(ActivatedRoute);
  productsService = inject(ProductsService);
  product?: Product;

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.productsService.getById(params['id']).subscribe((product) => {
        this.product = product;
      });
    });
  }

  addToCart() {
    const storagedProducts: CartProduct[] =
      JSON.parse(localStorage.getItem('cart-products') as string) || [];

    const matched = storagedProducts.find(
      (cartProduct) => cartProduct.productId == this.product?.productId
    );
    if (matched) {
      matched.quantity++;
      localStorage.setItem('cart-products', JSON.stringify(storagedProducts));
    } else {
      storagedProducts.push({
        productId: this.product?.productId || 1, quantity: 1,
        productName: this.product?.name || '',
        productImg: this.product?.urlImg || '',
        productPrice: this.product?.price || 0
      });
      localStorage.setItem('cart-products', JSON.stringify(storagedProducts));
    }
    this.showSuccessToast = true;
    setTimeout(()=> {
      this.showSuccessToast = false;
    },3000)
  }
}
