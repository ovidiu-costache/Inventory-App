import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AiReviewRequestDto {
  productId: number;
  quantity: number;
  reason: string;
}

export interface AiReviewResponseDto {
  verdict: 'NORMAL' | 'SUSPECT';
  explanation: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiReviewService {
  private apiUrl = 'http://localhost:5051/api/ai/review-adjustment';

  constructor(private http: HttpClient) { }

  reviewAdjustment(request: AiReviewRequestDto): Observable<AiReviewResponseDto> {
    return this.http.post<AiReviewResponseDto>(this.apiUrl, request);
  }
}
