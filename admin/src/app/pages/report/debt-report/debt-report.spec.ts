import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebtReport } from './debt-report';

describe('DebtReport', () => {
  let component: DebtReport;
  let fixture: ComponentFixture<DebtReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DebtReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DebtReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
