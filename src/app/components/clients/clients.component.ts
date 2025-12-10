import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Client } from '../../models/client.model';

@Component({
  selector: 'app-clients',
  imports: [CommonModule, FormsModule],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.css'
})
export class ClientsComponent implements OnInit {
  clients: Client[] = [];
  filteredClients: Client[] = [];
  searchTerm: string = '';

  stats = {
    total: 0,
    active: 0,
    inactive: 0
  };

  ngOnInit() {
    this.loadClients();
  }

  loadClients() {
    // Datos de ejemplo
    this.clients = [
      {
        id: 1,
        first_name: 'María',
        last_name: 'González',
        phone: '555-1234',
        email: 'maria.gonzalez@email.com',
        status: 1,
        fullName: 'María González'
      },
      {
        id: 2,
        first_name: 'Juan',
        last_name: 'Pérez',
        phone: '555-5678',
        email: 'juan.perez@email.com',
        status: 1,
        fullName: 'Juan Pérez'
      },
      {
        id: 3,
        first_name: 'Ana',
        last_name: 'Martínez',
        phone: '555-9012',
        email: 'ana.martinez@email.com',
        status: 1,
        fullName: 'Ana Martínez'
      }
    ];

    this.filteredClients = [...this.clients];
    this.updateStats();
  }

  updateStats() {
    this.stats.total = this.clients.length;
    this.stats.active = this.clients.filter(c => c.status === 1).length;
    this.stats.inactive = this.clients.filter(c => c.status === 0).length;
  }

  searchClients() {
    if (!this.searchTerm.trim()) {
      this.filteredClients = [...this.clients];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredClients = this.clients.filter(c =>
      c.first_name.toLowerCase().includes(term) ||
      c.last_name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.phone.includes(term)
    );
  }

  deleteClient(client: Client) {
    if (confirm(`¿Está seguro de eliminar a ${client.fullName}?`)) {
      client.status = 0;
      this.updateStats();
      this.searchClients();
    }
  }

  editClient(client: Client) {
    console.log('Editar cliente:', client);
  }

  addClient() {
    console.log('Agregar nuevo cliente');
  }
}
