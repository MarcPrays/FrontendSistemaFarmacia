import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Category } from '../../models/product.model';
import { CategoryService } from '../../services/category.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-product-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-form-modal.component.html',
  styleUrl: './product-form-modal.component.css'
})
export class ProductFormModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() initialData: any = null; // Para edición
  @Output() closeModal = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  categories: Category[] = [];
  selectedImageFile: File | null = null;
  imagePreview: string | null = null;
  // En product-form-modal.component.ts
  existingImageUrl: string | null = null; // Para mostrar imagen actual si existe

  productForm = {
    name: '',
    description: '',
    category_id: 0,
    presentation: '',
    concentration: ''

  };

  batches: {
    expiration_date: string;
    stock: number | null;
    purchase_price: number | null;
    sale_price: number | null;
  }[] = [{ expiration_date: '', stock: null, purchase_price: null, sale_price: null }];

  constructor(private categoryService: CategoryService) { }

  ngOnInit() {
    this.loadCategories();
    if (this.mode === 'edit' && this.initialData) {
      this.loadProductForEdit();
    }
  }

  loadCategories() {
    this.categoryService.getAllCategories().subscribe(categories => {
      this.categories = categories;
      if (this.mode === 'create' && categories.length > 0) {
        this.productForm.category_id = categories[0].id;
      }
    });
  }

  loadProductForEdit() {
    const p = this.initialData;

    if (!p) {
      console.warn('No se recibieron datos para edición');
      return;
    }

    console.log('Cargando producto para edición:', p); // 👈 Para depurar

    this.productForm = {
      name: p.name?.trim() || '',
      description: p.description?.trim() || '',
      category_id: p.category_id || (this.categories.length > 0 ? this.categories[0].id : 0),
      presentation: p.presentation?.trim() || '',
      concentration: p.concentration?.trim() || ''
    };

    // Cargar imagen
    if (p.image) {
      this.existingImageUrl = `${environment.apiUrl}/${p.image}`;
    } else {
      this.existingImageUrl = null;
    }

    // Reset vista previa de nueva imagen
    this.imagePreview = null;
    this.selectedImageFile = null;
  }

  addBatchField() {
    this.batches.push({ expiration_date: '', stock: null, purchase_price: null, sale_price: null });
  }

  removeBatchField(index: number) {
    if (this.batches.length > 1) {
      this.batches.splice(index, 1);
    }
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validación opcional: tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        alert('Solo se permiten imágenes JPG o PNG.');
        input.value = ''; // reset input
        return;
      }

      this.selectedImageFile = file;

      // Crear vista previa
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (!this.productForm.name || this.productForm.category_id <= 0) {
      alert('El nombre y la categoría son obligatorios.');
      return;
    }

    const productData: any = {
      name: this.productForm.name,
      description: this.productForm.description || null,
      category_id: this.productForm.category_id,
      presentation: this.productForm.presentation || null,
      concentration: this.productForm.concentration || null
    };

    const validBatches = this.batches
      .filter(b => b.expiration_date || b.stock != null || b.sale_price != null)
      .map(b => ({
        ...b,
        stock: b.stock ?? undefined,
        purchase_price: b.purchase_price ?? undefined,
        sale_price: b.sale_price ?? undefined
      }));

    this.save.emit({
      product: productData,
      batches: validBatches,
      imageFile: this.selectedImageFile  //  Enviamos el archivo
    });
    this.onClose();
  }

  onClose() {
    this.closeModal.emit();
  }
}