import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product, MedicineBatch, Category } from '../../models/product.model';

@Component({
  selector: 'app-products',
  imports: [CommonModule, FormsModule],
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
  
  stats = {
    total: 0,
    lowStock: 0,
    outOfStock: 0
  };

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
    this.loadBatches();
  }

  loadCategories() {
    this.categories = [
      { id: 1, name: 'Analgésicos', description: 'Medicamentos para el dolor' },
      { id: 2, name: 'Antibióticos', description: 'Medicamentos antibacterianos' },
      { id: 3, name: 'Antivirales', description: 'Medicamentos antivirales' },
      { id: 4, name: 'Vitaminas', description: 'Suplementos vitamínicos' }
    ];
  }

  loadProducts() {
    // Datos de ejemplo
    this.products = [
      {
        id: 1,
        name: 'Paracetamol 500mg',
        description: 'Analgésico y antipirético',
        category_id: 1,
        presentation: 'Tabletas',
        concentration: '500mg',
        status: 1,
        category: this.categories[0]
      },
      {
        id: 2,
        name: 'Ibuprofeno 400mg',
        description: 'Antiinflamatorio no esteroideo',
        category_id: 1,
        presentation: 'Tabletas',
        concentration: '400mg',
        status: 1,
        category: this.categories[0]
      },
      {
        id: 3,
        name: 'Amoxicilina 500mg',
        description: 'Antibiótico de amplio espectro',
        category_id: 2,
        presentation: 'Cápsulas',
        concentration: '500mg',
        status: 1,
        category: this.categories[1]
      }
    ];
    
    this.filteredProducts = [...this.products];
    this.updateStats();
  }

  loadBatches() {
    // Datos de ejemplo de lotes
    this.batches = [
      {
        id: 1,
        product_id: 1,
        expiration_date: '2025-12-31',
        stock: 15,
        purchase_price: 5.00,
        sale_price: 8.50,
        status: 1
      },
      {
        id: 2,
        product_id: 1,
        expiration_date: '2026-03-15',
        stock: 30,
        purchase_price: 5.00,
        sale_price: 8.50,
        status: 1
      },
      {
        id: 3,
        product_id: 2,
        expiration_date: '2025-11-20',
        stock: 8,
        purchase_price: 6.00,
        sale_price: 10.00,
        status: 1
      },
      {
        id: 4,
        product_id: 3,
        expiration_date: '2026-01-10',
        stock: 25,
        purchase_price: 12.00,
        sale_price: 18.00,
        status: 1
      }
    ];
    
    // Asignar lotes a productos
    this.products.forEach(product => {
      product.batches = this.batches.filter(b => b.product_id === product.id);
    });
  }

  getProductStock(productId: number): number {
    return this.batches
      .filter(b => b.product_id === productId && b.status === 1)
      .reduce((sum, b) => sum + b.stock, 0);
  }

  getProductPrice(productId: number): number {
    const batch = this.batches.find(b => b.product_id === productId && b.status === 1);
    return batch?.sale_price || 0;
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

    // Filtro por búsqueda
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(term) ||
        p.category?.name.toLowerCase().includes(term)
      );
    }

    // Filtro por estado
    switch (this.selectedFilter) {
      case 'stock-bajo':
        filtered = filtered.filter(p => this.getProductStock(p.id) < 10 && this.getProductStock(p.id) > 0);
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
      return stock < 10 && stock > 0;
    }).length;
    this.stats.outOfStock = this.products.filter(p => this.getProductStock(p.id) === 0).length;
  }

  deleteProduct(product: Product) {
    if (confirm(`¿Está seguro de eliminar ${product.name}?`)) {
      product.status = 0;
      this.applyFilters();
    }
  }

  editProduct(product: Product) {
    console.log('Editar producto:', product);
    // Implementar modal de edición
  }

  addProduct() {
    console.log('Agregar nuevo producto');
    // Implementar modal para nuevo producto
  }
}
