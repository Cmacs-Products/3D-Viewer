import { Observable } from 'rxjs';
import { DocumentApiModel } from 'src/models/DocumentApiModel';

export class DocumentWithPresignedURL extends DocumentApiModel {
  PresignedURL: string | undefined;
  sharedId: string | undefined;
  SecondaryDocuments: DocumentWithPresignedURL[] = [];
  constructor(_document: DocumentApiModel, _presignedURL: string, _sharedId?: string | undefined) {
    super(_document);
    this.PresignedURL = _presignedURL;
    this.sharedId = _sharedId;
  }

  isShared() {
    return this.sharedId !== undefined;
  }
}

