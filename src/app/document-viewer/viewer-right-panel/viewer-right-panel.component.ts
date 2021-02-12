import { Component, ElementRef, OnInit, Input, Output, ViewChild,EventEmitter } from '@angular/core';
import { ThreeDViewerRightExpandablePanelTypes } from 'src/models/ThreeDViewerRightExpandablePanelTypes';
import { DocumentService } from 'src/app/services/document.service';
import { ThreeDViewerOptions } from 'src/models/three-d-viewer-options';


@Component({
  selector: 'app-viewer-right-panel',
  templateUrl: './viewer-right-panel.component.html',
  styleUrls: ['./viewer-right-panel.component.css']
})
export class ViewerRightPanelComponent implements OnInit {
  showRightExpandable: ThreeDViewerRightExpandablePanelTypes = ThreeDViewerRightExpandablePanelTypes.NONE;
  @Input() viewerHeight: number|undefined;
  @Input() iframeWrapper: any;
  @Input() isTopToolBar: boolean | undefined;
  @Output() initTag: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() document: any;
  @Input() PresignedURL: any;
  @Output() versionChanged = new EventEmitter<string>();
  @Input() options: ThreeDViewerOptions | undefined;
  @Input() selectedSubtypeModel: any;
  @Input() isSharedViewer: boolean |undefined;
  selectedVersion: string = '';
  selectedValue: string = 'Default';
  gradientValue: string = 'linear';
  checkOptionsOne = [
    { label: 'Hide', value: 'hide', checked: false },
    { label: 'Snap', value: 'snap', checked: false },
  ];
  color: string = '#009fe3';
  endColor: string = "#ffffff";
  value: number | undefined;
  checked: boolean = true;
  iFrameContent :  any;
  windowContent :  any;
  radioValue = 'Y';
  hideGrid: boolean = false;
  snapGrid: boolean = false;
  edges: boolean = false;
  translateXValue: number = 0;
  translateYValue: number = 0;
  translateZValue: number = 0;
  scaleXValue: number = 0;
  scaleYValue: number = 0;
  scaleZValue: number = 0;
  rotationXValue: number = 0;
  rotationYValue: number = 0;
  rotationZValue: number = 0;
  onlyVisibleForStandAloneViewer = false;
  isCollapsed = true;
  showSubtypeThumbnail = false;
  imageUrl: string | any;
  @Input() listofDocumentVersions: any = [];


  constructor(private documentService: DocumentService,) {
    this.value = 0;
   }

  ngOnInit() {
    this.onlyVisibleForStandAloneViewer = this.options!.ShowTopToolBar;
    this.selectedVersion = this.document!.DocumentVersionId || '';
    
    //this.setDateForVariousVersions(this.document!.DocumentVersionIds);
  }

  // setDateForVariousVersions(documentsVersionIds: any){
  //   debugger;
  //   for(let i = 0; i< documentsVersionIds.length; i++){
  //     this.documentService.GetDocumentVersion(documentsVersionIds[i]).subscribe(result =>{
  //       this.listofDocumentVersions.push(result[0]);
  //       console.log(result[0]);
  //     });
  //   }
  //   if(this.listofDocumentVersions.length === documentsVersionIds.length){
  //     this.listofDocumentVersions.reverse();
  //   }
   
  // }

