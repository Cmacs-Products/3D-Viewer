"use strict";

var SvgMeasurementToolBasic = (function () {

    
    // this.svgController;
    // this.annotationId;
    // this.type;
    // this.pageNumber;
    // this.element;
    // this.rotation;
    // this.dbobject;
    // this.maskids = null;
    // this.handleids = [];
    // this.controlboxids = null;
    // this.glow = null;
    // this.isDragging = false;

    // this.isPastedFrom = null;
    // this.drawBoxAfterSave = false;

    // this.unit = "px";
    // this.scale = 1;
    // this.textPosition = "";
    // this.baseAngle = null;


    function SvgMeasurementToolBasic(
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

        this.unit = "px";
        this.scale = 1;
        this.textPosition = "";
        this.baseAngle = null;
        this.isMeasurementUpdate = false;

    };

    SvgMeasurementToolBasic.prototype = {
        constructor: SvgMeasurementToolBasic,

        //===============================================
        //================== create =====================
        //===============================================

        beforeCreate: function () {
            var that = this;

        },

        create: function (x1, y1, x2, y2, textPosition, unit, scale, insertToDb, baseAngle) {
            var that = this;
            // before
            that.beforeCreate();

            // create
            that.element = that.draw(x1, y1, x2, y2, textPosition, unit, scale, insertToDb, baseAngle);


            // after
            that.afterCreate();

        },

        afterCreate: function () {
            var that = this;

            that.element.line1.attr({
                fill: '',
                stroke: SvgGlobalControllerLogic.defaultMeasurementStrokeColor,
                'stroke-width': 2 / PDFViewerApplication.pdfViewer.currentScale,
                'stroke-dasharray': ""
            });
            that.element.text.attr({
                fill: "black",
                "font-size": 15 / PDFViewerApplication.pdfViewer.currentScale
            })
            if (that.element.line2 !== null) {
                that.element.line2.attr({
                    fill: '',
                    stroke: SvgGlobalControllerLogic.defaultMeasurementStrokeColor,
                    'stroke-width': 2 / PDFViewerApplication.pdfViewer.currentScale,
                    'stroke-dasharray': ""
                });
            }

            that.save();
            that.bindEvents(that.element.text);
            that.bindEvents(that.element.line1);
            if (that.element.line2 !== null) that.bindEvents(that.element.line2);
            that.createMask();
            that.svgController.stopDrawing();

            if(that.drawBoxAfterSave){
                SvgGlobalControllerLogic.drawSelectBox([that.annotationId]);
                that.drawBoxAfterSave = false;
            }
        },

        draw: function (x1, y1, x2, y2, textPosition, unit, scale, insertToDb, baseAngle, text) {
            var me = this;

            //textPosition = "middle";
            var that = me.svgController;
            try {
                var currentScale = PDFViewerApplication.pdfViewer.currentScale;
                baseAngle = (baseAngle === undefined || baseAngle === null) ? that.getPageRotation() : baseAngle;
                unit = unit ? unit : that.unit;
                if (!that.unit && unit) {
                    that.unit = unit;
                } else if (!that.unit && !unit) {
                    that.unit = unit = "px";
                }
                scale = scale ? scale : (that.scale ? that.scale : 1);
                if (!that.scale && scale) {
                    that.scale = scale;
                } else if (!that.scale && !scale) {
                    that.scale = scale = 1;
                }

                var angle = Raphael.angle(x1, y1, x2, y2);
                var line1 = that.paper.path("M " + x1 + " " + y1 + " L " + x2 + " " + y2);
                var totalLength = Raphael.getTotalLength(line1.attr("path"));

                var txtValue = typeof text !== 'undefined'
                    ? text
                    : SvgGlobalControllerLogic.formatMeasurementText(Number.parseFloat(totalLength * scale).toFixed(2), unit);

                // if (kendo.culture().name === "de-DE") {
                //     txtValue = txtValue.replace('.', ',');
                // }
                var txtbox = that.paper.text(
                    (x2 + x1) / 2,
                    (y2 + y1) / 2,
                    txtValue// + " " + unit
                );
                txtbox.attr({
                    fill: "black",
                    "font-size": 15 / currentScale
                });

                var temptextPosition = textPosition;
                if ([270, 180].includes(baseAngle)) {
                    if (textPosition === "top") {
                        temptextPosition = "bottom";
                    } else if (textPosition === "bottom") {
                        temptextPosition = "top";
                    }
                }

                txtbox.data("Angle", baseAngle);
                switch (temptextPosition) {
                    case "top":
                        txtbox.data("TextAlign", textPosition);
                        txtbox.translate(-1 * Math.abs(20 * Math.sin(angle * 3.14 / 180) / currentScale), -1 * Math.abs(20 * Math.cos(angle * 3.14 / 180) / currentScale));
                        txtbox.data("Scale", that.scale);
                        txtbox.data("Unit", that.unit);
                        break;
                    case "bottom":
                        txtbox.data("TextAlign", textPosition);
                        txtbox.translate(Math.abs(20 * Math.sin(angle * 3.14 / 180)) / currentScale, Math.abs(20 * Math.cos(angle * 3.14 / 180) / currentScale));
                        txtbox.data("Scale", that.scale);
                        txtbox.data("Unit", that.unit);
                        break;
                    default:
                        txtbox.data("TextAlign", textPosition);
                        txtbox.data("Unit", unit);
                        txtbox.data("Scale", that.scale);

                }

                var txtbbox = txtbox.getBBox();
                //switch(that.getPageRotation()){
                switch (baseAngle) {
                    case 0:
                        txtbox.rotate((x2 < x1) ? angle : angle + 180);
                        break;
                    case 90:
                        txtbox.rotate((y1 < y2) ? angle : angle + 180);
                        break;
                    case 180:
                        txtbox.rotate((x1 < x2) ? angle : angle + 180);
                        break;
                    case 270:
                        txtbox.rotate((y2 < y1) ? angle : angle + 180);
                        break;
                }



                if (textPosition === "top" || textPosition === "bottom") {
                    line1.attr({
                        "arrow-start": "block",
                        "arrow-end": "block",
                        "opacity": SvgGlobalControllerLogic.defaultMeasurementOpacity,
                        "stroke-width": SvgGlobalControllerLogic.defaultMeasurementStrokeWidth,
                        "stroke": SvgGlobalControllerLogic.defaultMeasurementStrokeColor
                    });
                    me.element = {
                        text: txtbox,
                        line1: line1,
                        line2: null
                    }

                } else {

                    var eachLineLength = (totalLength - txtbbox.width) / 2;

                    //var pathLine1 = Raphael.getSubpath(line1.attr("path"), 0, eachLineLength);
                    //var pathLine2 = Raphael.getSubpath(line1.attr("path"), eachLineLength + txtbbox.width, totalLength);
                    var pEndOfL1 = Raphael.getPointAtLength("M " + x1 + " " + y1 + " L " + x2 + " " + y2, eachLineLength);
                    var pBeginOfL2 = Raphael.getPointAtLength("M " + x1 + " " + y1 + " L " + x2 + " " + y2, eachLineLength + txtbbox.width);
                    var pEndOfL2 = Raphael.getPointAtLength("M " + x1 + " " + y1 + " L " + x2 + " " + y2, totalLength);

                    var Line1 = that.paper.path("M " + x1 + " " + y1 + " L " + pEndOfL1.x + " " + pEndOfL1.y)
                        .attr({
                            "arrow-start": "block",
                            "opacity": SvgGlobalControllerLogic.defaultMeasurementOpacity,
                            "stroke-width": SvgGlobalControllerLogic.defaultMeasurementStrokeWidth,
                            "stroke": SvgGlobalControllerLogic.defaultMeasurementStrokeColor
                        });

                    var Line2 = that.paper.path("M " + pBeginOfL2.x + " " + pBeginOfL2.y + " L " + pEndOfL2.x + " " + pEndOfL2.y)
                        .attr({
                            "arrow-end": "block",
                            "opacity": SvgGlobalControllerLogic.defaultMeasurementOpacity,
                            "stroke-width": SvgGlobalControllerLogic.defaultMeasurementStrokeWidth,
                            "stroke": SvgGlobalControllerLogic.defaultMeasurementStrokeColor
                        });

                    line1.remove();

                    me.element = {
                        text: txtbox,
                        line1: Line1,
                        line2: Line2
                    }
                }
                me.textPosition = textPosition;
                me.unit = unit;
                me.scale = scale;
                me.baseAngle = baseAngle;

                me.element.text.data("DocumentAnnotationId", me.annotationId);
                me.element.line1.data("DocumentAnnotationId", me.annotationId);
                if (me.element.line2 !== null) me.element.line2.data("DocumentAnnotationId", me.annotationId);
            } catch (ex) {
                console.error(ex);
            }

            return me.element;
        },

        //===============================================
        //================== update =====================
        //===============================================

        beforeUpdate: function () {
            var that = this;
            if(SvgMeasurementToolBasic.isMeasurementUpdate){
                var svgController = SvgMeasurementToolBasic.svgController; 
                var text = SvgMeasurementToolBasic.element.text;
                var line1 = SvgMeasurementToolBasic.element.line1;
                var line2 = SvgMeasurementToolBasic.element.line2;
            }else{
            var svgController = this.svgController;
            var text = this.element.text;
            var line1 = this.element.line1;
            var line2 = this.element.line2;
            }
            var paper = svgController.paper;
          

            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((paper.height).replace("px", "")) / currentScale;

            var points = [
                line1.attr("path")[0][1],
                line1.attr("path")[0][2],
                line2 !== null ? line2.attr("path")[1][1] : line1.attr("path")[1][1],
                line2 !== null ? line2.attr("path")[1][2] : line1.attr("path")[1][2]
            ];
            if(SvgMeasurementToolBasic.isMeasurementUpdate){
                var dbObject = {
                    DocumentAnnotationId: SvgMeasurementToolBasic.annotationId,
                    AnnotationType: SvgMeasurementToolBasic.type,
                    ParentId: "", // not implemented yet
                    DocumentVersionId: AnnotationApplication.documentVersionId,
                    Fill: line1.attr("fill"),
                    Stroke: line1.attr("stroke"),
                    StrokeWidth: line1.attr("stroke-width"),
                    Points: [
                        { X: parseFloat(points[0] / paperWidth), Y: parseFloat(points[1] / paperHeight), OrderNumber: 0 },
                        { X: parseFloat(points[2] / paperWidth), Y: parseFloat(points[3] / paperHeight), OrderNumber: 1 }
                    ],
                    TextAlign: SvgMeasurementToolBasic.textPosition,
                    Text: text.attr("text"),
                    Angle: SvgMeasurementToolBasic.baseAngle,
                    AnnotationName: SvgMeasurementToolBasic.type,
                    Opacity: line1.attr("opacity"),
                    IsSelectable: true,
                    IsGroup: true, // not implemented yet
                    Scale: that.scale,
                    Unit: SvgMeasurementToolBasic.unit,
                    ModifiedBy: line1.getModifiedBy(),
                    CreatedBy: line1.getCreatedBy(),
                    DeletedBy: null,
                    CreatedOn: null,
                    ModifiedOn: null,
                    DeletedOn: null,
                    EMSNodeId: null, // not implemented yet
                    ChildDocumentId: null, // not implemented yet
                    PageId: line1.getPageId(),
                    PageNumber: SvgMeasurementToolBasic.pageNumber,
                    childrenIds: null // not implemented yet
                }

            }
            else{

            var dbObject = {
                DocumentAnnotationId: this.annotationId,
                AnnotationType: this.type,
                ParentId: "", // not implemented yet
                DocumentVersionId: AnnotationApplication.documentVersionId,
                Fill: line1.attr("fill"),
                Stroke: line1.attr("stroke"),
                StrokeWidth: line1.attr("stroke-width"),
                Points: [
                    { X: parseFloat(points[0] / paperWidth), Y: parseFloat(points[1] / paperHeight), OrderNumber: 0 },
                    { X: parseFloat(points[2] / paperWidth), Y: parseFloat(points[3] / paperHeight), OrderNumber: 1 }
                ],
                TextAlign: this.textPosition,
                Text: text.attr("text"),
                Angle: this.baseAngle,
                AnnotationName: this.type,
                Opacity: line1.attr("opacity"),
                IsSelectable: true,
                IsGroup: true, // not implemented yet
                Scale: that.scale,
                Unit: this.unit,
                ModifiedBy: line1.getModifiedBy(),
                CreatedBy: line1.getCreatedBy(),
                DeletedBy: null,
                CreatedOn: null,
                ModifiedOn: null,
                DeletedOn: null,
                EMSNodeId: null, // not implemented yet
                ChildDocumentId: null, // not implemented yet
                PageId: line1.getPageId(),
                PageNumber: this.pageNumber,
                childrenIds: null // not implemented yet
            }
        }

            console.log("beforeUpdate", dbObject);
            return dbObject;
        },

        update: function () {
            var that = this;
            // var paper = this.svgController.paper;
            // var element = this.element;

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
            // var paper = this.svgController.paper;
            // var element = that.element;
if(SvgMeasurementToolBasic.isMeasurementUpdate){
    LocalAnnotationsControllerLogic.updateAnnotation(
        AnnotationApplication.documentVersionId,
        SvgMeasurementToolBasic.pageNumber,
        dbObject,
        this);

}else{
    LocalAnnotationsControllerLogic.updateAnnotation(
        AnnotationApplication.documentVersionId,
        this.pageNumber,
        dbObject,
        this);


}
          

            console.log("afterUpdate", dbObject);
          
            that.createMask();
            SvgMeasurementToolBasic.isMeasurementUpdate = false;
        },

        //===============================================
        //================== save =======================
        //===============================================

        beforeSave: function () {
            var that = this;
            var element = that.element;
            var text = element.text;
            var line1 = element.line1;
            var line2 = element.line2;

            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((that.svgController.paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((that.svgController.paper.height).replace("px", "")) / currentScale;
            //if (that.svgController.tempElement) that.svgController.tempElement.remove();

            var points = [
                line1.attr("path")[0][1],
                line1.attr("path")[0][2],
                line2 !== null ? line2.attr("path")[1][1] : line1.attr("path")[1][1],
                line2 !== null ? line2.attr("path")[1][2] : line1.attr("path")[1][2]
            ];


            var dbObject = {
                DocumentAnnotationId: "00000000-0000-0000-0000-000000000000",
                AnnotationType: that.type,
                ParentId: "", // not implemented yet
                DocumentVersionId: AnnotationApplication.documentVersionId,
                Fill: line1.attr("fill"),
                Stroke: line1.attr("stroke"),
                StrokeWidth: line1.attr("stroke-width"),
                Points: [
                    { X: parseFloat(points[0] / paperWidth), Y: parseFloat(points[1] / paperHeight), OrderNumber: 0 },
                    { X: parseFloat(points[2] / paperWidth), Y: parseFloat(points[3] / paperHeight), OrderNumber: 1 }
                ],
                TextAlign: that.textPosition,
                Text: text.attr("text"),
                Angle: that.baseAngle,
                AnnotationName: that.type,
                Opacity: line1.attr("opacity"),
                IsSelectable: true,
                IsGroup: true, // not implemented yet
                Scale: that.scale,
                Unit: that.unit,
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

            that.element.text.data("DocumentAnnotationId", that.annotationId);
            that.element.line1.data("DocumentAnnotationId", that.annotationId);
            if (that.element.line2 !== null) that.element.line2.data("DocumentAnnotationId", that.annotationId);
            SvgGlobalControllerLogic.addToAnnotations2(that.annotationId, that);

            if (that.isPastedFrom !== null) {
                that.afterPaste(that.isPastedFrom);
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
            if (that.element === null) return;
            that.element.text.remove();
            that.element.line1.remove();
            if (that.element.line2 !== null) that.element.line2.remove();
            that.deleteMask();
            that.removeHandles();
            if (that.glow !== null) {
                that.glow.forEach(function(el){
                    el.remove();

                })
            }
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

            //                     that.onElementClick(element, paper, elementType);



            //                 }
            //             })
            //             .touchmove(function (e) {
            //                 //console.log("touchmove", e);
            //                 tm = e;

            //             })
            //             .click(function (e) {
            //                 //that.onElementClick(element, paper, elementType);
            //                 me.onClick();
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
            //                 me.onMouseUp(e);
            //             })
            //             .drag(
            //                 function (dx, dy, x, y, e) {  // move
            //                     if (e.which === 3 || me.svgController.contextMenu) return;
            //                     me.onElementDragging(dx, dy, x, y, e);
            //                     e.stopPropagation();
            //                 }, function (x, y) {  // start
            //                     me.onElementDragStart(x, y);
            //                 }, function (e) {  //end
            //                     me.onElementDragEnd(e);
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
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
                me.svgController.clearAllJoints();
                
            //     var msg = {
            //         exchangeId: AnnotationApplication.documentVersionId,
            //         event: {
            //             eventType: "AnnotationClick",
            //             value: {
            //                 object: me.type,
            //                 annotationId: me.annotationId
            //             }
            //         }
            //   }
            //     dataExchange.sendParentMessage('dblClickAnnotation', msg);
               // me.openMeasurementScaleEdit(me.element);
            }
            
            if(SvgGlobalControllerLogic.selectedIds2.length>1){
                //SvgGlobalControllerLogic.clearAllJoints();
                SvgGlobalControllerLogic.drawSelectBox();
            }else{
                me.createHandles();
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
                //SvgGlobalControllerLogic.drawSelectBox();
               
                    //SvgGlobalControllerLogic.clearAllJoints();
                    //SvgGlobalControllerLogic.drawSelectBox();
                    if(SvgGlobalControllerLogic.selectedIds2.length>1){
                        //SvgGlobalControllerLogic.clearAllJoints();
                        SvgGlobalControllerLogic.drawSelectBox();
                    }else{
                        this.createHandles();
                    }
               
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

        onElementDragging: function (dx, dy, x, y, e) {
            var that = this;
            var text = that.element.text;
            var l1 = that.element.line1;
            var l2 = that.element.line2;

            var svgController = that.svgController;
            var dxdy = svgController.getDXDY(dx, dy);
            dx = dxdy.dx;
            dy = dxdy.dy;

            if (!this.isDrawing && (Math.abs(dx) + Math.abs(dy) !== 0)) {
                SvgGlobalControllerLogic.isDraggingElement = true;
                var lx = dx;// + ox ;
                var ly = dy;// + oy ;

                var rotate = that.baseAngle - svgController.getPageRotation();

                var textrotation = text.matrix.split().rotate;
                var lineRotation = l1.matrix.split().rotate;
                text.transform("T" + lx / svgController.getScale() + "," + ly / svgController.getScale() + "r" + textrotation);
                l1.transform("T" + lx / svgController.getScale() + "," + ly / svgController.getScale() + "r" + lineRotation);
                if (l2 !== null)
                    l2.transform("T" + lx / svgController.getScale() + "," + ly / svgController.getScale() + "r" + lineRotation);

                SvgGlobalControllerLogic.hideGlow(that);
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
                var text = that.element.text;
                var l1 = that.element.line1;
                var l2 = that.element.line2;
                var currentScale = PDFViewerApplication.pdfViewer.currentScale;
                var paperWidth = parseFloat((svgController.paper.width).replace("px", "")) / currentScale;
                var paperHeight = parseFloat((svgController.paper.height).replace("px", "")) / currentScale;

                var dx, dy, newX, newY, angle;

                angle = l1.matrix.split().rotate;
                l1.attr({ "class": "hidden" });
                l1.rotate(-angle);
                dx = l1.matrix.split().dx;
                dy = l1.matrix.split().dy;
                l1.rotate(angle);
                l1.attr({ "class": "" });
                newX = l1.attr("x") + dx;
                newY = l1.attr("y") + dy;
                angle = l1.matrix.split().rotate;

                var oldElement = that.element;
                if (oldElement.line2 === null) oldElement.line2 = oldElement.line1;
                that.draw(
                    oldElement.line1.attr("path")[0][1] + dx,
                    oldElement.line1.attr("path")[0][2] + dy,
                    oldElement.line2.attr("path")[1][1] + dx,
                    oldElement.line2.attr("path")[1][2] + dy,
                    that.textPosition,
                    that.unit,
                    that.scale,
                    false,
                    that.baseAngle
                );
                that.bindEvents(oldElement.text);
                that.bindEvents(oldElement.line1);
                if (that.element.line2 !== null) that.bindEvents(oldElement.line2);

                oldElement.text.remove();
                oldElement.line1.remove();
                if (oldElement.line2) oldElement.line2.remove();

                that.update();
            }
        },

        //===============================================
        //================== Controls ===================
        //===============================================
        updateTextPosition: function (x1, y1, x2, y2) {
            var that = this;
            var line1 = that.element.line1;
            var line2 = that.element.line2;
            var text = that.element.text;
            var textPosition = that.textPosition;
            var baseAngle = that.baseAngle;
            var angle = Raphael.angle(x1, y1, x2, y2);
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;

            var totalLength = Raphael.getTotalLength(line1.attr("path"));

            var txtValue = Number.parseFloat(totalLength * that.scale).toFixed(2);
            // if (kendo.culture().name === "de-DE") {
            //     txtValue = txtValue.replace('.', ',');
            // }
            var temptextPosition = textPosition;
            if ([270, 180].includes(baseAngle)) {
                if (textPosition === "top") {
                    temptextPosition = "bottom";
                } else if (textPosition === "bottom") {
                    temptextPosition = "top";
                }
            }
            text.transform("");
            var dx = 0;
            var dy = 0;

            text.data("Angle", baseAngle);

            switch (temptextPosition) {
                case "top":
                    text.data("TextAlign", textPosition);
                    dx = -1 * Math.abs(20 * Math.sin(angle * 3.14 / 180) / currentScale);
                    dy = -1 * Math.abs(20 * Math.cos(angle * 3.14 / 180) / currentScale);
                    text.data("Scale", that.scale);
                    text.data("Unit", that.unit);
                    break;
                case "bottom":
                    text.data("TextAlign", textPosition);
                    dx = Math.abs(20 * Math.sin(angle * 3.14 / 180)) / currentScale;
                    dy = Math.abs(20 * Math.cos(angle * 3.14 / 180) / currentScale);
                    text.data("Scale", that.scale);
                    text.data("Unit", that.unit);
                    break;
                default:
                    text.data("TextAlign", textPosition);
                    text.data("Unit", that.unit);
                    text.data("Scale", that.scale);

            }
            text.attr({
                "x": ((x2 + x1) / 2) + dx,
                "y": ((y2 + y1) / 2) + dy,
                "text": SvgGlobalControllerLogic.formatMeasurementText(txtValue, that.unit)
            });

            var txtbbox = text.getBBox();
            //switch(that.getPageRotation()){
            switch (baseAngle) {
                case 0:
                    text.rotate((x2 < x1) ? angle : angle + 180);
                    break;
                case 90:
                    text.rotate((y1 < y2) ? angle : angle + 180);
                    break;
                case 180:
                    text.rotate((x1 < x2) ? angle : angle + 180);
                    break;
                case 270:
                    text.rotate((y2 < y1) ? angle : angle + 180);
                    break;
            }
        },

        createHandles: function () {
            var that = this;
            var svgController = that.svgController;
            var paper = that.svgController.paper;
            var text = that.element.text;
            var line1 = that.element.line1;
            var line2 = that.element.line2;



            if (that.handleids.length > 0) that.removeHandles();

            var scale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseInt(paper.width.replace("px", "")) / scale;
            var paperHeight = parseInt(paper.height.replace("px", "")) / scale;
            var radius = 15 / scale;
            // lineHead


            // line2
            var ts, tm, te;

            var onDragC1 = function (dx, dy, x, y, e, obj) {
                var dxdy = svgController.getDXDY(dx, dy);
                dx = dxdy.dx;
                dy = dxdy.dy;
                var el = line2;
                let lx = dx;
                let ly = dy;
                obj.transform("T" + lx / scale + "," + ly / scale);

                var oldElement = that.element;
                var newPath = `
                M ` +
                    oldElement.line1.attr("path")[0][1] +
                    `,` +
                    oldElement.line1.attr("path")[0][2] +
                    `L ` +
                    obj.matrix.x(obj.attr("cx"), obj.attr("cy")) +
                    `,` +
                    obj.matrix.y(obj.attr("cx"), obj.attr("cy"));

                that.element.line1.attr({
                    path: newPath
                });

                that.updateTextPosition(
                    that.element.line1.attr("path")[0][1],
                    that.element.line1.attr("path")[0][2],
                    obj.matrix.x(obj.attr("cx"), obj.attr("cy")),
                    obj.matrix.y(obj.attr("cx"), obj.attr("cy"))
                );

                if (that.element.line2 === null) {
                    that.element.text.attr({
                        "opacity": oldElement.text.attr("opacity"),
                    });
                    that.element.line1.attr({
                        "stroke-width": oldElement.line1.attr("stroke-width"),
                        "stroke": oldElement.line1.attr("stroke"),
                        "opacity": oldElement.line1.attr("opacity")
                    });
                    if (that.element.line2 !== null) {
                        that.element.line2.attr({
                            "stroke-width": oldElement.line2.attr("stroke-width"),
                            "stroke": oldElement.line2.attr("stroke"),
                            "opacity": oldElement.line2.attr("opacity")
                        });
                    }
                } else {
                    var totalLength = Raphael.getTotalLength(oldElement.line1.attr("path"));
                    var txtbbox = oldElement.text.getBBox();
                    var eachLineLength = (totalLength - txtbbox.width) / 2;

                    var x1 = oldElement.line1.attr("path")[0][1];
                    var y1 = oldElement.line1.attr("path")[0][2];
                    var x2 = obj.matrix.x(obj.attr("cx"), obj.attr("cy"));
                    var y2 = obj.matrix.y(obj.attr("cx"), obj.attr("cy"));

                    //var pathLine1 = Raphael.getSubpath(line1.attr("path"), 0, eachLineLength);
                    //var pathLine2 = Raphael.getSubpath(line1.attr("path"), eachLineLength + txtbbox.width, totalLength);
                    var pEndOfL1 = Raphael.getPointAtLength("M " + x1 + " " + y1 + " L " + x2 + " " + y2, eachLineLength);
                    var pBeginOfL2 = Raphael.getPointAtLength("M " + x1 + " " + y1 + " L " + x2 + " " + y2, eachLineLength + txtbbox.width);
                    var pEndOfL2 = Raphael.getPointAtLength("M " + x1 + " " + y1 + " L " + x2 + " " + y2, totalLength);

                    oldElement.line1.attr("path", "M " + x1 + " " + y1 + " L " + pEndOfL1.x + " " + pEndOfL1.y)
                        .attr({
                            "arrow-start": "block"
                        });

                    oldElement.line2.attr("path", "M " + pBeginOfL2.x + " " + pBeginOfL2.y + " L " + pEndOfL2.x + " " + pEndOfL2.y)
                        .attr({
                            "arrow-end": "block"
                        });
                }
            }

            var onDragEndC1 = function (e, obj) {
                let lx = obj.matrix.x(obj.attr("cx"), obj.attr("cy"));
                let ly = obj.matrix.y(obj.attr("cx"), obj.attr("cy"));
                lx = lx < 5 ? 0 : lx;
                ly = ly < 5 ? 0 : ly;
                lx = lx > paperWidth ? paperWidth - 5 : lx;
                ly = ly > paperHeight ? paperHeight - 5 : ly;
                obj.attr({ cx: lx, cy: ly });
                // this.transform("");
                that.element.text.attr({
                    "opacity": that.element.text.attr("opacity"),
                });
                that.element.line1.attr({
                    "stroke-width": that.element.line1.attr("stroke-width"),
                    "stroke": that.element.line1.attr("stroke"),
                    "opacity": that.element.line1.attr("opacity")
                });
                if (that.element.line2 !== null) {
                    that.element.line2.attr({
                        "stroke-width": that.element.line2.attr("stroke-width"),
                        "stroke": that.element.line2.attr("stroke"),
                        "opacity": that.element.line2.attr("opacity")
                    });
                }
                that.createHandles();
                that.update();
            }

            var c1 = paper.circle(
                (that.element.line2 !== null) ? that.element.line2.attr("path")[1][1] : that.element.line1.attr("path")[1][1],
                (that.element.line2 !== null) ? that.element.line2.attr("path")[1][2] : that.element.line1.attr("path")[1][2],
                radius
            )
                .attr({
                    fill: "green",
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
                    // var dxdy = svgController.getDXDY(dx, dy);
                    // dx = dxdy.dx;
                    // dy = dxdy.dy;
                    if(SvgGlobalControllerLogic.isDraggablePermission){
                    onDragC1(dx, dy, x, y, e, this);
                    }else{
                        return;
                    }









                    //oldElement.text.remove();
                    //oldElement.line1.remove();
                    //if (that.element.line2 !== null) oldElement.line2.remove();

                    // if (that.element.line2 === null) {
                    //     // line1
                    //     var p = "M " + line1.attr("path")[0][1] + " " + line1.attr("path")[0][2] +
                    //         " L " + this.matrix.x(this.attr("cx"), this.attr("cy")) + " " + this.matrix.y(this.attr("cx"), this.attr("cy"));
                    //     line1.attr("path", p);



                    // } else {
                    //     var oldElement = that.element;
                    //     that.draw(
                    //         oldElement.line1.attr("path")[0][1],
                    //         oldElement.line1.attr("path")[0][2],
                    //         this.matrix.x(this.attr("cx"), this.attr("cy")),
                    //         this.matrix.y(this.attr("cx"), this.attr("cy")),
                    //         that.textPosition,
                    //         that.unit,
                    //         that.scale,false,
                    //         that.baseAngle
                    //     );
                    //     oldElement.text.remove();
                    //     oldElement.line1.remove();
                    //     oldElement.line2.remove();
                    // }
                    //that.updateTextLocation();

                    //textbox.rotate((line2.attr("path")[1][1] < line1.attr("path")[0][1]) ? angle : angle + 180);
                    //svgController.updateMeasurementScale(element, textbox.getScale(), textbox.getUnit(), false);

                }, function (x, y) {
                    //console.log(" x:" + x + " y:" + y);

                }, function (e) {
                    if(SvgGlobalControllerLogic.isDraggablePermission){
                    onDragEndC1(e, this);
                    }else{
                        return;
                    }
                    // console.log("drag ended", e);

                },
                );

            // line1

            var onDragC2 = function (dx, dy, x, y, e, obj) {
                var dxdy = svgController.getDXDY(dx, dy);
                dx = dxdy.dx;
                dy = dxdy.dy;
                var el = line1;
                let lx = dx;
                let ly = dy;
                obj.transform("T" + lx / scale + "," + ly / scale);

                var oldElement = that.element;
                var newPath = `
                M ` +
                    obj.matrix.x(obj.attr("cx"), obj.attr("cy")) +
                    `,` +
                    obj.matrix.y(obj.attr("cx"), obj.attr("cy")) +
                    `L ` +
                    (that.element.line2 !== null ? that.element.line2.attr("path")[1][1] : that.element.line1.attr("path")[1][1]) +
                    `,` +
                    (that.element.line2 !== null ? that.element.line2.attr("path")[1][2] : that.element.line1.attr("path")[1][2]);


                that.element.line1.attr({
                    path: newPath
                });

                that.updateTextPosition(
                    obj.matrix.x(obj.attr("cx"), obj.attr("cy")),
                    obj.matrix.y(obj.attr("cx"), obj.attr("cy")),
                    that.element.line2 !== null ? that.element.line2.attr("path")[1][1] : that.element.line1.attr("path")[1][1],
                    that.element.line2 !== null ? that.element.line2.attr("path")[1][2] : that.element.line1.attr("path")[1][2],
                );


                if (that.element.line2 !== null) {
                    var totalLength = Raphael.getTotalLength(that.element.line1.attr("path"));
                    var txtbbox = oldElement.text.getBBox();
                    var eachLineLength = (totalLength - txtbbox.width) / 2;

                    var x1 = obj.matrix.x(obj.attr("cx"), obj.attr("cy"));
                    var y1 = obj.matrix.y(obj.attr("cx"), obj.attr("cy"));
                    var x2 = that.element.line1.attr("path")[1][1];
                    var y2 = that.element.line1.attr("path")[1][2];

                    //var pathLine1 = Raphael.getSubpath(line1.attr("path"), 0, eachLineLength);
                    //var pathLine2 = Raphael.getSubpath(line1.attr("path"), eachLineLength + txtbbox.width, totalLength);
                    var pEndOfL1 = Raphael.getPointAtLength("M " + x1 + " " + y1 + " L " + x2 + " " + y2, eachLineLength);
                    var pBeginOfL2 = Raphael.getPointAtLength("M " + x1 + " " + y1 + " L " + x2 + " " + y2, eachLineLength + txtbbox.width);
                    var pEndOfL2 = Raphael.getPointAtLength("M " + x1 + " " + y1 + " L " + x2 + " " + y2, totalLength);

                    oldElement.line1.attr("path", "M " + x1 + " " + y1 + " L " + pEndOfL1.x + " " + pEndOfL1.y)
                        .attr({
                            "arrow-start": "block"
                        });

                    oldElement.line2.attr("path", "M " + pBeginOfL2.x + " " + pBeginOfL2.y + " L " + pEndOfL2.x + " " + pEndOfL2.y)
                        .attr({
                            "arrow-end": "block"
                        });
                }
            }

            var onDragEndC2 = function (e, obj) {
                let lx = obj.matrix.x(obj.attr("cx"), obj.attr("cy"));
                let ly = obj.matrix.y(obj.attr("cx"), obj.attr("cy"));
                lx = lx < 5 ? 0 : lx;
                ly = ly < 5 ? 0 : ly;
                lx = lx > paperWidth ? paperWidth - 5 : lx;
                ly = ly > paperHeight ? paperHeight - 5 : ly;
                obj.attr({ cx: lx, cy: ly });

                that.createHandles();
                that.update();
            }



            var c2 = paper.circle(
                line1.attr("path")[0][1],
                line1.attr("path")[0][2],
                radius
            )
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
                    }else{
                        return;
                    }
                },
                );

            c1.data("isJoint", true);
            c2.data("isJoint", true);
            $(c1.node).css("z-index", "100");
            $(c2.node).css("z-index", "100");
            that.handleids.push(
                c1,
                c2
            );
        },

        paste: function (e, pageNumber) {
            var that = this;
            var paper = that.svgController.paper;
            var element = that.element;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((paper.height).replace("px", "")) / currentScale;


            var clonedSvgObject = new SvgMeasurementToolBasic(
                SvgGlobalControllerLogic.getSvgController(pageNumber).canvas,
                null,
                that.type,
                pageNumber,
                null,
                SvgGlobalControllerLogic.getSvgController(pageNumber).canvas.getPageRotation(),
                null
            );

            var pathArray = element.line1.attrs.path;
            var x, y;
            if (e === null) {
                x = pathArray[0][1] + 10;
                y = pathArray[0][2] + 10;
            } else {

                x = that.svgController.getXY(e, 1 / that.svgController.getScale()).x;
                y = that.svgController.getXY(e, 1 / that.svgController.getScale()).y;
            }

            clonedSvgObject.isPastedFrom = {
                fromSvgObject: that,
                x: x,
                y: y
            };
            var newPath = "M" + x + "," + y;
            var dx = x - element.line1.attr("path")[0][1];
            var dy = y - element.line1.attr("path")[0][2];
            var x1 = x;
            var y1 = y;
            var x2 = x + dx;
            var y2 = y + dy;

            clonedSvgObject.create(
                x,
                y,
                ((element.line2 !== null) ? element.line2.attr("path")[1][1] + dx : element.line1.attr("path")[1][1] + dx),
                ((element.line2 !== null) ? element.line2.attr("path")[1][2] + dy : element.line1.attr("path")[1][2] + dy),
                that.textPosition,
                that.unit,
                that.scale,
                true,
                that.baseAngle
            );

            // clonedSvgObject.element.line1.attr(element.line1.attrs);
            // clonedSvgObject.element.text.attr(element.text.attrs);
            // if (element.line2 !== null) clonedSvgObject.element.line2.attr(element.line2.attrs);

            // clonedSvgObject.element.line1.transform(element.line1.transform());
            // clonedSvgObject.element.text.transform(element.text.transform());
            // if (element.line2 !== null) clonedSvgObject.element.line2.transform(element.line2.transform());
            // // clonedSvgObject.element.attr({
            // //     x: clonedSvgObject.element.attr("x") + 10,
            // //     y: clonedSvgObject.element.attr("y") + 10
            // // });
            // clonedSvgObject.update();


            // clonedSvgObject.element.line1.attr({
            //     fill: element.line1.attr("fill"),
            //     stroke: element.line1.attr("stroke"),
            //     'stroke-width': element.line1.attr["stroke-width"],
            //     Opacity: element.line1.attr("opacity")
            // });

            //clonedSvgObject.afterCreate();
        },

        afterPaste: function(){
            var that = this;
            try{
                var element = that.isPastedFrom.fromSvgObject.element;
                var path1 = that.element.line1.attr("path");
                var path2 = (element.line2 !== null) ? that.element.line2.attr("path") : null;  

                that.element.line1.attr(element.line1.attrs);
                if(element.line2 !== null)that.element.line2.attr(element.line2.attrs);

                

                that.element.line1.attr({
                    path:path1
                });

                if(element.line2 !== null)that.element.line2.attr({
                    path:path2
                });
                //that.element.transform(element.transform());

                
                
                //that.afterCreate();
                that.isPastedFrom = null;
                that.update();
                SvgGlobalControllerLogic.selectedIds2.push(that.annotationId);
                SvgGlobalControllerLogic.drawSelectBox([that.annotationId]);
                
            }catch(ex){
                console.error(ex);
            }
        },

        removeHandles: function () {
            var that = this;
            that.handleids.forEach(function (handle) {
                that.removeHandle(handle);
            });
            that.handleids = [];
        },

        removeHandle: function (handle) {
            handle.remove();
        },

        updateTextLocation: function () {
            var that = this;
            var svgController = that.svgController;
            var paper = that.svgController.paper;
            var text = that.element.text;
            var line1 = that.element.line1;
            var line2 = that.element.line2 === null ? that.element.line1 : that.element.line2;
            // text
            var totalPath = "M " + line1.attr("path")[0][1] + " " + line1.attr("path")[0][2] +
                " L " + line2.attr("path")[1][1] + " " + line2.attr("path")[1][1];
            var totalLength = Raphael.getTotalLength(totalPath);
            var centerPoint = Raphael.getPointAtLength(
                line1.attr("path"),
                totalLength / 2
            );
            text.transform("");
            var value = (Number.parseFloat(Raphael.getTotalLength(line1.attr("path"))) / (that.scale)).toFixed(2);// + " " + textbox.getUnit(); 
            text.attr({
                x: centerPoint.x,
                y: centerPoint.y,
                text: SvgGlobalControllerLogic.formatMeasurementText(value, that.unit)
            });
            if ([270, 180].includes(that.baseAngle)) {
                if (that.textPosition === "top") {
                    that.textPosition = "bottom";
                } else if (that.textPosition === "bottom") {
                    that.textPosition = "top";
                }
            }
            var angle = Raphael.angle(line1.attr("path")[0][1], line1.attr("path")[0][2], line1.attr("path")[1][1], line1.attr("path")[1][2]);

            switch (that.textPosition) {
                case "top":
                    text.translate(-1 * Math.abs(20 * Math.sin(angle * 3.14 / 180)), -1 * Math.abs(20 * Math.cos(angle * 3.14 / 180)));
                    break;
                case "bottom":
                    text.translate(Math.abs(20 * Math.sin(angle * 3.14 / 180)), Math.abs(20 * Math.cos(angle * 3.14 / 180)));
                    break;
                default:
            }
            var x2 = line2.attr("path")[1][1];
            var x1 = line1.attr("path")[0][1];
            var y2 = line2.attr("path")[1][2];
            var y1 = line1.attr("path")[0][2];
            switch (that.baseAngle) {
                case 0:
                    text.rotate((x2 < x1) ? angle : angle + 180);
                    break;
                case 90:
                    text.rotate((y1 < y2) ? angle : angle + 180);
                    break;
                case 180:
                    text.rotate((x1 < x2) ? angle : angle + 180);
                    break;
                case 270:
                    text.rotate((y2 < y1) ? angle : angle + 180);
                    break;
            }
        },

        createMask: function () {
            var that = this;
            var me = that;
            //var svgController = that.svgController;
            if(SvgMeasurementToolBasic.isMeasurementUpdate){
                var element1 = SvgMeasurementToolBasic.element

            }else{
                var element1 = that.element;

            }
            
            that.deleteMask();
            that.maskids = [];
            if(SvgMeasurementToolBasic.isMeasurementUpdate){
                Object.keys(element1).filter(s => SvgMeasurementToolBasic.element[s] !== null).forEach(function (el) {
                    var element = SvgMeasurementToolBasic.element[el];
                    var mask = element.clone();
                    mask.attr({
                        stroke: "white",
                        "stroke-width": 15,
                        fill: "white",
                        opacity: 0.01
                    })
                        // .touchstart(function (e) {
                        //     //console.log("touchstart", e);
                        //     ts = e;
                        // })
                        // .touchend(function (e) {
                        //     //console.log("touchend", e);
                        //     te = e;
                        //     if (te.timeStamp - ts.timeStamp < 500) {
                        //         // tap
    
                        //         svgController.onElementClick(element, paper, elementType);
    
    
    
                        //     }
                        // })
                        // .touchmove(function (e) {
                        //     //console.log("touchmove", e);
                        //     tm = e;
    
                        // })
                        // .click(function (e) {
                        //     //that.onElementClick(element, paper, elementType);
                        //     me.onClick();
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
                        //     me.onMouseUp(e);
                        // })
                        // .drag(
                        //     function (dx, dy, x, y, e) {  // move
                        //         if (e.which === 3 || me.svgController.contextMenu) return;
                        //         me.onElementDragging(dx, dy, x, y, e);
                        //         e.stopPropagation();
                        //     }, function (x, y) {  // start
                        //         me.onElementDragStart(x, y);
                        //     }, function (e) {  //end
                        //         me.onElementDragEnd(e);
                        //     }
                        // )
    
                        .scale(1.15, 1.15)
                        .toBack();
                    SvgGlobalControllerLogic.BindMaskEventsToSvgObject(that, mask);
                    that.maskids.push(mask);
                });

            }else{
            Object.keys(element1).filter(s => that.element[s] !== null).forEach(function (el) {
                var element = me.element[el];
                var mask = element.clone();
                mask.attr({
                    stroke: "white",
                    "stroke-width": 15,
                    fill: "white",
                    opacity: 0.01
                })
                    // .touchstart(function (e) {
                    //     //console.log("touchstart", e);
                    //     ts = e;
                    // })
                    // .touchend(function (e) {
                    //     //console.log("touchend", e);
                    //     te = e;
                    //     if (te.timeStamp - ts.timeStamp < 500) {
                    //         // tap

                    //         svgController.onElementClick(element, paper, elementType);



                    //     }
                    // })
                    // .touchmove(function (e) {
                    //     //console.log("touchmove", e);
                    //     tm = e;

                    // })
                    // .click(function (e) {
                    //     //that.onElementClick(element, paper, elementType);
                    //     me.onClick();
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
                    //     me.onMouseUp(e);
                    // })
                    // .drag(
                    //     function (dx, dy, x, y, e) {  // move
                    //         if (e.which === 3 || me.svgController.contextMenu) return;
                    //         me.onElementDragging(dx, dy, x, y, e);
                    //         e.stopPropagation();
                    //     }, function (x, y) {  // start
                    //         me.onElementDragStart(x, y);
                    //     }, function (e) {  //end
                    //         me.onElementDragEnd(e);
                    //     }
                    // )

                    .scale(1.15, 1.15)
                    .toBack();
                SvgGlobalControllerLogic.BindMaskEventsToSvgObject(that, mask);
                that.maskids.push(mask);
            });
        }

        },

        deleteMask: function () {
            var that = this;
            if(SvgMeasurementToolBasic.isMeasurementUpdate){
                if (SvgMeasurementToolBasic.maskids !== null) {
                    SvgMeasurementToolBasic.maskids.forEach(function(el){
                        el.remove();
                    })
                }


            }else{
           // if (that.maskids !== null) that.maskids.forEach(function (el) { el.remove() });
            if (that.maskids !== null) {
                that.maskids.forEach(function(el){
                    el.remove();

                });
            }
            }

        },

        openMeasurementScaleEdit: function (element,measurementValue , updateCheck, unit ) {
            var that = this;
            //var textbox = that.element.text;
            var textbox = element.text;
            //var inputText = SvgGlobalControllerLogic.parseMeasurementText(textbox.attr("text"), that.unit);
            //inputText = inputText.indexOf(",") > -1 ? inputText.replace('.','').replace(',','.') : inputText;
            //var txt = kendo.parseFloat(inputText);
            // var kendoWindow = $("#kendoWindow");
            // var template = `
            // <div>
            //     <h5>`+ VIEW_RESOURCES.Resource.MeasurementToolCalibrateMessage + `:</h5>
            //     <input id='scaleeditor' type='number' min="0" step="0.01"/>
            //     <h5>`+ VIEW_RESOURCES.Resource.Metric + `:</h5>
            //     <select id="system" style="width: 100%;" >
            //         <option `+ (that.unit === "m" ? "selected" : "") + `>` + VIEW_RESOURCES.Resource.Metric + ` (m)</option>
            //         <option `+ (that.unit === "in" ? "selected" : "") + `>` + VIEW_RESOURCES.Resource.Imperial + ` (in)</option>
            //         <option `+ (that.unit === "px" ? "selected" : "") + `>` + VIEW_RESOURCES.Resource.Pixel + ` (px)</option>
            //     </select>
            // </div>
            // <br />
            // <input type="checkbox" id="updateall" name="updateall" value="true">
            // <p>`+ VIEW_RESOURCES.Resource.Note + `: ` + VIEW_RESOURCES.Resource.MeasurementToolUpdateAllMessage + `.</p>
            // <div class='row k-popup-bottom' style='padding-bottom: 0px; padding-top: 15px;'>
            //     <button id='kendoDecline' class='btn btn-other pull-right' style='text-align:center; margin-left:10px;'>
            //         `+ GetResourceString('Cancel') + `
            //     </button>
            //     <button id='kendoConfirm' class='btn btn-success pull-right' >
            //         `+ GetResourceString('Ok') + `
            //     </button>
            // </div>
            // `;
            // kendoWindow.kendoWindow({
            //     title: GetResourceString('Edit'),
            //     maxWidth: "800px",
            //     maxHeight: "500px",
            //     visible: false,
            //     draggable: true,
            //     resizable: false,
            //     iframe: true,
            //     modal: true,
            //     actions: ["Close"],
            // }).data("kendoWindow").center().open().content(template);
            // AnnotationApplication.CanvasController.isUserTyping = true;
            // $("#system").kendoDropDownList();
            // $("#scaleeditor").kendoNumericTextBox({ value: kendo.parseFloat(inputText) });
            //$("#kendoConfirm").click(function () { // confirmed
                // switch ($("#system").val()) {
                //     case VIEW_RESOURCES.Resource.Metric + " (m)":
                //         that.unit = "m";
                //         break;
                //     case VIEW_RESOURCES.Resource.Imperial + " (in)":
                //         that.unit = "in";
                //         break;
                //     case VIEW_RESOURCES.Resource.Pixel + " (px)":
                //         that.unit = "px";
                //         break;
                // }
               // var updateAll = $("#updateall:checked").length > 0;
               var updateAll = updateCheck;
               var px = 0;
                if (element.line2 !== null) {
                    var x1 = element.line1.attr("path")[0][1];
                    var y1 = element.line1.attr("path")[0][2];
                    var x2 = element.line2.attr("path")[1][1];
                    var y2 = element.line2.attr("path")[1][2];
                    if (element.line2.attr("path")[1].length > 3) {
                        x2 = element.line2.attr("path")[1][5];
                        y2 = element.line2.attr("path")[1][6];
                    }
                    px = that.getTwoPointDistance(x1, y1, x2, y2);
                } else {
                    var x1 = element.line1.attr("path")[0][1];
                    var y1 = element.line1.attr("path")[0][2];
                    var x2 = element.line1.attr("path")[1][1];
                    var y2 = element.line1.attr("path")[1][2];
                    if (element.line1.attr("path")[1].length > 3) {
                        x2 = element.line1.attr("path")[1][5];
                        y2 =element.line1.attr("path")[1][6];
                    }
                    px = that.getTwoPointDistance(x1, y1, x2, y2);
                }

                //var lns = that.element.filter(m => m.type === "path");
                // var px = 0;
                // if (that.element.line2 !== null) {
                //     var x1 = that.element.line1.attr("path")[0][1];
                //     var y1 = that.element.line1.attr("path")[0][2];
                //     var x2 = that.element.line2.attr("path")[1][1];
                //     var y2 = that.element.line2.attr("path")[1][2];
                //     if (that.element.line2.attr("path")[1].length > 3) {
                //         x2 = that.element.line2.attr("path")[1][5];
                //         y2 = that.element.line2.attr("path")[1][6];
                //     }
                //     px = that.getTwoPointDistance(x1, y1, x2, y2);
                // } else {
                //     var x1 = that.element.line1.attr("path")[0][1];
                //     var y1 = that.element.line1.attr("path")[0][2];
                //     var x2 = that.element.line1.attr("path")[1][1];
                //     var y2 = that.element.line1.attr("path")[1][2];
                //     if (that.element.line1.attr("path")[1].length > 3) {
                //         x2 = that.element.line1.attr("path")[1][5];
                //         y2 = that.element.line1.attr("path")[1][6];
                //     }
                //     px = that.getTwoPointDistance(x1, y1, x2, y2);
                // }

                /*if (!["", undefined].includes(textbox.data("Scale"))) {
                    var px = px / textbox.data("Scale");
                }
                */
                var currentScale = PDFViewerApplication.pdfViewer.currentScale;
                that.scale = measurementValue / (px);

                if (updateAll) {
                    that.updateAllMeasurementScales(that.scale, unit, that.annotationId);
                } else {
                    //that.updateMeasurementScale(set, that.scale, that.unit, true);
                }

                //var newTxt = parseFloat($("#scaleeditor").val()).toFixed(2) + " " + that.unit;
                //if (kendo.culture().name === "de-DE") {
                //    newTxt = newTxt.replace('.', ',');
                //}
               // var newTxt = kendo.toString($("#scaleeditor").val(), 'n2');//+ " " + that.unit;
                // if (kendo.culture().name === "de-DE") {
                //     newTxt = newTxt.replace('.', ',');
                // }
                var formatedText = SvgGlobalControllerLogic.formatMeasurementText(measurementValue, unit);
                console.log(formatedText);
                textbox.attr("text", formatedText);
                textbox.data("Unit", unit);
                textbox.data("Scale", SvgMeasurementToolBasic.scale);

                SvgMeasurementToolBasic.svgController.unit = unit;
                SvgMeasurementToolBasic.svgController.scale = SvgMeasurementToolBasic.scale;

                that.update();

                AnnotationApplication.CanvasController.isUserTyping = false;
                //kendoWindow.data("kendoWindow").close();

            //});
            // $("#kendoDecline").click(function () {// declined

            //     AnnotationApplication.CanvasController.isUserTyping = false;
            //     kendoWindow.data("kendoWindow").close();

            // });
            // $(".k-widget.k-window").addClass("deletekmodel");
        },

        getTwoPointDistance: function (x1, y1, x2, y2) {
            var dx = x1 - x2;
            var dy = y1 - y2;
            var d = Math.sqrt(dx * dx + dy * dy);
            return d;
        },

        reDrawMeasurementbasic: function () {
            var that = this;

            var line1 = that.element.line1;
            var line2 = that.element.line2;
            var text = that.element.text;
            if (['top', 'bottom'].includes(that.textPosition)) {
                that.element.line2 = null;
            }

            var StrokeWidth = line1.attr("stroke-width");
            var stroke = line1.attr("stroke");
            var opacity = line1.attr("opacity");

            that.draw(
                line1.attr("path")[0][1],
                line1.attr("path")[0][2],
                line2 !== null ? line2.attr("path")[1][1] : line1.attr("path")[1][1],
                line2 !== null ? line2.attr("path")[1][2] : line1.attr("path")[1][2],
                that.textPosition,
                that.unit,
                that.scale,
                false,
                that.baseAngle,
                text.attr("text")
            );

            that.element.line1.attr({
                "arrow-start": "block",
                "stroke-width": StrokeWidth,
                "stroke": stroke
            });

            if (that.element.line2 !== null) {
                that.element.line2.attr({
                    "arrow-end": "block",
                    "stroke-width": StrokeWidth,
                    "stroke": stroke
                });
            } else {
                that.element.line1.attr({
                    "arrow-end": "block"
                });
            }


            line1.remove();
            if (line2 !== null) line2.remove();
            text.remove();

            // var tempElement = element;
            // var ln = element.items.filter(e => e.type === "path");
            // var x1 = ln[0].attr("path")[0][1];
            // var y1 = ln[0].attr("path")[0][2];
            // var x2 = (ln.length > 1) ? ln[1].attr("path")[1][5] : ln[0].attr("path")[1][1];
            // var y2 = (ln.length > 1) ? ln[1].attr("path")[1][6] : ln[0].attr("path")[1][2];
            // var unit = element.items.filter(s => s.type === "text")[0].getUnit();
            // var angle = element.items.filter(s => s.type === "text")[0].getAngle();
            // var scale = element.items.filter(s => s.type === "text")[0].data("Scale");
            // var newelement = that.drawMeasurementbasic(x1, y1, x2, y2, textAlign, unit, scale, false, angle);

            // newelement.forEach(function (el) {
            //     if (el.type === "set") {
            //         el.forEach(function (elx) {
            //             elx.data("DocumentAnnotationId", element[0].getDocumentAnnotationId());
            //             elx.data("AnnotationType", element[0].getAnnotationType());
            //             elx.data("PageId", element[0].getPageId());
            //             elx.data("CreatedBy", element[0].getCreatedBy());
            //             elx.data("CreatedOn", element[0].getCreatedOn());
            //             elx.data("ModifiedBy", element[0].getModifiedBy());
            //             elx.data("ModifiedOn", element[0].getModifiedOn());
            //             elx.data("Unit", unit);
            //         });
            //     } else {
            //         el.data("DocumentAnnotationId", element[0].getDocumentAnnotationId());
            //         el.data("AnnotationType", element[0].getAnnotationType());
            //         el.data("PageId", element[0].getPageId());
            //         el.data("CreatedBy", element[0].getCreatedBy());
            //         el.data("CreatedOn", element[0].getCreatedOn());
            //         el.data("ModifiedBy", element[0].getModifiedBy());
            //         el.data("ModifiedOn", element[0].getModifiedOn());
            //         el.data("Unit", unit);
            //     }

            // });
            // element = newelement;
            // element.data("TextAlign", textAlign);

            // // updating style
            // var tempLines = tempElement.items.filter(s => s.type === "path");
            // if (tempLines.length > 0) {
            //     var newLines = element.items.filter(s => s.type === "path");
            //     newLines.forEach(function (ln) {
            //         ln.attr({
            //             "stroke": tempLines[0].attr("stroke"),
            //             "stroke-width": tempLines[0].attr("stroke-width")
            //         });
            //     });
            // }

            // tempElement.remove();
            // SvgGlobalControllerLogic.selectedObject = {
            //     element: element,
            //     svgController: that
            // };

            //return element;
        },

        updateAllMeasurementScales: function (scale, unit, excludeId) {
            var that = this;
            Object.keys(SvgGlobalControllerLogic.annotations2).forEach(function (id) {
                var svgObject = SvgGlobalControllerLogic.annotations2[id];
                if (svgObject.type !== "measurementbasic" || excludeId === id) return;
                svgObject.scale = scale;
                svgObject.unit = unit;
                var px = 0;

                if (svgObject.element.line2 !== null) {
                    var x1 = svgObject.element.line1.attr("path")[0][1];
                    var y1 = svgObject.element.line1.attr("path")[0][2];
                    var x2 = svgObject.element.line2.attr("path")[1][1];
                    var y2 = svgObject.element.line2.attr("path")[1][2];
                    if (svgObject.element.line2.attr("path")[1].length > 3) {
                        x2 = svgObject.element.line2.attr("path")[1][5];
                        y2 = svgObject.element.line2.attr("path")[1][6];
                    }
                    px = svgObject.getTwoPointDistance(x1, y1, x2, y2);
                } else {
                    var x1 = svgObject.element.line1.attr("path")[0][1];
                    var y1 = svgObject.element.line1.attr("path")[0][2];
                    var x2 = svgObject.element.line1.attr("path")[1][1];
                    var y2 = svgObject.element.line1.attr("path")[1][2];
                    if (svgObject.element.line1.attr("path")[1].length > 3) {
                        x2 = svgObject.element.line1.attr("path")[1][5];
                        y2 = svgObject.element.line1.attr("path")[1][6];
                    }
                    px = svgObject.getTwoPointDistance(x1, y1, x2, y2);
                }
                var newText = (px * svgObject.scale).toFixed(2);

                var formatedText = SvgGlobalControllerLogic.formatMeasurementText(newText, svgObject.unit);
                svgObject.element.text.attr("text", formatedText);
                svgObject.element.text.data("Unit", svgObject.unit);
                svgObject.element.text.data("Scale", svgObject.scale);
                svgObject.update();
            });
        },


        // end of methods
    }

    return SvgMeasurementToolBasic;
})();