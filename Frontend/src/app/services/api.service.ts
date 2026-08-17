import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // Update if using a different URL
  protected readonly baseUrl = 'https://localhost:7118/api'; 

  constructor(protected http: HttpClient) { }
}