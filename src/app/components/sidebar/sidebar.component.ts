import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

interface MenuItem {
  name: string;
  icon: string;
  route?: string;
  children?: MenuItem[];
  expanded?: boolean;
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Input() isOpen = true;
  @Output() toggleSidebar = new EventEmitter<void>();

  menuItems: MenuItem[] = [
    { name: 'Inicio', icon: '🏠', route: '/dashboard' },
    { name: 'Usuarios', icon: '👥', route: '/usuarios' },
    { name: 'Productos', icon: '💊', route: '/productos' },
    { name: 'Proveedores', icon: '🚚', route: '/proveedores' },
    { name: 'Clientes', icon: '👤', route: '/clientes' },
    { name: 'Ventas', icon: '💰', route: '/ventas' },
    { name: 'Compras', icon: '🛒', route: '/compras' },
    { name: 'Reportes', icon: '📊', route: '/reportes' }
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  toggleMenu(item: MenuItem) {
    if (item.children) {
      item.expanded = !item.expanded;
    }
  }

  navigate(item: MenuItem) {
    if (item.route) {
      this.router.navigate([item.route]);
    }
  }

  isActiveRoute(route?: string): boolean {
    if (!route) return false;
    return this.router.url === route;
  }

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  logout() {
    this.authService.logout();
  }
}
