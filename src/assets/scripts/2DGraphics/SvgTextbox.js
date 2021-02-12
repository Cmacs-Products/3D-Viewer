"use strict";

var SvgTextbox = (function () {

    function SvgTextbox(
        svgController,
        annotationId,
        type,
        text,
        pageNumber,
        element,
        rotation,
        dbobject) {

        this.svgController = svgController;
        this.annotationId = annotationId;
        this.type = type;
        this.text = text;
        this.pageNumber = pageNumber;
        this.element = element;
        this.baseAngle = rotation;
        this.angle = rotation;
        this.dbobject = dbobject;
        this.maskids = null;
        this.handleids = null;
        this.controlboxids = null;
        this.glow = null;
        this.isDragging = false;

        this.isPastedFrom = null;
        this.drawBoxAfterSave = false;
    };

    SvgTextbox.prototype = {
        constructor: SvgTextbox,

        //===============================================
        //================== create =====================
        //===============================================

        beforeCreate: function () {
            var that = this;

        },

        create: function (x, y, txt, fontSize) {
            var that = this;
            // before
            that.beforeCreate();

            // create
            that.element = that.draw(x, y, txt, fontSize);

            // after
            that.afterCreate();

        },

        afterCreate: function () {
            var that = this;
            that.save();
            that.bindEvents(that.element.text);
            that.bindEvents(that.element.rect1);
            that.createMask();
            that.svgController.stopDrawing();
        },

        draw: function (x, y, txt, fontSize) {
            var that = this;
            var paper = that.svgController.paper;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var text = paper.text(x, y, txt)
                .attr({
                    fill: 'black',
                    //stroke: 'blue',
                    //'stroke-width': 5,
                    //'stroke-dasharray': insertToDb ? "" : "."
                });
            fontSize = (fontSize === undefined || fontSize === null) ? 10 : fontSize;
            text.attr("font-size", fontSize);
            var bbox = text.getBBox();
            var rect = paper.rect(
                bbox.x - 3,
                bbox.y - 3,
                (bbox.width + 6),
                (bbox.height + 6)
            ).attr({ fill: SvgGlobalControllerLogic.defaultTextAnnotationFillColor });
            text.toFront();

            text.rotate(-1 * that.baseAngle, x, y);
            rect.rotate(-1 * that.baseAngle, x, y);

            that.element = {
                text: text,
                rect1: rect
            };
            that.element.text.data("DocumentAnnotationId", that.annotationId);
            that.element.rect1.data("DocumentAnnotationId", that.annotationId);
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
            var rect;

            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((paper.height).replace("px", "")) / currentScale;

            var dbObject = {
                DocumentAnnotationId: that.annotationId,
                Left: text.attr("x") / paperWidth,
                Top: text.attr("y") / paperHeight,
                Width: text.getBBox().width / paperWidth,
                Height: text.getBBox().height / paperHeight,
                AnnotationType: that.type,
                Angle: (that.baseAngle !== undefined) ? Math.abs(that.baseAngle) : 0,
                ParentId: "", // not implemented yet
                DocumentVersionId: (loadedModule !== "EMS") ? AnnotationApplication.documentVersionId : AnnotationApplication.documentVersionId,
                Fill: rect.attr("fill"),
                Stroke: rect.attr("stroke"),
                StrokeWidth: rect.attr("stroke-width"),
                Text: text.attr("text"),
                FontSize: text.attr("font-size") ,// / currentScale,
                AnnotationName: that.type,
                Opacity: rect.attr("opacity"),
                IsSelectable: true,
                IsGroup: false, // not implemented yet
                Scale: "",
                ModifiedBy: text.getModifiedBy(),
                CreatedBy: text.getCreatedBy(),
                DeletedBy: null,
                CreatedOn: null,
                ModifiedOn: null,
                DeletedOn: null,
                EMSNodeId: null, // not implemented yet
                ChildDocumentId: null, // not implemented yet
                PageId: text.getPageId(),
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


            console.log("afterUpdate", dbObject);
            that.createMask();
        },

        //===============================================
        //================== save =======================
        //===============================================

        beforeSave: function () {
            var that = this;
            var element = that.element;
            var svgController = that.svgController;

            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((that.svgController.paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((that.svgController.paper.height).replace("px", "")) / currentScale;
            var text = that.element.text;
            var rect = that.element.rect1;

            var dbObject = {
                DocumentAnnotationId: "00000000-0000-0000-0000-000000000000",
                Left: text.attr("x") / paperWidth,
                Top: text.attr("y") / paperHeight,
                Width: (text.getBBox().width) / paperWidth,
                Height: (text.getBBox().height) / paperHeight,
                AnnotationType: that.type,
                Angle: that.baseAngle,
                ParentId: "", // not implemented yet
                DocumentVersionId: AnnotationApplication.documentVersionId,
                Fill: rect.attr("fill"),
                Stroke: rect.attr("stroke"),
                StrokeWidth: rect.attr("stroke-width"),
                Text: text.attr("text"),
                FontSize: text.attr("font-size"),// / currentScale,
                AnnotationName: that.type,
                Opacity: rect.attr("opacity"),
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

            that.element.text.data("DocumentAnnotationId", that.annotationId);
            that.element.rect1.data("DocumentAnnotationId", that.annotationId);

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
            that.deleteMask();
            that.element.text.remove();
            that.element.rect1.remove();
        },

        //===============================================
        //================== Events =====================
        //===============================================

        bindEvents: function (element) {
            SvgGlobalControllerLogic.BindEventsToSvgObject(this);
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

            if(SvgGlobalControllerLogic.selectedIds2.length>1){
                //SvgGlobalControllerLogic.clearAllJoints();
                SvgGlobalControllerLogic.drawSelectBox();
            }else{
                //me.showControlBox();
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

                }

            } catch (ex) {
                console.error(ex);
            }
        },

        onElementDragEnd: function (e) {
            var that = this;
            if (!this.isDrawing && SvgGlobalControllerLogic.isDraggingElement) {

                //SvgGlobalControllerLogic.isDraggingElement = false;
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
                that.deleteMask();

                that.update();
                console.log("DragEnd", that);
            }
            that.createMask();
        },


        //===============================================
        //================== Controls ===================
        //===============================================

        removeHandles: function(){

        },
        
        paste: function (e, pageNumber) {
            var that = this;
            var paper = that.svgController.paper;
            var element = that.element;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((paper.height).replace("px", "")) / currentScale;

            var clonedSvgObject = new SvgTextbox(
                SvgGlobalControllerLogic.getSvgController(pageNumber).canvas,
                null,
                that.type,
                that.text,
                pageNumber,
                null,
                that.baseAngle,
                null,
                [],
                [],
                []
            );

            var x, y;
            if (e === null) {
                x = element.text.attr("x") + 10;
                y = element.text.attr("y") + 10;
            } else {

                x = that.svgController.getXY(e, 1 / that.svgController.getScale()).x;
                y = that.svgController.getXY(e, 1 / that.svgController.getScale()).y;
            }

            clonedSvgObject.isPastedFrom = {
                fromSvgObject: that,
                x: x,
                y: y
            };
            
            try {
                clonedSvgObject.create(
                    x + 10,
                    y + 10,
                    element.text.attr("text"),
                    element.text.attr("font-size")
                );

                // clonedSvgObject.element.text.attr(element.text.attrs);
                // clonedSvgObject.element.rect1.attr(element.rect1.attrs);
                // clonedSvgObject.update();
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
            var mask = that.element.rect1.clone();
            mask.attr({
                stroke: "white",
                fill: "white",
                opacity: 0.01,
                "stroke-width": 4
            })
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

    return SvgTextbox;
})();