import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product, MedicineBatch, Category } from '../../models/product.model';
import { ProductService, ProductCreate, ProductUpdate } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { environment } from '../../../environments/environment';

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
  loading: boolean = false;
  error: string | null = null;
  
  // Modal states
  showCreateModal: boolean = false;
  showEditModal: boolean = false;
  selectedProduct: Product | null = null;
  
  // Form data
  formData: {
    name: string;
    description?: string;
    category_id: number;
    presentation: string;
    concentration: string;
    image: string;
  } = {
    name: '',
    description: '',
    category_id: 1,
    presentation: '',
    concentration: '',
    image: ''
  };
  
  // Image preview
  imagePreview: string | null = null;
  imageFile: File | null = null;
  
  stats = {
    total: 0,
    lowStock: 0,
    outOfStock: 0
  };

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
    this.loadBatches();
  }

  loadCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        console.log('✅ Categorías cargadas:', categories);
      },
      error: (error) => {
        console.error('❌ Error al cargar categorías:', error);
        // Fallback a categorías por defecto si falla la carga
        this.categories = [
          { id: 1, name: 'Analgésicos', description: 'Medicamentos para el dolor' },
          { id: 2, name: 'Antibióticos', description: 'Medicamentos antibacterianos' },
          { id: 3, name: 'Antivirales', description: 'Medicamentos antivirales' },
          { id: 4, name: 'Vitaminas', description: 'Suplementos vitamínicos' }
        ];
      }
    });
  }

  loadProducts() {
    this.loading = true;
    this.error = null;
    
    // Log para diagnóstico
    console.log('🔄 Intentando cargar productos desde:', `${environment.apiUrl}/products/all`);
    
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products.map(product => {
          // Asignar categoría si existe
          if (product.category_id) {
            product.category = this.categories.find(c => c.id === product.category_id);
          }
          // Asegurar que la imagen tenga la URL completa si es relativa
          if (product.image && product.image.trim()) {
            // Si la imagen es una ruta relativa, construir la URL completa
            if (!product.image.startsWith('http') && !product.image.startsWith('data:')) {
              // Las imágenes vienen como "uploads/products/archivo.jpg"
              // Necesitamos construir: http://127.0.0.1:8000/uploads/products/archivo.jpg
              // Asegurar que empiece con /
              const imagePath = product.image.startsWith('/') ? product.image : `/${product.image}`;
              product.image = `${environment.apiUrl}${imagePath}`;
              console.log('🖼️ Imagen procesada:', product.image);
            }
          }
          return product;
        });
        // Asignar lotes a productos después de cargarlos
        this.assignBatchesToProducts();
        this.filteredProducts = [...this.products];
        this.updateStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error completo al cargar productos:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error name:', error.name);
        console.error('Error url:', error.url);
        
        // Si es error de conexión, dar más información
        if (error.status === 0 || !error.status) {
          console.warn('⚠️ Error de conexión detectado. Verificando backend...');
          console.warn('URL intentada:', `${environment.apiUrl}/products/all`);
        }
        
        this.error = this.extractErrorMessage(error);
        this.loading = false;
        // En caso de error, mantener productos vacíos
        this.products = [];
        this.filteredProducts = [];
        this.updateStats();
      }
    });
  }

  loadBatches() {
    // TODO: Implementar servicio de lotes cuando esté disponible
    // Por ahora, mantener datos de ejemplo para funcionalidad de stock
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
  }

  assignBatchesToProducts() {
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
    if (!product || !product.id) {
      this.error = 'Producto inválido. No se puede eliminar.';
      return;
    }
    
    if (confirm(`¿Está seguro de eliminar "${product.name}"?`)) {
      this.loading = true;
      this.error = null;
      
      console.log('🗑️ Eliminando producto con ID:', product.id);
      console.log('URL:', `${environment.apiUrl}/products/?product_id=${product.id}`);
      
      this.productService.deleteProduct(product.id).subscribe({
        next: (response) => {
          console.log('✅ Producto eliminado exitosamente:', response);
          // Recargar productos después de eliminar
          this.loadProducts();
          this.loading = false;
        },
        error: (error) => {
          console.error('❌ Error completo al eliminar producto:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
          this.error = this.extractErrorMessage(error);
          this.loading = false;
        }
      });
    }
  }

  editProduct(product: Product) {
    if (!product || !product.id) {
      this.error = 'Producto inválido. No se puede editar.';
      return;
    }
    
    console.log('✏️ Editando producto:', product);
    this.error = null;
    
    // Usar directamente los datos del producto que ya tenemos en la lista
    // (evita problemas si GET /products/?product_id={id} no está disponible)
    this.selectedProduct = { ...product };
    
    // Procesar imagen si existe - construir URL completa
    let imageUrl = product.image || '';
    if (imageUrl) {
      // Si la imagen ya tiene URL completa, usarla
      if (imageUrl.startsWith('http') || imageUrl.startsWith('data:')) {
        // Ya está completa
      } else {
        // Construir URL completa: uploads/products/archivo.jpg -> http://127.0.0.1:8000/uploads/products/archivo.jpg
        const imagePath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
        imageUrl = `${environment.apiUrl}${imagePath}`;
      }
    }
    
    this.formData = {
      name: product.name || '',
      description: product.description || '',
      category_id: product.category_id || 1,
      presentation: product.presentation || '',
      concentration: product.concentration || '',
      image: '' // No incluir la imagen existente en el formulario inicialmente
    };
    
    // Si hay imagen, mostrar preview
    if (imageUrl) {
      this.imagePreview = imageUrl;
      console.log('🖼️ Imagen del producto para editar:', imageUrl);
    } else {
      this.imagePreview = null;
    }
    
    this.imageFile = null;
    this.showEditModal = true;
  }

  addProduct() {
    this.selectedProduct = null;
    this.formData = {
      name: '',
      description: '',
      category_id: 1,
      presentation: '',
      concentration: '',
      image: ''
    };
    this.imagePreview = null;
    this.imageFile = null;
    this.showCreateModal = true;
    this.error = null;
  }

  closeModal() {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.selectedProduct = null;
    this.formData = {
      name: '',
      description: '',
      category_id: 1,
      presentation: '',
      concentration: '',
      image: ''
    };
    this.imagePreview = null;
    this.imageFile = null;
    this.error = null;
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validar tipo de archivo
      if (!file.type.match(/image\/(jpeg|jpg|png|gif|webp)/)) {
        this.error = 'Por favor, seleccione una imagen válida (JPG, PNG, GIF o WEBP)';
        return;
      }
      
      // Validar tamaño (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.error = 'La imagen no debe superar los 2MB';
        return;
      }
      
      this.imageFile = file;
      this.error = null;
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
        // Convertir a base64 para enviar al servidor
        this.formData.image = e.target.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.imagePreview = null;
    this.imageFile = null;
    this.formData.image = '';
    // Si estamos editando, restaurar la imagen original del producto
    if (this.showEditModal && this.selectedProduct && this.selectedProduct.image) {
      this.imagePreview = this.selectedProduct.image;
    }
  }

  saveProduct() {
    // Validar y obtener valores del formulario
    console.log('📋 FormData actual:', JSON.stringify(this.formData, null, 2));
    
    const name = (this.formData.name || '').trim();
    const categoryId = Number(this.formData.category_id) || 0;
    const presentation = (this.formData.presentation || '').trim();
    const concentration = (this.formData.concentration || '').trim();

    console.log('✅ Valores validados:', { name, categoryId, presentation, concentration });

    // Validaciones básicas
    if (!name || name.length === 0) {
      this.error = 'El nombre del producto es requerido';
      this.loading = false;
      return;
    }
    
    if (!categoryId || categoryId <= 0 || isNaN(categoryId)) {
      this.error = 'La categoría es requerida';
      this.loading = false;
      return;
    }
    
    if (!presentation || presentation.length === 0) {
      this.error = 'La presentación es requerida';
      this.loading = false;
      return;
    }
    
    if (!concentration || concentration.length === 0) {
      this.error = 'La concentración es requerida';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.error = null;

    if (this.showEditModal && this.selectedProduct) {
      // ACTUALIZAR PRODUCTO - Enviar todos los campos requeridos
      const updateData: any = {
        name: name,
        category_id: Number(categoryId),
        presentation: presentation,
        concentration: concentration
      };

      // Incluir descripción (puede ser null, undefined o vacía)
      // El backend espera Form(None), así que podemos enviar null, undefined o string vacío
      if (this.formData.description && this.formData.description.trim()) {
        updateData.description = this.formData.description.trim();
      } else {
        // Enviar null explícitamente (el servicio lo convertirá a string vacío en FormData)
        updateData.description = null;
      }

      // Incluir imagen solo si es nueva
      if (this.imageFile) {
        updateData.image = this.imageFile; // Pasar el File directamente
      } else if (this.formData.image && typeof this.formData.image === 'string' && this.formData.image.startsWith('data:image')) {
        updateData.image = this.formData.image; // Pasar base64 string (se convertirá a File en el servicio)
      }
      // Si no hay nueva imagen, no incluir el campo (FastAPI mantendrá la existente)

      // Mantener status - SIEMPRE enviar si está disponible
      if (this.selectedProduct.status !== undefined && this.selectedProduct.status !== null) {
        updateData.status = Number(this.selectedProduct.status);
      } else {
        // Si no hay status en el producto seleccionado, usar 1 (activo) por defecto
        updateData.status = 1;
      }
      
      console.log('📝 Datos para actualizar:', updateData);
      console.log('📤 Enviando actualización:', {
        id: this.selectedProduct.id,
        url: `${environment.apiUrl}/products/?product_id=${this.selectedProduct.id}`,
        data: updateData,
        hasImage: !!(this.imageFile || (this.formData.image && typeof this.formData.image === 'string' && this.formData.image.startsWith('data:image')))
      });
      
      this.productService.updateProduct(this.selectedProduct.id, updateData).subscribe({
        next: (response) => {
          console.log('✅ Producto actualizado exitosamente:', response);
          this.loadProducts();
          this.closeModal();
          this.loading = false;
          this.error = null;
        },
        error: (error) => {
          console.error('❌ Error completo al actualizar producto:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          console.error('Error error object:', error.error);
          console.error('Error details:', JSON.stringify(error, null, 2));
          console.error('Datos que se intentaron enviar:', updateData);
          const errorMessage = this.extractErrorMessage(error);
          this.error = errorMessage;
          this.loading = false;
          // Mostrar error más detallado en consola
          if (error.status === 422) {
            console.error('🔴 Errores de validación:', error.error?.detail);
          }
        }
      });
    } else {
      // CREAR PRODUCTO
      const createData: any = {
        name: name,
        category_id: Number(categoryId),
        presentation: presentation,
        concentration: concentration
      };

      // Incluir descripción si tiene valor
      if (this.formData.description && this.formData.description.trim()) {
        createData.description = this.formData.description.trim();
      }

      // Incluir imagen: pasar el File si existe, o el base64 string
      if (this.imageFile) {
        createData.image = this.imageFile; // Pasar el File directamente
      } else if (this.formData.image && typeof this.formData.image === 'string' && this.formData.image.startsWith('data:image')) {
        createData.image = this.formData.image; // Pasar base64 string (se convertirá a File en el servicio)
      }
      
      console.log('📤 Enviando creación:', {
        url: `${environment.apiUrl}/products/`,
        data: createData
      });
      
      this.productService.createProduct(createData).subscribe({
        next: (response) => {
          console.log('✅ Producto creado exitosamente:', response);
          this.loadProducts();
          this.closeModal();
          this.loading = false;
        },
        error: (error) => {
          console.error('❌ Error completo al crear producto:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
          this.error = this.extractErrorMessage(error);
          this.loading = false;
        }
      });
    }
  }

  private extractErrorMessage(error: any): string {
    // FastAPI puede devolver errores en diferentes formatos
    if (error.status === 0 || !error.status) {
      console.error('🔴 Error de conexión - Detalles:', {
        status: error.status,
        message: error.message,
        url: error.url,
        name: error.name
      });
      return 'No se pudo conectar con el servidor. Verifique que el backend esté ejecutándose en http://127.0.0.1:8000. Abra http://127.0.0.1:8000/docs para verificar.';
    }
    
    if (error.status === 404) {
      return 'Recurso no encontrado. Verifique que el producto exista.';
    }
    
    if (error.status === 401) {
      return 'No autorizado. Por favor, inicie sesión nuevamente.';
    }
    
    if (error.status === 422) {
      // Errores de validación de FastAPI
      if (error.error?.detail && Array.isArray(error.error.detail)) {
        const validationErrors = error.error.detail.map((err: any) => {
          const field = err.loc ? err.loc.join('.') : 'campo';
          return `${field}: ${err.msg}`;
        }).join(', ');
        return `Errores de validación: ${validationErrors}`;
      }
    }
    
    if (error.status === 400) {
      if (error.error?.detail) {
        if (Array.isArray(error.error.detail)) {
          return error.error.detail.map((e: any) => e.msg || e).join(', ');
        }
        return error.error.detail;
      }
      return 'Datos inválidos. Por favor, verifique los campos.';
    }
    
    // Intentar obtener el mensaje de error de diferentes formas
    if (error.error) {
      if (typeof error.error === 'string') {
        return error.error;
      }
      if (error.error.detail) {
        if (typeof error.error.detail === 'string') {
          return error.error.detail;
        }
        if (Array.isArray(error.error.detail)) {
          return error.error.detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ');
        }
      }
      if (error.error.message) {
        return error.error.message;
      }
    }
    
    if (error.message) {
      return error.message;
    }
    
    return `Error ${error.status || 'desconocido'}. Por favor, intente nuevamente.`;
  }

  handleImageError(product: Product) {
    // Si la imagen falla al cargar, eliminarla para mostrar el placeholder
    product.image = undefined;
  }
}
