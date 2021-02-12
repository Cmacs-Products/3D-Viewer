import { Component, OnInit, Input, ViewChild, ElementRef , EventEmitter, Output } from '@angular/core';
import { IFrameEvent } from 'src/models/iframe-exchange-data';
import { ThreeDViewerOptions } from 'src/models/three-d-viewer-options';


@Component({
  selector: 'app-viewer-floating-menu',
  templateUrl: './viewer-floating-menu.component.html',
  styleUrls: ['./viewer-floating-menu.component.css']
})
export class ViewerFloatingMenuComponent implements OnInit {
  @Input() floatingMenuTop: any;
  @Input() floatingMenuLeft: any;
  @Input() iframeWrapper: any;
  @Input() isVisible: boolean = false;
  @Input() options: ThreeDViewerOptions | undefined;
  @ViewChild('setStatus') setStatusViewer: ElementRef | undefined;
  @Output() showHideStatus: EventEmitter<any> = new EventEmitter();
  @Input() showOptionsInFloatingMenu: boolean |undefined;
  @Output() refreshStatuses : EventEmitter<any> = new EventEmitter();
  @Input() isSharedViewer: boolean |undefined;
  iFrameContent :  any;
  //showOptionsInFloatingMenu: boolean = true;
  isCameraVisible = false;
  viewSectioning = false;
  viewBoxZoom = false;
  viewTranslationMode = false;
  viewScaleMode = false;
  viewRotationMode= false;
  viewStatus = true;
  Three: any;
  ChangeForIframe: IFrameEvent | undefined;
  windowContent :  any;
  value = 0;
  isExplodeMenuVisible = false;
  onlyVisibleForStandAloneViewer  = false;
  i18n = {
    //<!-- To Do || Translation needed -->
    'Dock To Left': 'Dock To Left',
    //<!-- To Do || Translation needed -->
    'Dock To Right': 'Dock To Right',
    //<!-- To Do || Translation needed -->
    'Dock To Top': 'Dock To Top',
    //<!-- To Do || Translation needed -->
    'Dock To Bottom': 'Dock To Bottom',
    //<!-- To Do || Translation needed -->
    'Minimize Toolbar': 'Minimize Toolbar'
  };
  // top = '25';
  // left = null;
  // bottom = '0';
  // right = null;
  // position = 'bottom';

  top = null;
  left = null;
  bottom = '20px';
  right = null;
  topBoundary = '20px';
  leftBoundary = '20px';
  bottomBoundary = '20px';
  rightBoundary = '20px';
  position = 'bottom';


getPlacement() {
    switch (this.position) {
      case 'bottom':
        return 'top';
      case 'top':
        return 'bottom';
      case 'left':
        return 'right';
      case 'right':
        return 'left';
    }
  }

 constructor() {
  this.i18n['Dock To Left'] =  'Dock To Left';
  this.i18n['Dock To Right'] = 'Dock To Right';
  this.i18n['Dock To Top'] = 'Dock To Top';
  this.i18n['Dock To Bottom'] ='Dock To Bottom';
  this.i18n['Minimize Toolbar'] = 'Minimize Toolbar';

  }

