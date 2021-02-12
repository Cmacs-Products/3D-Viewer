import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewerRightPanelComponent } from './viewer-right-panel.component';

describe('ViewerRightPanelComponent', () => {
  let component: ViewerRightPanelComponent;
  let fixture: ComponentFixture<ViewerRightPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewerRightPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewerRightPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
