"use strict";

var SvgTextTag = (function () {

    function SvgTextTag(svgController, annotationId, type, pageNumber, element, rotation, dbobject, angle, maskids, handleids, controlboxids) {
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

    };

    SvgTextTag.prototype = {
        constructor: SvgTextTag,

        //===============================================
        //================== create =====================
        //===============================================

        beforeCreate: function () {

        },

        create: function () {
            var me = this;
            var that = me.svgController;

            var s = window.getSelection();
            if (s.rangeCount !== 0 && s.type !== "Caret") {
                var oRange = s.getRangeAt(0); //get the text range
                var oRect = oRange.getBoundingClientRect();



                // begin optimizing
                var rects = oRange.getClientRects();
                var currentPageNumber = me.pageNumber;
                var currentPageContainer = $("#pageContainer" + currentPageNumber);
                var margLeft = parseInt($(currentPageContainer).css("margin-left").replace('px', ''));
                //var marginLeft = parseInt($(currentPageContainer).css("margin-left").replace('px', ''));
                var borderLeft = parseInt($(currentPageContainer).css("border-left").replace('px', ''));
                //var marginTop = $("#viewerContainer").offset().top;
                var textLayer = $("#pageContainer" + currentPageNumber).children(".textLayer:first");
                var offsetTop = $(textLayer).offset().top;
                var offsetLeft = $(textLayer).offset().left;
                var scale = PDFViewerApplication.pdfViewer._currentScale;
                var paperWidth = parseInt(that.paper.width.replace("px", "")) / scale;
                var paperHeight = parseInt(that.paper.height.replace("px", "")) / scale;

                var texttagSet = that.paper.set();


                if (that.getPageRotation() % 180 === 0) {
                    rects = Array.from(rects).filter(s => s.height === rects[0].height);
                } else {
                    rects = Array.from(rects).filter(s => s.width === rects[0].width);
                }

                switch (that.getPageRotation()) {
                    case 0:
                        var img = that.paper.image(
                            '/Content/images/DocumentViewer/pinSelectedText.png',
                            (rects[0].left - offsetLeft) / scale - 25,
                            (rects[0].top - offsetTop) / scale - 12.5,
                            25,
                            25
                        );
                        img.attr({
                            opacity: 0.5,
                            text: that.getSelectedTextOnPdf(),
                            title: that.getSelectedTextOnPdf()
                        });
                        texttagSet.push(img);
                        for (var i = 0; i < rects.length; i++) {
                            var r = rects[i];
                            var rectTag = that.paper.rect(
                                (r.left - offsetLeft) / scale,
                                (r.top - offsetTop) / scale,
                                r.width / scale,
                                r.height / scale);
                            rectTag.attr({
                                fill: 'yellow',
                                opacity: 0.3,
                                stroke: '#009EE3',
                                'stroke-width': 1,
                                'stroke-dasharray': ""
                            });
                            texttagSet.push(rectTag);
                        }
                        break;
                    case 90:
                        var img = that.paper.image(
                            '/Content/images/DocumentViewer/pinSelectedText.png',
                            (rects[0].top - offsetTop) / scale - 25,
                            (paperHeight + (- rects[0].left + offsetLeft) / scale) - rects[0].width / scale - 12.5,
                            25,
                            25
                        );
                        img.attr({
                            opacity: 0.5,
                            text: that.getSelectedTextOnPdf(),
                            title: that.getSelectedTextOnPdf()
                        });
                        texttagSet.push(img);
                        for (var i = 0; i < rects.length; i++) {
                            var r = rects[i];
                            var rectTag = that.paper.rect(
                                (r.top - offsetTop) / scale,
                                (paperHeight + (- r.left + offsetLeft) / scale) - r.width / scale,
                                r.height / scale,
                                r.width / scale);
                            rectTag.attr({
                                fill: 'yellow',
                                opacity: 0.3,
                                stroke: '#009EE3',
                                'stroke-width': 1,
                                'stroke-dasharray': ""
                            });
                            texttagSet.push(rectTag);
                        }
                        break;
                    case 180:
                        var img = that.paper.image(
                            '/Content/images/DocumentViewer/pinSelectedText.png',
                            paperWidth - (rects[0].right - offsetLeft) / scale - 25,
                            paperHeight - (rects[0].bottom - offsetTop) / scale - 12.5,
                            25,
                            25
                        );
                        img.attr({
                            opacity: 0.5,
                            text: that.getSelectedTextOnPdf(),
                            title: that.getSelectedTextOnPdf()
                        });
                        texttagSet.push(img);
                        for (var i = 0; i < rects.length; i++) {
                            var r = rects[i];
                            var rectTag = that.paper.rect(
                                paperWidth - (r.right - offsetLeft) / scale,
                                paperHeight - (r.bottom - offsetTop) / scale,
                                r.width / scale,
                                r.height / scale);
                            rectTag.attr({
                                fill: 'yellow',
                                opacity: 0.3,
                                stroke: '#009EE3',
                                'stroke-width': 1,
                                'stroke-dasharray': ""
                            });
                            texttagSet.push(rectTag);
                        }
                        break;
                    case 270:
                        var img = that.paper.image(
                            '/Content/images/DocumentViewer/pinSelectedText.png',
                            paperWidth + (-rects[0].bottom + offsetTop) / scale - 25,
                            (rects[0].left - offsetLeft) / scale - 12.5,
                            25,
                            25
                        );
                        img.attr({
                            opacity: 0.5,
                            text: that.getSelectedTextOnPdf(),
                            title: that.getSelectedTextOnPdf()
                        });
                        texttagSet.push(img);
                        for (var i = 0; i < rects.length; i++) {
                            var r = rects[i];
                            var rectTag = that.paper.rect(
                                paperWidth + (-r.bottom + offsetTop) / scale,
                                (r.left - offsetLeft) / scale,
                                r.height / scale,
                                r.width / scale);
                            rectTag.attr({
                                fill: 'yellow',
                                opacity: 0.3,
                                stroke: '#009EE3',
                                'stroke-width': 1,
                                'stroke-dasharray': ""
                            });
                            texttagSet.push(rectTag);
                        }
                        break;
                }

                me.element = texttagSet;
                me.afterCreate(texttagSet);

            }
            that.stopDrawing();
            return texttagSet;


        },

        afterCreate: function (elementSet) {


            var me = this;
            var that = me.svgController;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((that.paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((that.paper.height).replace("px", "")) / currentScale;
            if (SvgGlobalControllerLogic.getSvgController(this.pageNumber).canvas.tempElement) SvgGlobalControllerLogic.getSvgController(this.pageNumber).canvas.tempElement.remove();

            var text = that.getSelectedTextOnPdf();

            var set = {
                DocumentAnnotationId: "00000000-0000-0000-0000-000000000000",
                AnnotationType: "texttag",
                ParentId: "", // not implemented yet
                DocumentVersionId: AnnotationApplication.documentVersionId,
                AnnotationName: "texttag",
                Text: text,
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
            AnnotationApplication.CRUDController.createAnnotation(
                set,
                function (response) {
                    // after
                    var parentId = response.DocumentAnnotationId;
                    me.annotationId = parentId;

                    LocalAnnotationsControllerLogic.addAnnotation(
                        AnnotationApplication.documentVersionId,
                        me.pageNumber,
                        set,
                        me);
                    SvgGlobalControllerLogic.addToAnnotations2(me.annotationId, me);

                    elementSet.forEach(function (el) {
                        if (el.type === "image") {
                            var image = {
                                DocumentAnnotationId: parentId,
                                AnnotationType: "texttagimage",
                                ParentId: parentId, // not implemented yet
                                DocumentVersionId: AnnotationApplication.documentVersionId,
                                Top: el.attr("y") / paperHeight,
                                Left: el.attr("x") / paperWidth,
                                Width: el.attr("width") / paperWidth,
                                Height: el.attr("height") / paperHeight,
                                Src: el.attr("src"),
                                Angle: el.getAngle() ? el.getAngle() : 0, // not implemented yet
                                AnnotationName: "texttagimage",
                                IsSelectable: true,
                                IsGroup: false, // not implemented yet
                                Scale: "",
                                Text: text,
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
                            el.data("DocumentAnnotationId", parentId);
                            el.data("PageId", image.PageId);
                            el.data("CreatedBy", image.CreatedBy);
                            el.data("CreatedOn", image.CreatedOn);
                            el.data("ModifiedBy", image.ModifiedBy);
                            el.data("ModifiedOn", image.ModifiedOn);

                            AnnotationApplication.CRUDController.createAnnotation(image, function (secResponse) {
                                el.data("DocumentAnnotationId", parentId);
                                el.data("PageId", secResponse.PageId);
                                el.data("CreatedBy", secResponse.CreatedBy);
                                el.data("CreatedOn", secResponse.CreatedOn);
                                el.data("ModifiedBy", secResponse.ModifiedBy);
                                el.data("ModifiedOn", secResponse.ModifiedOn);
                                console.log(el.getDocumentAnnotationId());
                            });
                        } else if (el.type === "rect") {
                            var svgRect = {
                                DocumentAnnotationId: parentId,
                                AnnotationType: "texttagrect",
                                ParentId: parentId, // not implemented yet
                                DocumentVersionId: AnnotationApplication.documentVersionId,
                                Fill: el.attr("fill"),
                                Stroke: el.attr("stroke"),
                                StrokeWidth: el.attr("stroke-width"),
                                Top: el.attr("y") / paperHeight,
                                Left: el.attr("x") / paperWidth,
                                Width: el.attr("width") / paperWidth,
                                Height: el.attr("height") / paperHeight,
                                Angle: 0, // not implemented yet
                                AnnotationName: "texttagrect",
                                Opacity: el.attr("opacity"),
                                IsSelectable: true,
                                IsGroup: false, // not implemented yet
                                Scale: "",
                                Text: text,
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

                            el.data("DocumentAnnotationId", parentId);
                            el.data("PageId", svgRect.PageId);
                            el.data("CreatedBy", svgRect.CreatedBy);
                            el.data("CreatedOn", svgRect.CreatedOn);
                            el.data("ModifiedBy", svgRect.ModifiedBy);
                            el.data("ModifiedOn", svgRect.ModifiedOn);
                            AnnotationApplication.CRUDController.createAnnotation(svgRect, function (secResponse) {
                                el.data("DocumentAnnotationId", parentId);
                                el.data("PageId", secResponse.PageId);
                                el.data("CreatedBy", secResponse.CreatedBy);
                                el.data("CreatedOn", secResponse.CreatedOn);
                                el.data("ModifiedBy", secResponse.ModifiedBy);
                                el.data("ModifiedOn", secResponse.ModifiedOn);
                                console.log(el.getDocumentAnnotationId());
                            });
                        }
                        el.data("DocumentAnnotationId", parentId);
                        el.mouseover(function (e) {
                            $(e.target).css("cursor", "pointer");
                        })
                            .mouseout(function (e) {
                                //console.log(e);
                                $(e.target).css("cursor", "default");
                            })
                            .mouseup(function (e) {
                                SvgGlobalControllerLogic.selectedObject = {
                                    element: element,
                                    svgController: that
                                };
                                if (e.which !== 3) SvgGlobalControllerLogic.allSelectedObjects = [];
                                elementSet.forEach(function (el) {
                                    SvgGlobalControllerLogic.allSelectedObjects.push({
                                        element: el,
                                        svgController: that
                                    });
                                });
                                var element = that.getElementByDocId(this.data("DocumentAnnotationId"));
                                that.mouseupHandler(e, element, element.paper, "texttag");
                                /*
                                var p1x=999999;
                                var p1y=999999;
                                var p2x=0;
                                var p2y = 0;
                                elementSet.forEach(function(el) {
                                    if(el.attr("x") < p1x) p1x = el.attr("x");
                                    if(el.attr("y") < p1y) p1y = el.attr("y");
                                    if(el.attr("height") + el.attr("y") > p2y) p2y = el.attr("height") + el.attr("y");
                                    if(el.attr("width") + el.attr("x") > p2x) p2x = el.attr("width") + el.attr("x");
                                });
                                that.paper.rect(p1x-2,p1y-2,p2x-p1x+4,p2y-p1y+4).attr({
                                    fill:'grey',
                                    opacity:0.1,
                                    stroke: '#009EE3',
                                    'stroke-width': 3,
                                    "stroke-dasharray": "-"
                                }).toBack().data("isCtrlBox", true);
                                */
                            })
                    });
                });



            if (that.isDrawing) that.stopDrawing();

        },




        


        //===============================================
        //================== save =======================
        //===============================================



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

        removeHandles: function () {

        },

        bindEvents: function () {
            
        },

        onClick: function (e) {
            
        },

        onElementDragging: function (dx, dy, x, y, e) {
          
        },

        onElementDragStart: function (x, y) {
            var that = this;

        },

        onElementDragEnd: function (e) {
          
            
        },

        onMouseUp: function (e) {
          
        },

        //===============================================
        //================== Controls ===================
        //===============================================

        showControlBox: function () {
          
        },

        showGlow: function () {
         
        },

        hideGlow: function () {
          
        },

        removeHandles: function () {
          
        },

        removeHandle: function (handle) {
            
        },

        createHandles: function () {
            
        },

        paste: function (e, pageNumber) {
            
        },

        createMask: function () {
           
        },

        deleteMask: function () {
            
        },

        // end of methods
    }

    return SvgTextTag;
})();