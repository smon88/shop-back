import { NgOptimizedImage, CurrencyPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../../shared/models/product';

@Component({
  selector: 'app-products-list',
  imports: [NgOptimizedImage, RouterLink, CurrencyPipe],
  templateUrl: './products-list.component.html',
})
export class ProductsListComponent {
  product = input.required<Product>();
}
