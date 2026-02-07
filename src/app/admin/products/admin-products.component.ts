import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductsService } from '../../core/services/product.service';
import { UploadService } from '../../core/services/upload.service';
import { Product, CreateProductDto } from '../../shared/models/product';
import { environment } from '../../../environments/environment';
import { forkJoin } from 'rxjs';

interface ImageSlot {
  file: File | null;
  preview: string | null;
  url: string;
}

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.css',
})
export class AdminProductsComponent implements OnInit {
  private productsService = inject(ProductsService);
  private uploadService = inject(UploadService);

  products: Product[] = [];
  isLoading = true;
  showModal = false;
  isEditing = false;
  editingProductId: number | null = null;

  // Toast notifications
  showSuccessToast = false;
  showErrorToast = false;
  toastMessage = '';

  // Image upload - hasta 4 imágenes
  imageSlots: ImageSlot[] = [
    { file: null, preview: null, url: '' },
    { file: null, preview: null, url: '' },
    { file: null, preview: null, url: '' },
    { file: null, preview: null, url: '' },
  ];
  isUploading = false;

  // Formulario
  productForm: CreateProductDto = {
    name: '',
    price: 0,
    description: '',
    reviews: 0,
    previousPrice: null,
    urlImg: '',
    images: [],
    stock: 0,
    category: '',
  };

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productsService.getAll().subscribe({
      next: (products) => {
        this.products = products;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.isLoading = false;
        this.showError('Error al cargar los productos');
      },
    });
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.editingProductId = null;
    this.resetForm();
    this.showModal = true;
  }

  openEditModal(product: Product): void {
    this.isEditing = true;
    this.editingProductId = product.productId;
    this.productForm = {
      name: product.name,
      price: product.price,
      description: product.description || '',
      reviews: product.reviews || 0,
      previousPrice: product.previousPrice,
      urlImg: product.urlImg,
      images: product.images || [],
      stock: product.stock || 0,
      category: product.category || '',
    };

    // Cargar las imágenes existentes en los slots
    this.resetImageSlots();
    if (product.urlImg) {
      this.imageSlots[0].url = product.urlImg;
      this.imageSlots[0].preview = this.getFullImageUrl(product.urlImg);
    }
    if (product.images) {
      product.images.forEach((img, index) => {
        if (index < 3) {
          this.imageSlots[index + 1].url = img;
          this.imageSlots[index + 1].preview = this.getFullImageUrl(img);
        }
      });
    }

    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  resetForm(): void {
    this.productForm = {
      name: '',
      price: 0,
      description: '',
      reviews: 0,
      previousPrice: null,
      urlImg: '',
      images: [],
      stock: 0,
      category: '',
    };
    this.resetImageSlots();
  }

  resetImageSlots(): void {
    this.imageSlots = [
      { file: null, preview: null, url: '' },
      { file: null, preview: null, url: '' },
      { file: null, preview: null, url: '' },
      { file: null, preview: null, url: '' },
    ];
  }

  onFileSelected(event: Event, slotIndex: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validar tipo de archivo
      if (!file.type.match(/image\/(jpeg|jpg|png|gif|webp)/)) {
        this.showError('Solo se permiten imágenes (JPG, PNG, GIF, WEBP)');
        return;
      }

      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.showError('La imagen no puede superar los 5MB');
        return;
      }

      this.imageSlots[slotIndex].file = file;
      this.imageSlots[slotIndex].url = ''; // Limpiar URL anterior si había

      // Crear preview local
      const reader = new FileReader();
      reader.onload = () => {
        this.imageSlots[slotIndex].preview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(slotIndex: number): void {
    this.imageSlots[slotIndex] = { file: null, preview: null, url: '' };
  }

  getFullImageUrl(url: string): string {
    if (!url) return '';
    // Si ya es una URL completa, devolverla tal cual
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Si es una ruta relativa de la API, construir la URL completa
    if (url.startsWith('/api/')) {
      return `${environment.apiUrl.replace('/api', '')}${url}`;
    }
    return url;
  }

  saveProduct(): void {
    if (!this.validateForm()) {
      this.showError('Por favor completa todos los campos requeridos');
      return;
    }

    // Recopilar archivos a subir
    const filesToUpload: { index: number; file: File }[] = [];
    this.imageSlots.forEach((slot, index) => {
      if (slot.file) {
        filesToUpload.push({ index, file: slot.file });
      }
    });

    if (filesToUpload.length > 0) {
      this.isUploading = true;

      // Subir todas las imágenes en paralelo
      const uploads = filesToUpload.map((item) =>
        this.uploadService.uploadImage(item.file)
      );

      forkJoin(uploads).subscribe({
        next: (responses) => {
          // Asignar las URLs a los slots correspondientes
          responses.forEach((response, i) => {
            this.imageSlots[filesToUpload[i].index].url = response.url;
          });
          this.isUploading = false;
          this.prepareAndSaveProduct();
        },
        error: (error) => {
          console.error('Error uploading images:', error);
          this.isUploading = false;
          this.showError('Error al subir las imágenes');
        },
      });
    } else {
      this.prepareAndSaveProduct();
    }
  }

  private prepareAndSaveProduct(): void {
    // La primera imagen va en urlImg, las demás en images
    const urls = this.imageSlots
      .filter((slot) => slot.url || slot.preview)
      .map((slot) => slot.url);

    if (urls.length > 0) {
      this.productForm.urlImg = urls[0];
      this.productForm.images = urls.slice(1);
    }

    this.saveProductToServer();
  }

  private saveProductToServer(): void {
    if (this.isEditing && this.editingProductId) {
      this.productsService.update(this.editingProductId, this.productForm).subscribe({
        next: () => {
          this.showSuccess('Producto actualizado correctamente');
          this.closeModal();
          this.loadProducts();
        },
        error: (error) => {
          console.error('Error updating product:', error);
          this.showError('Error al actualizar el producto');
        },
      });
    } else {
      this.productsService.create(this.productForm).subscribe({
        next: () => {
          this.showSuccess('Producto creado correctamente');
          this.closeModal();
          this.loadProducts();
        },
        error: (error) => {
          console.error('Error creating product:', error);
          this.showError('Error al crear el producto');
        },
      });
    }
  }

  deleteProduct(product: Product): void {
    if (confirm(`¿Estás seguro de eliminar "${product.name}"?`)) {
      this.productsService.delete(product.productId).subscribe({
        next: () => {
          this.showSuccess('Producto eliminado correctamente');
          this.loadProducts();
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          this.showError('Error al eliminar el producto');
        },
      });
    }
  }

  validateForm(): boolean {
    const hasAtLeastOneImage = this.imageSlots.some(
      (slot) => slot.file !== null || slot.url.trim().length > 0
    );
    return (
      this.productForm.name.trim().length > 0 &&
      this.productForm.price > 0 &&
      hasAtLeastOneImage
    );
  }

  showSuccess(message: string): void {
    this.toastMessage = message;
    this.showSuccessToast = true;
    setTimeout(() => {
      this.showSuccessToast = false;
    }, 3000);
  }

  showError(message: string): void {
    this.toastMessage = message;
    this.showErrorToast = true;
    setTimeout(() => {
      this.showErrorToast = false;
    }, 3000);
  }
}