  UpdateRightExpandblePanel(type: ThreeDViewerRightExpandablePanelTypes) {
    let updateTo: ThreeDViewerRightExpandablePanelTypes = ThreeDViewerRightExpandablePanelTypes.NONE

    switch (type) {
      case ThreeDViewerRightExpandablePanelTypes.DOWNLOAD:
        updateTo = this.showRightExpandable === ThreeDViewerRightExpandablePanelTypes.DOWNLOAD
          ? ThreeDViewerRightExpandablePanelTypes.NONE
          : ThreeDViewerRightExpandablePanelTypes.DOWNLOAD;
        break;
      case ThreeDViewerRightExpandablePanelTypes.VERSION:
        updateTo = this.showRightExpandable === ThreeDViewerRightExpandablePanelTypes.VERSION
          ? ThreeDViewerRightExpandablePanelTypes.NONE
          : ThreeDViewerRightExpandablePanelTypes.VERSION;
        break;
      case ThreeDViewerRightExpandablePanelTypes.PROPERTIES:
        updateTo = this.showRightExpandable === ThreeDViewerRightExpandablePanelTypes.PROPERTIES
          ? ThreeDViewerRightExpandablePanelTypes.NONE
          : ThreeDViewerRightExpandablePanelTypes.PROPERTIES;
        break;
      case ThreeDViewerRightExpandablePanelTypes.TRANSLATE:
          updateTo = this.showRightExpandable === ThreeDViewerRightExpandablePanelTypes.TRANSLATE
          ? ThreeDViewerRightExpandablePanelTypes.NONE
          : ThreeDViewerRightExpandablePanelTypes.TRANSLATE;
        break;
      case ThreeDViewerRightExpandablePanelTypes.IFCPROPERTIES:
          updateTo = this.showRightExpandable === ThreeDViewerRightExpandablePanelTypes.IFCPROPERTIES
          ? ThreeDViewerRightExpandablePanelTypes.NONE
          : ThreeDViewerRightExpandablePanelTypes.IFCPROPERTIES;
        break;
      case ThreeDViewerRightExpandablePanelTypes.SYSTEMPROPERTIES:
          updateTo = this.showRightExpandable === ThreeDViewerRightExpandablePanelTypes.SYSTEMPROPERTIES
          ? ThreeDViewerRightExpandablePanelTypes.NONE
          : ThreeDViewerRightExpandablePanelTypes.SYSTEMPROPERTIES;
          this.getSystemThumbnail();
        break;

      case ThreeDViewerRightExpandablePanelTypes.NONE:
      default:

        break;

    }
    this.showRightExpandable = updateTo;

  }
  onViewModeSelectionChange(selectedValue: string){
    this.iFrameContent = this.iframeWrapper.getIFrame();
    this.windowContent = (this.iFrameContent.contentWindow);
    //if(this.progressService.threeDViewerMode){
      this.selectedValue = selectedValue;
    //}
    //this.progressService.threeDViewerMode = selectedValue
    this.windowContent.Three.Gui.setObjectType(selectedValue);

    if(selectedValue === "Hidden Line"){
      this.edges = !this.edges;

    }


    if(this.document.Type.toUpperCase() === "OBJ" && selectedValue === "Default"){
      this.windowContent.ModelLoader.prototype.loadObjMtl([{obj:this.PresignedURL, requiresSchucalMtl: true}]);
      if(this.edges){
        this.edges = !this.edges;
        }

    }




  }

  onBackgroundSelectionChange(selectedValue: string){
    this.iFrameContent = this.iframeWrapper.getIFrame();
    this.windowContent = (this.iFrameContent.contentWindow);
    this.windowContent.ThreeDUtils.prototype.setBackgroundTexture(selectedValue);

    // if(selectedValue === 'radial'){
    //   this.windowContent.Three.BackgroundRendering.generateRadialTexture(this.windowContent.Three.BackgroundRendering.startColor, this.windowContent.Three.BackgroundRendering.stopColor);
    // }else{
    //   this.windowContent.Three.BackgroundRendering.generateTexture(this.windowContent.Three.BackgroundRendering.startColor, this.windowContent.Three.BackgroundRendering.stopColor);
    // }


  }

  getSystemThumbnail(){
    // if(this.selectedSubtypeModel){
    //   let subTypeId = this.selectedSubtypeModel[0].SubTypeId;
    //   this.documentService.get(false, `api/Ems/SystemSubType/GetDocumentList/${subTypeId}`).subscribe(subtypeDocumentData => {
    //     let jpgData = subtypeDocumentData.filter(x => x.Type === "JPG");
    //     this.documentService.GetImageUrl(jpgData[0].DocumentId).subscribe(result =>{
    //       this.imageUrl = result;


    //     });



    //   });
    // }

  }

  onOrientationChange(radioValue: string){
    this.iFrameContent = this.iframeWrapper.getIFrame();
    this.radioValue = radioValue;
    this.windowContent = (this.iFrameContent.contentWindow);
    this.windowContent.Three.Gui.setUpOrientation(radioValue.toLowerCase());



  }

  onColorChange(colorValue: string){
    this.iFrameContent = this.iframeWrapper.getIFrame();
    this.windowContent = (this.iFrameContent.contentWindow);
    this.color= colorValue;

    if(this.checked){
      this.windowContent.Three.Gui.stopColor = this.endColor;
      this.windowContent.Three.Gui.previewStartColor(colorValue);
      this.windowContent.Three.render();
    }else{
    this.windowContent.Three.Gui.backgroundColor = colorValue;
    this.windowContent.Three.scene.background = this.windowContent.Three.Gui.backgroundColor;
    this.windowContent.Three.renderer.setClearColor(this.windowContent.Three.Gui.backgroundColor);
    this.windowContent.Three.render();
  }

  }

  onEndColorChange(colorValue:string){
    this.iFrameContent = this.iframeWrapper.getIFrame();
    this.windowContent = (this.iFrameContent.contentWindow);
    this.endColor = colorValue;
    this.windowContent.Three.Gui.startColor = this.color;
    this.windowContent.Three.Gui.previewStopColor(colorValue);
    this.windowContent.Three.render();

  }

