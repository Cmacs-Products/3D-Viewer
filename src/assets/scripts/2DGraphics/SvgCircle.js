"use strict";

var SvgCircle = (function () {

    function SvgCircle(svgController, annotationId, type, pageNumber, element, rotation, dbobject, angle, maskids, handleids, controlboxids) {
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

    SvgCircle.prototype = {
        constructor: SvgCircle,

        //===============================================
        //================== create =====================
        //===============================================

        beforeCreate: function () {
            var that = this;

        },

        create: function (x, y, w, h) {
            var that = this;
            // before
            that.beforeCreate();

            // create
            that.element = that.draw(x, y, w, h);
            that.element.attr({
                fill: SvgGlobalControllerLogic.defaultFillColor,
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

        draw: function (x, y, rx, ry) {
            var that = this;
            var circle = that.svgController.paper.ellipse(x, y, rx, ry);

            circle.attr({
                fill: SvgGlobalControllerLogic.defaultFillColor,
                stroke: SvgGlobalControllerLogic.defaultStrokeColor,
                'stroke-width': SvgGlobalControllerLogic.defaultStrokeWidth,
                'stroke-dasharray': "-"
            });

            that.element = circle;
            that.element.rotate(that.angle);
            that.element.data("DocumentAnnotationId", that.annotationId);
            return circle;
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

            var dbObject = {
                DocumentAnnotationId: that.annotationId,
                AnnotationType: that.type,
                ParentId: "", // not implemented yet
                DocumentVersionId: AnnotationApplication.documentVersionId,
                Fill: element.attr("fill"),
                Stroke: element.attr("stroke"),
                StrokeWidth: element.attr("stroke-width"),
                Top: element.attr("cy") / paperHeight,
                Left: element.attr("cx") / paperWidth,
                RadiusX: element.attr("rx") / paperWidth,
                RadiusY: element.attr("ry") / paperHeight,
                Angle: that.angle,
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
                Top: element.attr("cy") / paperHeight,
                Left: element.attr("cx") / paperWidth,
                RadiusX: element.attr("rx") / paperWidth,
                RadiusY: element.attr("ry") / paperHeight,
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
            that.element.remove();
            if (that.maskids !== null) that.maskids.remove();
            if (that.glow !== null) that.glow.remove();
            that.deleteMask();
        },

        //===============================================
        //================== Events =====================
        //===============================================

        bindEvents: function () {
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
            if(SvgGlobalControllerLogic.selectedIds2.length>1){
                //SvgGlobalControllerLogic.clearAllJoints();
                SvgGlobalControllerLogic.drawSelectBox();
            }else{
                me.showControlBox();
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
                    //SvgGlobalControllerLogic.drawSelectBox();
                    if(SvgGlobalControllerLogic.selectedIds2.length>1){
                        //SvgGlobalControllerLogic.clearAllJoints();
                        SvgGlobalControllerLogic.drawSelectBox();
                    }else{
                        this.showControlBox();
                    }
               
                SvgGlobalControllerLogic.openContextMenu(e, that);
                //e.stopPropagation();
            }else{
                that.onClick(e);
            }
        },

        onElementDragging: function (dx, dy, x, y, e) {
            var that = this;
            var svgController = that.svgController;
            var dxdy = svgController.getDXDY(dx, dy);
            dx = dxdy.dx;
            dy = dxdy.dy;

            if (!svgController.isDrawing && (Math.abs(dx) + Math.abs(dy) !== 0)) {
                SvgGlobalControllerLogic.isDraggingElement = true;
                var lx = dx;// + ox ;
                var ly = dy;// + oy ;

                that.element.transform("T" + lx / svgController.getScale() + "," + ly / svgController.getScale() + "r" + that.angle);
            }
        },

        onElementDragStart: function (x, y) {
            var that = this;
        },

        onElementDragEnd: function (e) {
            var that = this;
            var svgController = that.svgController;
            var element = that.element;
            var paper = svgController.paper;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((paper.height).replace("px", "")) / currentScale;
            var dx, dy, newX, newY, angle;
            if (typeof element !== "undefined" && !(element.length > 1)) {
                angle = element.matrix.split().rotate;
                element.attr({ "class": "hidden" });
                element.rotate(-angle);
                dx = element.matrix.split().dx;
                dy = element.matrix.split().dy;
                element.rotate(angle);
                element.attr({ "class": "" });
                newX = element.attr("cx") + dx;
                newY = element.attr("cy") + dy;
                angle = element.matrix.split().rotate;
                that.angle = angle;
            }


            if (!svgController.isDrawing && SvgGlobalControllerLogic.isDraggingElement) {
                // rollback the empty fill
                //this.restoreMask(element);
                element.rotate(-1 * that.angle);
                newX = element.attr("cx") + dx;
                newY = element.attr("cy") + dy;
                newX = newX < 5 ? 0 : newX;
                newY = newY < 5 ? 0 : newY;
                newX = newX > paperWidth ? paperWidth - 10 : newX;
                newY = newY > paperHeight ? paperHeight - 10 : newY;

                element.attr("cx", newX);
                element.attr("cy", newY);
                element.transform("");
                element.rotate(that.angle);

                that.update();
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

            var clonedSvgObject = new SvgCircle(
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

            var x,y;
            if(e === null){
                x = element.attr("cx") + 10;
                y = element.attr("cy") + 10;
            }else{
                
                x = that.svgController.getXY(e, 1 / that.svgController.getScale()).x;
                y = that.svgController.getXY(e, 1 / that.svgController.getScale()).y;
            }

            clonedSvgObject.isPastedFrom = {
                fromSvgObject:that,
                x:x,
                y:y
            };

            clonedSvgObject.create(
                x,
                y,
                element.attr("rx"),
                element.attr("ry")
            );

            // clonedSvgObject.element.attr(element.attrs);
            // clonedSvgObject.element.transform(element.transform());
            // clonedSvgObject.element.attr({
            //     x: clonedSvgObject.element.attr("cx") + 10,
            //     y: clonedSvgObject.element.attr("cy") + 10
            // });
            //clonedSvgObject.update();
        },

        afterPaste: function(){
            var that = this;
            try{
                var element = that.isPastedFrom.fromSvgObject.element;
                var x = that.element.attr("cx");
                var y = that.element.attr("cy");
                var rotate = element.matrix.split().rotate;

                that.element.attr(element.attrs);
                that.element.attr({
                    cx: x,
                    cy: y
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
            mask.attr({
                stroke: "white",
                fill: "white",
                opacity: 0.01,
                "stroke-width": 4,
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

    return SvgCircle;
})();