import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'Sistema Farmacia';
  isSidebarOpen = true;
  showSidebar = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Verificar estado inicial
    this.updateSidebarVisibility();

    // Ocultar sidebar cuando cambia la ruta o el estado de autenticación
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateSidebarVisibility();
      });
  }

  /**
   * Actualiza la visibilidad del sidebar basándose en la ruta y autenticación
   */
  private updateSidebarVisibility(): void {
    const currentUrl = this.router.url;
    const isLoginPage = currentUrl === '/login' || currentUrl.startsWith('/login');
    const isAuthenticated = this.authService.isAuthenticated();
    
    // Mostrar sidebar solo si está autenticado y NO está en login
    this.showSidebar = isAuthenticated && !isLoginPage;
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}