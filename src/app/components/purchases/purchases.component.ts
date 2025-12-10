import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Purchase, PurchaseDetail } from '../../models/purchase.model';
import { Supplier } from '../../models/supplier.model';
import { MedicineBatch } from '../../models/product.model';

@Component({
  selector: 'app-purchases',
  imports: [CommonModule, FormsModule],
  templateUrl: './purchases.component.html',
  styleUrl: './purchases.component.css'
})
export class PurchasesComponent implements OnInit {
  purchases: Purchase[] = [];
  suppliers: Supplier[] = [];
  
  currentPurchase: {
    supplier_id: number | null;
    details: (PurchaseDetail & { productName?: string; expirationDate?: string })[];
    payment_method: string;
    total: number;
  } = {
    supplier_id: null,
    details: [],
    payment_method: 'efectivo',
    total: 0
  };

  showNewPurchaseForm = false;

  ngOnInit() {
    this.loadPurchases();
    this.loadSuppliers();
  }

  loadPurchases() {
    // Datos de ejemplo
    this.purchases = [
      {
        id: 1,
        user_id: 1,
        supplier_id: 1,
        purchase_date: '2025-01-17T08:00:00',
        payment_method: 'transferencia',
        total: 500.00,
        supplier: { id: 1, name: 'Farmacéutica ABC', phone: '', email: '', address: '', city: '', status: 1 }
      }
    ];
  }

  loadSuppliers() {
    this.suppliers = [
      { id: 1, name: 'Farmacéutica ABC', phone: '555-1000', email: 'contacto@abc.com', address: 'Av. Principal 123', city: 'Ciudad', status: 1 },
      { id: 2, name: 'Medicamentos XYZ', phone: '555-2000', email: 'ventas@xyz.com', address: 'Calle Secundaria 456', city: 'Ciudad', status: 1 }
    ];
  }

  addProductToPurchase() {
    const expirationDate = prompt('Fecha de vencimiento (YYYY-MM-DD):');
    const quantity = prompt('Cantidad:');
    const unitPrice = prompt('Precio unitario:');

    if (expirationDate && quantity && unitPrice) {
      this.currentPurchase.details.push({
        id: 0,
        purchase_id: 0,
        batch_id: 0,
        quantity: +quantity,
        unit_price: +unitPrice,
        subtotal: +quantity * +unitPrice,
        productName: 'Producto nuevo',
        expirationDate: expirationDate
      });

      this.calculateTotal();
    }
  }

  removeProductFromPurchase(index: number) {
    this.currentPurchase.details.splice(index, 1);
    this.calculateTotal();
  }

  updateQuantity(index: number, quantity: number) {
    const detail = this.currentPurchase.details[index];
    if (quantity > 0) {
      detail.quantity = quantity;
      detail.subtotal = detail.quantity * detail.unit_price;
      this.calculateTotal();
    }
  }

  calculateTotal() {
    this.currentPurchase.total = this.currentPurchase.details.reduce((sum, d) => sum + d.subtotal, 0);
  }

  registerPurchase() {
    if (!this.currentPurchase.supplier_id || this.currentPurchase.details.length === 0) {
      alert('Complete todos los campos requeridos');
      return;
    }

    // Aquí se enviaría al backend y se actualizaría el stock
    console.log('Registrar compra:', this.currentPurchase);
    
    this.currentPurchase = {
      supplier_id: null,
      details: [],
      payment_method: 'efectivo',
      total: 0
    };
    this.showNewPurchaseForm = false;
    this.loadPurchases();
  }

  newPurchase() {
    this.showNewPurchaseForm = true;
  }
}
