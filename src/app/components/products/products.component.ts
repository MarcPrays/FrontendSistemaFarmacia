import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product, MedicineBatch, Category } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { BatchService } from '../../services/batch.service';
import { ProductFormModalComponent } from '../product-form-modal/product-form-modal.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-products',
  imports: [CommonModule, FormsModule, ProductFormModalComponent],
  providers: [ProductService, CategoryService, BatchService],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  batches: MedicineBatch[] = [];
  categories: Category[] = [];
  searchTerm: string = '';
  selectedFilter: string = 'todos';

  // Modal
  showModal = false;
  modalMode: 'create' | 'edit' = 'create';
  selectedProductForEdit: Product | null = null;

  stats = {
    total: 0,
    lowStock: 0,
    outOfStock: 0
  };

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private batchService: BatchService
  ) { }

  ngOnInit() {
    this.loadAllData();
  }

  loadAllData() {
    // Cargar categorías primero (se usan en el modal)
    this.categoryService.getAll().subscribe(categories => {
      this.categories = categories;
      // Luego cargar productos y batches
      this.loadProductsAndBatches();
    });
  }

  loadProductsAndBatches() {
    // Cargar productos y batches en paralelo
    this.productService.getAll().subscribe(products => {
      this.batchService.getAll().subscribe(batches => {
        this.batches = batches;

        // Asignar categoría y lotes a cada producto
        this.products = products.map(p => {
          const productCategory = this.categories.find(c => c.id === p.category_id);
          const productBatches = this.batches.filter(b => b.product_id === p.id && b.status === 1);
          return {
            ...p,
            category: productCategory,
            batches: productBatches
          };
        });

        this.filteredProducts = [...this.products];
        this.updateStats();
      });
    });
  }

  getProductStock(productId: number): number {
    return this.batches
      .filter(b => b.product_id === productId && b.status === 1)
      .reduce((sum, b) => sum + (b.stock || 0), 0);
  }

  getProductPrice(productId: number): number {
    const activeBatch = this.batches
      .filter(b => b.product_id === productId && b.status === 1)
      .sort((a, b) => new Date(b.expiration_date || '').getTime() - new Date(a.expiration_date || '').getTime())
      .find(b => (b.stock || 0) > 0);

    return activeBatch?.sale_price || 0;
  }

  getStockStatus(productId: number): { status: string; class: string } {
    const stock = this.getProductStock(productId);
    if (stock === 0) {
      return { status: 'Sin Stock', class: 'out-of-stock' };
    } else if (stock < 10) {
      return { status: 'Stock Bajo', class: 'low-stock' };
    }
    return { status: 'Normal', class: 'normal' };
  }

  filterProducts(filter: string) {
    this.selectedFilter = filter;
    this.applyFilters();
  }

  searchProducts() {
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.products];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.category?.name.toLowerCase().includes(term) ||
        p.presentation?.toLowerCase().includes(term)
      );
    }

    switch (this.selectedFilter) {
      case 'stock-bajo':
        filtered = filtered.filter(p => {
          const stock = this.getProductStock(p.id);
          return stock > 0 && stock < 10;
        });
        break;
      case 'sin-stock':
        filtered = filtered.filter(p => this.getProductStock(p.id) === 0);
        break;
      case 'activos':
        filtered = filtered.filter(p => p.status === 1);
        break;
    }

    this.filteredProducts = filtered;
    this.updateStats();
  }

  updateStats() {
    this.stats.total = this.products.length;
    this.stats.lowStock = this.products.filter(p => {
      const stock = this.getProductStock(p.id);
      return stock > 0 && stock < 10;
    }).length;
    this.stats.outOfStock = this.products.filter(p => this.getProductStock(p.id) === 0).length;
  }

  deleteProduct(product: Product) {
    if (confirm(`¿Está seguro de eliminar ${product.name}?`)) {
      this.productService.delete(product.id).subscribe({
        next: () => {
          // Actualizar localmente (eliminación lógica)
          const index = this.products.findIndex(p => p.id === product.id);
          if (index !== -1) {
            this.products[index] = { ...this.products[index], status: 0 };
          }
          this.applyFilters();
        },
        error: (err) => {
          console.error('Error al eliminar el producto:', err);
          alert('No se pudo eliminar el producto. Intente nuevamente.');
        }
      });
    }
  }

  editProduct(product: Product) {
    this.modalMode = 'edit';
    this.selectedProductForEdit = product; //  Debe ser el objeto completo
    this.showModal = true;
  }

  addProduct() {
    this.modalMode = 'create';
    this.selectedProductForEdit = null;
    this.showModal = true;
  }

  onSaveProduct(event: { product: any; batches: any[]; imageFile: File | null }) {
    const p = event.product;

    if (!p.name?.trim() || !p.category_id) {
      alert('El nombre y la categoría son obligatorios.');
      return;
    }

    if (this.modalMode === 'create') {
      this.productService.createProductWithImage(
        p.name,
        p.description,
        p.category_id,
        p.presentation,
        p.concentration,
        event.imageFile
      ).subscribe({
        next: (newProduct) => {
          // Crear lotes
          const batchRequests = event.batches.map(batch =>
            this.batchService.create({
              product_id: newProduct.id,
              expiration_date: batch.expiration_date || undefined,
              stock: batch.stock ?? undefined,
              purchase_price: batch.purchase_price ?? undefined,
              sale_price: batch.sale_price ?? undefined
            }).toPromise()
          );

          Promise.all(batchRequests).then(() => {
            this.loadProductsAndBatches();
            this.showModal = false;
          });
        },
        error: (err) => {
          console.error('Error detallado:', err);
          const detail = err.error?.detail || 'Error desconocido';
          alert(` Error al crear el producto:\n${detail}`);
        }
      });
    }
    else if (this.modalMode === 'edit' && this.selectedProductForEdit) {
      // ✅ EDITAR PRODUCTO
      this.productService.updateProductWithImage(
        this.selectedProductForEdit.id,
        p.name,
        p.description,
        p.category_id,
        p.presentation,
        p.concentration,
        event.imageFile
      ).subscribe({
        next: (updatedProduct) => {
          // Opcional: también podrías actualizar lotes aquí
          this.loadProductsAndBatches(); // Recargar todo
          this.showModal = false;
        },
        error: (err) => {
          console.error('Error al editar producto:', err);
          const detail = err.error?.detail || 'Error desconocido';
          alert(`❌ Error al guardar cambios:\n${detail}`);
        }
      });
    }
  }

  // Dentro de ProductsComponent
  getImageUrl(imagePath: string | null | undefined): string | null {
    if (!imagePath) return null;
    // Asegúrate de que no empiece con '/'
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    return `${environment.apiUrl}/${cleanPath}`;
  }




}