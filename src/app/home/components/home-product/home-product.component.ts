import { Component, input } from '@angular/core';
import { Product } from '../../../shared/models/product';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ImageUrlPipe } from '../../../shared/pipes/image-url.pipe';

@Component({
  selector: 'app-home-product',
  imports: [RouterLink, CurrencyPipe, ImageUrlPipe],
  templateUrl: './home-product.component.html',
})
export class HomeProductComponent {
  product = input.required<Product>();
}
