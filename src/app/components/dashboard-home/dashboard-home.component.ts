import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-home',
  imports: [CommonModule],
  templateUrl: './dashboard-home.component.html',
  styleUrl: './dashboard-home.component.css'
})
export class DashboardHomeComponent implements OnInit {
  stats = {
    weeklySales: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    totalClients: 0
  };

  recentSales: any[] = [];
  popularProducts: any[] = [];

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    // Datos de ejemplo - aquí se conectarían con el backend
    this.stats = {
      weeklySales: 15420.50,
      totalProducts: 89,
      lowStockProducts: 12,
      totalClients: 156
    };

    this.recentSales = [
      { client: 'María González', product: 'Paracetamol 500mg', amount: 15.50, time: '14:10' },
      { client: 'Juan Pérez', product: 'Ibuprofeno 400mg', amount: 12.00, time: '13:45' },
      { client: 'Ana Martínez', product: 'Amoxicilina 500mg', amount: 25.00, time: '13:20' }
    ];

    this.popularProducts = [
      { name: 'Paracetamol 500mg', stock: 45 },
      { name: 'Ibuprofeno 400mg', stock: 38 },
      { name: 'Amoxicilina 500mg', stock: 22 }
    ];
  }

  getCurrentDate() {
    return new Date().toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  }
}
