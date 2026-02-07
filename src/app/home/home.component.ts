import { Component, inject, OnInit, signal } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { ProductOfferComponent } from '../shared/components/product-offer/product-offer.component';
import { Product } from '../shared/models/product';
import { ProductsService } from '../core/services/product.service';
import { HomeProductComponent } from './components/home-product/home-product.component';
import { RouterLink } from '@angular/router';
import { HomeProductLoadingComponent } from "./components/home-product-loading/home-product-loading.component";
import { LoadingComponent } from '../shared/components/loading/loading.component';

@Component({
  selector: 'app-home',
  imports: [ProductOfferComponent, HomeProductComponent, RouterLink, HomeProductLoadingComponent, LoadingComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  productsService = inject(ProductsService);
  products?: Product[];
  productsOffers?: Product[];
  productSlides: Product[][] = [];
  isLoading = signal(true);

  // Productos por slide: 1 fila x 2 columnas en móvil, 1 fila x 4 columnas en desktop
  private productsPerSlide = 4;

  ngOnInit(): void {
    this.productsService.getAll().subscribe((products) => {
      this.products = products;
      this.productsOffers = this.products.filter(
        (product) => product.previousPrice
      );
      this.productSlides = this.chunkProducts(this.products, this.productsPerSlide);
      this.isLoading.set(false);

      // Wait for DOM to update before initializing Flowbite
      setTimeout(() => {
        initFlowbite();
      }, 500);
    });
  }

  private chunkProducts(products: Product[], size: number): Product[][] {
    const chunks: Product[][] = [];
    for (let i = 0; i < products.length; i += size) {
      chunks.push(products.slice(i, i + size));
    }
    return chunks;
  }
}
