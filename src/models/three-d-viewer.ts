import { DocumentViewer } from './document-viewer';
import { ThreeDViewerOptions } from './three-d-viewer-options';
import { DocumentApiModel } from './DocumentApiModel';
import { ViewerType } from './viewer-type.enum';

export class ThreeDViewer extends DocumentViewer {
  // controls object?
  constructor( _options: ThreeDViewerOptions, _document?: DocumentApiModel) {
    super(_options, ViewerType.ThreeDViewer, _document);
  }
}
