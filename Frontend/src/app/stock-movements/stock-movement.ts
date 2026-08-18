import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GetItemsPage } from '../models/get-items-page.model';
import { StockMovement as StockMovementModel } from '../models/stock-movement.model';

// Matches the backend CreateStockMovementDto
export interface CreateStockMovementDto {
  productId: number;
  movementTypeId: number; // 1=IN, 2=OUT, 3=ADJUSTMENT
  quantity: number;
  reason?: string;
  referenceCode?: string;
  createdByUserId: number;
}

@Injectable({
  providedIn: 'root'
})
export class StockMovementService {
  // Must match the port the backend is actually running on
  private apiUrl = 'http://localhost:5051/api/stock-movements';

  constructor(private http: HttpClient) { }

  // Fetch movements with pagination and optional filters
  getMovements(
    page: number,
    pageSize: number,
    movementType?: string,
    fromDate?: string,
    toDate?: string,
    productId?: number,
    createdByUserId?: number
  ): Observable<GetItemsPage<StockMovementModel>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (movementType) {
      params = params.set('movementType', movementType);
    }
    if (fromDate) {
      params = params.set('fromDate', fromDate);
    }
    if (toDate) {
      // Include the full day (up to 23:59:59)
      params = params.set('toDate', toDate + 'T23:59:59');
    }
    if (productId) {
      params = params.set('productId', productId.toString());
    }
    if (createdByUserId) {
      params = params.set('createdByUserId', createdByUserId.toString());
    }

    return this.http.get<GetItemsPage<StockMovementModel>>(this.apiUrl, { params });
  }

  // POST a new stock movement
  createMovement(data: CreateStockMovementDto): Observable<StockMovementModel> {
    return this.http.post<StockMovementModel>(this.apiUrl, data);
  }
}