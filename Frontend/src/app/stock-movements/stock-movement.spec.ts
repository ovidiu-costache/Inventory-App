import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { StockMovementService } from './stock-movement';

describe('StockMovementService', () => {
  let service: StockMovementService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()]
    });
    service = TestBed.inject(StockMovementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

