"use strict";

var SvgHighlight = (function () {

    function SvgHighlight(svgController, annotationId, type, pageNumber, element, rotation, dbobject, angle, maskids, handleids, controlboxids) {
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

        this.isPastedFrom = null;
        this.drawBoxAfterSave = false;

    };

    SvgHighlight.prototype = {
        constructor: SvgHighlight,

        //===============================================
        //================== create =====================
        //===============================================

        beforeCreate: function () {

        },

        create: function (x, y, w, h) {
            var that = this;
            // before
            that.beforeCreate();

            // create
            that.draw(x, y, w, h);
            // that.element.attr({
            //     fill: '',
            //     stroke: '#009EE3',
            //     'stroke-width': 5,
            //     'stroke-dasharray': ""
            // });
            // after
            that.afterCreate();

        },

        afterCreate: function () {
            var that = this;
            that.save();
            that.bindEvents();
            that.createMask();
            if (that.svgController.isDrawing) that.svgController.stopDrawing();

        },

        createNewDbObject: function () {

        },

        draw: function (x, y, w, h) {
            var that = this;
            var rect = that.svgController.paper.rect(x, y, w, h);

            rect.attr({
                fill: '',
                stroke: 'yellow',
                fill: "yellow",
                'stroke-width': 5,
                "opacity": 0.3
            });

            that.element = rect;
            that.element.rotate(that.baseAngle);
            that.element.data("DocumentAnnotationId", that.annotationId);
            return rect;
        },

        //===============================================
        //================== update =====================
        //===============================================

        beforeUpdate: function () {
            var that = this;
            var svgController = that.svgController;
            var paper = svgController.paper;
            var element = that.element;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((paper.height).replace("px", "")) / currentScale;

            var opacity = (element.attr("fill-opacity") + element.attr("opacity")) < 0.01 ?
                "transparent" : element.attr("fill-opacity");
            //points = points.map(m=>AnnotationApplication.CanvasController.getCanvasById(1).getPointer(m));


            var dbObject = {
                DocumentAnnotationId: that.annotationId,
                AnnotationType: that.type,
                ParentId: "", // not implemented yet
                DocumentVersionId: AnnotationApplication.documentVersionId,
                Fill: (element.attr("fill") === "transparent" ? "" : element.attr("fill")),
                Stroke: element.attr("stroke"),
                StrokeWidth: element.attr("stroke-width"),
                Top: element.attr("y") / paperHeight,
                Left: element.attr("x") / paperWidth,
                Width: element.attr("width") / paperWidth,
                Height: element.attr("height") / paperHeight,
                Src: that.url,
                Angle: that.angle ? that.angle : 0, // not implemented yet
                AnnotationName: that.type,
                Opacity: element.attr("opacity"),
                IsSelectable: true,
                IsGroup: false, // not implemented yet
                Scale: "",
                ModifiedBy: null,
                CreatedBy: null,
                DeletedBy: null,
                CreatedOn: null,
                ModifiedOn: null,
                DeletedOn: null,
                EMSNodeId: null, // not implemented yet
                ChildDocumentId: null, // not implemented yet
                PageId: "00000000-0000-0000-0000-000000000000",
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
            that.createMask();
        },

        //===============================================
        //================== save =======================
        //===============================================

        beforeSave: function () {
            var that = this;
            var svgController = that.svgController;
            var paper = svgController.paper;
            var element = that.element;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((paper.height).replace("px", "")) / currentScale;

            var opacity = (element.attr("fill-opacity") + element.attr("opacity")) < 0.01 ?
                "transparent" : element.attr("fill-opacity");
            //points = points.map(m=>AnnotationApplication.CanvasController.getCanvasById(1).getPointer(m));

            var dbObject = {
                DocumentAnnotationId: "00000000-0000-0000-0000-000000000000",
                AnnotationType: that.type,
                ParentId: "", // not implemented yet
                DocumentVersionId: AnnotationApplication.documentVersionId,
                Fill: (element.attr("fill") === "transparent" ? "" : element.attr("fill")),
                Stroke: element.attr("stroke"),
                StrokeWidth: element.attr("stroke-width"),
                Top: element.attr("y") / paperHeight,
                Left: element.attr("x") / paperWidth,
                Width: element.attr("width") / paperWidth,
                Height: element.attr("height") / paperHeight,
                Angle: that.angle ? that.angle : 0, // not implemented yet
                AnnotationName: that.type,
                Opacity: element.attr("opacity"),
                IsSelectable: true,
                IsGroup: false, // not implemented yet
                Scale: "",
                ModifiedBy: null,
                CreatedBy: null,
                DeletedBy: null,
                CreatedOn: null,
                ModifiedOn: null,
                DeletedOn: null,
                EMSNodeId: null, // not implemented yet
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
                var element = that.element;

                // save
                AnnotationApplication.CRUDController.createAnnotation(
                    objectToSave,
                    function (response) {
                        // after
                        that.afterSave(response, objectToSave);
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
            SvgGlobalControllerLogic.addToAnnotations2(that.annotationId, that);

            that.element.data("DocumentAnnotationId", that.annotationId);

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
            if (that.element !== null) that.element.remove();
            if (that.maskids !== null) that.maskids.remove();
            if (that.glow !== null) that.glow.remove();

        },

        //===============================================
        //================== Events =====================
        //===============================================

        bindEvents: function () {
            SvgGlobalControllerLogic.BindEventsToSvgObject(this);
            // var me = this;
            // var elementType = me.type;
            // var element = me.element;
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
            //                 e.preventDefault();
            //                 if (me.svgController.isDrawing === true) return;
            //                 me.isDragging = true;
            //                 me.svgController.clearAllCtrlBoxes(true);
            //                 me.svgController.clearAllJoints();
            //                 me.svgController.clearAllSelectedText();
            //                 me.removeHandles();
            //             })
            //             .touchend(function (e) {
            //                 te = e;
            //                 if (te.timeStamp - ts.timeStamp < 500) {
            //                     // tap

            //                     me.onClick(e);
            //                 }
            //                 try {
            //                     if (that.isDrawing === true) return;
            //                     if (SvgGlobalControllerLogic.selectedIds2.length > 1) {
            //                         SvgGlobalControllerLogic.selectedIds2.forEach(function (id) {
            //                             SvgGlobalControllerLogic.annotations2[id].onElementDragEnd(e);
            //                         });
            //                     } else {
            //                         me.onElementDragEnd(e);
            //                     }
            //                     me.isDragging = false;
            //                 } catch (ex) {
            //                     console.error(ex);
            //                     me.isDragging = false;
            //                 }
            //             })
            //             .touchmove(function (e) {
            //                 tm = e;
            //                 var dx = tm.touches[0].pageX - ts.touches[0].pageX;
            //                 var dy = tm.touches[0].pageY - ts.touches[0].pageY;
            //                 try {
            //                     if (!me.isDragging) return;
            //                     if (that.isDrawing === true) return;
            //                     if (e.which === 3 || me.svgController.contextMenu) return;

            //                     if (SvgGlobalControllerLogic.selectedIds2.length > 1) {
            //                         SvgGlobalControllerLogic.selectedIds2.forEach(function (id) {
            //                             SvgGlobalControllerLogic.annotations2[id].onElementDragging(dx, dy, null, null, e);
            //                         });
            //                     } else {

            //                         me.onElementDragging(dx, dy, null, null, e);
            //                     }
            //                     e.stopPropagation();
            //                 } catch (ex) {
            //                     console.error(ex);
            //                 }
            //             })
            //             .click(function (e) {
            //                 //that.onElementClick(element, paper, elementType);
            //                 me.onClick(e);
            //             })
            //             .mouseover(function (e) {
            //                 that.onElementMouseOver(e);
            //                 SvgGlobalControllerLogic.showGlow(me);
            //             })
            //             .mouseout(function (e) {
            //                 that.onElementMouseOut(e);
            //                 SvgGlobalControllerLogic.hideGlow(me);
            //             })
            //             .dblclick(function () {

            //             })
            //             .mouseup(function (e) {
            //                 //var element = that.getElementByDocId(this.data("DocumentAnnotationId"));
            //                 //me.onMouseUp(e);
            //                 if (e.which === 3 && me.isDragging === false) {
            //                     SvgGlobalControllerLogic.openContextMenu(e, me);
            //                 }else if(e.which === 3 && e.type === 'mouseup'){
            //                     SvgGlobalControllerLogic.openContextMenu(e, me);
            //                 }
            //             })
            //             .drag(
            //                 function (dx, dy, x, y, e) {  // move
            //                     try {
            //                         if (!me.isDragging) return;
            //                         if (that.isDrawing === true) return;
            //                         if (e.which === 3 || me.svgController.contextMenu) return;

            //                         if (SvgGlobalControllerLogic.selectedIds2.length > 1) {
            //                             SvgGlobalControllerLogic.selectedIds2.forEach(function (id) {
            //                                 SvgGlobalControllerLogic.annotations2[id].onElementDragging(dx, dy, x, y, e);
            //                             });
            //                         } else {

            //                             me.onElementDragging(dx, dy, x, y, e);
            //                         }
            //                         e.stopPropagation();
            //                     } catch (ex) {
            //                         console.error(ex);
            //                     }
            //                 }, function (x, y) {  // start
            //                     //me.onElementDragStart(x, y);
            //                     if (that.isDrawing === true) return;
            //                     me.isDragging = true;
            //                     me.svgController.clearAllCtrlBoxes(true);
            //                     me.svgController.clearAllJoints();
            //                     me.svgController.clearAllSelectedText();
            //                     me.removeHandles();
            //                 }, function (e) {  //end
            //                     try {
            //                         if (that.isDrawing === true) return;
            //                         if (SvgGlobalControllerLogic.selectedIds2.length > 1) {
            //                             SvgGlobalControllerLogic.selectedIds2.forEach(function (id) {
            //                                 SvgGlobalControllerLogic.annotations2[id].onElementDragEnd(e);
            //                             });
            //                         } else {
            //                             me.onElementDragEnd(e);
            //                         }
            //                         me.isDragging = false;
            //                     } catch (ex) {
            //                         console.error(ex);
            //                         me.isDragging = false;
            //                     }
            //                 }
            //             );
            //     } catch (ex) {
            //         console.error(ex);
            //     }
            // }
        },

        onClick: function (e) {
            var me = this;
            if (SvgGlobalControllerLogic.isCtrlKeyPressed && SvgGlobalControllerLogic.selectedIds2.indexOf(me.annotationId) < 0) {
                SvgGlobalControllerLogic.selectedIds2.push(me.annotationId);
            } else {
                SvgGlobalControllerLogic.selectedIds2 = [me.annotationId];
                if (AnnotationApplication.RightSidebarController.isSidebarOpen) AnnotationApplication.RightSidebarController.openSidebar(e.item, me.pageNumber, me);
                $(".rightSidebarTabTools").click();
                SvgGlobalControllerLogic.clearAllJoints();
                SvgGlobalControllerLogic.selectedIds2 = [me.annotationId];
            }
            me.showControlBox();
        },

        onElementDragging: function (dx, dy, x, y, e) {
            var that = this;
            var element = that.element;
            var svgController = that.svgController;



            var dxdy = svgController.getDXDY(dx, dy);
            dx = dxdy.dx;
            dy = dxdy.dy;

            if (!this.isDrawing && (Math.abs(dx) + Math.abs(dy) !== 0)) {
                SvgGlobalControllerLogic.isDraggingElement = true;
                var lx = dx;// + ox ;
                var ly = dy;// + oy ;

                element.transform("T" + lx / svgController.getScale() + "," + ly / svgController.getScale() + "r" + that.angle);

            }


            e.stopPropagation();
        },

        onElementDragStart: function (x, y) {
            var that = this;

        },

        onElementDragEnd: function (e) {
            if (!this.isDrawing && SvgGlobalControllerLogic.isDraggingElement) {
                var that = this;
                var svgController = that.svgController;
                var element = that.element;
                var currentScale = PDFViewerApplication.pdfViewer.currentScale;
                var paperWidth = parseFloat((svgController.paper.width).replace("px", "")) / currentScale;
                var paperHeight = parseFloat((svgController.paper.height).replace("px", "")) / currentScale;

                var dx, dy, newX, newY, angle;

                angle = element.matrix.split().rotate;
                element.attr({ "class": "hidden" });
                element.rotate(-angle);
                dx = element.matrix.split().dx;
                dy = element.matrix.split().dy;
                element.rotate(angle);
                element.attr({ "class": "" });
                newX = element.attr("x") + dx;
                newY = element.attr("y") + dy;
                angle = element.matrix.split().rotate;
                that.angle = angle;


                // rollback the empty fill
                //this.restoreMask(element);

                element.rotate(-1 * that.angle);

                newX = newX < 5 ? 0 : newX;
                newY = newY < 5 ? 0 : newY;
                newX = newX > paperWidth ? paperWidth - 10 : newX;
                newY = newY > paperHeight ? paperHeight - 10 : newY;

                element.attr("x", newX);
                element.attr("y", newY);
                element.transform("");
                element.rotate(that.angle);
                that.deleteMask();

                that.update();
            }
        },

        onMouseUp: function (e) {
            var that = this;
            var svgController = that.svgController;
            if (e.which === 3) {
                //SvgGlobalControllerLogic.openContextMenu(that, e);
                if(SvgGlobalControllerLogic.isCtrlKeyPressed){
                    SvgGlobalControllerLogic.selectedIds2.push(that.annotationId);
                }else{
                    SvgGlobalControllerLogic.selectedIds2 = [that.annotationId];
                }
                SvgGlobalControllerLogic.drawSelectBox();
                SvgGlobalControllerLogic.openContextMenu(e, that);
                //e.stopPropagation();
            } else {
                var msg = {
                    exchangeId: AnnotationApplication.documentVersionId,
                    event: {
                        eventType: "AnnotationClick",
                        value: {
                            object: that.type,
                            annotationId: that.annotationId
                        }
                    }
              }
                dataExchange.sendParentMessage('clickObject',msg);
                that.onClick(e);
            }
        },

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
            SvgGlobalControllerLogic.createHandles(this);
        },

        paste: function (e, pageNumber) {
            var that = this;
            var paper = that.svgController.paper;
            var element = that.element;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((paper.height).replace("px", "")) / currentScale;

            var clonedSvgObject = new SvgHighlight(
                SvgGlobalControllerLogic.getSvgController(pageNumber).canvas,
                null,
                that.type,
                pageNumber,
                null,
                that.baseAngle,
                null,
                that.angle,
                [],
                [],
                []
            );

            var x, y;
            if (e === null) {
                x = element.attr("x") + 10;
                y = element.attr("y") + 10;
            } else {

                x = that.svgController.getXY(e, 1 / that.svgController.getScale()).x;
                y = that.svgController.getXY(e, 1 / that.svgController.getScale()).y;
            }

            clonedSvgObject.isPastedFrom = {
                fromSvgObject: that,
                x: x,
                y: y
            };

            clonedSvgObject.create(
                x,
                y,
                element.attr("width"),
                element.attr("height")
            );
            // clonedSvgObject.element.attr({
            //     fill: element.attr("fill"),
            //     stroke: element.attr("stroke"),
            //     'stroke-width': element.attr["stroke-width"],
            //     Opacity: element.attr("opacity")
            // });

            // clonedSvgObject.afterCreate();
        },

        afterPaste: function () {
            var that = this;
            try {
                var element = that.isPastedFrom.fromSvgObject.element;
                var x = that.element.attr("x");
                var y = that.element.attr("y");
                var rotate = element.matrix.split().rotate;

                that.element.attr(element.attrs);
                that.element.attr({
                    x: x,
                    y: y
                });
                //that.element.transform(element.transform());


                if (rotate !== 0) {
                    //that.element.rotate(rotate);
                }
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
            var mask = that.element.clone();

            var that = me.svgController;
            var ts = null;//touchstart
            var te = null;//touchend
            var tm = null;//touchmove

            mask.attr({
                stroke: "white",
                fill: "grey",
                opacity: 0.001
            })
                .scale(1.15, 1.15)
                .toBack();
            SvgGlobalControllerLogic.BindMaskEventsToSvgObject(this, mask);
            me.maskids = mask;
        },

        deleteMask: function () {
            var that = this;
            if (that.maskids !== null) that.maskids.remove();

        },

        // end of methods
    }

    return SvgHighlight;
})();