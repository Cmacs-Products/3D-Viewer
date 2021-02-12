import { Component, OnInit } from '@angular/core';
import { DocumentWithPresignedURL } from 'src/models/document-with-presigned-URL';
import { Guid } from "guid-typescript";
import { DocumentApiModel } from 'src/models/DocumentApiModel';
import { DocumentViewerOptions } from 'src/models/document-viewer-options';

@Component({
  selector: 'app-document-viewer',
  templateUrl: './document-viewer.component.html',
  styleUrls: ['./document-viewer.component.css']
})
export class DocumentViewerComponent implements OnInit {
  doc: DocumentWithPresignedURL | undefined;
  viewerOptions: DocumentViewerOptions = new DocumentViewerOptions(true);
  viewerHeight: number = 800;
  viewerWidth: number = 800;
  isTopToolBar: boolean = false;
  isSharedViewer: boolean = false;
  constructor() { }

  ngOnInit() {
    // this.docURL = "https://s3.amazonaws.com/DefaultImages/2CylinderEngine.glb";
    var document = new DocumentApiModel();
    document.DocumentId = Guid.create().toString();
    document.DocumentVersionId = Guid.create().toString();
    document.Name = "Test Document";
    document.Type = "GLB";
    var url = "https://officetest.plantobuild.us/2CylinderEngine.glb";
    // "https://s3.amazonaws.com/DefaultImages/2CylinderEngine.glb"
    
    this.doc = new DocumentWithPresignedURL(document, url);
  }

}
