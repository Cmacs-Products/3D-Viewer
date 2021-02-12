import { DocumentViewerOptions } from './document-viewer-options';
import { DocumentApiModel } from './DocumentApiModel';
import { ViewerType } from './viewer-type.enum';

export class DocumentViewer {
  Options: DocumentViewerOptions | undefined;
  Document: DocumentApiModel | undefined;
  PresignedUrl: string | undefined;
  Type: ViewerType;

  constructor(_options: DocumentViewerOptions, _type: ViewerType, _document?: DocumentApiModel, _presignedUrl?: string) {
    this.Options = _options;
    this.Document = _document;
    this.PresignedUrl = _presignedUrl;
    this.Type = _type
  }
}
