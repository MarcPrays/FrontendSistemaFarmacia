import { Component, Input, Output, EventEmitter } from '@angular/core';

interface MenuItem {
  name: string;
  icon: string;
  children?: MenuItem[];
  expanded?: boolean;
}

@Component({
  selector: 'app-sidebar',
  imports: [],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
@Input() isOpen = true;
@Output() toggleSidebar = new EventEmitter<void>();

  menuItems: MenuItem[] = [
    { name: 'Armaturenbrett', icon: '📊' },
    { name: 'Users', icon: '👥' },
    { name: 'Sales', icon: '💰' },
    { 
      name: 'Products', 
      icon: '📦',
      expanded: false,
      children: [
        { name: 'Product Categories', icon: '📋' },
        { name: 'Product Types', icon: '🏷️' },
        { name: 'Product Attributes', icon: '⚙️' }
      ]
    }
  ];

  toggleMenu(item: MenuItem) {
    if (item.children) {
      item.expanded = !item.expanded;
    }
  }

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }
}
