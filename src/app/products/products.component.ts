import { Component, inject } from '@angular/core';
import { HomeProductComponent } from "../home/components/home-product/home-product.component";
import { HomeProductLoadingComponent } from "../home/components/home-product-loading/home-product-loading.component";
import { initFlowbite } from 'flowbite';
import { ProductsService } from '../core/services/product.service';
import { Product } from '../shared/models/product';
import { ProductsListComponent } from "./components/products-list/products-list.component";

@Component({
  selector: 'app-products',
  imports: [HomeProductLoadingComponent, ProductsListComponent],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent {
  productsService = inject(ProductsService);
  products?: Product[];

  ngOnInit(): void {
    this.productsService.getAll().subscribe((products) => {
      this.products = products;

      setTimeout(() => {
        initFlowbite();
      }, 200);
    });
  }
}