  gradientFillChange(value: any){
    this.iFrameContent = this.iframeWrapper.getIFrame();
    this.windowContent = (this.iFrameContent.contentWindow);
    if(!this.checked){
      this.windowContent.Three.Gui.backgroundColor = this.color;
      this.windowContent.Three.scene.background = this.windowContent.Three.Gui.backgroundColor;
      this.windowContent.Three.renderer.setClearColor(this.windowContent.Three.Gui.backgroundColor);
      this.windowContent.Three.render();
      //this.checked = !this.checked;
    }else{
      this.windowContent.Three.Gui.stopColor = this.endColor;
      this.windowContent.Three.Gui.previewStartColor(this.color);
      this.windowContent.Three.render();
    }
  }

  onHideGrid(e: any){
    this.iFrameContent = this.iframeWrapper.getIFrame();
    this.windowContent = (this.iFrameContent.contentWindow);
    if(this.hideGrid){
      this.windowContent.Three.gridHelper.visible = !this.windowContent.Three.gridHelper.visible;
    }else{
      this.windowContent.Three.gridHelper.visible = !this.windowContent.Three.gridHelper.visible;
    }

  }


  onSnapGrid(e: any){
    this.iFrameContent = this.iframeWrapper.getIFrame();
    this.windowContent = (this.iFrameContent.contentWindow);
    if(this.windowContent.Three.transformControls){
      this.windowContent.Three.Gui.toggleSnapToGrid(this.snapGrid);
    }else{
      this.snapGrid = false;
      return;
    }
  }
  positionXSlider(e: any){
    var model= {
      value : e
    }
    this.translateXValue = e;
    this.iFrameContent = this.iframeWrapper.getIFrame();
    this.windowContent = (this.iFrameContent.contentWindow);
    this.windowContent.ControlUtils.prototype.initTransformControls();
    this.windowContent.Three.Gui.positionXSliderUpdate(model);
    this.windowContent.Three.render();

  }

  positionYSlider(e: any){
    var model= {
      value : e
    }
    this.translateYValue = e;
    this.iFrameContent = this.iframeWrapper.getIFrame();
    this.windowContent = (this.iFrameContent.contentWindow);
    this.windowContent.ControlUtils.prototype.initTransformControls();
    this.windowContent.Three.Gui.positionYSliderUpdate(model);
    this.windowContent.Three.render();

  }
  positionZSlider(e:any){
    var model= {
      value : e
    }
    this.translateZValue = e;
    this.iFrameContent = this.iframeWrapper.getIFrame();
    this.windowContent = (this.iFrameContent.contentWindow);
    this.windowContent.ControlUtils.prototype.initTransformControls();
    this.windowContent.Three.Gui.positionZSliderUpdate(model);
    this.windowContent.Three.render();

  }
  scaleXSlider(e:any){
    var model= {
      value : e
    }
    this.scaleXValue = e;
    this.iFrameContent = this.iframeWrapper.getIFrame();
    this.windowContent = (this.iFrameContent.contentWindow);
    this.windowContent.ControlUtils.prototype.initTransformControls();
    this.windowContent.Three.Gui.scaleXSliderUpdate(model);
    this.windowContent.Three.render();


  }
  scaleYSlider(e:any){
    var model= {
      value : e
    }
    this.scaleYValue = e;
    this.iFrameContent = this.iframeWrapper.getIFrame();
    this.windowContent = (this.iFrameContent.contentWindow);
    this.windowContent.ControlUtils.prototype.initTransformControls();
    this.windowContent.Three.Gui.scaleYSliderUpdate(model);
    this.windowContent.Three.render();


  }
  scaleZSlider(e:any){
    var model= {
      value : e
    }
    this.scaleZValue = e;
    this.iFrameContent = this.iframeWrapper.getIFrame();
    this.windowContent = (this.iFrameContent.contentWindow);
    this.windowContent.ControlUtils.prototype.initTransformControls();
    this.windowContent.Three.Gui.scaleZSliderUpdate(model);
    this.windowContent.Three.render();


  }

