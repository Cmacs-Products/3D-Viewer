"use strict";

var SvgCloud = (function () {

    function SvgCloud(
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
        this.isDragging = false;

        this.isPastedFrom = null;
        this.drawBoxAfterSave = false;

        this.url = null;
        this.points = null;
        this.glow = null;

    };

    SvgCloud.prototype = {
        constructor: SvgCloud,

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
            that.draw(points, true);


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

        draw: function (points, closePath) {
            var that = this;
            var paper = that.svgController.paper;
            var path = "";
            path += ("M " + points[0].x + " " + points[0].y + " ");

            for (var i = 1; i < points.length; i++) {
                path += ("L " + points[i].x + " " + points[i].y + " ");
            }

            var curvedPath = path;
            if (closePath) {
                path += ("z");
            }
            that.points = points;
            if (closePath) path = SvgGlobalControllerLogic.CreateCloudPath(points);
            var curvedPathArr = Raphael.path2curve(path);
            curvedPath = "";
            for (var i = 0; i < curvedPathArr.length; i++) {
                for (var j = 0; j < curvedPathArr[i].length; j++) {
                    curvedPath += (curvedPathArr[i][j] + " ");
                }
            }
            //console.log(curvedPath);

            var cloud = paper.path(curvedPath);

            cloud.attr({
                fill: '',
                stroke: SvgGlobalControllerLogic.defaultStrokeColor,
                'stroke-width': SvgGlobalControllerLogic.defaultStrokeWidth,
                'stroke-dasharray': closePath ? "" : "-"
            });
            //console.log("drawPCloud", cloud);
            that.element = cloud;
            that.element.data("AnnotationType", "cloud");
            that.element.data("DocumentAnnotationId", that.annotationId);
            that.element.toBack();

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


            if (points === null || points === undefined && element.attr("path").length > 0) {
                points = [];
                element.attr("path").filter(m => ["M", "m", "L", "l"].includes(m[0])).forEach(function (p) {
                    points.push({
                        x: p[1],
                        y: p[2]
                    });
                });
            }

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
                PageNumber: this.pageNumber,
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
            // var that = this;
            // if (that.element !== null && typeof that.element !== 'undefined') that.element.remove();

            var that = this;
            if (that.element !== null) that.element.remove();
            that.deleteMask();
            if (that.element !== null) that.element.remove();
            if (that.maskids !== null) that.maskids.remove();
            if (that.glow !== null) that.glow.remove();
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
                        //me.addGlow();
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
                        //me.drawHandles();
                    })
                    .mouseover(function (e) {
                        //console.log(e);
                        $(e.target).css("cursor", "pointer");
                    })
                    .mouseout(function (e) {
                        //console.log(e);
                        $(e.target).css("cursor", "default");
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
                            if (SvgGlobalControllerLogic.selectedIds2.length > 0) {
                                var objectsToDrag = Object.keys(SvgGlobalControllerLogic.selectedIds2);
                                console.log(objectsToDrag);
                                SvgGlobalControllerLogic.selectedIds2.forEach(function (id) {
                                    SvgGlobalControllerLogic.annotations2[id].onElementDragging(dx, dy, x, y, e);
                                });
                            } else {
                                if(SvgGlobalControllerLogic.isDraggablePermission){
                                    me.onElementDragging(dx, dy, x, y, e);

                                }else{
                                    return;
                                }
                               // me.onElementDragging(dx, dy, x, y, e);
                            }
                        }, function (x, y) {  // start
                            //me.onElementDragStart(x, y);
                            me.isDragging = true;
                            me.svgController.clearAllCtrlBoxes(true);
                            me.svgController.clearAllJoints();
                            me.svgController.clearAllSelectedText();
                            me.removeHandles();
                        }, function (e) {  //end
                            if (that.isDrawing === true) return;
                            if (SvgGlobalControllerLogic.selectedIds2.length > 0) {
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
                // SvgGlobalControllerLogic.rightClickHandler(that, e);
                if(SvgGlobalControllerLogic.isCtrlKeyPressed){
                    SvgGlobalControllerLogic.selectedIds2.push(that.annotationId);
                }else{
                    SvgGlobalControllerLogic.selectedIds2 = [that.annotationId];
                }
                //this.showControlBox();
              
                    //SvgGlobalControllerLogic.clearAllJoints();
                    //SvgGlobalControllerLogic.drawSelectBox();
                    if(SvgGlobalControllerLogic.selectedIds2.length>1){
                        //SvgGlobalControllerLogic.clearAllJoints();
                        SvgGlobalControllerLogic.drawSelectBox();
                    }else{
                        this.drawHandles();
                    }
                
                SvgGlobalControllerLogic.openContextMenu(e, that);
                // e.stopPropagation();
            } else {
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
            element.transform("");
            var tempPath = "";
            var mPoints = element.attr("path").filter(p => p[0].toLowerCase() === "m" || p[0].toLowerCase() === "l");
            for (var i = 0; i < mPoints.length; i++) {
                mPoints[i][1] = (parseFloat(mPoints[i][1]) + dx).toFixed(0);
                mPoints[i][2] = (parseFloat(mPoints[i][2]) + dy).toFixed(0);
                tempPath += ((i === 0 ? "M" : " L") + " " + mPoints[i][1] + " " + mPoints[i][2]);
            }

            var points = [];
            mPoints.forEach(function (p) {
                points.push({
                    x: parseInt(p[1]),
                    y: parseInt(p[2])
                });
            });
            tempPath += "z";
            tempPath = SvgGlobalControllerLogic.CreateCloudPath(points);
            element.attr("path", tempPath);
            //that.restoreMask(element);
            that.points = points;

            that.update();
        },


        //===============================================
        //================== Controls ===================
        //===============================================

        drawHandles: function () {
            var that = this;
            var svgController = that.svgController;
            var element = that.element;
            var scale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseInt(svgController.paper.width.replace("px", "")) / scale;
            var paperHeight = parseInt(svgController.paper.height.replace("px", "")) / scale;

            var points = [];
            var path = element.attrs.path.filter(p => p[0] === "M");

            for (var i = 0; i < path.length; i++) {
                if (path[i][1]) {
                    points.push({
                        x: path[i][1],
                        y: path[i][2]
                    });
                    if (i === path.length - 1 && points[0].x === path[i][1] && points[0].y === path[i][2]) {
                        // Do not draw joint for last point which is first point as well
                    } else {
                        that.drawPathJoint(i);
                    }
                }
            }
            var pathString = SvgGlobalControllerLogic.CreateCloudPath(points);
            element.attr("path", Raphael.parsePathString(pathString));
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
                    that.deleteMask();
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
                    pathTemp += ("z"); // close the path

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

                    var polyPoints = [];
                    element.attrs.path.forEach(function (m) {
                        if (["m", "l"].includes(m[0].toLowerCase())) {
                            //m[1] += element.matrix.split().dx;
                            //m[2] += element.matrix.split().dy;
                            polyPoints.push({
                                x: m[1],
                                y: m[2]
                            });
                        }
                    });
                    pathTemp = SvgGlobalControllerLogic.CreateCloudPath(polyPoints);


                    element.attr({
                        path: pathTemp
                    });


                    var points = [];
                    var criticalPoints = element.attrs.path.filter(p => ["M", "L"].includes(p[0]));
                    for (var j = 0; j < criticalPoints.length; j++) {
                        points.push({
                            x: criticalPoints[j][1],
                            y: criticalPoints[j][2]
                        })
                    }
                    that.points = points;
                    that.update();
                    that.createMask();
                });
            circ.data("isJoint", true);
        },

        onJointDragging: function (dx, dy, x, y, e, index) {

        },

        onJointDragStart: function (x, y) {

        },

        onJointDragEnd: function (e) {


        },

        removeHandles: function () {
            var that = this;
            that.handleids.forEach(function (handle) {
                handle.remove();
            });
            that.handleids = [];
        },

        addGlow: function () {
            var that = this;
            if (that.glow !== null) {
                that.glow.forEach(function (el) {
                    el.remove();
                });
            }
            that.glow = that.element.glow({
                "width": 10,
                //color: "blue"
            })
        },

        paste: function (e, pageNumber) {
            var that = this;
            var paper = that.svgController.paper;
            var element = that.element;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((paper.height).replace("px", "")) / currentScale;

            var clonedSvgObject = new SvgCloud(
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

                // dx = element.attr("path")[1][1] - x;
                // dy = element.attr("path")[1][2] - y;

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
                if(element.attr("path")[i][0] === "M"){
                    points.push({
                        x: element.attr("path")[i][1] - dx,
                        y: element.attr("path")[i][2] - dy
                    });
                }
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

            var points = that.element.attrs.path.filter(function(p){return p[0] === "M"});
            var path = "";
            
            path += ("M" + points[0][1] + "," + points[0][2]);
            for(var i=1; i<points.length; i++){
                path += ("L" + points[i][1] + "," + points[i][2]);
            }
            path += "z";
            var mask = that.svgController.paper.path(path);

            //var mask = that.element.clone();
            var ts = null;//touchstart
            var te = null;//touchend
            var tm = null;//touchmove
            mask.attr({
                stroke: "white",
                fill: "white",
                opacity: 0.01,
                "stroke-width": that.element.attr("stroke-width") * 3
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
                      console.log("Inside touch click")
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
                    //me.addGlow();
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
                    //me.drawHandles();
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
                        if (e.which === 3 || me.svgController.contextMenu) return;
                        if (SvgGlobalControllerLogic.selectedIds2.length > 0) {
                            var objectsToDrag = Object.keys(SvgGlobalControllerLogic.selectedIds2);
                            console.log(objectsToDrag);
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
                            //me.onElementDragging(dx, dy, x, y, e);
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
                        if (svgController.isDrawing === true) return;
                        if (SvgGlobalControllerLogic.selectedIds2.length > 0) {
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

                //.scale(1.15, 1.15)
                .toBack();
            that.maskids = mask;
        },

        deleteMask: function () {
            var that = this;
            if (that.maskids !== null) that.maskids.remove();

        },

        // end of methods
    }

    return SvgCloud;
})();