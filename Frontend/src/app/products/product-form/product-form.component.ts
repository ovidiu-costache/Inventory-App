import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Category } from '../../models/category.model';

export interface ProductFormData {
    code: string;
    name: string;
    description?: string;
    categoryId: number;
    newCategoryName?: string;
    unitOfMeasure: string;
    price: number;
    reorderThreshold: number;
}

@Component({
    selector: 'app-product-form',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './product-form.component.html'
})
export class ProductFormComponent {
    @Input() formData!: ProductFormData;
    @Input() categories: Category[] = [];
    @Input() isSubmitting = false;
    @Input() submitLabel = 'Save';

    @Output() formSubmit = new EventEmitter<ProductFormData>();
    @Output() formCancel = new EventEmitter<void>();

    onSubmit(): void {
        this.formSubmit.emit(this.formData);
    }

    onCancel(): void {
        this.formCancel.emit();
    }
}
