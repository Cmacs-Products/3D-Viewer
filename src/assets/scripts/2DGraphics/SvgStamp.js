"use strict";

var SvgStamp = (function () {

    function SvgStamp(
        svgController,
        annotationId,
        type,
        pageNumber,
        element,
        rotation,
        dbobject,
        angle) {

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

        this.url = null;

    };

    SvgStamp.prototype = {
        constructor: SvgStamp,

        //===============================================
        //================== create =====================
        //===============================================

        beforeCreate: function () {
            var that = this;

        },

        create: function (url, x, y, w, h, callback) {
            var that = this;
            // before
            that.beforeCreate();
            that.angle = that.baseAngle;
            // create
            that.draw(url, x, y, w, h);

            if (callback) callback();
            // after
            that.afterCreate();

        },

        afterCreate: function () {
            var that = this;
            that.save();
            that.bindEvents(that.element);

        },

        draw: function (url, x, y, w, h, callback) {
            var that = this;
            var paper = that.svgController.paper;
            if (url.startsWith("data:image")) {
                var stamp = paper.image("", x, y, w, h);
                stamp.attr({ src: url });
            } else {
                var stamp = paper.image(url, x, y, w, h);
            }
            //that.bindEventsToElement(stamp, paper, 'stamp');
            stamp.attr({
                fill: '',
                stroke: '#009EE3',
                'stroke-width': 5,
                'stroke-dasharray': false ? "" : "."
            });
            if (false) {
                stamp.data("Angle", -1 * that.getPageRotation());
                stamp.rotate(-1 * that.getPageRotation());
                that.createStampOnDb(stamp);
            }
            that.element = stamp;
            that.element.rotate(that.angle);
            that.element.data("DocumentAnnotationId", that.annotationId);
            that.element.data("url", url);
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
            var element = that.element;

            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((paper.height).replace("px", "")) / currentScale;


            var dbObject = {
                DocumentAnnotationId: that.annotationId,
                AnnotationType: that.type,
                ParentId: "", // not implemented yet
                DocumentVersionId: AnnotationApplication.documentVersionId,
                Top: element.attr("y") / paperHeight,
                Left: element.attr("x") / paperWidth,
                Width: element.attr("width") / paperWidth,
                Height: element.attr("height") / paperHeight,
                Src: element.attr("src"),
                Angle: that.angle ? that.angle : 0, // not implemented yet
                AnnotationName: that.type,
                IsSelectable: true,
                IsGroup: false, // not implemented yet
                Scale: "",
                Opacity: element.attr("opacity"),
                ModifiedBy: element.getModifiedBy(),
                CreatedBy: element.getCreatedBy(),
                DeletedBy: null,
                CreatedOn: null,
                ModifiedOn: null,
                DeletedOn: null,
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

            var dbObject = {
                DocumentAnnotationId: "00000000-0000-0000-0000-000000000000",
                AnnotationType: that.type,
                ParentId: "", // not implemented yet
                DocumentVersionId: AnnotationApplication.documentVersionId,
                Top: element.attr("y") / paperHeight,
                Left: element.attr("x") / paperWidth,
                Width: element.attr("width") / paperWidth,
                Height: element.attr("height") / paperHeight,
                Src: element.attr("src"),
                Angle: that.angle ? that.angle : 0, // not implemented yet
                AnnotationName: that.type,
                IsSelectable: true,
                IsGroup: false, // not implemented yet
                Scale: "",
                Opacity: element.attr("opacity"),
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
            that.element.remove();
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
                //SvgGlobalControllerLogic.rightClickHandler(that, e);
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
            var svgController = that.svgController;
            var element = that.element;
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

            var clonedSvgObject = new SvgStamp(
                SvgGlobalControllerLogic.getSvgController(pageNumber).canvas,
                null,
                that.type,
                pageNumber,
                null,
                that.angle,
                null,
                that.angle,
                [],
                [],
                []
            );

            var x,y;
            if(e === null){
                x = element.attr("x") + 10;
                y = element.attr("y") + 10;
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
                that.element.data("url"),
                x,
                y,
                element.attr("width"),
                element.attr("height"),
                function () {
                    clonedSvgObject.element.attr({
                        opacity: element.attr("opacity")
                    });
                }
            );
            // clonedSvgObject.element.attr(element.attrs);
            // clonedSvgObject.element.transform(element.transform());
            // clonedSvgObject.element.attr({
            //     x: clonedSvgObject.element.attr("x") + 10,
            //     y: clonedSvgObject.element.attr("y") + 10
            // });

            // // clonedSvgObject.element.attr({
            // //     fill: element.attr("fill"),
            // //     stroke: element.attr("stroke"),
            // //     'stroke-width': element.attr["stroke-width"],
            // //     Opacity: element.attr("opacity")
            // // });

            // clonedSvgObject.bindEvents();
            // clonedSvgObject.update();
        },

        afterPaste: function(){
            var that = this;
            try{
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

            var that = me.svgController;
            var ts = null;//touchstart
            var te = null;//touchend
            var tm = null;//touchmove

            mask.attr({
                stroke: "white",
                fill: "grey",
                opacity: 0.01
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

    return SvgStamp;
})();