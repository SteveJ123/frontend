import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTrackerList } from './admin-tracker-list';

describe('AdminTrackerList', () => {
  let component: AdminTrackerList;
  let fixture: ComponentFixture<AdminTrackerList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminTrackerList],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminTrackerList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
