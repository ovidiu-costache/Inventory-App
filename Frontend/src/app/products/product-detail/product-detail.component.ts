import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from '../products.service';
import { CategoriesService } from '../../services/categories.service';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';
import { UpdateProductDto } from '../dtos/update-product.dto';

@Component({
    selector: 'app-product-detail',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './product-detail.component.html'
})
export class ProductDetailComponent implements OnInit {
    product: Product | null = null;
    categories: Category[] = [];
    loadError = false;
    isEditing = false;
    isSaving = false;
    isDeleting = false;
    saveError = '';
    deleteError = '';

    // Edit form fields
    editData = {
        code: '',
        name: '',
        description: '',
        categoryId: 0,
        unitOfMeasure: '',
        price: 0,
        reorderThreshold: 0,
        isActive: true
    };

    private productId = 0;

    constructor(
        private productsService: ProductsService,
        private categoriesService: CategoriesService,
        private route: ActivatedRoute,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.productId = Number(this.route.snapshot.paramMap.get('id'));
        this.loadProduct();
        this.loadCategories();
    }

    loadCategories(): void {
        this.categoriesService.getCategories().subscribe({
            next: (data) => {
                this.categories = data;
                if (this.isEditing) {
                    this.populateEditForm();
                }
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error loading categories', err);
            }
        });
    }

    loadProduct(): void {
        this.loadError = false;
        this.productsService.getProduct(this.productId).subscribe({
            next: (product) => {
                this.product = product;
                this.populateEditForm();
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error loading product', err);
                this.loadError = true;
                this.cdr.detectChanges();
            }
        });
    }

    populateEditForm(): void {
        if (!this.product) return;

        let matchingCategoryId = 0;
        if (this.categories && this.categories.length > 0) {
            const cat = this.categories.find(c => c.name === this.product?.category);
            if (cat) {
                matchingCategoryId = cat.id;
            }
        }

        this.editData = {
            code: this.product.code,
            name: this.product.name,
            description: this.product.description || '',
            categoryId: matchingCategoryId,
            unitOfMeasure: this.product.unitOfMeasure,
            price: this.product.price,
            reorderThreshold: this.product.reorderThreshold,
            isActive: this.product.isActive
        };
    }

    toggleEdit(): void {
        this.isEditing = !this.isEditing;
        this.saveError = '';
        if (this.isEditing) {
            this.populateEditForm();
        }
    }

    saveChanges(): void {
        if (!this.product) return;
        this.saveError = '';
        this.isSaving = true;

        // Build a patch DTO with only changed fields
        const dto: UpdateProductDto = {};

        if (this.editData.code.trim() !== this.product.code) {
            dto.code = this.editData.code.trim();
        }
        if (this.editData.name.trim() !== this.product.name) {
            dto.name = this.editData.name.trim();
        }
        const newDesc = this.editData.description.trim();
        const oldDesc = this.product.description || '';
        if (newDesc !== oldDesc) {
            dto.description = newDesc;
        }
        if (this.editData.categoryId && this.editData.categoryId > 0) {
            dto.categoryId = this.editData.categoryId;
        }
        if (this.editData.unitOfMeasure.trim() !== this.product.unitOfMeasure) {
            dto.unitOfMeasure = this.editData.unitOfMeasure.trim();
        }
        if (this.editData.price !== this.product.price) {
            dto.price = this.editData.price;
        }
        if (this.editData.reorderThreshold !== this.product.reorderThreshold) {
            dto.reorderThreshold = this.editData.reorderThreshold;
        }
        if (this.editData.isActive !== this.product.isActive) {
            dto.isActive = this.editData.isActive;
        }

        // Check if anything changed
        if (Object.keys(dto).length === 0) {
            this.isEditing = false;
            this.isSaving = false;
            return;
        }

        this.productsService.updateProduct(this.productId, dto).subscribe({
            next: (updated) => {
                this.product = updated;
                this.isEditing = false;
                this.isSaving = false;
                this.populateEditForm();
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error updating product', err);
                this.saveError = err.error?.detail || err.error?.title || 'Eroare la salvarea modificarilor.';
                this.isSaving = false;
                this.cdr.detectChanges();
            }
        });
    }

    confirmDelete(): void {
        if (!this.product) return;
        const confirmed = confirm(`Esti sigur ca vrei sa stergi produsul "${this.product.name}" (${this.product.code})?`);
        if (!confirmed) return;

        this.deleteError = '';
        this.isDeleting = true;

        this.productsService.deleteProduct(this.productId).subscribe({
            next: () => {
                this.router.navigate(['/products']);
            },
            error: (err) => {
                console.error('Error deleting product', err);
                this.deleteError = err.error?.detail || err.error?.title || 'Eroare la stergerea produsului.';
                this.isDeleting = false;
                this.cdr.detectChanges();
            }
        });
    }

    goBack(): void {
        this.router.navigate(['/products']);
    }
}
