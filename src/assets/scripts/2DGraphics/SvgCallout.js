"use strict";

var SvgCallout = (function () {

    function SvgCallout(
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

        this.tempOnCreateObjects = [];

    };

    SvgCallout.prototype = {
        constructor: SvgCallout,

        //===============================================
        //================== create =====================
        //===============================================

        beforeCreate: function () {
            var that = this;

        },

        create: function (points, text, fontSize, insertToDb, baseAngle) {
            var that = this;
            // before
            that.beforeCreate();

            // create
            that.draw(points, text, fontSize, insertToDb, baseAngle);


            // after
            that.afterCreate();

        },

        afterCreate: function () {
            var that = this;
            that.save();
            that.bindTextboxEvents(that.element.text);
            that.bindTextboxEvents(that.element.rect1);
            that.bindLineEvents(that.element.lineHead);
            that.bindLineEvents(that.element.lineTale);
            that.createMask();
        },

        draw: function (points, text, fontSize, insertToDb, baseAngle) {
            var that = this;
            try {
                var currentScale = PDFViewerApplication.pdfViewer.currentScale;

                if (points.length > 0) {
                    //if (that.svgController.tempElement !== null) that.svgController.tempElement.remove();
                    switch (points.length) {
                        case 1:
                            console.log(1);
                            if (that.svgController.tempElement === null) that.svgController.tempElement = [];
                            that.svgController.tempElement.push(
                                that.svgController.paper.circle(points[0].x, points[0].y, 5 / currentScale, 5 / currentScale, false).attr({
                                    "stroke-dasharray": "",
                                    "stroke": SvgGlobalControllerLogic.defaultStrokeColor,
                                    "fill": "silver"
                                })
                            );
                            break;
                        case 2:
                            console.log(2);
                            if (that.svgController.tempElement === null) that.svgController.tempElement = [];
                            that.svgController.tempElement.push(
                                that.svgController.paper.circle(points[0].x, points[0].y, 5 / currentScale, 5 / currentScale, false).attr({
                                    "stroke-dasharray": "",
                                    "stroke": SvgGlobalControllerLogic.defaultStrokeColor,
                                    "fill": "silver"
                                }),
                                that.svgController.paper.circle(points[1].x, points[1].y, 5 / currentScale, 5 / currentScale, false).attr({
                                    "stroke-dasharray": "",
                                    "stroke": SvgGlobalControllerLogic.defaultStrokeColor,
                                    "fill": "silver"
                                }),
                                that.svgController.paper.path("M " + points[1].x + " " + points[1].y + " L " + points[0].x + " " + points[0].y).attr({
                                    "stroke-dasharray": "",
                                    "stroke": SvgGlobalControllerLogic.defaultStrokeColor,
                                    "fill": SvgGlobalControllerLogic.defaultTextAnnotationFillColor
                                })
                            );
                            break;
                        case 3:
                            console.log(3);
                            var l1 = that.svgController.paper.path("M " + points[1].x + " " + points[1].y + " L " + points[0].x + " " + points[0].y).attr({
                                "stroke-dasharray": "",
                                "stroke": SvgGlobalControllerLogic.defaultStrokeColor,
                                "fill": SvgGlobalControllerLogic.defaultTextAnnotationFillColor
                            });
                            l1.attr({
                                "arrow-end": "classic"
                            });
                            var l2 = that.svgController.paper.path("M " + points[1].x + " " + points[1].y + " L " + points[2].x + " " + points[2].y).attr({
                                "stroke-dasharray": "",
                                "stroke": SvgGlobalControllerLogic.defaultStrokeColor,
                                "fill": SvgGlobalControllerLogic.defaultTextAnnotationFillColor
                            });

                            that.svgController.tempElement.push(
                                l1,
                                l2
                            );
                            break;
                        case 4:
                            console.log(4);
                            var l1 = that.svgController.paper.path("M " + points[1].x + " " + points[1].y + " L " + points[0].x + " " + points[0].y).attr({
                                "stroke-dasharray": "",
                                "fill": "silver",
                                "arrow-end": "classic",
                                fill: SvgGlobalControllerLogic.defaultTextAnnotationFillColor,
                                stroke: SvgGlobalControllerLogic.defaultStrokeColor,
                                'stroke-width': SvgGlobalControllerLogic.defaultStrokeWidth
                            });
                            var l2 = that.svgController.paper.path("M " + points[1].x + " " + points[1].y + " L " + points[2].x + " " + points[2].y).attr({
                                "stroke-dasharray": "",
                                "fill": "silver", fill: SvgGlobalControllerLogic.defaultTextAnnotationFillColor,
                                stroke: SvgGlobalControllerLogic.defaultStrokeColor,
                                'stroke-width': SvgGlobalControllerLogic.defaultStrokeWidth
                            });
                            var textElm = that.svgController.paper.text(points[2].x, points[2].y, text, false, fontSize);
                            var rectElm = that.svgController.paper.rect(
                                textElm.getBBox().x - 3,
                                textElm.getBBox().y - 3,
                                textElm.getBBox().width + 6,
                                textElm.getBBox().height + 6
                            );
                            rectElm.attr({
                                fill: SvgGlobalControllerLogic.defaultTextAnnotationFillColor
                            });
                            textElm.remove();
                            textElm = that.svgController.paper.text(points[2].x, points[2].y, text, false, fontSize);

                            textElm.rotate(-1 * that.baseAngle, points[2].x, points[2].y);
                            rectElm.rotate(-1 * that.baseAngle, points[2].x, points[2].y);

                            textElm.data("Angle", -that.baseAngle);
                            rectElm.data("Angle", -that.baseAngle);

                            textElm.data("isCalloutTextbox", l2.id);

                            that.element = {
                                text: textElm,
                                rect1: rectElm,
                                lineHead: l1,
                                lineTale: l2
                            }

                            //that.bindEvents();

                            if (insertToDb) that.svgController.stopDrawing();
                            that.element.text.data("DocumentAnnotationId", that.annotationId);
                            that.element.rect1.data("DocumentAnnotationId", that.annotationId);
                            that.element.lineHead.data("DocumentAnnotationId", that.annotationId);
                            that.element.lineTale.data("DocumentAnnotationId", that.annotationId);
                            return that.element;
                            break;
                    }
                }
            } catch (ex) {
                console.error(ex);
            }

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
            var rect = that.element.rect1;
            var lineHead = that.element.lineHead;
            var lineTale = that.element.lineTale;
            var fill = rect.attr("fill");
            var rect;

            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((paper.height).replace("px", "")) / currentScale;

            var dbObject = {
                DocumentAnnotationId: that.annotationId,
                AnnotationType: that.type,
                ParentId: "", // not implemented yet
                DocumentVersionId: AnnotationApplication.documentVersionId,
                AnnotationName: that.type,
                Points: [
                    { X: parseFloat(lineHead.attrs.path[0][1] / paperWidth), Y: parseFloat(lineHead.attrs.path[0][2] / paperHeight), OrderNumber: 0 },// this is the shared point
                    { X: parseFloat(lineHead.attrs.path[1][1] / paperWidth), Y: parseFloat(lineHead.attrs.path[1][2] / paperHeight), OrderNumber: 1 },
                    { X: parseFloat(lineTale.attrs.path[1][1] / paperWidth), Y: parseFloat(lineTale.attrs.path[1][2] / paperHeight), OrderNumber: 2 }
                ],
                //Fill: element[0].attr("fill"),
                Fill: fill,
                Stroke: lineHead.attr("stroke"),
                StrokeWidth: lineHead.attr("stroke-width"),
                Text: text.attr("text"),
                FontSize: text.attr("font-size"),
                Angle: -1 * rect.getAngle(),
                IsSelectable: true,
                IsGroup: true, // not implemented yet
                Scale: "",
                ModifiedBy: lineHead.getModifiedBy(),
                CreatedBy: lineHead.getCreatedBy(),
                DeletedBy: null,
                CreatedOn: null,
                ModifiedOn: null,
                DeletedOn: null,
                EMSNodeId: null, // not implemented yet
                ChildDocumentId: null, // not implemented yet
                PageId: lineHead.getPageId(),
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
            var text = that.element.text;
            var rect = that.element.rect1;
            var lineHead = that.element.lineHead;
            var lineTale = that.element.lineTale;
            var fill = rect.attr("fill");
            var rect;

            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((paper.height).replace("px", "")) / currentScale;
            if (svgController.tempElement) svgController.tempElement.remove();

            var dbObject = {
                DocumentAnnotationId: "00000000-0000-0000-0000-000000000000",
                AnnotationType: that.type,
                ParentId: "", // not implemented yet
                DocumentVersionId: AnnotationApplication.documentVersionId,
                AnnotationName: that.type,
                Points: [
                    { X: parseFloat(lineHead.attrs.path[0][1] / paperWidth), Y: parseFloat(lineHead.attrs.path[0][2] / paperHeight), OrderNumber: 0 },// this is the shared point
                    { X: parseFloat(lineHead.attrs.path[1][1] / paperWidth), Y: parseFloat(lineHead.attrs.path[1][2] / paperHeight), OrderNumber: 1 },
                    { X: parseFloat(lineTale.attrs.path[1][1] / paperWidth), Y: parseFloat(lineTale.attrs.path[1][2] / paperHeight), OrderNumber: 2 }
                ],
                //Fill: element[0].attr("fill"),
                Fill: fill,
                Stroke: lineHead.attr("stroke"),
                StrokeWidth: lineHead.attr("stroke-width"),
                Text: text.attr("text"),
                FontSize: text.attr("font-size"),
                ArrowStart: "classic",
                ArrowEnd: "classic",
                Angle: -1 * rect.getAngle(),
                IsSelectable: true,
                IsGroup: true, // not implemented yet
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

            that.element.text.data("DocumentAnnotationId", that.annotationId);
            that.element.rect1.data("DocumentAnnotationId", that.annotationId);
            that.element.lineHead.data("DocumentAnnotationId", that.annotationId);
            that.element.lineTale.data("DocumentAnnotationId", that.annotationId);

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
            for (var i = 0; i < that.tempOnCreateObjects.length; i++) {
                that.tempOnCreateObjects[i].remove();
            }
            that.tempOnCreateObjects = [];

            that.element.text.remove();
            that.element.rect1.remove();
            that.element.lineHead.remove();
            that.element.lineTale.remove();
            if (that.glow !== null) that.glow.remove();
            that.deleteMask();
        },

        //===============================================
        //================== Events =====================
        //===============================================

        bindTextboxEvents: function (element) {
            if(SvgGlobalControllerLogic.isAnonymous()) return;
            var me = this;
            var elementType = me.type;
            var paper = me.svgController.paper;
            if (ROLE !== "Anonymous") {
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
                                dataExchange.sendParentMessage('clickObject',msg);
                                me.onTextboxClick(e);
                            } else if (te.timeStamp - ts.timeStamp > 500 && that.isDragging === false) {
                                SvgGlobalControllerLogic.openContextMenu(e, me);
                            } else {
                                try {
                                    if (that.isDrawing === true) return;
                                    me.onTextboxDragEnd(e);
                                    me.drawHandles();
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

                                
                                me.onTextboxDragging(element,dx, dy, null, null, e);
                                
                                
                                e.stopPropagation();
                            } catch (ex) {
                                console.error(ex);
                            }

                        })
                        .click(function (e) {
                            //that.onElementClick(element, paper, elementType);
                            //me.onClick(e);
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
                        .dblclick(function () {
                            SvgGlobalControllerLogic.svgObject = me;
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
                           // me.svgController.openTextBoxEdit(me);
                        })
                        .mouseup(function (e) {
                            //var element = that.getElementByDocId(this.data("DocumentAnnotationId"));
                            //that.mouseupHandler(e, element, paper, elementType);
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
                                var dxdy = that.getDXDY(dx, dy);
                                dx = dxdy.dx;
                                dy = dxdy.dy;
                                if(SvgGlobalControllerLogic.isDraggablePermission){
                                me.onTextboxDragging(element, dx, dy, x, y, e);
                                }else{
                                    return;
                                }
                                if (typeof me.glow !== 'undefined') SvgGlobalControllerLogic.hideGlow(that);
                                e.stopPropagation();
                            }, function (x, y) {  // start
                                if(SvgGlobalControllerLogic.isDraggablePermission){
                                me.onTextboxDragStart(x, y);
                                }else{
                                    return;
                                }
                            }, function (e) {  //end
                                if(SvgGlobalControllerLogic.isDraggablePermission){
                                me.onTextboxDragEnd(e);
                                }else{
                                    return;
                                }
                                me.drawHandles();
                            }
                        );
                } catch (ex) {
                    console.error(ex);
                }
            }
        },

        bindLineEvents: function (element) {
            if(SvgGlobalControllerLogic.isAnonymous()) return;
            var me = this;
            var elementType = me.type;
            var paper = me.svgController.paper;
            if (ROLE !== "Anonymous") {
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
                                dataExchange.sendParentMessage('clickObject',msg);
                                me.onClick(e);
                            } else if (te.timeStamp - ts.timeStamp > 500 && that.isDragging === false) {
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
                            // if (SvgGlobalControllerLogic.isCtrlKeyPressed && SvgGlobalControllerLogic.selectedIds2.indexOf(me.annotationId) < 0) {
                            //     SvgGlobalControllerLogic.selectedIds2.push(me.annotationId);
                            // } else {
                            //     SvgGlobalControllerLogic.selectedIds2 = [me.annotationId];
                            // }
                            // me.drawHandles();
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
                        .dblclick(function () {
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

                        })
                        .mouseup(function (e) {
                            //me.onMouseUp(e);


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
                                if (!me.isDragging) return;
                                if (e.which === 3 || me.svgController.contextMenu) return;
                                if (SvgGlobalControllerLogic.selectedIds2.length > 1) {
                                    SvgGlobalControllerLogic.selectedIds2.forEach(function (id) {
                                        SvgGlobalControllerLogic.annotations2[id].onElementDragging(dx, dy, x, y, e);
                                    });
                                } else {
                                    me.onElementDragging(dx, dy, x, y, e);
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
                                me.onElementDragStart(x, y);
                            }, function (e) {  //end
                                if (me.svgController.isDrawing === true) return;
                                me.createMask();
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
                                if (Object.keys(e).indexOf("which") !== -1 || e.which !== 3 && !SvgGlobalControllerLogic.isCtrlKeyPressed) SvgGlobalControllerLogic.selectedIds2 = [];
                            }
                        );
                } catch (ex) {
                    console.error(ex);
                }
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
                SvgGlobalControllerLogic.clearAllJoints(true);
                SvgGlobalControllerLogic.selectedIds2 = [me.annotationId];
            }
            
            if(SvgGlobalControllerLogic.selectedIds2.length>1){
                //SvgGlobalControllerLogic.clearAllJoints();
                SvgGlobalControllerLogic.drawSelectBox();
            }else{
                me.drawHandles();
            }
        },

        onTextboxClick: function (e) {
            var me = this;
            SvgGlobalControllerLogic.selectedIds2 = [me.annotationId];
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
               // me.svgController.openTextBoxEdit(me);
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
            } 
        },

        onTextboxDragStart: function (x, y) {

        },

        onTextboxDragging: function (el, dx, dy, x, y, e) {
            var that = this;

            var scale = PDFViewerApplication.pdfViewer.currentScale;
            try {
                if (!that.svgController.isDrawing && (Math.abs(dx) + Math.abs(dy) !== 0)) {
                    SvgGlobalControllerLogic.isDraggingElement = true;
                    var lx = dx;// + ox ;
                    var ly = dy;// + oy ;

                    that.element.text.transform("T" + lx / that.svgController.getScale() + "," + ly / that.svgController.getScale() + "r" + -1 * that.baseAngle);
                    that.element.rect1.transform("T" + lx / that.svgController.getScale() + "," + ly / that.svgController.getScale() + "r" + -1 * that.baseAngle);
                    var path = that.element.lineTale.attr("path");
                    that.element.lineTale.attr("path", "M " + path[0][1] + " " + path[0][2]
                        + " L " + (that.element.text.getBBox().x + that.element.text.getBBox().width / 2) + " " + (that.element.text.getBBox().y + that.element.text.getBBox().height / 2));
                }

            } catch (ex) {
                console.error(ex);
            }
        },

        onElementDragEnd: function (e) {
            var that = this;
            that.onTextboxDragEnd(e);
        },


        onTextboxDragEnd: function (e) {
            var that = this;
            that.createMask();
            if (!this.isDrawing && SvgGlobalControllerLogic.isDraggingElement) {

                SvgGlobalControllerLogic.isDraggingElement = false;
                that.element.text.rotate(that.baseAngle);
                that.element.rect1.rotate(that.baseAngle);

                var dx = that.element.text.matrix.split().dx;
                var dy = that.element.text.matrix.split().dy;

                that.element.text.transform("");
                that.element.rect1.transform("");

                that.element.text.attr("x", that.element.text.attr("x") + dx);
                that.element.rect1.attr("x", that.element.rect1.attr("x") + dx);

                that.element.text.attr("y", that.element.text.attr("y") + dy);
                that.element.rect1.attr("y", that.element.rect1.attr("y") + dy);


                that.element.text.rotate(-that.baseAngle);
                that.element.rect1.rotate(-that.baseAngle);

                that.update();
            }
        },

        onElementDragging: function (dx, dy, x, y, e) {
            var that = this;
            var text = that.element.text;
            var rect = that.element.rect1;
            var lh = that.element.lineHead;
            var lt = that.element.lineTale;

            var svgController = that.svgController;
            var dxdy = svgController.getDXDY(dx, dy);
            dx = dxdy.dx;
            dy = dxdy.dy;

            if (!this.isDrawing && (Math.abs(dx) + Math.abs(dy) !== 0)) {
                SvgGlobalControllerLogic.isDraggingElement = true;
                var lx = dx;// + ox ;
                var ly = dy;// + oy ;

                text.transform("T" + lx / svgController.getScale() + "," + ly / svgController.getScale() + "r" + -1 * that.baseAngle);
                rect.transform("T" + lx / svgController.getScale() + "," + ly / svgController.getScale() + "r" + -1 * that.baseAngle);
                lh.transform("T" + lx / svgController.getScale() + "," + ly / svgController.getScale());
                lt.transform("T" + lx / svgController.getScale() + "," + ly / svgController.getScale());
            }


            e.stopPropagation();
        },

        onMouseUp: function (e) {
            var that = this;
            var svgController = that.svgController;
            if (e.which === 3) {
                SvgGlobalControllerLogic.clearAllJoints();
                //SvgGlobalControllerLogic.rightClickHandler(that, e);
              
                    //SvgGlobalControllerLogic.clearAllJoints();
                    //SvgGlobalControllerLogic.drawSelectBox();
                    if(SvgGlobalControllerLogic.selectedIds2.length>1){
                        //SvgGlobalControllerLogic.clearAllJoints();
                        SvgGlobalControllerLogic.drawSelectBox();
                    }else{
                        this.drawHandles();
                    }
              
                SvgGlobalControllerLogic.openContextMenu(e, that);
               // SvgGlobalControllerLogic.drawSelectBox();

                //this.showControlBox();
                //e.stopPropagation();
            } else {
                that.onClick(e);
            }
        },

        onElementDragStart: function (x, y) {
            var that = this;

        },

        onElementDragEnd: function (e) {
            var that = this;
            var svgController = that.svgController;
            var text = that.element.text;
            var rect = that.element.rect1;
            var lh = that.element.lineHead;
            var lt = that.element.lineTale;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((svgController.paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((svgController.paper.height).replace("px", "")) / currentScale;

            var dx, dy, newX, newY, angle;

            angle = lh.matrix.split().rotate;
            lh.attr({ "class": "hidden" });
            lh.rotate(-angle);
            dx = lh.matrix.split().dx;
            dy = lh.matrix.split().dy;
            lh.rotate(angle);
            lh.attr({ "class": "" });
            newX = lh.attr("x") + dx;
            newY = lh.attr("y") + dy;
            angle = lh.matrix.split().rotate;

            // line Head
            var tempPath = "";
            lh.transform("");
            lh.attr("path").forEach(function (p) {
                tempPath += (" " + p[0] + " " + (parseInt(p[1]) + dx) + " " + (parseInt(p[2]) + dy));
            });
            lh.attr("path", tempPath);

            // line tale
            var tempPath = "";
            lt.transform("");
            lt.attr("path").forEach(function (p) {
                tempPath += (" " + p[0] + " " + (parseInt(p[1]) + dx) + " " + (parseInt(p[2]) + dy));
            });
            lt.attr("path", tempPath);

            // text
            text.transform("");
            text.attr({
                x: text.attr("x") + dx,
                y: text.attr("y") + dy
            });
            text.rotate(-that.baseAngle);

            // rect
            rect.transform("");
            rect.attr({
                x: rect.attr("x") + dx,
                y: rect.attr("y") + dy
            });
            rect.rotate(-that.baseAngle);

            that.update();
        },

        //===============================================
        //================== Controls ===================
        //===============================================

        drawHandles: function () {
            var that = this;
            var svgController = that.svgController;
            var paper = that.svgController.paper;
            var lh = that.element.lineHead;
            var lt = that.element.lineTale;

            if (that.handleids.length > 0) that.clearHandles();

            var scale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseInt(paper.width.replace("px", "")) / scale;
            var paperHeight = parseInt(paper.height.replace("px", "")) / scale;

            // lineHead
            var ts, tm, te;

            var onDragC1 = function (dx, dy, x, y, e, obj) {
                var dxdy = svgController.getDXDY(dx, dy);
                dx = dxdy.dx;
                dy = dxdy.dy;
                var el = lh;
                let lx = dx;
                let ly = dy;
                obj.transform("T" + lx / scale + "," + ly / scale);
                el.attr({
                    path: "M " + el.attrs.path[0][1] + " " + el.attrs.path[0][2]
                        + " L " + obj.matrix.x(obj.attr("cx"), obj.attr("cy")) + " " + obj.matrix.y(obj.attr("cx"), obj.attr("cy"))
                });
            }

            var onDragEndC1 = function (e, obj) {
                var el = lh;
                console.log("drag ended", e);
                let lx = obj.matrix.x(obj.attr("cx"), obj.attr("cy"));
                let ly = obj.matrix.y(obj.attr("cx"), obj.attr("cy"));
                lx = lx < 5 ? 0 : lx;
                ly = ly < 5 ? 0 : ly;
                lx = lx > paperWidth ? paperWidth - 5 : lx;
                ly = ly > paperHeight ? paperHeight - 5 : ly;
                obj.attr({ cx: lx, cy: ly });
                obj.transform("");

                el.attr({
                    path: "M " + el.attrs.path[0][1] + " " + el.attrs.path[0][2]
                        + " L " + lx + " " + ly
                });
                that.update();
            }

            var c1 = paper.circle(lh.attr("path")[1][1], lh.attr("path")[1][2], 10 / scale)
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
                    console.log(" x:" + x + " y:" + y);

                }, function (e) {
                    if(SvgGlobalControllerLogic.isDraggablePermission){
                        onDragEndC1(e, this);
                    }else{
                        return;
                    }
                });

            // lineTale
            var onDragC2 = function (dx, dy, x, y, e, obj) {
                var dxdy = svgController.getDXDY(dx, dy);
                dx = dxdy.dx;
                dy = dxdy.dy;
                var el = lt;
                let lx = dx;
                let ly = dy;
                var parent = paper.getById(obj.parentId);
                obj.transform("T" + lx / scale + "," + ly / scale);
                el.attr({
                    path: "M " + obj.matrix.x(obj.attr("cx"), obj.attr("cy")) + " " + obj.matrix.y(obj.attr("cx"), obj.attr("cy"))
                        + " L " + el.attrs.path[1][1] + " " + el.attrs.path[1][2]
                });
                lh.attr({
                    path: "M " + obj.matrix.x(obj.attr("cx"), obj.attr("cy")) + " " + obj.matrix.y(obj.attr("cx"), obj.attr("cy"))
                        + " L " + lh.attrs.path[1][1] + " " + lh.attrs.path[1][2]
                });
            }

            var onDragEndC2 = function (e, obj) {
                var el = lh;
                console.log("drag ended", e);
                let lx = obj.matrix.x(obj.attr("cx"), obj.attr("cy"));
                let ly = obj.matrix.y(obj.attr("cx"), obj.attr("cy"));
                lx = lx < 5 ? 0 : lx;
                ly = ly < 5 ? 0 : ly;
                lx = lx > paperWidth ? paperWidth - 5 : lx;
                ly = ly > paperHeight ? paperHeight - 5 : ly;
                obj.attr({ cx: lx, cy: ly });
                obj.transform("");

                el.attr({
                    path: "M " + lx + " " + ly
                        + " L " + el.attrs.path[1][1] + " " + el.attrs.path[1][2]
                });
                lh.attr({
                    path: "M " + lx + " " + ly
                        + " L " + lh.attrs.path[1][1] + " " + lh.attrs.path[1][2]
                });
                that.update();
            }

            var c2 = paper.circle(lh.attr("path")[0][1], lh.attr("path")[0][2], 10 / scale)
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
                    console.log(" x:" + x + " y:" + y);

                }, function (e) {
                    if(SvgGlobalControllerLogic.isDraggablePermission){
                        onDragEndC2(e, this);
                    }
                    else{
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

            var clonedSvgObject = new SvgCallout(
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

            var x,y,dx,dy;
            if(e === null){
                

                dx =  10;
                dy = 10;
            }else{
                
                x = that.svgController.getXY(e, 1 / that.svgController.getScale()).x;
                y = that.svgController.getXY(e, 1 / that.svgController.getScale()).y;

                dx =  element.lineHead.attr("path")[1][1] - x;
                dy = element.lineHead.attr("path")[1][2] - y;
            }

            try {
                clonedSvgObject.isPastedFrom = {
                    fromSvgObject:that,
                    x:x,
                    y:y
                };

    
                clonedSvgObject.create(
                    [
                        {
                            x: element.lineHead.attr("path")[1][1] - dx,
                            y: element.lineHead.attr("path")[1][2] - dy
                        },
                        {
                            x: element.lineTale.attr("path")[0][1] - dx,
                            y: element.lineTale.attr("path")[0][2] - dy
                        },
                        {
                            x: element.lineTale.attr("path")[1][1] - dx,
                            y: element.lineTale.attr("path")[1][2] - dy
                        },
                        {
                            x: null,
                            y: null
                        },
                    ],
                    element.text.attr("text"),
                    element.text.attr("font-size"),
                    null,
                    that.baseAngle
                );
                // clonedSvgObject.element.text.attr(element.text.attrs);
                // clonedSvgObject.element.rect1.attr(element.rect1.attrs);
                // clonedSvgObject.element.lineHead.attr(element.lineHead.attrs);
                // clonedSvgObject.element.lineTale.attr(element.lineTale.attrs);
                // // clonedSvgObject.element.transform(element.transform());
                // // clonedSvgObject.element.attr({
                // //     x: clonedSvgObject.element.attr("x") + 10,
                // //     y: clonedSvgObject.element.attr("y") + 10
                // // });
            } catch (ex) {
                console.error(ex);
            }

        },

        afterPaste: function(){
            var that = this;
            try{
                var element = that.isPastedFrom.fromSvgObject.element;
                var pathHeadPath = that.element.lineHead.attr("path");
                var pathTalePath = that.element.lineTale.attr("path");
                var xt = that.element.text.attr("x");
                var yt = that.element.text.attr("y");
                var xr = that.element.rect1.attr("x");
                var yr = that.element.rect1.attr("y");

                var rotate = element.text.matrix.split().rotate;

                that.element.lineHead.attr(element.lineHead.attrs);
                that.element.lineTale.attr(element.lineTale.attrs);
                that.element.text.attr(element.text.attrs);
                that.element.rect1.attr(element.rect1.attrs);

                

                that.element.lineHead.attr({
                    path:pathHeadPath
                });
                that.element.lineTale.attr({
                    path:pathTalePath
                });
                that.element.text.attr({
                    x:xt,
                    y:yt
                });
                that.element.rect1.attr({
                    x:xr,
                    y:yr
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
            that.maskids = [];
            [that.element.rect1].forEach(function (element) {
                var mask = element.clone();
                mask.attr({
                    stroke: "white",
                    fill: "white",
                    opacity: 0.01,
                    "stroke-width": 4,
                })
                    .mouseover(function (e) {
                        svgController.onElementMouseOver(e);
                        SvgGlobalControllerLogic.showGlow(me);
                    })
                    .mouseout(function (e) {
                        svgController.onElementMouseOut(e);
                        SvgGlobalControllerLogic.hideGlow(me);
                    })
                    .click(function (e) {
                        me.onClick(e);
                        //AnnotationApplication.Toolbar.widget.enable("#TwoDSettingsButton", true);
                    })
                    .dblclick(function () {
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

                    })
                    .mouseup(function (e) {
                        //var element = that.getElementByDocId(this.data("DocumentAnnotationId"));
                        //svgController.mouseupHandler(e, element, paper, elementType);
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
                            var dxdy = svgController.getDXDY(dx, dy);
                            dx = dxdy.dx;
                            dy = dxdy.dy;
                            me.onTextboxDragging(element, dx, dy, x, y, e);
                            if (typeof me.glow !== 'undefined') SvgGlobalControllerLogic.hideGlow(me);
                            e.stopPropagation();
                        }, function (x, y) {  // start
                            me.onTextboxDragStart(x, y);
                        }, function (e) {  //end
                            me.onTextboxDragEnd(e);
                            me.drawHandles();
                        }
                    )
                    .scale(1.15, 1.15)
                    .toBack();
                that.maskids.push(mask);
            });

            [that.element.lineHead, that.element.lineTale].forEach(function (element) {
                var mask = element.clone();
                var ts, tm, te;
                mask.attr({
                    stroke: "white",
                    "stroke-width": 15,
                    fill: "white",
                    opacity: 0.01
                })

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
                            dataExchange.sendParentMessage('clickObject',msg);
                            me.onClick(e);
                        } else if (te.timeStamp - ts.timeStamp > 500 && that.isDragging === false) {
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
                        if (SvgGlobalControllerLogic.isCtrlKeyPressed && SvgGlobalControllerLogic.selectedIds2.indexOf(me.annotationId) < 0) {
                            SvgGlobalControllerLogic.selectedIds2.push(me.annotationId);
                        } else {
                            SvgGlobalControllerLogic.selectedIds2 = [me.annotationId];
                        }
                        me.drawHandles();
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
                        me.onMouseUp(e);
                    })
                    .drag(
                        function (dx, dy, x, y, e) {  // move
                            if (e.which === 3 || me.svgController.contextMenu) return;
                            if (SvgGlobalControllerLogic.selectedIds2.length > 0) {
                                var objectsToDrag = Object.keys(SvgGlobalControllerLogic.selectedIds2);
                                console.log(objectsToDrag);
                                SvgGlobalControllerLogic.selectedIds2.forEach(function (id) {
                                    SvgGlobalControllerLogic.annotations2[id].onElementDragging(dx, dy, x, y, e);
                                });
                            } else {
                                me.onElementDragging(dx, dy, x, y, e);
                            }
                            e.stopPropagation();
                        }, function (x, y) {  // start
                            me.onElementDragStart(x, y);
                        }, function (e) {  //end
                            if (SvgGlobalControllerLogic.selectedIds2.length > 0) {
                                SvgGlobalControllerLogic.selectedIds2.forEach(function (id) {
                                    SvgGlobalControllerLogic.annotations2[id].onElementDragEnd(e);
                                });
                            } else {
                                me.onElementDragEnd(e);
                            }
                        })
                    //.scale(1.15, 1.15)
                    .toBack();
                that.maskids.push(mask);
            });

        },

        deleteMask: function () {
            var that = this;
            if (that.maskids !== null) that.maskids.forEach(function (mask) {
                mask.remove();
            });
            that.maskids = null;
        },


        // end of methods
    }

    return SvgCallout;
})();