  rotateXSlider(e: any){
    var model= {
      value : e
    }
    this.rotationXValue = e;
    this.iFrameContent = this.iframeWrapper.getIFrame();
    this.windowContent = (this.iFrameContent.contentWindow);
    this.windowContent.ControlUtils.prototype.initTransformControls();
    this.windowContent.Three.Gui.rotationXSliderUpdate(model);
    this.windowContent.Three.render();

  }
  rotateYSlider(e:any){
    var model= {
      value : e
    }
    this.rotationYValue = e;
    this.iFrameContent = this.iframeWrapper.getIFrame();
    this.windowContent = (this.iFrameContent.contentWindow);
    this.windowContent.ControlUtils.prototype.initTransformControls();
    this.windowContent.Three.Gui.rotationYSliderUpdate(model);
    this.windowContent.Three.render();

  }
  rotateZSlider(e: any){
    var model= {
      value : e
    }
    this.rotationZValue = e;
    this.iFrameContent = this.iframeWrapper.getIFrame();
    this.windowContent = (this.iFrameContent.contentWindow);
    this.windowContent.ControlUtils.prototype.initTransformControls();
    this.windowContent.Three.Gui.rotationZSliderUpdate(model);
    this.windowContent.Three.render();

  }

  tag(){
    this.initTag.emit(true);
  }

  onChangeGridSettings(e: any){

  }

  DownloadOriginal() {
    if (!this.document!.isShared()) {
      this.documentService.DownloadDocument(this.document.DocumentId).subscribe(data => {
        const url: string = data as string;
        window.open(url, '_self');
      });
    } else {
      // If the shared code is empty assume that this fucntion is called in the templates. The user should be logged in and should
      // have access to the document.
      // if (this.document!.sharedId) {
      //   this.documentService.GetSharedPresignedUrl(this.document!.sharedId as string,
      //     this.document.DocumentId, true).subscribe(data => {
      //       const url: string = data as string;
      //       window.open(url, '_self');
      //     });
      // } else {
        this.documentService.DownloadDocument(this.document.DocumentId).subscribe(data => {
          const url: string = data as string;
          window.open(url, '_self');
        });
      //}
    }
  }

onVersionChange(versionId: string) {
  if (this.document && versionId !== this.document.DocumentVersionId) {
    this.selectedVersion = versionId;
    //this.selectedVersion = this.selectedDocument!.DocumentVersionId || '';
    this.versionChanged.emit(versionId);
  }
}

resetViewer(){
  this.iFrameContent = this.iframeWrapper.getIFrame();
  this.windowContent = (this.iFrameContent.contentWindow);
  if(this.windowContent.Three.transformControls){
    this.windowContent.ControlUtils.prototype.hideTransformControls();
  }
  this.selectedValue = 'Default';
  this.windowContent.Three.Gui.hiddenLineDropDownValue = this.selectedValue;
  this.windowContent.Gui.prototype.setObjectType('Default');
  this.windowContent.Gui.prototype.resetObject();
  this.radioValue = 'Y';

}

onEdgesSelection(e: any){
  this.iFrameContent = this.iframeWrapper.getIFrame();
  this.windowContent = (this.iFrameContent.contentWindow);
  if(this.edges){
  this.selectedValue = 'Hidden Line';
  this.windowContent.Three.Gui.hiddenLineDropDownValue = this.selectedValue;
  this.windowContent.Gui.prototype.toggleHiddenLine();
}else{
  this.windowContent.Three.Gui.hiddenLineDropDownValue = this.selectedValue;
  this.windowContent.Gui.prototype.toggleHiddenLine();

}
  //this.windowContent.Three.Gui.setObjectType(this.selectedValue);
}

closeRightPanel(){
  this.UpdateRightExpandblePanel(1);
}

// getCreatedOnDate(e:any){
//   console.log('Fetching time');
//   // this.documentService.GetDocumentVersion(e).subscribe(result => {
//     debugger;
//  return this.cmacsDateServcie.toLongDateTimePrefix(e, false, false);

//   // });
 
// }

// getCreatedOnDate(date: string | null): string {
//   if (date && date.slice(-1) === 'Z') {
//     date = date!.substring(0, 19);
//   }
//   const _dateTZ = moment(this.cmacsDateServcie.toCurrentTZ(new Date(date!), true));
//   // const time = _dateTZ.format(this.cmacsDateService.getLongDateTimePrefixFormat());
//   if (this.appConstants.CURRENT_CULTURE === 'DE-DE') {
//     return _dateTZ.locale('DE-DE').format(this.cmacsDateServcie.getLongDateTimePrefixFormat());
//   } else {
//     return _dateTZ.format(this.cmacsDateServcie.getLongDateTimePrefixFormat());
//   }
// }

@ViewChild('widgetsContent', { read: ElementRef }) public widgetsContent: ElementRef<any> | undefined;

scrollUp(): void {
  this.widgetsContent!.nativeElement.scrollTo({ top: (this.widgetsContent!.nativeElement.scrollTop - 20), behavior: 'smooth' });
}

scrollDown(): void {
  this.widgetsContent!.nativeElement.scrollTo({ top: (this.widgetsContent!.nativeElement.scrollTop + 20), behavior: 'smooth' });
}

}
