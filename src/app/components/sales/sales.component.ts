import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sale, SalesDetail } from '../../models/sale.model';
import { Client } from '../../models/client.model';
import { MedicineBatch } from '../../models/product.model';

@Component({
  selector: 'app-sales',
  imports: [CommonModule, FormsModule],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.css'
})
export class SalesComponent implements OnInit {
  sales: Sale[] = [];
  clients: Client[] = [];
  batches: MedicineBatch[] = [];
  
  currentSale: {
    client_id: number | null;
    details: (SalesDetail & { productName?: string })[];
    payment_method: string;
    total: number;
  } = {
    client_id: null,
    details: [],
    payment_method: 'efectivo',
    total: 0
  };

  showNewSaleForm = false;

  ngOnInit() {
    this.loadSales();
    this.loadClients();
    this.loadBatches();
  }

  loadSales() {
    // Datos de ejemplo
    this.sales = [
      {
        id: 1,
        client_id: 1,
        user_id: 1,
        sale_date: '2025-01-17T10:00:00',
        total: 23.50,
        payment_method: 'efectivo',
        client: { id: 1, first_name: 'María', last_name: 'González', phone: '', email: '', status: 1 }
      }
    ];
  }

  loadClients() {
    this.clients = [
      { id: 1, first_name: 'María', last_name: 'González', phone: '555-1234', email: 'maria@email.com', status: 1 },
      { id: 2, first_name: 'Juan', last_name: 'Pérez', phone: '555-5678', email: 'juan@email.com', status: 1 }
    ];
  }

  loadBatches() {
    // Simulación de lotes disponibles
    this.batches = [
      { id: 1, product_id: 1, expiration_date: '2025-12-31', stock: 15, purchase_price: 5.00, sale_price: 8.50, status: 1 },
      { id: 2, product_id: 2, expiration_date: '2025-11-20', stock: 8, purchase_price: 6.00, sale_price: 10.00, status: 1 }
    ];
  }

  addProductToSale(batchId: number) {
    const batch = this.batches.find(b => b.id === batchId);
    if (!batch || !batch.stock || batch.stock <= 0) return;

    const existing = this.currentSale.details.find(d => d.batch_id === batchId);
    if (existing) {
      if (existing.quantity < batch.stock) {
        existing.quantity++;
        existing.subtotal = existing.quantity * existing.unit_price;
      }
    } else {
      this.currentSale.details.push({
        id: 0,
        sale_id: 0,
        batch_id: batchId,
        quantity: 1,
        unit_price: batch.sale_price ?? 0,
        subtotal: (batch.sale_price ?? 0),
        productName: `Producto ${batchId}` // En producción, obtener del producto
      });
    }

    this.calculateTotal();
  }

  removeProductFromSale(index: number) {
    this.currentSale.details.splice(index, 1);
    this.calculateTotal();
  }

  updateQuantity(index: number, quantity: number) {
    const detail = this.currentSale.details[index];
    const batch = this.batches.find(b => b.id === detail.batch_id);
    
    if (batch && batch.stock && quantity > 0 && quantity <= batch.stock) {
      detail.quantity = quantity;
      detail.subtotal = detail.quantity * detail.unit_price;
      this.calculateTotal();
    }
  }

  calculateTotal() {
    this.currentSale.total = this.currentSale.details.reduce((sum, d) => sum + d.subtotal, 0);
  }

  registerSale() {
    if (!this.currentSale.client_id || this.currentSale.details.length === 0) {
      alert('Complete todos los campos requeridos');
      return;
    }

    // Aquí se enviaría al backend
    console.log('Registrar venta:', this.currentSale);
    
    // Resetear formulario
    this.currentSale = {
      client_id: null,
      details: [],
      payment_method: 'efectivo',
      total: 0
    };
    this.showNewSaleForm = false;
    this.loadSales();
  }

  newSale() {
    this.showNewSaleForm = true;
  }
}
