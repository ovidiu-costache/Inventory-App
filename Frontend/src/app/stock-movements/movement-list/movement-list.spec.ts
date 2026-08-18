import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovementList } from './movement-list';

describe('MovementList', () => {
  let component: MovementList;
  let fixture: ComponentFixture<MovementList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovementList],
    }).compileComponents();

    fixture = TestBed.createComponent(MovementList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
