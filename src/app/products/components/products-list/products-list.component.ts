import { CurrencyPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../../shared/models/product';
import { ImageUrlPipe } from '../../../shared/pipes/image-url.pipe';

@Component({
  selector: 'app-products-list',
  imports: [RouterLink, CurrencyPipe, ImageUrlPipe],
  templateUrl: './products-list.component.html',
})
export class ProductsListComponent {
  product = input.required<Product>();
}
