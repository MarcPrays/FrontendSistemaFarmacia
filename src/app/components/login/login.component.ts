import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';
  returnUrl: string = '/dashboard';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Si ya está autenticado, redirigir al dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
      return;
    }

    // Obtener la URL de retorno de los query params
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const credentials = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.loading = false;
        // Redirigir a la URL de retorno o al dashboard
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        this.loading = false;
        if (error.status === 401) {
          this.errorMessage = 'Email o contraseña incorrectos';
        } else if (error.status === 0) {
          this.errorMessage = 'Error de conexión. Verifica que el backend esté ejecutándose';
        } else {
          this.errorMessage = error.error?.detail || 'Error al iniciar sesión. Intenta nuevamente';
        }
      }
    });
  }

  /**
   * Marca todos los campos del formulario como touched para mostrar errores
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Verifica si un campo tiene errores y ha sido tocado
   */
  hasError(controlName: string, errorType: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!(control?.hasError(errorType) && control?.touched);
  }

  /**
   * Obtiene el mensaje de error para un campo
   */
  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);
    
    if (control?.hasError('required')) {
      return `${controlName === 'email' ? 'Correo electrónico' : 'Contraseña'} es requerido`;
    }
    
    if (control?.hasError('email')) {
      return 'Ingresa un correo electrónico válido';
    }
    
    if (control?.hasError('minlength')) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }
    
    return '';
  }
}


