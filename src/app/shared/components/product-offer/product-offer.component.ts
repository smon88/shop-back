import { Component, input, OnInit } from '@angular/core';
import { Product } from '../../models/product';
import { RouterLink } from '@angular/router';
import { CopCurrencyPipe } from '../../pipes/cop-currency.pipe';
import { ImageUrlPipe } from '../../pipes/image-url.pipe';

@Component({
  selector: 'app-product-offer',
  imports: [RouterLink, CopCurrencyPipe, ImageUrlPipe],
  templateUrl: './product-offer.component.html',
})
export class ProductOfferComponent implements OnInit {
  product = input.required<Product>();
  discount!: number;

  ngOnInit(): void {
    const previousPrice = this.product().previousPrice;
    const currentPrice = this.product().price;

    if (previousPrice) {
      this.discount = Math.round(
        ((previousPrice - currentPrice) / previousPrice) * 100
      );
    }
  }
}
