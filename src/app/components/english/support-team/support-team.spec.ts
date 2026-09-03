import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportTeam } from './support-team';

describe('SupportTeam', () => {
  let component: SupportTeam;
  let fixture: ComponentFixture<SupportTeam>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupportTeam],
    }).compileComponents();

    fixture = TestBed.createComponent(SupportTeam);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