 ngOnInit() {
   debugger;
 
   this.onlyVisibleForStandAloneViewer = this.options!.ShowTopToolBar;
  
   //this.setStatusViewer!.nativeElement.click();
  
 }
 onClick(){
   if(this.isCameraVisible){
     this.isCameraVisible = false;
   }
   if(this.isExplodeMenuVisible){
    this.isExplodeMenuVisible = !this.isExplodeMenuVisible;
  }
  
  if(this.viewSectioning){
    this.windowContent.SectioningToolUtils.prototype.killSectioningTool();
    this.viewSectioning = !this.viewSectioning;
  }
   this.isVisible =!this.isVisible;
 }
 onFullViewClick(){
  if(this.isCameraVisible){
    this.isCameraVisible = false;
  }
  if(this.isVisible){
    this.isVisible =  false;
  }
  if(this.isExplodeMenuVisible){
    this.isExplodeMenuVisible = !this.isExplodeMenuVisible;
  }
  
  if(this.viewSectioning){
    this.windowContent.SectioningToolUtils.prototype.killSectioningTool();
    this.viewSectioning = !this.viewSectioning;
  }
  this.iFrameContent = this.iframeWrapper.getIFrame();
  this.windowContent = (this.iFrameContent.contentWindow);
  this.windowContent.ViewToggle.prototype.setTopRightFrontView();
 }
 setCameraMode(){
   if(this.isVisible){
     this.isVisible =  false;
   }
   if(this.isExplodeMenuVisible){
    this.isExplodeMenuVisible = !this.isExplodeMenuVisible;
  }
  if(this.viewSectioning){
    this.windowContent.SectioningToolUtils.prototype.killSectioningTool();
    this.viewSectioning = !this.viewSectioning;
  }
   this.isCameraVisible = !this.isCameraVisible;
 }
 onTranslate(){
  if(this.isCameraVisible){
    this.isCameraVisible = false;
  }
  if(this.isVisible){
    this.isVisible =  false;
  }
  if(this.isExplodeMenuVisible){
    this.isExplodeMenuVisible = !this.isExplodeMenuVisible;
  }
  if(this.viewSectioning){
    this.windowContent.SectioningToolUtils.prototype.killSectioningTool();
    this.viewSectioning = !this.viewSectioning;
  }
    this.viewTranslationMode = !this.viewTranslationMode;
    this.iFrameContent = this.iframeWrapper.getIFrame();
    this.windowContent = (this.iFrameContent.contentWindow);
  if(this.viewTranslationMode){
    if(this.windowContent.Three.transformControls){
      if(this.windowContent.Three.transformControls.mode === 'scale' || this.windowContent.Three.transformControls.mode === 'rotate'){
        this.windowContent.ControlUtils.prototype.hideTransformControls();
      }
    }
    this.windowContent.ControlUtils.prototype.initTransformControls();
    this.windowContent.Three.Utils.showTransformControls = true;
    this.windowContent.ControlUtils.prototype.showTransformControls();
    this.windowContent.Three.transformControls.setMode('translate');
  }else{
    this.windowContent.Three.Utils.showTransformControls = false;
    this.windowContent.ControlUtils.prototype.hideTransformControls();
 }
}
 onScale(){
    if(this.isCameraVisible){
        this.isCameraVisible = false;
    }
    if(this.isVisible){
        this.isVisible =  false;
    }
    if(this.isExplodeMenuVisible){
      this.isExplodeMenuVisible = !this.isExplodeMenuVisible;
    }
    if(this.viewSectioning){
      this.windowContent.SectioningToolUtils.prototype.killSectioningTool();
      this.viewSectioning = !this.viewSectioning;
    }
    this.viewScaleMode = !this.viewScaleMode;
    this.iFrameContent = this.iframeWrapper.getIFrame();
    this.windowContent = (this.iFrameContent.contentWindow);
    if(this.viewScaleMode){
      if(this.windowContent.Three.transformControls){
        if(this.windowContent.Three.transformControls.mode === 'translate' || this.windowContent.Three.transformControls.mode === 'rotate'){
        this.windowContent.ControlUtils.prototype.hideTransformControls();
      }
    }
      this.windowContent.ControlUtils.prototype.initTransformControls();
      this.windowContent.Three.Utils.showTransformControls = true;
      this.windowContent.ControlUtils.prototype.showTransformControls();
      this.windowContent.Three.transformControls.setMode('scale');
    }else {
      this.windowContent.Three.Utils.showTransformControls = false;
      this.windowContent.ControlUtils.prototype.hideTransformControls();
    }
 }

