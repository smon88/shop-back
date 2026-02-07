import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeProductComponent } from "../home/components/home-product/home-product.component";
import { HomeProductLoadingComponent } from "../home/components/home-product-loading/home-product-loading.component";
import { initFlowbite } from 'flowbite';
import { ProductsService } from '../core/services/product.service';
import { Product } from '../shared/models/product';
import { ProductsListComponent } from "./components/products-list/products-list.component";

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, HomeProductLoadingComponent, ProductsListComponent],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent {
  productsService = inject(ProductsService);

  // Expose Math to template
  Math = Math;

  allProducts: Product[] = [];
  paginatedProducts = signal<Product[]>([]);

  currentPage = signal(1);
  itemsPerPage = signal(12);
  totalPages = signal(0);

  isLoading = signal(true);

  ngOnInit(): void {
    this.productsService.getAll().subscribe((products) => {
      this.allProducts = products;
      this.totalPages.set(Math.ceil(products.length / this.itemsPerPage()));
      this.updatePaginatedProducts();
      this.isLoading.set(false);

      setTimeout(() => {
        initFlowbite();
      }, 200);
    });
  }

  updatePaginatedProducts(): void {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
    const endIndex = startIndex + this.itemsPerPage();
    this.paginatedProducts.set(this.allProducts.slice(startIndex, endIndex));

    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.updatePaginatedProducts();
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
      this.updatePaginatedProducts();
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
      this.updatePaginatedProducts();
    }
  }

  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    // Show max 5 page numbers
    let startPage = Math.max(1, current - 2);
    let endPage = Math.min(total, startPage + 4);

    // Adjust if we're near the end
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }
}
