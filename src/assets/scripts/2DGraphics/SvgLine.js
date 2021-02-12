"use strict";

var SvgLine = (function () {

    function SvgLine(
        svgController,
        annotationId,
        type,
        pageNumber,
        element,
        rotation,
        dbobject) {

        this.svgController = svgController;
        this.annotationId = annotationId;
        this.type = type;
        this.pageNumber = pageNumber;
        this.element = element;
        this.baseAngle = rotation;
        this.dbobject = dbobject;
        this.maskids = null;
        this.handleids = [];
        this.controlboxids = null;
        this.glow = null;
        this.isDragging = false;

        this.isPastedFrom = null;
        this.drawBoxAfterSave = false;

        this.points = null;
    };

    SvgLine.prototype = {
        constructor: SvgLine,

        //===============================================
        //================== create =====================
        //===============================================

        beforeCreate: function () {
            var that = this;

        },

        create: function (x1, y1, x2, y2) {
            var that = this;
            // before
            that.beforeCreate();

            // create
            that.draw(x1, y1, x2, y2);
            that.points = [x1, y1, x2, y2];
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
            that.svgController.stopDrawing();
        },

        draw: function (x1, y1, x2, y2) {
            var that = this;

            var paperWidth = parseInt(that.svgController.paper.width.replace("px", ""));
            var paperHeight = parseInt(that.svgController.paper.height.replace("px", ""));
            [x1, x2].forEach(function (p) {
                p = p < 5 ? 0 : p;
                p = p > paperWidth ? paperWidth - 5 : p;
            });
            [y1, y2].forEach(function (p) {
                p = p < 5 ? 0 : p;
                p = p > paperHeight ? paperHeight : p;
            });

            var line = that.svgController.paper.path("M " + x1 + " " + y1 + " L " + x2 + " " + y2);

            line.attr({
                fill: '#3a7ce8',
                stroke: SvgGlobalControllerLogic.defaultStrokeColor,
                'stroke-width': SvgGlobalControllerLogic.defaultStrokeWidth,
                'arrow-end': "none",
                'arrow-start': "none",
                'stroke-dasharray': "-"
            });

            that.element = line;
            that.element.data("DocumentAnnotationId", that.annotationId);
            return line;
        },

        //===============================================
        //================== update =====================
        //===============================================

        beforeUpdate: function () {
            var that = this;
            var svgController = that.svgController;
            var paper = svgController.paper;
            var element = that.element;
            var points = that.points;

            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((paper.height).replace("px", "")) / currentScale;

            var opacity = (element.attr("fill-opacity") + element.attr("opacity")) < 0.01 ?
                "transparent" : element.attr("fill-opacity");
            //points = points.map(m => m / currentScale);

            var dbObject = {
                DocumentAnnotationId: that.annotationId,
                AnnotationType: that.type,
                ParentId: "", // not implemented yet
                DocumentVersionId: AnnotationApplication.documentVersionId,
                Fill: element.attr("fill"),
                Stroke: element.attr("stroke"),
                StrokeWidth: element.attr("stroke-width"),
                Points: [
                    { X: parseFloat(points[0] / paperWidth), Y: parseFloat(points[1] / paperHeight), OrderNumber: 0 },
                    { X: parseFloat(points[2] / paperWidth), Y: parseFloat(points[3] / paperHeight), OrderNumber: 1 }
                ],
                //Top: element.attr("y"),
                //Left: element.attr("x"),
                //Width: element.attr("width"),
                //Height: element.attr("height"),
                //Angle: 0, // not implemented yet
                AnnotationName: "line",
                Opacity: element.attr("opacity"),
                ArrowEnd: element.attr("arrow-end"),
                ArrowStart: element.attr("arrow-start"),
                IsSelectable: true,
                IsGroup: false, // not implemented yet
                Scale: "",
                ModifiedBy: element.getModifiedBy(),
                CreatedBy: element.getCreatedBy(),
                DeletedBy: null,
                CreatedOn: null,
                ModifiedOn: null,
                DeletedOn: null,
                EMSNodeId: null, // not implemented yet
                ChildDocumentId: null, // not implemented yet
                PageId: element.getPageId(),
                PageNumber: this.pageNumber,
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

            }
            console.log("afterUpdate", dbObject);
            that.createMask();
        },

        //===============================================
        //================== save =======================
        //===============================================

        beforeSave: function () {
            var that = this;
            var element = that.element;
            var points = that.points;

            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((that.svgController.paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((that.svgController.paper.height).replace("px", "")) / currentScale;
            //if (that.svgController.tempElement) that.svgController.tempElement.remove();

            var opacity = (element.attr("fill-opacity") + element.attr("opacity")) < 0.01 ?
                "transparent" : element.attr("fill-opacity");
            //points = points.map(m=>AnnotationApplication.CanvasController.getCanvasById(1).getPointer(m));

            var dbObject = {
                DocumentAnnotationId: "00000000-0000-0000-0000-000000000000",
                AnnotationType: that.type,
                ParentId: "", // not implemented yet
                DocumentVersionId: AnnotationApplication.documentVersionId,
                Fill: element.attr("fill"),
                Stroke: element.attr("stroke"),
                StrokeWidth: element.attr("stroke-width"),
                Points: [
                    { X: parseFloat(points[0] / paperWidth), Y: parseFloat(points[1] / paperHeight), OrderNumber: 0 },
                    { X: parseFloat(points[2] / paperWidth), Y: parseFloat(points[3] / paperHeight), OrderNumber: 1 }
                ],
                //Top: element.attr("y"),
                //Left: element.attr("x"),
                //Width: element.attr("width"),
                //Height: element.attr("height"),
                //Angle: 0, // not implemented yet
                AnnotationName: that.type,
                Opacity: element.attr("opacity"),
                ArrowEnd: element.attr("arrow-end"),
                ArrowStart: element.attr("arrow-start"),
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
            // var svgController = me.svgController;
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
            //                 //console.log("touchend", e);
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
            //                 //console.log("touchmove", e);
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
            //                 me.onClick();
            //             })
            //             .mouseover(function (e) {
            //                 //that.onElementMouseOver(e);
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
            //                     if (SvgGlobalControllerLogic.selectedIds2.length > 0) {
            //                         SvgGlobalControllerLogic.selectedIds2.forEach(function (id) {
            //                             SvgGlobalControllerLogic.annotations2[id].onElementDragEnd(e);
            //                         });
            //                     } else {
            //                         me.onElementDragEnd(e);
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
                me.drawHandles();
            }
        },

        onMouseUp: function (e) {
            var that = this;
            var svgController = that.svgController;
            if (e.which === 3) {
                SvgGlobalControllerLogic.clearAllJoints();
                //SvgGlobalControllerLogic.rightClickHandler(that, e);
                if(SvgGlobalControllerLogic.isCtrlKeyPressed){
                    SvgGlobalControllerLogic.selectedIds2.push(that.annotationId);
                }else{
                    SvgGlobalControllerLogic.selectedIds2 = [that.annotationId];
                }
               
                    //SvgGlobalControllerLogic.clearAllJoints();
                   // SvgGlobalControllerLogic.drawSelectBox();
                   if(SvgGlobalControllerLogic.selectedIds2.length>1){
                    //SvgGlobalControllerLogic.clearAllJoints();
                    SvgGlobalControllerLogic.drawSelectBox();
                }else{
                    this.drawHandles();
                }
                SvgGlobalControllerLogic.openContextMenu(e, that);
                //e.stopPropagation();
            }else{
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

                element.transform("T" + lx / svgController.getScale() + "," + ly / svgController.getScale() + "r" + element.getAngle());

            }


            e.stopPropagation();
        },

        onElementDragStart: function (x, y) {
            var that = this;

        },

        onElementDragEnd: function (e) {
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

            // line Head
            var tempPath = "";
            element.transform("");
            element.attr("path").forEach(function (p) {
                tempPath += (" " + p[0] + " " + (parseInt(p[1]) + dx) + " " + (parseInt(p[2]) + dy));
            });
            this.element = element.attr("path", tempPath);

            var points = [
                element.attrs.path[0][1],
                element.attrs.path[0][2],
                element.attrs.path[1][1],
                element.attrs.path[1][2]
            ];
            that.points = points;

            that.update();
            that.deleteMask();
        },


        //===============================================
        //================== Controls ===================
        //===============================================

        drawHandles: function () {
            var that = this;
            var svgController = that.svgController;
            var paper = that.svgController.paper;
            var element = that.element;

            var radius = 15;

            if (that.handleids.length > 0) that.clearHandles();

            var scale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseInt(paper.width.replace("px", "")) / scale;
            var paperHeight = parseInt(paper.height.replace("px", "")) / scale;

            var ts, tm, te;

            var onDragC1 = function (dx, dy, x, y, e, obj) {
                var dxdy = svgController.getDXDY(dx, dy);
                dx = dxdy.dx;
                dy = dxdy.dy;
                let lx = dx;
                let ly = dy;

                obj.transform("T" + lx / scale + "," + ly / scale);
                var newX = obj.matrix.x(obj.attr("cx"), obj.attr("cy"));
                var newY = obj.matrix.y(obj.attr("cx"), obj.attr("cy"));
                newX = newX < 5 ? 0 : newX;
                newY = newY < 5 ? 0 : newY;
                newX = newX > paperWidth ? paperWidth - 5 : newX;
                newY = newY > paperHeight ? paperHeight - 5 : newY;
                element.attr({
                    path: "M " + newX + " " + newY
                        + " L " + element.attrs.path[1][1] + " " + element.attrs.path[1][2]
                });
            };

            var onDragEndC1 = function (e, obj) {
                console.log("drag ended", e);
                let lx = obj.matrix.x(obj.attr("cx"), obj.attr("cy"));
                let ly = obj.matrix.y(obj.attr("cx"), obj.attr("cy"));
                lx = lx < 5 ? 0 : lx;
                ly = ly < 5 ? 0 : ly;
                lx = lx > paperWidth ? paperWidth - 5 : lx;
                ly = ly > paperHeight ? paperHeight - 5 : ly;
                obj.attr({ cx: lx, cy: ly });
                obj.transform("");

                element.attr({
                    path: "M " + lx + " " + ly
                        + " L " + element.attrs.path[1][1] + " " + element.attrs.path[1][2]
                });
                that.points = [lx, ly, element.attrs.path[1][1], element.attrs.path[1][2]];
                that.update();
            };

            // lineHead
            var c1 = paper.circle(element.attrs.path[0][1], element.attrs.path[0][2], radius / scale)
                .attr({
                    fill: "red",
                    opacity: 0.6
                })
                .touchstart(function (e) {
                    e.preventDefault();
                    ts = {
                        x: e.touches[0].pageX,
                        y: e.touches[0].pageY
                    };
                })
                .touchmove(function (e) {
                    e.preventDefault();
                    tm = {
                        x: e.touches[0].pageX - ts.x,
                        y: e.touches[0].pageY - ts.y
                    }
                    onDragC1(tm.x, tm.y, null, null, e, this);
                })
                .touchend(function (e) {
                    e.preventDefault(); onDragEndC1(e, this);
                })
                .drag(function (dx, dy, x, y, e) {
                    if(SvgGlobalControllerLogic.isDraggablePermission){
                        onDragC1(dx, dy, x, y, e, this);
                    }else{
                        return;
                    }
                }, function (x, y) {
                    //console.log(" x:" + x + " y:" + y);

                }, function (e) {
                    if(SvgGlobalControllerLogic.isDraggablePermission){
                        onDragEndC1(e, this);
                    }else{
                        return;
                    }
                });

            var onDragC2 = function (dx, dy, x, y, e, obj) {
                var dxdy = svgController.getDXDY(dx, dy);
                dx = dxdy.dx;
                dy = dxdy.dy;
                let lx = dx;
                let ly = dy;

                obj.transform("T" + lx / scale + "," + ly / scale);
                var newX = obj.matrix.x(obj.attr("cx"), obj.attr("cy"));
                var newY = obj.matrix.y(obj.attr("cx"), obj.attr("cy"));
                newX = newX < 5 ? 0 : newX;
                newY = newY < 5 ? 0 : newY;
                newX = newX > paperWidth ? paperWidth - 5 : newX;
                newY = newY > paperHeight ? paperHeight - 5 : newY;
                element.attr({
                    path: "M " + element.attrs.path[0][1] + " " + element.attrs.path[0][2]
                        + " L " + newX + " " + newY
                });
            };

            var onDragEndC2 = function (e, obj) {
                console.log("drag ended", e);
                let lx = obj.matrix.x(obj.attr("cx"), obj.attr("cy"));
                let ly = obj.matrix.y(obj.attr("cx"), obj.attr("cy"));
                lx = lx < 5 ? 0 : lx;
                ly = ly < 5 ? 0 : ly;
                lx = lx > paperWidth ? paperWidth - 5 : lx;
                ly = ly > paperHeight ? paperHeight - 5 : ly;
                obj.attr({ cx: lx, cy: ly });
                obj.transform("");

                element.attr({
                    path: "M " + element.attrs.path[0][1] + " " + element.attrs.path[0][2]
                        + " L " + lx + " " + ly
                });
                that.points = [element.attrs.path[0][1], element.attrs.path[0][2], lx, ly];
                that.update();
            };

            var c2 = paper.circle(element.attrs.path[1][1], element.attrs.path[1][2], radius / scale)
                .attr({
                    parentId: element.id,
                    index: 2,
                    fill: "red",
                    opacity: 0.6
                })
                .touchstart(function (e) {
                    e.preventDefault();
                    ts = {
                        x: e.touches[0].pageX,
                        y: e.touches[0].pageY
                    };
                })
                .touchmove(function (e) {
                    e.preventDefault();
                    tm = {
                        x: e.touches[0].pageX - ts.x,
                        y: e.touches[0].pageY - ts.y
                    }
                    onDragC2(tm.x, tm.y, null, null, e, this);
                })
                .touchend(function (e) {
                    e.preventDefault(); onDragEndC2(e, this);
                })
                .drag(function (dx, dy, x, y, e) {
                    if(SvgGlobalControllerLogic.isDraggablePermission){
                    onDragC2(dx, dy, x, y, e, this);
                    }else{
                        return;
                    }
                }, function (x, y) {
                    // console.log(" x:" + x + " y:" + y);
                }, function (e) {
                    if(SvgGlobalControllerLogic.isDraggablePermission){
                    onDragEndC2(e, this);
                    }else{
                        return;
                    }
                });

            c1.data("isJoint", true);
            c2.data("isJoint", true);

            $(c1.node).css("z-index", "100");
            $(c2.node).css("z-index", "100");
            that.handleids.push(
                c1,
                c2
            );
            //SvgGlobalControllerLogic.hideGlow(that);
        },

        removeHandles: function () {
            this.clearHandles();
        },

        clearHandles: function () {
            var that = this;
            that.handleids.forEach(function (handle) {
                handle.remove();
            });
            that.handleids = [];
        },

        paste: function (e, pageNumber) {
            var that = this;
            var paper = that.svgController.paper;
            var element = that.element;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((paper.height).replace("px", "")) / currentScale;

            var clonedSvgObject = new SvgLine(
                SvgGlobalControllerLogic.getSvgController(pageNumber).canvas,
                null,
                that.type,
                pageNumber,
                null,
                that.baseAngle,
                null,
                [],
                [],
                []
            );

            var pathArray = element.attrs.path;
            var x,y;
            if(e === null){
                x = pathArray[0][1] + 10;
                y = pathArray[0][2] + 10;
            }else{
                
                x = that.svgController.getXY(e, 1 / that.svgController.getScale()).x;
                y = that.svgController.getXY(e, 1 / that.svgController.getScale()).y;
            }

            clonedSvgObject.isPastedFrom = {
                fromSvgObject:that,
                x:x,
                y:y
            };


            
            var newPath = "M" + x + "," + y;
            var dx = pathArray[0][1] - pathArray[1][1];
            var dy = pathArray[0][2] - pathArray[1][2];
            for(var i=1; i<pathArray.length; i++){
                //newPath = newPath + "L"+(pathArray[i][1]+dx)+","+(pathArray[0][1]+dy);
            }

            var x1 = x;
            var y1 = y;
            var x2 =x+dx;
            var y2 = y+dy;

            clonedSvgObject.create(
                x1,
                 y1,
                 x2,
                 y2
            );
            // clonedSvgObject.element.attr(element.attrs);
            // clonedSvgObject.element.attr("path", element.attrs.path.toString());
            // clonedSvgObject.element.transform(element.transform());
            // clonedSvgObject.element.attr({
            //     x: clonedSvgObject.element.attr("cx") + 10,
            //     y: clonedSvgObject.element.attr("cy") + 10
            // });
        },

        afterPaste: function(){
            var that = this;
            try{
                var element = that.isPastedFrom.fromSvgObject.element;
                var path = that.element.attr("path");
                var rotate = element.matrix.split().rotate;

                that.element.attr(element.attrs);

                

                that.element.attr({
                    path:path
                });
                //that.element.transform(element.transform());

                
                if(rotate !== 0){
                    //that.element.rotate(rotate);
                }
                //that.afterCreate();
                that.isPastedFrom = null;
                that.update();
                SvgGlobalControllerLogic.selectedIds2.push(that.annotationId);
                SvgGlobalControllerLogic.drawSelectBox([that.annotationId]);
                
            }catch(ex){
                console.error(ex);
            }
        },

        createMask: function () {
            var that = this;
            var me = that;
            var svgController = that.svgController;
            that.deleteMask();
            var mask = that.element.clone();


            var ts = null;//touchstart
            var te = null;//touchend
            var tm = null;//touchmove

            mask.attr({
                stroke: "white",
                "stroke-width": 15,
                fill: "white",
                opacity: 0.01,
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
                //     that.onClick(e);
                // })
                // .mouseover(function (e) {
                //     //svgController.onElementMouseOver(e);
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
                //     if (e.which === 3) {
                //         SvgGlobalControllerLogic.openContextMenu(e, me);
                //     }

                // })
                // .drag(
                //     function (dx, dy, x, y, e) {  // move
                //         try {
                //             if (svgController.isDrawing === true) return;
                //             if (e.which === 3 || me.svgController.contextMenu) return;

                //             if (SvgGlobalControllerLogic.selectedIds2.length > 0) {
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
                //     }, function (e) {  //end
                //         try {
                //             if (svgController.isDrawing === true) return;
                //             if (SvgGlobalControllerLogic.selectedIds2.length > 0) {
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
            that.maskids = mask;
        },

        deleteMask: function () {
            var that = this;
            if (that.maskids !== null) that.maskids.remove();

        },


        // end of methods
    }

    return SvgLine;
})();