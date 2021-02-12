import { DocumentViewerOptions } from './document-viewer-options';

export class TwoDViewerOptions extends DocumentViewerOptions{
  // additional properties only relevant to 2d viewer. AnnotationMode?
  pageNo?: number;
  //currentAnnotation?: DocumentSvgAnnotationApiModel;
  constructor(_showStatus: boolean) {
    super(_showStatus);
  }
}
