"use strict";

var SvgEmsGroup = (function () {

    function SvgEmsGroup(
        svgController,
        annotationId,
        type,
        pageNumber,
        element,
        rotation,
        dbobject,
        emsNodeId) {

        this.svgController = svgController;
        this.annotationId = annotationId;
        this.type = type;
        this.pageNumber = pageNumber;
        this.element = element;
        this.baseAngle = rotation;
        this.dbobject = dbobject;
        this.emsNodeId = emsNodeId ? emsNodeId : AnnotationApplication.DrawStateService.getEmsNode().id;

        this.isPastedFrom = null;
        this.drawBoxAfterSave = false;

        this.maskids = null;
        this.handleids = null;
        this.controlboxids = null;
        this.glow = null;
        this.isDragging = false;

        this.emsNodeId = null;
        this.popup = null;
        this.version = "";
        this.initialXPosition = 0;
        this.initialYPosition = 0;
    };

    SvgEmsGroup.prototype = {
        constructor: SvgEmsGroup,

        //===============================================
        //================== create =====================
        //===============================================

        beforeCreate: function () {
            var that = this;

        },

        create: function (x, y, w, h, emsNodeId, drawQr, insertToDb, fontSize) {
            var that = this;
            // before
            that.beforeCreate();

            // create
            that.draw(x, y, w, h, emsNodeId, drawQr, insertToDb, fontSize, SvgGlobalControllerLogic.defaultEmsNodeFillColor);

            // after
            that.afterCreate();

        },

        afterCreate: function () {
            var that = this;
            that.save();
            that.bindEvents(that.element.text);
            that.bindEvents(that.element.rect1);
            that.bindEvents(that.element.circle);
            that.createMask();
            that.svgController.stopDrawing();
        },

        draw: function (x, y, w, h, emsNodeId, drawQr, insertToDb, fontSize, angle, version, fillColor) {
            var that = this;
            var paper = that.svgController.paper;
            SvgGlobalControllerLogic.baseAngleForDocument = that.baseAngle;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            SvgGlobalControllerLogic.initialXPosition = x;
            SvgGlobalControllerLogic.initialYPosition = y;

            const EmsNodeId = emsNodeId ? emsNodeId : AnnotationApplication.DrawStateService.getEmsNode().id;
            //that.svgController.dbAnnotations.find(a=>a.DocumentAnnotationId == that.annotationId).EMSNodeId;
            var EmsNode = emsData[EmsNodeId];

            var EMSNodeName = EmsNode.text ? EmsNode.text : EmsNode.Name;

            var value = EMSNodeName;
            that.emsNodeId = EmsNodeId;
           


            // correct old versions
            if (version === "") {
                switch (Math.abs(that.baseAngle % 360)) {
                    case 90:
                        var temptext = paper.text(x, y, value)
                            .attr({
                                fill: 'black',
                                //stroke: 'blue',
                                //'stroke-width': 5,
                                //'stroke-dasharray': insertToDb ? "" : "."
                            });
                        fontSize = (fontSize === undefined || fontSize === null) ? 10 : fontSize;
                        temptext.attr("font-size", fontSize);
                        var tempbbox = temptext.getBBox();


                        //paper.circle(x, y, 2).attr("fill", "red").toFront();

                        y = y + (tempbbox.width) + 6;
                        if (w > 0) y -= h;
                        //x = x - tempbbox.height;
                        temptext.remove();
                        //paper.circle(x, y, 2).attr("fill", "red").toFront();
                        break;
                    case 180:
                        var temptext = paper.text(x, y, value)
                            .attr({
                                fill: 'black',
                                //stroke: 'blue',
                                //'stroke-width': 5,
                                //'stroke-dasharray': insertToDb ? "" : "."
                            });
                        fontSize = (fontSize === undefined || fontSize === null) ? 10 : fontSize;
                        temptext.attr("font-size", fontSize);
                        var tempbbox = temptext.getBBox();


                        //paper.circle(x, y, 2).attr("fill", "green").toFront();
                        x = x + tempbbox.width + 6
                        y = y + (tempbbox.height) + 6;
                        if (w > 0) {
                            x -= w;
                            y -= h;
                        }
                        //x = x - tempbbox.height;
                        temptext.remove();
                        //paper.circle(x, y, 2).attr("fill", "red").toFront();
                        break;

                    case 270:
                        var temptext = paper.text(x, y, value)
                            .attr({
                                fill: 'black',
                                //stroke: 'blue',
                                //'stroke-width': 5,
                                //'stroke-dasharray': insertToDb ? "" : "."
                            });
                        fontSize = (fontSize === undefined || fontSize === null) ? 10 : fontSize;
                        temptext.attr("font-size", fontSize);
                        var tempbbox = temptext.getBBox();


                        //paper.circle(x, y, 2).attr("fill", "green").toFront();
                        x = x + tempbbox.height + 6;
                        //y = y + (tempbbox.height) + 6;
                        if (w > 0) {
                            x -= w;
                            //y -= h;
                        }
                        //x = x - tempbbox.height;
                        temptext.remove();
                        //paper.circle(x, y, 2).attr("fill", "red").toFront();
                        break;
                }
            }else{
                that.version = version;
            }


            var text = paper.text(x, y, value)
                .attr({
                    fill: SvgGlobalControllerLogic.defaultEmsNodeTextColor,
                    //stroke: 'blue',
                    //'stroke-width': 5,
                    //'stroke-dasharray': insertToDb ? "" : "."
                });
            fontSize = (fontSize === undefined || fontSize === null) ? 10 : fontSize;
            text.attr("font-size", fontSize);
            var bbox = text.getBBox();



            var rect1 = paper.rect(
                bbox.x - 3,
                bbox.y - 3,
                (bbox.width + 16),
                (bbox.height + 6)
            );

            // var circle = paper.circle(
            //     x + 6.2,
            //     y + 9,
            //     2.5,
                

            // )


            var bbox = text.getBBox();
            var emsNode = emsData[EmsNodeId];//TreeView_L.getTreeItemById(EmsNodeId);
            var status = emsNode.CurrentStatus;//window.parent.FilterStatusesLogic.GetCurrentElementStatus(EmsNode);
            var color = emsNode.Color;//window.parent.FilterStatusesLogic.GetStatusColorHex(status);

            
            // circle.attr({
               
            //     'fill': color,
            //     'stroke': color

            // });

            // to relocate the textbox because of the center point



            rect1.attr({
                x: x,
                y: y,
                fill: fillColor ?  fillColor : SvgGlobalControllerLogic.defaultEmsNodeFillColor,
                stroke: SvgGlobalControllerLogic.defaultEmsNodeStrokeColor
            });
            rect1.data("EMSNodeId", EmsNodeId);
            rect1.data("AnnotationType", "emsgroup");

            var tempText = text.clone();
            text.remove();
            text = tempText;

            text.attr({
                x: x + 12 + bbox.width / 2,
                y: y + 3 + bbox.height / 2
            });
            text.data("EMSNodeId", EmsNodeId);
            text.data("AnnotationType", "emsgroup");

            var pin = paper.image("/Content/images/DocumentViewer/pinSelectedText.png",x-10,y-20,20,20);

            var circle = paper.circle(
                    pin.attr("x") + 16.5,
                    pin.attr("y") + 29,
                    2.5,
                    
    
                );
            circle.attr({
               
                'fill': color,
                'stroke': color

            });

            var rect2 = paper.rect(
                x,
                y,
                ( EmsNode.Type && EmsNode.Type.toLowerCase() === "group") ? w : 0,
                ( EmsNode.Type && EmsNode.Type.toLowerCase() === "group") ? h : 0,
            );
            rect2.attr({
                'stroke-dasharray': "",
                'stroke-width': 1,
                
                stroke: SvgGlobalControllerLogic.defaultEmsNodeStrokeColor
            }).undrag();
            rect2.data("EMSNodeId", EmsNodeId);
            rect2.data("AnnotationType", "emsgroup");




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
                        y: (rect1.attr("y") + rect1.attr("height") / 2) -4,
                    });
                    //that.element.circle.attr("x",that.element.pin.attrs.x + 16.5);
                // that.element.circle.attr("y",that.element.pin.attrs.y + 29 );
                // that.element.circle.attr("cx",that.element.pin.attrs.x + 16.5 );
                // that.element.circle.attr("cy",that.element.pin.attrs.y + 29 );
                    circle.attr({    
                        cx: pin.attr("x") + 29,
                        cy: pin.attr("y") + 2

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
                        cx: pin.attr("x") + 3,
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
                        cy: pin.attr("y") + 16

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
                circle: circle,
                pin: pin,
                rect2: rect2
            }
           // that.element.rotate(that.baseAngle);

            that.element.text.data("DocumentAnnotationId", that.annotationId);
            that.element.rect1.data("DocumentAnnotationId", that.annotationId);
            that.element.pin.data("DocumentAnnotationId", that.annotationId);
            that.element.rect2.data("DocumentAnnotationId", that.annotationId);
            that.element.circle.data("DocumentAnnotationId", that.annotationId);

            var iconType = SvgGlobalControllerLogic.iconType; //window.parent.FilterStatusesLogic.selectedIconType;
            SvgGlobalControllerLogic.updateEmsIcon(that, iconType);

            return that.element;

        },

        draw1: function (x, y, w, h, emsNodeId, drawQr, insertToDb, fontSize) {
            var that = this;

            var paper = that.svgController.paper;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;

            var EmsNodeId = emsNodeId ? emsNodeId : AnnotationApplication.DrawStateService.getEmsNode().id;
            var EmsNode = EmsNodeId ? emsData[EmsNodeId] : AnnotationApplication.DrawStateService.getEmsNode();
            var EMSNodeName = EmsNode.Name ? EmsNode.Name : EmsNode.name;

            var value = EMSNodeName;
            that.emsNodeId = EmsNodeId;

            var text = paper.text(x, y, value)
                .attr({
                    fill: 'black',
                    //stroke: 'blue',
                    //'stroke-width': 5,
                    //'stroke-dasharray': insertToDb ? "" : "."
                });
            fontSize = (fontSize === undefined || fontSize === null) ? 10 : fontSize;
            text.attr("font-size", fontSize);
            var bbox = text.getBBox();
            var rect1 = paper.rect(
                bbox.x - 3,
                bbox.y - 3,
                (bbox.width + 6),
                (bbox.height + 6)
            );

            var bbox = text.getBBox();
            var emsNode = emsData[EmsNodeId];//TreeView_L.getTreeItemById(EmsNodeId);
            var status = emsNode.CurrentStatus;//window.parent.FilterStatusesLogic.GetCurrentElementStatus(EmsNode);
            var color = emsNode.Color;//window.parent.FilterStatusesLogic.GetStatusColorHex(status);

            // to relocate the textbox because of the center point

            rect1.attr({
                x: x,
                y: y,
                fill: color
            });
            rect1.data("EMSNodeId", EmsNodeId);
            rect1.data("AnnotationType", "emsgroup");

            var tempText = text.clone();
            text.remove();
            text = tempText;

            text.attr({
                x: x + 3 + bbox.width / 2,
                y: y + 3 + bbox.height / 2
            });
            text.data("EMSNodeId", EmsNodeId);
            text.data("AnnotationType", "emsgroup");


            var rect2 = paper.rect(
                x,
                y,
                ( EmsNode.Type && EmsNode.Type.toLowerCase() === "group") ? w : 0,
                ( EmsNode.Type && EmsNode.Type.toLowerCase() === "group") ? h : 0,
            );
            rect2.attr({
                'stroke-dasharray': "",
                'stroke-width': 1,
                stroke: color
            }).undrag();
            rect2.data("EMSNodeId", EmsNodeId);
            rect2.data("AnnotationType", "emsgroup");


            // if (insertToDb) {
            //     emsElementSet.rotate(-1 * that.getPageRotation());
            //     emsElementSet.setAngle(-1 * that.getPageRotation());
            //     that.createEmsElementOnDb(emsElementSet);
            // }

            that.element = {
                text: text,
                rect1: rect1,
                rect2: rect2
            }

            that.element.text.data("DocumentAnnotationId", that.annotationId);
            that.element.rect1.data("DocumentAnnotationId", that.annotationId);
            that.element.rect2.data("DocumentAnnotationId", that.annotationId);
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
            var rect2 = that.element.rect2;
            var circle = that.element.circle;

            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((paper.height).replace("px", "")) / currentScale;

            var dbObject = {
                DocumentAnnotationId: that.annotationId,
                // Left: (rect1.attr("x") + 3) / paperWidth,
                // Top: (rect1.attr("y") + 3) / paperHeight,
                Left: rect2.attr("width") !== 0 ? (rect2.attr("x")) / paperWidth : (rect1.attr("x")) / paperWidth,
                Top: rect2.attr("width") !== 0 ? (rect2.attr("y")) / paperHeight : (rect1.attr("y")) / paperHeight,
                Width: rect2.attr("width") !== 0 ? rect2.attr("width") / paperWidth : (text.getBBox().width) / paperWidth,
                Height: rect2.attr("height") !== 0 ? rect2.attr("height") / paperHeight : (text.getBBox().width) / paperHeight,
                AnnotationType: that.type,
                Angle: that.baseAngle,
                ParentId: "", // not implemented yet
                DocumentVersionId: AnnotationApplication.documentVersionId,
                Fill: rect1.attr("fill"),
                TagCircle: circle.attr("fill"),
                Stroke: rect1.attr("stroke"),
                StrokeWidth: rect1.attr("stroke-width"),
                Text: text.attr("text"),
                FontSize: text.attr("font-size"),
                AnnotationName: that.type,
                Opacity: rect1.attr("opacity"),
                IsSelectable: true,
                IsGroup: false, // not implemented yet
                Version: "v2",
                Scale: "",
                ModifiedBy: null,
                CreatedBy: null,
                DeletedBy: null,
                CreatedOn: null,
                ModifiedOn: null,
                DeletedOn: null,
                EMSNodeId: that.emsNodeId, // not implemented yet
                ChildDocumentId: null, // not implemented yet
                PageId: "00000000-0000-0000-0000-000000000000",
                PageNumber: that.pageNumber,
                childrenIds: null // not implemented yet
            }

            //console.log("beforeUpdate", dbObject);
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
                //console.log("update", dbObject);
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


            //console.log("afterUpdate", dbObject);
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
            var rect1 = that.element.rect1;
            var rect2 = that.element.rect2;
            var circle = that.element.circle;

            var dbObject = {
                DocumentAnnotationId: "00000000-0000-0000-0000-000000000000",
                // Left: (rect1.attr("x") + 3) / paperWidth,
                // Top: (rect1.attr("y") + 3) / paperHeight,
                Left: rect2.attr("width") !== 0 ? (rect2.attr("x")) / paperWidth : (rect1.attr("x")) / paperWidth,
                Top: rect2.attr("width") !== 0 ? (rect2.attr("y")) / paperHeight : (rect1.attr("y")) / paperHeight,
                Width: rect2.attr("width") !== 0 ? rect2.attr("width") / paperWidth : (text.getBBox().width) / paperWidth,
                Height: rect2.attr("height") !== 0 ? rect2.attr("height") / paperHeight : (text.getBBox().width) / paperHeight,
                AnnotationType: that.type,
                Angle: that.baseAngle,
                ParentId: "", // not implemented yet
                DocumentVersionId: AnnotationApplication.documentVersionId,
                Fill: rect1.attr("fill"),
                TagCircle: circle.attr("fill"),
                Stroke: rect1.attr("stroke"),
                StrokeWidth: rect1.attr("stroke-width"),
                Text: text.attr("text"),
                FontSize: text.attr("font-size"),
                AnnotationName: that.type,
                Opacity: rect1.attr("opacity"),
                IsSelectable: true,
                IsGroup: false, // not implemented yet
                Version: "v2",
                Scale: "",
                ModifiedBy: null,
                CreatedBy: null,
                DeletedBy: null,
                CreatedOn: null,
                ModifiedOn: null,
                DeletedOn: null,
                EMSNodeId: that.emsNodeId, // not implemented yet
                ChildDocumentId: null, // not implemented yet
                PageId: "00000000-0000-0000-0000-000000000000",
                PageNumber: that.pageNumber,
                childrenIds: null // not implemented yet
            }

            //console.log("beforeSave", dbObject);
            return dbObject;
        },

        save: function (resolve, reject) {
            var that = this;
            // before
            var objectToSave = that.beforeSave();
            //console.log("save", objectToSave);
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
            //console.log("afterSave", that.annotationId);
            // add to local
            LocalAnnotationsControllerLogic.addAnnotation(
                AnnotationApplication.documentVersionId,
                that.pageNumber,
                objectToSave,
                that);

            SvgGlobalControllerLogic.addToAnnotations2(that.annotationId, that);

            that.element.text.data("DocumentAnnotationId", that.annotationId);
            that.element.rect1.data("DocumentAnnotationId", that.annotationId);
            that.element.circle.data("DocumentAnnotationId", that.annotationId);
            if(that.element.rect2) that.element.rect2.data("DocumentAnnotationId", that.annotationId);
            if(that.element.pin !== null) that.element.pin.data("DocumentAnnotationId", that.annotationId);
            if(typeof that.element.qr !== 'undefined' && that.element.qr !== null) that.element.qr.data("DocumentAnnotationId", that.annotationId);


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
            that.element.text.remove();
            that.element.rect1.remove();
            that.element.circle.remove();
            that.element.rect2.remove();
            that.element.pin.remove();
            if (typeof that.element.qr !== 'undefined') that.element.qr.remove();
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
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
                dataExchange.sendParentMessage('selectObject',emsData[me.emsNodeId]);
                // window.parent.TreeView_L.scrollToSelectedEmsNode(me.emsNodeId, true);
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
            } else {
                that.onClick(e);
            }
        },

        onElementDragStart: function (x, y) {

        },

        onElementDragging: function (dx, dy, x, y, e) {
            var that = this;
            var svgController = that.svgController;
            //console.log("Initial dx,dy" + dx + dy)
            var dxdy = svgController.getDXDY(dx, dy);
            //console.log(svgController);
            //console.log(dxdy);
            dx = dxdy.dx;
            dy = dxdy.dy;
            //console.log("Latest dx,dy" + dx, dy)
            if(dx < -230){
                console.log(dx);
                return;
            }
            var scale = PDFViewerApplication.pdfViewer.currentScale;
            try {
                if (!that.svgController.isDrawing && (Math.abs(dx) + Math.abs(dy) !== 0)) {
                    SvgGlobalControllerLogic.isDraggingElement = true;
                    var lx = dx;// + ox ;
                    var ly = dy;// + oy ;
                    

                    that.element.text.transform("T" + lx / that.svgController.getScale() + "," + ly / that.svgController.getScale() + "r" + -that.baseAngle);
                    that.element.rect1.transform("T" + lx / that.svgController.getScale() + "," + ly / that.svgController.getScale() + "r" + -that.baseAngle);
                    that.element.circle.transform("T" + lx / that.svgController.getScale() + "," + ly / that.svgController.getScale() + "r" + -that.baseAngle);
                    that.element.pin.transform("T" + lx / that.svgController.getScale() + "," + ly / that.svgController.getScale() + "r" + -that.baseAngle);
                    if (that.element.rect2 !== null) that.element.rect2.transform("T" + lx / that.svgController.getScale() + "," + ly / that.svgController.getScale());

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
                var newRectX, newRectY, newPinX, newPinY, newRect2X,newRect2Y, newQrX, newQrY;
                
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
                newRect2X = that.element.rect2.attr("x") + dx;
                newRect2Y = that.element.rect2.attr("y") + dy; 
                if (typeof that.element.qr !== 'undefined') {
                newQrX = that.element.qr.attr("x") + dx;
                newQrY = that.element.qr.attr("y") + dy;
                }
             
               

                newRectX = newRectX < 5 ? 0 : newRectX;
                newRectY = newRectY < 5 ? 0 : newRectY;
                newRectX = newRectX > paperWidth ? paperWidth - 250 : newRectX;
                newRectY = newRectY > paperHeight ? paperHeight - 60: newRectY;

                newRect2X = newRect2X < 5 ? 0 : newRect2X;
                newRect2Y = newRect2Y < 5 ? 0 : newRect2Y;
                newRect2X = newRect2X > paperWidth ? paperWidth - 10 : newRect2X;
                newRect2Y = newRect2Y > paperHeight ? paperHeight - 10 : newRect2Y;

                newX = newX < 5 ? (newRectX + 123) : newX;
                newY = newY < 5 ? (newRectY + 9) : newY;
                newX = newX > paperWidth ? (newRectX + 123) : newX;
                newY = newY > paperHeight ? (newRectY + 9): newY;

                newPinX = newPinX < 5 ? newRectX -10 : newPinX;
                newPinY = newPinY < 5 ? newRectY -20 : newPinY;
                newPinX = newPinX > paperWidth ? newRectX -10 : newPinX;
                newPinY = newPinY > paperHeight ? newRectY -20 : newPinY;
                if (typeof that.element.qr !== 'undefined') {
                newQrX = newPinX < 5 ? newRectX - 10 : newQrX;
                newQrY = newPinY < 5 ? newRectY -20 : newQrY;
                newQrX = newPinX > paperWidth ? newRectX -10 : newQrX;
                newQrY = newPinY > paperHeight ? newRectY -20 : newQrY;
                }

                



                that.element.text.attr("x", newX);
                //var bbox = that.element.text.getBBox();
                that.element.rect1.attr("x", newRectX);
               // that.element.rect1.attr("width", (bbox + 16) );
                that.element.pin.attr("x",  newPinX);
                if (that.element.rect2 !== null) that.element.rect2.attr("x", newRect2X);
                if (typeof that.element.qr !== 'undefined') {
                    that.element.qr.attr("x", newQrX);
                }

                
                that.element.text.attr("y",  newY);
                that.element.rect1.attr("y",  newRectY);

                that.element.pin.attr("y",  newPinY);
                if (that.element.rect2 !== null) {
                    that.element.rect2.attr("y", newRect2Y);
                    that.element.rect2.realPath = null;
                }
                if (typeof that.element.qr !== 'undefined') {
                    that.element.qr.attr("y", newQrY);
                }
                switch (Math.abs(that.baseAngle % 360)) {
                    case 0:
                        that.element.circle.attr("cx",that.element.pin.attrs.x + 16.5 );
                        that.element.circle.attr("cy",that.element.pin.attrs.y + 29 );
                        SvgGlobalControllerLogic.initialXPosition = newRectX;
                        SvgGlobalControllerLogic.initialYPosition = newRectY;
                        break;
                    case 90:
                       // that.element.circle.attr("x",that.element.pin.attrs.x + 29);
                        //that.element.circle.attr("y",that.element.pin.attrs.y - 0.35);
                        that.element.circle.attr("cx",that.element.pin.attrs.x +29);
                        that.element.circle.attr("cy",that.element.pin.attrs.y + 4 );
                        //SvgGlobalControllerLogic.initialXPosition = newPinX -10;
                        //SvgGlobalControllerLogic.initialYPosition = newPinY -20;
                        SvgGlobalControllerLogic.initialXPosition = newRectX + 110;
                        SvgGlobalControllerLogic.initialYPosition = newRectY + 128;
                        //SvgGlobalControllerLogic.initialXPosition = newRectX;
                        //SvgGlobalControllerLogic.initialYPosition = newRectY;
                        break;
                    case 180:
                       // that.element.circle.attr("x",that.element.pin.attrs.x + 10);
                        //that.element.circle.attr("y",that.element.pin.attrs.y + 5 );
                        that.element.circle.attr("cx",that.element.pin.attrs.x + 4 );
                        that.element.circle.attr("cy",that.element.pin.attrs.y - 9 );
                        //SvgGlobalControllerLogic.initialXPosition = newPinX;
                        //SvgGlobalControllerLogic.initialYPosition = newPinY;
                        SvgGlobalControllerLogic.initialXPosition = newRectX + 237;
                        SvgGlobalControllerLogic.initialYPosition = newRectY + 17;
                        break;
                    case 270:
                        //that.element.circle.attr("x",that.element.pin.attrs.x - 10);
                        //that.element.circle.attr("y",that.element.pin.attrs.y + 5 );
                        that.element.circle.attr("cx", that.element.pin.attrs.x - 9 );
                        that.element.circle.attr("cy",that.element.pin.attrs.y + 15  );
                        //SvgGlobalControllerLogic.initialXPosition = newPinX;
                        //SvgGlobalControllerLogic.initialYPosition = newPinY;
                        SvgGlobalControllerLogic.initialXPosition = newRectX + 128;
                        SvgGlobalControllerLogic.initialYPosition = newRectY - 110;
                        break;
                    default:
                        break;

                }
                

                that.element.text.transform("");
                that.element.rect1.transform("");
                that.element.circle.transform("");
                that.element.pin.transform("");
                if (that.element.rect2 !== null) that.element.rect2.transform("");
                if (typeof that.element.qr !== 'undefined') {
                    that.element.qr.transform("");
                }

                that.element.text.rotate(-that.baseAngle);
                that.element.rect1.rotate(-that.baseAngle);
                that.element.circle.rotate(-that.baseAngle);
                that.element.pin.rotate(-that.baseAngle);
                // that.element.text.rotate(that.baseAngle);
                // that.element.rect1.rotate(that.baseAngle);
                // that.element.circle.rotate(that.baseAngle);
                // that.element.pin.rotate(that.baseAngle);
                //if (that.element.rect2 !== null) //that.element.rect2.rotate(-that.baseAngle);
                    if (typeof that.element.qr !== 'undefined') {
                        that.element.qr.rotate(-that.baseAngle);
                    }

                that.deleteMask();
                that.update();
            }
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
        //         that.element.circle.transform("");
        //         that.element.pin.transform("");
        //         if (that.element.rect2 !== null) that.element.rect2.transform("");
        //         if (typeof that.element.qr !== 'undefined') {
        //             that.element.qr.transform("");
        //         }
        //         that.element.text.attr("x", that.element.text.attr("x") + dx);

        //         that.element.rect1.attr("x", that.element.rect1.attr("x") + dx);
        //         that.element.pin.attr("x", that.element.pin.attr("x") + dx);
        //         if (that.element.rect2 !== null) that.element.rect2.attr("x", that.element.rect2.attr("x") + dx);
        //         if (typeof that.element.qr !== 'undefined') {
        //             that.element.qr.attr("x", that.element.qr.attr("x") + dx);
        //         }

                
        //         that.element.text.attr("y", that.element.text.attr("y") + dy);
        //         that.element.rect1.attr("y", that.element.rect1.attr("y") + dy);

        //         that.element.pin.attr("y", that.element.pin.attr("y") + dy);
        //         if (that.element.rect2 !== null) {
        //             that.element.rect2.attr("y", that.element.rect2.attr("y") + dy);
        //             that.element.rect2.realPath = null;
        //         }
        //         if (typeof that.element.qr !== 'undefined') {
        //             that.element.qr.attr("y", that.element.qr.attr("y") + dy);
        //         }

        //         that.element.circle.attr("x",that.element.pin.attrs.x + 16.5);
        //         that.element.circle.attr("y",that.element.pin.attrs.y + 29 );
        //         that.element.circle.attr("cx",that.element.pin.attrs.x + 16.5 );
        //         that.element.circle.attr("cy",that.element.pin.attrs.y + 29 );

        //         that.element.text.rotate(-that.baseAngle);
        //         that.element.rect1.rotate(-that.baseAngle);
        //         that.element.circle.rotate(-that.baseAngle);
        //         that.element.pin.rotate(-that.baseAngle);
        //         //if (that.element.rect2 !== null) //that.element.rect2.rotate(-that.baseAngle);
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

        removeHandles: function () {

        },

        paste: function (e, pageNumber) {
            var that = this;
            var paper = that.svgController.paper;
            var element = that.element;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((paper.height).replace("px", "")) / currentScale;

            var clonedSvgObject = new SvgEmsGroup(
                SvgGlobalControllerLogic.getSvgController(pageNumber).canvas,
                null,
                that.type,
                pageNumber,
                null,
                that.baseAngle,
                null,
                that.emsNodeId,
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
                    x,
                    y,
                    (element.rect2 !== null) ? element.rect2.attr("width") : 0,
                    (element.rect2 !== null) ? element.rect2.attr("height") : 0,
                    that.emsNodeId,
                    null,
                    null,
                    that.element.text.attr("font-size")
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
                var rx = that.element.rect2.attr("x");
                var ry = that.element.rect2.attr("y");

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

                that.element.rect2.attr(element.rect2.attrs);
                that.element.rect2.attr({
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


        showInfoPopUp: function () {
            var that = this;
            try {
                var node = emsData[that.emsNodeId] //TreeView_L.getTreeItemDataById(that.emsNodeId);
                var nodeName = node.Name;
                var level = emsData[node.ParentId].Name;//TreeView_L.getTreeItemDataById(node.ParentId).text;

                
                var emsNode = emsData[that.emsNodeId];//TreeView_L.getTreeItemById(EmsNodeId);
                var status = emsNode.CurrentStatus;//window.parent.FilterStatusesLogic.GetCurrentElementStatus(EmsNode);
                var color = emsNode.Color;//window.parent.FilterStatusesLogic.GetStatusColorHex(status);


                var qrUrl = QrUrlAddress + "&EmsNodeId=" + that.emsNodeId;



                var window = `
                <div id="EmsGroupWindow"
                     style="position: fixed; border-style: solid; box-shadow: 10px 10px 5px grey; padding: 20px; right: 30px; bottom: 30px; z-index: 1000; width:auto; height: auto; background-color:white">
                     <h4>` + nodeName + `</h4>
                     <div style="background-color: `+ color + `; min-height:5px; min-width:100%; text-align:center"></div>
                    
                    <p><strong>Level: </strong>` + level + `</p>
                    <div id="EmsGroupWindowImage"></div>
                    
                </div>
                `;
                $("body").append(window);
                $("#EmsGroupWindowImage").kendoQRCode({
                    value: qrUrl,
                    size: 90,
                    background: "white",
                    renderAs: "svg",
                    border: {
                        color: "white",
                        width: 0
                    }
                });
            } catch (ex) {
                that.closeInfoPopUp();
            }
        },

        closeInfoPopUp: function () {
            $("#EmsGroupWindow").remove();
        },

        // end of methods
    }

    return SvgEmsGroup;
})();




//DB update:
// INSERT INTO `expertdb`.`slu_annotationproperty` (`AnnotationPropertyExternalId`, `Description`, `Code`) VALUES ('d78f7584-a645-4f43-9f6f-1f4d9980615f', 'Version', 'Version');
