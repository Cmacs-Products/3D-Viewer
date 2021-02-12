"use strict";

var SvgGlobalController = (function () {

    function SvgGlobalController() {
        this.selectedObject = {
            element: null,
            svgController: null
        };
      this.gridLines = null;
      this.mouseEventStored = null;
      this.copiedAnnotation = false;

      //setting default annotation properties
      this.defaultStrokeColor = "#009fe3";
      this.defaultEmsNodeFillColor = "#3B3F46";
      this.defaultEmsNodeStrokeColor = "#3B3F46";
      this.defaultDefectFillColor = "#3B3F46";
      this.defaultDefectStrokeColor = "#3B3F46";
      this.defaultMeasurementStrokeColor = "#009fe3";
      this.defaultMeasurementStrokeWidth = 2
      this.defaultMeasurementOpacity = 1
      this.defaultEmsNodeTextColor = "white";
      this.defaultDefectTextColor = "white";
      this.defaultStrokeWidth = 2;
      this.defaultOpacity =1;
      this.defaultFillColor = ""
      this.defaultFontSize = 10;
      this.defaultDefectFontSize = 10;
      this.defaultTextAnnotationFillColor ="yellow";
      this.defaultHighlightStrokeColor = "yellow";
      this.iconType= "type_default";
      this.initialXPosition = 0;
      this.initialYPosition = 0;
      this.emsgroupUpdate = false;
      this.baseAngleForDocument = 0;
      this.baseAngleDefect = 0;
      this.isDraggablePermission = true;
      this.isProjectManager = true;
      this.loggedInUser = "";

        this.changedNodeNames = new Object();
        this.svgObject = null;

        this.allSelectedObjects = [];
        this.activePageNumber = null;
        this.isDraggingElement = false;
        this.all = [];
        this.canvases = [];
        this.currentRightClickedObject = null;
        this.annotationsToCopy = [];
        this.allDbAnnotations = [];
        this.isShiftKeyPressed = false;
        this.isCtrlKeyPressed = false;
        this.freeDrawProperties = {
            color: '#009EE3',
            strokeWidth: 4
        }
        if (ROLE !== "Anonymous") {
            $(document).keydown(function (e) {
                if (e.keyCode == 16) {
                    SvgGlobalControllerLogic.isShiftKeyPressed = true;
                } else if (e.keyCode == 17) { // ctrl
                    SvgGlobalControllerLogic.isCtrlKeyPressed = true;
                }
            });
            $(document).keyup(function (e) {
                if (e.keyCode == 16) {
                    SvgGlobalControllerLogic.isShiftKeyPressed = false;
                } else if (e.keyCode === 46 && !AnnotationApplication.CanvasController.isUserTyping) { // del

                //     var msg = {
                //         exchangeId: AnnotationApplication.documentVersionId,
                //         event: {
                //             eventType: "deleteAnnotationKey",
                //             value: {
                //                 point:{
                //                     x:x,
                //                     y:y
                //                 },
                //                 object: svgClass.type,
                //                 annotationId: svgClass.annotationId
                //             }
                //         }
                //   }
                    dataExchange.sendParentMessage('deleteAnnotationKey', SvgGlobalControllerLogic.selectedIds2);

                    // AnnotationApplication.CRUDController.deleteAnnotations(SvgGlobalControllerLogic.selectedIds2).then(
                    //     data => {

                    //     },
                    //     err => {

                    //     }
                    // );
                } else if (e.keyCode === 17) { //ctrl
                    SvgGlobalControllerLogic.isCtrlKeyPressed = false;
                } else if (e.keyCode === 67 && SvgGlobalControllerLogic.isCtrlKeyPressed && !AnnotationApplication.CanvasController.isUserTyping) { // c + ctrl

                    try {
                        try {
                            if (SvgGlobalControllerLogic.selectedIds2.length > 0) {
                                SvgGlobalControllerLogic.copyAnnotationsToSession(SvgGlobalControllerLogic.selectedIds2);
                            } else {
                                //SvgGlobalControllerLogic.copyAnnotationsToSession([]);
                            }
                            //AnnotationApplication.CopyPaste.copyAnnotation(this.mesh);
                        } catch (ex) {
                            console.error("copy annotations issue!");
                        }


                        // if (SvgGlobalControllerLogic.allSelectedObjects.length > 1) {
                        //     SvgGlobalControllerLogic.allSelectedObjects = SvgGlobalControllerLogic.allSelectedObjects.filter(s => s.type !== null
                        //         && !(['emsgroup'].includes(s.getAnnotationType()) && s.type === "image"));
                        //     SvgGlobalControllerLogic.copyAnnotationsToSession(SvgGlobalControllerLogic.allSelectedObjects);
                        // } else {
                        //     SvgGlobalControllerLogic.copyAnnotationsToSession([SvgGlobalControllerLogic.selectedObject.element]);
                        // }
                        //AnnotationApplication.CopyPaste.copyAnnotation(this.mesh);
                    } catch (ex) {
                        console.error("copy annotations issue!");
                    }




                    /*
                    if (SvgGlobalControllerLogic.selectedObject.element != null) {
                        var element = SvgGlobalControllerLogic.selectedObject.element;
                        SvgGlobalControllerLogic.copyAnnotationsToSession([element]);
                    } else if (SvgGlobalControllerLogic.allSelectedObjects.length > 0) {
                        var annIds = [];
                        SvgGlobalControllerLogic.allSelectedObjects.forEach(function (el) {
                            if (el !== null) annIds.push(el.getDocumentAnnotationId());
                        });
                        SvgGlobalControllerLogic.allSelectedObjects = SvgGlobalControllerLogic.allSelectedObjects.filter(s => s.type !== null);
                        try {
                            SvgGlobalControllerLogic.copyAnnotationsToSession(SvgGlobalControllerLogic.allSelectedObjects);
                        } catch (ex) {
                            console.error("Something went wrong when deleting!", annIds);
                        }
                        SvgGlobalControllerLogic.allSelectedObjects = [];
                    }
                    */
                } else if (e.keyCode === 86 && SvgGlobalControllerLogic.isCtrlKeyPressed && !AnnotationApplication.CanvasController.isUserTyping) { // v + ctrl
                    SvgGlobalControllerLogic.GetAnnotationsInSession().then(
                        annotations => {
                            //SvgGlobalControllerLogic.PasteAnnotations(annotations, event);
                            var pageNumber = PDFViewerApplication.pdfViewer.currentPageNumber;
                            SvgGlobalControllerLogic.selectedIds2=[];
                            annotations.forEach(function (ann) {
                                if(typeof ann !== 'undefined' && ann !== null){
                                    if(typeof SvgGlobalControllerLogic.annotations2[ann.DocumentAnnotationId] !== 'undefined'){
                                        SvgGlobalControllerLogic.annotations2[ann.DocumentAnnotationId].paste(null, pageNumber);
                                    }else{
                                        SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas
                                        .addToPaper(ann, PDFViewerApplication.pdfViewer.currentPageNumber, true);
                                    }
                                }
                                
                            });

                        },
                        err => {
                            console.error(err);
                        }
                    );




                    // var annotationsToPaste = SvgGlobalControllerLogic.GetAnnotationsInSession().then(
                    //     result => {
                    //         SvgGlobalControllerLogic.PasteAnnotations(result, e);

                    //     },
                    //     error => console.log(error)
                    // );
                    SvgGlobalControllerLogic.isCtrlKeyPressed = false;
                } else if (e.keyCode === 27 && AnnotationApplication.CanvasController && !AnnotationApplication.CanvasController.isUserTyping) { // ESC
                    //clear selected object
                    SvgGlobalControllerLogic.selectedObject = {
                        element: null,
                        svgController: null
                    };
                    // clear selected objects
                    SvgGlobalControllerLogic.allSelectedObjects = [];
                    // clear controls
                    SvgGlobalControllerLogic.clearAllJoints();
                    // skip drawing mode
                    var svgControllers = SvgGlobalControllerLogic.all.map(s => s.canvas);
                    AnnotationApplication.RightSidebarController.closeSidebar();
                    svgControllers.forEach(function (svgC) {
                        svgC.restoreMask(null);
                        svgC.stopDrawing();
                    });
                    //AnnotationApplication.Toolbar.widget.enable("#TwoDSettingsButton", false);
                }
            });
        }

        // Arash test: New annotation object
        this.annotations = new Object();
        this.annotations2 = new Object();
        this.selectedIds2 = [];

    };

    SvgGlobalController.prototype = {
        constructor: SvgGlobalController,

        getElementsByDocumentAnnotationId: function (documentAnnotationId) {
            var result = [];
            SvgGlobalControllerLogic.all.filter(s => s.canvas).forEach(svgCtrl => {
                svgCtrl.canvas.paper.forEach(function (element) {
                    if (element.getDocumentAnnotationId() === documentAnnotationId) {
                        result.push(element);
                    }
                });
            });
            return result;
        },

        getAllPapers: function () {
            var papers = SvgGlobalControllerLogic.all.map(s => s.canvas.paper);
            return papers;
        },

        updateAllEmsAnnotationsStatus: function () {
            var papers = SvgGlobalControllerLogic.getAllPapers();
            // papers.forEach(function (paper) {
            //     var rects = [];
            //     paper.forEach(function (element) {
            //         if (element.type === "rect") rects.push(element);
            //     });

            //     rects.forEach(function (rect) {
            //         if (["emselement", "emsgroup"].includes(rect.getAnnotationType())) {
            //             try {
            //                 //var emsNode = TreeView_L.getTreeItemById(rect.data("EMSNodeId"));
            //                 var status = FilterStatusesLogic.GetCurrentEmsNodeStatus(rect.data("EMSNodeId"));
            //                 var color = FilterStatusesLogic.GetStatusColorHex(status);
            //                 if (rect.attr("fill") !== "none" && rect.attr("fill") !== "" && rect.attr("fill") !== null) {
            //                     rect.attr("fill", color);
            //                 }
            //                 rect.attr("stroke", color);
            //             } catch (ex) {
            //                 console.error(ex);
            //             }
            //         }
            //     });
            // });
var ts = new Date();
            Object.keys(SvgGlobalControllerLogic.annotations2).forEach(function (id) {
                var svgObject = SvgGlobalControllerLogic.annotations2[id];
                if (svgObject.type === 'emsgroup') {
                    var resume = true;
                    try{
                        var status = emsData[svgObject.emsNodeId].CurrentStatus;// var status = window.parent.FilterStatusesLogic.GetCurrentEmsNodeStatus(svgObject.emsNodeId);
                    }catch(ex){
                        svgObject.remove();
                        resume = false;
                    }
                    if(resume){
                        
                        if(Object.keys(SvgGlobalControllerLogic.changedNodeNames).indexOf(svgObject.emsNodeId) !== -1  ){
                            var name = SvgGlobalControllerLogic.changedNodeNames[svgObject.emsNodeId];
                            if(name !== svgObject.element.text.attr("text"))SvgGlobalControllerLogic.updateEmsNodeText(svgObject.emsNodeId, name);
                        }
                        var color = emsData[svgObject.emsNodeId].Color;// window.parent.FilterStatusesLogic.GetStatusColorHex(status);
                        svgObject.element.rect1.attr("fill", color);
                        if(svgObject.element.rect2 !== null)svgObject.element.rect2.attr("stroke", color);
                    }
                    
                }
            });
console.log("update emsgroup", new Date() - ts);
ts = new Date();
            Object.keys(SvgGlobalControllerLogic.annotations2).forEach(function (id) {
                var svgObject = SvgGlobalControllerLogic.annotations2[id];
                if (svgObject.type === 'defect' && svgObject.element.rect1.type !== null) {
                    var oldElement = svgObject.element;
                    var resume = true;
                    try{
                        var status = emsData[svgObject.defectId].CurrentStatus;// window.parent.FilterStatusesLogic.GetCurrentEmsNodeStatus(svgObject.defectId);
                    }catch(ex){
                        svgObject.remove();
                        resume = false;
                    }
                    
                    if(resume){
                        if(Object.keys(SvgGlobalControllerLogic.changedNodeNames).indexOf(svgObject.defectId) !== -1 ){
                            var name = SvgGlobalControllerLogic.changedNodeNames[svgObject.emsNodeId];
                            if(name !== svgObject.element.text.attr("text"))SvgGlobalControllerLogic.updateEmsNodeText(svgObject.defectId, name);
                        }
                        var color = emsData[svgObject.defectId].Color; //window.parent.FilterStatusesLogic.GetStatusColorHex(status);
                        var newElement = svgObject.draw(
                            color,
                            svgObject.element.rect1.attr("x"),
                            svgObject.element.rect1.attr("y"),
                            svgObject.element.rect1.attr("width"),
                            svgObject.element.rect1.attr("height")
                        );
                        oldElement.text.remove();
                        oldElement.rect1.remove();
                        oldElement.pin.remove();
                        svgObject.element = newElement;
                        SvgGlobalControllerLogic.annotations2[id].element = newElement;
                        svgObject.bindEvents();
                    }
                }
                
            });
            console.log("update defect", new Date() - ts);
            SvgGlobalControllerLogic.updateEmsNodeNames = {};
        },

        updateEmsNodeText: function (emsNodeId, text) {
            // SvgGlobalControllerLogic.all.forEach(function (svgCont) {
            //     //svgCont.canvas.forEach(function (controller) {
            //     var controller = svgCont.canvas;
            //     controller.paper.forEach(function (element) {
            //         if (element.type === "text" && element.data("EMSNodeId") === emsNodeId) {
            //             if (element.attr("text") !== text) {
            //                 element.attr("text", text);
            //                 var docAnnId = element.getDocumentAnnotationId();
            //                 var elms = SvgGlobalControllerLogic.getElementsByDocumentAnnotationId(docAnnId);
            //                 var set = controller.paper.set();
            //                 elms.forEach(function (el) {
            //                     set.push(el);
            //                 });
            //                 if (element.getAnnotationType() === "emsgroup") {
            //                     //EMS Group
            //                     set = controller.reConstructEmsGroup3(set);

            //                     elms = SvgGlobalControllerLogic.getElementsByDocumentAnnotationId(docAnnId);
            //                     set = controller.paper.set();
            //                     elms.forEach(function (el) {
            //                         set.push(el);
            //                     });

            //                     controller.updateEmsGroupOnDb(set);
            //                 } else if (element.getAnnotationType() === "emselement") {
            //                     // EMS Element
            //                     controller.updateEmsElementOnDb(set);
            //                 }
            //             }
            //         }
            //     });
            //     controller.stopDrawing();
            //     //});
            // });




            Object.keys(SvgGlobalControllerLogic.annotations2).forEach(function(id){
                var annotation = SvgGlobalControllerLogic.annotations2[id];
                // if(annotation.angle === -0){
                //     return;
                // }
                if(annotation.emsNodeId === emsNodeId){
                   // if(annotation.element.text.attrs.text != text){
                    if(annotation.type != "defect"){
                        if(annotation.element.text.matrix != null){
                    var deg = annotation.element.text.matrix.split().rotate;
                        }
                    if(typeof(deg) === 'undefined'){
                        return;
                    }
                    annotation.element.text.rotate(-deg);
                    }
                    var bbox = annotation.element.text.getBBox();
                   // var obj = annotation.update();
                    var obj = annotation.beforeUpdate();
                    //annotation.draw(obj.Left, obj.Top, obj.Width, obj.Height, obj.EMSNodeId, null, null, obj.FontSize, null, obj.Version);
                    var oldAnnotation = annotation.element;
                    
    
                    var paper = annotation.svgController.paper;
                    var currentScale = PDFViewerApplication.pdfViewer.currentScale;
                    var paperWidth = parseFloat((paper.width).replace("px", "")) / currentScale;
                    var paperHeight = parseFloat((paper.height).replace("px", "")) / currentScale;
                    if(annotation.type != "defect"){
                    if (annotation.element.rect2 !== null) {
                        
                        annotation.draw(obj.Left * paperWidth, obj.Top * paperHeight, obj.Width * paperWidth, obj.Height * paperHeight, obj.EMSNodeId, null, null, obj.FontSize, null, obj.Version);
                        
                        
                    } else {
                        annotation.draw(bbox.x, bbox.y, bbox.width, bbox.height, obj.EMSNodeId, null, null, obj.FontSize, null, obj.Version);
                    }
                }else{
                   
                    annotation.draw("", annotation.element.rect1.attr("x"),
                    annotation.element.rect1.attr("y"),
                    annotation.element.rect1.attr("width"),
                    annotation.element.rect1.attr("height"), obj.FontSize);

                }
    
                    annotation.bindEvents();
                    annotation.createMask();
                    annotation.update();
    
                    oldAnnotation.text.remove();
                    oldAnnotation.rect1.remove();
                    if(annotation.type != "defect"){
                    oldAnnotation.rect2.remove();
                    }
                    oldAnnotation.pin.remove();
                    oldAnnotation.circle.remove();
                    if (typeof oldAnnotation.qr !== 'undefined') oldAnnotation.qr.remove();
                // }else{
                //     var obj = annotation.beforeUpdate();
                //     var oldAnnotation = annotation.element;
                //     annotation.bindEvents();
                //     annotation.createMask();
                //     annotation.update();
    
                //     oldAnnotation.text.remove();
                //     oldAnnotation.rect1.remove();
                //     if(annotation.type != "defect"){
                //     oldAnnotation.rect2.remove();
                //     }
                //     oldAnnotation.pin.remove();
                //     oldAnnotation.circle.remove();
                //     if (typeof oldAnnotation.qr !== 'undefined') oldAnnotation.qr.remove();

                // }
                }
            });


        },

        CreateCloudPath: function (pointArray) {
            var path = "";
            var previousX = 0, previousY = 0;
            for (var k = 0; k < pointArray.length; k++) {
                var currentPoint = pointArray[k];
                var nextPoint = pointArray[k + 1] ? pointArray[k + 1] : pointArray[0];

                var x1, x2, y1, y2, m, x, y;

                x1 = currentPoint.x, x2 = nextPoint.x;
                y1 = currentPoint.y, y2 = nextPoint.y;

                var xs = x2 - x1;
                var ys = y2 - y1;

                var d = Math.sqrt((xs * xs) + (ys * ys));
                var dt = 20;
                //var delta = d % dt;
                path += "M" + currentPoint.x + ", " + currentPoint.y;
                /*
                if (d >= dt) {
                    if (previousX == 0) {
                        previousX = x1;
                    }
                    if (previousY == 0) {
                        previousY = y1;
                    }
         
                    path += "M" + previousX + ", " + previousY;
        /*
                    //var swap = polygon.containsPoint(new fabric.Point((x1+x2)/2 + 10, (y1+y2)/2 + 10)) ? 0 : 1;
                    //console.log(swap);
         
        /*
                    for (var i = 0; i <= d + dt; i = i + dt) {
         
                        var t = i / d;
                        var xt = ((1 - t) * x1) + (t * x2);
                        var yt = ((1 - t) * y1) + (t * y2);
         
                        var angleDeg = Math.atan2(yt - y1, xt - x1) * 180 / Math.PI;
                        var randomNumber = Math.random() * (500 - 45) + 45;
                        path += "A 10 45 " + angleDeg + " 0 1 " + xt + " " + yt;
         
         
                        //path += "A 15 " + randomNumber+" " + angleDeg + " 0 0 " + xt + " " + yt;
         
                        //path += "C " + xt + "," + yt;
         
                        previousX = xt;
                        previousY = yt;
         
                    }
                    */



                for (var j = 0; j * dt < d; j++) {
                    var stepToPoint;
                    if (Math.abs((j + 1) * dt) > d) {
                        stepToPoint = nextPoint;
                    } else {
                        stepToPoint = {
                            x: (((j + 1) * dt * xs) / d) + currentPoint.x,
                            y: (((j + 1) * dt * ys) / d) + currentPoint.y
                        }
                    }
                    var angleDeg = Math.atan2(nextPoint.y - currentPoint.y, nextPoint.x - currentPoint.x) * 180 / Math.PI;
                    path += "A 20 45 " + angleDeg + " 0 1 " + stepToPoint.x + " " + stepToPoint.y;
                }


                /*
                        } else {
                            path += "L " + x2 + " " + y2;
                
                        }
                */
            }

            //console.log(Raphael.parsePathString(path));
            return path;
        },

        getSvgController: function (pageNumber) {
            return SvgGlobalControllerLogic.all.find(s => s.page === pageNumber);
        },

        refreshPageAnnotations: function (pageNumber) {
            try {
                SvgGlobalControllerLogic.getSvgController(pageNumber).canvas.paper.clear();
                SvgGlobalControllerLogic.RenderSvgAnnotations(pageNumber, false);
            } catch (ex) {
                console.error("rerendering a page which is not visible yet!");
            }
        },
        reloadPageAnnotations: function (pageNumber) {
            try {
               
                SvgGlobalControllerLogic.RenderSvgAnnotations(pageNumber, false, true);
            } catch (ex) {
                console.error("rerendering a page which is not visible yet!");
            }
        },

        getCurrentSvgCanvasPage: function (t) {
            return parseInt($(t).parent()[0].id.replace('raphael', ''));
        },

        clearAllJoints: function (keepSelectedElements) {
            var svgControllers = SvgGlobalControllerLogic.all.map(s => s.canvas);
            svgControllers.forEach(function (svgC) {
                svgC.clearAllCtrlBoxes(keepSelectedElements);
                svgC.clearAllJoints();
            });

            Object.keys(SvgGlobalControllerLogic.annotations2).forEach(function (id) {
                SvgGlobalControllerLogic.annotations2[id].removeHandles();
            });
        },

        RenderSvgAnnotations: function (pageNumber, fromLocal, delayClearingAnnotations = false) {

            if (SvgGlobalControllerLogic.all.filter(s => s.page === pageNumber).length === 0) {

            }

            SvgControllerLogic = new SvgController(pageNumber);
            //SvgControllerLogic.loadFromFabricJs(SvgGlobalControllerLogic.canvases[pageNumber - 1]._objects);
            var docverId = typeof (AnnotationApplication.documentVersionId) !== 'undefined' ? AnnotationApplication.documentVersionId : AnnotationApplication.documentVersionId;
            //SvgGlobalControllerLogic.getSvgAnnotations(docverId, SvgControllerLogic.pageNumber, function (response) {

            // in case of shred viewer
            if (ROLE === "Anonymous") {
                try {
                    console.log(documentAnnotation);
                    var annotations = documentAnnotation;
                    var pageAnns = annotations.filter(a => a.PageNumber === pageNumber);

                    SvgGlobalControllerLogic.allDbAnnotations.push({
                        annotations: pageAnns,
                        page: pageNumber,
                        documentVersionId: AnnotationApplication.documentVersionId
                    });

                    if (annotations !== "") {
                        LocalAnnotationsControllerLogic.addManyAnnotation(
                            AnnotationApplication.documentVersionId,
                            pageNumber,
                            pageAnns,
                            this,
                            null);
                    }
                    fromLocal = true;
                } catch (ex) {
                    console.error(ex);
                }
            }

            if (fromLocal) {
                SvgControllerLogic.reLoadSvgAnnotations();
            } else {
                if(delayClearingAnnotations){
                    SvgControllerLogic.RefreshSvgAnnotationsByPage(SvgControllerLogic.pageNumber); 
                }
                else {
                SvgControllerLogic.loadSvgAnnotationsByPage(SvgControllerLogic.pageNumber);
                }
            }

            //});
        },

        ReDrawSvgAnnotations: function (pageNumber) {
            $("#pageContainer" + pageNumber).children(".textLayer").prepend('<div id="raphael' + pageNumber + '"></div>');
            console.log("created raphael" + pageNumber);

            this.paper = Raphael(document.getElementById("raphael" + pageNumber), this.width, this.height);
            var svgCont = SvgGlobalControllerLogic.getSvgController(pageNumber);
            svgCont.canvas.reLoadSvgAnnotations();
        },

        getSvgAnnotations: function (documentVersionId, pageNumber, callback) {
            LocalAnnotationsControllerLogic.getAnnotationsFromBackend(documentVersionId, pageNumber)
                .then(
                    result => {
                        callback(result);
                    },
                    error => {
                        console.error(error);
                    }
                );
        },
        clearAndGetSvgAnnotations: function (documentVersionId, pageNumber, callback) {
            LocalAnnotationsControllerLogic.getAnnotationsFromBackend(documentVersionId, pageNumber)
                .then(
                    result => {
                        SvgGlobalControllerLogic.getSvgController(pageNumber).canvas.paper.clear();
                        callback(result);
                    },
                    error => {
                        console.error(error);
                    }
                );
        },

        showQrCodes: function () {
            SvgGlobalControllerLogic.all.forEach(function (controller) {
                controller.canvas.paper.forEach(function (element) {
                    if (element.type === "image" && ['emsgroup', 'emselement'].includes(element.data("AnnotationType"))) {
                        element.show();
                    }
                });
            });
        },

        hideQrCodes: function () {
            SvgGlobalControllerLogic.all.forEach(function (controller) {
                controller.canvas.paper.forEach(function (element) {
                    if (element.type === "image" && ['emsgroup', 'emselement'].includes(element.data("AnnotationType"))) {
                        element.hide();
                    }
                });
            });
        },

        copyAnnotationsToSession: function (documentAnnotationIds) {
            //if (loadedModule === "EMS") return;
            try {
                // var that = this;
                // var documentAnnotationIds = [];
                // elements.forEach(function (element) {
                //     element = element.element ? element.element : element;
                //     if (element.type === "set") {
                //         element.forEach(function (el) {
                //             if (el.type === "set") {
                //                 el.forEach(function (e) {
                //                     if (e.getDocumentAnnotationId() !== "") {
                //                         documentAnnotationIds.push(e.getDocumentAnnotationId());
                //                     }
                //                 });
                //             } else if (['texttagimage', 'texttagrect'].includes(el.getAnnotationType())) {
                //                 // we are not cpying texttag as it doesn't make any sense
                //             } else {
                //                 if (el.getDocumentAnnotationId() !== "") {
                //                     documentAnnotationIds.push(el.getDocumentAnnotationId());
                //                 }
                //             }

                //         });
                //     }else if(Object.keys(element).length>1){
                //         documentAnnotationIds.push(element[Object.keys(element)[0]].getDocumentAnnotationId());
                //     } else if (['texttagimage', 'texttagrect'].includes(element.getAnnotationType())) {
                //         // we are not cpying texttag as it doesn't make any sense
                //     } else {
                //         documentAnnotationIds.push(element.getDocumentAnnotationId());
                //     }
                // });

                // if (documentAnnotationIds.length > 0) {
                //     function onlyUnique(value, index, self) {
                //         return self.indexOf(value) === index;
                //     }

                //     // usage example:
                //     documentAnnotationIds = documentAnnotationIds.filter(function (value, index, self) {
                //         return self.indexOf(value) === index;
                //     });
                // }


                if (documentAnnotationIds.length === 0 || documentAnnotationIds === undefined) return;
                $.ajax({
                    type: 'POST',
                    url: '/Annotation/CopyToSession',
                    data: {
                        annotationIds: documentAnnotationIds
                    },
                    success: function (response) {
                        console.log(response);
                        /*
                        that.GetAnnotationsInSession().then(
                            result => console.log(result),
                            error => console.log(error)
                        );
                        */
                    },
                    error: function (err) {
                        //console.log(err);
                    }
                });
            } catch (ex) {
                console.error(ex);
            }
        },

        GetAnnotationsInSession: function () {
            return new Promise(function (resolve, reject) {
                $.ajax({
                    type: 'GET',
                    url: '/Annotation/PasteFromSession',
                    data: {
                        pasteFromCut: false
                    },
                    success: function (response) {
                        resolve(JSON.parse(response));
                    },
                    error: function (err) {
                        reject(new Error(err));
                    }
                });
            });
        },

        getXY: function (event, scaleFactor) {
            var pageNumber = 0;
            if (Object.keys(event).includes("currentTarget")) {
                pageNumber = parseInt($(event.currentTarget).parent().prop('id').replace("raphael", ""));
            } else {
                // iPad
                pageNumber = parseInt($(event.target).parent().prop('id').replace("raphael", ""));
            }
            // var pageNumber = parseInt($(event.currentTarget).parent().prop('id').replace("raphael", ""));
            var that = this.getSvgController(pageNumber).canvas;
            var rotation = PDFViewerApplication.pdfViewer.getPageView(that.pageNumber - 1).rotation;
            var paperWidth = (typeof that.paper.width === "number") ? that.paper.width : parseInt(that.paper.width.replace("px", ""));
            var paperHeight = (typeof that.paper.height === "number") ? that.paper.height : parseInt(that.paper.height.replace("px", ""));
            if (typeof scaleFactor === "undefined" || isNaN(scaleFactor)) {
                scaleFactor = 1;
            }
            var layerX;
            var layerY;
            if ("layerX" in event) {
                layerX = event.layerX;
                layerY = event.layerY;
            } else if ("srcEvent" in event) {
                layerX = event.srcEvent.layerX;
                layerY = event.srcEvent.layerY;
            } else {
                layerX = event.originalEvent.layerX;
                layerY = event.originalEvent.layerY;
            }
            if (true || navigator.userAgent.search("Firefox") >= 0) {
                //console.log("Firefox", rotation);
                switch (rotation) {
                    case 0:
                        return {
                            x: layerX * scaleFactor,
                            y: layerY * scaleFactor
                        };
                        break;
                    case 90:
                        return {
                            /*
                            y: paperHeight - layerX * scaleFactor,
                            x: layerY * scaleFactor
                            */
                            y: (paperHeight - layerX) * scaleFactor,
                            x: layerY * scaleFactor
                        };
                        break;
                    case 180:
                        return {
                            x: (paperWidth - layerX) * scaleFactor,
                            y: (paperHeight - layerY) * scaleFactor
                        };
                        break;
                    case 270:
                        var position = $("#raphael" + this.pageNumber).position();
                        var left = parseInt($("#raphael" + this.pageNumber).css("left"));
                        var top = parseInt($("#raphael" + this.pageNumber).css("top"));
                        //console.log(position);
                        return {
                            y: (layerX) * scaleFactor,
                            x: (paperWidth - layerY) * scaleFactor
                        };
                        break;
                    case 360:
                        return {
                            x: layerX * scaleFactor,
                            y: layerY * scaleFactor
                        };
                        break;

                }
                return {
                    x: layerX * scaleFactor,
                    y: paperHeight - layerY * scaleFactor
                };
            } else {
                return {
                    x: event.offsetX * scaleFactor,
                    y: event.offsetY * scaleFactor
                };
            }
        },

        getDXDY: function (_dx, _dy, scaleFactor) {
            var that = this;
            var rotation = PDFViewerApplication.pdfViewer.getPageView(that.pageNumber - 1).rotation;
            var paperWidth = (typeof that.paper.width === "number") ? that.paper.width : parseInt(that.paper.width.replace("px", ""));
            var paperHeight = (typeof that.paper.height === "number") ? that.paper.height : parseInt(that.paper.height.replace("px", ""));
            if (typeof scaleFactor === "undefined" || isNaN(scaleFactor)) {
                scaleFactor = 1;
            }
            var layerX;
            var layerY;
            if ("layerX" in event) {
                layerX = event.layerX;
                layerY = event.layerY;
            } else {
                layerX = event.originalEvent.layerX;
                layerY = event.originalEvent.layerY;
            }
            if (true || navigator.userAgent.search("Firefox") >= 0) {
                //console.log("Firefox", rotation);
                switch (rotation) {
                    case 0:
                        return {
                            dx: _dx,
                            dy: _dy
                        };
                        break;
                    case 90:
                        return {
                            /*
                            y: paperHeight - layerX * scaleFactor,
                            x: layerY * scaleFactor
                            */
                            dy: -_dx,
                            dx: _dy
                        };
                        break;
                    case 180:
                        return {
                            dx: -_dx,
                            dy: -_dy
                        };
                        break;
                    case 270:
                        return {
                            dy: _dx,
                            dx: -_dy
                        };
                        break;
                    case 360:
                        return {
                            dx: _dx,
                            dy: _dy
                        };
                        break;

                }
                return {
                    dx: _dx,
                    dy: _dy
                };
            } else {
                return {
                    dx: _dx,
                    dy: _dy
                };
            }
        },

        PasteAnnotations: function (annotations, e) {
            var that = this;
            var pageNumber = PDFViewerApplication.pdfViewer.currentPageNumber;
            if (typeof e.mesh !== 'undefined') {
                pageNumber = parseInt($(e.mesh).parent().prop('id').replace("raphael", ""));
            }

            var svController = this.getSvgController(pageNumber).canvas;
            var rotation = PDFViewerApplication.pdfViewer.getPageView(pageNumber - 1).rotation;

            try {
                //var paper = SvgGlobalControllerLogic.currentRightClickedObject.element.paper;
                //var mySvgController = SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber);
                //var pageNumber = PDFViewerApplication.pdfViewer.currentPageNumber
                var currentScale = PDFViewerApplication.pdfViewer.currentScale;

                annotations.forEach(function (element) {
                    //pageNumber = PDFViewerApplication.pdfViewer.currentPageNumber
                    pageNumber = SvgGlobalControllerLogic.activePageNumber !== null
                        ? SvgGlobalControllerLogic.activePageNumber
                        : PDFViewerApplication.pdfViewer.currentPageNumber;
                    var paperWidth = parseFloat((SvgGlobalControllerLogic.all.filter(s => s.page === pageNumber)[0].canvas.paper.width).replace("px", ""));
                    var paperHeight = parseFloat((SvgGlobalControllerLogic.all.filter(s => s.page === pageNumber)[0].canvas.paper.height).replace("px", ""));
                    if ([90, 270].includes(rotation)) {
                        var tempPaperWidth = paperWidth;
                        var tempPaperHeight = paperHeight;
                        paperHeight = tempPaperWidth;
                        paperWidth = tempPaperHeight;
                    }




                    if (annotations.length < 2) {
                        if (e.event !== undefined && e.event.pointerType !== undefined && e.event.pointerType !== "mouse") {
                            var pageNumber = SvgGlobalControllerLogic.activePageNumber !== null
                                ? SvgGlobalControllerLogic.activePageNumber
                                : PDFViewerApplication.pdfViewer.currentPageNumber;
                            var myoffset = SvgGlobalControllerLogic.all.filter(s => s.page === pageNumber)[0].canvas.getTouchOffset($("#pageContainer" + pageNumber + ":first"));
                            var l = e.event.changedPointers[0].pageX - myoffset.left;
                            var t = e.event.changedPointers[0].pageY - myoffset.top;

                            element.Left = l / paperWidth;
                            element.Top = t / paperHeight;

                            x = that.getXY(e.event, 1).x;// /PDFViewerApplication.pdfViewer.currentScale).x;
                            y = that.getXY(e.event, 1).y;/// /PDFViewerApplication.pdfViewer.currentScale).y;


                            switch (rotation) {
                                case 0:
                                    element.Left = x / paperWidth;
                                    element.Top = y / paperHeight;
                                    break;
                                case 90:
                                    element.Left = (x / paperHeight);
                                    element.Top = (y / paperWidth) - (element.Height !== null ? element.Height : 0);
                                    break;
                                case 180:
                                    element.Left = (x / paperWidth) - (element.Width !== null ? element.width : 0);
                                    element.Top = (y / paperHeight) - (element.Height !== null ? element.Height : 0);
                                    break;
                                case 270:
                                    element.Left = (x / paperHeight) - (element.Width !== null ? element.width : 0);
                                    element.Top = (y / paperWidth);
                                    break;
                                case 360:
                                    element.Left = x / paperWidth;
                                    element.Top = y / paperHeight;
                                    break;
                            }

                        } else {
                            var x, y;
                            if (Object.keys(e).indexOf('currentTarget') === -1) {
                                x = that.getXY(e.event, 1).x;// / PDFViewerApplication.pdfViewer.currentScale).x;
                                y = that.getXY(e.event, 1).y // / PDFViewerApplication.pdfViewer.currentScale).y;


                                switch (rotation) {
                                    case 0:
                                        element.Left = x / paperWidth;
                                        element.Top = y / paperHeight;
                                        break;
                                    case 90:
                                        element.Left = (x / paperHeight);
                                        element.Top = (y / paperWidth) - (element.Height !== null ? element.Height : 0);
                                        break;
                                    case 180:
                                        element.Left = (x / paperWidth) - (element.Width !== null ? element.width : 0);
                                        element.Top = (y / paperHeight) - (element.Height !== null ? element.Height : 0);
                                        break;
                                    case 270:
                                        element.Left = (x / paperHeight) - (element.Width !== null ? element.width : 0);
                                        element.Top = (y / paperWidth);
                                        break;
                                    case 360:
                                        element.Left = x / paperWidth;
                                        element.Top = y / paperHeight;
                                        break;
                                }
                            }
                        }
                    }


                    if (element.Points !== null && element.Points.length > 0 && annotations.length < 2) {
                        if (Object.keys(e).indexOf('currentTarget') === -1) {
                            var firstPoint = {
                                x: element.Points[0].X,
                                y: element.Points[0].Y
                            }
                            var x = that.getXY(e.event, 1).x/// PDFViewerApplication.pdfViewer.currentScale).x;
                            var y = that.getXY(e.event, 1).y; // / PDFViewerApplication.pdfViewer.currentScale).y;
                            for (var i = 0; i < element.Points.length; i++) {
                                if (i === 0) {
                                    element.Points[i].X = x / paperWidth;
                                    element.Points[i].Y = y / paperHeight;


                                    switch (rotation) {
                                        case 0:
                                            element.Points[i].X = x / paperWidth;
                                            element.Points[i].Y = y / paperHeight;
                                            break;
                                        case 90:
                                            element.Points[i].X = (x / paperHeight);
                                            element.Points[i].Y = (y / paperWidth) - (element.Height !== null ? element.Height : 0);
                                            break;
                                        case 180:
                                            element.Points[i].X = (x / paperWidth) - (element.Width !== null ? element.width : 0);
                                            element.Points[i].Y = (y / paperHeight) - (element.Height !== null ? element.Height : 0);
                                            break;
                                        case 270:
                                            element.Points[i].X = (x / paperHeight) - (element.Width !== null ? element.width : 0);
                                            element.Points[i].Y = (y / paperWidth);
                                            break;
                                        case 360:
                                            element.Points[i].X = x / paperWidth;
                                            element.Points[i].Y = y / paperHeight;
                                            break;
                                    }


                                } else {
                                    var dx = element.Points[i].X - firstPoint.x;
                                    var dy = element.Points[i].Y - firstPoint.y;
                                    element.Points[i].X = (x / paperWidth) + dx;
                                    element.Points[i].Y = (y / paperHeight) + dy;


                                    switch (rotation) {
                                        case 0:
                                            element.Points[i].X = (x / paperWidth) + dx;
                                            element.Points[i].Y = (y / paperHeight) + dy;
                                            break;
                                        case 90:
                                            element.Points[i].X = (x / paperHeight) + dx;
                                            element.Points[i].Y = (y / paperWidth) - (element.Height !== null ? element.Height : 0) + dy;
                                            break;
                                        case 180:
                                            element.Points[i].X = (x / paperWidth) - (element.Width !== null ? element.width : 0) + dx;
                                            element.Points[i].Y = (y / paperHeight) - (element.Height !== null ? element.Height : 0) + dy;
                                            break;
                                        case 270:
                                            element.Points[i].X = (x / paperHeight) - (element.Width !== null ? element.width : 0) + dx;
                                            element.Points[i].Y = (y / paperWidth) + dy;
                                            break;
                                        case 360:
                                            element.Points[i].X = x / paperWidth + dx;
                                            element.Points[i].Y = y / paperHeight + dy;
                                            break;
                                    }
                                }
                            }
                        }
                    }
                    element.PageNumber = pageNumber;
                    var svgCont = SvgGlobalControllerLogic.getSvgController(pageNumber);
                    //mySvgController.canvas.addToPaper(element, pageNumber, true);

                    svgCont.canvas.addToPaper(element, pageNumber, true);



                });
                if (AnnotationApplication.Toolbar && AnnotationApplication.Toolbar.showQR) {
                    SvgGlobalControllerLogic.disableEmsQr();
                    SvgGlobalControllerLogic.enableEmsQr();
                }

                var annList = $("#annotationListContainer");
                if (annList.length > 0) {
                    AnnotationApplication.RightSidebarController.showAnnotationList();
                }

            } catch (ex) {
                console.error(ex);
            }

        },

        RemoveDocumentFrom_AllDbAnnotations: function (docVerId) {
            var newAllDb = [];
            var newAll = [];

            SvgGlobalControllerLogic.allDbAnnotations.forEach(function (doc) {
                if (doc.documentVersionId !== docVerId) {
                    newAllDb.push(doc);
                }
            });

            SvgGlobalControllerLogic.all.forEach(function (doc) {
                if (doc.documentVersionId !== docVerId) {
                    newAll.push(doc);
                }
            });

            SvgGlobalControllerLogic.allDbAnnotations = newAllDb;
            SvgGlobalControllerLogic.all = newAll;
        },

        enableHammerPan: function () {
            SvgGlobalControllerLogic.all.forEach(function (item) {
                SvgGlobalControllerLogic.all.forEach(function (item) {
                    item.canvas.hammer.get('pan').set({ enable: true });
                });
            });
        },

        disableHammerPan: function () {
            SvgGlobalControllerLogic.all.forEach(function (item) {
                item.canvas.hammer.get('pan').set({ enable: false });
            });
        },

        generateElementQr: function(svgObject, callback){
            try {
                var controller = svgObject.svgController;
                var paper = controller.paper;
                //var localAnnotation = LocalAnnotationsControllerLogic.getAnnotationById(AnnotationApplication.documentVersionId, svgObject.pageNumber, svgObject.annotationId);
                if (typeof svgObject.element.qr !== 'undefined') {
                    // we have QR data
                    svgObject.element.qr.show();

                } else {
                    // we don't have Qr data
                    var emsNodeId = svgObject.emsNodeId;
                    controller.generateQrCode(emsNodeId, function (data) {
                        var Src = data;
                        var currentScale = PDFViewerApplication.pdfViewer.currentScale;
                        var textBbox = svgObject.element.rect1.getBBox();

                        var t = textBbox.y;
                        var l = textBbox.x;
                        var angle = controller.getPageRotation();
                        var baseAngle = -1 * svgObject.baseAngle;

                        switch (angle) {
                            case 0: // 0 or 180 degree difference
                                switch (Math.abs(baseAngle)) {
                                    case 0:
                                        l = l;
                                        t = t + textBbox.height + 3;
                                        break;
                                    case 90:
                                        l = l + textBbox.width + 3;
                                        t = t + (textBbox.height - 0.5 * 150);
                                        break;
                                    case 180:
                                        l = l + (textBbox.width - 0.5 * 150);// - textBbox.width;
                                        t = t - 0.5 * 150 - 3;
                                        break;
                                    case 270:
                                        l = l - 0.5 * 150 - 3;
                                        t = t;// + textBbox.height;
                                        break;
                                }
                                break;
                            case 90:
                                switch (Math.abs(baseAngle)) {
                                    case 0:
                                        l = l;
                                        t = t + textBbox.height + 3;
                                        break;
                                    case 90:
                                        l = l + textBbox.width + 3;
                                        t = t + (textBbox.height - 0.5 * 150);
                                        break;
                                    case 180:
                                        l = l + (textBbox.width - 0.5 * 150);// - textBbox.width;
                                        t = t - 0.5 * 150 - 3;
                                        break;
                                    case 270:
                                        l = l - 0.5 * 150 - 3;
                                        t = t;// + textBbox.height;
                                        break;
                                }
                                break;
                            case 180:
                                switch (Math.abs(baseAngle)) {
                                    case 0:
                                        l = l;
                                        t = t + textBbox.height + 3;
                                        break;
                                    case 90:
                                        l = l + textBbox.width + 3;
                                        t = t + (textBbox.height - 0.5 * 150);
                                        break;
                                    case 180:
                                        l = l + (textBbox.width - 0.5 * 150);// - textBbox.width;
                                        t = t - 0.5 * 150 - 3;
                                        break;
                                    case 270:
                                        l = l - 0.5 * 150 - 3;
                                        t = t;// + textBbox.height;
                                        break;
                                }
                                break;
                            case 270:
                                switch (Math.abs(baseAngle)) {
                                    case 0:
                                        l = l;
                                        t = t + textBbox.height + 3;
                                        break;
                                    case 90:
                                        l = l + textBbox.width + 3;
                                        t = t + (textBbox.height - 0.5 * 150);
                                        break;
                                    case 180:
                                        l = l + (textBbox.width - 0.5 * 150);// - textBbox.width;
                                        t = t - 0.5 * 150 - 3;
                                        break;
                                    case 270:
                                        l = l - 0.5 * 150 - 3;
                                        t = t;// + textBbox.height;
                                        break;
                                }
                                break;
                        }

                        //paper.ellipse(l,t,4,4).attr("fill","red");
                        //var img = paper.image(data, textBbox.x - 3, textBbox.y + textBbox.height + 3, 0.5 * 150, 0.5 * 150);
                        var img = paper.image(
                            Src,
                            l,
                            t,
                            0.5 * 150,
                            0.5 * 150);
                        img.data("AnnotationType", "emsgroup");
                        img.data("DocumentAnnotationId", svgObject.annotationId);
                        img.rotate(baseAngle);
                        svgObject.element.qr = img;
                        svgObject.bindEvents(svgObject.element.qr);
                        if(callback)callback();
                    });
                }

            } catch (ex) {
                // handle error
                console.error(ex);
            }
        },

        enableEmsQr: function () {
            var that = this;
            Object.keys(SvgGlobalControllerLogic.annotations2).forEach(function (id) {
                var svgObject = SvgGlobalControllerLogic.annotations2[id];
                if (['emsgroup', 'emselement'].includes(svgObject.type.toLocaleLowerCase())) {
                    console.log(svgObject.annotationId);
                    that.generateElementQr(svgObject);
                }

            });






            // SvgGlobalControllerLogic.all.forEach(function (item) {
            //     var controller = item.canvas;
            //     var paper = controller.paper;
            //     paper.forEach(function (el) {
            //         try {
            //             if (el.type === "text" && ['emsgroup', 'emselement'].includes(el.getAnnotationType())) {
            //                 var localAnnotation = LocalAnnotationsControllerLogic.getAnnotationById(AnnotationApplication.documentVersionId, controller.pageNumber, el.getDocumentAnnotationId());
            //                 if (localAnnotation.Src !== null && localAnnotation.Src !== "" && localAnnotation.Src !== undefined) {
            //                     // we have QR data
            //                     var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            //                     var textBbox = el.getBBox();

            //                     var t = textBbox.y;
            //                     var l = textBbox.x;
            //                     var angle = controller.getPageRotation();
            //                     var baseAngle = -1 * el.getAngle();
            //                     switch (angle) {
            //                         case 0: // 0 or 180 degree difference
            //                             switch (baseAngle) {
            //                                 case 0:
            //                                     l = l;
            //                                     t = t + textBbox.height + 3;
            //                                     break;
            //                                 case 90:
            //                                     l = l + textBbox.width + 3;
            //                                     t = t;
            //                                     break;
            //                                 case 180:
            //                                     l = l;// - textBbox.width;
            //                                     t = t - 0.5 * 150 - 3;
            //                                     break;
            //                                 case 270:
            //                                     l = l - 0.5 * 150 - 3;
            //                                     t = t;// + textBbox.height;
            //                                     break;
            //                             }
            //                             break;
            //                         case 90:
            //                             switch (baseAngle) {
            //                                 case 0:
            //                                     l = l;
            //                                     t = t + textBbox.height + 3;
            //                                     break;
            //                                 case 90:
            //                                     l = l + textBbox.width + 3;
            //                                     t = t;
            //                                     break;
            //                                 case 180:
            //                                     l = l;//+ w - textBbox.width / 2;
            //                                     t = t - 0.5 * 150 - 3;
            //                                     break;
            //                                 case 270:
            //                                     l = l - 0.5 * 150 - 3;
            //                                     t = t;//- h + textBbox.width;
            //                                     break;
            //                             }
            //                             break;
            //                         case 180:
            //                             switch (baseAngle) {
            //                                 case 0:
            //                                     l = l;
            //                                     t = t + textBbox.height + 3;
            //                                     break;
            //                                 case 90:
            //                                     l = l + textBbox.width + 3;
            //                                     t = t;
            //                                     break;
            //                                 case 180:
            //                                     l = l;//+ w - textBbox.width / 2;
            //                                     t = t - 0.5 * 150 - 3;
            //                                     break;
            //                                 case 270:
            //                                     l = l - 0.5 * 150 - 3;
            //                                     t = t;//- h + textBbox.width;
            //                                     break;
            //                             }
            //                             break;
            //                         case 270:
            //                             switch (baseAngle) {
            //                                 case 0:
            //                                     l = l;
            //                                     t = t + textBbox.height + 3;
            //                                     break;
            //                                 case 90:
            //                                     l = l + textBbox.width + 3;
            //                                     t = t;
            //                                     break;
            //                                 case 180:
            //                                     l = l;//+ w - textBbox.width / 2;
            //                                     t = t - 0.5 * 150 - 3;
            //                                     break;
            //                                 case 270:
            //                                     l = l - 0.5 * 150 - 3;
            //                                     t = t;//- h + textBbox.width;
            //                                     break;
            //                             }
            //                             break;
            //                     }


            //                     //var img = paper.image(localAnnotation.Src, textBbox.x - 3, textBbox.y + textBbox.height + 3, 0.5 * 150, 0.5 * 150);
            //                     var img = paper.image(localAnnotation.Src, l, t, 0.5 * 150, 0.5 * 150);

            //                     img.data("AnnotationType", "emsgroup");
            //                     img.data("DocumentAnnotationId", localAnnotation.DocumentAnnotationId);

            //                 } else {
            //                     // we don't have Qr data
            //                     var emsNodeId = localAnnotation.EmsNodeId;
            //                     if (typeof emsNodeId === "undefined") {
            //                         emsNodeId = localAnnotation.EMSNodeId
            //                     }
            //                     controller.generateQrCode(emsNodeId, function (data) {
            //                         localAnnotation.Src = data;

            //                         LocalAnnotationsControllerLogic.deleteAnnotation(
            //                             AnnotationApplication.documentVersionId,
            //                             controller.pageNumber,
            //                             localAnnotation,
            //                             null);

            //                         localAnnotation.Src = data;
            //                         LocalAnnotationsControllerLogic.addAnnotation(
            //                             AnnotationApplication.documentVersionId,
            //                             controller.pageNumber,
            //                             localAnnotation,
            //                             null);

            //                         var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            //                         var textBbox = el.getBBox();

            //                         var t = textBbox.y;
            //                         var l = textBbox.x;
            //                         var angle = controller.getPageRotation();
            //                         var baseAngle = -1 * el.getAngle();
            //                         switch (angle) {
            //                             case 0: // 0 or 180 degree difference
            //                                 switch (baseAngle) {
            //                                     case 0:
            //                                         l = l;
            //                                         t = t + textBbox.height + 3;
            //                                         break;
            //                                     case 90:
            //                                         l = l + textBbox.width + 3;
            //                                         t = t + (textBbox.height - 0.5 * 150);
            //                                         break;
            //                                     case 180:
            //                                         l = l + (textBbox.width - 0.5 * 150);// - textBbox.width;
            //                                         t = t - 0.5 * 150 - 3;
            //                                         break;
            //                                     case 270:
            //                                         l = l - 0.5 * 150 - 3;
            //                                         t = t;// + textBbox.height;
            //                                         break;
            //                                 }
            //                                 break;
            //                             case 90:
            //                                 switch (baseAngle) {
            //                                     case 0:
            //                                         l = l;
            //                                         t = t + textBbox.height + 3;
            //                                         break;
            //                                     case 90:
            //                                         l = l + textBbox.width + 3;
            //                                         t = t + (textBbox.height - 0.5 * 150);
            //                                         break;
            //                                     case 180:
            //                                         l = l + (textBbox.width - 0.5 * 150);// - textBbox.width;
            //                                         t = t - 0.5 * 150 - 3;
            //                                         break;
            //                                     case 270:
            //                                         l = l - 0.5 * 150 - 3;
            //                                         t = t;// + textBbox.height;
            //                                         break;
            //                                 }
            //                                 break;
            //                             case 180:
            //                                 switch (baseAngle) {
            //                                     case 0:
            //                                         l = l;
            //                                         t = t + textBbox.height + 3;
            //                                         break;
            //                                     case 90:
            //                                         l = l + textBbox.width + 3;
            //                                         t = t + (textBbox.height - 0.5 * 150);
            //                                         break;
            //                                     case 180:
            //                                         l = l + (textBbox.width - 0.5 * 150);// - textBbox.width;
            //                                         t = t - 0.5 * 150 - 3;
            //                                         break;
            //                                     case 270:
            //                                         l = l - 0.5 * 150 - 3;
            //                                         t = t;// + textBbox.height;
            //                                         break;
            //                                 }
            //                                 break;
            //                             case 270:
            //                                 switch (baseAngle) {
            //                                     case 0:
            //                                         l = l;
            //                                         t = t + textBbox.height + 3;
            //                                         break;
            //                                     case 90:
            //                                         l = l + textBbox.width + 3;
            //                                         t = t + (textBbox.height - 0.5 * 150);
            //                                         break;
            //                                     case 180:
            //                                         l = l + (textBbox.width - 0.5 * 150);// - textBbox.width;
            //                                         t = t - 0.5 * 150 - 3;
            //                                         break;
            //                                     case 270:
            //                                         l = l - 0.5 * 150 - 3;
            //                                         t = t;// + textBbox.height;
            //                                         break;
            //                                 }
            //                                 break;
            //                         }

            //                         //paper.ellipse(l,t,4,4).attr("fill","red");
            //                         //var img = paper.image(data, textBbox.x - 3, textBbox.y + textBbox.height + 3, 0.5 * 150, 0.5 * 150);
            //                         var img = paper.image(
            //                             localAnnotation.Src,
            //                             l,
            //                             t,
            //                             0.5 * 150,
            //                             0.5 * 150);
            //                         img.data("AnnotationType", "emsgroup");
            //                         img.data("DocumentAnnotationId", localAnnotation.DocumentAnnotationId);
            //                         img.rotate(baseAngle);
            //                     });
            //                 }
            //             }
            //         } catch (ex) {
            //             // handle error
            //             console.error(ex);
            //         }

            //     });
            // });
        },

        disableEmsQr: function () {
            try {
                Object.keys(SvgGlobalControllerLogic.annotations2).forEach(function (id) {
                    var svgObject = SvgGlobalControllerLogic.annotations2[id];
                    if (['emsgroup', 'emselement'].includes(svgObject.type.toLocaleLowerCase())) {
                        if (typeof svgObject.element.qr !== 'undefined') {
                            svgObject.element.qr.hide();
                        }
                    }

                });





                // var elmsToRemove = [];
                // SvgGlobalControllerLogic.all.forEach(function (controller) {

                //     controller.canvas.paper.forEach(function (element) {
                //         if (element.type === "image" && ['emsgroup', 'emselement'].includes(element.data("AnnotationType"))) {
                //             elmsToRemove.push(element);
                //         }
                //     });
                // });
                // for (var i = 0; i < elmsToRemove.length; i++) {
                //     elmsToRemove[i].remove();
                // }
            } catch (ex) {

            }

        },

        formatMeasurementText: function (value, unit) {
            // if (kendo.culture().name === "de-DE") {
            //     value = parseFloat(value.replace(',', '.'));
            // }
            switch (unit.toLowerCase()) {
                case "m":
                    var result = value.toString() + " " + unit;
                    // if (kendo.culture().name === "de-DE") {
                    //     result = result.replace('.', ',');
                    // }
                    return result;
                    break;
                case "in":
                    var result = value.toString() + " " + unit;
                    // var feetFromInches = Math.floor(value / 12);
                    // var inchesReminder = parseFloat(value % 12).toFixed(2);
                    // var fraction = Math.floor(parseFloat(inchesReminder % 1).toFixed(2) * 32);
                    // var fractionFormat;



                    // var simplifiesFraction = fraction,
                    //     simplifies32 = 32;
                    // while (simplifiesFraction % 2 === 0 && fraction !== 0) {
                    //     simplifiesFraction /= 2;
                    //     simplifies32 /= 2;
                    // }
                    // var result = "";
                    // if (fraction !== 0) {
                    //     fractionFormat = simplifiesFraction.toString() + "/" + simplifies32.toString();
                    //     result = feetFromInches + "' - " + Math.floor(inchesReminder) + " " + fractionFormat + "\"";
                    // } else {
                    //     result = feetFromInches + "' - " + Math.floor(inchesReminder) + "\"";
                    // }



                    // if (kendo.culture().name === "de-DE") {
                    //     result = result.replace('.', ',');
                    // }
                    return result;
                    break;
                case "px":
                    var result = value.toString() + " " + unit;
                    // if (kendo.culture().name === "de-DE") {
                    //     result = result.replace('.', ',');
                    // }
                    return result;
                    break;
                default:
                    return value.toString();

            }

        },

        rotatePage: function (pageNumber, degree) {
            var paper = this.getSvgController(pageNumber).canvas.paper;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;

            PDFViewerApplication.pdfViewer.getPageView(0).update(currentScale, degree);
            var paperWidth = parseInt(paper.width.replace("px", ""));
            var paperHeight = parseInt(paper.height.replace("px", ""));
            var svgLayer = $("#raphael" + pageNumber);//.children("svg")[0];

            $(svgLayer).css("transform-origin", "center center")
            $(svgLayer).css("transform", "rotate(" + 180 + "deg)");





            switch (degree) {
                case 0:

                    break;
                case 90:
                    //paper.setSize(paperHeight, paperWidth);
                    //paper.setViewBox(0,0,paperHeight, paperWidth,false);
                    //$(svgLayer).css("transform", "rotate(" + degree + "deg)");
                    break;
                case 180:
                    break;
                case 270:
                    break;
                case 360:
                    break;

            }


            if (false) {
                paper.ellipse(paperWidth / 2, paperHeight / 2, 10, 10).attr("fill", "red");
                paper.ellipse(0, 0, 10, 10).attr("fill", "green");
                paper.rect(0, 0, paperWidth, paperHeight).attr("stroke", "green");
                paper.forEach(function (item) {
                    //item.rotate(degree, paperWidth/2, paperHeight/2);
                    //item.translate(0, paperWidth-paperHeight);
                    var origX = item.attr("x") / paperWidth;
                    var origY = item.attr("y") / paperHeight;
                    var origWidth = item.attr("width") / paperWidth;
                    var origHeight = item.attr("height") / paperHeight;
                    item.attr({
                        x: (1 - origY - origHeight) * paperWidth,
                        y: origX * paperHeight,
                        width: origHeight * paperWidth,
                        height: origWidth * paperHeight,
                    });
                });
            }
            SvgGlobalControllerLogic.getSvgController(pageNumber).canvas.onPageRotated(90);
        },
        parseMeasurementText: function (origText, unit) {
            var text = origText.split(" ")[0];
            if (unit === undefined || unit === null) {
                unit = text.split(' ').length > 1 ? text.split(' ')[1] : "in";
            }
            switch (unit.toLowerCase()) {
                case "m":
                    return text.toString();
                    break;
                case "in":
                    text = origText;

                    var re = /(\d+)\'\s-\s(\d{0,2})\s*(\d{1,2}\/\d{1,2})*\"/g;
                    var parsedText = re.exec(origText);
                    var feet = parsedText[1] !== undefined ? parseInt(parsedText[1]) : 0;
                    var inch = parsedText[2] !== undefined ? parseInt(parsedText[2]) : 0;
                    var frac = parsedText[3] !== undefined ? parsedText[3] : "";
                    var fracVal = 0;
                    if (frac !== "") {
                        fracVal = parseInt(frac.split('\/')[0]) / parseInt(frac.split('\/')[1]);
                    } else {
                        fracVal = 0;
                    }

                    return (parseInt(feet * 12) + parseInt(inch) + parseFloat(fracVal.toFixed(2)));
                    /*
    
                        var ft = parseInt(text.split('\'')[0]);
                        var inches = parseFloat(
                            (text.split('-')[1] === undefined) 
                            ? text.split('-')[1] 
                            : text.split('-')[1].split(' ')[1].replace('"', '').replace(" ","").replace(" ","")
                        );
                        
                        var result = ft * 12 + inches;
    
                        if(text.indexOf("\/") !== -1){
                            var inchFraction = text.split('-')[1].split(' ')[2].replace("\"","").replace(" ","").replace(" ","");
                            var simplifiedFraction = inchFraction.split("\/")[0];
                            var simplified32 = inchFraction.split("\/")[1];
    
                            while(simplified32 !== 32 && simplifiedFraction !== 0){
                                simplified32 *= 2;
                                simplifiedFraction *= 2;
                            }
                            result += (simplifiedFraction/simplified32).toFixed(2);
                        }
    
                        return result;
                        */
                    break;
                case "px":
                    return text.toString();
                    break;
                default:
                    return text.toString();

            }
        },

        ShowGridLines: function () {
            var that = this;
            that.gridLines = [];
            var papers = that.getAllPapers();
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            papers.forEach(function (paper) {
                var w = paper.width.replace('px', '');
                var h = paper.height.replace('px', '');
                var w_cm = w * 0.026;
                var step = (96 / 2.54);
                // Vertical lines
                for (var i = 0; i < w; i += step * currentScale) {
                    var ve = paper.path(
                        "M" +
                        (i) + "," + 0 +
                        "L" +
                        (i) + "," + h
                    ).attr("stroke", "lightblue");
                    that.gridLines.push(ve);
                }

                // Horizontal Lines
                for (var i = 0; i < h; i += step * currentScale) {
                    var ho = paper.path(
                        "M" +
                        0 + "," + i +
                        "L" +
                        w + "," + i
                    ).attr("stroke", "lightblue");
                    that.gridLines.push(ho);
                }
            });
        },

        HideGridLines: function () {
            var that = this;
            that.gridLines.forEach(function (line) {
                line.remove();
            });
        },

        deActiveAllAnnotationsInPage: function (pageNumber) {
            var that = this;
            var svgController = that.getSvgController(pageNumber).canvas;
            svgController.paper.forEach(function (el) {
                $(el.node).unbind('mouseover');

                // el.unclick()
                // .undblclick()
                // .undrag()
                // .unhover()
                // .unmousedown()
                // .unmousemove()
                // .unmouseout()
                // .unmouseover()
                // .unmouseup()
                // .untouchcancel()
                // .untouchend()
                // .untouchemove()
                // .untouchstart();
            });
        },



        addToAnnotations: function (annotationId, type, pageNumber, element, rotation, dbobject, maskids, handleids, controlboxids) {
            var that = this;
            if (annotationId in that.annotations) {
                // do nothing
            } else {
                that.annotations[annotationId] = new Object();
                that.annotations[annotationId] = {
                    type: type,
                    pageNumber: pageNumber,
                    element: element,
                    rotation: rotation,
                    dbobject: dbobject,
                    maskids: maskids,
                    handleids: handleids,
                    controlboxids: controlboxids
                }
            }
        },

        addToAnnotations2: function (annotationId, svgClass) {
            var that = this;
            if (annotationId in that.annotations2) {
                // do nothing
                SvgGlobalControllerLogic.annotations2[annotationId] = svgClass;
            } else {
                SvgGlobalControllerLogic.annotations2[annotationId] = new Object();
                SvgGlobalControllerLogic.annotations2[annotationId] = svgClass;
            }
        },

        addMask: function (element, annotation, svgcontroller) {
            //var mask = that.paper.rect(x, y, w, h, false);
            var that = this;

            if (typeof element === 'undefined') return;
            if (element.type !== "set") {
                that.buildMask(element, annotation, svgcontroller);
            } else {
                element.item.forEach(function (el) {
                    that.buildMask(el, annotation, svgcontroller);
                });
            }
        },

        buildMask: function (element, annotation, svgcontroller) {
            var that = svgcontroller;
            var mask = element.clone();
            mask.attr({
                "stroke-width": 15,
                "fill": "white",
                "opacity": 0.01
            });
            mask.click(function () {
                //alert(annotation.DocumentAnnotationId);
                that.onElementClick(element, that.paper, annotation.AnnotationType);
            })
                .mouseout(function (e) {
                    ////console.log(e);
                    $(SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.paper.canvas).css("z-index", "");
                    $(e.target).css("cursor", "default");
                })
                .mouseover(function (e) {
                    ////console.log(e);
                    $(SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.paper.canvas).css("z-index", "100");
                    $(e.target).css("cursor", "pointer");
                })
                .toBack();
            SvgGlobalControllerLogic.addToAnnotations(
                annotation.DocumentAnnotationId,
                annotation.AnnotationType,
                that.pageNumber,
                element,
                annotation.Angle,
                annotation,
                [mask],
                [],
                []
            );
        },

        rightClickHandler: function (svgClass, event) {
            var svgController = svgClass.svgController;
            var paper = svgController.paper;
            var element = event.target;
            var annotation = svgClass.element;

            SvgGlobalControllerLogic.currentRightClickedObject = {
                element: element,
                pageNumber: svgClass.pageNumber,
                annotation: annotation,
            };
            //event.preventDefault();
            if (svgController.contextMenu) {
                svgController.contextMenu.destroyContextMenu();
            }
            var emsNodeId = null;
            var projectId = null;
            var threeD_vl = null;
            //var canvas = AnnotationApplication.CanvasController.getCanvasById(this.pageNumber);
            //console.log("canvas: ", element.type === "set" ? element[0] : element);
            var settings = {
                event: event,
                mesh: svgClass,
                objectType: (element.localName !== "svg") ? "ANNOTATION" : "CANVAS",
                emsNodeId: emsNodeId,
                projectId: projectId,
                threeD_vl: threeD_vl,
                misc: element
            }

            SvgGlobalControllerLogic.selectedObject = [svgClass.annotationId];
            SvgGlobalControllerLogic.selectedIds2 = [svgClass.annotationId];
            svgController.contextMenu = new ContextMenu(settings);

        },

        onElementDragging: function (svgClass, e) {

        },

        onElementDragStart: function () {

        },

        onElementDragEnd: function () {

        },

      openContextMenu: function (event, svgClass) {
        var evt;
        if (event.originalEvent) {
          evt = JSON.stringify(event.originalEvent);
          this.mouseEventStored = event.originalEvent;

        } else {
          evt = JSON.stringify(event);
          this.mouseEventStored = event;

        }
          
          
          var x, y;
          var eventModifierKeys = {
            'CTRL': event.ctrlKey || false,
            'SHIFT': event.shiftKey || false,
            'ALT': event.altKey || false,
            'META': event.metaKey || false,
          }
            if (event.type === "touchend") {
                y= event.changedTouches[0].pageY;
                x=event.changedTouches[0].pageX;
            } else {
                y= (event.type !== "press" ? event.pageY : event.srcEvent.pageY) || $(".navbar-header").height() + $("#2DViewerToolbar").height();
                x= (event.type !== "press" ? event.pageX : event.srcEvent.pageX) || 1;
            }
            var msg = {
                exchangeId: AnnotationApplication.documentVersionId,
                event: {
                    eventType: "AnnotationContextMenu",
                    value: {
                        point:{
                            x:x,
                            y:y
                        },
                        object: svgClass.type,
                        annotationId: svgClass.annotationId
                    }
                }
          }

          //var msg = {
          //  'type': '3',
          //  "object": svgClass,
          //  'keys': eventModifierKeys,
          //  'coordinates': {
          //    'x': x,
          //    'y': y
          //  }
          //}
          dataExchange.sendParentMessage('contextMenu', msg);
// return;
//             if (typeof svgClass === "object" && svgClass.localName === "svg") {
//                 // this is page context menu

//             }
//             var that = svgClass;
//             $(".annotationContextMenu").remove();
//             var ul = document.createElement('ul');
//             ul.id = "context-menu";
//             ul.style.width = "150px";
//             ul.classList = ["annotationContextMenu"];
//             ul.style.zIndex = "9999";
//             ul.style.display = "inherit";
//             ul.oncontextmenu = function (e) {
//                 console.log("context menu returning false");
//                 return false;
//             }
//             document.body.appendChild(ul);
//             $('.annotationContextMenu').kendoContextMenu({
//                 closeOnClick: true,
//                 close: function () {
//                     $('.annotationContextMenu').empty();
//                 },
//                 select: function (e) {
//                     console.log(e);
//                     switch (e.item.textContent) {
//                         case VIEW_RESOURCES.Resource.Comments:
//                             AnnotationApplication.RightSidebarController.openSidebar(e.item, that.pageNumber, that);
//                             $(".rightSidebarTabComments").click();
//                             break;
//                         case VIEW_RESOURCES.Resource.ToDos:
//                             AnnotationApplication.RightSidebarController.openSidebar(e.item, that.pageNumber, that);
//                             $(".rightSidebarTabTasks").click();
//                             break;
//                         case VIEW_RESOURCES.Resource.Properties:
//                             AnnotationApplication.RightSidebarController.openSidebar(e.item, that.pageNumber, that);
//                             $(".rightSidebarTabTools").click();
//                             break;
//                         case VIEW_RESOURCES.Resource.Delete:
//                             //that.Delete();
//                             if (SvgGlobalControllerLogic.selectedIds2.indexOf(that.annotationId) === -1) SvgGlobalControllerLogic.selectedIds2.push(that.annotationId);
//                             AnnotationApplication.CRUDController.deleteAnnotations(SvgGlobalControllerLogic.selectedIds2).then(
//                                 data => {

//                                 },
//                                 err => {

//                                 }
//                             );
//                             break;
//                         case VIEW_RESOURCES.Resource.Copy:
//                             try {
//                                 if (SvgGlobalControllerLogic.selectedIds2.length > 0) {
//                                     SvgGlobalControllerLogic.copyAnnotationsToSession(SvgGlobalControllerLogic.selectedIds2);
//                                 } else {
//                                     //SvgGlobalControllerLogic.copyAnnotationsToSession([]);
//                                 }
//                                 //AnnotationApplication.CopyPaste.copyAnnotation(this.mesh);
//                             } catch (ex) {
//                                 console.error("copy annotations issue!");
//                             }
//                             break;
//                         case VIEW_RESOURCES.Resource.Paste:
//                             SvgGlobalControllerLogic.GetAnnotationsInSession().then(
//                                 annotations => {
//                                     //SvgGlobalControllerLogic.PasteAnnotations(annotations, event);
//                                     var pageNumber = PDFViewerApplication.pdfViewer.currentPageNumber;
//                                     SvgGlobalControllerLogic.selectedIds2=[];
//                                     if (typeof event.mesh !== 'undefined') {
//                                         pageNumber = parseInt($(event.mesh).parent().prop('id').replace("raphael", ""));
//                                     }
//                                     if (annotations.length > 1) {
//                                         event = null;
//                                     }
//                                     annotations.forEach(function (ann) {
//                                         if(typeof ann !== 'undefined' && ann !== null){
//                                             if(typeof SvgGlobalControllerLogic.annotations2[ann.DocumentAnnotationId] !== 'undefined'){
//                                                 SvgGlobalControllerLogic.annotations2[ann.DocumentAnnotationId].paste(event, pageNumber);
//                                             }else{
//                                                 SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas
//                                                 .addToPaper(ann, PDFViewerApplication.pdfViewer.currentPageNumber, true);
//                                             }
                                            
//                                         }
//                                     });
//                                     var contextMenu = $(".annotationContextMenu").data("kendoContextMenu");
//                                     if (contextMenu != null) {
//                                         $('.annotationContextMenu').empty();
//                                         contextMenu.destroy();
//                                     }

//                                 },
//                                 err => {
//                                     console.error(err);
//                                 }
//                             );
//                             break;
//                     }
//                     var contextMenu = $(".annotationContextMenu").data("kendoContextMenu");
//                     if (contextMenu != null && e.item.textContent !== "Paste") {
//                         $('.annotationContextMenu').empty();
//                         contextMenu.destroy();
//                     }
//                 }
//             });
//             var contextMenu = $('.annotationContextMenu').data("kendoContextMenu");
//             //$('.annotationContextMenu').addClass("annotationContextMenu");

//             if (typeof that === "object" && that.localName === "svg") {
//                 // this is page context menu
//                 contextMenu.append([
//                     { text: "Paste" }
//                 ]);
//             } else if (['emsgroup', 'emselement'].includes(that.type.toLowerCase())) {
//                 if (window.parent.loadedModule !== "EMS" || window.parent.Permissions.NodeAnnotationPermissionCode === "DELETE") {
//                     contextMenu.append([
//                         { text: "Properties" },
//                         { text: "Delete", cssClass: "k-separator" },
//                         { text: "Delete" },
//                         { text: "Copy" },
//                         { text: "Paste" },
//                     ]);
//                 }
//                 else {
//                     contextMenu.append([
//                         { text: "Properties" },
//                         { text: "Delete", cssClass: "k-separator" },
//                         { text: "Copy" },
//                         { text: "Paste" },
//                     ]);
//                 }
//             } else if (['defect'].includes(that.type.toLowerCase())) {
//                 contextMenu.append([
//                     { text: "Delete", cssClass: "k-separator" },
//                     { text: "Delete" },
//                     { text: "Copy" },
//                     { text: "Paste" },
//                 ]);
//             } else {
//                 contextMenu.append([
//                     { text: "Comments" },
//                     { text: "ToDos" },
//                     { text: "Properties" },
//                     { text: "Delete", cssClass: "k-separator" },
//                     { text: "Delete" },
//                     { text: "Copy" },
//                     { text: "Paste" },
//                 ]);
//             }

//             if (event.type === "touchend") {
//                 $('.annotationContextMenu').css({
//                     "z-index": "1000",
//                     "display": "inherit",
//                     "position": "fixed",
//                     "top": event.changedTouches[0].pageY,
//                     "left": event.changedTouches[0].pageX,
//                 });
//             } else {
//                 $('.annotationContextMenu').css({
//                     "z-index": "1000",
//                     "display": "inherit",
//                     "position": "fixed",
//                     "top": (event.type !== "press" ? event.pageY : event.srcEvent.pageY) || $(".navbar-header").height() + $("#2DViewerToolbar").height(),
//                     "left": (event.type !== "press" ? event.pageX : event.srcEvent.pageX) || 1,
//                 });
//             }

      },

      copyAnnotation : function() {
        if (SvgGlobalControllerLogic.selectedIds2.length > 0) {
          SvgGlobalControllerLogic.copiedAnnotation = true;
          SvgGlobalControllerLogic.copyAnnotationsToSession(SvgGlobalControllerLogic.selectedIds2);
        } else {
          //SvgGlobalControllerLogic.copyAnnotationsToSession([]);
        }
      },

      pasteAnnotation: function () {
        let event = this.mouseEventStored;
        SvgGlobalControllerLogic.GetAnnotationsInSession().then(
          annotations => {
            //SvgGlobalControllerLogic.PasteAnnotations(annotations, event);
            var pageNumber = PDFViewerApplication.pdfViewer.currentPageNumber;
            SvgGlobalControllerLogic.selectedIds2 = [];
            if (typeof event.mesh !== 'undefined') {
              pageNumber = parseInt($(event.mesh).parent().prop('id').replace("raphael", ""));
            }
            if (annotations.length > 1) {
              event = null;
            }
            annotations.forEach(function (ann) {
              if (typeof ann !== 'undefined' && ann !== null) {
                if (typeof SvgGlobalControllerLogic.annotations2[ann.DocumentAnnotationId] !== 'undefined') {
                  SvgGlobalControllerLogic.annotations2[ann.DocumentAnnotationId].paste(event, pageNumber);
                } else {
                  SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas
                    .addToPaper(ann, PDFViewerApplication.pdfViewer.currentPageNumber, true);
                }

              }
            });
            SvgGlobalControllerLogic.copiedAnnotation = false;
            var contextMenu = $(".annotationContextMenu").data("kendoContextMenu");
            if (contextMenu != null) {
              $('.annotationContextMenu').empty();
              contextMenu.destroy();
            }

          },
          err => {
            console.error(err);
          }
        );
      },

        showGlow: function (svgClass) {
            var that = svgClass;
            if (that.glow === null) {
                if (['callout', 'textbox', 'measurementbasic', 'emsgroup', 'defect'].includes(svgClass.type)) {
                    that.glow = [];
                    Object.keys(that.element).filter(s => that.element[s] !== null && s !== "text").forEach(function (el) {
                        var g = that.element[el].glow();
                        if (that.element[el].type === "path") {
                            g.attr("path", that.element[el].attrs.path.toString());
                        }
                        if (g !== null && typeof g !== 'undefined') {
                            g.toBack();
                            if (
                                (that.element[el].type === "rect" && that.element[el].attr("width") === 0)
                                || (that.element[el].node.style.display === 'none')
                            ) {
                                g.remove();
                            } else {
                                that.glow.push(g);
                            }
                        }
                    });
                } else {
                    if(that.element){
                    that.glow = that.element.glow();
                    if (that.element.type === "path") {
                        that.glow.attr("path", that.element.attrs.path.toString());
                    }
                    that.glow.toBack();
                }
                }
            }
        },

        hideGlow: function (svgClass) {
            var that = svgClass;
            if (that.glow !== null) {
                if (['callout', 'textbox', 'measurementbasic', 'emsgroup', 'defect'].includes(svgClass.type)) {
                    that.glow.forEach(function (g) {
                        g.remove();
                    });
                    that.glow = null;
                } else {
                    if(that.glow){
                    that.glow.remove();
                }
                    that.glow = null;
                }
            }
        },

        afterAddingToPaper: function (svgObject) {
            svgObject.createMask();
            SvgGlobalControllerLogic.addToAnnotations2(svgObject.annotationId, svgObject);
        },

        BindEventsToSvgObject: function (SvgObject) {
            //if (SvgGlobalControllerLogic.isAnonymous()) return;
            var me = SvgObject;
            var elementType = me.type;
            var paper = me.svgController.paper;
            var hasMultipleElement = ['textbox', 'defect', 'emsgroup', 'measurementbasic'].includes(elementType.toLowerCase());
            var elements = [];
            if (hasMultipleElement) {
                Object.keys(me.element).forEach(function (el) {
                    if (me.element[el] !== null) elements.push(me.element[el]);
                });
                //return;
            } else {
                elements.push(me.element);
            }
            elements.forEach(function (element) {
                if (!SvgGlobalControllerLogic.isAnonymous(me)) {
                    try {
                        var that = me.svgController;
                        var ts = null;//touchstart
                        var te = null;//touchend
                        var tm = null;//touchmove

                        element
                            .touchstart(function (e) {
                                //console.log("touchstart", e);
                                ts = e;
                                e.preventDefault();
                                if (me.svgController.isDrawing === true) return;
                                me.isDragging = true;
                                me.svgController.clearAllCtrlBoxes(true);
                                me.svgController.clearAllJoints();
                                me.svgController.clearAllSelectedText();
                                me.removeHandles();
                            })
                            .touchend(function (e) {
                                if (SvgGlobalControllerLogic.isCtrlKeyPressed && SvgGlobalControllerLogic.selectedIds2.indexOf(me.annotationId) < 0) {
                                    SvgGlobalControllerLogic.selectedIds2.push(me.annotationId);
                                } else if (!SvgGlobalControllerLogic.isDraggingElement) {
                                    if (SvgGlobalControllerLogic.selectedIds2.indexOf(me.annotationId) === -1) {
                                        SvgGlobalControllerLogic.selectedIds2.push(me.annotationId);
                                    }
                                } 
                                te = e;
                                if (te.timeStamp - ts.timeStamp < 500 && that.isDragging === false) {
                                    // tap
                                    //AnnotationApplication.Toolbar.widget.enable("#TwoDSettingsButton", true);
                                    var msg = {
                                        exchangeId: AnnotationApplication.documentVersionId,
                                        event: {
                                            eventType: "AnnotationClick",
                                            value: {
                                                object: me.type,
                                                annotationId: me.annotationId
                                            }
                                        }
                                  }
                                  console.log("Inside touch click")
                                    dataExchange.sendParentMessage('clickObject',msg);
                                    SvgGlobalControllerLogic.svgObject = SvgObject;
                                    me.onClick(e);
                                } else if (te.timeStamp - ts.timeStamp > 500 && that.isDragging === false) {
                                   // me.onOpenContextMenu(e);
                                    SvgGlobalControllerLogic.openContextMenu(e, me);
                                //     var msg = {
                                //         exchangeId: AnnotationApplication.documentVersionId,
                                //         event: {
                                //             eventType: "AnnotationContextMenu",
                                //             value: {
                                //                 point:{
                                //                     x:x,
                                //                     y:y
                                //                 },
                                //                 object: svgClass.type,
                                //                 annotationId: svgClass.annotationId
                                //             }
                                //         }
                                //   }
                        
                                  //var msg = {
                                  //  'type': '3',
                                  //  "object": svgClass,
                                  //  'keys': eventModifierKeys,
                                  //  'coordinates': {
                                  //    'x': x,
                                  //    'y': y
                                  //  }
                                  //}
                                //   console.log("In touch context menu");
                                //   dataExchange.sendParentMessage('contextMenu', msg);
                                } else {
                                    try {
                                        if (that.isDrawing === true) return;
                                        if (SvgGlobalControllerLogic.selectedIds2.length > 1) {
                                            SvgGlobalControllerLogic.selectedIds2.forEach(function (id) {
                                                SvgGlobalControllerLogic.annotations2[id].onElementDragEnd(e);
                                            });
                                        } else {
                                            me.onElementDragEnd(e);
                                        }
                                        me.isDragging = false;
                                    } catch (ex) {
                                        console.error(ex);
                                        me.isDragging = false;
                                    }
                                }

                            })
                            .touchmove(function (e) {
                                tm = e;
                                var dx = tm.touches[0].pageX - ts.touches[0].pageX;
                                var dy = tm.touches[0].pageY - ts.touches[0].pageY;
                                try {
                                    if (!me.isDragging) return;
                                    if (that.isDrawing === true) return;
                                    if (e.which === 3 || me.svgController.contextMenu) return;

                                    if (SvgGlobalControllerLogic.selectedIds2.length > 1) {
                                        SvgGlobalControllerLogic.selectedIds2.forEach(function (id) {
                                            SvgGlobalControllerLogic.annotations2[id].onElementDragging(dx, dy, null, null, e);
                                        });
                                    } else {

                                        me.onElementDragging(dx, dy, null, null, e);
                                    }
                                    e.stopPropagation();
                                } catch (ex) {
                                    console.error(ex);
                                }
                            })
                            .click(function (e) {
                                //that.onElementClick(element, paper, elementType);
                                 
                    var msg = {
                        exchangeId: AnnotationApplication.documentVersionId,
                        event: {
                            eventType: "AnnotationClick",
                            value: {
                                object: me.type,
                                annotationId: me.annotationId
                            }
                        }
                  }
                    dataExchange.sendParentMessage('clickObject',msg);

                              me.onClick(e);
                              
                                //AnnotationApplication.Toolbar.widget.enable("#TwoDSettingsButton", true);
                            })
                            .mouseover(function (e) {
                                that.onElementMouseOver(e);
                                SvgGlobalControllerLogic.showGlow(me);
                            })
                            .mouseout(function (e) {
                                that.onElementMouseOut(e);
                                SvgGlobalControllerLogic.hideGlow(me);
                            })
                            .dblclick(function (e) {
                                if (['textbox', 'callout'].includes(elementType)) {
                                    SvgGlobalControllerLogic.svgObject = SvgObject;
                                    var msg = {
                                        exchangeId: AnnotationApplication.documentVersionId,
                                        event: {
                                            eventType: "AnnotationClick",
                                            value: {
                                                object: me.type,
                                                annotationId: me.annotationId
                                            }
                                        }
                                  }
                                    dataExchange.sendParentMessage('dblClickAnnotation', msg)
                                    // console.log("text dbl clicked!");
                                    // that.openTextBoxEdit(SvgObject);
                                } else if (['emsgroup'].includes(elementType)) {
                                    dataExchange.sendParentMessage('selectObject',emsData[me.emsNodeId]);
                                    // window.parent.TreeView_L.scrollToSelectedEmsNode(me.emsNodeId, true);
                                }else if (['defect'].includes(elementType)) {
                                    dataExchange.sendParentMessage('selectObject',emsData[me.defectId]);
                                    // window.parent.ThreeD_VL.selectFromTree(window.parent.TreeView_L.getTreeItemDataById(me.defectId));
                                }
                                if (["measurementbasic"].includes(elementType)) {
                                    console.log("text dbl clicked!");
                                    that.clearAllJoints();
                                    SvgGlobalControllerLogic.svgObject = SvgObject;
                        var msg = {
                            exchangeId: AnnotationApplication.documentVersionId,
                            event: {
                                eventType: "AnnotationClick",
                                value: {
                                    object: me.type,
                                    annotationId: me.annotationId
                                }
                            }
                      }
                        dataExchange.sendParentMessage('dblClickAnnotation', msg);
                                   // me.openMeasurementScaleEdit();
                                }
                            })
                            .mouseup(function (e) {
                                //var element = that.getElementByDocId(this.data("DocumentAnnotationId"));
                                if (SvgGlobalControllerLogic.isCtrlKeyPressed && SvgGlobalControllerLogic.selectedIds2.indexOf(me.annotationId) < 0) {
                                    SvgGlobalControllerLogic.selectedIds2.push(me.annotationId);
                                } else if (!SvgGlobalControllerLogic.isDraggingElement) {
                                    if (SvgGlobalControllerLogic.selectedIds2.indexOf(me.annotationId) === -1) {
                                        SvgGlobalControllerLogic.selectedIds2.push(me.annotationId);
                                    }
                                } 
                                if (!SvgGlobalControllerLogic.isDraggingElement) me.onMouseUp(e);
                                //AnnotationApplication.Toolbar.widget.enable("#TwoDSettingsButton", true);
                            })
                            .drag(
                                function (dx, dy, x, y, e) {  // move
                                    //console.log("svgglobal" + dx + " " + dy + " " + x + " " + y + " " + e);
                                    if (!me.isDragging) return;
                                    if (e.which === 3 || me.svgController.contextMenu) return;
                                    if (SvgGlobalControllerLogic.selectedIds2.length > 1) {
                                        // var objectsToDrag = Object.keys(SvgGlobalControllerLogic.selectedIds2);
                                        // console.log(objectsToDrag);
                                        SvgGlobalControllerLogic.selectedIds2.forEach(function (id) {
                                           // console.log("svgglobal" + dx + " " + dy + " " + x + " " + y + " " + e);
                                           if(SvgGlobalControllerLogic.isDraggablePermission){
                                            SvgGlobalControllerLogic.annotations2[id].onElementDragging(dx, dy, x, y, e);
                                           }else{
                                               return;
                                           }
                                        });
                                    } else {
                                        if(SvgGlobalControllerLogic.isDraggablePermission){
                                            me.onElementDragging(dx, dy, x, y, e);
                                           }else{
                                               return;
                                           }
                                        // function multiply(a) {
                                        //     return (b) => {
                                        //         var msg = {
                                        //             exchangeId: AnnotationApplication.documentVersionId,
                                        //             event: {
                                        //                 eventType: "AnnotationClick",
                                        //                 value: {
                                        //                     object: me.type,
                                        //                     annotationId: me.annotationId
                                        //                 }
                                        //             }
                                        //       }
                                        //         dataExchange.sendParentMessage('clickObject',msg);
                                        //     }
                                        // }
                                    //     var msg = {
                                    //         exchangeId: AnnotationApplication.documentVersionId,
                                    //         event: {
                                    //             eventType: "AnnotationClick",
                                    //             value: {
                                    //                 object: me.type,
                                    //                 annotationId: me.annotationId
                                    //             }
                                    //         }
                                    //   }
                                       
                                    //     function1(dataExchange.sendParentMessage('clickObject',msg), function() {
                                    //         if(SvgGlobalControllerLogic.isDraggablePermission){
                                    //             me.onElementDragging(dx, dy, x, y, e);
                                    //            }else{
                                    //                return;
                                    //            }
                                    //       });
                                       
                                     
                                    }
                                    if (typeof me.glow !== 'undefined') SvgGlobalControllerLogic.hideGlow(me);
                                    e.stopPropagation();
                                }, function (x, y) {  // start
                                    if (me.svgController.isDrawing === true) return;
                                    me.isDragging = true;
                                    //me.onElementDragStart(x, y);
                                    me.svgController.clearAllCtrlBoxes(true);
                                    me.svgController.clearAllJoints();
                                    me.svgController.clearAllSelectedText();
                                    me.removeHandles();
                                }, function (e) {  //end
                                    try {
                                        if (me.svgController.isDrawing === true) return;
                                        if (SvgGlobalControllerLogic.selectedIds2.length > 1) {
                                            SvgGlobalControllerLogic.selectedIds2.forEach(function (id) {
                                                SvgGlobalControllerLogic.annotations2[id].onElementDragEnd(e);
                                            });
                                            SvgGlobalControllerLogic.isDraggingElement = false;
                                        } else {
                                            me.onElementDragEnd(e);
                                            SvgGlobalControllerLogic.isDraggingElement = false;
                                        }
                                        me.isDragging = false;
                                        if ((Object.keys(e).indexOf("which") !== -1 || e.which !== 3) && !SvgGlobalControllerLogic.isCtrlKeyPressed) SvgGlobalControllerLogic.selectedIds2 = [];
                                    } catch (ex) {
                                        console.error(ex);
                                    }
                                }
                            );
                    } catch (ex) {
                        console.error(ex);
                    }
                }else{
                    // is readOnly or anonymous
                    element.dblclick(function(e){
                        if(['defect', 'emsgroup'].includes(elementType.toLowerCase())){
                            // if (['emsgroup'].includes(elementType)) {
                            //     window.parent.TreeView_L.scrollToSelectedEmsNode(me.emsNodeId, true);
                            // }else if (['defect'].includes(elementType)) {
                            //     window.parent.ThreeD_VL.selectFromTree(window.parent.TreeView_L.getTreeItemDataById(me.defectId));
                            // }

                            if (['emsgroup'].includes(elementType)) {
                                dataExchange.sendParentMessage('selectObject',emsData[me.emsNodeId]);
                            }else if (['defect'].includes(elementType)) {
                                dataExchange.sendParentMessage('selectObject',emsData[me.defectId]);
                            }
                        }
                    });
                }
            });

        },

        BindMaskEventsToSvgObject: function (SvgObject, mask) {
            if (SvgGlobalControllerLogic.isAnonymous(SvgObject)) return;
            var that = SvgObject;
            var me = that;
            var svgController = that.svgController;

            var that = me.svgController;
            var ts = null;//touchstart
            var te = null;//touchend
            var tm = null;//touchmove
            mask.data("isMask", true);
            //mask.attr("opacity",0.5);
            //mask.attr("fill","grey");

            mask.touchstart(function (e) {
                //console.log("touchstart", e);
                ts = e;
                e.preventDefault();
                if (svgController.isDrawing === true) return;
                me.isDragging = true;
                me.svgController.clearAllCtrlBoxes(true);
                me.svgController.clearAllJoints();
                me.svgController.clearAllSelectedText();
                me.removeHandles();
            })
                .touchend(function (e) {
                    //console.log("touchend", e);
                    te = e;
                    if (te.timeStamp - ts.timeStamp < 100 && that.isDragging === false) {
                        // tap

                        //that.onElementClick(element, paper, elementType);
                        var msg = {
                            exchangeId: AnnotationApplication.documentVersionId,
                            event: {
                                eventType: "AnnotationClick",
                                value: {
                                    object: me.type,
                                    annotationId: me.annotationId
                                }
                            }
                      }
                      console.log("Inside touch click")
                        dataExchange.sendParentMessage('clickObject',msg);
                        SvgGlobalControllerLogic.svgObject = SvgObject;
                        me.onClick(e);
                        //AnnotationApplication.Toolbar.widget.enable("#TwoDSettingsButton", true);
                    } else if (te.timeStamp - ts.timeStamp > 500 && that.isDragging === false) {
                        //me.onOpenContextMenu(e);
                        SvgGlobalControllerLogic.openContextMenu(e, me);
                    //     var msg = {
                    //         exchangeId: AnnotationApplication.documentVersionId,
                    //         event: {
                    //             eventType: "AnnotationContextMenu",
                    //             value: {
                    //                 point:{
                    //                     x:x,
                    //                     y:y
                    //                 },
                    //                 object: svgClass.type,
                    //                 annotationId: svgClass.annotationId
                    //             }
                    //         }
                    //   }
            
                    //   //var msg = {
                    //   //  'type': '3',
                    //   //  "object": svgClass,
                    //   //  'keys': eventModifierKeys,
                    //   //  'coordinates': {
                    //   //    'x': x,
                    //   //    'y': y
                    //   //  }
                    //   //}
                    //   console.log("In touch context menu");
                    //   dataExchange.sendParentMessage('contextMenu', msg);
                    } else {
                        try {
                            if (that.isDrawing === true) return;
                            if (SvgGlobalControllerLogic.selectedIds2.length > 1) {
                                SvgGlobalControllerLogic.selectedIds2.forEach(function (id) {
                                    SvgGlobalControllerLogic.annotations2[id].onElementDragEnd(e);
                                });
                            } else {
                                mask.remove();
                                me.onElementDragEnd(e);
                            }
                            me.isDragging = false;
                        } catch (ex) {
                            console.error(ex);
                            me.isDragging = false;
                        }
                    }



                })
                .touchmove(function (e) {
                    //console.log("touchmove", e);
                    tm = e;
                    var dx = tm.touches[0].pageX - ts.touches[0].pageX;
                    var dy = tm.touches[0].pageY - ts.touches[0].pageY;
                    try {
                        if (!me.isDragging) return;
                        if (that.isDrawing === true) return;
                        if (e.which === 3 || me.svgController.contextMenu) return;

                        if (SvgGlobalControllerLogic.selectedIds2.length > 1) {
                            SvgGlobalControllerLogic.selectedIds2.forEach(function (id) {
                                SvgGlobalControllerLogic.annotations2[id].onElementDragging(dx, dy, null, null, e);
                            });
                        } else {

                            me.onElementDragging(dx, dy, null, null, e);
                        }
                        e.stopPropagation();
                    } catch (ex) {
                        console.error(ex);
                    }
                })
                .click(function (e) {
                    //that.onElementClick(element, paper, elementType);
                    
                    var msg = {
                        exchangeId: AnnotationApplication.documentVersionId,
                        event: {
                            eventType: "AnnotationClick",
                            value: {
                                object: me.type,
                                annotationId: me.annotationId
                            }
                        }
                  }
                    dataExchange.sendParentMessage('clickObject',msg);
                    me.onClick(e);

                   
                    
                    //AnnotationApplication.Toolbar.widget.enable("#TwoDSettingsButton", true);
                })
                .mouseover(function (e) {
                    //svgController.onElementMouseOver(e);
                    SvgGlobalControllerLogic.showGlow(me);
                    //if(me.type.toLowerCase() === "emsgroup")me.showInfoPopUp();
                })
                .mouseout(function (e) {
                   // svgController.onElementMouseOut(e);
                    SvgGlobalControllerLogic.hideGlow(me);
                    //if(me.type.toLowerCase() === "emsgroup")me.closeInfoPopUp();
                })
                .dblclick(function () {
                    if (['textbox', 'callout'].includes(elementType)) {
                        console.log("text dbl clicked!");
                        SvgGlobalControllerLogic.svgObject = SvgObject;
                        var msg = {
                            exchangeId: AnnotationApplication.documentVersionId,
                            event: {
                                eventType: "AnnotationClick",
                                value: {
                                    object: me.type,
                                    annotationId: me.annotationId
                                }
                            }
                      }
                        dataExchange.sendParentMessage('dblClickAnnotation', msg);
                       // that.openTextBoxEdit(SvgObject);
                    } else if (['emsgroup'].includes(elementType)) {
                        dataExchange.sendParentMessage('selectObject',emsData[me.emsNodeId]);
                        // window.parent.TreeView_L.scrollToSelectedEmsNode(me.emsNodeId, true);
                    }else if (['defect'].includes(elementType)) {
                        dataExchange.sendParentMessage('selectObject',emsData[me.defectId]);
                        // window.parent.ThreeD_VL.selectFromTree(window.parent.TreeView_L.getTreeItemDataById(me.defectId));
                    }
                    if (["measurementbasic"].includes(elementType)) {
                        console.log("text dbl clicked!");
                        that.clearAllJoints();
                        SvgGlobalControllerLogic.svgObject = SvgObject;
                        var msg = {
                            exchangeId: AnnotationApplication.documentVersionId,
                            event: {
                                eventType: "AnnotationClick",
                                value: {
                                    object: me.type,
                                    annotationId: me.annotationId
                                }
                            }
                      }
                        dataExchange.sendParentMessage('dblClickAnnotation', msg);

                        //me.openMeasurementScaleEdit();
                    }
                })
                .mouseup(function (e) {
                    //var element = that.getElementByDocId(this.data("DocumentAnnotationId"));
                    if (SvgGlobalControllerLogic.isCtrlKeyPressed && SvgGlobalControllerLogic.selectedIds2.indexOf(me.annotationId) < 0) {
                        SvgGlobalControllerLogic.selectedIds2.push(me.annotationId);
                    } else if (!SvgGlobalControllerLogic.isDraggingElement) {
                        if (SvgGlobalControllerLogic.selectedIds2.indexOf(me.annotationId) === -1) {
                            SvgGlobalControllerLogic.selectedIds2.push(me.annotationId);
                        }
                    } 
                    if (!SvgGlobalControllerLogic.isDraggingElement) me.onMouseUp(e);
                    //.widget.enable("#TwoDSettingsButton", true);
                    // if (e.which === 3 && me.isDragging === false) {
                    //     SvgGlobalControllerLogic.openContextMenu(e, me);
                    // } else if (e.which === 3 && e.type === 'mouseup') {
                    //     SvgGlobalControllerLogic.openContextMenu(e, me);
                    // }
                })
                .drag(
                    function (dx, dy, x, y, e) {  // move
                        try {
                            if (!me.isDragging) return;
                            if (svgController.isDrawing === true) return;
                            if (e.which === 3 || me.svgController.contextMenu) return;

                            if (SvgGlobalControllerLogic.selectedIds2.length > 1) {
                                SvgGlobalControllerLogic.selectedIds2.forEach(function (id) {
                                    if(SvgGlobalControllerLogic.isDraggablePermission){
                                    SvgGlobalControllerLogic.annotations2[id].onElementDragging(dx, dy, x, y, e);
                                    }else{
                                        return;
                                    }
                                });
                            } else {
                                if(SvgGlobalControllerLogic.isDraggablePermission){

                                me.onElementDragging(dx, dy, x, y, e);
                                }else{
                                    return;
                                }
                            }
                            if (typeof me.glow !== 'undefined') SvgGlobalControllerLogic.hideGlow(me);
                            e.stopPropagation();
                        } catch (ex) {
                            console.error(ex);
                        }
                    }, function (x, y) {  // start
                        //me.onElementDragStart(x, y);
                        if(svgController){
                        if (svgController.isDrawing === true) return;
                        me.isDragging = true;
                        me.svgController.clearAllCtrlBoxes(true);
                        me.svgController.clearAllJoints();
                        me.svgController.clearAllSelectedText();
                        me.removeHandles();
                        }
                    }, function (e) {  //end
                        try {
                            if(svgController){
                            if (svgController.isDrawing === true) return;
                            if (SvgGlobalControllerLogic.selectedIds2.length > 1) {
                                SvgGlobalControllerLogic.selectedIds2.forEach(function (id) {
                                    SvgGlobalControllerLogic.annotations2[id].onElementDragEnd(e);
                                });
                                SvgGlobalControllerLogic.isDraggingElement = false;
                            } else {
                                me.onElementDragEnd(e);
                                SvgGlobalControllerLogic.isDraggingElement = false;
                            }
                            me.isDragging = false;
                            if ((Object.keys(e).indexOf("which") !== -1 || e.which !== 3) && !SvgGlobalControllerLogic.isCtrlKeyPressed)  SvgGlobalControllerLogic.selectedIds2 = [];
                        }} catch (ex) {
                            console.error(ex);
                            me.isDragging = false;
                        }
                    }
                )
        },

        createHandles: function (SvgObject) {
            var that = SvgObject;
            var thatController = that.svgController;
            var element = that.element;
            var paper = thatController.paper;


            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var baseNumber = 0;
            var strokeWidth = 3;
            var handleSize = 25 / currentScale;

            var currentX;
            var currentY;
            var ctrlBox;
            var ctrlBox_x;
            var ctrlBox_y;
            var ctrlBox_w;
            var ctrlBox_h;
            var ctrlBox_centerX;
            var ctrlBox_centerY;
            var invMat = element.matrix.invert();
            if (["circ"].includes(that.type)) {

                ctrlBox_x = element.attr("cx") - baseNumber - element.attr("rx");
                ctrlBox_y = element.attr("cy") - baseNumber - element.attr("ry");
                ctrlBox_w = element.attr("rx") * 2 + baseNumber * 2;
                ctrlBox_h = element.attr("ry") * 2 + baseNumber * 2;
            } else {
                ctrlBox_x = element.attr("x") - baseNumber;
                ctrlBox_y = element.attr("y") - baseNumber;
                ctrlBox_w = element.attr("width") + baseNumber * 2;
                ctrlBox_h = element.attr("height") + baseNumber * 2;
            }


            ctrlBox = paper.rect(
                ctrlBox_x,
                ctrlBox_y,
                ctrlBox_w,
                ctrlBox_h
            )
                .attr({
                    fill: '',
                    stroke: 'orange',
                    'stroke-width': strokeWidth,
                    'stroke-dasharray': "-"
                })
                .rotate(that.angle);

            that.controlboxids = ctrlBox;

            ctrlBox_centerX = ctrlBox.getBBox().cx;
            ctrlBox_centerY = ctrlBox.getBBox().cy;


            var rotateVector = function (vec, ang) {
                ang = -ang * (Math.PI / 180);
                var cos = Math.cos(ang);
                var sin = Math.sin(ang);
                return new Array(Math.round(10000 * (vec[0] * cos - vec[1] * sin)) / 10000, Math.round(10000 * (vec[0] * sin + vec[1] * cos)) / 10000);
            };

            var GetPosition = function (dir, pos, delta, current) {
                switch (dir) {
                    case -1:
                        return pos;
                    case 0:
                        return current;
                    case 1:
                        return pos - delta;
                }
            };

            var GetLength = function (dir, delta, length) {
                switch (dir) {
                    case -1:
                        return length + delta;
                    case 0:
                        return length;
                    case 1:
                        return - delta;
                }
            }

            var onDrag = function (dx, dy, x, y, e, dirX, dirY, that) {
                //restore the not filled element
                thatController.restoreMask(element);
                if (e.type === "touchmove") {
                    var myoffset = thatController.getTouchOffset($("#pageContainer" + thatController.pageNumber + ":first"));
                    currentX = e.touches[0].pageX - myoffset.left;
                    currentY = e.touches[0].pageY - myoffset.top;

                    var paperWidth = parseFloat((thatController.paper.width).replace("px", ""));
                    var paperHeight = parseFloat((thatController.paper.height).replace("px", ""));

                    switch (thatController.getPageRotation()) {
                        case 0:
                            currentX = e.touches[0].pageX - myoffset.left;
                            currentY = e.touches[0].pageY - myoffset.top;
                            break;
                        case 90:
                            currentX = e.touches[0].pageY - myoffset.top;
                            currentY = paperHeight - (e.touches[0].pageX - myoffset.left);
                            break;
                        case 180:
                            // currentX = paperWidth - (e.touches[0].pageX - myoffset.left);
                            // currentY = e.touches[0].pageY - myoffset.top;
                            currentX = paperWidth - (e.touches[0].pageX - myoffset.left);
                            currentY = paperHeight - (e.touches[0].pageY - myoffset.top);
                            break;
                        case 270:
                            currentX = paperWidth - (e.touches[0].pageY - myoffset.top);
                            currentY = e.touches[0].pageX - myoffset.left;
                            break;
                    }
                    currentX = currentX / currentScale;
                    currentY = currentY / currentScale;

                } else if (false && navigator.userAgent.search("Firefox") >= 0) {
                    if (e.layerX == 0 && e.layerY == 0) {
                        e.preventDefault();
                        return false;
                    }
                    currentX = e.layerX;
                    currentY = e.layerY;
                    currentX = thatController.getXY(e, 1 / thatController.getScale()).x;
                    currentY = thatController.getXY(e, 1 / thatController.getScale()).y;
                } else {
                    currentX = e.offsetX;
                    currentY = e.offsetY;
                    currentX = thatController.getXY(e, 1 / thatController.getScale()).x;
                    currentY = thatController.getXY(e, 1 / thatController.getScale()).y;
                }

                //console.log(e.type);

                //thatController.paper.ellipse(currentX,currentY,3,3).attr("fill","green");

                var newX = invMat.x(currentX, currentY);
                var newY = invMat.y(currentX, currentY);
                ctrlBox_x = GetPosition(dirX, newX - baseNumber, ctrlBox_w, ctrlBox_x);
                ctrlBox_y = GetPosition(dirY, newY - baseNumber, ctrlBox_h, ctrlBox_y);


                if (["rect", "image", "highlight"].indexOf(element.type) > -1) {
                    // new width of control box:
                    ctrlBox_w = GetLength(dirX, element.attr("x") - newX, element.attr("width"));
                    ctrlBox_h = GetLength(dirY, element.attr("y") - newY, element.attr("height"));
                } else if (["ellipse"].indexOf(element.type) > -1) {
                    // new width of control box:
                    ctrlBox_w = 2 * GetLength(dirX, element.attr("cx") - newX - 2 * baseNumber, (dirX === 0) ? element.attr("rx") : 0);
                    ctrlBox_h = 2 * GetLength(dirY, element.attr("cy") - newY - 2 * baseNumber, (dirY === 0) ? element.attr("ry") : 0);
                }

                if (ctrlBox_w < 0) {
                    ctrlBox_x = ctrlBox_x + ctrlBox_w * (-dirX);
                    ctrlBox_w = -ctrlBox_w;
                }
                if (ctrlBox_h < 0) {
                    ctrlBox_y = ctrlBox_y + ctrlBox_h * (-dirY);
                    ctrlBox_h = -ctrlBox_h;
                }

                if (["ellipse"].indexOf(element.type) > -1) {
                    //update the circle
                    element.attr({
                        rx: ctrlBox_w / 2,
                        ry: ctrlBox_h / 2
                    });
                }

                // update the handle
                that.transform("");

                that.rotate(that.angle);
                that.attr({
                    x: currentX - handleSize / 2,
                    y: currentY - handleSize / 2
                });


                // update the ctrlBox
                ctrlBox.attr({
                    x: ctrlBox_x,
                    y: ctrlBox_y,
                    width: ctrlBox_w,
                    height: ctrlBox_h
                });
            };

            var onDragStop = function (e, angle) {
                if (["rect", "image", "highlight", "stamp"].indexOf(element.type) > -1) {
                    // rollback the empty fill

                    if (typeof angle === "undefined") { angle = 0 }
                    var centerDelta = [
                        (ctrlBox.getBBox().cx - ctrlBox_centerX),
                        (ctrlBox.getBBox().cy - ctrlBox_centerY)
                    ];
                    var centerDeltaRot = rotateVector(centerDelta, angle);

                    element.transform("");
                    element.attr({
                        x: ctrlBox.attr("x") + centerDelta[0] - centerDeltaRot[0],
                        y: ctrlBox.attr("y") + centerDelta[1] - centerDeltaRot[1],
                        width: ctrlBox.attr("width"),
                        height: ctrlBox.attr("height")
                    });
                    element.rotate(angle);

                    switch (element.type) {
                        case "rect":
                            if (element.getAnnotationType() === "highlight") {
                                that.update();
                            } else {
                                that.update();
                            }
                            break;
                        case "image":
                            that.update();
                            break;
                        case "stamp":
                            that.update();
                            break;
                    }

                } else if (["ellipse"].indexOf(element.type) > -1) {
                    that.update();
                }
                that.removeHandles();
                that.createHandles();
                $("#raphael" + that.pageNumber).parent().children("div:not(:first-child)").addClass("hidden");
            }


            var lt = thatController.paper.rect(ctrlBox_x - (handleSize / 2), ctrlBox_y - (handleSize / 2), handleSize, handleSize)
                .rotate(that.angle, ctrlBox_centerX, ctrlBox_centerY)
                .attr({ stroke: "orange", 'stroke-dasharray': "" })
                .touchstart(function (e) { e.preventDefault(); $("#raphael" + thatController.pageNumber).parent().children("div:not(:first-child)").addClass("hidden"); })
                .touchmove(function (e) { e.preventDefault(); onDrag(null, null, null, null, e, -1, -1, this); })
                .touchend(function (e) { e.preventDefault(); onDragStop(e, that.angle); })
                .drag(
                    //onDrag
                    function (dx, dy, x, y, e) { 
                        if(SvgGlobalControllerLogic.isDraggablePermission){
                        onDrag(dx, dy, x, y, e, -1, -1, this);}
                    else{
                        return;
                    } },
                    //onDragStart
                    function (x, y) { $("#raphael" + thatController.pageNumber).parent().children("div:not(:first-child)").addClass("hidden"); },
                    //onDragStop
                    function (e) { 
                        if(SvgGlobalControllerLogic.isDraggablePermission){
                        onDragStop(e, that.angle);
                     }else{
                         return;
                     } }
                )
                .data("type", "lt");

            var lm = thatController.paper.rect(ctrlBox_x - (handleSize / 2), ctrlBox_y + ctrlBox_h / 2 - (handleSize / 2), handleSize, handleSize)
                .attr({ stroke: "orange", 'stroke-dasharray': "" })
                .touchstart(function (e) { e.preventDefault(); $("#raphael" + thatController.pageNumber).parent().children("div:not(:first-child)").addClass("hidden"); })
                .touchmove(function (e) { e.preventDefault(); onDrag(null, null, null, null, e, -1, 0, this); })
                .touchend(function (e) { e.preventDefault(); onDragStop(e, that.angle); })
                .drag(
                    //onDrag
                    function (dx, dy, x, y, e) { 
                        if(SvgGlobalControllerLogic.isDraggablePermission){
                        onDrag(dx, dy, x, y, e, -1, 0, this);
                        }else{
                            return;
                        }
                     },
                    //onDragStart
                    function (x, y) { $("#raphael" + thatController.pageNumber).parent().children("div:not(:first-child)").addClass("hidden"); },
                    //onDragStop
                    function (e) {
                        if(SvgGlobalControllerLogic.isDraggablePermission){
                        onDragStop(e, that.angle); 
                    }else{
                        return;
                    }}
                )
                .rotate(that.angle, ctrlBox_centerX, ctrlBox_centerY)
                .data("type", "lm");

            var lb = thatController.paper.rect(ctrlBox_x - (handleSize / 2), ctrlBox_y - (handleSize / 2) + ctrlBox_h, handleSize, handleSize)
                .attr({ stroke: "orange", 'stroke-dasharray': "" })
                .touchstart(function (e) { e.preventDefault(); $("#raphael" + thatController.pageNumber).parent().children("div:not(:first-child)").addClass("hidden"); })
                .touchmove(function (e) { e.preventDefault(); onDrag(null, null, null, null, e, -1, 1, this); })
                .touchend(function (e) { e.preventDefault(); onDragStop(e, that.angle); })
                .drag(
                    //onDrag
                    function (dx, dy, x, y, e) { 
                        if(SvgGlobalControllerLogic.isDraggablePermission){
                        onDrag(dx, dy, x, y, e, -1, 1, this);
                     }else{
                         return;
                     } },
                    //onDragStart
                    function (x, y) { $("#raphael" + thatController.pageNumber).parent().children("div:not(:first-child)").addClass("hidden"); },
                    //onDragStop
                    function (e) { 
                        if(SvgGlobalControllerLogic.isDraggablePermission){
                        onDragStop(e, that.angle);}
                    else{
                        return;
                    } }
                )
                .rotate(that.angle, ctrlBox_centerX, ctrlBox_centerY)
                .data("type", "lb");

            // middle handles
            var t = thatController.paper.rect(ctrlBox_x + ctrlBox_w / 2 - (handleSize / 2), ctrlBox_y - (handleSize / 2), handleSize, handleSize)
                .attr({ stroke: "orange", 'stroke-dasharray': "" })
                .touchstart(function (e) { e.preventDefault(); $("#raphael" + thatController.pageNumber).parent().children("div:not(:first-child)").addClass("hidden"); })
                .touchmove(function (e) { e.preventDefault(); onDrag(null, null, null, null, e, 0, -1, this); })
                .touchend(function (e) { e.preventDefault(); onDragStop(e, that.angle); })
                .drag(
                    //onDrag
                    function (dx, dy, x, y, e) { 
                        if(SvgGlobalControllerLogic.isDraggablePermission){
                        onDrag(dx, dy, x, y, e, 0, -1, this);
                     }else{
                         return;
                     } },
                    //onDragStart
                    function (x, y) { $("#raphael" + thatController.pageNumber).parent().children("div:not(:first-child)").addClass("hidden"); },
                    //onDragStop
                    function (e) { 
                        if(SvgGlobalControllerLogic.isDraggablePermission){
                        onDragStop(e, that.angle);}
                    else{
                        return;
                    } }
                )
                .rotate(that.angle, ctrlBox_centerX, ctrlBox_centerY)
                .data("type", "t");

            var b = thatController.paper.rect(ctrlBox_x + ctrlBox_w / 2 - (handleSize / 2), ctrlBox_y + ctrlBox_h - (handleSize / 2), handleSize, handleSize)
                .attr({ stroke: "orange", 'stroke-dasharray': "" })
                .touchstart(function (e) { e.preventDefault(); $("#raphael" + thatController.pageNumber).parent().children("div:not(:first-child)").addClass("hidden"); })
                .touchmove(function (e) { e.preventDefault(); onDrag(null, null, null, null, e, 0, 1, this); })
                .touchend(function (e) { e.preventDefault(); onDragStop(e, that.angle); })
                .drag(
                    //onDrag
                    function (dx, dy, x, y, e) { 
                        if(SvgGlobalControllerLogic.isDraggablePermission){
                        onDrag(dx, dy, x, y, e, 0, 1, this);
                     }else{return;
                    }
                     },
                    //onDragStart
                    function (x, y) { $("#raphael" + thatController.pageNumber).parent().children("div:not(:first-child)").addClass("hidden"); },
                    //onDragStop
                    function (e) { 
                        if(SvgGlobalControllerLogic.isDraggablePermission){
                        onDragStop(e, that.angle);
                        }else{
                            return;
                        }
                     }
                )
                .rotate(that.angle, ctrlBox_centerX, ctrlBox_centerY)
                .data("type", "b");


            // right handles
            var rt = thatController.paper.rect(ctrlBox_x + ctrlBox_w - (handleSize / 2), ctrlBox_y - (handleSize / 2), handleSize, handleSize)
                .attr({ stroke: "orange", 'stroke-dasharray': "" })
                .touchstart(function (e) { e.preventDefault(); $("#raphael" + thatController.pageNumber).parent().children("div:not(:first-child)").addClass("hidden"); })
                .touchmove(function (e) { e.preventDefault(); onDrag(null, null, null, null, e, 1, -1, this); })
                .touchend(function (e) { e.preventDefault(); onDragStop(e, that.angle); })
                .drag(
                    //onDrag
                    function (dx, dy, x, y, e) { 
                        if(SvgGlobalControllerLogic.isDraggablePermission){
                        onDrag(dx, dy, x, y, e, 1, -1, this);
                     }else{
                         return;
                     } },
                    //onDragStart
                    function (x, y) { $("#raphael" + thatController.pageNumber).parent().children("div:not(:first-child)").addClass("hidden"); },
                    //onDragStop
                    function (e) { 
                        if(SvgGlobalControllerLogic.isDraggablePermission){
                        onDragStop(e, that.angle);}
                    else{
                        return;
                    } }
                )
                .rotate(that.angle, ctrlBox_centerX, ctrlBox_centerY)
                .data("type", "rt");

            var rm = thatController.paper.rect(ctrlBox_x + ctrlBox_w - (handleSize / 2), ctrlBox_y + ctrlBox_h / 2 - (handleSize / 2), handleSize, handleSize)
                .attr({ stroke: "orange", 'stroke-dasharray': "" })
                .touchstart(function (e) { e.preventDefault(); $("#raphael" + thatController.pageNumber).parent().children("div:not(:first-child)").addClass("hidden"); })
                .touchmove(function (e) { e.preventDefault(); onDrag(null, null, null, null, e, 1, 0, this); })
                .touchend(function (e) { e.preventDefault(); onDragStop(e, that.angle); })
                .drag(
                    //onDrag
                    function (dx, dy, x, y, e) { 
                        if(SvgGlobalControllerLogic.isDraggablePermission){
                        onDrag(dx, dy, x, y, e, 1, 0, this);}
                    else{
                        return;
                    } },
                    //onDragStart
                    function (x, y) { $("#raphael" + thatController.pageNumber).parent().children("div:not(:first-child)").addClass("hidden"); },
                    //onDragStop
                    function (e) { 
                        if(SvgGlobalControllerLogic.isDraggablePermission){
                        onDragStop(e, that.angle);
                     }else{
                         return;
                     } }
                )
                .rotate(that.angle, ctrlBox_centerX, ctrlBox_centerY)
                .data("type", "rm");

            var rb = thatController.paper.rect(ctrlBox_x + ctrlBox_w - (handleSize / 2), ctrlBox_y + ctrlBox_h - (handleSize / 2), handleSize, handleSize)
                .attr({ stroke: "orange", 'stroke-dasharray': "" })
                .touchstart(function (e) { e.preventDefault(); $("#raphael" + thatController.pageNumber).parent().children("div:not(:first-child)").addClass("hidden"); })
                .touchmove(function (e) { e.preventDefault(); onDrag(null, null, null, null, e, 1, 1, this); })
                .touchend(function (e) { e.preventDefault(); onDragStop(e, that.angle); })
                .drag(
                    //onDrag
                    function (dx, dy, x, y, e) { 
                        if(SvgGlobalControllerLogic.isDraggablePermission){
                        onDrag(dx, dy, x, y, e, 1, 1, this);
                     }else{
                         return;
                     } },
                    //onDragStart
                    function (x, y) { $("#raphael" + thatController.pageNumber).parent().children("div:not(:first-child)").addClass("hidden"); },
                    //onDragStop
                    function (e) { 
                        if(SvgGlobalControllerLogic.isDraggablePermission){
                        onDragStop(e, that.angle);
                     }
                    else{
                        return;
                    } }
                )
                .rotate(that.angle, ctrlBox_centerX, ctrlBox_centerY)
                .data("type", "rb");




            var centerPoint = {
                x: (element.getBBox().x + element.getBBox().width / 2),
                y: (element.getBBox().y + element.getBBox().height / 2)
            }

            var onRotateDrag = function (dx, dy, x, y, e, obj) {
                if (e.type === "touchmove") {
                    var myoffset = thatController.getTouchOffset($("#pageContainer" + that.pageNumber + ":first"));
                    currentX = e.touches[0].pageX - myoffset.left;
                    currentY = e.touches[0].pageY - myoffset.top;

                    var paperWidth = parseFloat((thatController.paper.width).replace("px", ""));
                    var paperHeight = parseFloat((thatController.paper.height).replace("px", ""));

                    switch (thatController.getPageRotation()) {
                        case 0:
                            currentX = e.touches[0].pageX - myoffset.left;
                            currentY = e.touches[0].pageY - myoffset.top;
                            break;
                        case 90:
                            currentX = e.touches[0].pageY - myoffset.top;
                            currentY = paperHeight - (e.touches[0].pageX - myoffset.left);
                            break;
                        case 180:
                            currentX = paperWidth - (e.touches[0].pageX - myoffset.left);
                            currentY = paperHeight - (e.touches[0].pageY - myoffset.top);
                            break;
                        case 270:
                            currentX = paperWidth - (e.touches[0].pageY - myoffset.top);
                            currentY = e.touches[0].pageX - myoffset.left;
                            break;
                    }

                } else if (navigator.userAgent.search("Firefox") >= 0) {
                    if (e.layerX == 0 && e.layerY == 0) {
                        e.preventDefault();
                        return false;
                    }
                    currentX = e.layerX;
                    currentY = e.layerY;
                } else {
                    currentX = e.offsetX;
                    currentY = e.offsetY;
                }

                currentX = currentX / currentScale;
                currentY = currentY / currentScale;

                obj.transform("");

                obj.attr({
                    cx: currentX,
                    cy: currentY
                });


                //deg = e.offsetX - rotatebeginX/10;
                angle = Raphael.angle(currentX, currentY, centerPoint.x, centerPoint.y) + 90;

                //console.log(angle);
                //element.rotate(angle - tempAngle);
                element.rotate(angle - tempAngle, ctrlBox_centerX, ctrlBox_centerY);
                tempAngle = angle
            };

            var onRotateDragEnd = function (e) {
                element.rotate(angle - tempAngle);
                that.angle = tempAngle;
                that.update();
                that.removeHandles();
                that.createHandles();
                $("#raphael" + that.pageNumber).parent().children("div:not(:first-child)").addClass("hidden");
            };

            var tempAngle = that.angle;
            var angle = 0;
            var rotate = thatController.paper.ellipse(ctrlBox_x + ctrlBox_w / 2, ctrlBox_y - 35, handleSize / 2, handleSize / 2, false)
                .attr({ stroke: "orange", 'stroke-dasharray': "", 'stroke-width': 2, "fill": "orange" })
                .touchstart(function (e) { e.preventDefault(); $("#raphael" + thatController.pageNumber).parent().children("div:not(:first-child)").addClass("hidden"); })
                .touchmove(function (e) { e.preventDefault(); onRotateDrag(null, null, null, null, e, this); })
                .touchend(function (e) { e.preventDefault(); onRotateDragEnd(e); })
                .drag(
                    function (dx, dy, x, y, e) {  // move
                        if(SvgGlobalControllerLogic.isDraggablePermission){
                        onRotateDrag(dx, dy, x, y, e, this);
                        }else{
                            return;
                        }
                    }, function (x, y) {  // start
                        console.log(this.matrix.split().rotate)
                        $("#raphael" + that.pageNumber).parent().children("div:not(:first-child)").addClass("hidden");
                    }, function (e) {  //end
                        if(SvgGlobalControllerLogic.isDraggablePermission){
                        onRotateDragEnd(e);
                        }else{
                            return;
                        }
                    }
                )
                .rotate(that.angle, ctrlBox_centerX, ctrlBox_centerY)
                .data("type", "rotate");
            that.angle = element.matrix.split().rotate;


            var set = paper.set();

            [lt, lm, lb, t, b, rt, rm, rb].forEach(function (handle) {
                handle.attr({
                    fill: 'red',
                    stroke: '',
                    opacity: 0.6,
                    'stroke-width': 1,
                    'stroke-dasharray': ""
                });
            });

            if (["rect", "highlight"].indexOf(element.type) > -1) {
                var id = element.getDocumentAnnotationId();
                that.handleids = [lt, lm, lb, t, b, rt, rm, rb];
            }

            that.handleids = [lt, lm, lb, t, b, rt, rm, rb, rotate];

        },

        isAnonymous: function (svgObject) {
            if(typeof svgObject !== 'undefined' && loadedModule === "EMS"){
                if(svgObject.type === "defect"){
                    return (window.parent.Permissions.DefectPermissionCode === "READ" || window.parent.Permissions.DefectPermissionCode === "NOACCESS" );
                }else if(svgObject.type === "emsgroup"){
                    return (window.parent.Permissions.NodeAnnotationPermissionCode === "READ" || window.parent.Permissions.NodeAnnotationPermissionCode === "NOACCESS" );
                }
            }else{
                return ANNOTATION_ROLE.toLowerCase() === "anonymous" || ANNOTATION_ROLE.toLowerCase() === "read" || ROLE.toLowerCase() === "anonymous";
            }
        },

        updateEmsIcons: function (iconType, qrUrlAddress) {
            window.parent.QrUrlAddress = qrUrlAddress;
            var that = this;
            if(["qr","nameqr"].indexOf(iconType.split('_')[1]) !== -1){
                AnnotationApplication.Utils.showAllQR();
            }
            Object.keys(SvgGlobalControllerLogic.annotations2).forEach(function (id) {
                var svgObject = SvgGlobalControllerLogic.annotations2[id];
                if (svgObject.type === "emsgroup" || svgObject.type === "defect") {
                    that.updateEmsIcon(svgObject, iconType);
                }
            });
        },

        updateEmsIcon: function(svgObject, iconType){
            
          if (svgObject.type === "emsgroup" || svgObject.type === "defect") {
                switch (iconType.split('_')[1]) {
                    case "name":
                        svgObject.element.text.show();
                        svgObject.element.rect1.show();
                        svgObject.element.circle.show();
                        svgObject.element.pin.hide();
                        if (svgObject.element.rect2 !== null && typeof svgObject.element.rect2 !== 'undefined') svgObject.element.rect2.show();
                        if (svgObject.element.qr !== null && typeof svgObject.element.qr !== 'undefined') svgObject.element.qr.hide();
                        break;
                    case "qr":
                        if (svgObject.type === "defect")break;
                        svgObject.element.text.hide();
                        svgObject.element.rect1.hide();
                        svgObject.element.circle.hide();
                        svgObject.element.pin.hide();
                        if (svgObject.element.rect2 !== null && typeof svgObject.element.rect2 !== 'undefined') svgObject.element.rect2.hide();
                        if (svgObject.element.qr !== null && typeof svgObject.element.qr !== 'undefined'){
                             svgObject.element.qr.show();
                        }else{
                            SvgGlobalControllerLogic.generateElementQr(svgObject, function(){
                                svgObject.element.qr.show();
                            });
                        }
                        break;
                    case "nameqr":
                        if (svgObject.type === "defect")break;
                        svgObject.element.text.show();
                        svgObject.element.rect1.show();
                        svgObject.element.circle.show();
                        svgObject.element.pin.hide();
                        if (svgObject.element.rect2 !== null && typeof svgObject.element.rect2 !== 'undefined') svgObject.element.rect2.show();
                        if (svgObject.element.qr !== null && typeof svgObject.element.qr !== 'undefined') {
                            svgObject.element.qr.show();
                        }else{
                            SvgGlobalControllerLogic.generateElementQr(svgObject, function(){
                                svgObject.element.qr.show();
                            });
                        }
                        break;
                    case "pin":
                        svgObject.element.text.hide();
                        svgObject.element.rect1.hide();
                        svgObject.element.circle.hide();
                        svgObject.element.pin.show();
                        if (svgObject.element.rect2 !== null && typeof svgObject.element.rect2 !== 'undefined') svgObject.element.rect2.hide();
                        if (svgObject.element.qr !== null && typeof svgObject.element.qr !== 'undefined') svgObject.element.qr.hide();
                        break;
                    case "default":
                    default:
                        svgObject.element.text.show();
                        svgObject.element.rect1.show();
                        svgObject.element.circle.show();
                        svgObject.element.pin.show();
                        if (svgObject.element.rect2 !== null && typeof svgObject.element.rect2 !== 'undefined') svgObject.element.rect2.show();
                        if (svgObject.element.qr !== null && typeof svgObject.element.qr !== 'undefined') svgObject.element.qr.hide();
                        break;


                }
            }
        },

        drawSelectBox: function(ids){
            ids = typeof ids === 'undefined' ? SvgGlobalControllerLogic.selectedIds2 : ids;
            try{
                var that = this;
                ids.forEach(function(id){
                  var svgObject = SvgGlobalControllerLogic.annotations2[id];
                    if(typeof svgObject !== 'undefined'){
                        var elements = [];
                        if(Object.keys(svgObject.element).indexOf("attrs") !== -1){
                            // has only one element
                            elements.push(svgObject.element);
                        }else{
                            // has multiple elements
                            Object.keys(svgObject.element).forEach(function(name){
                                if(svgObject.element[name] !== null)elements.push(svgObject.element[name]);
                            });
                        }
                        if(elements[0][0] !== null){
                            var minX = Math.min.apply(null, elements.map(s=>s.getBBox().x));
                            var minY = Math.min.apply(null, elements.map(s=>s.getBBox().y));
                            var maxX = Math.max.apply(null, elements.map(s=>s.getBBox().x + s.getBBox().width));
                            var maxY = Math.max.apply(null, elements.map(s=>s.getBBox().y + s.getBBox().height));
            
                            var box = svgObject.svgController.paper.rect(minX-3, minY-3, maxX-minX+6, maxY-minY+6);
                            box.attr({
                                "stroke":"orange"
                            });
                            box.data("isCtrlBox", true);
                        }
                    }
                });
            }catch(ex){
                console.error(ex);
            }
        },

        getAnnotationsIdByEmsIds: function(emsIds){
            var annotations = SvgGlobalControllerLogic.annotations2;
            var selected = [];
            Object.keys(annotations).forEach(function(annId){
                var svgObject = SvgGlobalControllerLogic.annotations2[annId];
                if(["emsgroup"].indexOf(svgObject.type.toLowerCase()) !== -1){
                    if(emsIds.indexOf(svgObject.emsNodeId) !== -1){
                        // select the annotation
                        selected.push(annId);
                    }
                }else if(["defect"].indexOf(svgObject.type.toLowerCase()) !== -1){
                    if(emsIds.indexOf(svgObject.defectId) !== -1){
                        // select the annotation
                        selected.push(annId);
                    }
                }
            });
            return selected;
        },

//         getpage: function(pageNumber){
//             PDFViewerApplication.pdfViewer.renderingQueue.renderView(PDFViewerApplication.pdfViewer.getPageView(pageNumber));
//             PDFViewerApplication.pdfDocument.getPage(pageNumber).then(
//                 pg=>{
//                     console.log(pg);
//                 },
//                 err=>{
//                 });
//         },

//         renderPage: function(pageNumber){
//             const scale = PDFViewerApplication.pdfViewer.currentScale;
//             var ctx = document.querySelector('canvas').getContext('2d');
//             PDFViewerApplication.pdfDocument.getPage(pageNumber).then(
//                 page=>{
//                     const viewport = page.getViewport({scale});
//                     var renderCtx = {
//                         canvasContext: ctx,
//                         viewport
//                     };

//                     page.render(renderCtx).then(()=>{
//                     });
//                     console.log(page);
//                 },
//                 err=>{

//                 });
//         },

        // end of methods
    }



    return SvgGlobalController;
})();
