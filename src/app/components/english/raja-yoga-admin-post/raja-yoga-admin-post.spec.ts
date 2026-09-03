import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RajaYogaAdminPost } from './raja-yoga-admin-post';

describe('RajaYogaAdminPost', () => {
  let component: RajaYogaAdminPost;
  let fixture: ComponentFixture<RajaYogaAdminPost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RajaYogaAdminPost],
    }).compileComponents();

    fixture = TestBed.createComponent(RajaYogaAdminPost);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
