import { Component, input } from '@angular/core';
import { CopCurrencyPipe } from '../../../shared/pipes/cop-currency.pipe';
import { RouterLink } from '@angular/router';
import { Product } from '../../../shared/models/product';
import { ImageUrlPipe } from '../../../shared/pipes/image-url.pipe';

@Component({
  selector: 'app-products-list',
  imports: [RouterLink, CopCurrencyPipe, ImageUrlPipe],
  templateUrl: './products-list.component.html',
})
export class ProductsListComponent {
  product = input.required<Product>();
}
