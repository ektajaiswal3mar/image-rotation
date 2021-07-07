import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Rotator } from './rotator.component';

describe('Rotator', () => {
  let component: Rotator;
  let fixture: ComponentFixture<Rotator>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Rotator ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Rotator);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
