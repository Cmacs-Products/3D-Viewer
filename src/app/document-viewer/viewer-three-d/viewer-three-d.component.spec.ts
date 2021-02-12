import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewerThreeDComponent } from './viewer-three-d.component';

describe('ViewerThreeDComponent', () => {
  let component: ViewerThreeDComponent;
  let fixture: ComponentFixture<ViewerThreeDComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewerThreeDComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewerThreeDComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
