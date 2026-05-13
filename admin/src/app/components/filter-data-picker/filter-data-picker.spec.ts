import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterDataPicker } from './filter-data-picker';

describe('FilterDataPicker', () => {
  let component: FilterDataPicker;
  let fixture: ComponentFixture<FilterDataPicker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterDataPicker]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterDataPicker);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
