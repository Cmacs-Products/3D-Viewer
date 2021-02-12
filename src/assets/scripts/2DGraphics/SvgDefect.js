"use strict";

var SvgDefect = (function () {

    function SvgDefect(
        svgController,
        annotationId,
        type,
        pageNumber,
        element,
        rotation,
        dbobject,
        angle,
        defectId) {

        this.svgController = svgController;
        this.annotationId = annotationId;
        this.type = type;
        this.pageNumber = pageNumber;
        this.element = element;
        this.baseAngle = rotation;
        this.angle = angle !== null ? angle : 0;
        this.dbobject = dbobject;
        this.maskids = null;
        this.handleids = null;
        this.controlboxids = null;
        this.glow = null;
        this.isDragging = false;

        this.url = null;
        this.isPastedFrom = null;
        this.drawBoxAfterSave = false;

        this.defectId = defectId;

    };

    SvgDefect.prototype = {
        constructor: SvgDefect,

        //===============================================
        //================== create =====================
        //===============================================

        beforeCreate: function () {
            var that = this;

        },

        create: function (url, x, y, w, h, callback) {
            var that = this;
            url = "";//"/Scripts/PDFJS/images/defect.svg";
            // before
            that.beforeCreate();
            that.angle = that.baseAngle;
            // create
            that.draw(url, x, y, w, h);

            if (callback) callback();
            // after
            that.afterCreate();
            var msg = {
                exchangeId: AnnotationApplication.documentVersionId,
                event: {
                    eventType: "refreshTagGrids",
                    value: {
                        object: "refreshTagGrids",                                     
                    }
                }
          }
            dataExchange.sendParentMessage('refreshTagGrids',msg);

        },

        afterCreate: function () {
            var that = this;
            that.save();
            that.bindEvents(that.element.text);
            that.bindEvents(that.element.rect1);
            that.createMask();
            that.svgController.stopDrawing();

        },

        getUrlByColor: function (color) {
            var url = "/Scripts/PDFJS/images/defect-icon";
            switch (color) {
                case "#EC2C3F": // onHold
                    url += "-onhold.svg";
                    break;
                case "#dddc00": // in progress
                    url += "-inprogress.svg";
                    break;
                case "#00AA4F": // completed
                    url += "-completed.svg";
                    break;
                case "#009EE3": // assigned
                    url += "-assigned.svg";
                    break;
                case "#868D91": // unassigned
                    url += "-unassigned.svg";
                    break;
                default:
                    url += ".svg";
            }
            return url;
        },

        getUrlByStatus: function (status) {
            var url = "/Scripts/PDFJS/images/defect-icon";
            switch (status) {
                case null:
                case undefined:
                case '':
                    url += ".svg";
                    return url;
                default:
                    url += "-" + status.toLowerCase() + ".svg";
                    return url;
            }
        },

        draw: function (url, x, y, w, h,fontSize, callback) {
            var that = this;
            w = 0;
            h = 0;

            if(typeof(x) === 'undefined' && typeof(y) === 'undefined'){
                return;
            }

           // var isStatusOn = false //window.parent.FilterStatusesLogic.isStatusVisible;
            //if(isStatusOn){
                var defect = emsData[that.defectId];//TreeView_L.getTreeItemById(EmsNodeId);
                var status = defect.CurrentStatus;//window.parent.FilterStatusesLogic.GetCurrentElementStatus(EmsNode);
                var color = defect.Color;//window.parent.FilterStatusesLogic.GetStatusColorHex(status);
                // var status = window.parent.FilterStatusesLogic.GetCurrentEmsNodeStatus(that.defectId);
                // var color = window.parent.FilterStatusesLogic.GetStatusColorHex(status);
                url = color;
            //}
            
            if(url.indexOf("Scripts") === -1){
                // check for color
                url = this.getUrlByStatus(emsData[that.defectId].CurrentStatus);
            }else{
                url = "/Scripts/PDFJS/images/defect-icon.svg";
            }
            SvgGlobalControllerLogic.baseAngleDefect = that.baseAngle;
            
            var paper = that.svgController.paper;
            if (url.startsWith("data:image")) {
                var pin = paper.image("", x-10, y-20, 20, 20);
                pin.attr({ src: url });
            } else {
                var pin = paper.image(url, x-10, y-20, 20, 20);
            }
            //that.bindEventsToElement(stamp, paper, 'stamp');
            pin.attr({
                fill: '',
                //stroke: '#009EE3',
                'stroke-width': 5,
                'stroke-dasharray': false ? "" : "."
            });
            if (false) {
                stamp.data("Angle", -1 * that.getPageRotation());
                stamp.rotate(-1 * that.getPageRotation());
                that.createStampOnDb(stamp);
            }




//================================================================

            var currentScale = PDFViewerApplication.pdfViewer.currentScale;

            var EmsNodeId = this.defectId ? this.defectId : AnnotationApplication.DrawStateService.getEmsNode().id;
            //const EmsNodeId = that.svgController.dbAnnotations.find(a=>a.DocumentAnnotationId == that.annotationId).EMSNodeId;
            var EmsNode = emsData[EmsNodeId];
            EmsNode.name = EmsNode.Name;
            // var EmsNode =  AnnotationApplication.DrawStateService.getDefectNode(); //that.defectId ? window.parent.TreeView_L.getTreeItemDataById(that.defectId) :
            // var EMSNodeName = EmsNode.name;

            var value = EmsNode.name;
            that.emsNodeId = that.defectId;


            
            var text = paper.text(x, y, value)
                .attr({
                    fill: SvgGlobalControllerLogic.defaultDefectTextColor,
                    //stroke: 'blue',
                    //'stroke-width': 5,
                    //'stroke-dasharray': insertToDb ? "" : "."
                });
            //var fontSize = 10;
            //var fontSize = SvgGlobalControllerLogic.defaultDefectFontSize;
            fontSize = (fontSize === undefined || fontSize === null) ? 10 : fontSize;
            text.attr("font-size", fontSize);
            var bbox = text.getBBox();



            var rect1 = paper.rect(
                bbox.x - 3,
                bbox.y - 3,
                (bbox.width + 16),
                (bbox.height + 6)
            );

            var circle = paper.circle(
                pin.attrs.x + 16.5,
                pin.attrs.y + 29,
                2.5,
                

            )

            var bbox = text.getBBox();
            var emsNode = emsData[that.defectId];//TreeView_L.getTreeItemById(EmsNodeId);
            var status = emsNode.CurrentStatus;//window.parent.FilterStatusesLogic.GetCurrentElementStatus(EmsNode);
            var color = emsNode.Color;//window.parent.FilterStatusesLogic.GetStatusColorHex(status);

            // to relocate the textbox because of the center point
            circle.attr({
               
                'fill': color,
                'stroke': color

            });
            pin.attr({
                'fill': color,
            })



            rect1.attr({
                x: x,
                y: y,
                fill: SvgGlobalControllerLogic.defaultDefectFillColor,
                stroke: SvgGlobalControllerLogic.defaultDefectStrokeColor
            });
            

            var tempText = text.clone();
            text.remove();
            text = tempText;

            text.attr({
                x: x + 12 + bbox.width / 2,
                y: y + 3 + bbox.height / 2
            });
            


            
            




            var pageRotation = that.svgController.getPageRotation();
            var centerDifference = (rect1.attr("width") - rect1.attr("height")) / 2;
            switch (Math.abs(that.baseAngle % 360)) {
                case 0:

                    break;
                case 90:
                    rect1.attr({
                        x: rect1.attr("x") - centerDifference,
                        y: rect1.attr("y") + h - rect1.attr("height") - centerDifference,
                    });
                    pin.attr({
                        x: x - 20,//rect1.attr("height"),
                        y: y + h - 10,
                    });
                    text.attr({
                        x: rect1.attr("x") + rect1.attr("width") / 2,
                        y: (rect1.attr("y") + rect1.attr("height") / 2) - 4,
                    });
                    circle.attr({    
                        cx: pin.attr("x") + 29,
                        cy: pin.attr("y") + 3

                    });
                    rect1.rotate(-90);
                    pin.rotate(-90);
                    circle.rotate(-90);
                    text.rotate(-90);
                    break;
                case 180:
                    rect1.attr({
                        x: rect1.attr("x") + w - rect1.attr("width"),
                        y: rect1.attr("y") + h - rect1.attr("height"),
                    });
                    pin.attr({
                        x: x + w -10,//rect1.attr("height"),
                        y: y + h,
                    });
                    text.attr({
                        x: (rect1.attr("x") + rect1.attr("width") / 2) - 3,
                        y: rect1.attr("y") + rect1.attr("height") / 2,
                    });
                    circle.attr({    
                        cx: pin.attr("x") + 5,
                        cy: pin.attr("y") - 10

                    });
                    rect1.rotate(-180);
                    pin.rotate(-180);
                    circle.rotate(-180);
                    text.rotate(-180);
                    break;
                case 270:
                    rect1.attr({
                        x: rect1.attr("x") + w - (rect1.attr("width")) + centerDifference,
                        y: rect1.attr("y") + centerDifference,
                    });
                    pin.attr({
                        x: x + w,//rect1.attr("height"),
                        y: y -10,
                    });
                    text.attr({
                        x: rect1.attr("x") + rect1.attr("width") / 2,
                        y: (rect1.attr("y") + rect1.attr("height") / 2) + 3,
                    });
                    circle.attr({
                        
                        cx: pin.attr("x") - 9,
                        cy: pin.attr("y") + 15

                    });
                    rect1.rotate(-270);
                    pin.rotate(-270);
                    circle.rotate(-270);
                    text.rotate(-270);
                    break;
            }






            // if (insertToDb) {
            //     emsElementSet.rotate(-1 * that.getPageRotation());
            //     emsElementSet.setAngle(-1 * that.getPageRotation());
            //     that.createEmsElementOnDb(emsElementSet);
            // }

            that.element = {
                text: text,
                rect1: rect1,
                pin: pin,
                circle:circle
            }

            that.element.text.data("DocumentAnnotationId", that.annotationId);
            that.element.rect1.data("DocumentAnnotationId", that.annotationId);
            that.element.pin.data("DocumentAnnotationId", that.annotationId);
            that.element.circle.data("DocumentAnnotationId", that.annotationId);

            var iconType = 'type_default'//window.parent.FilterStatusesLogic.selectedIconType;
            SvgGlobalControllerLogic.updateEmsIcon(that, iconType);




//==========================================================

            // that.element = stamp;
            // that.element.rotate(that.angle);
            // that.element.data("DocumentAnnotationId", that.annotationId);
            if (callback) callback();
            return that.element;
        },

        //===============================================
        //================== update =====================
        //===============================================

        beforeUpdate: function () {
            var that = this;
            var svgController = that.svgController;
            var paper = svgController.paper;
            var text = that.element.text;
            var rect1 = that.element.rect1;
            var pin = that.element.pin;
            var circle = that.element.circle;

            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((paper.height).replace("px", "")) / currentScale;


            var dbObject = {
                DocumentAnnotationId: that.annotationId,
                AnnotationType: that.type,
                ParentId: "", // not implemented yet
                DocumentVersionId: AnnotationApplication.documentVersionId,
                Fill: rect1.attr("fill"),
                TagCircle: circle.attr("fill"),
                Stroke: rect1.attr("stroke"),
                StrokeWidth: rect1.attr("stroke-width"),
                Top: rect1.attr("y") / paperHeight,
                Left: rect1.attr("x") / paperWidth,
                Width: rect1.attr("width") / paperWidth,
                Height: rect1.attr("height") / paperHeight,
                Src: pin.attr("src"),
                Angle: that.baseAngle,
                AnnotationName: that.type,
                IsSelectable: true,
                Text: text.attr("text"),
                FontSize: text.attr("font-size"),
                IsGroup: false, // not implemented yet
                Scale: "",
                Version: "v2",
                Opacity: rect1.attr("opacity"),
                ModifiedBy: rect1.getModifiedBy(),
                CreatedBy: rect1.getCreatedBy(),
                DeletedBy: null,
                CreatedOn: null,
                ModifiedOn: null,
                DeletedOn: null,
                EMSNodeId: that.defectId, // not implemented yet
                ChildDocumentId: null, // not implemented yet
                PageId: rect1.getPageId(),
                PageNumber: that.pageNumber,
                childrenIds: null // not implemented yet
            }

            console.log("beforeUpdate", dbObject);
            return dbObject;
        },

        update: function () {
            var that = this;
            var paper = that.svgController.paper;
            var element = that.element;

            // before
            var dbObject = that.beforeUpdate();

            // update
            AnnotationApplication.CRUDController.updateAnnotation(dbObject, function (response) {
                console.log("update", dbObject);
                that.afterUpdate(dbObject);
            });

        },

        afterUpdate: function (dbObject) {
            var that = this;
            var paper = that.svgController.paper;
            var element = that.element;

            LocalAnnotationsControllerLogic.updateAnnotation(
                AnnotationApplication.documentVersionId,
                that.pageNumber,
                dbObject,
                that);

            if (AnnotationApplication.RightSidebarController.isSidebarOpen) {
                if ((element.type === "set" && element.items[0].getAnnotationType() === "measurementbasic")
                    || (element.type !== "set" && element.getAnnotationType() === "measurementbasic")
                    || element.type === "set" && element.items[0].getAnnotationType() === "emsgroup") {
                    AnnotationApplication.RightSidebarController.closeSidebar();
                    AnnotationApplication.RightSidebarController
                        .openSidebar(
                            element,
                            that.pageNumber,
                            element
                        );
                    $(".rightSidebarTabTools").click();
                    SvgGlobalControllerLogic.selectedObject = {
                        element: element,
                        svgController: that.svgController
                    }
                }
            }
            console.log("afterUpdate", dbObject);
        },

        //===============================================
        //================== save =======================
        //===============================================

        beforeSave: function () {
            var that = this;
            var text = that.element.text;
            var rect1 = that.element.rect1;
            var pin = that.element.pin;
            var circle = that.element.circle;

            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((that.svgController.paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((that.svgController.paper.height).replace("px", "")) / currentScale;

            var dbObject = {
                DocumentAnnotationId: "00000000-0000-0000-0000-000000000000",
                AnnotationType: that.type,
                ParentId: "", // not implemented yet
                DocumentVersionId: AnnotationApplication.documentVersionId,
                Fill: rect1.attr("fill"),
                TagCircle: circle.attr("fill"),
                Stroke: rect1.attr("stroke"),
                StrokeWidth: rect1.attr("stroke-width"),
                Top: rect1.attr("y") / paperHeight,
                Left: rect1.attr("x") / paperWidth,
                Width: rect1.attr("width") / paperWidth,
                Height: rect1.attr("height") / paperHeight,
                Src: pin.attr("src"),
                Angle: that.baseAngle,
                AnnotationName: that.type,
                IsSelectable: true,
                Text: text.attr("text"),
                FontSize: text.attr("font-size"),
                IsGroup: false, // not implemented yet
                Scale: "",
                Opacity: rect1.attr("opacity"),
                ModifiedBy: null,
                CreatedBy: null,
                DeletedBy: null,
                CreatedOn: null,
                ModifiedOn: null,
                DeletedOn: null,
                EMSNodeId: that.defectId, // not implemented yet
                ChildDocumentId: null, // not implemented yet
                PageId: "00000000-0000-0000-0000-000000000000",
                PageNumber: that.pageNumber,
                childrenIds: null // not implemented yet
            }

            console.log("beforeSave", dbObject);
            return dbObject;
        },

        save: function (resolve, reject) {
            var that = this;
            // before
            var objectToSave = that.beforeSave();
            console.log("save", objectToSave);
            return new Promise(function (resolve, reject) {
                // save
                AnnotationApplication.CRUDController.createAnnotation(
                    objectToSave,
                    function (response) {
                        // after
                        that.afterSave(response, objectToSave);
                        var msg = {
                            exchangeId: AnnotationApplication.documentVersionId,
                            event: {
                                eventType: "refreshTagGrids",
                                value: {
                                    object: "refreshTagGrids",                                     
                                }
                            }
                      }
                        dataExchange.sendParentMessage('refreshTagGrids',msg);
                        
                    });
            });
        },

        afterSave: function (response, objectToSave) {
            var that = this;
            // updating annotation List
            var annList = $("#annotationListContainer");
            if (annList.length > 0) {
                AnnotationApplication.RightSidebarController.showAnnotationList();
            }

            objectToSave.DocumentAnnotationId = response.DocumentAnnotationId;
            that.annotationId = response.DocumentAnnotationId;
            console.log("afterSave", that.annotationId);
            // add to local
            LocalAnnotationsControllerLogic.addAnnotation(
                AnnotationApplication.documentVersionId,
                that.pageNumber,
                objectToSave,
                that);
            //that.element.data("DocumentAnnotationId", that.annotationId);
            SvgGlobalControllerLogic.addToAnnotations2(that.annotationId, that);

            that.element.text.data("DocumentAnnotationId", that.annotationId);
            that.element.rect1.data("DocumentAnnotationId", that.annotationId);
            that.element.pin.data("DocumentAnnotationId", that.annotationId);
            that.element.circle.data("DocumentAnnotationId", that.annotationId);

            if(that.isPastedFrom !== null){
                that.afterPaste(that.isPastedFrom);
            }
            if(that.drawBoxAfterSave){
                SvgGlobalControllerLogic.drawSelectBox([that.annotationId]);
                that.drawBoxAfterSave = false;
            }
        },

        //===============================================
        //================== delete =====================
        //===============================================

        beforeDelete: function () {
            var that = this;

        },

        Delete: function () {
            var that = this;
            // before
            that.beforeDelete();

            // Delete
            var IdsToRemove = [that.annotationId];
            AnnotationApplication.CRUDController.confirmDelete(IdsToRemove, function () {

                AnnotationApplication.Utils.refreshEmsTagLists();
                that.remove();
                SvgGlobalControllerLogic.clearAllJoints();

                AnnotationApplication.CRUDController.deleteAnnotation(IdsToRemove, that.afterDelete());

            });

            // after
            that.afterDelete();
        },

        afterDelete: function () {
            var that = this;

        },

        remove: function () {
            var that = this;
            if (that.element){
              that.element.text.remove();
              that.element.rect1.remove();
              that.element.pin.remove();
              that.element.circle.remove();
            }
            that.deleteMask();
        },

        //===============================================
        //================== Events =====================
        //===============================================

        bindEvents: function (element) {
            SvgGlobalControllerLogic.BindEventsToSvgObject(this);
            // var me = this;
            // var elementType = me.type;
            // var paper = me.svgController.paper;
            // if (ROLE !== "Anonymous") {
            //     try {
            //         var that = me.svgController;
            //         var ts = null;//touchstart
            //         var te = null;//touchend
            //         var tm = null;//touchmove

            //         element
            //             .touchstart(function (e) {
            //                 //console.log("touchstart", e);
            //                 ts = e;
            //             })
            //             .touchend(function (e) {
            //                 //console.log("touchend", e);
            //                 te = e;
            //                 if (te.timeStamp - ts.timeStamp < 500) {
            //                     // tap
            //                     if (elementType === "measurementbasic") {
            //                         console.log("text dbl clicked!");
            //                         that.clearAllJoints();
            //                         that.openMeasurementScaleEdit(element);
            //                         that.onElementClick(element, paper, elementType);
            //                     } else {
            //                         that.onElementClick(element, paper, elementType);
            //                     }


            //                 }
            //             })
            //             .touchmove(function (e) {
            //                 //console.log("touchmove", e);
            //                 tm = e;

            //             })
            //             .click(function (e) {
            //                 //that.onElementClick(element, paper, elementType);
            //                 //me.onClick(e);
            //             })
            //             .mouseover(function (e) {
            //                 that.onElementMouseOver(e);
            //             })
            //             .mouseout(function (e) {
            //                 that.onElementMouseOut(e);
            //             })
            //             .dblclick(function () {

            //             })
            //             .mouseup(function (e) {
            //                 me.onMouseUp(e);
            //             })
            //             .drag(
            //                 function (dx, dy, x, y, e) {  // move
            //                     if (e.which === 3 || me.svgController.contextMenu) return;
            //                     if (SvgGlobalControllerLogic.selectedIds2.length > 0) {
            //                         var objectsToDrag = Object.keys(SvgGlobalControllerLogic.selectedIds2);
            //                         console.log(objectsToDrag);
            //                         SvgGlobalControllerLogic.selectedIds2.forEach(function (id) {
            //                             SvgGlobalControllerLogic.annotations2[id].onElementDragging(dx, dy, x, y, e);
            //                         });
            //                     } else {
            //                         me.onElementDragging(dx, dy, x, y, e);
            //                     }
            //                     e.stopPropagation();
            //                 }, function (x, y) {  // start
            //                     me.onElementDragStart(x, y);
            //                 }, function (e) {  //end
            //                     if(SvgGlobalControllerLogic.selectedIds2.length>0){
            //                         SvgGlobalControllerLogic.selectedIds2.forEach(function (id) {
            //                             SvgGlobalControllerLogic.annotations2[id].onElementDragEnd(e);
            //                         });
            //                     }else{
            //                         me.onElementDragEnd(e);
            //                     }
            //                 }
            //             );
            //     } catch (ex) {
            //         console.error(ex);
            //     }
            // }
        },

        onMouseUp: function (e) {
            var that = this;
            var svgController = that.svgController;
            if (e.which === 3) {
                if(SvgGlobalControllerLogic.isCtrlKeyPressed){
                    SvgGlobalControllerLogic.selectedIds2.push(that.annotationId);
                }else{
                    SvgGlobalControllerLogic.selectedIds2 = [that.annotationId];
                }
                SvgGlobalControllerLogic.drawSelectBox();
                //SvgGlobalControllerLogic.rightClickHandler(that, e);
                SvgGlobalControllerLogic.openContextMenu(e, that);
                //e.stopPropagation();
            } else {
                that.onClick(e);
            }
        },

        onClick: function (e) {
            var me = this;
            if (SvgGlobalControllerLogic.isCtrlKeyPressed){
                if(SvgGlobalControllerLogic.selectedIds2.indexOf(me.annotationId) < 0) {
                    SvgGlobalControllerLogic.selectedIds2.push(me.annotationId);
                }
            } else {
                SvgGlobalControllerLogic.selectedIds2 = [me.annotationId];
                if (AnnotationApplication.RightSidebarController.isSidebarOpen) AnnotationApplication.RightSidebarController.openSidebar(e.item, me.pageNumber, me);
                $(".rightSidebarTabTools").click();
                SvgGlobalControllerLogic.clearAllJoints();
                SvgGlobalControllerLogic.selectedIds2 = [me.annotationId];
            }
            SvgGlobalControllerLogic.drawSelectBox();
            //if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
                //TreeView_L.scrollToSelectedEmsNode(me.emsNodeId, true);
                dataExchange.sendParentMessage('selectObject',emsData[me.defectId]);
                // window.parent.ThreeD_VL.selectFromTree(window.parent.TreeView_L.getTreeItemDataById(me.defectId));
            //}
            //me.showControlBox();
        },

        onElementDragStart: function (x, y) {

        },

        onElementDragging: function (dx, dy, x, y, e) {
            var that = this;
            var svgController = that.svgController;
            var dxdy = svgController.getDXDY(dx, dy);
            dx = dxdy.dx;
            dy = dxdy.dy;
            var scale = PDFViewerApplication.pdfViewer.currentScale;
            try {
                if (!that.svgController.isDrawing && (Math.abs(dx) + Math.abs(dy) !== 0)) {
                    SvgGlobalControllerLogic.isDraggingElement = true;
                    var lx = dx;// + ox ;
                    var ly = dy;// + oy ;

                    that.element.text.transform("T" + lx / that.svgController.getScale() + "," + ly / that.svgController.getScale() + "r" + -that.baseAngle);
                    that.element.rect1.transform("T" + lx / that.svgController.getScale() + "," + ly / that.svgController.getScale() + "r" + -that.baseAngle);
                    that.element.pin.transform("T" + lx / that.svgController.getScale() + "," + ly / that.svgController.getScale() + "r" + -that.baseAngle);
                    that.element.circle.transform("T" + lx / that.svgController.getScale() + "," + ly / that.svgController.getScale() + "r" + -that.baseAngle);
                    

                    if (typeof that.element.qr !== 'undefined') {
                        that.element.qr.transform("T" + lx / that.svgController.getScale() + "," + ly / that.svgController.getScale() + "r" + -that.baseAngle);
                    }
                }

            } catch (ex) {
                console.error(ex);
            }
        },



        onElementDragEnd: function (e) {
            var that = this;
            if (!that.svgController.isDrawing && SvgGlobalControllerLogic.isDraggingElement) {


                var that = this;
                var svgController = that.svgController;
                //var element = that.element;
                var currentScale = PDFViewerApplication.pdfViewer.currentScale;
                var paperWidth = parseFloat((svgController.paper.width).replace("px", "")) / currentScale;
                var paperHeight = parseFloat((svgController.paper.height).replace("px", "")) / currentScale;

                that.element.text.rotate(that.baseAngle);
                that.element.rect1.rotate(that.baseAngle);
                that.element.circle.rotate(that.baseAngle);
                that.element.pin.rotate(that.baseAngle);
                
                var dx, dy, newX, newY, angleText,angleRect;
                var newRectX, newRectY, newPinX, newPinY, newRect2X,newRect2Y;
                
                that.element.text.attr({"class": "hidden"});
                that.element.rect1.attr({"class": "hidden"});
                that.element.pin.attr({"class": "hidden"});
                
                dx = that.element.text.matrix.split().dx;
                dy = that.element.text.matrix.split().dy;
                

                that.element.text.attr({"class": ""});
                that.element.rect1.attr({"class": ""});
                that.element.pin.attr({"class": ""});
                newX = that.element.text.attr("x") + dx;
                newY = that.element.text.attr("y") + dy;
                newRectX = that.element.rect1.attr("x") + dx;
                newRectY = that.element.rect1.attr("y") + dy;
                newPinX = that.element.pin.attr("x") + dx;
                newPinY = that.element.pin.attr("y") + dy;
               
             
               

                newRectX = newRectX < 5 ? 0 : newRectX;
                newRectY = newRectY < 5 ? 0 : newRectY;
                newRectX = newRectX > paperWidth ? paperWidth - 250 : newRectX;
                newRectY = newRectY > paperHeight ? paperHeight - 60: newRectY;

             

                newX = newX < 5 ? (newRectX + 32) : newX;
                newY = newY < 5 ? (newRectY + 2) : newY;
                newX = newX > paperWidth ? (newRectX + 32) : newX;
                newY = newY > paperHeight ? (newRectY + 9): newY;

                newPinX = newPinX < 5 ? newRectX -10 : newPinX;
                newPinY = newPinY < 5 ? newRectY -20 : newPinY;
                newPinX = newPinX > paperWidth ? newRectX -10 : newPinX;
                newPinY = newPinY > paperHeight ? newRectY -20 : newPinY;

                



                that.element.text.attr("x", newX);
                //var bbox = that.element.text.getBBox();
                that.element.rect1.attr("x", newRectX);
               // that.element.rect1.attr("width", (bbox + 16) );
                that.element.pin.attr("x",  newPinX);
               // if (that.element.rect2 !== null) that.element.rect2.attr("x", newRect2X);
                if (typeof that.element.qr !== 'undefined') {
                    that.element.qr.attr("x", newX);
                }

                
                that.element.text.attr("y",  newY);
                that.element.rect1.attr("y",  newRectY);

                that.element.pin.attr("y",  newPinY);
                // if (that.element.rect2 !== null) {
                //     that.element.rect2.attr("y", newRect2Y);
                //     that.element.rect2.realPath = null;
                // }
                if (typeof that.element.qr !== 'undefined') {
                    that.element.qr.attr("y", newY);
                }
                switch (Math.abs(that.baseAngle % 360)) {
                    case 0:
                        that.element.circle.attr("x",that.element.pin.attrs.x + 16.5);
                        that.element.circle.attr("y",that.element.pin.attrs.y + 29 );
                        that.element.circle.attr("cx",that.element.pin.attrs.x + 16.5 );
                        that.element.circle.attr("cy",that.element.pin.attrs.y + 29 );
                        break;
                    case 90:
                       // that.element.circle.attr("x",that.element.pin.attrs.x + 29);
                        //that.element.circle.attr("y",that.element.pin.attrs.y - 0.35);
                        that.element.circle.attr("cx",that.element.pin.attrs.x +29);
                        that.element.circle.attr("cy",that.element.pin.attrs.y + 4 );
                        break;
                    case 180:
                       // that.element.circle.attr("x",that.element.pin.attrs.x + 10);
                        //that.element.circle.attr("y",that.element.pin.attrs.y + 5 );
                        that.element.circle.attr("cx",that.element.pin.attrs.x + 4 );
                        that.element.circle.attr("cy",that.element.pin.attrs.y - 9 );
                        break;
                    case 270:
                        //that.element.circle.attr("x",that.element.pin.attrs.x - 10);
                        //that.element.circle.attr("y",that.element.pin.attrs.y + 5 );
                        that.element.circle.attr("cx", that.element.pin.attrs.x - 9 );
                        that.element.circle.attr("cy",that.element.pin.attrs.y + 15  );
                        break;
                    default:
                        break;

                }
                

                that.element.text.transform("");
                that.element.rect1.transform("");
                that.element.circle.transform("");
                that.element.pin.transform("");
               // if (that.element.rect2 !== null) that.element.rect2.transform("");
                if (typeof that.element.qr !== 'undefined') {
                    that.element.qr.transform("");
                }

                that.element.text.rotate(that.baseAngle);
                that.element.rect1.rotate(-that.baseAngle);
                that.element.circle.rotate(-that.baseAngle);
                that.element.pin.rotate(that.baseAngle);
                // that.element.text.rotate(that.baseAngle);
                // that.element.rect1.rotate(that.baseAngle);
                // that.element.circle.rotate(that.baseAngle);
                // that.element.pin.rotate(that.baseAngle);
                //if (that.element.rect2 !== null) //that.element.rect2.rotate(-that.baseAngle);
                    if (typeof that.element.qr !== 'undefined') {
                        that.element.qr.rotate(-that.baseAngle);
                    }

                that.deleteMask();
                that.update();            }
        },


        // onElementDragEnd: function (e) {
        //     var that = this;
        //     if (!that.svgController.isDrawing && SvgGlobalControllerLogic.isDraggingElement) {


        //         that.element.text.rotate(that.baseAngle);
        //         that.element.rect1.rotate(that.baseAngle);
        //         that.element.circle.rotate(that.baseAngle);

        //         var dx = that.element.text.matrix.split().dx;
        //         var dy = that.element.text.matrix.split().dy;



        //         that.element.text.transform("");
        //         that.element.rect1.transform("");
        //         that.element.pin.transform("");
        //         that.element.circle.transform("");
                
        //         if (typeof that.element.qr !== 'undefined') {
        //             that.element.qr.transform("");
        //         }

        //         that.element.text.attr("x", that.element.text.attr("x") + dx);
        //         that.element.rect1.attr("x", that.element.rect1.attr("x") + dx);
        //         that.element.pin.attr("x", that.element.pin.attr("x") + dx);
                
        //         if (typeof that.element.qr !== 'undefined') {
        //             that.element.qr.attr("x", that.element.qr.attr("x") + dx);
        //         }

        //         that.element.text.attr("y", that.element.text.attr("y") + dy);
        //         that.element.rect1.attr("y", that.element.rect1.attr("y") + dy);
        //         that.element.pin.attr("y", that.element.pin.attr("y") + dy);
                
        //         if (typeof that.element.qr !== 'undefined') {
        //             that.element.qr.attr("y", that.element.qr.attr("y") + dy);
        //         }

        //         that.element.circle.attr("x",that.element.pin.attrs.x + 16.5);
        //         that.element.circle.attr("y",that.element.pin.attrs.y + 29 );
        //         that.element.circle.attr("cx",that.element.pin.attrs.x + 16.5 );
        //         that.element.circle.attr("cy",that.element.pin.attrs.y + 29 )

        //         that.element.text.rotate(-that.baseAngle);
        //         that.element.rect1.rotate(-that.baseAngle);
        //         that.element.circle.rotate(-that.baseAngle);
        //         that.element.pin.rotate(-that.baseAngle);
        //             if (typeof that.element.qr !== 'undefined') {
        //                 that.element.qr.rotate(-that.baseAngle);
        //             }

        //         that.deleteMask();
        //         that.update();
        //     }
        // },

        //===============================================
        //================== Controls ===================
        //===============================================

        showControlBox: function () {
            var me = this;
            //me.drawBorder();
            me.removeHandles();
            me.createHandles();
        },

        showGlow: function () {
            var that = this;
            if (that.glow === null) {
                that.glow = that.element.glow();
                that.glow.toBack();
            }
        },

        hideGlow: function () {
            var that = this;
            if (that.glow !== null) {
                that.glow.remove();
                that.glow = null;
            }
        },

        removeHandles: function () {
            var that = this;
            if (that.handleids !== null) {
                that.handleids.forEach(function (handle) {
                    that.removeHandle(handle);
                });
            }
            if (that.controlboxids !== null) {
                that.controlboxids.remove();
            }
        },

        removeHandle: function (handle) {
            handle.remove();
        },

        createHandles: function () {
            //SvgGlobalControllerLogic.createHandles(this);
        },

        paste: function (e, pageNumber) {
            var that = this;
            var paper = that.svgController.paper;
            var element = that.element;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((paper.height).replace("px", "")) / currentScale;

            var clonedSvgObject = new SvgDefect(
                SvgGlobalControllerLogic.getSvgController(pageNumber).canvas,
                null,
                that.type,
                pageNumber,
                null,
                that.baseAngle,
                null,
                that.baseAngle,
                that.defectId,
                [],
                [],
                []
            )

            
            //x, y, w, h, emsNodeId, drawQr, insertToDb, fontSize
            var x,y;
            if(e === null){
                x = element.text.attr("x") + 10;
                y = element.text.attr("y") + 10;
            }else{
                
                x = that.svgController.getXY(e, 1 / that.svgController.getScale()).x;
                y = that.svgController.getXY(e, 1 / that.svgController.getScale()).y;
            }

            try {
                clonedSvgObject.isPastedFrom = {
                    fromSvgObject:that,
                    x:x,
                    y:y
                };
                clonedSvgObject.create(
                    "",
                    x,
                    y,
                    (element.rect1 !== null) ? element.rect1.attr("width") : 0,
                    (element.rect1 !== null) ? element.rect1.attr("height") : 0
                );
            } catch (ex) {
                console.error(ex);
            }

        },

        afterPaste: function () {
            var that = this;
            try {
                var element = that.isPastedFrom.fromSvgObject.element;
                var tx = that.element.text.attr("x");
                var ty = that.element.text.attr("y");
                var rx = that.element.rect1.attr("x");
                var ry = that.element.rect1.attr("y");

                that.element.text.attr(element.text.attrs);
                that.element.text.attr({
                    x: tx,
                    y: ty
                });

                that.element.rect1.attr(element.rect1.attrs);
                that.element.rect1.attr({
                    x: rx,
                    y: ry
                });

                //that.element.transform(element.transform());


               
                //that.afterCreate();
                that.isPastedFrom = null;
                that.update();
                SvgGlobalControllerLogic.selectedIds2.push(that.annotationId);
                SvgGlobalControllerLogic.drawSelectBox([that.annotationId]);

            } catch (ex) {
                console.error(ex);
            }
        },

        createMask: function () {
            var that = this;
            var me = that;
            var svgController = that.svgController;
            that.deleteMask();
            that.maskids = [];
            Object.keys(that.element).forEach(function (element) {
                var mask = that.element[element].clone();
                mask.attr({
                    stroke: "white",
                    fill: "white",
                    opacity: 0.01
                })
                    // .touchstart(function (e) {
                    //     //console.log("touchstart", e);
                    //     ts = e;
                    // })
                    // .touchend(function (e) {
                    //     //console.log("touchend", e);
                    //     te = e;
                    //     if (te.timeStamp - ts.timeStamp < 500) {
                    //         // tap
                    //         if (elementType === "measurementbasic") {
                    //             console.log("text dbl clicked!");
                    //             that.clearAllJoints();
                    //             that.openMeasurementScaleEdit(element);
                    //             that.onElementClick(element, paper, elementType);
                    //         } else {
                    //             that.onElementClick(element, paper, elementType);
                    //         }


                    //     }
                    // })
                    // .touchmove(function (e) {
                    //     //console.log("touchmove", e);
                    //     tm = e;

                    // })
                    // .click(function (e) {
                    //     //that.onElementClick(element, paper, elementType);
                    //     me.onClick(e);
                    // })
                    // .mouseover(function (e) {
                    //     svgController.onElementMouseOver(e);
                    //     SvgGlobalControllerLogic.showGlow(me);
                    //     me.showInfoPopUp();
                    // })
                    // .mouseout(function (e) {
                    //     svgController.onElementMouseOut(e);
                    //     SvgGlobalControllerLogic.hideGlow(me);
                    //     me.closeInfoPopUp();
                    // })
                    // .dblclick(function () {

                    // })
                    // .mouseup(function (e) {
                    //     //me.onMouseUp(e);
                    //     var that = this;
                    //     var svgController = that.svgController;
                    //     if (e.which === 3) {
                    //         SvgGlobalControllerLogic.rightClickHandler(that, e);
                    //         //e.stopPropagation();
                    //     }
                    // })
                    // .drag(
                    //     function (dx, dy, x, y, e) {  // move
                    //         if (e.which === 3 || me.svgController.contextMenu) return;

                    //         if (SvgGlobalControllerLogic.selectedIds2.length > 0) {
                    //             var objectsToDrag = Object.keys(SvgGlobalControllerLogic.selectedIds2);
                    //             console.log(objectsToDrag);
                    //             SvgGlobalControllerLogic.selectedIds2.forEach(function (id) {
                    //                 SvgGlobalControllerLogic.annotations2[id].onElementDragging(dx, dy, x, y, e);
                    //             });
                    //         } else {
                    //             me.onElementDragging(dx, dy, x, y, e);
                    //         }
                    //         //e.stopPropagation();
                    //     }, function (x, y) {  // start
                    //         me.onElementDragStart(x, y);
                    //     }, function (e) {  //end
                    //         if (SvgGlobalControllerLogic.selectedIds2.length > 0) {
                    //             SvgGlobalControllerLogic.selectedIds2.forEach(function (id) {
                    //                 SvgGlobalControllerLogic.annotations2[id].onElementDragEnd(e);
                    //             });
                    //         } else {
                    //             me.onElementDragEnd(e);
                    //         }
                    //     }
                    // )

                    .scale(1.15, 1.15)
                    .toBack();
                SvgGlobalControllerLogic.BindMaskEventsToSvgObject(that, mask);
                that.maskids.push(mask);
            });

        },

        deleteMask: function () {
            var that = this;
            if (that.maskids !== null) that.maskids.forEach(function (mask) { mask.remove() });

        },



        // end of methods
    }

    return SvgDefect;
})();