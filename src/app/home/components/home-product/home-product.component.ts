import { Component, input } from '@angular/core';
import { Product } from '../../../shared/models/product';
import { CopCurrencyPipe } from '../../../shared/pipes/cop-currency.pipe';
import { RouterLink } from '@angular/router';
import { ImageUrlPipe } from '../../../shared/pipes/image-url.pipe';

@Component({
  selector: 'app-home-product',
  imports: [RouterLink, CopCurrencyPipe, ImageUrlPipe],
  templateUrl: './home-product.component.html',
})
export class HomeProductComponent {
  product = input.required<Product>();
}
