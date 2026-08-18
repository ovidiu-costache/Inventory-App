import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductsService } from '../products.service';
import { CategoriesService } from '../../services/categories.service';
import { CreateProductDto } from '../dtos/create-product.dto';
import { Category } from '../../models/category.model';

@Component({
    selector: 'app-product-create',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './product-create.component.html'
})
export class ProductCreateComponent implements OnInit {
    categories: Category[] = [];

    formData: CreateProductDto = {
        code: '',
        name: '',
        description: '',
        categoryId: 0,
        unitOfMeasure: '',
        price: 0,
        reorderThreshold: 0
    };

    submitError = '';
    isSubmitting = false;

    constructor(
        private productsService: ProductsService,
        private categoriesService: CategoriesService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.categoriesService.getCategories().subscribe({
            next: (data) => {
                this.categories = data;
                if (this.categories.length > 0) {
                    this.formData.categoryId = this.categories[0].id; // default selection
                }
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error loading categories', err);
            }
        });
    }

    onSubmit(): void {
        this.submitError = '';
        this.isSubmitting = true;

        // Basic client-side validation
        if (!this.formData.code.trim()) {
            this.submitError = 'Codul produsului este obligatoriu.';
            this.isSubmitting = false;
            return;
        }
        if (!this.formData.name.trim()) {
            this.submitError = 'Numele produsului este obligatoriu.';
            this.isSubmitting = false;
            return;
        }
        if (!this.formData.categoryId || this.formData.categoryId <= 0) {
            this.submitError = 'Categoria este obligatorie.';
            this.isSubmitting = false;
            return;
        }
        if (!this.formData.unitOfMeasure.trim()) {
            this.submitError = 'Unitatea de masura este obligatorie.';
            this.isSubmitting = false;
            return;
        }
        if (this.formData.price < 0) {
            this.submitError = 'Pretul nu poate fi negativ.';
            this.isSubmitting = false;
            return;
        }
        if (this.formData.reorderThreshold < 0) {
            this.submitError = 'Pragul de reaprovizionare nu poate fi negativ.';
            this.isSubmitting = false;
            return;
        }

        const dto: CreateProductDto = {
            ...this.formData,
            code: this.formData.code.trim(),
            name: this.formData.name.trim(),
            description: this.formData.description?.trim() || undefined,
            unitOfMeasure: this.formData.unitOfMeasure.trim()
        };

        this.productsService.createProduct(dto).subscribe({
            next: () => {
                this.router.navigate(['/products']);
            },
            error: (err) => {
                console.error('Error creating product', err);
                this.submitError = err.error?.detail || err.error?.title || 'Eroare la crearea produsului. Verifica datele si incearca din nou.';
                this.isSubmitting = false;
                this.cdr.detectChanges();
            }
        });
    }

    goBack(): void {
        this.router.navigate(['/products']);
    }
}
