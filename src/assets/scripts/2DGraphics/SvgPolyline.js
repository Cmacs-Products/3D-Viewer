"use strict";

var SvgPolyline = (function () {

    function SvgPolyline(
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
        this.rotation = rotation;
        this.dbobject = dbobject;
        this.maskids = null;
        this.handleids = [];
        this.controlboxids = null;
        this.glow = null;
        this.isDragging = false;

        this.isPastedFrom = null;
        this.drawBoxAfterSave = false;

        this.url = null;
        this.points = null;

    };

    SvgPolyline.prototype = {
        constructor: SvgPolyline,

        //===============================================
        //================== create =====================
        //===============================================

        beforeCreate: function () {
            var that = this;

        },

        create: function (points, closePath, saveToDb) {
            var that = this;
            // before
            that.beforeCreate();

            // create
            that.draw(points, true, true);


            // after
            that.afterCreate();

        },

        afterCreate: function () {
            var that = this;
            that.save();
            that.bindEvents(that.element);
            that.createMask();
            that.svgController.stopDrawing();
        },

        draw: function (points, closePath, saveToDb) {
            var that = this;
            var paper = that.svgController.paper;
            var path = "";
            path += ("M " + points[0].x + " " + points[0].y + " ");

            for (var i = 1; i < points.length; i++) {
                path += ("L " + points[i].x + " " + points[i].y + " ");
            }

            //if (closePath) path += ("z");

            var polyline = paper.path(path);
            polyline.attr({
                fill: SvgGlobalControllerLogic.defaultFillColor,
                stroke: SvgGlobalControllerLogic.defaultStrokeColor,
                'stroke-width': SvgGlobalControllerLogic.defaultStrokeWidth,
                'stroke-dasharray': saveToDb ? "" : "-"
            });

            polyline.data("AnnotationType", "polyline");
            //console.log("drawPolyline", polyline);

            that.points = points;
            that.element = polyline;
            that.element.toBack();
            that.element.data("DocumentAnnotationId", that.annotationId);
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

            var tempPoints = [];

            if (points === null || points === undefined && element.attr("path").length > 0) {
                points = [];
                element.attr("path").forEach(function (p) {
                    points.push({
                        x: p[1],
                        y: p[2]
                    });
                });
            }

            //points.push(points[0]);
            points.forEach(function (m) {
                if (m.x !== undefined) {
                    tempPoints.push({
                        x: m.x / paperWidth,
                        y: m.y / paperHeight
                    });
                }
            });

            var svgPoints = [];
            for (var i = 0; i < tempPoints.length; i++) {
                svgPoints.push({
                    X: parseFloat(tempPoints[i].x),
                    Y: parseFloat(tempPoints[i].y),
                    OrderNumber: i
                });
            }


            var dbObject = {
                DocumentAnnotationId: that.annotationId,
                AnnotationType: that.type,
                ParentId: "", // not implemented yet
                DocumentVersionId: AnnotationApplication.documentVersionId,
                Fill: element.attr("fill"),
                Stroke: element.attr("stroke"),
                StrokeWidth: element.attr("stroke-width"),
                Points: svgPoints,
                Angle: 0, // not implemented yet
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
            var element = that.element;
            var points = that.points;

            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((that.svgController.paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((that.svgController.paper.height).replace("px", "")) / currentScale;
            //if (that.svgController.tempElement) that.svgController.tempElement.remove();

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
                Points: svgPoints,
                Angle: 0, // not implemented yet
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

            that.element.data("DocumentAnnotationId", that.annotationId);
            SvgGlobalControllerLogic.addToAnnotations2(that.annotationId, that);

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
            //if (that.element !== null) that.element.remove();
            if (that.element !== null) that.element.remove();
            if (that.maskids !== null) that.maskids.remove();
            if (that.glow !== null) that.glow.remove();
            //that.deleteMask();
        },

        //===============================================
        //================== Events =====================
        //===============================================

        bindEvents: function (element) {
            var me = this;
            var elementType = me.type;
            var paper = me.svgController.paper;

            var ox = 0;
            var oy = 0;
            var nx = 0;
            var ny = 0;

            var ts = null;//touchstart
            var te = null;//touchend
            var tm = null;//touchmove

            if (ROLE !== "Anonymous") {
                var that = me.svgController;
                var ts = null;//touchstart
                var te = null;//touchend
                var tm = null;//touchmove
                me.element
                    .touchstart(function (e) {
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
                        te = e;
                        if (te.timeStamp - ts.timeStamp < 500) {
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
                            dataExchange.sendParentMessage('clickObject',msg);
                            me.onClick(e);
                        } else if (te.timeStamp - ts.timeStamp > 500 ) {
                            SvgGlobalControllerLogic.openContextMenu(e, me);
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
                        SvgGlobalControllerLogic.hideGlow(me);
                        me.createMask();
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
                        //me.onElementClick(me, e);
                    })
                    .mouseover(function (e) {
                        //console.log(e);
                        $(e.target).css("cursor", "pointer");
                        SvgGlobalControllerLogic.showGlow(me);
                    })
                    .mouseout(function (e) {
                        //console.log(e);
                        $(e.target).css("cursor", "default");
                        SvgGlobalControllerLogic.hideGlow(me);
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
                            if (that.isDrawing === true) return;
                            if (e.which === 3 || me.svgController.contextMenu) return;

                            if (SvgGlobalControllerLogic.selectedIds2.length > 1) {
                                // var objectsToDrag = Object.keys(SvgGlobalControllerLogic.selectedIds2);
                                // console.log(objectsToDrag);
                                SvgGlobalControllerLogic.selectedIds2.forEach(function (id) {
                                    SvgGlobalControllerLogic.annotations2[id].onElementDragging(dx, dy, x, y, e);
                                });
                            } else {
                                //code to check if the person has permission
                                if(SvgGlobalControllerLogic.isDraggablePermission){
                                    me.onElementDragging(dx, dy, x, y, e);

                                }else{
                                    return;
                                }


                                
                                
                            }
                            me.removeHandles();
                            if (typeof me.glow !== 'undefined') SvgGlobalControllerLogic.hideGlow(me);
                        }, function (x, y) {  // start
                            //me.onElementDragStart(x, y);
                            me.isDragging = true;
                            me.svgController.clearAllCtrlBoxes(true);
                            me.svgController.clearAllJoints();
                            me.svgController.clearAllSelectedText();
                            me.removeHandles();
                        }, function (e) {  //end
                            if (that.isDrawing === true) return;
                            if (SvgGlobalControllerLogic.selectedIds2.length > 1) {
                                SvgGlobalControllerLogic.selectedIds2.forEach(function (id) {
                                    SvgGlobalControllerLogic.annotations2[id].onElementDragEnd(e);
                                });
                            } else {
                                me.onElementDragEnd(e);
                            }
                            me.isDragging = false;
                        }
                    )
                // .mouseup(function (e) {
                //     me.onMouseUp(e);
                // })
            }
        },

        onMouseUp: function (e) {
            var that = this;
            var svgController = that.svgController;
            if (e.which === 3) {
                // SvgGlobalControllerLogic.rightClickHandler(that, e);
                SvgGlobalControllerLogic.clearAllJoints();
                if(SvgGlobalControllerLogic.isCtrlKeyPressed){
                    SvgGlobalControllerLogic.selectedIds2.push(that.annotationId);
                }else{
                    SvgGlobalControllerLogic.selectedIds2 = [that.annotationId];
                }
               
                    //SvgGlobalControllerLogic.clearAllJoints();
                    //SvgGlobalControllerLogic.drawSelectBox();
                    if(SvgGlobalControllerLogic.selectedIds2.length>1){
                        //SvgGlobalControllerLogic.clearAllJoints();
                        SvgGlobalControllerLogic.drawSelectBox();
                    }else{
                        this.createHandles();
                    }
              
                SvgGlobalControllerLogic.openContextMenu(e, that);
                // e.stopPropagation();
            } else {
                that.onClick(e);
            }
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
                me.createHandles();
            }
        },

        onElementClick: function (me, e) {
            //if (me.annotationId in SvgGlobalControllerLogic.allSelectedObjects) return;
            if (SvgGlobalControllerLogic.isCtrlKeyPressed) {
                if(SvgGlobalControllerLogic.selectedIds2.indexOf(me.annotationId) === -1)SvgGlobalControllerLogic.allSelectedObjects.push(me.annotationId);
            } else {
                SvgGlobalControllerLogic.allSelectedObjects = [me.annotationId];
            }
            
            if(SvgGlobalControllerLogic.selectedIds2.length>1){
                //SvgGlobalControllerLogic.clearAllJoints();
                SvgGlobalControllerLogic.drawSelectBox();
            }else{
                me.createHandles();
            }
        },

        onElementMouseUp: function (me, e) {
            var svgController = me.svgController;
            if (e.which === 3) { // right click
                if (svgController.contextMenu) {
                    svgController.contextMenu.destroyContextMenu();
                }
                SvgGlobalControllerLogic.rightClickHandler(me, e);
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
                tempPath += ("L " + p[0] + " " + (parseInt(p[1]) + dx) + " " + (parseInt(p[2]) + dy));
            });
            tempPath = "M" + tempPath.substring(tempPath.indexOf('L') + 1);
            element.attr("path", tempPath);

            var points = [];
            for (var j = 0; j < element.attrs.path.length; j++) {
                points.push({
                    x: element.attrs.path[j][1],
                    y: element.attrs.path[j][2]
                })
            }
            that.points = points;
            // why redrawing? because the glow created based on real path. Checkout the object structure!
            //element = that.draw(points, null, false);
            //that.restoreMask(element);


            that.update();
        },

        //===============================================
        //================== Controls ===================
        //===============================================

        createHandles: function () {
            var that = this;
            var svgController = that.svgController;
            var element = that.element;
            var scale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseInt(svgController.paper.width.replace("px", "")) / scale;
            var paperHeight = parseInt(svgController.paper.height.replace("px", "")) / scale;

            var points = [];
            var path = element.attrs.path;
            for (var i = 0; i < element.attrs.path.length; i++) {
                if (path[i][1]) {
                    points.push({
                        x: path[i][1],
                        y: path[i][2]
                    });
                    if (i === element.attrs.path.length - 1 && points[0].x === path[i][1] && points[0].y === path[i][2]) {
                        // Do not draw joint for last point which is first point as well
                    } else {
                        that.drawPathJoint(i);
                    }

                }
            }
        },

        drawPathJoint: function (index) {
            var that = this;
            var element = that.element;
            var svgController = that.svgController;
            var paper = that.svgController.paper;
            var pathPoints = element.attrs.path.filter(p => ["M", "L"].includes(p[0]));
            var scale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseInt(paper.width.replace("px", "")) / scale;
            var paperHeight = parseInt(paper.height.replace("px", "")) / scale;
            var circ = paper.circle(pathPoints[index][1], pathPoints[index][2], 10 / scale)
                .attr({
                    parentId: element.id,
                    index: 2,
                    fill: "red",
                    opacity: 0.6
                })
                .drag(function (dx, dy, x, y, e) {
                    var scale = PDFViewerApplication.pdfViewer.currentScale;
                    var dxdy = svgController.getDXDY(dx, dy);
                    dx = dxdy.dx;
                    dy = dxdy.dy;
                    let lx = dx;
                    let ly = dy;

                    this.transform("T" + lx / scale + "," + ly / scale);

                    var pathPoints = element.attrs.path.filter(p => ["M", "L"].includes(p[0]));
                    element.attrs.path = pathPoints;

                    if (
                        (index === 0 || index === element.attrs.path.length - 1)
                        && (element.attrs.path[0][1] === element.attrs.path[element.attrs.path.length - 1][1])
                        && (element.attrs.path[0][2] === element.attrs.path[element.attrs.path.length - 1][2])
                    ) {
                        // first point
                        element.attrs.path[0][1] = this.matrix.x(this.attr("cx"), this.attr("cy"));
                        element.attrs.path[0][2] = this.matrix.y(this.attr("cx"), this.attr("cy"));
                        // last point
                        element.attrs.path[element.attrs.path.length - 1][1] = this.matrix.x(this.attr("cx"), this.attr("cy"));
                        element.attrs.path[element.attrs.path.length - 1][2] = this.matrix.y(this.attr("cx"), this.attr("cy"));
                    } else {
                        element.attrs.path[index][1] = this.matrix.x(this.attr("cx"), this.attr("cy"));
                        element.attrs.path[index][2] = this.matrix.y(this.attr("cx"), this.attr("cy"));
                    }

                    var pathTemp = "";
                    pathTemp += ("M " + element.attrs.path[0][1] + " " + element.attrs.path[0][2] + " ");

                    for (var j = 1; j < element.attrs.path.length; j++) {
                        pathTemp += ("L " + element.attrs.path[j][1] + " " + element.attrs.path[j][2] + " ");
                    }

                    //pathTemp += "z";
                    element.attr({
                        path: pathTemp
                    });

                }, function (x, y) {

                }, function (e) {
                    let lx = this.matrix.x(this.attr("cx"), this.attr("cy"));
                    let ly = this.matrix.y(this.attr("cx"), this.attr("cy"));
                    this.attr({ cx: lx, cy: ly });
                    this.transform("");


                    var pathPoints = element.attrs.path.filter(p => ["M", "L"].includes(p[0]));
                    element.attrs.path = pathPoints;

                    element.attrs.path[index][1] = lx;
                    element.attrs.path[index][2] = ly;

                    var pathTemp = "";

                    pathTemp += ("M " + element.attrs.path[0][1] + " " + element.attrs.path[0][2] + " ");

                    for (var j = 1; j < element.attrs.path.length; j++) {
                        pathTemp += ("L " + element.attrs.path[j][1] + " " + element.attrs.path[j][2] + " ");
                    }


                    element.attr({
                        path: pathTemp
                    });


                    var points = [];
                    for (var j = 0; j < element.attrs.path.length; j++) {
                        points.push({
                            x: element.attrs.path[j][1],
                            y: element.attrs.path[j][2]
                        })
                    }
                    //that.restoreMask(element);
                    that.points = points;
                    that.update();

                });
            circ.data("isJoint", true);
        },

        removeHandles: function () {
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

            var clonedSvgObject = new SvgPolyline(
                SvgGlobalControllerLogic.getSvgController(pageNumber).canvas,
                null,
                that.type,
                pageNumber,
                null,
                that.baseAngle,
                null
            );

            var x,y,dx,dy;
            if(e === null){
                dx =  10;
                dy = 10;
            }else{
                
                x = that.svgController.getXY(e, 1 / that.svgController.getScale()).x;
                y = that.svgController.getXY(e, 1 / that.svgController.getScale()).y;

                dx = element.getBBox().x + (element.getBBox().width/2) - x;
                dy = element.getBBox().y + (element.getBBox().height/2) - y;
            }

            clonedSvgObject.isPastedFrom = {
                fromSvgObject:that,
                x:x,
                y:y
            };

            var points = [];
            for(var i=0; i<element.attr("path").length; i++){
                points.push({
                    x: element.attr("path")[i][1] - dx,
                    y: element.attr("path")[i][2] - dy
                });
            }

            clonedSvgObject.create(
                points
            );
        },

        afterPaste: function(){
            var that = this;
            try{
                var element = that.isPastedFrom.fromSvgObject.element;
                var path = that.element.attr("path");
                that.element.attr(element.attrs);
                that.element.attr({
                    path:path
                });
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
                fill: "white",
                opacity: 0.01
            })
                .touchstart(function (e) {
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
                    te = e;
                    if (te.timeStamp - ts.timeStamp < 500) {
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
                        dataExchange.sendParentMessage('clickObject',msg);
                        me.onClick(e);
                    } else if (te.timeStamp - ts.timeStamp > 500) {
                        SvgGlobalControllerLogic.openContextMenu(e, me);
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
                    SvgGlobalControllerLogic.hideGlow(me);
                    me.createMask();
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
                    //that.onClick(e);
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
                    //me.onElementClick(me, e);
                })
                .mouseover(function (e) {
                    svgController.onElementMouseOver(e);
                    SvgGlobalControllerLogic.showGlow(me);
                })
                .mouseout(function (e) {
                    svgController.onElementMouseOut(e);
                    SvgGlobalControllerLogic.hideGlow(me);
                })
                .dblclick(function () {

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
                        try {
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
                                var msg = {
                                    exchangeId: AnnotationApplication.documentVersionId,
                                    event: {
                                        eventType: "AnnotationDrag",
                                        value: {
                                            object: me.type,
                                            annotationId: me.annotationId
                                        }
                                    }
                              }
                            //   var callback = function(){
                            //     if(SvgGlobalControllerLogic.isDraggablePermission){
                            //         me.onElementDragging(dx, dy, x, y, e);

                            //     }else {
                            //         return;
                            //     }

                            //   }
                            //   let checkdragObject = dataExchange.sendParentMessage('dragObject',msg);
                            //   if (checkdragObject){
                            //     if(SvgGlobalControllerLogic.isDraggablePermission){
                            //         me.onElementDragging(dx, dy, x, y, e);
        
                            //     }else {
                            //         return;
                                     
                            //     }
                            //   }

                            // $.ajax({
                            //     type: 'GET',
                            //     url: '/api/Annotation/Get/'+ me.annotationId,
                            //     headers: {
                            //         Authorization: "Bearer " + window.AuthenticationToken
                            //     },
                            //     success: function (response) {
                            //         if(SvgGlobalControllerLogic.isProjectManager){
                            //                     me.onElementDragging(dx, dy, x, y, e);
                    
                            //                 }
                            //                 else if(SvgGlobalControllerLogic.loggedInUser === response.CreatedBy) {
                            //                     me.onElementDragging(dx, dy, x, y, e);

                            //                 }
                            //                 else {
                            //                     return;
                                                 
                            //                 }
                                          
                            //         //resolve(response);
                            //     },
                            //     error: function (response) {
                            //         reject(response);
                            //     }
                            // });

                               
                              
                                



                                
                                me.onElementDragging(dx, dy, x, y, e);
                            }
                            me.removeHandles();
                            if (typeof me.glow !== 'undefined') SvgGlobalControllerLogic.hideGlow(me);
                            e.stopPropagation();
                        } catch (ex) {
                            console.error(ex);
                        }
                    }, function (x, y) {  // start
                        //me.onElementDragStart(x, y);
                        if (svgController.isDrawing === true) return;
                        me.isDragging = true;
                        me.svgController.clearAllCtrlBoxes(true);
                        me.svgController.clearAllJoints();
                        me.svgController.clearAllSelectedText();
                        me.removeHandles();
                    }, function (e) {  //end
                        try {
                            if (svgController.isDrawing === true) return;
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
                )

                .scale(1.15, 1.15)
                .toBack();
            that.maskids = mask;
        },

        deleteMask: function () {
            var that = this;
            if (that.maskids !== null) that.maskids.remove();

        },

        // end of methods
    }

    return SvgPolyline;
})();