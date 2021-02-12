'use strict';
var CanvasController = (function CanvasControllerClosure() {

    function CanvasController() {
        //this.isEdit = false;
        this.activeCanvas = [];
        //this.annotationTask = false;
        //this.annotationTaskScrolled = false;

        this.isAnnotationRequestReceived = false;
        this.UpdateAnnotationQueue = [];

        this.isUserTyping = false;
    }

    CanvasController.prototype = {

        constructor: CanvasController,

        addActiveCanvas: function (canvasId) {
            if (!this.activeCanvas.includes(canvasId)) {
                this.activeCanvas.push(canvasId);
            }
        },

        removeActiveCanvas: function (canvasId) {
            if (this.activeCanvas.includes(canvasId)) {
                var index = this.activeCanvas.indexOf(canvasId);
                this.activeCanvas.splice(index, 1);
            }
        },

        removeGroup: function (group, canvas) {

        },

        modifyDisplayProperties: function (annotation) {

            var currentScale = PDFViewerApplication.pdfViewer.currentScale;

            if (annotation.annotationType === "measure") {
                if (typeof (annotation._objects) !== "undefined") {
                    //annotation._objects[0].display_points = annotation._objects[0].points;
                    annotation._objects[0].display_pageScale = currentScale;
                } else {
                    //annotation.objects[0].display_points = annotation._objects[0].points;
                    annotation.objects[0].display_pageScale = currentScale;
                }
            }

            annotation.set({
                display_sX: annotation.scaleX,
                display_sY: annotation.scaleY,
                display_top: annotation.top,
                display_left: annotation.left,
                display_width: annotation.display_width,
                display_height: annotation.display_height,
                display_pageScale: currentScale,
            });

            return annotation;
        },

        annotationScaleUtil: function (annotation, canvas) {
            console.log("deprecated function: ", annotation);
            console.trace();
            return annotation;
        },

        setCanvasDimensions: function (canvas, width, height) {

            canvas.setDimensions({
                width: width,
                height: height
            });

            return canvas;
        },

        scaleCanvas: function () {

            var visible = PDFViewerApplication.pdfViewer._getVisiblePages();
            var visiblePages = visible.views;
            var totalPagesVisible = visiblePages.length;
            var page;
            for (var i = 0; i < totalPagesVisible; i++) {
                page = visiblePages[i];
                try {
                    var canvas = $('#annotationCanvasPage_' + page.id)[0].fabric;
                    canvas.setZoom(PDFViewerApplication.pdfViewer.currentScale);
                }
                catch (e) {
                    console.log("zoom canceled, fabric canvas not set yet");
                }
            }

        },

        scaleAnnotations: function () {
            console.log("deprecated function. Exiting.");
            console.trace();
            return;
        },

        annotationSetPageDimensions: function (annotation, canvas) {

            var updated = false;

            var pdfPage = PDFViewerApplication.pdfViewer._pages[canvas.pageNumber - 1];

            if (!annotation.hasOwnProperty("pageWidth")) {
                annotation.pageWidth = parseFloat((pdfPage.width / pdfPage.scale).toFixed(2));
                updated = true;
            }

            if (!annotation.hasOwnProperty("pageHeight")) {
                annotation.pageHeight = parseFloat((pdfPage.height / pdfPage.scale).toFixed(2));
                updated = true;
            }

            return updated;
        },

        getNewShapeDetails: function (annotations, canvas, isEdit) {
            var objects = [];
            var reconstructedObjects = [];

            for (var i in annotations) {
                var push = true;
                var annotation = annotations[i];

                // Check if annotation hase page dimensions set
                // This code is to update existing annotations with page dimensions
                // At somepoint, we can delete this when we are confident all annotations have been updated in the database
                if (this.annotationSetPageDimensions(annotation, canvas)) {
                    //AnnotationApplication.CRUDController.updateAnnotation(annotation, null);
                }

                annotation.selectable = isEdit;
                annotation.lockMovementX = !isEdit;
                annotation.lockMovementY = !isEdit;
                annotation.hasBorders = isEdit;
                annotation.hasControls = isEdit;
                annotation.borderColor = '#0000ff';
                annotation.cornerColor = '#0000ff';
                annotation.angle = annotation.angle;


                //annotation = this.annotationScaleUtil(annotation, canvas);

                if (annotation.annotationType === "text") {
                    var reconstructedObject = new TextBoxReconstructor().ReconstructTextBox(annotation, canvas, isEdit);
                    reconstructedObject.borderColor = '#0000ff';
                    reconstructedObject.cornerColor = '#0000ff';
                    //reconstructedObjects.push({ reconstructedObject: reconstructedObject });
                    reconstructedObjects.push(reconstructedObject);
                    push = false;
                }

                if (annotation.annotationType === "callout") {
                    var reconstructedObject = new CalloutReconstructor().reconstructCallout(annotation, canvas, isEdit);
                    reconstructedObject.borderColor = '#0000ff';
                    reconstructedObject.cornerColor = '#0000ff';
                    //reconstructedObjects.push({ reconstructedObject: reconstructedObject });
                    reconstructedObjects.push(reconstructedObject);

                    push = false;
                }

                if (annotation.annotationType === "emsGroup" || annotation.annotationType === "ems") {
                    var reconstructedObject = new EMSGroupReconstructor().reconstructEmsGroup(annotation, canvas, isEdit);
                    reconstructedObject.borderColor = '#0000ff';
                    reconstructedObject.cornerColor = '#0000ff';
                    //reconstructedObjects.push({ reconstructedObject: reconstructedObject });
                    reconstructedObjects.push(reconstructedObject);
                    push = false;
                }

                if (annotation.annotationType === "measure") {
                    var reconstructedObject = new MeasurementToolReconstructor().reconstructMeasurement(annotation, canvas, isEdit);
                    //reconstructedObjects.push({ reconstructedObject: reconstructedObject });
                    reconstructedObjects.push(reconstructedObject);
                    push = false;
                }

                if (annotation.annotationType === "cloud") {
                    annotation.selectable = true;
                    annotation.lockMovementX = true;
                    annotation.lockMovementY = true;
                    annotation.hasBorders = true;
                    annotation.hasControls = false;
                    //annotation.originX = "left";
                    //annotation.originY = "top";
                    annotation.objectCaching = false;
                }

                if (push) {
                    objects.push(annotations[i]);
                }
            }

            // Build new shapeDetails with clean array
            var newShapeDetails = {
                "objects": objects,
                "background": ""
            }

            var newAnnotationObjects = {
                newShapeDetails: newShapeDetails,
                reconstructedObjects: reconstructedObjects,
            }

            return newAnnotationObjects;
        },

        getCanvases: function () {

            var canvases = [];

            for (var i = 0; i < this.activeCanvas.length; i++) {

                try {
                    var canvas = $('#' + this.activeCanvas[i])[0].fabric;
                    canvases.push(canvas);
                }
                catch (e) {
                    console.log("could not get canvases", e);
                }
            }

            return canvases;

        },

        getCurrentActiveObject: function () {
            return $("#annotationCanvasPage_" + PDFViewerApplication.page)[0].fabric.getActiveObject();
        },

        getCurrentCanvas: function () {
            return $("#annotationCanvasPage_" + PDFViewerApplication.page)[0];
        },

        deactivateAllCanvases: function () {
            var canvases = this.getCanvases();
            var length = canvases.length;
            for (var i = 0; i < length; i++) {
                this.setAnnotationEditMode(canvases[i], false);
            }
        },

        activateAllCanvases: function () {
            var canvases = this.getCanvases();
            var length = canvases.length;
            for (var i = 0; i < length; i++) {
                this.setAnnotationEditMode(canvases[i], true);
            }
        },

        setAnnotationEditMode: function (canvas, isEdit) {
            var scd = JSON.parse(JSON.stringify(canvas));
            var annotations = scd["objects"];
            //this.isEdit = isEdit;

            var newAnnotationObjects = this.getNewShapeDetails(annotations, canvas, isEdit);
            var newShapeDetails = newAnnotationObjects.newShapeDetails;
            var reconstructedObjects = newAnnotationObjects.reconstructedObjects;

            //AnnotationApplication.MeasurementUtils.mToolEdit = isEdit;

            canvas.clear();

            // Load the canvas
            canvas.loadFromJSON(JSON.stringify(newShapeDetails), function () {
                //canvas.clear();

                for (var i in reconstructedObjects) {
                    if (reconstructedObjects[i]) {
                        canvas.add(reconstructedObjects[i]);
                    }
                }

                canvas.renderAll();
            });

            canvas.renderAll();
        },

        //isEditMode: function CanvasController_isEditMode(canvas, isEdit) {
        //    return this.isEdit;
        //},

        scrollToAnnotation: function (annotationId, canvasId) {

            AnnotationApplication.scrollAnnotationId = annotationId;
            AnnotationApplication.scrollAnnotationCanvasId = canvasId;

            PDFViewerApplication.pdfViewer.currentPageNumber = parseInt(canvasId);

            var page = $("#pageContainer" + canvasId);
            var pageRendered = page.attr("data-loaded");

            if (pageRendered) {
                AnnotationApplication.CanvasController.scrollAnnotationUtil(annotationId, canvasId);
            }
        },

        scrollAnnotationUtil: function (annotationId, canvasId) {

            var annotation = AnnotationApplication.CanvasController.getAnnotationById(annotationId, canvasId);

            // Return if annotation is null
            if (!annotation) {
                return;
            }

            // Otherwise scroll to annotation
            var pdfPage = document.getElementById("pageContainer" + canvasId);
            var y_avg = annotation.aCoords.bl.y - Math.abs(annotation.aCoords.bl.y - annotation.aCoords.tl.y);
            var x_avg = annotation.aCoords.tl.x - Math.abs(annotation.aCoords.tr.x - annotation.aCoords.tl.x);

            var position = {
                top: y_avg * PDFViewerApplication.pdfViewer.currentScale,
                left: x_avg * PDFViewerApplication.pdfViewer.currentScale
            }
            PDFJS.scrollIntoView(pdfPage, position);

            AnnotationApplication.scrollAnnotationId = null;
            AnnotationApplication.scrollAnnotationCanvasId = null;
        },

        getAnnotationById: function (annotationId, canvasId) {
            var annotationId = annotationId;
            var canvas = this.getCanvasById(parseInt(canvasId));
            var annotations = null;
            var annotation = null;
            if (canvas) {
                // Get all annotations on canvas
                annotations = canvas.getObjects();

                // Loop through and find the specific annotation
                for (var i in annotations) {
                    var currentAnnotationId = annotations[i].DocumentAnnotationId;
                    if (currentAnnotationId === annotationId) {
                        annotation = annotations[i];
                    }
                }
            }

            // Return the found annotation
            return annotation;
        },

        RenderCanvasInSVG: function (pageNumber) {
            /*
            if (loadedModule === "EMS") {
                return;
            }
            $("canvas.annotationCanvasPage_" + pageNumber).addClass("hidden");
            $("canvas.annotationCanvasPage_" + pageNumber).css("pointer-events", "none");
            $("canvas.annotationCanvasPage_" + pageNumber).parent().css("pointer-events", "none");

            var canvas = this.getCanvasById(pageNumber);
            var canvasAsTemplate = $("#annotationCanvasPage_" + pageNumber);
            var marginTop = $(canvasAsTemplate).css("margin-top");
            var marginLeft = $(canvasAsTemplate).css("margin-left");

            if (!$("#pageContainer" + pageNumber).children(".textLayer:first").children("svg").length) {
                var parent = $("#pageContainer" + pageNumber).children(".textLayer:first");
                var txtLayerWidth = $(parent).css("width");
                var txtLayerHeight = $(parent).css("height");
                //var marginTop = $("#pageContainer" + pageNumber).children(".textLayer:first").css("margin-top");

                $(parent).prepend(canvas.toSVG({
                    suppressPreamble: true
                }));
                $(parent).children("svg:first").css("margin-top", marginTop);
                $(parent).children("svg:first").css("margin-left", marginLeft);
                //$(parent).children("svg:first").attr("width", txtLayerWidth);
                //$(parent).children("svg:first").attr("height", txtLayerHeight+marginTop);
                //$(parent).children("svg:first").css("position", "absolute");
                $(parent).css("opacity", "1");
                $(parent).children("svg:first").css("overflow", "visible");
            } else {
                var svgContent = $.parseHTML(canvas.toSVG({
                    suppressPreamble: true
                }));
                $("#pageContainer" + pageNumber)
                    .children(".textLayer:first")
                    .children("svg")
                    .html($(svgContent[0]).html());
            }
            var svgShapes = $("#pageContainer" + pageNumber).children(".textLayer:first").children("svg:first")
                .children();

            $(svgShapes).css("vector-effect", "non-scaling-stroke");

            

            $(svgShapes).mouseenter(function () {
                console.log("mouse enter");
                $("canvas.annotationCanvasPage_" + pageNumber).removeClass("hidden");
                $("canvas.annotationCanvasPage_" + pageNumber).css("pointer-events", "");
                $("canvas.annotationCanvasPage_" + pageNumber).parent().css("pointer-events", "");
                $("#pageContainer" + pageNumber).children(".textLayer:first").children("svg:first").remove();
                console.log("in Canvas Mode");
            });


            $(svgShapes).on("click", function () {
                console.log("mouse enter");
                $("canvas.annotationCanvasPage_" + pageNumber).removeClass("hidden");
                $("canvas.annotationCanvasPage_" + pageNumber).css("pointer-events", "");
                $("canvas.annotationCanvasPage_" + pageNumber).parent().css("pointer-events", "");
                $("#pageContainer" + pageNumber).children(".textLayer:first").children("svg:first").remove();
                console.log("in Canvas Mode");
            });


            //$(svgShapes).addEventListener('dragstart', function (e) {
            //    console.log(e);
            //});

            //$("button.annotation-icon-main-toolbar").click(function() {
            //    AnnotationApplication.CanvasController.toggleSvgToCanvas(pageNumber, true);
            //});

            */

            // initiate SvgController class




            if(SvgGlobalControllerLogic.canvases[pageNumber-1] === undefined){
                return;
            }

            var loadFlag = false;
            if (SvgGlobalControllerLogic.all.filter(s => s.page === pageNumber).length === 0) {
                loadFlag = true;
            }
            
            SvgControllerLogic = new SvgController(pageNumber);
            SvgControllerLogic.loadFromFabricJs(SvgGlobalControllerLogic.canvases[pageNumber - 1]._objects);
            if (loadFlag) {
                
                
            }else{
                
            }
            



/*
            SvgGlobalControllerLogic.canvases.forEach(function (c) {

                if (SvgGlobalControllerLogic.all.filter(s => s.pageNumber === c.pageNumber).length > 0) {
                    console.log("svgController already exist: " + c.pageNumber);
                } else {
                    console.log("new svgCOnreollwer: " + c.pageNumber);
                }


                if (getSvgController(c.pageNumber) === undefined || $("#raphael" + pageNumber).length === 0) {
                    if (AnnotationApplication.CanvasController.activeCanvas.includes("annotationCanvasPage_" + c.pageNumber)) {
                        SvgControllerLogic = new SvgController(c.pageNumber);
                        //getSvgController(c.pageNumber).canvas.loadFromFabricJs(AnnotationApplication.CanvasController.getCanvasById(c.pageNumber)._objects)
                        SvgControllerLogic.loadFromFabricJs(SvgGlobalControllerLogic.canvases[c.pageNumber - 1]._objects);
                    }

                }

            });
            */

            console.log("in SVG Mode");
            //AnnotationApplication.CanvasController.toggleSvgToCanvas(pageNumber, false);
            return $("#pageContainer" + pageNumber).children(".textLayer:first");
        },

        toggleSvgToCanvas: function (pageNumber, svgToCanvas) {
            if (svgToCanvas) {
                $("canvas.annotationCanvasPage_" + pageNumber).removeClass("hidden");
                $("canvas.annotationCanvasPage_" + pageNumber).css("pointer-events", "");
                $("canvas.annotationCanvasPage_" + pageNumber).parent().css("pointer-events", "");
                $("#pageContainer" + pageNumber).children(".textLayer:first").children("svg:first").remove();
            } else {
                $("canvas.annotationCanvasPage_" + pageNumber).addClass("hidden");
                $("canvas.annotationCanvasPage_" + pageNumber).css("pointer-events", "none");
                $("canvas.annotationCanvasPage_" + pageNumber).parent().css("pointer-events", "none");
            }
        },

        getCanvasById: function (canvasId) {
            var canvas = document.getElementById("annotationCanvasPage_" + canvasId);
            canvas = canvas !== null ? canvas.fabric : canvas;
            return canvas;
        },

        deleteAnnotationFromCanvas: function CanvasController_getCanvasById(annotationId, canvasId) {
            var canvas = this.getCanvasById(canvasId);

            if (canvas !== null) {
                canvas.remove(this.getAnnotationById(annotationId, canvasId));
            }

        },

        getSelectedTextOnPdf: function getSelectedTextOnPdf() {
            var text = "";
            if (window.getSelection) {
                text = window.getSelection().toString();
                if (window.getSelection().baseNode != null) {
                    var css = window.getSelection().baseNode.parentElement.style.cssText;
                    var leftTxt = css.split(';')[0];
                    var topTxt = css.split(';')[1];
                    //console.log(leftTxt + " - " + topTxt);
                }
            } else if (document.selection && document.selection.type != "Control") {
                text = document.selection.createRange().text;
            }



            return text;
        },

        drawSelectedText: function drawSelectedText() {
            //// refresh the canvas first (in case of scrolling)
            //AnnotationApplication.CanvasController.toggleSvgToCanvas(PDFViewerApplication.pdfViewer.currentPageNumber,
            //    true);


            var s = window.getSelection();
            var oRange = s.getRangeAt(0); //get the text range
            var oRect = oRange.getBoundingClientRect();

            var charsToRemoveFromFirstLine = s.anchorOffset;
            var charsTokeepFromLastLine = s.extentOffset;
            var intersectedDivs = [];

            var currentPageNumber = PDFViewerApplication.pdfViewer.currentPageNumber;
            var currentScale = PDFViewerApplication.pdfViewer._currentScale;
            var currentPageContainer = $("#pageContainer" + currentPageNumber);
            var marginLeft = parseInt($(currentPageContainer).css("margin-left").replace('px', ''));
            var borderLeft = parseInt($(currentPageContainer).css("border-left").replace('px', ''));
            var ViewContainerTop = parseInt($("#viewerContainer").css("top"));


            var currentCanvas = AnnotationApplication.CanvasController.getCurrentCanvas();
            var textLayer = $("#pageContainer" + currentPageNumber).children(".textLayer:first");
            var textLayerOffsetTop = $(textLayer).offset().top;

            //AnnotationApplication.DrawStateService.setDrawState("TEXTTAG");

            var divs = $(".textLayer").children("div");
            for (var i = 0; i < divs.length; i++) {
                if (oRange.intersectsNode(divs[i])) {
                    console.log(divs[i]);
                    intersectedDivs.push(divs[i]);

                }
            }


            AnnotationApplication.RenderDrawState.finalizeTextSelection(intersectedDivs, currentCanvas.fabric);

            //// refresh the canvas first (in case of scrolling)
            //AnnotationApplication.CanvasController.toggleSvgToCanvas(PDFViewerApplication.pdfViewer.currentPageNumber,
            //    true);
            //AnnotationApplication.CanvasController.RenderCanvasInSVG(PDFViewerApplication.pdfViewer.currentPageNumber);



            //// draw the first div
            //var firstDiv = intersectedDivs[0];
            //var first_totalNumberofChars = firstDiv.innerText.length;
            //var first_oRect = firstDiv.getBoundingClientRect();
            //var tempRec = {
            //    left: first_oRect.left - (marginLeft - borderLeft) - (first_oRect.left*(currentScale-1)),
            //    right: first_oRect.right,   
            //    top: first_oRect.top - textLayerOffsetTop - (first_oRect.top * (currentScale - 1)),
            //    height: first_oRect.height,
            //    width: first_oRect.width
            //}
            //var first_width = parseInt($(firstDiv).css("width").replace('px', ''));
            //tempRec.left += (first_width * (charsToRemoveFromFirstLine / first_totalNumberofChars));
            //tempRec.width -= (first_width * (charsToRemoveFromFirstLine / first_totalNumberofChars));
            //AnnotationApplication
            //    .RenderDrawState
            //    .initialize(currentCanvas.fabric, tempRec);

            //if (intersectedDivs.length > 1) {
            //    // draw the middle divs
            //    for (var i = 1; i < intersectedDivs.length - 1; i++) {
            //        var middle_oRect = intersectedDivs[i].getBoundingClientRect();
            //        tempRec = {
            //            left: middle_oRect.left - marginLeft - borderLeft - (first_oRect.left * (currentScale - 1)),
            //            right: middle_oRect.right,
            //            top: middle_oRect.top - textLayerOffsetTop - (first_oRect.top * (currentScale - 1)),
            //            height: middle_oRect.height,
            //            width: middle_oRect.width
            //        }
            //        AnnotationApplication
            //            .RenderDrawState
            //            .initialize(currentCanvas.fabric, tempRec);
            //    }

            //    // draw the last div
            //    var lastDiv = intersectedDivs[intersectedDivs.length - 1];
            //    var last_totalNumberofChars = lastDiv.innerText.length;
            //    var last_oRect = lastDiv.getBoundingClientRect();
            //    tempRec = {
            //        left: last_oRect.left - marginLeft - borderLeft - (first_oRect.left * (currentScale - 1)),
            //        right: last_oRect.right,
            //        top: last_oRect.top - textLayerOffsetTop - (first_oRect.top * (currentScale - 1)),
            //        height: last_oRect.height,
            //        width: last_oRect.width
            //    }
            //    var last_width = parseInt($(lastDiv).css("width").replace('px', ''));
            //    tempRec.width = (last_width * (charsTokeepFromLastLine / last_totalNumberofChars));
            //    AnnotationApplication
            //        .RenderDrawState
            //        .initialize(currentCanvas.fabric, tempRec);

            //    //AnnotationApplication
            //    //    .RenderDrawState
            //    //    .initialize(currentCanvas.fabric, oRect);
            //}
            //AnnotationApplication.RenderDrawState.stop(this);
        },

        //createNewSelectedTextTag: function(tagNumber, left, top, pageNumber, callback) {
        //    var canvas = AnnotationApplication.CanvasController.getCanvasById(pageNumber);
        //    var imageUrl = "https://cdn1.iconfinder.com/data/icons/mini-solid-icons-vol-1/16/43-256.png";

        //}

        setCanvasCursorDefault: function () {

            var visible = PDFViewerApplication.pdfViewer._getVisiblePages();
            var visiblePages = visible.views;
            var totalPagesVisible = visiblePages.length;
            var page;
            for (var i = 0; i < totalPagesVisible; i++) {
                page = visiblePages[i];
                try {
                    var canvas = $('#annotationCanvasPage_' + page.id)[0].fabric;
                    canvas.defaultCursor = "default";
                }
                catch (e) {
                    console.log("set cursor default canceled, fabric canvas not set yet");
                }
            }


        },

        setCanvasCursorCrosshair: function () {

            var visible = PDFViewerApplication.pdfViewer._getVisiblePages();
            var visiblePages = visible.views;
            var totalPagesVisible = visiblePages.length;
            var page;
            for (var i = 0; i < totalPagesVisible; i++) {
                page = visiblePages[i];
                try {
                    var canvas = $('#annotationCanvasPage_' + page.id)[0].fabric;
                    canvas.defaultCursor = "crosshair";
                }
                catch (e) {
                    console.log("set cursor crosshair canceled, fabric canvas not set yet");
                }
            }

        },

        //**********************************************************
        // Utility function to generate canvas settings
        // Returns an object with
        //  * width
        //  * height
        //  * pageIndex
        //  * DOM element where to append canvas
        // *********************************************************
        getCanvasSettings: function (pageNumber) {

            // Then get the height of the nav and tool bar to account for those pixels
            var navBarHeight = $("#document-top-nav").height();
            var toolbarHeight = $("#2DViewerToolbar").height();

            // Get the current visible dimensions of the browser window
            var visibleHeight = window.innerHeight - (navBarHeight + toolbarHeight);
            var visibleWidth = window.innerWidth;

            // Get the DOM element for current page - this has the page dimensions stored in it
            var pageContainer = document.getElementById("pageContainer" + pageNumber);

            // Extract the page dimensions from the DOM element
            var pdfWidth = pageContainer.clientWidth;
            var pdfHeight = pageContainer.clientHeight;

            // Large canvases consume lots of memory, so we only the canvas..
            // ..dimensions to be as big as what the user can see.

            // Start the canvas at the maximum PDF page dimensions
            var width = pdfWidth;
            var height = pdfHeight;

            // Then determine if the canvas should only be the size of the viewport
            if (pdfHeight > visibleHeight) {
                height = visibleHeight;
            }
            if (pdfWidth > visibleWidth) {
                width = visibleWidth;
            }

            return {
                width: width,
                height: height,
                pageIndex: pageNumber - 1,
                pageContainer: pageContainer
            };
        },

        makeJoint: function (left, top, annotation, index, canvas) {
            this.canvas = canvas;

            //var polygonCenter = poly.getCenterPoint();

            /*var translatedPoints = poly.get('points').map(function(p) {
                return {
                    x: polygonCenter.x + p.x,
                    y: polygonCenter.y + p.y
                };
            });
            console.log("translatedPoints in circle:", translatedPoints);*/

            // calculation based on drawing
            //var m = { x: canvas._offset.left, y: canvas._offset.top }
            //var cl = { x: annotation.left, y: annotation.top }
            //var cw = annotation.width;
            //var ch = annotation.height;
            //var p = { x: poly.left, y: poly.top }

            switch (annotation.annotationType) {
                case "callout":
                    var poly = annotation._objects[0];
                    left = poly.points[index].x - 10;
                    top = poly.points[index].y - 10;
                    break;
                case "cloud":
                    left = left - 10;
                    top = top - 10;
                    break;
            }

            var c = new fabric.Circle({
                left: left, //translatedPoints[index].x - m.x,
                top: top, //translatedPoints[index].y - m.y,
                strokeWidth: 2,
                radius: 10,
                opacity: 0.3,
                fill: 'yellow', //'#fff',
                stroke: '#666',
                annotationType: "joint",
                lockScalingX: true,
                lockScalingY: true,
                selectable: true,
                bringToFront: true,
                DocumentAnnotationId: -1
            });

            c.hasControls = c.hasBorders = false;
            c.annotationId = annotation.DocumentAnnotationId;
            c.index = index;

            return c;
        },

        displayPointToCanvasPointConverter: function (x, y) {
            var converted = AnnotationApplication.CanvasController.getCurrentCanvas().fabric.getPointer({
                clientX: tempRecLast.left,
                clientY: tempRecLast.top,
                target: AnnotationApplication.CanvasController.getCurrentCanvas().fabric.upperCanvasEl
            });

            x = converted.x;
            y = converted.y;
            return { x: x, y: y };
        },

        removeAllJoints: function (canvas) {
            var allJoints = canvas._objects.filter(function (obj) {
                return obj.annotationType === "joint";
            });

            allJoints.forEach(function (joint) {
                canvas.remove(joint);
            });
            console.log("cleaned all joints");
        },

        getallJoints: function (canvas) {
            var allJoints = canvas._objects.filter(function (obj) {
                return obj.annotationType === "joint";
            });
            return allJoints;
        },

        onJointDeselected: function (joint) {
            joint.set({
                fill: 'yellow'
            });
        },

        onJointSelected: function (joint) {
            joint.set({
                fill: 'blue'
            });
        },

        calculateArrowHeadAngle: function (p1, p2) {
            var dx = p2.x - p1.x;
            var dy = p2.y - p1.y;
            var angle = Math.atan2(dy, dx);
            angle *= 180 / Math.PI;
            angle -= 90;
            return angle;
        },

        calloutMovementHandler(joint, canvas) {

            var callout =
                AnnotationApplication.CanvasController.getAnnotationById(joint.annotationId,
                    canvas.pageNumber);

            var calloutTemp = callout;
            //ungrouping
            var items = callout._objects;
            callout._restoreObjectsState();
            canvas.remove(callout);
            for (var i = 0; i < items.length; i++) {

                if (items[i].annotationType === "calloutLine") {


                    items[i].points[joint.index].x = joint.left + joint.width / 2;
                    items[i].points[joint.index].y = joint.top + joint.width / 2;
                    //annotation.point1 = items[i].points[annotation.index];

                    // this recalculates the dimension
                    items[i]._calcDimensions();
                    items[i].set({
                        top: items[i].minY,
                        left: items[i].minX,
                        pathOffset: {
                            x: items[i].minX + items[i].width / 2,
                            y: items[i].minY + items[i].height / 2
                        }
                    });
                    items[i].dirty = true;
                    items[i].setCoords();


                    if (joint.index === 0) {
                        // recalculate the arrow as well
                        items[1].set({
                            top: joint.top + joint.width / 2,
                            left: joint.left + joint.width / 2,
                            angle: AnnotationApplication.CanvasController.calculateArrowHeadAngle(items[0].points[0], items[0].points[1])
                        });
                        items[1].dirty = true;
                        items[1].setCoords();

                    } else if (joint.index === 1) {
                        items[1].set({
                            angle: AnnotationApplication.CanvasController.calculateArrowHeadAngle(items[0].points[0], items[0].points[1])
                        });
                        items[1].dirty = true;
                        items[1].setCoords();

                    } else if (joint.index === 2) {
                        // recalculate the iText as well
                        items[2].set({
                            top: joint.top,
                            left: joint.left
                        });
                        items[2].dirty = true;
                        items[2].setCoords();
                    }


                    //annotation.point1 = items[i].points[annotation.index];
                }

                //that.canvas.add(items[i]);
                //that.canvas.item(that.canvas.size() - 1).hasControls = true;
            }

            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            // Make them a group
            var calloutGroup = new fabric.Group(items, {
                //hasControls: false,
                //hasBorders: true,
                annotationType: "callout",
                lockRotation: true,

                display_sX: 1,
                display_sY: 1,
                display_pageScale: 1,
                display_top: 0,
                display_left: 0,
                display_width: 0,
                display_height: 0,

                selectable: true,//callout.selectable,
                lockMovementX: true,//calloutTemp.lockMovementX,
                lockMovementY: true,//calloutTemp.lockMovementY,
                hasBorders: false,//calloutTemp.hasBorders,
                hasControls: false,//callout.hasControls,


                viewerScale: currentScale,
                annotationName: calloutTemp.annotationName,
                modified: true,
                DocumentAnnotationId: callout.DocumentAnnotationId
            });
            calloutGroup.setCoords();
            calloutGroup = AnnotationApplication.CanvasController.modifyDisplayProperties(calloutGroup);
            calloutGroup.on('mousedown', AnnotationApplication.CalloutUtils.fabricDblClick(calloutGroup, function (obj) {
                var drawState = AnnotationApplication.DrawStateService.getDrawState();
                if (drawState === "SELECT") {
                    AnnotationApplication.CalloutUtils.editCalloutText(obj, canvas);
                }
            }));

            calloutGroup.on('object:dblclick', function () {
                console.log("dblclick calloutGroup");
                var drawState = AnnotationApplication.DrawStateService.getDrawState();
                if (drawState === "SELECT" && !calloutGroup.lockMovementX) {
                    AnnotationApplication.CalloutUtils.editCalloutText(calloutGroup, canvas);
                }
            });

            canvas.add(calloutGroup);
            //that.canvas.sendBackwards(calloutGroup);
            canvas.item(canvas.size() - 1).hasControls = true;

            callout.dirty = true;

            canvas.renderAll();

            for (var j = 0; j < AnnotationApplication.CanvasController.UpdateAnnotationQueue.length; j++) {
                var item = AnnotationApplication.CanvasController.UpdateAnnotationQueue[j];
                if (item.DocumentAnnotationId === calloutGroup.DocumentAnnotationId) {

                }
            }

            var annToUpdate = AnnotationApplication.CanvasController.UpdateAnnotationQueue.filter(function (ann) {
                return ann.DocumentAnnotationId === calloutGroup.DocumentAnnotationId;
            });

            if (annToUpdate.length === 0) {
                AnnotationApplication.CanvasController.UpdateAnnotationQueue.push(calloutGroup);
            } else {
                annToUpdate.forEach(function (ann) {
                    //console.log("old: ", ann);
                    //console.log("new: ", calloutGroup);
                    //ann = calloutGroup;


                    var i = AnnotationApplication.CanvasController.UpdateAnnotationQueue.indexOf(ann);
                    if (i != -1) {
                        AnnotationApplication.CanvasController.UpdateAnnotationQueue.splice(i, 1);
                    }
                    AnnotationApplication.CanvasController.UpdateAnnotationQueue.push(calloutGroup);

                    console.log("object updated");
                });
            }



        },

        cloudMovementHandler(joint, canvas, finalRender) {

            var cloud =
                AnnotationApplication.CanvasController.getAnnotationById(joint.annotationId,
                    canvas.pageNumber);

            var cloudTemp = cloud;
            //ungrouping
            var mPoints = AnnotationApplication.CanvasController.getCloudMPoints(cloud);
            var newPath = [];
            mPoints.forEach(function (p) {
                var temp = [];
                temp[0] = "L";
                temp[1] = p.x;
                temp[2] = p.y;
                newPath.push(temp);
            });

            newPath[0][0] = "M";
            newPath[joint.index][1] = joint.left + 10;
            newPath[joint.index][2] = joint.top + 10;

            var minX = Math.min.apply(Math, newPath.map(p => p[1]).filter(function (p) { return p !== undefined }));
            var maxX = Math.max.apply(Math, newPath.map(p => p[1]).filter(function (p) { return p !== undefined }));

            var minY = Math.min.apply(Math, newPath.map(p => p[2]).filter(function (p) { return p !== undefined }));
            var maxY = Math.max.apply(Math, newPath.map(p => p[2]).filter(function (p) { return p !== undefined }));


            newPath.push(["z"]);



            cloud.set({
                //width: maxX-minX,
                //height: maxY - minY,
                path: newPath
            });
            //cloud._calcDimensions();
            //cloud._setPositionDimensions({});
            cloud.setCoords();
            cloud = AnnotationApplication.CanvasController.modifyDisplayProperties(cloud);

            cloud.setCoords();
            if (finalRender) {
                AnnotationApplication.CanvasController.cloudRedraw(cloud, canvas);
            } else {
                canvas.renderAll();
            }
        },

        cloudRedraw: function (cloud, canvas) {
            var oldPath = cloud.path;
            var points = AnnotationApplication.CanvasController.getCloudMPoints(cloud);

            var newPath = AnnotationApplication.CanvasController.calculatePath(points, cloud, { sx: cloud.getScaleX(), sy: cloud.getScaleY() });
            var path = AnnotationApplication.CanvasController.stringPathToArray2(newPath);

            cloud.path = path;

            var width = Math.max.apply(Math, points.map(p => p.x)) - Math.min.apply(Math, points.map(p => p.x));
            var height = Math.max.apply(Math, points.map(p => p.y)) - Math.min.apply(Math, points.map(p => p.y));
            var tempId = cloud.DocumentAnnotationId;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;

            //cloud._restoreObjectsState();
            canvas.remove(cloud);

            var arcs = new fabric.Path(path, {
                fill: "transparent",
                opacity: 1,
                strokeWidth: 3,
                stroke: '#ff0000',
                //selectable: false,
                //hasControls: false,
                //hasBorders: false,
                display_sX: 1,
                display_sY: 1,
                display_pageScale: 1,
                display_top: 0,
                display_left: 0,
                display_width: 0,
                display_height: 0,
                annotationType: "cloud",
                annotationName: "Cloud",
                DocumentAnnotationId: tempId,

                selectable: true,//callout.selectable,
                lockMovementX: true,//calloutTemp.lockMovementX,
                lockMovementY: true,//calloutTemp.lockMovementY,
                hasBorders: true,//calloutTemp.hasBorders,
                hasControls: false,//callout.hasControls,

                viewerScale: currentScale,
                modified: true,
                objectCaching: false
                //centeredScaling: true
            });
            arcs.setCoords();
            arcs = AnnotationApplication.CanvasController.modifyDisplayProperties(arcs);
            arcs.setCoords();
            canvas.add(arcs);


            canvas.renderAll();

            AnnotationApplication.CRUDController.updateAnnotation(arcs, function (response) {
                console.log("AnnotationUpdated: " + arcs.annotationType);
                //arcs = null;
            });
        },

        calculatePath: function (points, object, scale) {
            console.log("w:" + object.width + " - h:" + object.height);
            var previousX = 0, previousY = 0;
            var path = "";

            for (var k = 0; k < points.length; k++) {
                var currentPoint = points[k];
                var nextPoint = points[k + 1] ? points[k + 1] : points[0];

                var x1, x2, y1, y2, m, x, y;

                x1 = currentPoint.x, x2 = nextPoint.x;
                y1 = currentPoint.y, y2 = nextPoint.y;

                var xs = (x1 - x2) * scale.sx;
                var ys = (y1 - y2) * scale.sy;

                var d = Math.sqrt((xs * xs) + (ys * ys));
                var dt = 10;
                var delta = d % dt;
                if (d >= dt) {
                    if (previousX === 0) {
                        previousX = x1;
                    }
                    if (previousY === 0) {
                        previousY = y1;
                    }


                    // Q: What is '|' character at the end?
                    // this is for letting the other function split the string
                    // and create an array from the splited string
                    path += "M " + previousX + ", " + previousY + "|";

                    //var swap = polygon.containsPoint(new fabric.Point((x1+x2)/2 + 10, (y1+y2)/2 + 10)) ? 0 : 1;
                    //console.log(swap);

                    //for (var i = 0; i <= d + dt; i = i + dt) {
                    for (var i = 0; i <= d + 1; i = i + dt) {

                        var t = i / d;
                        var xt = ((1 - t) * x1) + (t * x2);
                        var yt = ((1 - t) * y1) + (t * y2);

                        var angleDeg = Math.atan2(yt - y1, xt - x1) * 180 / Math.PI;
                        var randomNumber = Math.random() * (100 - 45) + 45;
                        //path += "A 10 45 " + angleDeg + " 0 1 " + xt + " " + yt + "|";


                        if (d > dt)
                            path += "A 10 " + randomNumber + " " + angleDeg + " 0 1 " + xt + " " + yt + "|";

                        //path += "C " + xt + "," + yt;

                        previousX = xt;
                        previousY = yt;

                    }
                } else {
                    path += "L " + x2 + " " + y2;

                }

            }

            return path;
        },


        //calculatePathByC: function (points, object, scale){
        //    // M 25, 50 C 25, 100 150, 100 150, 50 C 150, 100 275, 100 275, 50
        //    var path = "";
        //    for (var k = 0; k < points.length; k++) {
        //        var currentMPoint = points[k];
        //        var nextMPoint = points[k + 1] ? points[k + 1] : points[0];

        //        var x1, x2, y1, y2, m, x, y;

        //        x1 = currentMPoint.x, x2 = nextMPoint.x;
        //        y1 = currentMPoint.y, y2 = nextMPoint.y;

        //        var xs = (x1 - x2);
        //        var ys = (y1 - y2);

        //        var distance = Math.sqrt((xs * xs) + (ys * ys));

        //        var radius = (distance/10)/2;

        //        path += "M " + points[k].x + " " + points[k].y + "|";

        //        for (var i = 0; i <= distance + radius*2; i = i + radius*2) {

        //            var t = i / distance;
        //            var xt = ((1 - t) * x1) + (t * x2);
        //            var yt = ((1 - t) * y1) + (t * y2);

        //            var p1 = {x: }

        //            path += "C " + xt + "," + yt;

        //            previousX = xt;
        //            previousY = yt;

        //        }

        //    }

        //    return path;
        //},

        //recalculateAngle: function(pathObject) {

        //    var path = pathObject.path;
        //    var pointIndex = [];
        //    for (var i = 0; i < path.length; i++) {
        //        if (path[i][0] === "M") {
        //            pointIndex.push(i);
        //        }
        //    }

        //    var index = 0;

        //    for (var i = 0; i < path.length; i++) {
        //        var startP = path[pointIndex[index]];
        //        if (index + 1 === pointIndex.length) {
        //            index = 0;
        //        }
        //        var endP = path[pointIndex[index + 1]];

        //        if (path[i][0] === "A") {
        //            var x1 = parseFloat(startP[1]);
        //            var y1 = parseFloat(startP[2]);
        //            var x2 = parseFloat(endP[1]);
        //            var y2 = parseFloat(endP[2]);
        //            console.log(Math.atan2(Math.abs(y2 - y1), Math.abs(x2 - x1)) * 180 / Math.PI);
        //            path[i][3] = (Math.atan2(Math.abs(y2 - y1), Math.abs(x2 - x1)) * 180 / Math.PI) + 90;
        //        } else {
        //            index++;
        //        }
        //    }

        //    return path;

        //},


        //stringPathToArray: function (newPath) {
        //    var commandLengths = {
        //        m: 2,
        //        l: 2,
        //        h: 1,
        //        v: 1,
        //        c: 6,
        //        s: 4,
        //        q: 4,
        //        t: 2,
        //        a: 7
        //    };
        //    var repeatedCommands = {
        //        m: 'l',
        //        M: 'L'
        //    };
        //    var result = [],
        //        coords = [],
        //        currentPath,
        //        parsed,
        //        re = /([-+]?((\d+\.\d+)|((\d+)|(\.\d+)))(?:e[-+]?\d+)?)/ig,
        //        match,
        //        coordsStr;
        //    for (var i = 0, coordsParsed, len = newPath.length; i < len; i++) {
        //        currentPath = newPath[i];
        //        coordsStr = currentPath.slice(1).trim();
        //        coords.length = 0;
        //        while ((match = re.exec(coordsStr))) {
        //            coords.push(match[0]);
        //        }
        //        coordsParsed = [currentPath.charAt(0)];
        //        for (var j = 0, jlen = coords.length; j < jlen; j++) {
        //            parsed = parseFloat(coords[j]);
        //            if (!isNaN(parsed)) {
        //                coordsParsed.push(parsed);
        //            }
        //        }
        //        var command = coordsParsed[0],
        //            commandLength = commandLengths[command.toLowerCase()],
        //            repeatedCommand = repeatedCommands[command] || command;
        //        if (coordsParsed.length - 1 > commandLength) {
        //            for (var k = 1, klen = coordsParsed.length; k < klen; k += commandLength) {
        //                result.push([command].concat(coordsParsed.slice(k, k + commandLength)));
        //                command = repeatedCommand;
        //            }
        //        }
        //        else {
        //            result.push(coordsParsed);
        //        }
        //    }
        //    return result;
        //},


        stringPathToArray2: function (newPath) {
            var splitedPath = newPath.split('|');
            var pathArr = [];

            splitedPath.forEach(function (l) {
                l = l.replace(',', ' ');
                l = l.replace('  ', ' ');
                var lArr = l.split(' ');

                for (var i = 1; i < lArr.length; i++) {
                    lArr[i] = parseInt(lArr[i]);
                }

                pathArr.push(lArr);
            });
            pathArr = pathArr.splice(0, pathArr.length - 1);
            return pathArr;
        },

        cloudResizeHandler(cloud, canvas) {

            var tempCloud = cloud;

            var points = cloud.path.filter(function (p) {
                return p[0] === "M";
            }).map(p => new fabric.Point(p[1], p[2]));

            var oldPath = cloud.path;
            var localPoints = cloud.toLocalPoint(points[0], cloud.originX, cloud.originY);
            var newPath = AnnotationApplication.CanvasController.calculatePath(points);

            var arcTemplate = new fabric.Path(newPath, {
                fill: "transparent",
                opacity: 1,
                strokeWidth: 3,
                stroke: '#ff0000',
                //selectable: false,
                //hasControls: false,
                //hasBorders: false,
                display_sX: 1,
                display_sY: 1,
                display_pageScale: 1,
                display_top: 0,
                display_left: 0,
                display_width: 0,
                display_height: 0,
                annotationType: "cloud",
                annotationName: "Cloud",
                DocumentAnnotationId: -1
            });

            //cloud.path = arcTemplate.path;
            var dims = cloud._parseDimensions();
            cloud.setWidth(dims.width);
            cloud.setHeight(dims.height);
            cloud.pathOffset.x = cloud.width / 2;
            cloud.pathOffset.y = cloud.height / 2;
            cloud.setCoords();

            cloud.dirty = true;
            //canvas.renderAll();

        },

        getCloudMPoints: function (cloud, canvas) {
            var points = cloud.path.filter(function (p) {
                return (p[0] === "M" || p[0] === "L");
            }).map(p => new fabric.Point(p[1], p[2]));

            return points;
        },

        //*********************************************************
        // This method gets all visible canvases, destroyes them,
        // and generates a fresh canvas with the latest annotations
        // -Shawn
        //***********************************************************
        refreshVisibleCanvases: function () {
            if (typeof PDFViewerApplication !== "undefined") {
                // First lets get the number of visible pages
                var visiblePages = PDFViewerApplication.pdfViewer._getVisiblePages();
                // Loop through each visible page
                for (var i in PDFViewerApplication.pdfViewer._getVisiblePages().views) {

                    // Set our current page number
                    var pageNumber = visiblePages.views[i].id;

                    // Remove the old canvas for the current page
                    $("#annotationCanvasPage_" + pageNumber).remove();

                    // Generate new canvas.
                    // This will also get the latest annotations and append the canvas in the right location
                    //new AnnotationCanvas(this.getCanvasSettings(pageNumber));
                }
            }
        }

    }

    return CanvasController;
})();
