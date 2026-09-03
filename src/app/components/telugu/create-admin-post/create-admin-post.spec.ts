import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAdminPost } from './create-admin-post';

describe('CreateAdminPost', () => {
  let component: CreateAdminPost;
  let fixture: ComponentFixture<CreateAdminPost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateAdminPost],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateAdminPost);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
