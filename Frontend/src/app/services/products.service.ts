import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GetItemsPage } from '../models/get-items-page.model';
import { Product } from '../models/product.model';
import { CreateProductDto } from '../products/dtos/create-product.dto';
import { UpdateProductDto } from '../products/dtos/update-product.dto';


@Injectable({
    providedIn: 'root'
})
export class ProductsService {
    private apiUrl = 'http://localhost:5051/api/products';

    constructor(private http: HttpClient) { }

    getProducts(
        page: number,
        pageSize: number,
        categoryId?: number,
        stockState?: string,
        minPrice?: number,
        maxPrice?: number,
        search?: string,
        sortBy?: string,
        sortDir?: string
    ): Observable<GetItemsPage<Product>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('pageSize', pageSize.toString());

        if (categoryId) params = params.set('categoryId', categoryId.toString());
        if (stockState) params = params.set('stockState', stockState);
        if (minPrice) params = params.set('minPrice', minPrice.toString());
        if (maxPrice) params = params.set('maxPrice', maxPrice.toString());
        if (search) params = params.set('search', search);
        if (sortBy) params = params.set('sortBy', sortBy);
        if (sortDir) params = params.set('sortDir', sortDir);

        return this.http.get<GetItemsPage<Product>>(this.apiUrl, { params });
    }

    getProduct(id: number): Observable<Product> {
        return this.http.get<Product>(`${this.apiUrl}/${id}`);
    }

    createProduct(data: CreateProductDto): Observable<Product> {
        return this.http.post<Product>(this.apiUrl, data);
    }

    updateProduct(id: number, data: UpdateProductDto): Observable<Product> {
        return this.http.patch<Product>(`${this.apiUrl}/${id}`, data);
    }

    deleteProduct(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}