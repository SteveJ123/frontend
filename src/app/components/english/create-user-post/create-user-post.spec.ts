import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUserPost } from './create-user-post';

describe('CreateUserPost', () => {
  let component: CreateUserPost;
  let fixture: ComponentFixture<CreateUserPost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateUserPost],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateUserPost);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
