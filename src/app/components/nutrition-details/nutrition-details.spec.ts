import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NutritionDetails } from './nutrition-details';

describe('NutritionDetails', () => {
  let component: NutritionDetails;
  let fixture: ComponentFixture<NutritionDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NutritionDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(NutritionDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
