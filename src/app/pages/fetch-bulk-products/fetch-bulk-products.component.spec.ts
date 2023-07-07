import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FetchBulkProductsComponent } from './fetch-bulk-products.component';

describe('FetchBulkProductsComponent', () => {
  let component: FetchBulkProductsComponent;
  let fixture: ComponentFixture<FetchBulkProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FetchBulkProductsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FetchBulkProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
