
import { Component, EventEmitter, Input, OnInit, Output, ViewChild, OnDestroy, ElementRef, HostListener, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common'; 
import { DomSanitizer } from '@angular/platform-browser';
import { Subject, Subscription } from 'rxjs';
import { DocumentWithPresignedURL } from 'src/models/document-with-presigned-URL';
// import { NavLayoutService } from 'src/app/app-layout/services/nav-layout.service';
import { IFrameEvent } from 'src/models/iframe-exchange-data';
import { IframeMouseEvent } from 'src/models/iframe-mouse-event';
import { IframeMouseEventType } from 'src/models/iframe-mouse-event-type.enum';
import { ThreeDViewMode } from 'src/models/three-d-view-mode.enum';
import { ThreeDViewer } from 'src/models/three-d-viewer';
import { ThreeDViewerOptions } from 'src/models/three-d-viewer-options';

//import { ProgressService } from 'src/app/app-ems/services/progress.service';
import { DocumentService } from 'src/app/Services/document.service';
//import { DocumentContextMenuContent } from '../../models/document-context-menu-content';
import { IFrameWrapper } from 'src/app/iframe-wrapper/iframe-wrapper.component';
//import { DefectNodeService } from 'src/app/app-ems/services/defectNode.service';
//import { first } from 'rxjs/operators';
import { DocumentApiModel } from 'src/models/DocumentApiModel';
import { TwoDViewerOptions } from 'src/models/two-d-viewer-options';
//import { FullSizeModalService } from '../../services/full-size-modal.service';
//import { SystemSubTypeService } from 'src/app/app-ems/services/systemSubType.service';
//import { _ } from '@biesbjerg/ngx-translate-extract/dist/utils/utils';
declare var $: any;

@Component({
  selector: 'app-viewer-three-d',
  templateUrl: './viewer-three-d.component.html',
  styleUrls: ['./viewer-three-d.component.css']
})

// it wraps around the canvas (iframe, not angular) and
// is wrapped around by various viewer configurations (shared, ems, regular), which will need to bring controls
export class ViewerThreeDComponent extends ThreeDViewer implements OnInit, OnDestroy {
  URL: string = '/assets/static-pages/ThreeDCanvas.html';
  presignedURL: string | undefined;
  isLoaded: boolean = false;
  public iframeEvent: Subject<IFrameEvent> = new Subject<IFrameEvent>();
  _document: DocumentWithPresignedURL | undefined;
  selectedVersion: string = '';
  PresignedURL: string | undefined;
  private showViewer: boolean = false;
  options: ThreeDViewerOptions | undefined;
  private optionsUpdate: ThreeDViewerOptions | undefined;
  fileName: string = 'fileName';
  projectName: string = 'projectName';
  currentAnnotationDocument: DocumentWithPresignedURL | undefined;
  annotationViewOptions: TwoDViewerOptions = new TwoDViewerOptions(false);
  isSidebarIconShown: boolean = true; // rein: added to make buildable, but can't stay here! needs to be part of vieweroptions
  screenHeight: number = window.innerHeight;
  screenWidth: number = window.innerWidth;
  tagPopupHeight: number | undefined;
  tagPopupWidth: number | undefined;
  @Input() isTopToolBar: boolean | undefined;
  @Input() floatingMenuTop: string | undefined;
  @Input() floatingMenuLeft: string | undefined;
  @Input() viewerHeight: number | undefined;
  @Input() isSharedViewer: boolean | undefined;
  @ViewChild('iframeWrapper') iframeWrapper: IFrameWrapper | undefined; //{static: false}
  @ViewChild('rightPanel') rightPanel: any;
  @ViewChild('floatingMenu') floatingMenu: any;
  @Output() openVersion = new EventEmitter<string>();
  showfullSizePopUp: boolean = false;
  showFloatMenu = false;
  showOptionsInFloatingMenu = true;
  selectedSubtypeModel: any;
  mesh: any;
  iframeWindowObject: any;
  objUrl: any;
  mtlUrl: any;
  iframeId: string = '3dfrm';
  DEFAULT_LOADING_MESSAGE: string = '';

  domObject: any;


  @Input()
  set document(doc: DocumentWithPresignedURL | undefined) {
    console.log('In document');
    this._document = doc;
    this.selectedVersion = doc!.DocumentVersionId || '';
    if (doc !== undefined && this._document !== undefined && this._document.PresignedURL !== undefined) {
      this.iframeId = '3dfrm-' + this._document.DocumentVersionId;
      this.fileName = this._document.Name;
      this.PresignedURL = this.document.PresignedURL;
      console.log(this.iframeId);
      
      // this._document.PresignedURL.pipe(first()).subscribe((presignedURL: string) => {
      //   this.PresignedURL = presignedURL;

      //   // If the page was already loaded before the Presigned URL was fetched
      //   if (this.isLoaded) {
      //     this.load3DModel();
      //   }
      // });
      //this.compileEMSNodeData(this._document);
    }
  }
  get document() { return this._document; }

  @Input()
  set ShowViewer(show: boolean) {
    this.showViewer = show;
    // trigger all the changes that we saved up
    // this.refreshStatusColors();
    if (!this.showViewer && show && this.optionsUpdate !== undefined && this.isLoaded) {
      debugger;
      this.updateOptions(this.optionsUpdate);
    }

  }
  get ShowViewer() { return this.showViewer; }

  @Input()
  set Options(_options: ThreeDViewerOptions) {
    // should override constructor call after construction (?)
    // deal with all changes in individually
    //this.refreshStatusColors();
    if (this.showViewer && this.isLoaded) {
      // save the changes to be applied later
      this.updateOptions(_options);
      // this.options = _options;
    } else {
      // save the object
      this.optionsUpdate = _options;
    }

  }
  get Options() {
    return this.options as ThreeDViewerOptions;
  }

  @HostListener('document:keyup.escape', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    //this.documentService.showContextMenu.next(undefined);

  }
  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    //this.documentService.showContextMenu.next(undefined);

  }
  // @Output() openVersion = new EventEmitter<string>();

  allSubscriptions: Subscription[] = [];

  constructor(
    public domSanitizer: DomSanitizer,
   // public navLayoutService: NavLayoutService,
    //public progressService: ProgressService,
    private documentService: DocumentService,
    @Inject(DOCUMENT) dom
    //private fullSizeModalService: FullSizeModalService,
    //public subTypeService: SystemSubTypeService,
    //public emsService: EmsNodeService, // won't make backend calls. just for access to already loaded data in EMS
    //public defectService: DefectNodeService, // won't make backend calls. just for access to already loaded data in EMS
    //private translateService: TranslateService
  ) {
    // don't know why, but passing the ThreeDViewerOptions object to the
    // super constructor doesn't remve the requirement to initialize this.Options,
    // so we are doing the smae thing twice here...
    super(new ThreeDViewerOptions(
      true,
      ThreeDViewMode.Default,
      false));
    this.Options = new ThreeDViewerOptions(
      true,
      ThreeDViewMode.Default,
      false);
      this.options = new ThreeDViewerOptions(
        true,
        ThreeDViewMode.Default,
        false);
    //this.allSubscriptions.push(this.emsService.updatedModel.asObservable().subscribe(this.updateEMSNodeData.bind(this)));
    //this.allSubscriptions.push(this.emsService.getFilterResults().subscribe(this.filter3DModel.bind(this)));
    // //this.translateService.instant(_('drive.document.document-viewer.loading-message'));
    this.DEFAULT_LOADING_MESSAGE = 'Loading..'; 
  }

  ngOnInit() {
    // this.emsService.getFilterResults().subscribe(result => {
    //   let filterNodes = result;
    //   if (filterNodes) {

    //   }
   //});

    // this.projectName = this.navLayoutService.getCurrentProjectName();
    // this.selectedSubtypeModel = this.subTypeService.getSelectedModels();
    // let selectedModels = this.emsService.getSelectedModels();
    // if (this.progressService.selectedTree.value === 0) {
    //   if (selectedModels) {
    //     this.emsService.setSelectedModels(selectedModels);
    //   }
    // }
  }

  ngOnDestroy() {
    this.allSubscriptions.forEach((s: Subscription) => s.unsubscribe());
  }

  NewFolderBtnClicked() {
    // rein: added to make buildable.
  }

  // recursive, initially called once, will collact data needed in the 3d viewer for colors based on IFCRoot
  // compileEMSNodeData(Document: DocumentWithPresignedURL) {
  //   if (Document.IFCRootNode === undefined || Object.keys(this.EMSNodeData).length !== 0) { return; }

  //   const compileNodes = function (this: ViewerThreeDComponent, nodes: (EmsNodeApiModel | undefined)[]) {
  //     for (const node of nodes) {
  //       if (node === undefined) { return; }
  //       this.SetEmsNodeData(node);
  //       compileNodes.call(this, this.emsService.getStoredChildren(node));
  //     }
  //   };
  //   compileNodes.call(this, [Document.IFCRootNode]);
  //   this.refreshStatusColors();
  // }

  // // whenever there is an update to an EMS node, check if it affects us.
  // updateEMSNodeData(emsNode: EmsNodeApiModel) {
  //   if (emsNode.IfcTag === undefined
  //     || this.EMSNodeData.get(emsNode.getObjectKey()) === undefined
  //   ) { return; }

  //   this.SetEmsNodeData(emsNode);
  // }

  // filter3DModel(emsNodes: any) {
  //   if (emsNodes != null) {
  //     let tags = emsNodes.filter((e: { Type: string; }) => e.Type.toUpperCase() === 'ELEMENT').map((node: { IfcTag: any; }) => node.IfcTag);
  //     this.floatingMenu.filter3DModel(tags);
  //   } else {
  //     this.floatingMenu.remove3DFilter();
  //   }

  // }

  // private SetEmsNodeData(node: EmsNodeApiModel) {
  //   if (node.IfcTag === undefined) { return; }
  //   this.EMSNodeData.set(node.getObjectKey(), node);
  //   if (this.options === undefined || !this.options!.ShowStatus || !this.showViewer || !this.isLoaded) { // store update
  //     this.EMSNodeDataUpdate.set(node.getObjectKey(), node);
  //   } else {
  //     this.iframeEvent.next(new IFrameEvent('setStatus', { IfcTag: node.IfcTag, Status: node.Status }));
  //   }
  // }

  // private refreshStatusColors() {
  //   if (!this.showViewer
  //     || !this.isLoaded
  //     || this.EMSNodeDataUpdate === undefined
  //     || this.options === undefined
  //     || !this.options!.ShowStatus) {
  //     return;
  //   }

  //   if (this.options !== undefined && this.options!.ShowStatus) {
  //     this.EMSNodeDataUpdate.forEach(node => {
  //       this.iframeEvent.next(new IFrameEvent('setStatus', { IfcTag: node.IfcTag, Status: node.Status }));
  //     }, this);
  //   }

  //   this.EMSNodeDataUpdate.clear();
  // }

  // fired once the iframe is loaded
  onLoaded(loaded: boolean) {
    if (loaded) {
      this.isLoaded = true;

      // save meta data
      const simpleDoc = this._document!;
      delete simpleDoc.PresignedURL;
      debugger;
      this.iframeEvent.next(new IFrameEvent('documentMetaData', simpleDoc));

      const frm = this.iframeWrapper!.getIFrame();
     //const frm = $('#3dfrm-' + this._document!.DocumentVersionId);
     if (frm === undefined)
        return;
     this.iframeWindowObject = frm.contentWindow;

     // console.log(this.iframeWindowObject);
      let iframeId = this.iframeWrapper!.getIFrame();
      // const frm = $('#dvfrm-' + this._document!.DocumentVersionId);
      // if (frm.length === 0)
      //   return;
      // this.iframeWindowObject = frm[0].contentWindow;

      // open viewer
      if (this.PresignedURL === undefined) {
        // show loadingoverlay, it is still being fetched
        return; // we will load the viewer once we have the presigned URL
      } else {
        this.load3DModel();
      }
    }
  }

   refresh3DViewers() {
  //   this.compileEMSNodeData(this._document!);
   }

  load3DModel() {

    if (this.document) {
      // this.iframeEvent.next(new IFrameEvent('loadTestCube'));
      //this.document.Type === 'DOCUMENT'
      if (this.document.Type === 'IFC' || this.document.Type === 'GLB') {
        this.iframeEvent.next(new IFrameEvent('loadGlb', this.PresignedURL));
      } else if (this.document.Type === 'OBJ') {
        if (this.optionsUpdate!.ShowTopToolBar) {
          this.iframeEvent.next(new IFrameEvent('checkForMtlOrObj', [{ docExtId: this.document.DocumentId, extension: ".mtl", docVerExtId: this.document.DocumentVersionId }]));
          // var mtl = this.document.SecondaryDocuments.find(d => d.Type === 'MTL');
          // if (mtl !== undefined && mtl.PresignedURL !== undefined) {
          //   mtl.PresignedURL.subscribe(mtlURL => {
          //     this.iframeEvent.next(new IFrameEvent('loadOBJMTL', [this.PresignedURL, mtlURL]));
          //   })
          // } else {
          //   this.iframeEvent.next(new IFrameEvent('loadOBJ', this.PresignedURL));
          // }
        } else {
          this.iframeEvent.next(new IFrameEvent('loadOBJMTL', [{ obj: this.PresignedURL, requiresSchucalMtl: true }]));
        }
      } else if (this.document.Type === 'STL') {
        this.iframeEvent.next(new IFrameEvent('loadSTL', this.PresignedURL));
      } else if (this.document.Type === 'DAE') {
        this.iframeEvent.next(new IFrameEvent('loadDae', this.PresignedURL));
      }
    }
  }

  updateOptions(_options: ThreeDViewerOptions) {
    debugger;
     let forceUpdate = false;
     if (this.options === undefined) {
       this.options = Object.assign({}, _options);
       forceUpdate = true;
     }
    // // if(this.options.SelectedEMSNodes.length > 0){
    // //   this.iframeEvent.next(new IFrameEvent('SelectedEMSNodes', this.options.SelectedEMSNodes));

    // // }
     Object.getOwnPropertyNames(_options).forEach(function (this: ViewerThreeDComponent, p: string) {
       if (p !== undefined && ((forceUpdate || (this.options as ThreeDViewerOptions)[p] !== _options[p]))) {
         if (p === 'SelectedEMSNodes') {
           if (_options[p] !== undefined) {
            if (Array.isArray(_options[p])) { // clone
              (this.options as ThreeDViewerOptions)[p] = [..._options[p]];
            } else if (typeof _options[p] === 'object') {
              (this.options as ThreeDViewerOptions)[p] = Object.assign({}, _options[p]);
            } else {
              (this.options as ThreeDViewerOptions)[p] = _options[p];
            }

            this.iframeEvent.next(new IFrameEvent(p, (this.options as ThreeDViewerOptions)[p]));
          }
          //this.iframeEvent.next(new IFrameEvent(p, (this.options as ThreeDViewerOptions)[p]));

        }

      }
    }.bind(this));
  }


  // events from the iframe
  onChildEvents(event: any) {
    debugger;
    console.log('Child Events');
    if (this.Options !== undefined && Object.getOwnPropertyNames(this.Options).some(p => p === event.eventType)) {
      this.Options.set(event.eventType, event.value);
    } else {
      switch (event.eventType) {
        case 'fileLoaded':
          // trigger all the changes that we saved up
          //this.refreshStatusColors();
          if (this.showViewer && this.optionsUpdate !== undefined) {
            this.updateOptions(this.optionsUpdate);
          }

          if (this.document!.Type.toUpperCase() === "OBJ") {
            this.showOptionsInFloatingMenu = false;
          } else {
            this.showOptionsInFloatingMenu = true;

          }
          // if (this.progressService.threeDViewerMode) {
          //   this.rightPanel!.onViewModeSelectionChange(this.progressService.threeDViewerMode);
          // }
          // this.progressService.threeDScene = this.iframeWindowObject.Three;
          this.showFloatMenu = true;
          if (this.documentService.isThreeDViewerLoading() === true) {
            this.documentService.setThreeDViewerLoading(false, true);
            this.documentService.threeDViewerLoadingMessage$.next(this.DEFAULT_LOADING_MESSAGE);
          }
          break;
        // case 'openTagModal':
        //   this.showfullSizePopUp = true;
        //   this.currentAnnotationDocument = new DocumentWithPresignedURL(
        //     event.value as DocumentApiModel,
        //     this.documentService.DownloadDocumentVersionForViewer(event.value)
        //   );
        //   this.tagPopupHeight = this.screenHeight - 250;
        //   // if(this.tagPopupHeight > 560){
        //   //   $('.emsResolutionExpand').addClass('emsResolution').removeClass('emsResolutionExpand');
        //   //   $('.emsResolution').find('.viewerside-middle.emsarrows').removeClass('emsarrows');
        //   //   $('.emsResolution').find('.viewerside-panel-arrow.emsarrows').removeClass('emsarrows');
        //   // }
        //   this.tagPopupWidth = this.screenWidth;
        //   this.fullSizeModalService.sendModal('threedAnotationPopup');

        //   break;
        case 'getObjUrl':
          this.documentService.DownloadDocument(event.value.objverId).subscribe(objUrl => {
            this.objUrl = objUrl
            console.log(objUrl);
            this.documentService.DownloadDocument(event.value.mtlverId).subscribe(mtlUrl => {
              this.mtlUrl = mtlUrl;

              this.iframeEvent.next(new IFrameEvent('loadOBJMTL', [this.objUrl, this.mtlUrl]));

            })
          })
          break;
        case 'getActualObjUrl':
          this.documentService.DownloadDocument(event.value.docExtId).subscribe(url => {
            this.iframeEvent.next(new IFrameEvent('loadOBJ', url));

          })
          break;
        // case 'pushTags':
        //   if (this.iframeWrapper) {
        //     if (this.iframeWrapper.getIFrame().contentWindow) {

        //     }
        //   }
        //   break;
        case 'ifcPagePercent':
          this.documentService.setThreeDViewerLoading(true, true);
          if (event.value) {
            if (event.value.percent > 100) {
              event.value.percent = 100;
            }
            this.documentService.threeDViewerLoadingMessage$.next(event.value.percent.toString() + '%');
          }
          break;


        case 'clickEvent':
          // open a context menu or change what is selected
          const clickEvent: IframeMouseEvent = event.value;
          //this.progressService.storeMouseEventFor3D = clickEvent.coordinates;
          event.clientX = event.value.coordinates.x + this.iframeWrapper!.getIFrame().getBoundingClientRect().left;
          event.clientY = event.value.coordinates.y + this.iframeWrapper!.getIFrame().getBoundingClientRect().top;

          let rightClickEvent = new MouseEvent('contextmenu', { bubbles: true });
          rightClickEvent.initMouseEvent('contextmenu',
            true,
            false,
            event.view,
            event.detail,
            event.screenX,
            event.screenY,
            event.clientX,
            event.clientY,
            event.ctrlKey,
            event.altKey,
            event.shiftKey,
            event.metaKey,
            event.button,
            event.relatedTarget,

          )

          switch (clickEvent.type) {
            case IframeMouseEventType.CLICK:
            case IframeMouseEventType.DBLCLICK:
              this.setSelectionFrom3DObject(clickEvent.object, clickEvent.keys.CTRL);
              //this.documentService.showContextMenu.next(undefined);
              break;
            case IframeMouseEventType.CONTEXT:
              if (!this.isSharedViewer) {
                this.openContextMenuFrom3DObject(rightClickEvent, clickEvent.object, clickEvent.keys.CTRL);
              }
          }

      }
    }
  }


  // triggers event that in the structure-child component will 
  setSelectionFrom3DObject(objectName: string, modifySelection: boolean) {
    if (this.document !== undefined) {
      if (modifySelection) { // updateSelected
        //this.emsService.modifyEmsNodesByTags([objectName], this.document.IFCRootNode);
      } else { // replace array
        //this.emsService.selectEmsNodesByTags([objectName], this.document.IFCRootNode);
      }
    } else if (false) { // placeholder for defects
      console.log('code missing');
    } else { // just select it!
      this.iframeEvent.next(new IFrameEvent('selectObjectByName', objectName));
    }
  }

  openContextMenuFrom3DObject(clickEvent: any, objectName: string, modifySelection: boolean) {
    // let tagsArray: EmsNodeApiModel[];
    // if (this.document !== undefined && this.document.IFCRootNode !== undefined) {
    //   //this.emsService.selectEmsNodesByTags([objectName] , this.document.IFCRootNode);
    //   //tagsArray = this.emsService.findTagsInHierarchy([objectName], this.document.IFCRootNode);
    //   this.documentService.showContextMenu.next(new DocumentContextMenuContent(clickEvent, objectName as any, 'EmsViewer'));
    // } else {
    //   if (objectName === "3DTag") {
    //     this.documentService.showContextMenu.next(new DocumentContextMenuContent(clickEvent, objectName as any, '3DTag'));
    //   } else {
    //     this.documentService.showContextMenu.next(new DocumentContextMenuContent(clickEvent, objectName as any, 'StandAloneViewer'));
    //   }
    // }

    // console.log(
    //   'CONTEXTMENU - (x,y): (' + coordinates.x + ', ' + coordinates.y + '),  name: "' + objectName + '", modify: "' + modifySelection + '"'
    // );
  }

  // onVersionChange(versionId: string){
  //   if (this.document && versionId !== this.document.DocumentVersionId){
  //     this.openVersion.emit(versionId);
  //     this.selectedVersion = this.document.DocumentVersionId || '';
  //   }
  // }

  // 3D tag
  // initTag() {
  //   this.iframeEvent.next(new IFrameEvent('initTag', this._document));
  // }

   showHideStatus(e: any) {
  //   this.iframeEvent.next(new IFrameEvent('hideStatuses'));
  }

  onOpenVersion(versionId: string) {
    if (this.document && versionId !== this.document.DocumentVersionId) {
      this.selectedVersion = versionId;
      //this.selectedVersion = this.selectedDocument!.DocumentVersionId || '';
      this.openVersion.emit(versionId);
    }
  }


  WindowClosed() {
    //this.fullSizeModalService.closeModal();
    this.showfullSizePopUp = false;
    // this.iframeWrapper = this.OldIframeWrapper;
    // this.OldIframeWrapper = undefined;
    this.showViewer = true;

  }
}
