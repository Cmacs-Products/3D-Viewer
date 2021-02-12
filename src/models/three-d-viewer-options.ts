import { DocumentViewerOptions } from './document-viewer-options';
import { ThreeDViewMode } from './three-d-view-mode.enum';

export class ThreeDViewerOptions extends DocumentViewerOptions{
  ViewMode: ThreeDViewMode;
  ShowEdges: boolean;
  // etc.

  constructor(_showStatus: boolean, _viewMode: ThreeDViewMode, _showEdges: boolean) {
    super(_showStatus);
    this.ViewMode = _viewMode;
    this.ShowEdges = _showEdges;
  }
}
