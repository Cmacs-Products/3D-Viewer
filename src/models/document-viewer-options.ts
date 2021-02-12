
export class DocumentViewerOptions {
  ShowStatus: boolean;
  ShowTopToolBar: boolean = true;
  ShowLeftToolBar: boolean = true;
  ShowRightToolBar: boolean = true;
  ShowFloatingToolBar: boolean = true;
  RightToolbarDownload: boolean = true;
  RightToolbarAnnotations: boolean = true;
  [k: string]: any;

  constructor(_showStatus: boolean) {
    this.ShowStatus = _showStatus;
  }

}