 onRotate(){
    if(this.isCameraVisible){
      this.isCameraVisible = false;
    }
    if(this.isVisible){
      this.isVisible =  false;
    }
    if(this.isExplodeMenuVisible){
      this.isExplodeMenuVisible = !this.isExplodeMenuVisible;
    }
    if(this.viewSectioning){
      this.windowContent.SectioningToolUtils.prototype.killSectioningTool();
      this.viewSectioning = !this.viewSectioning;
    }
   this.viewRotationMode = !this.viewRotationMode;
   this.iFrameContent = this.iframeWrapper.getIFrame();
   this.windowContent = (this.iFrameContent.contentWindow);
  if(this.viewRotationMode){
    if(this.windowContent.Three.transformControls){
      if(this.windowContent.Three.transformControls.mode === 'translate' || this.windowContent.Three.transformControls.mode === 'scale'){
        this.windowContent.ControlUtils.prototype.hideTransformControls();
      }
    }
      this.windowContent.ControlUtils.prototype.initTransformControls();
      this.windowContent.Three.Utils.showTransformControls = true;
      this.windowContent.ControlUtils.prototype.showTransformControls();
      this.windowContent.Three.transformControls.setMode('rotate');
  }else{
    this.windowContent.Three.Utils.showTransformControls = false;
     this.windowContent.ControlUtils.prototype.hideTransformControls();
  }

 }
 setTopView(){
  this.iFrameContent = this.iframeWrapper.getIFrame();
  this.windowContent = (this.iFrameContent.contentWindow);
  this.windowContent.ViewToggle.prototype.setTopView();
  this.isVisible = !this.isVisible;

 }
 setBottomView(){
  this.iFrameContent = this.iframeWrapper.getIFrame();
  this.windowContent = (this.iFrameContent.contentWindow);
  this.windowContent.ViewToggle.prototype.setBottomView();
  this.isVisible = !this.isVisible;

 }

 setLeftView(){
  this.iFrameContent = this.iframeWrapper.getIFrame();
  this.windowContent = (this.iFrameContent.contentWindow);
  this.windowContent.ViewToggle.prototype.setLeftView();
  this.isVisible = !this.isVisible;
 }

 setRightView(){
  this.iFrameContent = this.iframeWrapper.getIFrame();
  this.windowContent = (this.iFrameContent.contentWindow);
  this.windowContent.ViewToggle.prototype.setRightView();
  this.isVisible = !this.isVisible;
 }

 setFrontView(){
  this.iFrameContent = this.iframeWrapper.getIFrame();
  this.windowContent = (this.iFrameContent.contentWindow);
  this.windowContent.ViewToggle.prototype.setFrontView();
  this.isVisible = !this.isVisible;
 }

 setBackView(){
  this.iFrameContent = this.iframeWrapper.getIFrame();
  this.windowContent = (this.iFrameContent.contentWindow);
  this.windowContent.ViewToggle.prototype.setBackView();
  this.isVisible = !this.isVisible;
 }

 onClipping(){
  if(this.isCameraVisible){
    this.isCameraVisible = false;
  }
  if(this.isVisible){
    this.isVisible =  false;
  }
  if(this.isExplodeMenuVisible){
    this.isExplodeMenuVisible = !this.isExplodeMenuVisible;
  }
    this.viewSectioning= !this.viewSectioning;
    this.iFrameContent = this.iframeWrapper.getIFrame();
    this.windowContent = (this.iFrameContent.contentWindow);
    this.windowContent.ThreeDTagUtils.prototype.removeTagsFromModel();
    if(this.viewSectioning){
      this.windowContent.SectioningToolUtils.prototype.loadSectioningTool();
    }else{
      this.windowContent.SectioningToolUtils.prototype.killSectioningTool();
    }

 }

 onModelExplode(){
  if(this.isCameraVisible){
    this.isCameraVisible = false;
  }
  if(this.isVisible){
    this.isVisible =  false;
  }

  if(this.viewSectioning){
    this.windowContent.SectioningToolUtils.prototype.killSectioningTool();
    this.viewSectioning = !this.viewSectioning;
  }

   this.isExplodeMenuVisible = !this.isExplodeMenuVisible;
 }

