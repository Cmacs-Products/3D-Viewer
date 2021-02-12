"use strict";

var SvgFreeDraw = (function () {

    function SvgFreeDraw(svgController, annotationId, type, pageNumber, element, rotation, dbobject, angle, maskids, handleids, controlboxids) {
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

        this.points = [];

        this.drawBoxAfterSave = false;

    };

    SvgFreeDraw.prototype = {
        constructor: SvgFreeDraw,

        //===============================================
        //================== create =====================
        //===============================================

        beforeCreate: function () {

        },

        create: function (points) {
            var that = this;
            // before
            that.beforeCreate();

            // create
            that.draw(points);
            that.element.attr({
                fill: '',
                stroke: SvgGlobalControllerLogic.defaultStrokeColor,
                'stroke-width': SvgGlobalControllerLogic.defaultStrokeWidth,
                'stroke-dasharray': ""
            });
            // after
            that.afterCreate();

        },

        afterCreate: function () {
            var that = this;
            that.save();
            that.bindEvents();
            that.createMask();
            //that.svgController.tempElement = null; // to keep drawing if one the user hasn't clicked on freeDraw icon yet to stop
            //if (that.svgController.isDrawing) that.svgController.stopDrawing();

        },

        createNewDbObject: function () {

        },

        draw: function (points) {
            var that = this;
            that.points = points;
            SvgFreeDraw.points = points;
            var path = "";
            path += ("M " + points[0].x + " " + points[0].y + " ");

            for (var i = 1; i < points.length; i++) {
                path += ("L " + points[i].x + " " + points[i].y + " ");
            }


            var freeDraw = that.svgController.paper.path(path)
                .attr({
                    fill: '',
                    stroke: SvgGlobalControllerLogic.defaultStrokecolor,
                    'stroke-width': SvgGlobalControllerLogic.defaultStrokeWidth,
                    'stroke-dasharray': ""
                });
                
            freeDraw.attr({
                fill: '',
                stroke: SvgGlobalControllerLogic.freeDrawProperties.color,
                'stroke-width': SvgGlobalControllerLogic.freeDrawProperties.strokeWidth,
                'stroke-dasharray': ""
            });

            that.element = freeDraw;
            that.element.rotate(that.baseAngle);
            that.element.data("DocumentAnnotationId", that.annotationId);
            return freeDraw;
        },

        //===============================================
        //================== update =====================
        //===============================================

        beforeUpdate: function () {
            var that = this;
            var points = that.points;
            var svgController = that.svgController;
            var paper = svgController.paper;
            var element = that.element;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((paper.height).replace("px", "")) / currentScale;

            var opacity = (element.attr("fill-opacity") + element.attr("opacity")) < 0.01 ?
                "transparent" : element.attr("fill-opacity");
            //points = points.map(m=>AnnotationApplication.CanvasController.getCanvasById(1).getPointer(m));


            var tempPoints = [];
            points.push(points[0]);
            points.forEach(function (m) {
                if (m.x !== undefined) {
                    tempPoints.push({
                        x: m.x / paperWidth,
                        y: m.y / paperHeight
                    });
                }
            });

            var svgPoints = [];
            for (var i = 0; i < tempPoints.length - 1; i++) {
                svgPoints.push({
                    X: parseFloat(tempPoints[i].x),
                    Y: parseFloat(tempPoints[i].y),
                    OrderNumber: i
                });
            }

            // why this? because the chance of having same point
            // as begin and end is rare in freedraw and makes sure there 
            // it is not closed
            if(svgPoints[0].x === svgPoints[svgPoints.length-1].x && svgPoints[0].y === svgPoints[svgPoints.length-1].y){
                svgPoints.pop();
            }

            var dbObject = {
                DocumentAnnotationId: element.getDocumentAnnotationId(),
                AnnotationType: that.type,
                ParentId: "", // not implemented yet
                DocumentVersionId: AnnotationApplication.documentVersionId,
                Fill: element.attr("fill"),
                Stroke: element.attr("stroke"),
                StrokeWidth: element.attr("stroke-width"),
                Points: svgPoints,
                Angle: that.angle ? that.angle : 0, // not implemented yet
                AnnotationName: that.type,
                Opacity: element.attr("opacity"),
                IsSelectable: true,
                IsGroup: false, // not implemented yet
                Scale: "",
                ModifiedBy: element.getModifiedBy(),
                CreatedBy: element.getCreatedBy(),
                DeletedBy: null,
                //CreatedOn: element.getCreatedOn(),
                //ModifiedOn: element.getModifiedOn(),
                //DeletedOn: null,
                EMSNodeId: null, // not implemented yet
                ChildDocumentId: null, // not implemented yet
                PageId: element.getPageId(),
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
            var points = that.points;
            var svgController = that.svgController;
            var paper = svgController.paper;
            var element = that.element;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((paper.height).replace("px", "")) / currentScale;

            var opacity = (element.attr("fill-opacity") + element.attr("opacity")) < 0.01 ?
                "transparent" : element.attr("fill-opacity");
            //points = points.map(m=>AnnotationApplication.CanvasController.getCanvasById(1).getPointer(m));

            points.push(points[0]);

            points = points.map(m => {
                return {
                    x: m.x / paperWidth,
                    y: m.y / paperHeight
                }
            });

            var svgPoints = [];
            for (var i = 0; i < points.length - 1; i++) {
                svgPoints.push({
                    X: parseFloat(points[i].x),
                    Y: parseFloat(points[i].y),
                    OrderNumber: i
                });
            }

            var dbObject = {
                DocumentAnnotationId: "00000000-0000-0000-0000-000000000000",
                AnnotationType: that.type,
                ParentId: "", // not implemented yet
                DocumentVersionId: AnnotationApplication.documentVersionId,
                Fill: (element.attr("fill") === "transparent" ? "" : element.attr("fill")),
                Stroke: element.attr("stroke"),
                StrokeWidth: element.attr("stroke-width"),
                Points: svgPoints,
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
            //                 if (svgController.isDrawing === true) return;
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

            //                     that.onElementClick(element, paper, elementType);
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
            //                 //me.onClick(e);
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
            //                 if (e.which === 3) {
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
            if (SvgGlobalControllerLogic.isCtrlKeyPressed) {
                if(SvgGlobalControllerLogic.selectedIds2.indexOf(me.annotationId) === -1)SvgGlobalControllerLogic.selectedIds2.push(me.annotationId);
            } else {
                SvgGlobalControllerLogic.selectedIds2 = [me.annotationId];
                if (AnnotationApplication.RightSidebarController.isSidebarOpen) AnnotationApplication.RightSidebarController.openSidebar(e.item, me.pageNumber, me);
                $(".rightSidebarTabTools").click();
                SvgGlobalControllerLogic.clearAllJoints();
                SvgGlobalControllerLogic.selectedIds2 = [me.annotationId];
            }
            if(SvgGlobalControllerLogic.selectedIds2.length>1){
                //SvgGlobalControllerLogic.clearAllJoints();
                SvgGlobalControllerLogic.drawSelectBox();
            }else{
                me.showControlBox();
            }
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

                var dx, dy;

                dx = element.matrix.split().dx;
                dy = element.matrix.split().dy;

                
                element.transform("");
                var tempPath = "";
                element.attr("path").forEach(function (p) {
                    tempPath += (p[0] + " " + (parseInt(p[1]) + dx).toFixed(0) + " " + (parseInt(p[2]) + dy).toFixed(0));
                });
                element.attr("path", tempPath);
                var points = [];
                element.attr("path").forEach(function (p) {
                    points.push({
                        x: parseInt(p[1]),
                        y: parseInt(p[2])
                    });
                });
                that.points = points;
                that.deleteMask();

                that.update();
            }
        },

        onMouseUp: function (e) {
            var that = this;
            var svgController = that.svgController;
            if (e.which === 3) {
                //SvgGlobalControllerLogic.rightClickHandler(that, e);
                if(SvgGlobalControllerLogic.isCtrlKeyPressed){
                    SvgGlobalControllerLogic.selectedIds2.push(that.annotationId);
                }else{
                    SvgGlobalControllerLogic.selectedIds2 = [that.annotationId];
                }
                SvgGlobalControllerLogic.drawSelectBox();
                SvgGlobalControllerLogic.openContextMenu(e, that);
                //e.stopPropagation();
            }else{
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

        createHandles: function (ctrlBox_x, ctrlBox_y, ctrlBox_centerX, ctrlBox_centerY, handleSize) {
            var that = this;
            var thatController = that.svgController;
            var element = that.element;
            var paper = thatController.paper;


            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var baseNumber = 0;
            var strokeWidth = 3;
            var handleSize = 15 / currentScale;

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

            ctrlBox_x = element.attr("x") - baseNumber;
            ctrlBox_y = element.attr("y") - baseNumber;
            ctrlBox_w = element.attr("width") + baseNumber * 2;
            ctrlBox_h = element.attr("height") + baseNumber * 2;

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
                            currentX = paperWidth - (e.touches[0].pageX - myoffset.left);
                            currentY = e.touches[0].pageY - myoffset.top;
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
                if (["rect", "image", "highlight"].indexOf(element.type) > -1) {
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
                .drag(
                    //onDrag
                    function (dx, dy, x, y, e) { onDrag(dx, dy, x, y, e, -1, -1, this); },
                    //onDragStart
                    function (x, y) { $("#raphael" + thatController.pageNumber).parent().children("div:not(:first-child)").addClass("hidden"); },
                    //onDragStop
                    function (e) { onDragStop(e, that.angle); }
                )
                .data("type", "lt");

            var lm = thatController.paper.rect(ctrlBox_x - (handleSize / 2), ctrlBox_y + ctrlBox_h / 2 - (handleSize / 2), handleSize, handleSize)
                .attr({ stroke: "orange", 'stroke-dasharray': "" })
                .drag(
                    //onDrag
                    function (dx, dy, x, y, e) { onDrag(dx, dy, x, y, e, -1, 0, this); },
                    //onDragStart
                    function (x, y) { $("#raphael" + thatController.pageNumber).parent().children("div:not(:first-child)").addClass("hidden"); },
                    //onDragStop
                    function (e) { onDragStop(e, that.angle); }
                )
                .rotate(that.angle, ctrlBox_centerX, ctrlBox_centerY)
                .data("type", "lm");

            var lb = thatController.paper.rect(ctrlBox_x - (handleSize / 2), ctrlBox_y - (handleSize / 2) + ctrlBox_h, handleSize, handleSize)
                .attr({ stroke: "orange", 'stroke-dasharray': "" })
                .drag(
                    //onDrag
                    function (dx, dy, x, y, e) { onDrag(dx, dy, x, y, e, -1, 1, this); },
                    //onDragStart
                    function (x, y) { $("#raphael" + thatController.pageNumber).parent().children("div:not(:first-child)").addClass("hidden"); },
                    //onDragStop
                    function (e) { onDragStop(e, that.angle); }
                )
                .rotate(that.angle, ctrlBox_centerX, ctrlBox_centerY)
                .data("type", "lb");

            // middle handles
            var t = thatController.paper.rect(ctrlBox_x + ctrlBox_w / 2 - (handleSize / 2), ctrlBox_y - (handleSize / 2), handleSize, handleSize)
                .attr({ stroke: "orange", 'stroke-dasharray': "" })
                .drag(
                    //onDrag
                    function (dx, dy, x, y, e) { onDrag(dx, dy, x, y, e, 0, -1, this); },
                    //onDragStart
                    function (x, y) { $("#raphael" + thatController.pageNumber).parent().children("div:not(:first-child)").addClass("hidden"); },
                    //onDragStop
                    function (e) { onDragStop(e, that.angle); }
                )
                .rotate(that.angle, ctrlBox_centerX, ctrlBox_centerY)
                .data("type", "t");

            var b = thatController.paper.rect(ctrlBox_x + ctrlBox_w / 2 - (handleSize / 2), ctrlBox_y + ctrlBox_h - (handleSize / 2), handleSize, handleSize)
                .attr({ stroke: "orange", 'stroke-dasharray': "" })
                .drag(
                    //onDrag
                    function (dx, dy, x, y, e) { onDrag(dx, dy, x, y, e, 0, 1, this); },
                    //onDragStart
                    function (x, y) { $("#raphael" + thatController.pageNumber).parent().children("div:not(:first-child)").addClass("hidden"); },
                    //onDragStop
                    function (e) { onDragStop(e, that.angle); }
                )
                .rotate(that.angle, ctrlBox_centerX, ctrlBox_centerY)
                .data("type", "b");


            // right handles
            var rt = thatController.paper.rect(ctrlBox_x + ctrlBox_w - (handleSize / 2), ctrlBox_y - (handleSize / 2), handleSize, handleSize)
                .attr({ stroke: "orange", 'stroke-dasharray': "" })
                .drag(
                    //onDrag
                    function (dx, dy, x, y, e) { onDrag(dx, dy, x, y, e, 1, -1, this); },
                    //onDragStart
                    function (x, y) { $("#raphael" + thatController.pageNumber).parent().children("div:not(:first-child)").addClass("hidden"); },
                    //onDragStop
                    function (e) { onDragStop(e, that.angle); }
                )
                .rotate(that.angle, ctrlBox_centerX, ctrlBox_centerY)
                .data("type", "rt");

            var rm = thatController.paper.rect(ctrlBox_x + ctrlBox_w - (handleSize / 2), ctrlBox_y + ctrlBox_h / 2 - (handleSize / 2), handleSize, handleSize)
                .attr({ stroke: "orange", 'stroke-dasharray': "" })
                .drag(
                    //onDrag
                    function (dx, dy, x, y, e) { onDrag(dx, dy, x, y, e, 1, 0, this); },
                    //onDragStart
                    function (x, y) { $("#raphael" + thatController.pageNumber).parent().children("div:not(:first-child)").addClass("hidden"); },
                    //onDragStop
                    function (e) { onDragStop(e, that.angle); }
                )
                .rotate(that.angle, ctrlBox_centerX, ctrlBox_centerY)
                .data("type", "rm");

            var rb = thatController.paper.rect(ctrlBox_x + ctrlBox_w - (handleSize / 2), ctrlBox_y + ctrlBox_h - (handleSize / 2), handleSize, handleSize)
                .attr({ stroke: "orange", 'stroke-dasharray': "" })
                .drag(
                    //onDrag
                    function (dx, dy, x, y, e) { onDrag(dx, dy, x, y, e, 1, 1, this); },
                    //onDragStart
                    function (x, y) { $("#raphael" + thatController.pageNumber).parent().children("div:not(:first-child)").addClass("hidden"); },
                    //onDragStop
                    function (e) { onDragStop(e, that.angle); }
                )
                .rotate(that.angle, ctrlBox_centerX, ctrlBox_centerY)
                .data("type", "rb");




            var centerPoint = {
                x: (element.getBBox().x + element.getBBox().width / 2),
                y: (element.getBBox().y + element.getBBox().height / 2)
            }
            var tempAngle = that.angle;
            var angle = 0;
            var rotate = thatController.paper.ellipse(ctrlBox_x + ctrlBox_w / 2, ctrlBox_y - 35, handleSize / 2, handleSize / 2, false)
                .attr({ stroke: "orange", 'stroke-dasharray': "", 'stroke-width': 2, "fill": "orange" })
                .drag(
                    function (dx, dy, x, y, e) {  // move
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
                                    currentY = e.touches[0].pageY - myoffset.top;
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

                        this.transform("");

                        this.attr({
                            cx: currentX,
                            cy: currentY
                        });


                        //deg = e.offsetX - rotatebeginX/10;
                        angle = Raphael.angle(currentX, currentY, centerPoint.x, centerPoint.y) + 90;

                        //console.log(angle);
                        //element.rotate(angle - tempAngle);
                        element.rotate(angle - tempAngle, ctrlBox_centerX, ctrlBox_centerY);
                        tempAngle = angle
                    }, function (x, y) {  // start
                        console.log(this.matrix.split().rotate)
                        $("#raphael" + that.pageNumber).parent().children("div:not(:first-child)").addClass("hidden");
                    }, function (e) {  //end
                        element.rotate(angle - tempAngle);
                        that.angle = tempAngle;
                        that.update();
                        that.removeHandles();
                        that.createHandles();
                        $("#raphael" + that.pageNumber).parent().children("div:not(:first-child)").addClass("hidden");
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

            if (["rect"].indexOf(element.type) > -1) {
                var id = element.getDocumentAnnotationId();
                that.handleids = [lt, lm, lb, t, b, rt, rm, rb];
            }

            that.handleids = [lt, lm, lb, t, b, rt, rm, rb, rotate];

        },

        paste: function (e, pageNumber) {
            var that = this;
            var paper = that.svgController.paper;
            var element = that.element;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((paper.height).replace("px", "")) / currentScale;

            var clonedSvgObject = new SvgFreeDraw(
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
            )

            that.points.pop();

            clonedSvgObject.create(that.points);
            clonedSvgObject.element.attr({
                fill: element.attr("fill"),
                stroke: element.attr("stroke"),
                'stroke-width': element.attr("stroke-width"),
                Opacity: element.attr("opacity")
            });

            //clonedSvgObject.afterCreate();
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
                "stroke-width": 15,
                //fill: "white",
                opacity: 0.01
            })
                // .touchstart(function (e) {
                //     //console.log("touchstart", e);
                //     ts = e;
                //     e.preventDefault();
                //     if (svgController.isDrawing === true) return;
                //     me.isDragging = true;
                //     me.svgController.clearAllCtrlBoxes(true);
                //     me.svgController.clearAllJoints();
                //     me.svgController.clearAllSelectedText();
                //     me.removeHandles();
                // })
                // .touchend(function (e) {
                //     //console.log("touchend", e);
                //     te = e;
                //     if (te.timeStamp - ts.timeStamp < 500) {
                //         // tap

                //         that.onElementClick(element, paper, elementType);
                //     }
                //     try {
                //         if (that.isDrawing === true) return;
                //         if (SvgGlobalControllerLogic.selectedIds2.length > 1) {
                //             SvgGlobalControllerLogic.selectedIds2.forEach(function (id) {
                //                 SvgGlobalControllerLogic.annotations2[id].onElementDragEnd(e);
                //             });
                //         } else {
                //             mask.remove();
                //             me.onElementDragEnd(e);
                //         }
                //         me.isDragging = false;
                //     } catch (ex) {
                //         console.error(ex);
                //         me.isDragging = false;
                //     }


                // })
                // .touchmove(function (e) {
                //     //console.log("touchmove", e);
                //     tm = e;
                //     var dx = tm.touches[0].pageX - ts.touches[0].pageX;
                //     var dy = tm.touches[0].pageY - ts.touches[0].pageY;
                //     try {
                //         if (!me.isDragging) return;
                //         if (that.isDrawing === true) return;
                //         if (e.which === 3 || me.svgController.contextMenu) return;

                //         if (SvgGlobalControllerLogic.selectedIds2.length > 1) {
                //             SvgGlobalControllerLogic.selectedIds2.forEach(function (id) {
                //                 SvgGlobalControllerLogic.annotations2[id].onElementDragging(dx, dy, null, null, e);
                //             });
                //         } else {

                //             me.onElementDragging(dx, dy, null, null, e);
                //         }
                //         e.stopPropagation();
                //     } catch (ex) {
                //         console.error(ex);
                //     }
                // })
                // .click(function (e) {
                //     //that.onElementClick(element, paper, elementType);
                //     me.onClick(e);
                // })
                // .mouseover(function (e) {
                //     svgController.onElementMouseOver(e);
                //     SvgGlobalControllerLogic.showGlow(me);
                // })
                // .mouseout(function (e) {
                //     svgController.onElementMouseOut(e);
                //     SvgGlobalControllerLogic.hideGlow(me);
                // })
                // .dblclick(function () {

                // })
                // .mouseup(function (e) {
                //     //var element = that.getElementByDocId(this.data("DocumentAnnotationId"));
                //     //me.onMouseUp(e);
                //     if (e.which === 3) {
                //         SvgGlobalControllerLogic.openContextMenu(e, me);
                //     }
                // })
                // .drag(
                //     function (dx, dy, x, y, e) {  // move
                //         try {
                //             if (!me.isDragging) return;
                //             if (svgController.isDrawing === true) return;
                //             if (e.which === 3 || me.svgController.contextMenu) return;

                //             if (SvgGlobalControllerLogic.selectedIds2.length > 1) {
                //                 SvgGlobalControllerLogic.selectedIds2.forEach(function (id) {
                //                     SvgGlobalControllerLogic.annotations2[id].onElementDragging(dx, dy, x, y, e);
                //                 });
                //             } else {

                //                 me.onElementDragging(dx, dy, x, y, e);
                //             }
                //             e.stopPropagation();
                //         } catch (ex) {
                //             console.error(ex);
                //         }
                //     }, function (x, y) {  // start
                //         //me.onElementDragStart(x, y);
                //         if (svgController.isDrawing === true) return;
                //         me.isDragging = true;
                //         me.svgController.clearAllCtrlBoxes(true);
                //         me.svgController.clearAllJoints();
                //         me.svgController.clearAllSelectedText();
                //         me.removeHandles();
                //     }, function (e) {  //end
                //         try {
                //             if (svgController.isDrawing === true) return;
                //             if (SvgGlobalControllerLogic.selectedIds2.length > 1) {
                //                 SvgGlobalControllerLogic.selectedIds2.forEach(function (id) {
                //                     SvgGlobalControllerLogic.annotations2[id].onElementDragEnd(e);
                //                 });
                //             } else {
                //                 me.onElementDragEnd(e);
                //             }
                //             me.isDragging = false;
                //         } catch (ex) {
                //             console.error(ex);
                //             me.isDragging = false;
                //         }
                //     }
                // )

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

    return SvgFreeDraw;
})();