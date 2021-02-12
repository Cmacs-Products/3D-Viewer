import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewerFloatingMenuComponent } from './viewer-floating-menu.component';

describe('ViewerFloatingMenuComponent', () => {
  let component: ViewerFloatingMenuComponent;
  let fixture: ComponentFixture<ViewerFloatingMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewerFloatingMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewerFloatingMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
