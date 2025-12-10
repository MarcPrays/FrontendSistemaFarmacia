import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Supplier } from '../../models/supplier.model';

@Component({
  selector: 'app-suppliers',
  imports: [CommonModule, FormsModule],
  templateUrl: './suppliers.component.html',
  styleUrl: './suppliers.component.css'
})
export class SuppliersComponent implements OnInit {
  suppliers: Supplier[] = [];
  filteredSuppliers: Supplier[] = [];
  searchTerm: string = '';

  ngOnInit() {
    this.loadSuppliers();
  }

  loadSuppliers() {
    // Datos de ejemplo
    this.suppliers = [
      {
        id: 1,
        name: 'Farmacéutica ABC',
        phone: '555-1000',
        email: 'contacto@abc.com',
        address: 'Av. Principal 123',
        city: 'Ciudad',
        status: 1
      },
      {
        id: 2,
        name: 'Medicamentos XYZ',
        phone: '555-2000',
        email: 'ventas@xyz.com',
        address: 'Calle Secundaria 456',
        city: 'Ciudad',
        status: 1
      }
    ];

    this.filteredSuppliers = [...this.suppliers];
  }

  searchSuppliers() {
    if (!this.searchTerm.trim()) {
      this.filteredSuppliers = [...this.suppliers];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredSuppliers = this.suppliers.filter(s =>
      s.name.toLowerCase().includes(term) ||
      s.email.toLowerCase().includes(term) ||
      s.phone.includes(term)
    );
  }

  deleteSupplier(supplier: Supplier) {
    if (confirm(`¿Está seguro de eliminar a ${supplier.name}?`)) {
      supplier.status = 0;
      this.searchSuppliers();
    }
  }

  editSupplier(supplier: Supplier) {
    console.log('Editar proveedor:', supplier);
  }

  addSupplier() {
    console.log('Agregar nuevo proveedor');
  }
}