 onBoxZoom(){
  if(this.isCameraVisible){
    this.isCameraVisible = false;
  }
  if(this.isVisible){
    this.isVisible =  false;
  }
  if(this.isExplodeMenuVisible){
    this.isExplodeMenuVisible = !this.isExplodeMenuVisible;
  }
   if(this.viewSectioning){
    this.windowContent.SectioningToolUtils.prototype.killSectioningTool();
    this.viewSectioning = !this.viewSectioning;
  }
    this.viewBoxZoom = !this.viewBoxZoom;
    this.iFrameContent = this.iframeWrapper.getIFrame();
    this.windowContent = (this.iFrameContent.contentWindow);
    if(this.viewBoxZoom){
      this.windowContent.ThreeDUtils.prototype.boxZoom();
    }else{
      this.windowContent.ThreeDUtils.prototype.stopBoxZoom();
      // this.windowContent.Three.Utils.mousedown = false;
      // this.windowContent.Three.Utils.mousemove = false;
    }
 }

 setPersepectiveCamera(){
  this.iFrameContent = this.iframeWrapper.getIFrame();
  this.windowContent = (this.iFrameContent.contentWindow);
  this.windowContent.Three.CameraUtils.setPerspectiveCamera();
  this.isCameraVisible = !this.isCameraVisible;

 }

 setOrthoGraphicCamera(){
  this.iFrameContent = this.iframeWrapper.getIFrame();
  this.windowContent = (this.iFrameContent.contentWindow);
  this.windowContent.Three.CameraUtils.setOrthographicCamera();
  this.isCameraVisible = !this.isCameraVisible;

 }

 onChange(value: number): void {
   var model ={
     value : value
   }
   this.iFrameContent = this.iframeWrapper.getIFrame();
   this.windowContent = (this.iFrameContent.contentWindow);
   this.windowContent.Three.Gui.explodeModelSliderUpdate(model);
  console.log('onChange:  ' + value);
}

onAfterChange(value: number):void{

  this.iFrameContent = this.iframeWrapper.getIFrame();
  this.windowContent = (this.iFrameContent.contentWindow);
  this.windowContent.Three.Gui.explodeModelSliderUpdate(value);
  console.log('onAfterChange:  ' + value);

}

showStatus(e: any){
  if(this.viewStatus){
  this.showHideStatus.emit(e);
  this.viewStatus = !this.viewStatus;
}else{
  this.refreshStatuses.emit(e);
  this.viewStatus = !this.viewStatus;
}
}

remove3DFilter(){
  this.iFrameContent = this.iframeWrapper.getIFrame();
  this.windowContent = (this.iFrameContent.contentWindow);
  let mesh = this.windowContent.Three.ModelLoader.getModel('MainMesh');
  this.windowContent.Three.Utils.set3DObjectMaterial(mesh, 0);

}

filter3DModel(tags:any){
  this.iFrameContent = this.iframeWrapper.getIFrame();
  this.windowContent = (this.iFrameContent.contentWindow);
  console.log(tags); 
  // this.emsNodeService.getAllNodes(this.progressService.projectEmsId!).subscribe(result => {
  //   let that = this;
  //   let emsNodes = result;
  //   let otherTags: [] | any;
  //   for(let i =0; i< tags.length; i++){
  //     otherTags = emsNodes.filter(e => e.IfcTag != tags[i] && e.IfcNode );
  //   }
    
  //   let mesh = that.windowContent.Three.ModelLoader.getModel('MainMesh');
  //   //let that = this;
  //   mesh.traverse(function(child:any){   
  //     if(child instanceof that.iframeWrapper.getIFrame().contentWindow.THREE.Group){
  //      if(!(child.name && tags.includes(child.name) || child.parent.name && tags.includes(child.parent.name))){
        
  //       that.iframeWrapper.getIFrame().contentWindow.ThreeDUtils.prototype.setGroupMaterial(child, 1);
  //       if(child.children.length > 0){
  //         for(let i = 0; i< child.children.length; i++){
  //           that.iframeWrapper.getIFrame().contentWindow.ThreeDUtils.prototype.setMeshMaterial(child.children[i], 1);

  //         }
  //       }
  //    }
  //     }  else{
  //       if(child.material){
  //         if(!(child.name && tags.includes(child.name) || child.parent.name && tags.includes(child.parent.name))){
  //       that.iframeWrapper.getIFrame().contentWindow.ThreeDUtils.prototype.setMeshMaterial(child, 1);
  //         }
  //       }
  //     }


  // })

  // })
  

}



}
