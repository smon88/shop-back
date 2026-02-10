import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '../core/services/product.service';
import { Product } from '../shared/models/product';
import { CurrencyPipe, NgOptimizedImage, CommonModule } from '@angular/common';
import { CartProduct } from '../shared/models/cart-product';
import { environment } from '../../environments/environment';
import { LoadingComponent } from '../shared/components/loading/loading.component';

@Component({
  selector: 'app-product',
  imports: [NgOptimizedImage, CurrencyPipe, CommonModule, LoadingComponent],
  templateUrl: './product.component.html',
})
export class ProductComponent implements OnInit {
  showSuccessToast = false;
  route = inject(ActivatedRoute);
  productsService = inject(ProductsService);
  product?: Product;
  isLoading = signal(true);

  // Galería de imágenes
  allImages: string[] = [];
  selectedImageIndex = 0;

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.productsService.getById(params['id']).subscribe((product) => {
        this.product = product;
        this.initializeGallery();
        this.isLoading.set(false);
        window.fbq?.('track', 'ViewContent', {
          content_ids: [product.productId],
          content_type: 'product',
          value: product.price,
          currency: 'COP',
        });
      });
    });
  }

  initializeGallery(): void {
    if (!this.product) return;

    this.allImages = [];

    // Agregar imagen principal
    if (this.product.urlImg) {
      this.allImages.push(this.product.urlImg);
    }

    // Agregar imágenes adicionales
    if (this.product.images && this.product.images.length > 0) {
      this.allImages.push(...this.product.images);
    }

    this.selectedImageIndex = 0;
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  get currentImage(): string {
    return this.allImages[this.selectedImageIndex] || '';
  }

  getFullImageUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    if (url.startsWith('/api/')) {
      return `${environment.apiUrl.replace('/api', '')}${url}`;
    }
    return url;
  }

  addToCart() {
    window.fbq?.('track', 'AddToCart', {
      content_ids: [this.product?.productId],
      content_type: 'product',
      value: this.product?.price,
      currency: 'COP',
    });
    const storagedProducts: CartProduct[] =
      JSON.parse(localStorage.getItem('cart-products') as string) || [];

    const matched = storagedProducts.find(
      (cartProduct) => cartProduct.productId == this.product?.productId,
    );
    if (matched) {
      matched.quantity++;
      localStorage.setItem('cart-products', JSON.stringify(storagedProducts));
    } else {
      storagedProducts.push({
        productId: this.product?.productId || 1,
        quantity: 1,
        productName: this.product?.name || '',
        productImg: this.product?.urlImg || '',
        productPrice: this.product?.price || 0,
      });
      localStorage.setItem('cart-products', JSON.stringify(storagedProducts));
    }
    this.showSuccessToast = true;
    setTimeout(() => {
      this.showSuccessToast = false;
    }, 3000);
  }
}
