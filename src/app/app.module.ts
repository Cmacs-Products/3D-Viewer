import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DocumentViewerComponent } from './document-viewer/document-viewer.component';
import { ViewerThreeDComponent } from './document-viewer/viewer-three-d/viewer-three-d.component';
import { IFrameWrapper } from './iframe-wrapper/iframe-wrapper.component';
import { HttpClientModule } from '@angular/common/http';
import { CmacsComponentsLibModule } from 'cmacs-components-lib';
import { ViewerFloatingMenuComponent } from './document-viewer/viewer-floating-menu/viewer-floating-menu.component';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { FormsModule } from '@angular/forms';
import { ViewerRightPanelComponent } from './document-viewer/viewer-right-panel/viewer-right-panel.component';

@NgModule({
  declarations: [
    AppComponent,
    DocumentViewerComponent,
    ViewerThreeDComponent,
    IFrameWrapper,
    ViewerFloatingMenuComponent,
    ViewerRightPanelComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    CmacsComponentsLibModule,
    NzSliderModule,
    FormsModule      
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
