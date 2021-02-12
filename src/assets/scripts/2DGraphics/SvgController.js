"use strict";

var SvgController = (function () {

    function SvgController(pageNumber, isCutPlane) {
        //AnnotationApplication.Utils.enableAll();

        if (typeof LocalAnnotationsControllerLogic !== 'undefined' && LocalAnnotationsControllerLogic === null) {
            LocalAnnotationsControllerLogic = new LocalAnnotationsController();
        }



        //console.log("creating SvgController for : " + pageNumber);
        if (typeof isCutPlane === "undefined") {
        if (SvgGlobalControllerLogic.all.filter(s => s.page === pageNumber).length === 0) {
            SvgGlobalControllerLogic.all.push({
                page: pageNumber,
                canvas: this,
                documentVersionId: AnnotationApplication.documentVersionId
            });
        } else {
            //console.log("existing svgController: " + pageNumber);
            SvgGlobalControllerLogic.all[pageNumber - 1] = {
                page: pageNumber,
                canvas: this,
                documentVersionId: AnnotationApplication.documentVersionId
            }
            $("#raphael" + pageNumber).remove();
            /*
            if (true) {
                SvgController.getAnnotationByPageNumber(pageNumber);
            }
            */
        }

        if (typeof scrollPdfToPageNumber !== "undefined" && scrollPdfToPageNumber !== 0 && SvgGlobalControllerLogic.all.filter(s => s.page === scrollPdfToPageNumber).length > 0) {
            // in case of todo which navigates to the annotation
            if (scrollPdfToPageNumber !== PDFViewerApplication.pdfViewer.currentPageNumber) {
                //window.localStorage.pdfjs.history.files[0].page = scrollPdfToPageNumber

                PDFViewerApplication.pdfViewer.scrollPageIntoView({
                    pageNumber: scrollPdfToPageNumber
                });

                scrollPdfToPageNumber = 0;
            }
        }
    }
        this.dbAnnotations = [];
        this.contextMenu = null;
        this.scale = null;
        this.unit = null;
        this.pageNumber = pageNumber;
       

        this.MeasurementSets = [];

        // drawing
        this.isDrawing = false;
        this.currentDrawingType = "";
        this.drawingType = "";
        this.tempElement = null;
        this.tempSet = null;
        this.uploadedImage = null;
        this.isDragging = false;

        this.maskedElement = null;
        this.maskedElementOpacity = 1;
        this.maskedElementFill = null;
        this.textboxDefaultText = "";
        this.calloutDefaultText = "";

        // temp variables
        this.clickedPoints = [];
        this.tempMouseMovePoint = {
            x: null,
            y: null
        };
        this.polylineStartingPoint = null;

        if(typeof isCutPlane === "undefined"){
            this.width = $("#pageContainer" + pageNumber).children(".textLayer:first").css("width");
            this.height = $("#pageContainer" + pageNumber).children(".textLayer:first").css("height");
            $("#pageContainer" + pageNumber).children(".textLayer").prepend('<div id="raphael' + pageNumber + '" class="raphael"></div>');
            console.log("created raphael" + pageNumber);
       
            this.paper = Raphael(document.getElementById("raphael" + pageNumber), this.width, this.height);
        }else{
            // this.width = $("#cutplaneviewer").children().children(".textLayer:last").css("width");
            // this.height = $("#pageContainer" + pageNumber).children(".textLayer:first").css("height");
            this.width = "900px";
            this.height = "470px";
           // this.height = ($("#cutplaneviewer").children().children(".textLayer:last").css("height").replace('px', '') - 62)+"px";
            $("#cutplaneviewer").children().children(".textLayer").prepend('<div id="raphael' + pageNumber + '" class="raphael"></div>');
            console.log("created raphael" + pageNumber);

            //this.paper = isCutPlane.raphael(document.getElementById("raphael" + pageNumber), this.width, this.height);
       
            this.paper = Raphael(document.getElementById("raphael" + pageNumber), this.width, this.height);
        }
         
        var currentScale = (typeof PDFViewerApplication !== 'undefined')?PDFViewerApplication.pdfViewer.currentScale : 1;
        this.paper.setViewBox(0, 0, this.width.replace('px', '') / currentScale, this.height.replace('px', '') / currentScale);
        //this.paper.setSize(this.width.replace('px', '') * this.scale, this.height.replace('px', '')*this.scale);
        $("#raphael" + pageNumber).css("position", "absolute");


        var thatController = this;
        if(typeof isCutPlane === "undefined"){
            $(this.paper.canvas).mousemove(function (e) {
                try {
                    //console.log(thatController.drawingType);
                    ////console.log(e);
                    SvgGlobalControllerLogic.activePageNumber = thatController.pageNumber;
                    this.pageNumber = thatController.pageNumber;//SvgController.getCurrentSvgCanvasPage(this);
                    thatController.tempMouseMovePoint = thatController.getXY(e, 1 / thatController.getScale());

                    if (thatController.isDrawing) {
                        var previous_tempMouseMovePoint = thatController.tempMouseMovePoint;



                        $(thatController.paper.canvas).css("cursor", "crosshair");

                        //getSvgController(this.pageNumber ).canvas.tempMouseMovePoint = fCanvas.getPointer(e);

                        switch (thatController.drawingType) {
                            case "line":
                                if (thatController.clickedPoints.length === 1 && thatController.isDragging) {
                                    if (thatController.tempElement) thatController.tempElement.remove();
                                    // thatController.tempElement = thatController.drawLine(
                                    //     thatController.clickedPoints[0].x,
                                    //     thatController.clickedPoints[0].y,
                                    //     thatController.tempMouseMovePoint.x,
                                    //     thatController.tempMouseMovePoint.y,
                                    //     false
                                    // )

                                    thatController.tempElement = new SvgLine(
                                        thatController,
                                        null,
                                        "line",
                                        thatController.pageNumber,
                                        null,
                                        0,
                                        null);
        
                                    thatController.tempElement
                                        .draw(
                                            thatController.clickedPoints[0].x,
                                            thatController.clickedPoints[0].y,
                                            thatController.tempMouseMovePoint.x,
                                            thatController.tempMouseMovePoint.y,
                                            );
                                }
                                break;
                            case "measurementbasic":
                                if (thatController.clickedPoints.length === 1 && thatController.isDragging) {
                                    if (SvgGlobalControllerLogic.isShiftKeyPressed && false) {
                                        var ln = thatController.tempElement.items.filter(el => el.type === "path");
                                        var x1 = thatController.clickedPoints[0].x;
                                        var y1 = thatController.clickedPoints[0].y;
                                        var x2 = ln[0].attr("path")[1][1];
                                        var y2 = ln[0].attr("path")[1][2];

                                        var dx = x2 - x1;
                                        var dy = y2 - y1;
                                        var m = dy / dx;
                                        var b = y1 - m * x1;

                                        thatController.tempMouseMovePoint.y = m * thatController.tempMouseMovePoint.x + b;
                                    }

                                    if (thatController.tempElement !== null ) thatController.tempElement.remove();

                                    // thatController.tempElement = thatController.drawMeasurementbasic(
                                    //     thatController.clickedPoints[0].x,
                                    //     thatController.clickedPoints[0].y,
                                    //     thatController.tempMouseMovePoint.x,
                                    //     thatController.tempMouseMovePoint.y,
                                    //     "top",
                                    //     null,
                                    //     false
                                    // );

                                    thatController.tempElement = new SvgMeasurementToolBasic(
                                        thatController,
                                        null,
                                        "measurementbasic",
                                        thatController.pageNumber,
                                        null,
                                        0,
                                        null
                                    );
                                    thatController.tempElement.draw(
                                        thatController.clickedPoints[0].x,
                                        thatController.clickedPoints[0].y,
                                        thatController.tempMouseMovePoint.x,
                                        thatController.tempMouseMovePoint.y,
                                        "top",
                                        null,
                                        null,
                                        false
                                    );
                                }
                                break;
                            case "polyline":
                                if (thatController.clickedPoints.length > 0) {
                                    if (thatController.tempElement) thatController.tempElement.remove();
                                    var tempClickedPoints = [];
                                    Array.prototype.push.apply(tempClickedPoints, thatController.clickedPoints);
                                    tempClickedPoints.push({
                                        x: thatController.tempMouseMovePoint.x,
                                        y: thatController.tempMouseMovePoint.y
                                    });
                                    //thatController.tempElement = thatController.drawPolyline(tempClickedPoints, false, false);
                                    thatController.tempElement = new SvgPolyline(
                                        thatController,
                                        null,
                                        "polyline",
                                        thatController.pageNumber,
                                        null,
                                        0,
                                        null
                                    );
                                    thatController.tempElement.draw(tempClickedPoints, false, false);
                                    //thatController.tempElement.toBack();
                                }
                                break;
                            case "cloud":
                                if (thatController.clickedPoints.length > 0) {
                                    if (thatController.tempElement) thatController.tempElement.remove();
                                    var tempClickedPoints = [];
                                    Array.prototype.push.apply(tempClickedPoints, thatController.clickedPoints);
                                    tempClickedPoints.push({
                                        x: thatController.tempMouseMovePoint.x,
                                        y: thatController.tempMouseMovePoint.y
                                    });
                                    //thatController.tempElement = thatController.drawCloud(tempClickedPoints, false, false);
                                    thatController.tempElement = new SvgCloud(
                                        thatController,
                                        null,
                                        "cloud",
                                        thatController.pageNumber,
                                        null,
                                        0,
                                        null
                                    );
                                    thatController.tempElement.draw(tempClickedPoints, false, false);
                                    //thatController.tempElement.element.toBack();
                                }
                                break;
                            case "rect":
                                if (thatController.clickedPoints.length > 0) {
                                    if (thatController.tempElement) thatController.tempElement.remove();
                                    var tempClickedPoints = [];
                                    Array.prototype.push.apply(tempClickedPoints, thatController.clickedPoints);
                                    // thatController.tempElement = thatController
                                    //     .drawRect(
                                    //         Math.min(thatController.clickedPoints[0].x, thatController.tempMouseMovePoint.x),
                                    //         Math.min(thatController.clickedPoints[0].y, thatController.tempMouseMovePoint.y),
                                    //         Math.abs(thatController.tempMouseMovePoint.x - thatController.clickedPoints[0].x),
                                    //         Math.abs(thatController.tempMouseMovePoint.y - thatController.clickedPoints[0].y),
                                    //         false);

                                    thatController.tempElement = new SvgRect(
                                        thatController,
                                        null,
                                        "rect",
                                        thatController.pageNumber,
                                        null,
                                        0,
                                        null,
                                        0,
                                        [],
                                        [],
                                        []);

                                    thatController.tempElement
                                        .draw(
                                            Math.min(thatController.clickedPoints[0].x, thatController.tempMouseMovePoint.x),
                                            Math.min(thatController.clickedPoints[0].y, thatController.tempMouseMovePoint.y),
                                            Math.abs(thatController.tempMouseMovePoint.x - thatController.clickedPoints[0].x),
                                            Math.abs(thatController.tempMouseMovePoint.y - thatController.clickedPoints[0].y),
                                            );


                                    //thatController.tempElement.toBack();
                                }
                                break;
                            case "emselement":
                                    if (thatController.clickedPoints.length > 0) {
                                        if (Array.isArray(thatController.tempElement)){
                                            thatController.tempElement.forEach(el=>el.remove());
                                        } else if (thatController.tempElement) {
                                            thatController.tempElement.remove();
                                        }
                                        
                                        var tempClickedPoints = [];
                                        Array.prototype.push.apply(tempClickedPoints, thatController.clickedPoints);
                                        thatController.tempElement = [];

                                        let nodesLength = AnnotationApplication.DrawStateService.emsNodes.length;
                                        if (nodesLength>1){
                                            nodesLength -= 1;
                                        }
                                        const dX = (thatController.tempMouseMovePoint.x - thatController.clickedPoints[0].x)/nodesLength;
                                        const dY = (thatController.tempMouseMovePoint.y - thatController.clickedPoints[0].y)/nodesLength;
                                        const nodeEndX = thatController.tempMouseMovePoint.x;
                                        const nodeEndY = thatController.tempMouseMovePoint.y;
                                        for (let nodeCount = 0; nodeCount < AnnotationApplication.DrawStateService.emsNodes.length; nodeCount++){
                                            const nodeX = nodeEndX - nodeCount * dX;
                                            const nodeY = nodeEndY - nodeCount * dY;
                                            const node = AnnotationApplication.DrawStateService.emsNodes[nodeCount];
                                            let emsGroup = new SvgEmsGroup(
                                                thatController,
                                                null,
                                                "emsgroup",
                                                thatController.pageNumber,
                                                null,
                                                thatController.getPageRotation(),
                                                null,
                                                AnnotationApplication.DrawStateService.emsNodes[nodeCount].id
                                            );
                                            emsGroup.draw(
                                                nodeX,
                                                nodeY,
                                                    0,
                                                    0,
                                                    AnnotationApplication.DrawStateService.emsNodes[nodeCount].id,
                                                    false,
                                                    false,
                                                    null  
                                                )
                                            thatController.tempElement.push(emsGroup);
                                        }  
                                    }      

                                    break;
                            case "emsgroup":
                                if (thatController.clickedPoints.length > 0) {
                                    if (thatController.tempElement) thatController.tempElement.remove();
                                    var tempClickedPoints = [];
                                    Array.prototype.push.apply(tempClickedPoints, thatController.clickedPoints);

                                    var emsGroup = new SvgEmsGroup(
                                        thatController,
                                        null,
                                        "emsgroup",
                                        thatController.pageNumber,
                                        null,
                                        thatController.getPageRotation(),
                                        null
                                    );
                                    emsGroup.draw(
                                            Math.min(thatController.clickedPoints[0].x, thatController.tempMouseMovePoint.x),
                                            Math.min(thatController.clickedPoints[0].y, thatController.tempMouseMovePoint.y),
                                            Math.abs(thatController.tempMouseMovePoint.x - thatController.clickedPoints[0].x),
                                            Math.abs(thatController.tempMouseMovePoint.y - thatController.clickedPoints[0].y),
                                            AnnotationApplication.DrawStateService.emsNodes[0].id,
                                            false,
                                            false,
                                            null  
                                        )
                                        thatController.tempElement = emsGroup;

                                }
                                break;
                            case "defect":
                                    if (thatController.clickedPoints.length > 0) {
                                        if (Array.isArray(thatController.tempElement)){
                                            thatController.tempElement.forEach(el=>el.remove());
                                        } else if (thatController.tempElement) {
                                            thatController.tempElement.remove();
                                        }
                                        
                                        var tempClickedPoints = [];
                                        Array.prototype.push.apply(tempClickedPoints, thatController.clickedPoints);
                                        thatController.tempElement = [];

                                        let nodesLength = AnnotationApplication.DrawStateService.emsNodes.length;
                                        if (nodesLength>1){
                                            nodesLength -= 1;
                                        }
                                        const dX = (thatController.tempMouseMovePoint.x - thatController.clickedPoints[0].x)/nodesLength;
                                        const dY = (thatController.tempMouseMovePoint.y - thatController.clickedPoints[0].y)/nodesLength;
                                        const nodeEndX = thatController.tempMouseMovePoint.x;
                                        const nodeEndY = thatController.tempMouseMovePoint.y;
                                        for (let nodeCount = 0; nodeCount < AnnotationApplication.DrawStateService.emsNodes.length; nodeCount++){
                                            const nodeX = nodeEndX - nodeCount * dX;
                                            const nodeY = nodeEndY - nodeCount * dY;
                                            const node = AnnotationApplication.DrawStateService.emsNodes[nodeCount];
                                            const newDefect = new SvgDefect(
                                                thatController,
                                                null,
                                                "defect",
                                                thatController.pageNumber,
                                                null,
                                                -thatController.getPageRotation(),
                                                null,
                                                thatController.getPageRotation(),
                                                AnnotationApplication.DrawStateService.emsNodes[nodeCount].id
                                            );
                                            newDefect.draw(
                                                "",
                                                nodeX,
                                                nodeY,
                                                    0,
                                                    0,
                                                )
                                            thatController.tempElement.push(newDefect);
                                        }  
                                    }      

                                    break;
                            case "highlight":
                                if (thatController.clickedPoints.length > 0) {
                                    if (thatController.tempElement) thatController.tempElement.remove();
                                    var tempClickedPoints = [];
                                    Array.prototype.push.apply(tempClickedPoints, thatController.clickedPoints);
                                    thatController.tempElement = new SvgHighlight(
                                        thatController,
                                        null,
                                        "highlight",
                                        thatController.pageNumber,
                                        null,
                                        0,
                                        null,
                                        0,
                                        [],
                                        [],
                                        []);

                                    thatController.tempElement
                                        .draw(
                                            Math.min(thatController.clickedPoints[0].x, thatController.tempMouseMovePoint.x),
                                            Math.min(thatController.clickedPoints[0].y, thatController.tempMouseMovePoint.y),
                                            Math.abs(thatController.tempMouseMovePoint.x - thatController.clickedPoints[0].x),
                                            Math.abs(thatController.tempMouseMovePoint.y - thatController.clickedPoints[0].y),
                                            );
                                }
                                break;
                            case "circ":
                                if (thatController.clickedPoints.length > 0) {
                                    if (thatController.tempElement) thatController.tempElement.remove();
                                    var tempClickedPoints = [];
                                    Array.prototype.push.apply(tempClickedPoints, thatController.clickedPoints);

                                    var a = thatController.tempMouseMovePoint.x - thatController.clickedPoints[0].x;
                                    var b = thatController.tempMouseMovePoint.y - thatController.clickedPoints[0].y;
                                    var r = Math.sqrt(a * a + b * b);

                                    // thatController.tempElement = thatController
                                    //     .drawCircle(
                                    //         thatController.clickedPoints[0].x,
                                    //         thatController.clickedPoints[0].y,
                                    //         r,
                                    //         r,
                                    //         false);

                                        thatController.tempElement = new SvgCircle(
                                            thatController,
                                            null,
                                            "circ",
                                            thatController.pageNumber,
                                            null,
                                            0,
                                            null,
                                            0,
                                            [],
                                            [],
                                            []);
    
                                        thatController.tempElement
                                            .draw(
                                                thatController.clickedPoints[0].x,
                                                thatController.clickedPoints[0].y,
                                                r,
                                                r
                                                );
                                    //thatController.tempElement.toBack();
                                }
                                break;
                            case "callout":
                                if (thatController.clickedPoints.length > 0) {
                                    if (thatController.tempElement !== null && thatController.tempElement.type === "set") thatController.tempElement.forEach(function (element) {
                                        element.remove();
                                    });
                                    if (thatController.tempElement) thatController.tempElement.forEach(function(el){el.remove()});
                                    var tempClickedPoints = [];
                                    Array.prototype.push.apply(tempClickedPoints, thatController.clickedPoints);
                                    tempClickedPoints.push({
                                        x: thatController.tempMouseMovePoint.x,
                                        y: thatController.tempMouseMovePoint.y
                                    });
                                   // var txt = "Type here ...";
                                    // if (kendo.culture().name === "de-DE") {
                                    //     txt = "Tippe hier ein ...";
                                    // }
                                    //thatController.drawCallout(tempClickedPoints, txt, false, 10, true, thatController.getPageRotation());
                                    var callout = new SvgCallout(
                                        thatController,
                                            null,
                                            "callout",
                                            thatController.pageNumber,
                                            null,
                                            thatController.getPageRotation(),
                                            null
                                    );
                                    if(thatController.clickedPoints.length === 3){
                                        callout.create(
                                            tempClickedPoints, SvgControllerLogic.calloutDefaultText, false, 10, true, thatController.getPageRotation()
                                            );
                                    }else{
                                        callout.draw(
                                            tempClickedPoints, SvgControllerLogic.calloutDefaultText, false, 10, true, thatController.getPageRotation()
                                            );
                                    }
                                }
                                break;
                            case "freeDraw":
                                if (thatController.clickedPoints.length > 0) {
                                    thatController.clickedPoints.push(thatController.getXY(e, 1 / thatController.getScale()));
                                    if (thatController.tempElement) thatController.tempElement.remove();
                                    //thatController.tempElement = thatController.drawFreeDraw(thatController.clickedPoints, false);
                                    thatController.tempElement = new SvgFreeDraw(
                                        thatController,
                                        null,
                                        "freeDraw",
                                        thatController.pageNumber,
                                        null,
                                        0,
                                        null,
                                        0,
                                        [],
                                        [],
                                        []);

                                    thatController.tempElement
                                        .draw(thatController.clickedPoints);
                                        thatController.tempElement.element.attr({
                                            stroke: SvgGlobalControllerLogic.freeDrawProperties.color,
                                            "stroke-width": SvgGlobalControllerLogic.freeDrawProperties.strokeWidth
                                        });
                                    console.log("freeDraw ==> dragging");
                                }
                                break;
                        }
                    }

                    if (thatController.drawingType === "selectall" && !thatController.isDrawing) {
                        console.log(thatController.drawingType);
                        if (thatController.tempElement !== null) {

                            thatController.tempElement.remove();
                            var x = thatController.clickedPoints[0].x - thatController.tempMouseMovePoint.x > 0 ? thatController.tempMouseMovePoint.x : thatController.clickedPoints[0].x;
                            var y = thatController.clickedPoints[0].y - thatController.tempMouseMovePoint.y > 0 ? thatController.tempMouseMovePoint.y : thatController.clickedPoints[0].y;
                            var w = Math.max(thatController.clickedPoints[0].x, thatController.tempMouseMovePoint.x) - Math.min(thatController.clickedPoints[0].x, thatController.tempMouseMovePoint.x);
                            var h = Math.max(thatController.clickedPoints[0].y, thatController.tempMouseMovePoint.y) - Math.min(thatController.clickedPoints[0].y, thatController.tempMouseMovePoint.y);

                            thatController.tempElement = thatController.paper.rect(x, y, w, h).attr({
                                opacity: 0.2,
                                fill: "blue"
                            });
                        }
                    }
                } catch (ex) {
                    console.error("MouseMove Error");
                }
            });

            $(this.paper.canvas).mousedown(function (e) {
                try {
                    // close context menu if it is open
                    $(".annotationContextMenu").remove();

                    thatController.isDragging = true;
                    if (thatController.isDrawing && ["rect", "circ", "highlight", "freeDraw", "emselement", "emsgroup", "defect", "measurementbasic", "line"].indexOf(thatController.drawingType) !== -1) {
                        //if (e.currentTarget === thatController.paper.canvas) {
                        thatController.clickedPoints.push(thatController.getXY(e, 1 / thatController.getScale()));
                        console.log("freeDraw ==> started");
                    } else if (!thatController.isDrawing && e.target.localName === "svg" && e.which !== 3) {
                        if (thatController.contextMenu) {
                            thatController.contextMenu.destroyContextMenu();
                        }
                        //console.log(thatController.drawingType);
                        // disable the properties button as no element is selected
                        //AnnotationApplication.Toolbar.widget.enable("#TwoDSettingsButton", false);
                        thatController.clearAllCtrlBoxes();
                        thatController.clearAllJoints();
                        thatController.clearAllSelectedText();
                        thatController.clickedPoints.push(thatController.getXY(e, 1 / thatController.getScale()));
                        $("#raphael" + thatController.pageNumber).parent().children("div:not(:first-child)").addClass("hidden");
                        thatController.drawingType = "selectall";
                        thatController.tempElement = thatController.paper.rect(thatController.clickedPoints.x, thatController.clickedPoints.y, 0, 0);
                    }
                } catch (ex) {
                    console.error("MouseDown Error");
                }
            });

            this.selectBoxedFlag = false;
            $(this.paper.canvas).mouseup(function (e) {
                try {
                    //if (e.currentTarget === thatController.paper.canvas) {
                    thatController.isDragging = false;
                    if (thatController.clickedPoints.length === 0 && ["polyline", "line", "cloud", "measurementbasic"].indexOf(thatController.drawingType) !== -1) {
                        thatController.clickedPoints.push(thatController.getXY(e, 1 / thatController.getScale()));
                        if (["polyline", "cloud"].includes(thatController.drawingType)) {
                            thatController.polylineStartingPoint = thatController.paper.circle(e.offsetX / thatController.getScale(), e.offsetY / thatController.getScale(), 10 / thatController.getScale())
                                .attr({
                                    fill: 'red',
                                    stroke: 'red',
                                    'stroke-width': 5 / thatController.getScale()
                                })
                                .mouseup(function (e) {
                                    if (["polyline", "cloud"].indexOf(thatController.drawingType) !== -1) {
                                        console.log("end polyline/cloud!");
                                        switch (thatController.drawingType) {
                                            case "polyline":
                                                thatController.clickedPoints.push(thatController.clickedPoints[0]);
                                                //thatController.drawPolyline(thatController.clickedPoints, true, true);
                                                thatController.tempElement.remove();
                                                // thatController.tempElement = new SvgPolyline(
                                                //     thatController,
                                                //     null,
                                                //     "polyline",
                                                //     thatController.pageNumber,
                                                //     null,
                                                //     0,
                                                //     null
                                                // );
                                                thatController.tempElement.create(thatController.clickedPoints, true, true);
                                                break;
                                            case "cloud":
                                                //thatController.drawCloud(thatController.clickedPoints, true, true);
                                                thatController.tempElement.remove();
                                                thatController.tempElement = new SvgCloud(
                                                    thatController,
                                                    null,
                                                    "cloud",
                                                    thatController.pageNumber,
                                                    null,
                                                    0,
                                                    null
                                                );
                                                thatController.tempElement.create(thatController.clickedPoints, true, true);
                                                break;
                                        }

                                        thatController.stopDrawing();
                                        //if (thatController.tempElement) thatController.tempElement.remove();
                                        this.remove();
                                        $("#raphael" + thatController.pageNumber).parent().children("div:not(:first-child)").removeClass("hidden");
                                    }
                                })
                                .toFront();
                        }


                    } else if (thatController.clickedPoints.length > 0 && ["line", "measurementbasic"].indexOf(thatController.drawingType) !== -1) {
                        thatController.clickedPoints.push(thatController.getXY(e, 1 / thatController.getScale()));

                        if (thatController.drawingType === "line") {
                            if (thatController.tempElement) thatController.tempElement.remove();
                            // thatController.drawLine(
                            //     thatController.clickedPoints[0].x,
                            //     thatController.clickedPoints[0].y,
                            //     thatController.clickedPoints[1].x,
                            //     thatController.clickedPoints[1].y,
                            //     true
                            // )
                            thatController.tempElement = new SvgLine(
                                thatController,
                                null,
                                "line",
                                thatController.pageNumber,
                                null,
                                0,
                                null);

                            thatController.tempElement
                                .create(
                                    thatController.clickedPoints[0].x,
                                    thatController.clickedPoints[0].y,
                                    thatController.clickedPoints[1].x,
                                    thatController.clickedPoints[1].y
                                    );
                        } else if (thatController.drawingType === "measurementbasic") {
                            if (SvgGlobalControllerLogic.isShiftKeyPressed && false) {
                                var ln = thatController.tempElement.items.filter(el => el.type === "path");
                                var ln = thatController.tempElement.items.filter(el => el.type === "path");
                                var x1 = thatController.clickedPoints[0].x;
                                var y1 = thatController.clickedPoints[0].y;
                                var x2 = ln[0].attr("path")[1][5];
                                var y2 = ln[0].attr("path")[1][6];

                                var dx = x2 - x1;
                                var dy = y2 - y1;
                                var m = dy / dx;
                                var b = y1 - m * x1;

                                thatController.clickedPoints[1].y = m * thatController.clickedPoints[1].x + b;
                            }
                            if (thatController.tempElement) thatController.tempElement.remove();
                            // thatController.drawMeasurementbasic(
                            //     thatController.clickedPoints[0].x,
                            //     thatController.clickedPoints[0].y,
                            //     thatController.clickedPoints[1].x,
                            //     thatController.clickedPoints[1].y,
                            //     "top",
                            //     null,
                            //     null,
                            //     true
                            // )
                            thatController.tempElement = new SvgMeasurementToolBasic(
                                thatController,
                                null,
                                "measurementbasic",
                                thatController.pageNumber,
                                null,
                                0,
                                null
                            );
                            thatController.tempElement.create(
                                thatController.clickedPoints[0].x,
                                thatController.clickedPoints[0].y,
                                thatController.tempMouseMovePoint.x,
                                thatController.tempMouseMovePoint.y,
                                "top",
                                null,
                                null,
                                true
                            );
                        }
                        thatController.stopDrawing();
                    } else if (["polyline", "cloud"].indexOf(thatController.drawingType) !== -1) {
                        thatController.clickedPoints.push(thatController.getXY(e, 1 / thatController.getScale()));
                    } else if (["rect", "highlight", "emsgroup"].indexOf(thatController.drawingType) !== -1) {
                        thatController.clickedPoints.push(thatController.getXY(e, 1 / thatController.getScale()));
                        
                        let emsNodeId = '';
                        if (thatController.tempElement) {
                            thatController.tempElement.remove();
                            emsNodeId = thatController.tempElement.emsNodeId;
                        }
                        
                        var tempClickedPoints = [];
                        Array.prototype.push.apply(tempClickedPoints, thatController.clickedPoints);
                        if (thatController.drawingType === "rect") {
                            // thatController.tempElement = thatController
                            //     .drawRect(
                            //         Math.min(thatController.clickedPoints[0].x, thatController.clickedPoints[1].x),
                            //         Math.min(thatController.clickedPoints[0].y, thatController.clickedPoints[1].y),
                            //         Math.abs(thatController.clickedPoints[1].x - thatController.clickedPoints[0].x),
                            //         Math.abs(thatController.clickedPoints[1].y - thatController.clickedPoints[0].y),
                            //         true);

                            thatController.tempElement = new SvgRect(
                                thatController,
                                null,
                                "rect",
                                thatController.pageNumber,
                                null,
                                0,
                                null,
                                0,
                                [],
                                [],
                                []);

                            thatController.tempElement
                                .create(
                                    Math.min(thatController.clickedPoints[0].x, thatController.tempMouseMovePoint.x),
                                    Math.min(thatController.clickedPoints[0].y, thatController.tempMouseMovePoint.y),
                                    Math.abs(thatController.tempMouseMovePoint.x - thatController.clickedPoints[0].x),
                                    Math.abs(thatController.tempMouseMovePoint.y - thatController.clickedPoints[0].y),
                                    );
                        } else if (thatController.drawingType === "emsgroup") {

                                    var emsGroup = new SvgEmsGroup(
                                        thatController,
                                        null,
                                        "emsgroup",
                                        thatController.pageNumber,
                                        null,
                                        thatController.getPageRotation(),
                                        null
                                    );
                                    emsGroup.create(
                                            Math.min(thatController.clickedPoints[0].x, thatController.tempMouseMovePoint.x),
                                            Math.min(thatController.clickedPoints[0].y, thatController.tempMouseMovePoint.y),
                                            Math.abs(thatController.tempMouseMovePoint.x - thatController.clickedPoints[0].x),
                                            Math.abs(thatController.tempMouseMovePoint.y - thatController.clickedPoints[0].y),
                                            emsNodeId,
                                            false,
                                            false,
                                            null  
                                        )
                                        thatController.stopDrawing();
                        } else if (thatController.drawingType === "highlight") {
                            thatController.tempElement = new SvgHighlight(
                                thatController,
                                null,
                                "highlight",
                                thatController.pageNumber,
                                null,
                                0,
                                null,
                                0,
                                [],
                                [],
                                []);

                            thatController.tempElement
                                .create(
                                    Math.min(thatController.clickedPoints[0].x, thatController.tempMouseMovePoint.x),
                                    Math.min(thatController.clickedPoints[0].y, thatController.tempMouseMovePoint.y),
                                    Math.abs(thatController.tempMouseMovePoint.x - thatController.clickedPoints[0].x),
                                    Math.abs(thatController.tempMouseMovePoint.y - thatController.clickedPoints[0].y),
                                    );
                        }
                        thatController.stopDrawing();
                    } else if (["circ"].indexOf(thatController.drawingType) !== -1) {
                        thatController.clickedPoints.push(thatController.getXY(e, 1 / thatController.getScale()));
                        if (thatController.tempElement) thatController.tempElement.remove();
                        var tempClickedPoints = [];
                        Array.prototype.push.apply(tempClickedPoints, thatController.clickedPoints);
                        var a = thatController.tempMouseMovePoint.x - thatController.clickedPoints[0].x;
                        var b = thatController.tempMouseMovePoint.y - thatController.clickedPoints[0].y;
                        var r = Math.sqrt(a * a + b * b);

                        // thatController.tempElement = thatController
                        //     .drawCircle(
                        //         thatController.clickedPoints[0].x,
                        //         thatController.clickedPoints[0].y,
                        //         r,
                        //         r,
                        //         true);

                                thatController.tempElement = new SvgCircle(
                                    thatController,
                                    null,
                                    "circ",
                                    thatController.pageNumber,
                                    null,
                                    0,
                                    null,
                                    0,
                                    [],
                                    [],
                                    []);
    
                                thatController.tempElement
                                    .create(
                                        thatController.clickedPoints[0].x,
                                        thatController.clickedPoints[0].y,
                                        r,
                                        r,
                                        );

                        thatController.stopDrawing();
                    } else if (["text", "emselement"].indexOf(thatController.drawingType) !== -1) {
                        thatController.clickedPoints.push(thatController.getXY(e, 1 / thatController.getScale()));
                        
                        if (thatController.drawingType === "emselement" ){
                        if (Array.isArray(thatController.tempElement)){
                            thatController.tempElement.forEach(el=>el.remove());
                        } else if (thatController.tempElement) {
                            thatController.tempElement.remove();
                        }
                        
                        let nodesLength = AnnotationApplication.DrawStateService.emsNodes.length;
                        if (nodesLength>1){
                            nodesLength -= 1;
                        }

                        const dX = (thatController.tempMouseMovePoint.x - thatController.clickedPoints[0].x)/nodesLength;
                        const dY = (thatController.tempMouseMovePoint.y - thatController.clickedPoints[0].y)/nodesLength;
                        const nodeEndX = thatController.tempMouseMovePoint.x;
                        const nodeEndY = thatController.tempMouseMovePoint.y;
                        for (let nodeCount = 0; nodeCount < AnnotationApplication.DrawStateService.emsNodes.length; nodeCount++){
                            const nodeX = nodeEndX - nodeCount * dX;
                            const nodeY = nodeEndY - nodeCount * dY;
                            const node = AnnotationApplication.DrawStateService.emsNodes[nodeCount];
                            let emsGroup = new SvgEmsGroup(
                                thatController,
                                null,
                                "emsgroup",
                                thatController.pageNumber,
                                null,
                                thatController.getPageRotation(),
                                null,
                                AnnotationApplication.DrawStateService.emsNodes[nodeCount].id
                            );
                            emsGroup.create(
                                nodeX,
                                nodeY,
                                0,
                                0,
                                AnnotationApplication.DrawStateService.emsNodes[nodeCount].id,
                                true,
                                true
                            );
                        }        
                    
                    } else if (thatController.drawingType === "text") {
                            // thatController.tempElement = thatController
                            //     .drawText(
                            //         thatController.clickedPoints[0].x,
                            //         thatController.clickedPoints[0].y,
                            //         GetResourceString('ClickType'),
                            //         true,
                            //         10);

                            thatController.tempElement = new SvgTextbox(
                                thatController,
                                null,
                                "textbox",
                                SvgControllerLogic.textboxDefaultText,
                                thatController.pageNumber,
                                null,
                                thatController.getPageRotation(),
                                null);
                            
                            thatController.tempElement
                                .create(
                                    thatController.clickedPoints[0].x,
                                    thatController.clickedPoints[0].y,
                                    SvgControllerLogic.textboxDefaultText,
                                    10);
                        }

                        thatController.clickedPoints = [];
                        thatController.stopDrawing();
                    } else if (["stamp"].indexOf(thatController.drawingType) !== -1) {
                        var stampUrl = AnnotationApplication.DrawStateService.stampUrl;
                        //var stampUrl = AnnotationApplication.DrawStateService.getStampState();
                        thatController.clickedPoints.push(thatController.getXY(e, 1 / thatController.getScale()));
                        if (thatController.tempElement) thatController.tempElement.remove();
                        // thatController.tempElement = thatController
                        //     .drawStamp(
                        //         stampUrl,
                        //         thatController.clickedPoints[0].x,
                        //         thatController.clickedPoints[0].y,
                        //         67, 20,
                        //         true);

                                thatController.tempElement = new SvgStamp(
                                    thatController,
                                    null,
                                    "stamp",
                                    thatController.pageNumber,
                                    null,
                                    -thatController.getPageRotation(),
                                    null,
                                    0
                                );

                            thatController.tempElement.create(
                                stampUrl,
                                thatController.clickedPoints[0].x,
                                thatController.clickedPoints[0].y,
                                67,
                                20);
                        thatController.clickedPoints = [];
                        thatController.stopDrawing();
                    } else if (["defect"].indexOf(thatController.drawingType) !== -1) {
                        var stampUrl = AnnotationApplication.DrawStateService.getStampState();
                        thatController.clickedPoints.push(thatController.getXY(e, 1 / thatController.getScale()));
                        
                        if (Array.isArray(thatController.tempElement)){
                            thatController.tempElement.forEach(el=>el.remove());
                        } else if (thatController.tempElement) {
                            thatController.tempElement.remove();
                        }

                                thatController.tempElement = new SvgDefect(
                                    thatController,
                                    null,
                                    "defect",
                                    thatController.pageNumber,
                                    null,
                                    -thatController.getPageRotation(),
                                    null,
                                    thatController.getPageRotation(),
                                    AnnotationApplication.DrawStateService.emsNodes[0].id
                                );

                            thatController.tempElement.create(
                                "",
                                thatController.clickedPoints[0].x,
                                thatController.clickedPoints[0].y,
                                20,
                                20);
                        thatController.clickedPoints = [];
                        thatController.stopDrawing();
                    } else if (["image"].indexOf(thatController.drawingType) !== -1) {
                        var img = thatController.uploadedImage;
                        thatController.clickedPoints.push(thatController.getXY(e, 1 / thatController.getScale()));
                        if (thatController.tempElement) thatController.tempElement.remove();

                        var width = img.width;
                        var height = img.height;


                        $.ajax({
                            type: "GET",
                            headers: {
                                Authorization: "Bearer " + window.AuthenticationToken
                            },
                            url: "/api/Document/GetHiddenTHREEDAnnotationFolder/" + ProjectId,
                            contentType: "application/json; charset=utf-8",
                            dataType: "json",
                            headers: {
                                Authorization: "Bearer " + window.AuthenticationToken
                            },
                            success: function (response) {
                                var documentApiModel = {
                                    Name: documentVersionExternalId,
                                    ParentId: response.DocumentId
                                }
                              
                                $.ajax({
                                    type: "POST",
                                    url: "/api/Document/FindOrCreateFolder/",
                                    data: JSON.stringify(documentApiModel),
                                    headers: {
                                        Authorization: "Bearer " + window.AuthenticationToken
                                    },
                                    contentType: "application/json; charset=utf-8",
                                    dataType: "json",
                                    success: function (response, data, document) {

                                        var upload = (new FileUpload(false));
                                        upload.startUpload({
                                            file: img,
                                            parentId: response.DocumentId,
                                            data: {},
                                            complete: function (response, data, document) { 
                                            },
                                            success: function (response, data, document) {
                                                var url = "/api/Document/GetPresignedURL/" + response.Document.DocumentId + "/" + response.Document.Extensions[0].replace(".", "")
                                                var childDocumentId = response.Document.DocumentId;
                                                $.ajax({
                                                    url: url,
                                                    type: "GET",
                                                    dataType: "json",
                                                    headers: {
                                                        Authorization: "Bearer " + window.AuthenticationToken
                                                    },
                                                    success: function (response) {
                                                        var width = 0;
                                                        var height = 0;
                                                        var img = new Image();
                                                        img.onload = function () {
                                                            width = img.width;
                                                            height = img.height;

                                                            // thatController.tempElement = thatController
                                                            //     .drawImage(
                                                            //         url,
                                                            //         response,
                                                            //         thatController.clickedPoints[0].x,
                                                            //         thatController.clickedPoints[0].y,
                                                            //         width,
                                                            //         height,
                                                            //         childDocumentId,
                                                            //         true);

                                                            thatController.tempElement = new SvgImage(
                                                                thatController,
                                                                null,
                                                                "image",
                                                                thatController.pageNumber,
                                                                null,
                                                                -thatController.getPageRotation(),
                                                                null,
                                                                0
                                                            );
                                                            if(thatController.clickedPoints[0] !== null) {
                                                            thatController.tempElement.create(
                                                                url,
                                                                response,
                                                                thatController.clickedPoints[0].x,
                                                                thatController.clickedPoints[0].y,
                                                                width,
                                                                height,
                                                                childDocumentId,
                                                                true
                                                            );
                                                            }

                                                            thatController.clickedPoints = [];
                                                            thatController.stopDrawing();
                                                        };
                                                        img.src = response;
                                                    },
                                                    error: function (response) {
                                                        console.log(response);
                                                    }
                                                });
                                            },
                                            error: function (response, data) {
                                             }
                                        });
                                    }
                                });
                            }
                        });
                    } else if (["callout"].includes(thatController.drawingType) && !thatController.isMobileDevice()) {
                        thatController.clickedPoints.push(thatController.getXY(e, 1 / thatController.getScale()));
                        //var txt = "Type here ...";
                        // if (kendo.culture().name === "de-DE") {
                        //     txt = "Tippe hier ein ...";
                        // }
                        //thatController.drawCallout(thatController.clickedPoints, txt, false, 10, true, thatController.getPageRotation());

                        var callout = new SvgCallout(
                            thatController,
                                null,
                                "callout",
                                thatController.pageNumber,
                                null,
                                thatController.getPageRotation(),
                                null
                        );
                        if(thatController.clickedPoints.length === 4){
                            callout.create(
                                thatController.clickedPoints, SvgControllerLogic.calloutDefaultText, false, 10, true, thatController.getPageRotation()
                                );
                        }else{
                            callout.draw(
                                thatController.clickedPoints, SvgControllerLogic.calloutDefaultText, false, 10, true, thatController.getPageRotation()
                                );
                        }
                        
                    } else if (["freeDraw"].includes(thatController.drawingType)) {
                        thatController.clickedPoints.push(thatController.getXY(e, 1 / thatController.getScale()));
                        if (thatController.tempElement) thatController.tempElement.remove();
                        //thatController.drawFreeDraw(thatController.clickedPoints, true);
                        thatController.tempElement = new SvgFreeDraw(
                            thatController,
                            null,
                            "freeDraw",
                            thatController.pageNumber,
                            null,
                            0,
                            null,
                            0,
                            [],
                            [],
                            []);

                        thatController.tempElement
                            .create(thatController.clickedPoints);
                        thatController.clickedPoints = [];
                        thatController.tempElement = null;
                        //thatController.stopDrawing();
                        console.log("freeDraw ==> stopped");
                    }

                    if (e.target.localName === "svg") {
                        if (e.which === 3) {
                          //  if (thatController.contextMenu) {
                          //      thatController.contextMenu.destroyContextMenu();
                          //}
                          SvgGlobalControllerLogic.openContextMenu(e, thatController);
                            //thatController.rightClickHandler(e.target, thatController.paper, e);
                        }
                    }

                    if (thatController.drawingType === "selectall") {
                        //console.log(thatController.drawingType);
                        var tempClicked = thatController.getXY(e, 1 / thatController.getScale());
                        if (thatController.tempElement !== null) {
                            //try {
                            thatController.drawingType = "select";
                            var x = thatController.clickedPoints[0].x - tempClicked.x > 0 ? tempClicked.x : thatController.clickedPoints[0].x;
                            var y = thatController.clickedPoints[0].y - tempClicked.y > 0 ? tempClicked.y : thatController.clickedPoints[0].y;
                            var w = Math.max(thatController.clickedPoints[0].x, tempClicked.x) - Math.min(thatController.clickedPoints[0].x, tempClicked.x);
                            var h = Math.max(thatController.clickedPoints[0].y, tempClicked.y) - Math.min(thatController.clickedPoints[0].y, tempClicked.y);
                            thatController.tempElement.remove();
                            thatController.tempElement = thatController.paper.rect(x, y, w, h);
                            var selectedItems = thatController.detectSelectedObjects(thatController.tempElement);



                            var ids = [];
                            selectedItems.forEach(function(raphaelObj){
                                
                                var id = raphaelObj.getDocumentAnnotationId();
                                if(ids.indexOf(id) !== -1){

                                }else if(typeof id !== 'undefined'){
                                    ids.push(id);
                                }
                            });
                                console.log("selected ids: ", ids);
                               SvgGlobalControllerLogic.selectedIds2 = ids;


                                Object.keys(SvgGlobalControllerLogic.annotations2).forEach(function(id){
                                    SvgGlobalControllerLogic.annotations2[id].removeHandles();
                                });


                            SvgGlobalControllerLogic.allSelectedObjects = selectedItems;
                            selectedItems.forEach(function (annotation) {
                                SvgGlobalControllerLogic.isCtrlKeyPressed = true;
                                if (thatController.tempElement !== annotation && annotation.data("isMask") !== true) {
                                    //thatController.drawControlBox(annotation, thatController.paper);
                                    SvgGlobalControllerLogic.drawSelectBox()
                                    //thatController.drawControlBoxNoHandle(annotation, thatController.paper);
                                }
                            });
                            thatController.tempElement.remove();
                            thatController.stopDrawing();
                            e.stopPropagation();
                            e.preventDefault();
                            thatController.selectBoxedFlag = true;
                            setTimeout(function () {
                                // this code will only run when time has ellapsed
                                thatController.selectBoxedFlag = false;
                            }, 10);

                            thatController.drawingType = "select";
                            //} catch (ex) {
                            //   console.error(ex);
                            //}
                            var msg = {
                                exchangeId: AnnotationApplication.documentVersionId,
                                event: {
                                    eventType: "MouseUp",
                                    value: {
                                        object: "noselected",                                     
                                    }
                                }
                          }
                            dataExchange.sendParentMessage('mouseUp',msg);
                            AnnotationApplication.RightSidebarController.closeSidebar();
                            SvgGlobalControllerLogic.isCtrlKeyPressed = false;
                        }
                    }

                    //}else{

                    //}
                } catch (ex) {
                    console.error("MouseUp Error");
                }
            });

            $(this.paper.canvas).click(function (e) {
                if (thatController.selectBoxedFlag) { return; }
                try {
                    // console.log("Clicked: ", thatController);
                    // console.log("Clicked: XY", e);
                    // console.log("Clicked: XY", thatController.getXY(e, 1 / thatController.getScale()));
                    if (e.target.localName === "svg" && !thatController.isDrawing) {
                        $("#raphael" + thatController.pageNumber).parent().children("div:not(:first-child)").removeClass("hidden");
                        thatController.restoreMask(null);
                        thatController.clearAllJoints();
                        thatController.clearAllCtrlBoxes();
                        
                        if (e.which === 1 && thatController.contextMenu) {
                            thatController.contextMenu.destroyContextMenu();
                        }
                        SvgGlobalControllerLogic.selectedObject = {
                            element: null,
                            svgController: null
                        };
                        AnnotationApplication.RightSidebarController.closeSidebar();
                        if (e.which !== 3) SvgGlobalControllerLogic.allSelectedObjects = [];
                    } else if (e.target.localName !== "svg" && !thatController.isDrawing) {
                        var myoffset = thatController.getTouchOffset($("#pageContainer" + thatController.pageNumber + ":first"));
                        e.offsetX = (e.pointers !== undefined ? e.pointers[0].pageX : e.pageX) - myoffset.left;
                        e.offsetY = (e.pointers !== undefined ? e.pointers[0].pageX : e.pageY) - myoffset.top;


                        thatController.isDragging = false;
                        if (thatController.clickedPoints.length === 0 && ["polyline", "line", "cloud", "measurementbasic"].indexOf(thatController.drawingType) !== -1) {
                            thatController.clickedPoints.push(thatController.getXY(e, 1 / thatController.getScale()));
                            if (["polyline", "cloud"].includes(thatController.drawingType)) {
                                thatController.polylineStartingPoint = thatController.paper.circle(e.offsetX / thatController.getScale(), e.offsetY / thatController.getScale(), 10 / thatController.getScale())
                                    .attr({
                                        fill: 'red',
                                        stroke: 'red',
                                        'stroke-width': 5 / thatController.getScale()
                                    })
                                    .mouseup(function (r) {
                                        if (["polyline", "cloud"].indexOf(thatController.drawingType) !== -1) {
                                            console.log("end polyline/cloud!");
                                            if (navigator.userAgent.match(/iPad/i) === null) thatController.clickedPoints.pop();
                                            switch (thatController.drawingType) {
                                                case "polyline":
                                                    //thatController.drawPolyline(thatController.clickedPoints, true, true);
                                                    // thatController.tempElement.remove();
                                                    // thatController.tempElement = new SvgPolyline(
                                                    //     thatController,
                                                    //     null,
                                                    //     "polyline",
                                                    //     thatController.pageNumber,
                                                    //     null,
                                                    //     0,
                                                    //     null
                                                    // );
                                                    thatController.tempElement.create(thatController.clickedPoints, true, true);
                                                    break;
                                                case "cloud":
                                                    //thatController.drawCloud(thatController.clickedPoints, true, true);
                                                    thatController.tempElement.remove();
                                                    thatController.tempElement = new SvgCloud(
                                                        thatController,
                                                        null,
                                                        "cloud",
                                                        thatController.pageNumber,
                                                        null,
                                                        0,
                                                        null
                                                    );
                                                    thatController.tempElement.create(thatController.clickedPoints, true, true);
                                                    break;
                                            }

                                            thatController.stopDrawing();
                                            if (thatController.tempElement) thatController.tempElement.remove();
                                            this.remove();
                                        }
                                        if (thatController.tempSet !== null) {
                                            thatController.tempSet.forEach(function (el) {
                                                el.remove();
                                            });
                                        }
                                    })
                                    .toFront();
                            }


                        } else if (thatController.clickedPoints.length === 1 && ["line", "measurementbasic"].indexOf(thatController.drawingType) !== -1) {
                            thatController.clickedPoints.push(thatController.getXY(e, 1 / thatController.getScale()));

                            if (thatController.drawingType === "line") {
                                if (thatController.tempElement) thatController.tempElement.remove();
                                thatController.drawLine(
                                    thatController.clickedPoints[0].x,
                                    thatController.clickedPoints[0].y,
                                    thatController.clickedPoints[1].x,
                                    thatController.clickedPoints[1].y,
                                    true
                                )
                            } else if (thatController.drawingType === "measurementbasic") {
                                if (SvgGlobalControllerLogic.isShiftKeyPressed && false) {
                                    var ln = thatController.tempElement.items.filter(el => el.type === "path");
                                    var ln = thatController.tempElement.items.filter(el => el.type === "path");
                                    var x1 = thatController.clickedPoints[0].x;
                                    var y1 = thatController.clickedPoints[0].y;
                                    var x2 = ln[0].attr("path")[1][5];
                                    var y2 = ln[0].attr("path")[1][6];

                                    var dx = x2 - x1;
                                    var dy = y2 - y1;
                                    var m = dy / dx;
                                    var b = y1 - m * x1;

                                    thatController.clickedPoints[1].y = m * thatController.clickedPoints[1].x + b;
                                }
                                if (thatController.tempElement) thatController.tempElement.remove();
                                // thatController.drawMeasurementbasic(
                                //     thatController.clickedPoints[0].x,
                                //     thatController.clickedPoints[0].y,
                                //     thatController.clickedPoints[1].x,
                                //     thatController.clickedPoints[1].y,
                                //     "top",
                                //     null,
                                //     null,
                                //     true
                                // )

                                thatController.tempElement = new SvgMeasurementToolBasic(
                                    thatController,
                                    null,
                                    "measurementbasic",
                                    thatController.pageNumber,
                                    null,
                                    0,
                                    null
                                );
                                thatController.tempElement.draw(
                                    thatController.clickedPoints[0].x,
                                    thatController.clickedPoints[0].y,
                                    thatController.tempMouseMovePoint.x,
                                    thatController.tempMouseMovePoint.y,
                                    "top",
                                    null,
                                    null,
                                    true
                                );
                            }
                            thatController.stopDrawing();
                        } else if (["polyline", "cloud"].indexOf(thatController.drawingType) !== -1) {
                            thatController.clickedPoints.push(thatController.getXY(e, 1 / thatController.getScale()));
                            if (thatController.tempSet === null) { thatController.tempSet = thatController.paper.set(); }
                            thatController.tempSet.push(
                                thatController.paper.circle(e.offsetX / thatController.getScale(), e.offsetY / thatController.getScale(), 5 / thatController.getScale(), 5 / thatController.getScale()).attr({ strke: "blue", fill: "blue", "stroke-dasharray": "" })
                            );
                        } else if (["rect", "highlight", "emsgroup"].indexOf(thatController.drawingType) !== -1) {
                            thatController.clickedPoints.push(thatController.getXY(e, 1 / thatController.getScale()));
                            if (thatController.tempElement) thatController.tempElement.remove();
                            var tempClickedPoints = [];
                            Array.prototype.push.apply(tempClickedPoints, thatController.clickedPoints);
                            if (thatController.drawingType === "rect") {
                                thatController.tempElement = thatController
                                    .drawRect(
                                        Math.min(thatController.clickedPoints[0].x, thatController.clickedPoints[1].x),
                                        Math.min(thatController.clickedPoints[0].y, thatController.clickedPoints[1].y),
                                        Math.abs(thatController.clickedPoints[1].x - thatController.clickedPoints[0].x),
                                        Math.abs(thatController.clickedPoints[1].y - thatController.clickedPoints[0].y),
                                        true);
                            } else if (thatController.drawingType === "emsgroup") {
                                // thatController.tempElement = thatController
                                //     .drawEmsGroup(
                                //         Math.min(thatController.clickedPoints[0].x, thatController.clickedPoints[1].x),
                                //         Math.min(thatController.clickedPoints[0].y, thatController.clickedPoints[1].y),
                                //         Math.abs(thatController.clickedPoints[1].x - thatController.clickedPoints[0].x),
                                //         Math.abs(thatController.clickedPoints[1].y - thatController.clickedPoints[0].y),
                                //         null,
                                //         true,
                                //         true,
                                //         null);
                            } else if (thatController.drawingType === "highlight") {
                                thatController.tempElement = thatController
                                    .drawHighlight(
                                        Math.min(thatController.clickedPoints[0].x, thatController.clickedPoints[1].x),
                                        Math.min(thatController.clickedPoints[0].y, thatController.clickedPoints[1].y),
                                        Math.abs(thatController.clickedPoints[1].x - thatController.clickedPoints[0].x),
                                        Math.abs(thatController.clickedPoints[1].y - thatController.clickedPoints[0].y),
                                        true);
                            }
                            thatController.stopDrawing();
                        } else if (["circ"].indexOf(thatController.drawingType) !== -1) {
                            thatController.clickedPoints.push(thatController.getXY(e, 1 / thatController.getScale()));
                            if (thatController.tempElement) thatController.tempElement.remove();
                            var tempClickedPoints = [];
                            Array.prototype.push.apply(tempClickedPoints, thatController.clickedPoints);
                            var a = thatController.tempMouseMovePoint.x - thatController.clickedPoints[0].x;
                            var b = thatController.tempMouseMovePoint.y - thatController.clickedPoints[0].y;
                            var r = Math.sqrt(a * a + b * b);

                            thatController.tempElement = thatController
                                .drawCircle(
                                    thatController.clickedPoints[0].x,
                                    thatController.clickedPoints[0].y,
                                    r,
                                    r,
                                    true);
                            thatController.stopDrawing();
                        } else if (["text", "emselement"].indexOf(thatController.drawingType) !== -1) {
                            thatController.clickedPoints.push(thatController.getXY(e, 1 / thatController.getScale()));
                            if (thatController.tempElement) thatController.tempElement.remove();
                            if (thatController.drawingType === "emselement") {
                                // thatController.tempElement = thatController
                                //     .drawEmsElement(
                                //         thatController.clickedPoints[0].x,
                                //         thatController.clickedPoints[0].y,
                                //         null,
                                //         true,
                                //         true);

                                        var emsgroup = new SvgEmsGroup(
                                            thatController,
                                                null,
                                                "emsgroup",
                                                thatController.pageNumber,
                                                null,
                                                thatController.getPageRotation(),
                                                null
                                        );
                                        emsgroup.create(
                                            thatController.clickedPoints[0].x,
                                            thatController.clickedPoints[0].y,
                                            0,
                                            0,
                                            null,
                                            true,
                                            true
                                        );
                            } else if (thatController.drawingType === "text") {
                                thatController.tempElement = thatController
                                    .drawText(
                                        thatController.clickedPoints[0].x,
                                        thatController.clickedPoints[0].y,
                                        SvgControllerLogic.textboxDefaultText,
                                        true,
                                        10);
                            }

                            thatController.clickedPoints = [];
                            thatController.stopDrawing();
                        } else if (["stamp"].indexOf(thatController.drawingType) !== -1) {
                            var stampUrl = AnnotationApplication.DrawStateService.getStampState();
                            thatController.clickedPoints.push(thatController.getXY(e, 1 / thatController.getScale()));
                            if (thatController.tempElement) thatController.tempElement.remove();
                            // thatController.tempElement = thatController
                            //     .drawStamp(
                            //         stampUrl,
                            //         thatController.clickedPoints[0].x,
                            //         thatController.clickedPoints[0].y,
                            //         67, 20,
                            //         true);

                                    thatController.tempElement = new SvgStamp(
                                        thatController,
                                        null,
                                        "stamp",
                                        thatController.pageNumber,
                                        null,
                                        -thatController.getPageRotation(),
                                        null,
                                        0
                                    );
    
                                thatController.tempElement.create(
                                    stampUrl,
                                    thatController.clickedPoints[0].x,
                                    thatController.clickedPoints[0].y,
                                    67,
                                    20);
                            thatController.clickedPoints = [];
                            thatController.stopDrawing();
                        } else if (["defect"].indexOf(thatController.drawingType) !== -1) {
                            //var stampUrl = AnnotationApplication.DrawStateService.getStampState();
                            thatController.clickedPoints.push(thatController.getXY(e, 1 / thatController.getScale()));
                            if (thatController.tempElement) thatController.tempElement.remove();
                            // thatController.tempElement = thatController
                            //     .drawStamp(
                            //         stampUrl,
                            //         thatController.clickedPoints[0].x,
                            //         thatController.clickedPoints[0].y,
                            //         67, 20,
                            //         true);

                                    thatController.tempElement = new SvgDefect(
                                        thatController,
                                        null,
                                        "defect",
                                        thatController.pageNumber,
                                        null,
                                        -thatController.getPageRotation(),
                                        null,
                                        thatController.getPageRotation(),
                                        AnnotationApplication.DrawStateService.emsNode.id
                                    );
    
                                thatController.tempElement.create(
                                    "",
                                    thatController.clickedPoints[0].x,
                                    thatController.clickedPoints[0].y,
                                    20,
                                    20);
                            thatController.clickedPoints = [];
                            thatController.stopDrawing();
                        } else if (["image"].indexOf(thatController.drawingType) !== -1) {
                            var img = thatController.uploadedImage;
                            thatController.clickedPoints.push(thatController.getXY(e, 1 / thatController.getScale()));
                            if (thatController.tempElement) thatController.tempElement.remove();

                            var width = img.width;
                            var height = img.height;
                            thatController.tempElement = thatController
                                .drawImage(
                                    img.src,
                                    thatController.clickedPoints[0].x,
                                    thatController.clickedPoints[0].y,
                                    width,
                                    height,
                                    true);
                            thatController.clickedPoints = [];
                            thatController.stopDrawing();
                        } else if (["callout"].includes(thatController.drawingType)) {
                            thatController.clickedPoints.push(thatController.getXY(e, 1 / thatController.getScale()));
                           // var txt = "Type here ...";
                            // if (kendo.culture().name === "de-DE") {
                            //     txt = "Tippe hier ein ...";
                            // }
                            //thatController.drawCallout(thatController.clickedPoints, txt, false, 10, true, this.getPageRotation());
                            thatController.tempElement = new SvgCallout(
                                thatController,
                                    null,
                                    "callout",
                                    thatController.pageNumber,
                                    null,
                                    this.getPageRotation(),
                                    null
                            );
                            thatController.tempElement
                                    .draw(
                                        thatController.clickedPoints, SvgControllerLogic.calloutDefaultText, false, 10, true, thatController.getPageRotation()
                                        );
                        } else if (["freeDraw"].includes(thatController.drawingType)) {
                            thatController.clickedPoints.push(thatController.getXY(e, 1 / thatController.getScale()));
                            if (thatController.tempElement) thatController.tempElement.remove();
                            //thatController.drawFreeDraw(thatController.clickedPoints, true);


                            thatController.tempElement = new SvgFreeDraw(
                                thatController,
                                null,
                                "freeDraw",
                                thatController.pageNumber,
                                null,
                                0,
                                null,
                                0,
                                [],
                                [],
                                []);
    
                            thatController.tempElement
                                .create(thatController.clickedPoints);
                                thatController.tempElement.element.attr({
                                    stroke: SvgGlobalControllerLogic.freeDrawProperties.color,
                                    "stroke-width": SvgGlobalControllerLogic.freeDrawProperties.strokeWidth
                                });
                                thatController.tempElement = null;
                            thatController.clickedPoints = [];
                            //thatController.stopDrawing();
                            console.log("freeDraw ==> stopped");
                        }
                    }

                    /*if (getSvgController(this.pageNumber ).canvas.clickedPoints.length === 0 && ["polyline", "line"].indexOf(getSvgController(this.pageNumber ).canvas.drawingType) !== -1) {
                        getSvgController(this.pageNumber ).canvas.clickedPoints.push({
                            x: e.offsetX,
                            y: e.offsetY
                        });
                    }else if (getSvgController(this.pageNumber ).canvas.clickedPoints.length === 1 && ["line"].indexOf(getSvgController(this.pageNumber ).canvas.drawingType) !== -1) {
                        getSvgController(this.pageNumber ).canvas.clickedPoints.push({
                            x: e.offsetX,
                            y: e.offsetY
                        });
                        if (getSvgController(this.pageNumber ).canvas.tempElement) getSvgController(this.pageNumber ).canvas.tempElement.remove();
                        getSvgController(this.pageNumber ).canvas.drawLine(
                            getSvgController(this.pageNumber ).canvas.clickedPoints[0].x,
                            getSvgController(this.pageNumber ).canvas.clickedPoints[0].y,
                            getSvgController(this.pageNumber ).canvas.clickedPoints[1].x,
                            getSvgController(this.pageNumber ).canvas.clickedPoints[1].y
                        )
                        getSvgController(this.pageNumber ).canvas.stopDrawing();
                    }*/
                } catch (ex) {
                    console.error("Click Error", ex);
                }
            });

            $(this.paper.canvas).dblclick(function (e) {
                if (thatController.drawingType === "polyline" && thatController.clickedPoints.length > 1) {
                    /*thatController.clickedPoints.push({
                        x: e.offsetX,
                        y: e.offsetY
                    });*/
                    thatController.clickedPoints.splice(-1,1);
                    //thatController.drawPolyline(thatController.clickedPoints, false, true);
                    thatController.tempElement.remove();
                    // thatController.tempElement = new SvgPolyline(
                    //     thatController,
                    //     null,
                    //     "polyline",
                    //     thatController.pageNumber,
                    //     null,
                    //     0,
                    //     null
                    // );
                    thatController.tempElement.create(thatController.clickedPoints, false, true);
                    thatController.clickedPoints = [];
                    thatController.polylineStartingPoint.remove();
                    thatController.stopDrawing();
                }
            });


            // this creates a transparent mask for 
            Raphael.el.drawMask = function () {
                try {
                    return;
                    var element = this;
                    if (["rect"].includes(element.getAnnotationType())) {
                        var mask = element.clone();

                        mask.attr({
                            fill: "white",
                            opacity: 0.01
                        })
                            //thatController.bindEventsToElement(element, element.paper, element.getAnnotationType());

                            .mouseover(function (e) {
                                $(SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.paper.canvas).css("z-index", "100");
                                $(e.target).css("cursor", "pointer");
                            })
                            .mouseout(function (e) {
                                $(SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.paper.canvas).css("z-index", "");
                                $(e.target).css("cursor", "default");
                            })
                            .mouseup(function (e) {
                                //element.click();

                                if (e.which === 3) {
                                    thatController.rightClickHandler(element, element.paper, e);
                                } else if (e.which === 1 && ["circ", "rect"].includes(element.getAnnotationType())) {
                                    element.SvgController().drawControlBox(element, element.paper);
                                }

                            })
                            .drag(function (dx, dy, x, y, e) {
                                if (dx !== 0 || dy !== 0) {
                                    thatController.onElementDragging(element, dx, dy, x, y, e, element.getAnnotationType());
                                }
                            }, function (x, y, e) {
                                thatController.onElementDragStart(element, x, y, e, element.getAnnotationType());
                                //thatController.onElementDragStart(mask,x,y,e,element.getAnnotationType());
                            }, function (e) {
                                thatController.onElementDragEnd(element, e, element.getAnnotationType());
                                //thatController.onElementDragging(mask,e,element.getAnnotationType());
                                mask.remove();
                                thatController.clearAllCtrlBoxes();
                                if (["circ", "rect"].includes(element.getAnnotationType())) {
                                    thatController.drawControlBox(element, element.paper);
                                }
                                //element.drawMask();
                            })
                            .toBack();

                        element.data("MaskId", mask.id);
                    }
                } catch (ex) {
                    console.error("DrawMask Error");
                }
            };

            Raphael.el.SvgController = function () {
                return this.data("SvgController");
            };


            // Hammer js function
            this.hammer = new Hammer.Manager(this.paper.canvas);

            this.hammer.add(new Hammer.Pinch({ event: "pinch" }));
            var singleTap = new Hammer.Tap({ event: "tap" });
            var doubleTap = new Hammer.Tap({event: 'doubletap', taps: 2 });
            this.hammer.add([doubleTap, singleTap]);
            doubleTap.recognizeWith(singleTap);
            singleTap.requireFailure([doubleTap]);
            this.hammer.add(new Hammer.Swipe({ event: "swipe" }));
            this.hammer.add(new Hammer.Pan({ event: "pan" }));
            this.hammer.add(new Hammer.Press({ event: "press" }));


            this.hammer.get('pinch').set({ enable: false });
            this.hammer.get('tap').set({ enable: true });
            this.hammer.get('swipe').set({ enable: false });
            this.hammer.get('pan').set({ enable: true });
            this.hammer.get('press').set({ enable: true });

            this.hammer.on("pinch", function (evt) {
                //console.log("HammerJS: You're pinching me !", evt);
                //alert(evt);
                console.log(evt);
            });
            this.hammer.on("tap", function (e) {
                //console.log("HammerJS: You're tapping me !");
                //alert(evt);
                if (e.pointerType !== "mouse") {
                    //console.log(e);

                    var myoffset = thatController.getTouchOffset($("#pageContainer" + thatController.pageNumber + ":first"));
                    // e.offsetX = e.pointers[0].pageX - myoffset.left;
                    // e.offsetY = e.pointers[0].pageY - myoffset.top;
                    e.offsetX = (e.changedPointers !== undefined ? e.changedPointers[0].pageX : e.pageX) - myoffset.left;
                    e.offsetY = (e.changedPointers !== undefined ? e.changedPointers[0].pageX : e.pageY) - myoffset.top;

                    e.offsetX = thatController.getXY(e, 1 / thatController.getScale()).x;
                    e.offsetY = thatController.getXY(e, 1 / thatController.getScale()).y;

                    thatController.isDragging = false;
                    if (thatController.clickedPoints.length === 0 && ["polyline", "line", "cloud", "measurementbasic"].indexOf(thatController.drawingType) !== -1) {
                        thatController.clickedPoints.push({
                            x: e.offsetX,
                            y: e.offsetY
                        });
                        if (["polyline", "cloud"].includes(thatController.drawingType)) {
                            thatController.polylineStartingPoint = thatController.paper.circle(e.offsetX, e.offsetY, 10)
                                .attr({
                                    fill: 'red',
                                    stroke: 'red',
                                    'stroke-width': 5
                                })
                                .mouseup(function (r) {
                                    if (["polyline", "cloud"].indexOf(thatController.drawingType) !== -1) {
                                        console.log("end polyline/cloud!");
                                        if (navigator.userAgent.match(/iPad/i) === null) thatController.clickedPoints.pop();
                                        switch (thatController.drawingType) {
                                            case "polyline":
                                                //thatController.drawPolyline(thatController.clickedPoints, true, true);
                                                // thatController.tempElement = new SvgPolyline(
                                                //     thatController,
                                                //     null,
                                                //     "polyline",
                                                //     thatController.pageNumber,
                                                //     null,
                                                //     0,
                                                //     null
                                                // );
                                                thatController.tempElement.create(thatController.clickedPoints, true, true);
                                                break;
                                            case "cloud":
                                                // thatController.drawCloud(thatController.clickedPoints, true, true);

                                                // if (thatController.tempElement) thatController.tempElement.remove();
                                                // thatController.tempElement = new SvgCloud(
                                                //     thatController,
                                                //     null,
                                                //     "cloud",
                                                //     thatController.pageNumber,
                                                //     null,
                                                //     0,
                                                //     null
                                                // );
                                                thatController.tempElement.create(thatController.clickedPoints, true, true);
                                                break;
                                        }

                                        thatController.clickedPoints = [];
                                        thatController.polylineStartingPoint.remove();
                                        thatController.stopDrawing();
                                        if (thatController.tempElement) thatController.tempElement.remove();
                                        this.remove();
                                        thatController.tempSet.forEach(function(pt){
                                            pt.remove();
                                        });
                                    }
                                    if (thatController.tempSet !== null) {
                                        thatController.tempSet.forEach(function (el) {
                                            el.remove();
                                        });
                                    }
                                })
                                .toFront();
                                e.stopPropagation();
                        }


                    } else if (thatController.clickedPoints.length === 1 && ["line", "measurementbasic"].indexOf(thatController.drawingType) !== -1) {
                        thatController.clickedPoints.push({
                            x: e.offsetX,
                            y: e.offsetY
                        });

                        if (thatController.drawingType === "line") {
                            if (thatController.tempElement) thatController.tempElement.remove();
                            thatController.drawLine(
                                thatController.clickedPoints[0].x,
                                thatController.clickedPoints[0].y,
                                thatController.clickedPoints[1].x,
                                thatController.clickedPoints[1].y,
                                true
                            )
                        } else if (thatController.drawingType === "measurementbasic") {
                            if (SvgGlobalControllerLogic.isShiftKeyPressed && false) {
                                var ln = thatController.tempElement.items.filter(el => el.type === "path");
                                var ln = thatController.tempElement.items.filter(el => el.type === "path");
                                var x1 = thatController.clickedPoints[0].x;
                                var y1 = thatController.clickedPoints[0].y;
                                var x2 = ln[0].attr("path")[1][5];
                                var y2 = ln[0].attr("path")[1][6];

                                var dx = x2 - x1;
                                var dy = y2 - y1;
                                var m = dy / dx;
                                var b = y1 - m * x1;

                                thatController.clickedPoints[1].y = m * thatController.clickedPoints[1].x + b;
                            }
                            if (thatController.tempElement) thatController.tempElement.remove();
                            // thatController.drawMeasurementbasic(
                            //     thatController.clickedPoints[0].x,
                            //     thatController.clickedPoints[0].y,
                            //     thatController.clickedPoints[1].x,
                            //     thatController.clickedPoints[1].y,
                            //     "top",
                            //     null,
                            //     null,
                            //     true
                            // );

                            thatController.tempElement = new SvgMeasurementToolBasic(
                                thatController,
                                null,
                                "measurementbasic",
                                thatController.pageNumber,
                                null,
                                0,
                                null
                            );
                            thatController.tempElement.create(
                                thatController.clickedPoints[0].x,
                                thatController.clickedPoints[0].y,
                                thatController.clickedPoints[1].x,
                                thatController.clickedPoints[1].y,
                                "top",
                                null,
                                null,
                                false
                            );
                        }
                        thatController.stopDrawing();
                    } else if (["polyline", "cloud"].indexOf(thatController.drawingType) !== -1) {
                        thatController.clickedPoints.push({
                            x: e.offsetX,
                            y: e.offsetY
                        });
                        console.log({
                            x: e.offsetX,
                            y: e.offsetY
                        });
                        if (thatController.tempSet === null) { thatController.tempSet = thatController.paper.set(); }
                        // thatController.tempSet.push(
                        //     thatController.paper.circle(e.offsetX, e.offsetY, 5, 5).attr({ strke: "blue", fill: "blue", "stroke-dasharray": "" })
                        // );
                    } else if (["rect", "highlight", "emsgroup"].indexOf(thatController.drawingType) !== -1) {
                        thatController.clickedPoints.push({
                            x: e.offsetX,
                            y: e.offsetY
                        });
                        if (thatController.tempElement) thatController.tempElement.remove();
                        var tempClickedPoints = [];
                        Array.prototype.push.apply(tempClickedPoints, thatController.clickedPoints);
                        if (thatController.drawingType === "rect") {
                            thatController.tempElement = thatController
                                .drawRect(
                                    Math.min(thatController.clickedPoints[0].x, thatController.clickedPoints[1].x),
                                    Math.min(thatController.clickedPoints[0].y, thatController.clickedPoints[1].y),
                                    Math.abs(thatController.clickedPoints[1].x - thatController.clickedPoints[0].x),
                                    Math.abs(thatController.clickedPoints[1].y - thatController.clickedPoints[0].y),
                                    true);
                        } else if (thatController.drawingType === "emsgroup") {
                            thatController.tempElement = thatController
                                .drawEmsGroup(
                                    Math.min(thatController.clickedPoints[0].x, thatController.clickedPoints[1].x),
                                    Math.min(thatController.clickedPoints[0].y, thatController.clickedPoints[1].y),
                                    Math.abs(thatController.clickedPoints[1].x - thatController.clickedPoints[0].x),
                                    Math.abs(thatController.clickedPoints[1].y - thatController.clickedPoints[0].y),
                                    null,
                                    true,
                                    true,
                                    null);
                        } else if (thatController.drawingType === "highlight") {
                            thatController.tempElement = thatController
                                .drawHighlight(
                                    Math.min(thatController.clickedPoints[0].x, thatController.clickedPoints[1].x),
                                    Math.min(thatController.clickedPoints[0].y, thatController.clickedPoints[1].y),
                                    Math.abs(thatController.clickedPoints[1].x - thatController.clickedPoints[0].x),
                                    Math.abs(thatController.clickedPoints[1].y - thatController.clickedPoints[0].y),
                                    true);
                        }
                        thatController.stopDrawing();
                    } else if (["circ"].indexOf(thatController.drawingType) !== -1) {
                        thatController.clickedPoints.push({
                            x: e.offsetX,
                            y: e.offsetY
                        });
                        if (thatController.tempElement) thatController.tempElement.remove();
                        var tempClickedPoints = [];
                        Array.prototype.push.apply(tempClickedPoints, thatController.clickedPoints);
                        var a = thatController.tempMouseMovePoint.x - thatController.clickedPoints[0].x;
                        var b = thatController.tempMouseMovePoint.y - thatController.clickedPoints[0].y;
                        var r = Math.sqrt(a * a + b * b);

                        thatController.tempElement = thatController
                            .drawCircle(
                                thatController.clickedPoints[0].x,
                                thatController.clickedPoints[0].y,
                                r,
                                r,
                                true);
                        thatController.stopDrawing();
                    } else if (["text", "emselement"].indexOf(thatController.drawingType) !== -1) {
                        thatController.clickedPoints.push({
                            x: e.offsetX,
                            y: e.offsetY
                        });
                        if (thatController.tempElement) thatController.tempElement.remove();
                        if (thatController.drawingType === "emselement") {
                            thatController.tempElement = thatController
                                .drawEmsElement(
                                    thatController.clickedPoints[0].x,
                                    thatController.clickedPoints[0].y,
                                    null,
                                    true,
                                    true);
                        } else if (thatController.drawingType === "text") {
                            thatController.tempElement = thatController
                                .drawText(
                                    thatController.clickedPoints[0].x,
                                    thatController.clickedPoints[0].y,
                                    GetResourceString('ClickType'),
                                    true,
                                    10);
                        }

                        thatController.clickedPoints = [];
                        thatController.stopDrawing();
                    } else if (["stamp"].indexOf(thatController.drawingType) !== -1) {
                        var stampUrl = AnnotationApplication.DrawStateService.getStampState();
                        thatController.clickedPoints.push({
                            x: e.offsetX,
                            y: e.offsetY
                        });
                        if (thatController.tempElement) thatController.tempElement.remove();
                        // thatController.tempElement = thatController
                        //     .drawStamp(
                        //         stampUrl,
                        //         thatController.clickedPoints[0].x,
                        //         thatController.clickedPoints[0].y,
                        //         67, 20,
                        //         true);

                        thatController.tempElement = new SvgStamp(
                            thatController,
                            null,
                            "stamp",
                            thatController.pageNumber,
                            null,
                            -thatController.getPageRotation(),
                            null,
                            0
                        );

                        thatController.tempElement.create(
                            stampUrl,
                            thatController.clickedPoints[0].x,
                            thatController.clickedPoints[0].y,
                            67,
                            20);
                        thatController.clickedPoints = [];
                        thatController.stopDrawing();
                    } else if (["defect"].indexOf(thatController.drawingType) !== -1) {
                        var stampUrl = AnnotationApplication.DrawStateService.getStampState();
                        thatController.clickedPoints.push({
                            x: e.offsetX,
                            y: e.offsetY
                        });
                        if (thatController.tempElement) thatController.tempElement.remove();
                        // thatController.tempElement = thatController
                        //     .drawStamp(
                        //         stampUrl,
                        //         thatController.clickedPoints[0].x,
                        //         thatController.clickedPoints[0].y,
                        //         67, 20,
                        //         true);

                        thatController.tempElement = new SvgDefect(
                            thatController,
                            null,
                            "defect",
                            thatController.pageNumber,
                            null,
                            -thatController.getPageRotation(),
                            null,
                            thatController.getPageRotation(),
                            AnnotationApplication.DrawStateService.emsNode.id
                        );

                        thatController.tempElement.create(
                            "",
                            thatController.clickedPoints[0].x,
                            thatController.clickedPoints[0].y,
                            20,
                            20);
                        thatController.clickedPoints = [];
                        thatController.stopDrawing();
                    } else if (["image"].indexOf(thatController.drawingType) !== -1) {
                        var img = thatController.uploadedImage;
                        var myoffset = thatController.getTouchOffset($("#pageContainer" + thatController.pageNumber + ":first"));
                        e.offsetX = e.pointers[0].pageX - myoffset.left;
                        e.offsetY = e.pointers[0].pageY - myoffset.top;
                        thatController.clickedPoints.push({
                            x: e.offsetX,
                            y: e.offsetY
                        });
                        if (thatController.tempElement) thatController.tempElement.remove();

                        var width = img.width;
                        var height = img.height;
                        thatController.tempElement = thatController
                            .drawImage(
                                img.src,
                                thatController.clickedPoints[0].x,
                                thatController.clickedPoints[0].y,
                                width,
                                height,
                                true);
                        thatController.clickedPoints = [];
                        thatController.stopDrawing();
                    } else if (["callout"].includes(thatController.drawingType)) {
                        thatController.clickedPoints.push({
                            x: e.offsetX,
                            y: e.offsetY
                        });
                        var txt = "Type here ...";
                        // if (kendo.culture().name === "de-DE") {
                        //     txt = "Tippe hier ein ...";
                        // }
                        thatController.drawCallout(thatController.clickedPoints, txt, false, 10, true, thatController.getPageRotation());
                    } else if (["freeDraw"].includes(thatController.drawingType)) {
                        thatController.clickedPoints.push({
                            x: e.offsetX,
                            y: e.offsetY
                        });
                        if (thatController.tempElement) thatController.tempElement.remove();
                        //thatController.drawFreeDraw(thatController.clickedPoints, true);

                        thatController.tempElement = new SvgFreeDraw(
                            thatController,
                            null,
                            "freeDraw",
                            thatController.pageNumber,
                            null,
                            0,
                            null,
                            0,
                            [],
                            [],
                            []);

                        thatController.tempElement
                            .create(thatController.clickedPoints);
                            thatController.tempElement.element.attr({
                                stroke: SvgGlobalControllerLogic.freeDrawProperties.color,
                                "stroke-width": SvgGlobalControllerLogic.freeDrawProperties.strokeWidth
                            });
                            thatController.tempElement = null;

                        thatController.clickedPoints = [];
                        //thatController.stopDrawing();
                        console.log("freeDraw ==> stopped");
                    }
                    //e.srcEvent.stopPropagation();
                }

            });
            this.hammer.on("pan", function (e) {
                //alert(evt);
                //e.stopPropagation();
                if (e.pointerType !== "mouse") {
                    var myoffset = thatController.getTouchOffset($("#pageContainer" + thatController.pageNumber + ":first"));
                    e.offsetX = e.pointers[0].pageX - myoffset.left;
                    e.offsetY = e.pointers[0].pageY - myoffset.top;

                    e.offsetX = thatController.getXY(e, 1 / thatController.getScale()).x;
                    e.offsetY = thatController.getXY(e, 1 / thatController.getScale()).y;

                    thatController.isDragging = true;
                    // begin
                    if (thatController.clickedPoints.length === 0 && thatController.isDrawing && ["rect", "circ", "highlight", "freeDraw", "emsgroup", "measurementbasic", "line"].indexOf(thatController.drawingType) !== -1) {
                        thatController.clickedPoints.push({
                            x: e.offsetX,
                            y: e.offsetY
                        });
                    } else if (thatController.clickedPoints.length === 0 && !thatController.isDrawing && e.target.localName === "svg") {
                        console.log(thatController.drawingType);
                        thatController.clearAllCtrlBoxes();
                        thatController.clearAllJoints();
                        thatController.clickedPoints.push({
                            x: e.offsetX,
                            y: e.offsetY
                        });
                        $("#raphael" + thatController.pageNumber).parent().children("div:not(:first-child)").addClass("hidden");
                        thatController.drawingType = "selectall";
                        thatController.tempElement = thatController.paper.rect(thatController.clickedPoints.x, thatController.clickedPoints.y, 0, 0);
                    }

                    // moving
                    if (thatController.clickedPoints.length !== 0 && !e.isFinal && !e.isFirst && thatController.isDrawing && ["rect", "circ", "highlight", "freeDraw", "emsgroup", "measurementbasic", "line"].indexOf(thatController.drawingType) !== -1) {
                        this.pageNumber = thatController.pageNumber;//SvgGlobalControllerLogic.getCurrentSvgCanvasPage(this);
                        if (thatController.isDrawing) {
                            var previous_tempMouseMovePoint = thatController.tempMouseMovePoint;
                            thatController.tempMouseMovePoint.x = e.offsetX;
                            thatController.tempMouseMovePoint.y = e.offsetY;

                            $(thatController.paper.canvas).css("cursor", "crosshair");

                            //getSvgController(this.pageNumber ).canvas.tempMouseMovePoint = fCanvas.getPointer(e);

                            switch (thatController.drawingType) {
                                case "line":
                                    if (thatController.clickedPoints.length === 1 && thatController.isDragging) {
                                        if (thatController.tempElement) thatController.tempElement.remove();
                                        // thatController.tempElement = thatController.drawLine(
                                        //     thatController.clickedPoints[0].x,
                                        //     thatController.clickedPoints[0].y,
                                        //     thatController.tempMouseMovePoint.x,
                                        //     thatController.tempMouseMovePoint.y,
                                        //     false
                                        // )

                                        thatController.tempElement = new SvgLine(
                                            thatController,
                                            null,
                                            "line",
                                            thatController.pageNumber,
                                            null,
                                            0,
                                            null);
            
                                        thatController.tempElement
                                            .draw(
                                                thatController.clickedPoints[0].x,
                                                thatController.clickedPoints[0].y,
                                                thatController.tempMouseMovePoint.x,
                                                thatController.tempMouseMovePoint.y,
                                                );


                                    }
                                    break;
                                case "measurementbasic":
                                    if (thatController.clickedPoints.length === 1 && thatController.isDragging) {
                                        if (SvgGlobalControllerLogic.isShiftKeyPressed && false) {
                                            var ln = thatController.tempElement.items.filter(el => el.type === "path");
                                            var x1 = thatController.clickedPoints[0].x;
                                            var y1 = thatController.clickedPoints[0].y;
                                            var x2 = ln[0].attr("path")[1][1];
                                            var y2 = ln[0].attr("path")[1][2];

                                            var dx = x2 - x1;
                                            var dy = y2 - y1;
                                            var m = dy / dx;
                                            var b = y1 - m * x1;

                                            thatController.tempMouseMovePoint.y = m * thatController.tempMouseMovePoint.x + b;
                                        }

                                        if (thatController.tempElement !== null && thatController.tempElement.type === "set") thatController.tempElement.forEach(function (element) {
                                            element.remove();
                                        });

                                        // thatController.tempElement = thatController.drawMeasurementbasic(
                                        //     thatController.clickedPoints[0].x,
                                        //     thatController.clickedPoints[0].y,
                                        //     thatController.tempMouseMovePoint.x,
                                        //     thatController.tempMouseMovePoint.y,
                                        //     "top",
                                        //     null,
                                        //     false
                                        // );

                                        if (thatController.tempElement) thatController.tempElement.remove();
                                        thatController.tempElement = new SvgMeasurementToolBasic(
                                            thatController,
                                            null,
                                            "measurementbasic",
                                            thatController.pageNumber,
                                            null,
                                            0,
                                            null
                                        );
                                        thatController.tempElement.draw(
                                            thatController.clickedPoints[0].x,
                                            thatController.clickedPoints[0].y,
                                            thatController.tempMouseMovePoint.x,
                                            thatController.tempMouseMovePoint.y,
                                            "top",
                                            null,
                                            null,
                                            false
                                        );
                                    }
                                    break;
                                case "polyline":
                                    if (thatController.clickedPoints.length > 0) {
                                        if (thatController.tempElement) thatController.tempElement.remove();
                                        var tempClickedPoints = [];
                                        Array.prototype.push.apply(tempClickedPoints, thatController.clickedPoints);
                                        tempClickedPoints.push({
                                            x: thatController.tempMouseMovePoint.x,
                                            y: thatController.tempMouseMovePoint.y
                                        });
                                        // thatController.tempElement = thatController.drawPolyline(tempClickedPoints, false, false);

                                        thatController.tempElement = new SvgPolyline(
                                            thatController,
                                            null,
                                            "polyline",
                                            thatController.pageNumber,
                                            null,
                                            0,
                                            null
                                        );
                                        thatController.tempElement.draw(thatController.clickedPoints, false, false);

                                        thatController.tempElement.toBack();
                                    }
                                    break;
                                case "cloud":
                                    if (thatController.clickedPoints.length > 0) {
                                        if (thatController.tempElement) thatController.tempElement.remove();
                                        var tempClickedPoints = [];
                                        Array.prototype.push.apply(tempClickedPoints, thatController.clickedPoints);
                                        tempClickedPoints.push({
                                            x: thatController.tempMouseMovePoint.x,
                                            y: thatController.tempMouseMovePoint.y
                                        });
                                        // thatController.tempElement = thatController.drawCloud(tempClickedPoints, false, false);

                                        thatController.tempElement.remove();
                                        thatController.tempElement = new SvgCloud(
                                            thatController,
                                            null,
                                            "cloud",
                                            thatController.pageNumber,
                                            null,
                                            0,
                                            null
                                        );
                                        thatController.tempElement.draw(thatController.clickedPoints, false, false);

                                        thatController.tempElement.toBack();
                                    }
                                    break;
                                case "rect":
                                    if (thatController.clickedPoints.length > 0) {
                                        if (thatController.tempElement) thatController.tempElement.remove();
                                        var tempClickedPoints = [];
                                        Array.prototype.push.apply(tempClickedPoints, thatController.clickedPoints);
                                        // thatController.tempElement = thatController
                                        //     .drawRect(
                                        //         Math.min(thatController.clickedPoints[0].x, thatController.tempMouseMovePoint.x),
                                        //         Math.min(thatController.clickedPoints[0].y, thatController.tempMouseMovePoint.y),
                                        //         Math.abs(thatController.tempMouseMovePoint.x - thatController.clickedPoints[0].x),
                                        //         Math.abs(thatController.tempMouseMovePoint.y - thatController.clickedPoints[0].y),
                                        //         false).attr({ "stroke-dasharray": "" });


                                                
                                                if(typeof thatController.tempElement !== 'undefined' && typeof thatController.tempElement !== 'SvgRect'){
                                                    thatController.tempElement = new SvgRect(
                                                        thatController,
                                                        null,
                                                        "rect",
                                                        thatController.pageNumber,
                                                        null,
                                                        0,
                                                        null,
                                                        0,
                                                        [],
                                                        [],
                                                        []);
                                                }
                                                
                                                thatController.tempElement
                                                    .draw(
                                                        Math.min(thatController.clickedPoints[0].x, thatController.tempMouseMovePoint.x),
                                                        Math.min(thatController.clickedPoints[0].y, thatController.tempMouseMovePoint.y),
                                                        Math.abs(thatController.tempMouseMovePoint.x - thatController.clickedPoints[0].x),
                                                        Math.abs(thatController.tempMouseMovePoint.y - thatController.clickedPoints[0].y),
                                                        );

                                        //thatController.tempElement.toBack();
                                    }
                                    break;
                                case "emsgroup":
                                    if (thatController.clickedPoints.length > 0) {
                                        if (thatController.tempElement) thatController.tempElement.remove();
                                        var tempClickedPoints = [];
                                        Array.prototype.push.apply(tempClickedPoints, thatController.clickedPoints);
                                        thatController.tempElement = thatController
                                            .drawEmsGroup(
                                                Math.min(thatController.clickedPoints[0].x, thatController.tempMouseMovePoint.x),
                                                Math.min(thatController.clickedPoints[0].y, thatController.tempMouseMovePoint.y),
                                                Math.abs(thatController.tempMouseMovePoint.x - thatController.clickedPoints[0].x),
                                                Math.abs(thatController.tempMouseMovePoint.y - thatController.clickedPoints[0].y),
                                                null,
                                                false,
                                                false,
                                                null);
                                        thatController.tempElement.toBack();
                                    }
                                    break;
                                case "highlight":
                                    if (thatController.clickedPoints.length > 0) {
                                        if (thatController.tempElement) thatController.tempElement.remove();
                                        var tempClickedPoints = [];
                                        Array.prototype.push.apply(tempClickedPoints, thatController.clickedPoints);
                                        if(typeof thatController.tempElement !== 'undefined' && typeof thatController.tempElement !== '         SvgHighlight'){
                                            thatController.tempElement = new SvgHighlight(
                                                thatController,
                                                null,
                                                "highlight",
                                                thatController.pageNumber,
                                                null,
                                                0,
                                                null,
                                                0,
                                                [],
                                                [],
                                                []);
                                        }
    
                                        thatController.tempElement
                                            .draw(
                                                Math.min(thatController.clickedPoints[0].x, thatController.tempMouseMovePoint.x),
                                                Math.min(thatController.clickedPoints[0].y, thatController.tempMouseMovePoint.y),
                                                Math.abs(thatController.tempMouseMovePoint.x - thatController.clickedPoints[0].x),
                                                Math.abs(thatController.tempMouseMovePoint.y - thatController.clickedPoints[0].y),
                                                );
                                    }
                                    break;
                                case "circ":
                                    if (thatController.clickedPoints.length > 0) {
                                        if (thatController.tempElement) thatController.tempElement.remove();
                                        var tempClickedPoints = [];
                                        Array.prototype.push.apply(tempClickedPoints, thatController.clickedPoints);

                                        var a = thatController.tempMouseMovePoint.x - thatController.clickedPoints[0].x;
                                        var b = thatController.tempMouseMovePoint.y - thatController.clickedPoints[0].y;
                                        var r = Math.sqrt(a * a + b * b);

                                        // thatController.tempElement = thatController
                                        //     .drawCircle(
                                        //         thatController.clickedPoints[0].x,
                                        //         thatController.clickedPoints[0].y,
                                        //         r,
                                        //         r,

                                        //         false);
                                        // thatController.tempElement.toBack();

                                        thatController.tempElement = new SvgCircle(
                                            thatController,
                                            null,
                                            "circ",
                                            thatController.pageNumber,
                                            null,
                                            0,
                                            null,
                                            0,
                                            [],
                                            [],
                                            []);
    
                                        thatController.tempElement
                                            .draw(
                                                thatController.clickedPoints[0].x,
                                                thatController.clickedPoints[0].y,
                                                r,
                                                r
                                                );
                                    }
                                    break;
                                case "callout":
                                    if (thatController.clickedPoints.length > 0) {
                                        if (thatController.tempElement !== null && thatController.tempElement.type === "set") thatController.tempElement.forEach(function (element) {
                                            element.remove();
                                        });
                                        //console.log("rect moving touch");
                                        if (thatController.tempElement) thatController.tempElement.remove();
                                        var tempClickedPoints = [];
                                        Array.prototype.push.apply(tempClickedPoints, thatController.clickedPoints);
                                        tempClickedPoints.push({
                                            x: thatController.tempMouseMovePoint.x,
                                            y: thatController.tempMouseMovePoint.y
                                        });
                                        var txt = "Type here ...";
                                        // if (kendo.culture().name === "de-DE") {
                                        //     txt = "Tippe hier ein ...";
                                        // }
                                        //thatController.drawCallout(tempClickedPoints, txt, false, 10, true, thatController.getPageRotation());
                                        var callout = new SvgCallout(
                                            thatController,
                                                null,
                                                "callout",
                                                thatController.pageNumber,
                                                null,
                                                thatController.getPageRotation(),
                                                null
                                        );
                                        if(thatController.clickedPoints.length === 3){
                                            callout.create(
                                                tempClickedPoints, txt, false, 10, true, thatController.getPageRotation()
                                                );
                                        }else{
                                            callout.draw(
                                                tempClickedPoints, txt, false, 10, true, thatController.getPageRotation()
                                                );
                                        }
                                    }
                                    break;
                                case "freeDraw":
                                    if (thatController.clickedPoints.length > 0) {
                                        thatController.clickedPoints.push({
                                            x: e.offsetX,
                                            y: e.offsetY
                                        });
                                        if (thatController.tempElement) thatController.tempElement.element.remove();
                                        //thatController.drawFreeDraw(thatController.clickedPoints, false);

                                        thatController.tempElement = new SvgFreeDraw(
                                            thatController,
                                            null,
                                            "freeDraw",
                                            thatController.pageNumber,
                                            null,
                                            0,
                                            null,
                                            0,
                                            [],
                                            [],
                                            []);
    
                                        thatController.tempElement
                                            .draw(thatController.clickedPoints);
                                            thatController.tempElement.element.attr({
                                                stroke: SvgGlobalControllerLogic.freeDrawProperties.color,
                                                "stroke-width": SvgGlobalControllerLogic.freeDrawProperties.strokeWidth
                                            });

                                        console.log("freeDraw ==> dragging");
                                    }
                                    break;
                            }
                        }
                    } else if (thatController.clickedPoints.length !== 0 && !e.isFinal && !e.isFirst && !thatController.isDrawing) {
                        if (thatController.drawingType === "selectall" && !thatController.isDrawing) {
                            console.log(thatController.drawingType);
                            if (thatController.tempElement !== null) {

                                thatController.tempElement.remove();
                                var x = thatController.clickedPoints[0].x - e.offsetX > 0 ? e.offsetX : thatController.clickedPoints[0].x;
                                var y = thatController.clickedPoints[0].y - e.offsetY > 0 ? e.offsetY : thatController.clickedPoints[0].y;
                                var w = Math.max(thatController.clickedPoints[0].x, e.offsetX) - Math.min(thatController.clickedPoints[0].x, e.offsetX);
                                var h = Math.max(thatController.clickedPoints[0].y, e.offsetY) - Math.min(thatController.clickedPoints[0].y, e.offsetY);

                                thatController.tempElement = thatController.paper.rect(x, y, w, h).attr({
                                    opacity: 0.2,
                                    fill: "blue"
                                });
                            }
                        }
                    }

                    //end
                    if (e.isFinal && !e.isFirst && thatController.isDrawing && ["rect", "circ", "highlight", "freeDraw", "emsgroup", "measurementbasic", "line"].indexOf(thatController.drawingType) !== -1) {
                        thatController.clickedPoints.push({
                            x: e.offsetX,
                            y: e.offsetY
                        });
                        console.log("touch move end");
                        if (thatController.tempElement) thatController.tempElement.remove();
                        var tempClickedPoints = [];
                        Array.prototype.push.apply(tempClickedPoints, thatController.clickedPoints);
                        if (thatController.drawingType === "rect") {
                            // thatController.tempElement = thatController
                            //     .create(
                            //         Math.min(thatController.clickedPoints[0].x, thatController.clickedPoints[1].x),
                            //         Math.min(thatController.clickedPoints[0].y, thatController.clickedPoints[1].y),
                            //         Math.abs(thatController.clickedPoints[1].x - thatController.clickedPoints[0].x),
                            //         Math.abs(thatController.clickedPoints[1].y - thatController.clickedPoints[0].y),
                            //         true);

                                    thatController.tempElement = new SvgRect(
                                        thatController,
                                        null,
                                        "rect",
                                        thatController.pageNumber,
                                        null,
                                        0,
                                        null,
                                        0,
                                        [],
                                        [],
                                        []);

                                    thatController.tempElement
                                        .create(
                                            Math.min(thatController.clickedPoints[0].x, thatController.tempMouseMovePoint.x),
                                            Math.min(thatController.clickedPoints[0].y, thatController.tempMouseMovePoint.y),
                                            Math.abs(thatController.tempMouseMovePoint.x - thatController.clickedPoints[0].x),
                                            Math.abs(thatController.tempMouseMovePoint.y - thatController.clickedPoints[0].y),
                                            );
                                            
                        } else if (thatController.drawingType === "emsgroup") {
                            thatController.tempElement = thatController
                                .drawEmsGroup(
                                    Math.min(thatController.clickedPoints[0].x, thatController.clickedPoints[1].x),
                                    Math.min(thatController.clickedPoints[0].y, thatController.clickedPoints[1].y),
                                    Math.abs(thatController.clickedPoints[1].x - thatController.clickedPoints[0].x),
                                    Math.abs(thatController.clickedPoints[1].y - thatController.clickedPoints[0].y),
                                    null,
                                    true,
                                    true,
                                    null);
                        } else if (thatController.drawingType === "highlight") {
                            thatController.tempElement = new SvgHighlight(
                                thatController,
                                null,
                                "highlight",
                                thatController.pageNumber,
                                null,
                                0,
                                null,
                                0,
                                [],
                                [],
                                []);

                            thatController.tempElement
                                .create(
                                    Math.min(thatController.clickedPoints[0].x, thatController.tempMouseMovePoint.x),
                                    Math.min(thatController.clickedPoints[0].y, thatController.tempMouseMovePoint.y),
                                    Math.abs(thatController.tempMouseMovePoint.x - thatController.clickedPoints[0].x),
                                    Math.abs(thatController.tempMouseMovePoint.y - thatController.clickedPoints[0].y),
                                    );
                        } else if (["circ"].indexOf(thatController.drawingType) !== -1) {
                            thatController.clickedPoints.push({
                                x: e.offsetX,
                                y: e.offsetY
                            });
                            if (thatController.tempElement) thatController.tempElement.remove();
                            var tempClickedPoints = [];
                            Array.prototype.push.apply(tempClickedPoints, thatController.clickedPoints);
                            var a = thatController.tempMouseMovePoint.x - thatController.clickedPoints[0].x;
                            var b = thatController.tempMouseMovePoint.y - thatController.clickedPoints[0].y;
                            var r = Math.sqrt(a * a + b * b);

                            // thatController.tempElement = thatController
                            //     .drawCircle(
                            //         thatController.clickedPoints[0].x,
                            //         thatController.clickedPoints[0].y,
                            //         r,
                            //         r,
                            //         true);

                            thatController.tempElement = new SvgCircle(
                                thatController,
                                null,
                                "circ",
                                thatController.pageNumber,
                                null,
                                0,
                                null,
                                0,
                                [],
                                [],
                                []);

                            thatController.tempElement
                                .create(
                                    thatController.clickedPoints[0].x,
                                    thatController.clickedPoints[0].y,
                                    r,
                                    r
                                    );
                        } else if (["freeDraw"].includes(thatController.drawingType)) {
                            thatController.clickedPoints.push({
                                x: e.offsetX,
                                y: e.offsetY
                            });
                            if (thatController.tempElement) thatController.tempElement.remove();
                            //thatController.drawFreeDraw(thatController.clickedPoints, true);

                            thatController.tempElement = new SvgFreeDraw(
                                thatController,
                                null,
                                "freeDraw",
                                thatController.pageNumber,
                                null,
                                0,
                                null,
                                0,
                                [],
                                [],
                                []);

                            thatController.tempElement
                                .create(thatController.clickedPoints);
                                thatController.tempElement.element.attr({
                                    stroke: SvgGlobalControllerLogic.freeDrawProperties.color,
                                    "stroke-width": SvgGlobalControllerLogic.freeDrawProperties.strokeWidth
                                });
                                thatController.tempElement = null;

                            thatController.clickedPoints = [];
                            //thatController.stopDrawing();
                            console.log("freeDraw ==> stopped");
                        } else if (["line", "measurementbasic"].indexOf(thatController.drawingType) !== -1) {
                            thatController.clickedPoints.push({
                                x: e.offsetX,
                                y: e.offsetY
                            });

                            if (thatController.drawingType === "line") {
                                if (thatController.tempElement) thatController.tempElement.remove();
                                // thatController.drawLine(
                                //     thatController.clickedPoints[0].x,
                                //     thatController.clickedPoints[0].y,
                                //     thatController.clickedPoints[1].x,
                                //     thatController.clickedPoints[1].y,
                                //     true
                                // )

                                thatController.tempElement = new SvgLine(
                                    thatController,
                                    null,
                                    "line",
                                    thatController.pageNumber,
                                    null,
                                    0,
                                    null);
    
                                thatController.tempElement
                                    .create(
                                        thatController.clickedPoints[0].x,
                                        thatController.clickedPoints[0].y,
                                        thatController.tempMouseMovePoint.x,
                                        thatController.tempMouseMovePoint.y,
                                        );
                                
                            } else if (thatController.drawingType === "measurementbasic") {
                                if (SvgGlobalControllerLogic.isShiftKeyPressed && false) {
                                    var ln = thatController.tempElement.items.filter(el => el.type === "path");
                                    var ln = thatController.tempElement.items.filter(el => el.type === "path");
                                    var x1 = thatController.clickedPoints[0].x;
                                    var y1 = thatController.clickedPoints[0].y;
                                    var x2 = ln[0].attr("path")[1][5];
                                    var y2 = ln[0].attr("path")[1][6];

                                    var dx = x2 - x1;
                                    var dy = y2 - y1;
                                    var m = dy / dx;
                                    var b = y1 - m * x1;

                                    thatController.clickedPoints[1].y = m * thatController.clickedPoints[1].x + b;
                                }
                                if (thatController.tempElement) thatController.tempElement.remove();
                                // thatController.drawMeasurementbasic(
                                //     thatController.clickedPoints[0].x,
                                //     thatController.clickedPoints[0].y,
                                //     thatController.clickedPoints[1].x,
                                //     thatController.clickedPoints[1].y,
                                //     "top",
                                //     null,
                                //     null,
                                //     true
                                // )

                                thatController.tempElement = new SvgMeasurementToolBasic(
                                    thatController,
                                    null,
                                    "measurementbasic",
                                    thatController.pageNumber,
                                    null,
                                    0,
                                    null
                                );
                                thatController.tempElement.create(
                                    thatController.clickedPoints[0].x,
                                    thatController.clickedPoints[0].y,
                                    thatController.clickedPoints[1].x,
                                    thatController.clickedPoints[1].y,
                                    "top",
                                    null,
                                    null,
                                    true
                                );
                            }
                            thatController.stopDrawing();
                        }else if (!["freeDraw","polyline","cloud","callout"].includes(thatController.drawingType))thatController.stopDrawing();
                    } else if (e.isFinal && !e.isFirst && !thatController.isDrawing) {
                        if (thatController.drawingType === "selectall") {
                            console.log(thatController.drawingType);
                            if (thatController.tempElement !== null) {
                                //try {
                                thatController.drawingType = "select";
                                var x = thatController.clickedPoints[0].x - e.offsetX > 0 ? e.offsetX : thatController.clickedPoints[0].x;
                                var y = thatController.clickedPoints[0].y - e.offsetY > 0 ? e.offsetY : thatController.clickedPoints[0].y;
                                var w = Math.max(thatController.clickedPoints[0].x, e.offsetX) - Math.min(thatController.clickedPoints[0].x, e.offsetX);
                                var h = Math.max(thatController.clickedPoints[0].y, e.offsetY) - Math.min(thatController.clickedPoints[0].y, e.offsetY);
                                thatController.tempElement.remove();
                                thatController.tempElement = thatController.paper.rect(x, y, w, h);
                                var selectedItems = thatController.detectSelectedObjects(thatController.tempElement);
                                SvgGlobalControllerLogic.allSelectedObjects = selectedItems;
                                selectedItems.forEach(function (annotation) {
                                    SvgGlobalControllerLogic.isCtrlKeyPressed = true;
                                    if (thatController.tempElement !== annotation) {
                                        //thatController.drawControlBox(annotation, thatController.paper);
                                        thatController.drawControlBoxNoHandle(annotation, thatController.paper);
                                    }
                                });
                                thatController.tempElement.remove();
                                thatController.stopDrawing();

                                thatController.drawingType = "select";
                                //} catch (ex) {
                                //   console.error(ex);
                                //}
                                AnnotationApplication.RightSidebarController.closeSidebar();
                            }
                        }
                    }
                }
            });
           this.hammer.on("press", function (e) {
                // if (e.pointerType !== "mouse" && e.target.raphaelid) {
                //     var element = thatController.paper.getById(e.target.raphaelid);
                //     if (element.getAnnotationType() === "callout") {
                //         var docId = element.getDocumentAnnotationId();
                //         element = thatController.paper.set()
                //         var subElements = SvgGlobalControllerLogic.getElementsByDocumentAnnotationId(docId);
                //         var lines = subElements.filter(s => s.type === "path");
                //         var textbox = thatController.paper.set().push(
                //             subElements.filter(s => s.type === "text")[0],
                //             subElements.filter(s => s.type === "rect")[0]
                //         );
                //         lines.forEach(function (el) {
                //             element.push(el);
                //         });
                //         element.push(textbox);
                //     } else if (element.type !== "set" && element.getAnnotationType() === "textbox") {
                //         var docId = element.getDocumentAnnotationId();
                //         element = thatController.paper.set()
                //         var subElements = SvgGlobalControllerLogic.getElementsByDocumentAnnotationId(docId);
                //         subElements.forEach(function (el) {
                //             element.push(el);
                //         });
                //     }
                //     // thatController.rightClickHandler(
                //     //     element,
                //     //     thatController.paper,
                //     //     e
                //     // );
                //     console.log("RightClick", element);
                //     e.preventDefault();
                // } else if (e.pointerType !== "mouse" && e.target.localName === "svg") {
                if (e.pointerType !== "mouse" && e.target.localName === "svg") {
                    if (thatController.contextMenu) {
                        thatController.contextMenu.destroyContextMenu();
                    }
                    SvgGlobalControllerLogic.drawSelectBox();
                    thatController.rightClickHandler(e.target, thatController.paper, e);
                }
            });
            this.hammer.on("doubletap", function(e){
                if (["polyline"].indexOf(thatController.drawingType) !== -1
                    && thatController.clickedPoints.length > 0){
                       
                    e.offsetX = thatController.getXY(e, 1 / thatController.getScale()).x;
                    e.offsetY = thatController.getXY(e, 1 / thatController.getScale()).y;
                    thatController.clickedPoints.push({
                        x: e.offsetX,
                        y: e.offsetY
                    });
                    //thatController.drawPolyline(thatController.clickedPoints, false,true);
                    // thatController.tempElement = new SvgPolyline(
                    //     thatController,
                    //     null,
                    //     "polyline",
                    //     thatController.pageNumber,
                    //     null,
                    //     0,
                    //     null
                    // );
                    thatController.tempElement.create(thatController.clickedPoints, true, true);
                    thatController.clickedPoints = [];
                    thatController.polylineStartingPoint.remove();
                    thatController.stopDrawing();
                    if (thatController.tempElement) thatController.tempSet.remove();
                }
            });

        }
        // defining data for elements
        Raphael.el.getDocumentAnnotationId = function () {
            return this.data("DocumentAnnotationId");
        };
        Raphael.el.getPageId = function () {
            return this.data("PageId");
        };
        Raphael.el.getCreatedBy = function () {
            return this.data("CreatedBy");
        };
        Raphael.el.getCreatedOn = function () {
            return this.data("CreatedOn");
        };
        Raphael.el.getModifiedBy = function () {
            return this.data("ModifiedBy");
        };
        Raphael.el.getModifiedOn = function () {
            return this.data("ModifiedOn");
        };
        Raphael.el.getAngle = function () {
            return this.data("Angle");
        };
        Raphael.el.getAnnotationType = function () {
            return this.data("AnnotationType");
        };
        Raphael.el.getCalloutInfo = function () {
            return this.data("CalloutInfo");
        };
        Raphael.el.getTextAlign = function () {
            return this.data("TextAlign");
        };
        Raphael.el.getUnit = function () {
            return this.data("Unit");
        };
        Raphael.el.getScale = function () {
            return this.data("Scale");
        };

        Raphael.st.rotate = function (deg, cx, cy) {
            this.forEach(function (elm) {
                if (cx && cy) {
                    elm.rotate(deg, cx, cy);
                } else {
                    elm.rotate(deg);
                }

            });
        };

        Raphael.st.setAngle = function (deg) {
            this.forEach(function (elm) {
                if (elm.type === "set") {
                    elm.setAngle(deg);
                } else {
                    elm.data("Angle", deg);
                }
            });
        };

        Raphael.st.getAngle = function () {
            return this.items.filter(s => s.type !== "set")[0].getAngle();
        };

        //this.drawLine(300, 100, 500, 500, false);
    };

    SvgController.prototype = {
        constructor: SvgController,

        getScale: function () {
            return PDFViewerApplication.pdfViewer.currentScale;
        },

        getXY: function (event, scaleFactor) {
            var that = this;
            var rotation = PDFViewerApplication.pdfViewer.getPageView(that.pageNumber - 1).rotation;
            var paperWidth = (typeof that.paper.width === "number") ? that.paper.width : parseInt(that.paper.width.replace("px", ""));
            var paperHeight = (typeof that.paper.height === "number") ? that.paper.height : parseInt(that.paper.height.replace("px", ""));
            if (typeof scaleFactor === "undefined" || isNaN(scaleFactor)) {
                scaleFactor = 1;
            }
            var layerX;
            var layerY;
            if ("layerX" in event) {
                layerX = event.layerX;
                layerY = event.layerY;
            } else if("originalEvent" in event) {
                layerX = event.originalEvent.layerX;
                layerY = event.originalEvent.layerY;
             } else if("srcEvent" in event) {
                    layerX = event.srcEvent.layerX;
                    layerY = event.srcEvent.layerY;
            } else if("pointers" in event){
                layerX = event.pointers[0].layerX;
                layerY = event.pointers[0].layerY;
            } else if("touches" in event){
                layerX = event.touches[0].clientX;
                layerY = event.touches[0].clientY;

                // var myoffset = that.getTouchOffset($("#pageContainer" + that.pageNumber + ":first"));
                // layerX = event.touches[0].pageX - myoffset.left;
                // layerY = event.touches[0].pageY - myoffset.top;
            }
            if( navigator.userAgent.search("Firefox") >= 0){
                return {
                    x: layerX * scaleFactor,
                    y: layerY * scaleFactor
                }
            }
            if (true ) {
                //console.log("Firefox", rotation);
                switch (rotation) {
                    case 0:
                        return {
                            x: layerX * scaleFactor,
                            y: layerY * scaleFactor
                        };
                        break;
                    case 90:
                        return {
                            /*
                            y: paperHeight - layerX * scaleFactor,
                            x: layerY * scaleFactor
                            */
                            y: (paperHeight - layerX) * scaleFactor,
                            x: layerY * scaleFactor
                        };
                        break;
                    case 180:
                        return {
                            x: (paperWidth - layerX) * scaleFactor,
                            y: (paperHeight - layerY) * scaleFactor
                        };
                        break;
                    case 270:
                        var position = $("#raphael" + this.pageNumber).position();
                        var left = parseInt($("#raphael" + this.pageNumber).css("left"));
                        var top = parseInt($("#raphael" + this.pageNumber).css("top"));
                        //console.log(position);
                        return {
                            y: (layerX) * scaleFactor,
                            x: (paperWidth - layerY) * scaleFactor
                        };
                        break;
                    case 360:
                        return {
                            x: layerX * scaleFactor,
                            y: layerY * scaleFactor
                        };
                        break;

                }
                return {
                    x: layerX * scaleFactor,
                    y: paperHeight - layerY * scaleFactor
                };
            } else {
                return {
                    x: event.offsetX * scaleFactor,
                    y: event.offsetY * scaleFactor
                };
            }
        },

        getDXDY: function (_dx, _dy, scaleFactor) {
            var that = this;
            var rotation = PDFViewerApplication.pdfViewer.getPageView(that.pageNumber - 1).rotation;
            var paperWidth = (typeof that.paper.width === "number") ? that.paper.width : parseInt(that.paper.width.replace("px", ""));
            var paperHeight = (typeof that.paper.height === "number") ? that.paper.height : parseInt(that.paper.height.replace("px", ""));
            if (typeof scaleFactor === "undefined" || isNaN(scaleFactor)) {
                scaleFactor = 1;
            }
            var layerX;
            var layerY;
            /*
            if ("layerX" in event) {
                layerX = event.layerX;
                layerY = event.layerY;
            } else if("originalEvent" in event) {
                layerX = event.originalEvent.layerX;
                layerY = event.originalEvent.layerY;
            }
            */
            
            
            if (true || navigator.userAgent.search("Firefox") >= 0) {
                //console.log("Firefox", rotation);
                switch (rotation) {
                    case 0:
                        return {
                            dx: _dx,
                            dy: _dy
                        };
                        break;
                    case 90:
                        return {
                            /*
                            y: paperHeight - layerX * scaleFactor,
                            x: layerY * scaleFactor
                            */
                            dy: -_dx,
                            dx: _dy
                        };
                        break;
                    case 180:
                        return {
                            dx: -_dx,
                            dy: -_dy
                        };
                        break;
                    case 270:
                        return {
                            dy: _dx,
                            dx: -_dy
                        };
                        break;
                    case 360:
                        return {
                            dx: _dx,
                            dy: _dy
                        };
                        break;

                }
                return {
                    dx: _dx,
                    dy: _dy
                };
            } else {
                return {
                    dx: _dx,
                    dy: _dy
                };
            }
        },

        //====================================================================
        //====================== Drawing =====================================
        //====================================================================

        drawLine: function (x1, y1, x2, y2, insertToDb) {
            var that = this;
            var paperWidth = parseInt(that.paper.width.replace("px", ""));
            var paperHeight = parseInt(that.paper.height.replace("px", ""));
            [x1, x2].forEach(function (p) {
                p = p < 5 ? 0 : p;
                p = p > paperWidth ? paperWidth - 5 : p;
            });
            [y1, y2].forEach(function (p) {
                p = p < 5 ? 0 : p;
                p = p > paperHeight ? paperHeight : p;
            });

            var ts = null;//touchstart
            var te = null;//touchend
            var tm = null;//touchmove

            var line = this.paper.path("M " + x1 + " " + y1 + " L " + x2 + " " + y2);
            if(ROLE !== "Anonymous"){
                line.click(function (e) {
                        that.onElementClick(line, that.paper, "line");
                        /*
                        SvgGlobalControllerLogic.selectedObject = {
                            element: line,
                            svgController: that
                        };
                        console.log("clicked: ", e);
                        that.clearAllJoints();
                        that.clearAllCtrlBoxes();
                        that.drawJoints(line, "line");
    */
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
                        var element = that.getElementByDocId(this.data("DocumentAnnotationId"));
                        that.mouseupHandler(e, element, element.paper, "line");
                    })
                    .touchstart(function (e) {
                        console.log("touchstart", e);
                        ts = e;
                    })
                    .touchend(function (e) {
                        console.log("touchend", e);
                        te = e;
                        if (te.timeStamp - ts.timeStamp < 500) {
                            // tap
                            that.onElementClick(line, that.paper, "line");
                        }
                    })
                    .touchmove(function (e) {
                        console.log("touchmove", e);
                        tm = e;

                    })
            }
            line.attr({
                    fill: '#3a7ce8',
                    stroke: '#009EE3',
                    'stroke-width': 5,
                    'arrow-end': "none",
                    'arrow-start': 'none',
                    'stroke-dasharray': that.clickedPoints.length > 1 ? "" : "-"
                })
                .drag(
                    function (dx, dy, x, y, e) {  // move
                        var dxdy = that.getDXDY(dx, dy);
                        dx = dxdy.dx;
                        dy = dxdy.dy;
                        that.onElementDragging(line, dx, dy, x, y, e, "line");
                        e.stopPropagation();
                    }, function (x, y) {  // start
                        that.onElementDragStart(line, x, y, "line");
                    }, function (e) {  //end
                        that.onElementDragEnd(line, e, "line");
                    });
            //line.scale(PDFViewerApplication.pdfViewer.currentScale);
            //console.log("drawLine", line);
            if (insertToDb) that.createLineOnDb(line, [x1, y1, x2, y2]);
            return line;
        },

        drawMeasurementbasic: function (x1, y1, x2, y2, textPosition, unit, scale, insertToDb, baseAngle) {
            var that = this;
            baseAngle = (baseAngle === undefined || baseAngle === null) ? that.getPageRotation(): baseAngle;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            //textPosition = "";
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
            /*
                        if (that.tempElement !== null && that.tempElement.type === "set") that.tempElement.forEach(function (element) {
                            element.remove();
                        });
                        */
            var angle = Raphael.angle(x1, y1, x2, y2);
            var pathTotal = this.paper.path("M " + x1 + " " + y1 + " L " + x2 + " " + y2);
            var totalLength = Raphael.getTotalLength(pathTotal.attr("path"));
           
            var txtValue = Number.parseFloat(totalLength * scale).toFixed(2);
            // if (kendo.culture().name === "de-DE") {
            //     txtValue = txtValue.replace('.', ',');
            // }
            var txtbox = that.paper.text(
                x1 + (x2 - x1) / 2,
                y1 + (y2 - y1) / 2,
                SvgGlobalControllerLogic.formatMeasurementText(txtValue,unit)// + " " + unit
            );
            txtbox.attr({
                fill: "black",
                "font-size": 15
            });

            var temptextPosition = textPosition;
            if([270,180].includes(baseAngle)){
                if(textPosition==="top"){
                    temptextPosition = "bottom";
                }else if(textPosition==="bottom"){
                    temptextPosition = "top";
                }
            }
            
            txtbox.data("Angle",baseAngle);
            switch (temptextPosition) {
                case "top":
                    txtbox.data("TextAlign", textPosition);
                    txtbox.translate(-1 * Math.abs(20 * Math.sin(angle * 3.14 / 180)), -1 * Math.abs(20 * Math.cos(angle * 3.14 / 180)));
                    txtbox.data("Scale", scale);
                    txtbox.data("Unit", unit);
                    break;
                case "bottom":
                    txtbox.data("TextAlign", textPosition);
                    txtbox.translate(Math.abs(20 * Math.sin(angle * 3.14 / 180)), Math.abs(20 * Math.cos(angle * 3.14 / 180)));
                    txtbox.data("Scale", scale);
                    txtbox.data("Unit", unit);
                    break;
                default:
                    txtbox.data("TextAlign", textPosition);
                    txtbox.data("Unit", unit);
                    txtbox.data("Scale", scale);

            }



            var txtbbox = txtbox.getBBox();
            //switch(that.getPageRotation()){
            switch(baseAngle){
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
            
            
            // because of the rotated page:
            //txtbox.rotate(-1*that.getPageRotation());
            var set = that.paper.set();

            if (textPosition === "top" || textPosition === "bottom") {
                pathTotal.attr({
                    "arrow-start": "block",
                    "arrow-end": "block",
                    "stroke-width": 3,
                    "stroke": "#009EE3"
                });
                set.push(
                    pathTotal,
                    txtbox
                );
            } else {

                var eachLineLength = (totalLength - txtbbox.width) / 2;

                var pathLine1 = Raphael.getSubpath(pathTotal.attr("path"), 0, eachLineLength);
                var pathLine2 = Raphael.getSubpath(pathTotal.attr("path"), eachLineLength + txtbbox.width, totalLength);

                var Line1 = that.paper.path(pathLine1)
                    .attr({
                        "arrow-start": "block",
                        "stroke-width": 3,
                        "stroke": "#009EE3"
                    });

                var Line2 = that.paper.path(pathLine2)
                    .attr({
                        "arrow-end": "block",
                        "stroke-width": 3,
                        "stroke": "#009EE3"
                    });

                pathTotal.remove();
                set.push(
                    txtbox,
                    Line1,
                    Line2
                );
            }
            that.MeasurementSets.push(set);

            if(ROLE !== "Anonymous"){
                that.bindEventsToElement(set, that.paper, 'measurementbasic');
            }

            set.forEach(function (el) {
                el.data("AnnotationType", "measurementbasic");
            })

            //console.log("drawMeasurementbasic", set);
            if (insertToDb) that.createMeasurementbasicOnDb(set, textPosition);
            return set;
        },

        drawPolyline: function (points, closePath, saveToDb) {
            var that = this;
            var path = "";
            path += ("M " + points[0].x + " " + points[0].y + " ");

            for (var i = 1; i < points.length; i++) {
                path += ("L " + points[i].x + " " + points[i].y + " ");
            }

            //if (closePath) path += ("z");

            var ox = 0;
            var oy = 0;
            var nx = 0;
            var ny = 0;

            var ts = null;//touchstart
            var te = null;//touchend
            var tm = null;//touchmove

            var polyline = this.paper.path(path);
            if(ROLE !== "Anonymous"){polyline
                
                .click(function (e) {
                    /*
                    //console.log("clicked: ", e);
                    SvgGlobalControllerLogic.selectedObject = {
                        element: polyline,
                        svgController: that
                    };
                    that.clearAllJoints();
                    that.clearAllCtrlBoxes();
                    if (!that.isDrawing) that.drawJoints(polyline, "polyline");
                    //console.log(this.data("DocumentAnnotationId"));
                    */
                    that.onElementClick(polyline, that.paper, "polyline");
                })
                .mouseover(function (e) {
                    ////console.log(e);
                    $(e.target).css("cursor", "pointer");
                })
                .mouseout(function (e) {
                    ////console.log(e);
                    $(e.target).css("cursor", "default");
                })
                .drag(
                    function (dx, dy, x, y, e) {  // move
                        x = that.getXY(e, 1 / that.getScale()).x;
                        y = that.getXY(e, 1 / that.getScale()).y;
                        var dxdy = that.getDXDY(dx, dy);
                        dx = dxdy.dx;
                        dy = dxdy.dy;
                        console.log("dxdy", dxdy.dx + ":" + dxdy.dy);
                        that.onElementDragging(polyline, dx, dy, x, y, e, "polyline");
                        /*
                        if (!that.isDrawing) {
                            var lx = dx;// + ox ;
                            var ly = dy;// + oy ;

                            nx = x;
                            ny = y;

                            polyline.transform("T" + lx + "," + ly);
                        }
                        */
                        //polyline.translate(startDragPoint.x - x, startDragPoint.y - y);
                    }, function (x, y) {  // start
                        ox = this.attr("x");
                        oy = this.attr("y");
                        that.clearAllJoints();
                    }, function (e) {  //end
                        if (!that.isDrawing) {
                            that.onElementDragEnd(polyline, e, "polyline");
                            /*
                            var lx = nx - ox;
                            var ly = ny - oy;
                            var polyPoints = [];
                            polyline.attrs.path.forEach(function (m) {
                                if (m[0].toLowerCase() !== "z") {
                                    m[1] += polyline.matrix.split().dx;
                                    m[2] += polyline.matrix.split().dy;
                                    polyPoints.push({
                                        x: m[1],
                                        y: m[2]
                                    });
                                }
                            });
                            polyline.transform("");

                            var pathTemp = "";
                            pathTemp += ("M " + polyline.attrs.path[0][1] + " " + polyline.attrs.path[0][2] + " ");

                            for (var j = 1; j < polyline.attrs.path.length; j++) {
                                if (polyline.attrs.path[j][0].toLowerCase() !== "z") {
                                    pathTemp += ("L " + polyline.attrs.path[j][1] + " " + polyline.attrs.path[j][2] + " ");
                                }
                            }
                            pathTemp += "z";
                            polyline.attr({
                                path: pathTemp
                            });
                            that.updatePolylineOnDb(polyline, polyPoints);
                            */
                        }
                    }
                )
                .touchstart(function (e) {
                    console.log("touchstart", e);
                    ts = e;
                })
                .touchend(function (e) {
                    console.log("touchend", e);
                    te = e;
                    if (te.timeStamp - ts.timeStamp < 500) {
                        // tap
                        that.onElementClick(polyline, that.paper, "polyline");
                    }
                })
                .touchmove(function (e) {
                    console.log("touchmove", e);
                    tm = e;

                })
                .mouseup(function (e) {
                    var element = that.getElementByDocId(this.data("DocumentAnnotationId"));
                    that.mouseupHandler(e, element, element.paper, "polyline");
                })
            }
                polyline.attr({
                    fill: '',
                    stroke: '#009EE3',
                    'stroke-width': 5,
                    'stroke-dasharray': saveToDb ? "" : "-"
                });

            polyline.data("AnnotationType", "polyline");
            //console.log("drawPolyline", polyline);



            if (saveToDb) that.createPolylineOnDb(polyline, points);

            return polyline;
        },

        drawCloud: function (points, closePath, saveToDb) {
            var that = this;
            var path = "";
            path += ("M " + points[0].x + " " + points[0].y + " ");

            for (var i = 1; i < points.length; i++) {
                path += ("L " + points[i].x + " " + points[i].y + " ");
            }

            var curvedPath = path;
            if (closePath) {
                path += ("z");

            }

            if (closePath) path = SvgGlobalControllerLogic.CreateCloudPath(points);
            var curvedPathArr = Raphael.path2curve(path);
            curvedPath = "";
            for (var i = 0; i < curvedPathArr.length; i++) {
                for (var j = 0; j < curvedPathArr[i].length; j++) {
                    curvedPath += (curvedPathArr[i][j] + " ");
                }
            }
            //console.log(curvedPath);

            var ox = 0;
            var oy = 0;
            var nx = 0;
            var ny = 0;

            var ts = null;//touchstart
            var te = null;//touchend
            var tm = null;//touchmove

            var cloud = this.paper.path(curvedPath);
            if(ROLE !== "Anonymous"){cloud
                .touchstart(function (e) {
                    console.log("touchstart", e);
                    ts = e;
                })
                .touchend(function (e) {
                    console.log("touchend", e);
                    te = e;
                    if (te.timeStamp - ts.timeStamp < 500) {
                        // tap
                        that.onElementClick(cloud, that.paper, "cloud");
                    }
                })
                .touchmove(function (e) {
                    console.log("touchmove", e);
                    tm = e;

                })
                .click(function (e) {
                    /*
                    SvgGlobalControllerLogic.selectedObject = {
                        element: cloud,
                        svgController: that
                    };
                    //console.log("clicked: ", e);
                    that.clearAllJoints();
                    that.clearAllCtrlBoxes();
                    if (!that.isDrawing) that.drawJoints(cloud, "cloud");
                    //console.log(this.data("DocumentAnnotationId"));
                    */
                    that.onElementClick(cloud, that.paper, "cloud");
                })
                .mouseover(function (e) {
                    //console.log(e);
                    $(e.target).css("cursor", "pointer");
                })
                .mouseout(function (e) {
                    //console.log(e);
                    $(e.target).css("cursor", "default");
                })
                .drag(
                    function (dx, dy, x, y, e) {  // move
                        var dxdy = that.getDXDY(dx, dy);
                        dx = dxdy.dx;
                        dy = dxdy.dy;
                        that.onElementDragging(cloud, dx, dy, x, y, e, "cloud");
                        /*
                        if (!that.isDrawing) {
                            var lx = dx;// + ox ;
                            var ly = dy;// + oy ;

                            nx = x;
                            ny = y;

                            cloud.transform("T" + lx + "," + ly);
                        }
                        */
                        //cloud.translate(startDragPoint.x - x, startDragPoint.y - y);
                    }, function (x, y) {  // start
                        ox = this.attr("x");
                        oy = this.attr("y");
                        that.clearAllJoints();
                    }, function (e) {  //end
                        that.onElementDragEnd(cloud, e, "cloud");
                        /*
                        if (!that.isDrawing) {
                            var lx = nx - ox;
                            var ly = ny - oy;
                            var polyPoints = [];
                            cloud.attrs.path.forEach(function (m) {
                                if (["m"].includes(m[0].toLowerCase())) {
                                    m[1] += cloud.matrix.split().dx;
                                    m[2] += cloud.matrix.split().dy;
                                    polyPoints.push({
                                        x: m[1],
                                        y: m[2]
                                    });
                                }
                            });
                            cloud.transform("");

                            var pathTemp = "";
                            pathTemp += ("M " + cloud.attrs.path[0][1] + " " + cloud.attrs.path[0][2] + " ");

                            for (var j = 1; j < cloud.attrs.path.length; j++) {
                                if (cloud.attrs.path[j][0].toLowerCase() !== "z") {
                                    pathTemp += ("L " + cloud.attrs.path[j][1] + " " + cloud.attrs.path[j][2] + " ");
                                }
                            }
                            pathTemp += "z";
                            pathTemp = SvgGlobalControllerLogic.CreateCloudPath(polyPoints);
                            cloud.attr({
                                path: pathTemp
                            });
                            that.updateCloudOnDb(cloud, polyPoints);
                        }
                        */
                    }
                )
                .mouseup(function (e) {
                    var element = that.getElementByDocId(this.data("DocumentAnnotationId"));
                    that.mouseupHandler(e, element, element.paper, "cloud");
                })
            }
            cloud.attr({
                    fill: '',
                    stroke: '#009EE3',
                    'stroke-width': 5,
                    'stroke-dasharray': closePath ? "" : "-"
                });
            //console.log("drawPCloud", cloud);
            cloud.data("AnnotationType", "cloud");


            if (saveToDb) that.createCloudOnDb(cloud, points);

            return cloud;
        },

        drawRect: function (x, y, w, h, insertToDb, callback) {
            var that = this;
            var paper = that.paper;
            var rect = paper.rect(x, y, w, h);
            that.bindEventsToElement(rect, paper, 'rect');

            rect.attr({
                fill: '',
                stroke: '#009EE3',
                'stroke-width': 5,
                'stroke-dasharray': insertToDb ? "" : "-"
            });
            if (insertToDb) that.createRectOnDb(rect, callback);
            return rect;
        },

        drawHighlight: function (x, y, w, h, insertToDb) {
            var that = this;
            var paper = that.paper;
            var highlight = paper.rect(x, y, w, h);
            that.bindEventsToElement(highlight, paper, 'highlight');

            highlight.attr({
                fill: 'yellow',
                opacity: 0.3,
                stroke: '#009EE3',
                'stroke-width': 1,
                'stroke-dasharray': insertToDb ? "" : "-"
            });
            if (insertToDb) that.createHighlightOnDb(highlight);
            return highlight;
        },

        drawCircle: function (x, y, rx, ry, insertToDb) {
            var that = this;
            var paper = that.paper;
            var circle = paper.ellipse(x, y, rx, ry);
            that.bindEventsToElement(circle, paper, 'circ');

            circle.attr({
                fill: '',
                stroke: '#009EE3',
                'stroke-width': 5,
                'stroke-dasharray': insertToDb ? "" : "."
            });
            if (insertToDb) that.createCircleOnDb(circle);
            return circle;
        },

        drawStamp: function (url, x, y, w, h, insertToDb) {
            var that = this;
            var paper = that.paper;
            if (url.startsWith("data:image")) {
                var stamp = paper.image("", x, y, w, h);
                stamp.attr({ src: url });
            } else {
                var stamp = paper.image(url, x, y, w, h);
            }
            that.bindEventsToElement(stamp, paper, 'stamp');
            stamp.attr({
                fill: '',
                stroke: '#009EE3',
                'stroke-width': 5,
                'stroke-dasharray': insertToDb ? "" : "."
            });
            if (insertToDb) {
                stamp.data("Angle", -1 * that.getPageRotation());
                stamp.rotate(-1 * that.getPageRotation());
                that.createStampOnDb(stamp);
            }
            return stamp;
        },

        drawImage: function (url, preSignedUrl, x, y, w, h, childDocumentId, insertToDb, callback) {
            var that = this;
            var paper = that.paper;

            if (url.startsWith("data:image")) {
                var image = paper.image("", x, y, w, h);
                image.attr({ src: url });
                image.data("AnnotationType", "image");
                that.bindEventsToElement(image, paper, 'image');
                image.attr({
                    fill: '',
                    stroke: '#009EE3',
                    'stroke-width': 5,
                    'stroke-dasharray': insertToDb ? "" : "."
                });




                if (callback) callback(image);
                if (insertToDb) that.createImageOnDb(image, url, childDocumentId);
                return image;
            } else if (!(preSignedUrl === null)) {
                var image = paper.image(preSignedUrl, x, y, w, h);
                image.data("Src", url);
                image.data("AnnotationType", "image");
                that.bindEventsToElement(image, paper, 'image');
                image.attr({
                    fill: '',
                    stroke: '#009EE3',
                    'stroke-width': 5,
                    'stroke-dasharray': insertToDb ? "" : "."
                });

                if (callback) callback(image);
                if (insertToDb) {
                    image.data("Angle", -1 * that.getPageRotation());
                    image.rotate(-1 * that.getPageRotation());
                    that.createImageOnDb(image, url);
                }
                return image;
            } else {

                //var url = "/api/Document/GetPresignedURL/" + response[0].Document.DocumentId + "/" + response[0].Document.Extensions[0].replace(".", "")

                $.ajax({
                    url: url,
                    type: "GET",
                    dataType: "json",
                    headers: {
                        Authorization: "Bearer " + window.AuthenticationToken
                    },
                    success: function (response) {
                        var width = 0;
                        var height = 0;
                        var img = new Image();
                        img.onload = function () {
                            width = img.width;
                            height = img.height;

                            that.tempElement = that
                                .drawImage(
                                    //url,
                                    img.src,
                                    response,
                                    x,
                                    y,
                                    w,
                                    h,
                                    childDocumentId,
                                    false,
                                    callback);
                            that.clickedPoints = [];
                            that.stopDrawing();
                        };
                        img.src = response;
                    },
                    error: function (response) {
                        console.log(response);
                    }
                });
            }

        },

        drawText: function (x, y, txt, insertToDb, fontSize) {
            var that = this;
            var paper = that.paper;
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
            ).attr({ fill: "yellow" });
            text.toFront();
            var set = paper.set();
            set.push(text, rect);

            that.bindEventsToElement(set, paper, 'textbox');
            if (insertToDb) {
                set.rotate(-1 * that.getPageRotation());
                set.setAngle(-1 * that.getPageRotation());
                that.createTextboxOnDb(set);
            }
            return set;
        },

        drawCallout: function (points, text, closePath, fontSize, insertToDb, baseAngle) {
            var that = this;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;

            if (that.clickedPoints.length > 0) {
                if (that.tempElement !== null && that.tempElement.type === "set") that.tempElement.forEach(function (element) {
                    element.remove();
                });
                switch (points.length) {
                    case 1:
                        that.tempElement = that.paper.set();
                        that.tempElement.push(
                            that.paper.circle(points[0].x, points[0].y, 5 / currentScale, 5 / currentScale, false).attr({
                                "stroke-dasharray": "",
                                "fill": "silver"
                            })
                        );
                        break;
                    case 2:
                        that.tempElement = that.paper.set();
                        that.tempElement.push(
                            that.paper.circle(points[0].x, points[0].y, 5 / currentScale, 5 / currentScale, false).attr({
                                "stroke-dasharray": "",
                                "fill": "silver"
                            }),
                            that.paper.circle(points[1].x, points[1].y, 5 / currentScale, 5 / currentScale, false).attr({
                                "stroke-dasharray": "",
                                "fill": "silver"
                            }),
                            that.drawLine(points[1].x, points[1].y, points[0].x, points[0].y, false).attr({
                                "stroke-dasharray": "",
                                "fill": "silver"
                            })
                        );
                        break;
                    case 3:
                        var l1 = that.drawLine(points[1].x, points[1].y, points[0].x, points[0].y, false).attr({
                            "stroke-dasharray": "",
                            "fill": "silver"
                        });
                        l1.attr({
                            "arrow-end": "classic"
                        });
                        var l2 = that.drawLine(points[1].x, points[1].y, points[2].x, points[2].y, false).attr({
                            "stroke-dasharray": "",
                            "fill": "silver"
                        });
                        that.tempElement = that.paper.set();
                        that.tempElement.push(
                            l1,
                            l2
                        );
                        break;
                    case 4:
                        var l1 = that.paper.path("M " + points[1].x + " " + points[1].y + " L " + points[0].x + " " + points[0].y).attr({
                            "stroke-dasharray": "",
                            "fill": "silver",
                            "arrow-end": "classic",
                            fill: '#3a7ce8',
                            stroke: '#009EE3',
                            'stroke-width': 5
                        });
                        var l2 = that.paper.path("M " + points[1].x + " " + points[1].y + " L " + points[2].x + " " + points[2].y).attr({
                            "stroke-dasharray": "",
                            "fill": "silver", fill: '#3a7ce8',
                            stroke: '#009EE3',
                            'stroke-width': 5
                        });

                        var textbox = that.drawText(points[2].x, points[2].y, text, false, fontSize);
                        var textElm = textbox.items.filter(s=>s.type === "text")[0];
                        var rectElm = textbox.items.filter(s=>s.type === "rect")[0];
                        textElm.rotate(-1 * baseAngle, points[2].x, points[2].y);
                        rectElm.rotate(-1 * baseAngle, points[2].x, points[2].y);
                        textElm.data("Angle", -baseAngle);
                        rectElm.data("Angle", -baseAngle);

                        textbox.data("isCalloutTextbox", l2.id);


                        var txtBBox = textbox.getBBox();
                        textbox.forEach(function (el) {
                            //el.attr("x", 1 + el.attr("x") + txtBBox.width / 2);
                        });
                        var callout = that.paper.set();
                        callout.push(
                            l1,
                            l2,
                            textbox
                        );

                        textbox[0].data("parent", callout);

                        that.bindEventsToElement(callout, that.paper, 'callout');


                        console.log(callout);
                        if (insertToDb) {
                            that.createCalloutOnDb(callout);
                        }

                        that.stopDrawing();
                        return callout;
                        break;
                }
            }
        },

        drawFreeDraw: function (points, insertToDb) {
            var that = this;
            var path = "";
            path += ("M " + points[0].x + " " + points[0].y + " ");

            for (var i = 1; i < points.length; i++) {
                path += ("L " + points[i].x + " " + points[i].y + " ");
            }


            var freeDraw = this.paper.path(path)
                .attr({
                    fill: '',
                    stroke: SvgGlobalControllerLogic.freeDrawProperties.color,
                    'stroke-width': SvgGlobalControllerLogic.freeDrawProperties.strokeWidth,
                    'stroke-dasharray': ""
                });
            if(ROLE !== "Anonymous"){
                freeDraw.mouseover(function (e) {
                    //console.log(e);
                    $(e.target).css("cursor", "pointer");
                })
                    .mouseout(function (e) {
                        //console.log(e);
                        $(e.target).css("cursor", "default");
                    })
                    .mouseup(function (e) {
                        var element = that.getElementByDocId(this.data("DocumentAnnotationId"));
                        that.mouseupHandler(e, element, element.paper, "freeDraw");
                    })
                    .click(function(e){
                        that.onElementClick(freeDraw, that.paper, "freedraw");
                    })
                    .drag(
                        function (dx, dy, x, y, e) {  // move
                            var dxdy = that.getDXDY(dx, dy);
                            dx = dxdy.dx;
                            dy = dxdy.dy;
                            that.onElementDragging(freeDraw, dx, dy, x, y, e, "freedraw");
                            e.stopPropagation();
                        }, function (x, y) {  // start
                            that.onElementDragStart(freeDraw, x, y, "freedraw");
                        }, function (e) {  //end
                            that.onElementDragEnd(freeDraw, e, "freedraw");
                        });
            }

            //console.log("drawFreeDraw", freeDraw);



            if (insertToDb) that.createFreeDrawOnDb(freeDraw, points);

            return freeDraw;
        },

        drawEmsGroup: function (x, y, w, h, emsNodeId, drawQr, insertToDb, fontSize, baseAngle, callback, updateLeftAndTop) {
            var that = this;

            var angle = this.getPageRotation();
            var tx = x;
            var ty = y;
            var tw = w;
            var th = h;
            switch (angle) {
                case 0:
                    break;
                case 90:
                    tx = y;
                    ty = x;
                    break;
                case 180:

                    break;
                case 270:
                    tx = y;
                    ty = x;
                    break;
            }

            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var EmsNodeId = emsNodeId ? emsNodeId : AnnotationApplication.DrawStateService.getEmsNode().id;
            var EMSNodeName = emsNodeId ? emsData[emsNodeId].Name : AnnotationApplication.DrawStateService.getEmsNode().name

            var isElement = false;
            if (emsData[emsNodeId]) {
                isElement = emsData[emsNodeId].Type === "ELEMENT";
            }

            if (isElement) {
                w = 1;
                h = 0;
            }


            var l = x;
            var t = y;



            if (updateLeftAndTop) {
                l = l + ((-45 + fontSize * 5.43));
                t = t + (45);
            }

            var txt = EMSNodeName;

            var textbox = that.drawText(x, y, txt, false, fontSize);
            textbox[0].EmsNodeId = EmsNodeId;
            textbox.items.filter(s => s.type === "rect").forEach(function (r) {
                r.undrag();
            });
            var bbox = textbox.getBBox();

            var emsNode = emsData[emsNodeId];
            var status = emsNode.CurrentStatus;//window.parent.FilterStatusesLogic.GetCurrentElementStatus(EmsNode);
            var color = emsNode.Color;//window.parent.FilterStatusesLogic.GetStatusColorHex(status);


            var paperWidth = parseInt(that.paper.width.replace("px", ""));
            var paperHeight = parseInt(that.paper.height.replace("px", ""));
            switch (angle) {
                case 0:
                    l = l + bbox.width / 2;
                    t = t + bbox.height / 2;
                    break;
                case 90:
                    l = l + bbox.height / 2;
                    t = t + h - bbox.width / 2;
                    break;
                case 180:
                    l = l + w - bbox.width / 2;
                    t = t + h - bbox.height / 2;
                    break;
                case 270:
                    l = l + w - bbox.height / 2;
                    t = t + bbox.width / 2;
                    break;
            }

            // Why this?
            // because the annotation text should also rotate to keep the
            // location when rotating the page to its angle
            switch (angle) {
                case 0: // 0 or 180 degree difference
                    switch (baseAngle) {
                        case 0:
                            l = l;
                            t = t;
                            break;
                        case 90:
                            l = l - bbox.height / 2;
                            t = t + h - bbox.width;
                            break;
                        case 180:
                            l = l + w - bbox.width;
                            t = t + h - bbox.height;
                            break;
                        case 270:
                            l = l + w - bbox.width / 2;
                            t = t + bbox.height;
                            break;
                    }
                    break;
                case 90:
                    switch (baseAngle) {
                        case 0:
                            l = l + bbox.height / 2;
                            t = t - h + bbox.width;
                            break;
                        case 90:
                            l = l;//- bbox.height/2;
                            t = t;//+ h - bbox.width;
                            break;
                        case 180:
                            l = l + w - bbox.width / 2;
                            t = t + bbox.height / 2;
                            break;
                        case 270:
                            l = l + w - bbox.height;
                            t = t - h + bbox.width;
                            break;
                    }
                    break;
                case 180:
                    switch (baseAngle) {
                        case 0:
                            l = l - w + bbox.width;
                            t = t - h + bbox.height;
                            break;
                        case 90:
                            l = l - w + bbox.width / 2;
                            t = t - bbox.height / 2;
                            break;
                        case 180:
                            l = l;
                            t = t;
                            break;
                        case 270:
                            l = l + bbox.height / 2;
                            t = t - h + bbox.width / 2;
                            break;
                    }
                    break;
                case 270:
                    switch (baseAngle) {
                        case 0:
                            l = l - w + bbox.width;
                            t = t - bbox.height / 2;
                            break;
                        case 90:

                            l = l - w + bbox.height;
                            t = t + h - bbox.width;
                            break;
                        case 180:

                            l = l - bbox.width / 2;
                            t = t + h - bbox.width / 2;
                            break;
                        case 270:
                            l = l;
                            t = t;
                            break;
                    }
                    break;
            }

            /*
            switch(Math.abs(baseAngle - angle)){
                case 0:
                break;
                case 90:
                    if(angle%180 === 90){ //0 or 180
                        if(baseAngle===270){
                            l = l ;//+ bbox.height / 2;
                            t = t - h + bbox.width;
                        }else{
                            l = l - bbox.height / 2;
                            t = t + h - bbox.width;
                        }
                    }else{
                        if(baseAngle===270){ // 90 or 270
                            l = l ;//+ bbox.height / 2;
                            t = t + 50;//- h + bbox.width;
                        }else{
                            l = l - bbox.height / 2;
                            t = t + h - bbox.width;
                        }
                        
                    }
                break;
                case 180:
                    if(angle%180 === 90){
                        // angle = 90 or 270
                        l = l + w - bbox.height;
                        t = t - h + bbox.width;
                        if(angle === 180){
                            
                        }else{
                            l = l + w - bbox.height;
                            t = t - h + bbox.width;
                        }
                    }else{
                        // angle = 0 or 180
                        if(angle === 180){
                            l = l - w + bbox.width;
                            t = t - h + bbox.height;
                        }else{
                            l = l + w - bbox.width;
                            t = t  + h - bbox.height;
                        }
                        
                    }
                    
                break;
                case 270:
                if(angle%180 === 90){ //0 or 180
                    if(baseAngle===270){
                        l = l ;//+ bbox.height / 2;
                        t = t - h + bbox.width;
                    }else{
                        l = l - bbox.height / 2;
                        t = t + h - bbox.width;
                    }
                }else{
                    if(baseAngle===270){ // 90 or 270
                        l = l ;//+ bbox.height / 2;
                        t = t + 50;//- h + bbox.width;
                    }else{
                        l = l - bbox.height / 2;
                        t = t + h - bbox.width;
                    }
                    
                }
                break;
                case -90:
                    //l = l + w - bbox.height / 2;
                    //t = t + bbox.width / 2;
                break;
                case -180:
                    if(angle%180 === 90){
                        l = l - w + bbox.height;
                        t = t + h - bbox.width;
                    }else{
                        l = l - w + bbox.width;
                        t = t - h + bbox.height;
                    }
                    
                break;
            }
            */

            // to relocate the textbox because of the center point
            textbox.forEach(function (element) {
                if (element.type === "rect") {
                    element.attr({
                        x: l - bbox.width / 2,
                        y: t - bbox.height / 2,
                        fill: color
                    });
                    element.data("EMSNodeId", EmsNodeId);
                    element.data("AnnotationType", "emsgroup");
                } else {
                    element.attr({
                        x: l,// + bbox.width / 2,
                        y: t// + bbox.height / 2 
                    });
                    element.data("EMSNodeId", EmsNodeId);
                    element.data("AnnotationType", "emsgroup");
                }

            });
            //textbox[0].data("EMSNodeId", EmsNodeInfo.id);
            //textbox[1].data("EMSNodeId", EmsNodeInfo.id);
            var rect = that.drawRect(x, y, w, h, false); rect.attr({
                'stroke-dasharray': "",
                'stroke-width': 1,
                stroke: color
            }).undrag();
            rect.unclick();
            if (isElement) rect.hide();
            rect.data("AnnotationType", "emsgroup");
            rect.data("EMSNodeId", EmsNodeId);
            var emsGroupSet = this.paper.set();
            //drawQr = AnnotationApplication.Toolbar.showQR;
            if (false) {
                that.generateQrCode(EmsNodeId, function (data) {

                    var currentScale = PDFViewerApplication.pdfViewer.currentScale;

                    //textbox.forEach(function (el) {
                    //    if (el.type === "rect" && el.attr("width") < 150 * currentScale) {
                    //        el.attr("width", 150 * currentScale);
                    //    }
                    //});
                    //if (rect.attr("width") < 150 * currentScale) {
                    //    rect.attr("width", 150 * currentScale);
                    //}

                    var textBbox = textbox.getBBox();

                    var img = that.paper.image(data, x - 3, y + textBbox.height + 3, 0.5 * 150, 0.5 * 150);
                    img.data("AnnotationType", "emsgroup");
                    emsGroupSet.push(img);
                    /*
                    if (showQrCode) {
                        img.show();
                        if (rect.attr("height") < 150 * currentScale) {
                            rect.attr("height", 150 * currentScale);
                        }
                    } else {
                        img.hide();
                    }
                    */
                    //if (!AnnotationApplication.Toolbar.showQR) img.hide();

                    emsGroupSet.push(
                        textbox,
                        rect
                    );

                    if (insertToDb) {

                        that.createEmsGroupOnDb(emsGroupSet);
                    }
                    if (callback) callback(emsGroupSet);
                });


            } else {
                emsGroupSet.push(
                    textbox,
                    rect
                );
                if (insertToDb) {
                    textbox.rotate(-1 * that.getPageRotation());
                    textbox.setAngle(-1 * that.getPageRotation());
                    that.createEmsGroupOnDb(emsGroupSet);
                }
                if (callback) callback(emsGroupSet);
            }


            return emsGroupSet;
        },

        drawEmsElement: function (x, y, emsNodeId, drawQr, insertToDb, fontSize, callback) {
            var that = this;
            var EmsNodeId = emsNodeId ? emsNodeId : AnnotationApplication.DrawStateService.getEmsNode().id;
            var emsNode = emsData[emsNodeId];
            var EMSNodeName = emsNodeId ? emsNode.Name : AnnotationApplication.DrawStateService.getEmsNode().name

            var txt = EMSNodeName;

            var textbox = that.drawText(x, y, txt, false, fontSize);
            var bbox = textbox.getBBox();
            textbox[0].EmsNodeId = EmsNodeId;
            var status = emsNode.CurrentStatus;//window.parent.FilterStatusesLogic.GetCurrentElementStatus(EmsNode);
            var color = emsNode.Color;//window.parent.FilterStatusesLogic.GetStatusColorHex(status);

            // to relocate the textbox because of the center point
            textbox.forEach(function (element) {
                if (element.type === "rect") {
                    element.attr({
                        x: x,
                        y: y,
                        fill: color
                    });
                    element.data("EMSNodeId", EmsNodeId);
                    element.data("AnnotationType", "emselement");
                } else {
                    element.attr({
                        x: x + bbox.width / 2,
                        y: y + bbox.height / 2
                    });
                    element.data("EMSNodeId", EmsNodeId);
                    element.data("AnnotationType", "emselement");
                }

            });
            var emsElementSet = this.paper.set();
            if (false) {
                that.generateQrCode(EmsNodeId, function (data) {

                    var currentScale = PDFViewerApplication.pdfViewer.currentScale;

                    //textbox.forEach(function (el) {
                    //    if (el.type === "rect" && el.attr("width") < 150 * currentScale) {
                    //        el.attr("width", 150 * currentScale);
                    //    }
                    //});

                    var textBbox = textbox.getBBox();

                    var img = that.paper.image(data, x, y + textBbox.height + 3, 150 * 0.5 * currentScale, 150 * 0.5 * currentScale);
                    img.data("AnnotationType", "emselement");
                    emsElementSet.push(img);
                    /*
                    if (showQrCode) {
                        img.show();
                    } else {
                        img.hide();
                    }
                    */
                    //if (!AnnotationApplication.Toolbar.showQR) img.hide();

                    emsElementSet.push(
                        textbox
                    );
                    if (callback) callback(emsElementSet);
                    if (insertToDb) {

                        that.createEmsElementOnDb(emsElementSet);
                    }
                });

            } else {
                emsElementSet.push(
                    textbox
                );

                if (insertToDb) {
                    emsElementSet.rotate(-1 * that.getPageRotation());
                    emsElementSet.setAngle(-1 * that.getPageRotation());
                    that.createEmsElementOnDb(emsElementSet);
                }
                if (callback) callback(emsElementSet);
            }


            return emsElementSet;
        },

        drawTextTag: function () {
            var that = this;

            var s = window.getSelection();
            if(s.rangeCount !== 0 && s.type !== "Caret"){
                var oRange = s.getRangeAt(0); //get the text range
                var oRect = oRange.getBoundingClientRect();



                // begin optimizing
                var rects = oRange.getClientRects();
                var currentPageNumber = PDFViewerApplication.pdfViewer.currentPageNumber;
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
                            paperHeight - (rects[0].bottom - offsetTop) / scale -12.5,
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
                            paperWidth + (-rects[0].bottom + offsetTop) / scale -25,
                            (rects[0].left - offsetLeft) / scale -12.5,
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

                that.createTexttagOnDb(texttagSet);
            }
            that.stopDrawing();
            return texttagSet;

            //end optimizing






            /*

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

            var intersectedDivs = [];

            var s = window.getSelection();
            var oRange = s.getRangeAt(0); //get the text range
            var oRect = oRange.getBoundingClientRect();
            var charsToRemoveFromFirstLine = s.anchorOffset;
            var charsTokeepFromLastLine = s.extentOffset;
            var currentPageNumber = PDFViewerApplication.pdfViewer.currentPageNumber;
            var currentScale = PDFViewerApplication.pdfViewer._currentScale;
            var currentPageContainer = $("#pageContainer" + currentPageNumber);
            var textLayer = $("#pageContainer" + currentPageNumber).children(".textLayer:first");
            var textLayerOffsetTop = $(textLayer).offset().top;
            var textLayerOffsetLeft = $(textLayer).offset().left;

            var divs = $(".textLayer").children("div");
            for (var i = 0; i < divs.length; i++) {
                if (oRange.intersectsNode(divs[i])) {
                    console.log(divs[i]);
                    intersectedDivs.push(divs[i]);

                }
            }

            var FoRect = intersectedDivs[0].getBoundingClientRect();

            var texttagSet = that.paper.set();
            var img = that.paper.image(
                '/Content/images/DocumentViewer/pinSelectedText.png',
                (FoRect.left - textLayerOffsetLeft) / currentScale - 20,
                (FoRect.top - textLayerOffsetTop) / currentScale - 20,
                25,
                25
            );
            img.attr({
                opacity: 0.5,
                text: that.getSelectedTextOnPdf(),
                title: that.getSelectedTextOnPdf()
            });
            texttagSet.push(img);


            var firstDiv = intersectedDivs[0];
            var first_totalNumberofChars = firstDiv.innerText.length;
            var first_oRect = firstDiv.getBoundingClientRect();
            var tempRecFirst = {
                left: first_oRect.left,// - (marginLeft - borderLeft) - (first_oRect.left*(currentScale-1)),
                right: first_oRect.right,
                top: first_oRect.top,// - textLayerOffsetTop - (first_oRect.top * (currentScale - 1)),
                height: first_oRect.height,
                width: first_oRect.width
            }
            var first_width = parseInt($(firstDiv).css("width").replace('px', ''));
            tempRecFirst.left = tempRecFirst.left + (first_width * (charsToRemoveFromFirstLine / first_totalNumberofChars));
            //tempRecFirst.width = tempRecFirst.width - (first_width * (charsToRemoveFromFirstLine / first_totalNumberofChars));
            tempRecFirst.width = tempRecFirst.left + (first_width * (charsToRemoveFromFirstLine / first_totalNumberofChars));

            var r1 = that.paper.rect(
                (tempRecFirst.left - textLayerOffsetLeft) / currentScale,
                //(intersectedDivs.length > 1) ? (tempRecFirst.left - textLayerOffsetLeft) / currentScale : oRect.left,
                (tempRecFirst.top - textLayerOffsetTop) / currentScale,
                //first_width,
                //(tempRecFirst.right - (tempRecFirst.left - textLayerOffsetLeft) - textLayerOffsetLeft) / currentScale,
                oRect.width,
                (tempRecFirst.height) / currentScale
            );
            r1.attr({
                fill: 'yellow',
                opacity: 0.3,
                stroke: '#009EE3',
                'stroke-width': 1,
                'stroke-dasharray': ""
            });
            texttagSet.push(r1);

            //============================ middle lines ==================
            if (intersectedDivs.length > 1) {
                for (var i = 1; i < intersectedDivs.length - 1; i++) {
                    var oRect = intersectedDivs[i].getBoundingClientRect();
                    var tempRec = {
                        left: oRect.left,// - marginLeft - borderLeft - (first_oRect.left * (currentScale - 1)),
                        right: oRect.right,
                        top: oRect.top,// - textLayerOffsetTop - (first_oRect.top * (currentScale - 1)),
                        height: oRect.height,
                        width: oRect.width
                    }
                    var middle_width = parseInt($(intersectedDivs[i]).css("width").replace('px', ''));
                    //tempRec.width = (middle_width) * (1 / currentScale);

                    var rm = that.drawHighlight(
                        (tempRec.left - textLayerOffsetLeft) / currentScale,
                        (tempRec.top - textLayerOffsetTop) / currentScale,
                        (tempRec.width) / currentScale,
                        (tempRec.height) / currentScale,
                        false
                    );
                    rm.attr({
                        fill: 'yellow',
                        opacity: 0.3,
                        stroke: '#009EE3',
                        'stroke-width': 1,
                        'stroke-dasharray': ""
                    });
                    texttagSet.push(rm);
                }

                // draw the last div
                var lastDiv = intersectedDivs[intersectedDivs.length - 1];
                var last_totalNumberofChars = lastDiv.innerText.length;
                var last_oRect = lastDiv.getBoundingClientRect();
                var tempRecLast = {
                    left: last_oRect.left,// - marginLeft - borderLeft - (first_oRect.left * (currentScale - 1)),
                    right: last_oRect.right,
                    top: last_oRect.top,// - textLayerOffsetTop - (first_oRect.top * (currentScale - 1)),
                    height: last_oRect.height,
                    width: last_oRect.width
                }
                var last_width = parseInt($(lastDiv).css("width").replace('px', ''));
                tempRecLast.width = (last_width * (charsTokeepFromLastLine / last_totalNumberofChars));// * (1/currentScale);
                var rn = that.drawHighlight(
                    (tempRecLast.left - textLayerOffsetLeft) / currentScale,
                    (tempRecLast.top - textLayerOffsetTop) / currentScale,
                    (tempRecLast.width) / currentScale,
                    (tempRecLast.height) / currentScale,
                    false
                );
                rn.attr({
                    fill: 'yellow',
                    opacity: 0.3,
                    stroke: '#009EE3',
                    'stroke-width': 1,
                    'stroke-dasharray': ""
                });
                texttagSet.push(rn);


            }
            that.createTexttagOnDb(texttagSet);
            that.stopDrawing();
            return texttagSet;
            */
        },

        draw3dTag: function () {

        },

        //===========================================================
        //======================= Events ============================
        //===========================================================

        clickHandler: function (element, type) {
            var that = this;
            console.log(element);
            switch (type) {
                case "line":

                    break;
                case "polyline":

                    break;
                case "rect":

                    break;
                case "circ":

                    break;
                case "text":

                    break;
            }
            that.drawControlBox(element, paper);
        },

        openTextBoxEdit: function (svgObject) {
            var that = this;
            var kendoWindow = $("#kendoWindow");
            var template = "<div><textarea id='editor' rows='5' cols='30' style='height:100px' aria-label='editor'>" + svgObject.element.text.attr("text") + "</textarea></div><br />"
                + "<div class='row k-popup-bottom' style='padding-bottom: 0px; padding-top: 15px;'><button id='kendoDecline' class='btn btn-other pull-right' style='text-align:center; margin-left:10px;'>" + GetResourceString('Cancel') + "</button>"
                + "<button id='kendoConfirm' class='btn btn-success pull-right' >" + GetResourceString('Ok') + "</button></div>";
            kendoWindow.kendoWindow({
                title: GetResourceString('Edit'),
                maxWidth: "400px",
                maxHeight: "250px",
                visible: false,
                draggable: true,
                resizable: false,
                iframe: true,
                modal: true,
                actions: ["Close"],
            }).data("kendoWindow").center().open().content(template);
            AnnotationApplication.CanvasController.isUserTyping = true;
            $("#kendoConfirm").click(function () {
                that.TextboxOnTextConfirmed(svgObject);
                /*
                                var oldBbox = textBoxSet.items[0].getBBox();
                                var ltPoint = {
                                    x: oldBbox.x,
                                    y: oldBbox.y
                                }
                                textBoxSet.items[0].attr("text", $("#editor").val().trim());
                
                                var bbox = textBoxSet.items[0].getBBox();
                                textBoxSet.items[0].attr({
                                    x: ltPoint.x + bbox.width / 2,
                                    y: ltPoint.y + bbox.height / 2
                                });
                                var bbox = textBoxSet.items[0].getBBox();
                                textBoxSet.items[1].attr({
                                    x: bbox.x,
                                    y: bbox.y,
                                    width: bbox.width,
                                    height: bbox.height
                                });
                                textBoxSet.items[1].toBack();
                                if (textBoxSet[0].data("parent")) {
                                    that.updateCalloutOnDb(textBoxSet[0].data("parent"));
                                } else {
                                    that.updateTextboxOnDb(textBoxSet);
                                }
                                if (textBoxSet.items[0].data("AnnotationType") === "callout") that.drawJoints(element, "callout");
                                //AnnotationApplication.CRUDController.updateAnnotation(obj, null);
                                AnnotationApplication.CanvasController.isUserTyping = false;
                                */
                kendoWindow.data("kendoWindow").close();


            });
            $("#kendoDecline").click(function () {
                AnnotationApplication.CanvasController.isUserTyping = false;
                kendoWindow.data("kendoWindow").close();

            });
            $(".k-widget.k-window").addClass("deletekmodel");
        },

        TextboxOnTextConfirmed: function (svgObject, editorValue) {
            var that = this;
            var oldBbox = svgObject.element.text.getBBox();
            var ltPoint = {
                x: oldBbox.x,
                y: oldBbox.y
            }
            if (editorValue.trim() === "") {
                AnnotationApplication.CanvasController.isUserTyping = false;
            } else {
                svgObject.element.text.attr("text", editorValue.trim());

                var angle = svgObject.angle;
                //textBoxSet.items[0].transform("");
                var bbox = svgObject.element.text.getBBox();
                // have to comment this out as this messes up 
                // coordinate in rotation
                /*
                textBoxSet.items[0].attr({
                    x: ltPoint.x + bbox.width / 2,
                    y: ltPoint.y + bbox.height / 2
                });
                */
                var bbox = svgObject.element.text.getBBox();
                switch (Math.abs(angle)) {
                    case 0:
                    svgObject.element.rect1.attr({
                            x: bbox.x,
                            y: bbox.y,
                            width: bbox.width,
                            height: bbox.height
                        });
                        break;
                    case 90:
                    svgObject.element.rect1.attr({
                            x: svgObject.element.text.attr("x") - bbox.height / 2,
                            y: svgObject.element.text.attr("y") - bbox.width / 2,
                            width: bbox.height,
                            height: bbox.width
                        });
                        break;
                    case 180:
                    svgObject.element.rect1.attr({
                            x: bbox.x,
                            y: bbox.y,
                            width: bbox.width,
                            height: bbox.height
                        });
                        break;
                    case 270:
                    svgObject.element.rect1.attr({
                            x: svgObject.element.text.attr("x") - bbox.height / 2,
                            y: svgObject.element.text.attr("y") - bbox.width / 2,
                            width: bbox.height,
                            height: bbox.width
                        });
                        break;
                }

                //textBoxSet.items[0].rotate(angle);
                //textBoxSet.items[1].rotate(angle);
                //textBoxSet.items[1].data("Angle", angle);
                //svgObject.element.rect1.toBack();

                var bbox = svgObject.element.text.getBBox();
                svgObject.element.rect1.attr({
                    x:bbox.x - 3,
                    y: bbox.y - 3,
                    width: (bbox.width + 6),
                    height: (bbox.height + 6)
                });
                svgObject.update();


                // old
                // that.reConstructTextBoxRect(textBoxSet);
                // element.items.filter(s => s.type === "rect")[0].toFront();
                // element.items.filter(s => s.type === "text" && s.attr("fill") !== "" && s.attr("fill") !== null)[0].toFront();
                
                // if (textBoxSet[0].data("parent")) {
                //     that.updateCalloutOnDb(svgObject.element.text.data("parent"));
                // } else {
                //     that.updateTextboxOnDb(textBoxSet);
                // }
                // if (svgObject.element.text.data("AnnotationType") === "callout") that.drawJoints(element, "callout");
                //AnnotationApplication.CRUDController.updateAnnotation(obj, null);
                AnnotationApplication.CanvasController.isUserTyping = false;
            }
        },

        openMeasurementScaleEdit: function (set , measurementValue , updateCheck, unit) {
            // var that = this;
            // var textbox = set.items.filter(m => m.type === "text")[0];
            // var inputText = SvgGlobalControllerLogic.parseMeasurementText( textbox.attr("text"), textbox.data("Unit"));
            // //inputText = inputText.indexOf(",") > -1 ? inputText.replace('.','').replace(',','.') : inputText;
            // //var txt = kendo.parseFloat(inputText);
            // var kendoWindow = $("#kendoWindow");
            // var template = `
            // <div>
            //     <h5>`+ VIEW_RESOURCES.Resource.MeasurementToolCalibrateMessage + `:</h5>
            //     <input id='scaleeditor' type='number' min="0" step="0.01"/>
            //     <h5>`+ VIEW_RESOURCES.Resource.Metric + `:</h5>
            //     <select id="system" style="width: 100%;" >
            //         <option>`+ VIEW_RESOURCES.Resource.Metric +` (m)</option>
            //         <option>`+ VIEW_RESOURCES.Resource.Imperial +` (in)</option>
            //         <option>`+VIEW_RESOURCES.Resource.Pixel+` (px)</option>
            //     </select>
            // </div>
            // <br />
            // <input type="checkbox" id="updateall" name="updateall" value="true">
            // <p>`+VIEW_RESOURCES.Resource.Note+`: `+ VIEW_RESOURCES.Resource.MeasurementToolUpdateAllMessage + `.</p>
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
                //     case VIEW_RESOURCES.Resource.Imperial+" (in)":
                //         that.unit = "in";
                //         break;
                //     case VIEW_RESOURCES.Resource.Pixel+" (px)":
                //         that.unit = "px";
                //         break;
                // }
                var updateAll = updateCheck;

                var lns = set.items.filter(m => m.type === "path");
                var px = 0;
                if (lns.length > 1) {
                    var x1 = lns[0].attr("path")[0][1];
                    var y1 = lns[0].attr("path")[0][2];
                    var x2 = lns[1].attr("path")[1][1];
                    var y2 = lns[1].attr("path")[1][2];
                    if (lns[1].attr("path")[1].length > 3) {
                        x2 = lns[1].attr("path")[1][5];
                        y2 = lns[1].attr("path")[1][6];
                    }
                    px = that.getTwoPointDistance(x1, y1, x2, y2);
                } else {
                    var x1 = lns[0].attr("path")[0][1];
                    var y1 = lns[0].attr("path")[0][2];
                    var x2 = lns[0].attr("path")[1][1];
                    var y2 = lns[0].attr("path")[1][2];
                    if (lns[0].attr("path")[1].length > 3) {
                        x2 = lns[0].attr("path")[1][5];
                        y2 = lns[0].attr("path")[1][6];
                    }
                    px = that.getTwoPointDistance(x1, y1, x2, y2);
                }

                /*if (!["", undefined].includes(textbox.data("Scale"))) {
                    var px = px / textbox.data("Scale");
                }
                */
                var currentScale = PDFViewerApplication.pdfViewer.currentScale;
                //that.scale = $("#scaleeditor").val() / (px);
                that.scale = measurementValue / (px)

                if (updateAll) {
                    that.updateAllMeasurementScales(that.scale, unit);
                } else {
                    that.updateMeasurementScale(set, that.scale, unit, true);
                }

                //var newTxt = parseFloat($("#scaleeditor").val()).toFixed(2) + " " + that.unit;
                //if (kendo.culture().name === "de-DE") {
                //    newTxt = newTxt.replace('.', ',');
                //}
                var newTxt = measurementValue + " " + unit;
                var formatedText = SvgGlobalControllerLogic.formatMeasurementText(measurementValue, unit);
                console.log(formatedText);
                textbox.attr("text", formatedText);
                textbox.data("Unit", unit);
                textbox.data("Scale", that.scale);



                AnnotationApplication.CanvasController.isUserTyping = false;
               // kendoWindow.data("kendoWindow").close();

           // });
            // $("#kendoDecline").click(function () {// declined

            //     AnnotationApplication.CanvasController.isUserTyping = false;
            //     kendoWindow.data("kendoWindow").close();

            // });
            // $(".k-widget.k-window").addClass("deletekmodel");
        },

        mouseupHandler: function (e, element, paper, type) {
            if (e.which === 3) {
                this.rightClickHandler(element, paper, e);
            }
        },

        //============================================================
        //======================== Draw Joints =======================
        //============================================================

        drawJoints: function (element, type) {
            //SvgGlobalControllerLogic.enableHammerPan();
            this.clearAllJoints();
            this.clearAllCtrlBoxes();
            var that = this;
            var scale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseInt(that.paper.width.replace("px", "")) / scale;
            var paperHeight = parseInt(that.paper.height.replace("px", "")) / scale;
            try {
                switch (type) {
                    case "line":
                        //element = that.paper.getById(element.raphaelid);


                        var c1 = that.paper.circle(element.attrs.path[0][1], element.attrs.path[0][2], 10 / scale)
                            .attr({
                                parentId: element.id,
                                index: 1,
                                fill: "red",
                                opacity: 0.6
                            })
                            .drag(function (dx, dy, x, y, e) {
                                var dxdy = that.getDXDY(dx, dy);
                                dx = dxdy.dx;
                                dy = dxdy.dy;
                                let lx = dx;
                                let ly = dy;

                                var parent = that.paper.getById(this.parentId);
                                this.transform("T" + lx / scale + "," + ly / scale);
                                var newX = this.matrix.x(this.attr("cx"), this.attr("cy"));
                                var newY = this.matrix.y(this.attr("cx"), this.attr("cy"));
                                newX = newX < 5 ? 0 : newX;
                                newY = newY < 5 ? 0 : newY;
                                newX = newX > paperWidth ? paperWidth - 5 : newX;
                                newY = newY > paperHeight ? paperHeight - 5 : newY;
                                element.attr({
                                    path: "M " + newX + " " + newY
                                        + " L " + element.attrs.path[1][1] + " " + element.attrs.path[1][2]
                                });
                            }, function (x, y) {
                                //console.log(" x:" + x + " y:" + y);

                            }, function (e) {
                                console.log("drag ended", e);
                                let lx = this.matrix.x(this.attr("cx"), this.attr("cy"));
                                let ly = this.matrix.y(this.attr("cx"), this.attr("cy"));
                                lx = lx < 5 ? 0 : lx;
                                ly = ly < 5 ? 0 : ly;
                                lx = lx > paperWidth ? paperWidth - 5 : lx;
                                ly = ly > paperHeight ? paperHeight - 5 : ly;
                                this.attr({ cx: lx, cy: ly });
                                this.transform("");

                                element.attr({
                                    path: "M " + lx + " " + ly
                                        + " L " + element.attrs.path[1][1] + " " + element.attrs.path[1][2]
                                });
                                that.updateLineOnDb(element, [lx, ly, element.attrs.path[1][1], element.attrs.path[1][2]])
                            });

                        var c2 = that.paper.circle(element.attrs.path[1][1], element.attrs.path[1][2], 10 / scale)
                            .attr({
                                parentId: element.id,
                                index: 2,
                                fill: "red",
                                opacity: 0.6
                            })
                            .drag(function (dx, dy, x, y, e) {
                                var dxdy = that.getDXDY(dx, dy);
                                dx = dxdy.dx;
                                dy = dxdy.dy;
                                let lx = dx;
                                let ly = dy;
                                var parent = that.paper.getById(this.parentId);
                                this.transform("T" + lx / scale + "," + ly / scale);
                                var newX = this.matrix.x(this.attr("cx"), this.attr("cy"));
                                var newY = this.matrix.y(this.attr("cx"), this.attr("cy"));
                                newX = newX < 5 ? 0 : newX;
                                newY = newY < 5 ? 0 : newY;
                                newX = newX > paperWidth ? paperWidth - 5 : newX;
                                newY = newY > paperHeight ? paperHeight - 5 : newY;
                                element.attr({
                                    path: "M " + element.attrs.path[0][1] + " " + element.attrs.path[0][2]
                                        + " L " + newX + " " + newY
                                });
                            }, function (x, y) {
                                // console.log(" x:" + x + " y:" + y);
                            }, function (e) {
                                console.log("drag ended", e);
                                let lx = this.matrix.x(this.attr("cx"), this.attr("cy"));
                                let ly = this.matrix.y(this.attr("cx"), this.attr("cy"));
                                lx = lx < 5 ? 0 : lx;
                                ly = ly < 5 ? 0 : ly;
                                lx = lx > paperWidth ? paperWidth - 5 : lx;
                                ly = ly > paperHeight ? paperHeight - 5 : ly;
                                this.attr({ cx: lx, cy: ly });
                                this.transform("");

                                element.attr({
                                    path: "M " + element.attrs.path[0][1] + " " + element.attrs.path[0][2]
                                        + " L " + lx + " " + ly
                                });
                                that.updateLineOnDb(element, [element.attrs.path[0][1], element.attrs.path[0][2], lx, ly])
                            });

                        c1.data("isJoint", true);
                        c2.data("isJoint", true);

                        $(c1.node).css("z-index", "100");
                        $(c2.node).css("z-index", "100");

                        //console.log(path);
                        break;
                    case "circle":
                        break;
                    case "rect":
                        break;
                    case "text":
                        break;
                    case "polyline":
                        //element = that.paper.getById(element.raphaelid);
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
                                    that.drawPathJoint(SvgGlobalControllerLogic.getSvgController(this.pageNumber).canvas.paper, element, i, "polyline");
                                }

                            }
                        }
                        break;
                    case "cloud":
                        //element = that.paper.getById(element.raphaelid);
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
                                    that.drawPathJoint(SvgGlobalControllerLogic.getSvgController(this.pageNumber).canvas.paper, element, i, "cloud");
                                }

                            }
                        }
                        var pathString = SvgGlobalControllerLogic.CreateCloudPath(points);
                        element.attr("path", Raphael.parsePathString(pathString));
                        break;
                    case "callout":
                        var c1 = that.paper.circle(element[0].attr("path")[1][1], element[0].attr("path")[1][2], 10 / scale)
                            .attr({
                                parentId: element.id,
                                index: 1,
                                fill: "red",
                                opacity: 0.6

                            })
                            .drag(function (dx, dy, x, y, e) {
                                var dxdy = that.getDXDY(dx, dy);
                                dx = dxdy.dx;
                                dy = dxdy.dy;
                                var el = element[0];
                                let lx = dx;
                                let ly = dy;
                                var parent = that.paper.getById(this.parentId);
                                this.transform("T" + lx / scale + "," + ly / scale);
                                el.attr({
                                    path: "M " + el.attrs.path[0][1] + " " + el.attrs.path[0][2]
                                        + " L " + this.matrix.x(this.attr("cx"), this.attr("cy")) + " " + this.matrix.y(this.attr("cx"), this.attr("cy"))
                                });
                            }, function (x, y) {
                                console.log(" x:" + x + " y:" + y);

                            }, function (e) {
                                var el = element[0];
                                console.log("drag ended", e);
                                let lx = this.matrix.x(this.attr("cx"), this.attr("cy"));
                                let ly = this.matrix.y(this.attr("cx"), this.attr("cy"));
                                lx = lx < 5 ? 0 : lx;
                                ly = ly < 5 ? 0 : ly;
                                lx = lx > paperWidth ? paperWidth - 5 : lx;
                                ly = ly > paperHeight ? paperHeight - 5 : ly;
                                this.attr({ cx: lx, cy: ly });
                                this.transform("");

                                el.attr({
                                    path: "M " + el.attrs.path[0][1] + " " + el.attrs.path[0][2]
                                        + " L " + lx + " " + ly
                                });
                                that.updateCalloutOnDb(element.data("parent"));
                                //that.updateLineOnDb(element, [lx, ly, element.attrs.path[1][1], element.attrs.path[1][2]])
                            });

                        var c2 = that.paper.circle(element[0].attr("path")[0][1], element[0].attr("path")[0][2], 10 / scale)
                            .attr({
                                parentId: element.id,
                                index: 2,
                                fill: "red",
                                opacity: 0.6

                            })
                            .drag(function (dx, dy, x, y, e) {
                                var dxdy = that.getDXDY(dx, dy);
                                dx = dxdy.dx;
                                dy = dxdy.dy;
                                var el = element[1];
                                let lx = dx;
                                let ly = dy;
                                var parent = that.paper.getById(this.parentId);
                                this.transform("T" + lx / scale + "," + ly / scale);
                                el.attr({
                                    path: "M " + this.matrix.x(this.attr("cx"), this.attr("cy")) + " " + this.matrix.y(this.attr("cx"), this.attr("cy"))
                                        + " L " + el.attrs.path[1][1] + " " + el.attrs.path[1][2]
                                });
                                element[0].attr({
                                    path: "M " + this.matrix.x(this.attr("cx"), this.attr("cy")) + " " + this.matrix.y(this.attr("cx"), this.attr("cy"))
                                        + " L " + element[0].attrs.path[1][1] + " " + element[0].attrs.path[1][2]
                                });
                            }, function (x, y) {
                                console.log(" x:" + x + " y:" + y);

                            }, function (e) {
                                var el = element[0];
                                console.log("drag ended", e);
                                let lx = this.matrix.x(this.attr("cx"), this.attr("cy"));
                                let ly = this.matrix.y(this.attr("cx"), this.attr("cy"));
                                lx = lx < 5 ? 0 : lx;
                                ly = ly < 5 ? 0 : ly;
                                lx = lx > paperWidth ? paperWidth - 5 : lx;
                                ly = ly > paperHeight ? paperHeight - 5 : ly;
                                this.attr({ cx: lx, cy: ly });
                                this.transform("");

                                el.attr({
                                    path: "M " + lx + " " + ly
                                        + " L " + el.attrs.path[1][1] + " " + el.attrs.path[1][2]
                                });
                                element[0].attr({
                                    path: "M " + lx + " " + ly
                                        + " L " + element[0].attrs.path[1][1] + " " + element[0].attrs.path[1][2]
                                });
                                that.updateCalloutOnDb(element.data("parent"));
                                //that.updateLineOnDb(element, [lx, ly, element.attrs.path[1][1], element.attrs.path[1][2]])
                            });

                        c1.data("isJoint", true);
                        c2.data("isJoint", true);
                        $(c1.node).css("z-index", "100");
                        $(c2.node).css("z-index", "100");
                        break;
                    case "measurementbasic":
                        try {
                            var lns = element.items.filter(m => m.type === "path");
                            var line1 = lns[0];
                            var line2 = (lns.length > 1) ? lns[1] : lns[0];
                            var textbox = element.items.filter(m => m.type === "text")[0];
                            if (textbox.getUnit() === undefined) {
                                console.log(textbox);
                            }

                            // line2
                            var c1 = that.paper.circle(
                                (line2.attrs.path[1][5]) ? line2.attrs.path[1][5] : line2.attrs.path[1][1],
                                (line2.attrs.path[1][6]) ? line2.attrs.path[1][6] : line2.attrs.path[1][2],
                                10
                            )
                                .attr({
                                    parentId: element.id,
                                    index: 1,
                                    fill: "green",
                                    opacity: 0.6
                                })
                                .drag(function (dx, dy, x, y, e) {
                                    var dxdy = that.getDXDY(dx, dy);
                                    dx = dxdy.dx;
                                    dy = dxdy.dy;
                                    var el = line2;
                                    let lx = dx;
                                    let ly = dy;
                                    var parent = that.paper.getById(this.parentId);
                                    this.transform("T" + lx / scale + "," + ly / scale);
                                    var p = "M " + line1.attr("path")[0][1] + " " + line1.attr("path")[0][2] +
                                        " L " + this.matrix.x(this.attr("cx"), this.attr("cy")) + " " + this.matrix.y(this.attr("cx"), this.attr("cy"));
                                    var pathTotal = this.paper.path(p);
                                    var totalLength = Raphael.getTotalLength(pathTotal.attr("path"));
                                    var centerPoint = Raphael.getPointAtLength(
                                        pathTotal.attr("path"),
                                        totalLength / 2
                                    );
                                    if (lns.length > 1) {
                                        var txtbbox = textbox.getBBox();
                                        var eachLineLength = (totalLength - txtbbox.width) / 2;
                                        var pathLine1 = Raphael.getSubpath(pathTotal.attr("path"), 0, eachLineLength);
                                        var pathLine2 = Raphael.getSubpath(pathTotal.attr("path"), eachLineLength + txtbbox.width, totalLength);
                                        if([90,270].includes(that.getPageRotation())){
                                            pathLine2 = Raphael.getSubpath(pathTotal.attr("path"), eachLineLength + txtbbox.height, totalLength);
                                        }
                                        


                                        line1.attr("path", pathLine1);
                                        line2.attr("path", pathLine2);
                                    } else {
                                        line1.attr("path", pathTotal.attr("path"));
                                    }

                                    pathTotal.remove();
                                    console.log(Raphael.getTotalLength(el.attr("path")));
                                    textbox.transform("");
                                    var txtRaw = (Number.parseFloat(Raphael.getTotalLength(el.attr("path"))) / (that.scale)).toFixed(2);// + " " + textbox.getUnit(); 
                                    textbox.attr({
                                        x: centerPoint.x,
                                        y: centerPoint.y,
                                        text: SvgGlobalControllerLogic.formatMeasurementText(txtRaw, textbox.getUnit())
                                    });
                                    console.log(textbox.attr("text"));

                                    var textPosition = textbox.getTextAlign();
                                    var baseAngle = textbox.getAngle();
                                    var temptextPosition = textbox.getTextAlign();
                                    if([270,180].includes(baseAngle)){
                                        if(textPosition==="top"){
                                            temptextPosition = "bottom";
                                        }else if(textPosition==="bottom"){
                                            temptextPosition = "top";
                                        }
                                    }
                                    

                                    var angle = Raphael.angle(line1.attr("path")[0][1], line1.attr("path")[0][2], line2.attr("path")[1][1], line2.attr("path")[1][2]);
                                    switch (temptextPosition) {
                                        case "top":
                                            textbox.translate(-1 * Math.abs(20 * Math.sin(angle * 3.14 / 180)), -1 * Math.abs(20 * Math.cos(angle * 3.14 / 180)));
                                            break;
                                        case "bottom":
                                            textbox.translate(Math.abs(20 * Math.sin(angle * 3.14 / 180)), Math.abs(20 * Math.cos(angle * 3.14 / 180)));
                                            break;
                                        default:
                                    }

                                    var x2 = line2.attr("path")[1][1];
                                    var x1 = line1.attr("path")[0][1];
                                    var y2 = line2.attr("path")[1][2];
                                    var y1 = line1.attr("path")[0][2];
                                    switch(baseAngle){
                                        case 0:
                                        textbox.rotate((x2 < x1) ? angle : angle + 180);
                                        break;
                                        case 90:
                                        textbox.rotate((y1 < y2) ? angle : angle + 180);
                                        break;
                                        case 180:
                                        textbox.rotate((x1 < x2) ? angle : angle + 180);
                                        break;
                                        case 270:
                                        textbox.rotate((y2 < y1) ? angle : angle + 180);
                                        break;
                                    }

                                    //textbox.rotate((line2.attr("path")[1][1] < line1.attr("path")[0][1]) ? angle : angle + 180);
                                    that.updateMeasurementScale(element, textbox.getScale(), textbox.getUnit(), false);

                                }, function (x, y) {
                                    //console.log(" x:" + x + " y:" + y);

                                }, function (e) {
                                    var el = line2;
                                    console.log("drag ended", e);
                                    let lx = this.matrix.x(this.attr("cx"), this.attr("cy"));
                                    let ly = this.matrix.y(this.attr("cx"), this.attr("cy"));
                                    lx = lx < 5 ? 0 : lx;
                                    ly = ly < 5 ? 0 : ly;
                                    lx = lx > paperWidth ? paperWidth - 5 : lx;
                                    ly = ly > paperHeight ? paperHeight - 5 : ly;
                                    this.attr({ cx: lx, cy: ly });
                                    this.transform("");

                                    var p = "M " + line1.attr("path")[0][1] + " " + line1.attr("path")[0][2] +
                                        " L " + lx + " " + ly;
                                    var pathTotal = this.paper.path(p);
                                    var totalLength = Raphael.getTotalLength(pathTotal.attr("path"));
                                    var centerPoint = Raphael.getPointAtLength(
                                        pathTotal.attr("path"),
                                        totalLength / 2
                                    );
                                    if (lns.length > 1) {
                                        var txtbbox = textbox.getBBox();
                                        var eachLineLength = (totalLength - txtbbox.width) / 2;
                                        var pathLine1 = Raphael.getSubpath(pathTotal.attr("path"), 0, eachLineLength);
                                        var pathLine2 = Raphael.getSubpath(pathTotal.attr("path"), eachLineLength + txtbbox.width, totalLength);
                                        if([90,270].includes(that.getPageRotation())){
                                            pathLine2 = Raphael.getSubpath(pathTotal.attr("path"), eachLineLength + txtbbox.height, totalLength);
                                        }


                                        line1.attr("path", pathLine1);
                                        line2.attr("path", pathLine2);
                                    } else {
                                        line1.attr("path", pathTotal.attr("path"));
                                        line2.attr("path", pathTotal.attr("path"));
                                    }

                                    pathTotal.remove();

                                    textbox.transform("");
                                    var newText = (Number.parseFloat(Raphael.getTotalLength(el.attr("path"))) / (that.scale)).toFixed(2);
                                    // if (kendo.culture().name === "de-DE") {
                                    //     newText = newText.replace('.', ',');
                                    // }
                                    textbox.attr({
                                        x: centerPoint.x,
                                        y: centerPoint.y,
                                        text: newText + " " + textbox.getUnit()
                                    });


                                    var textPosition = textbox.getTextAlign();
                                    var baseAngle = textbox.getAngle();
                                    var temptextPosition = textbox.getTextAlign();
                                    if([270,180].includes(baseAngle)){
                                        if(textPosition==="top"){
                                            temptextPosition = "bottom";
                                        }else if(textPosition==="bottom"){
                                            temptextPosition = "top";
                                        }
                                    }
                                    

                                    var angle = Raphael.angle(line1.attr("path")[0][1], line1.attr("path")[0][2], line2.attr("path")[1][1], line2.attr("path")[1][2]);
                                    switch (temptextPosition) {
                                        case "top":
                                            textbox.translate(-1 * Math.abs(20 * Math.sin(angle * 3.14 / 180)), -1 * Math.abs(20 * Math.cos(angle * 3.14 / 180)));
                                            break;
                                        case "bottom":
                                            textbox.translate(Math.abs(20 * Math.sin(angle * 3.14 / 180)), Math.abs(20 * Math.cos(angle * 3.14 / 180)));
                                            break;
                                        default:
                                    }

                                    var x2 = line2.attr("path")[1][1];
                                    var x1 = line1.attr("path")[0][1];
                                    var y2 = line2.attr("path")[1][2];
                                    var y1 = line1.attr("path")[0][2];
                                    switch(baseAngle){
                                        case 0:
                                        textbox.rotate((x2 < x1) ? angle : angle + 180);
                                        break;
                                        case 90:
                                        textbox.rotate((y1 < y2) ? angle : angle + 180);
                                        break;
                                        case 180:
                                        textbox.rotate((x1 < x2) ? angle : angle + 180);
                                        break;
                                        case 270:
                                        textbox.rotate((y2 < y1) ? angle : angle + 180);
                                        break;
                                    }







                                    
                                    console.log("before draged element", element);
                                    that.updateMeasurementScale(element, textbox.getScale(), textbox.getUnit(), true);
                                    console.log("draged element", element);
                                    //that.updateMeasurementbasicOnDb(element);
                                },
                                );

                            // line1
                            var c2 = that.paper.circle(
                                (line1.attrs.path[0][5]) ? line1.attrs.path[0][5] : line1.attrs.path[0][1],
                                (line1.attrs.path[0][6]) ? line1.attrs.path[0][6] : line1.attrs.path[0][2],
                                10
                            )
                                .attr({
                                    parentId: element.id,
                                    index: 2,
                                    fill: "red",
                                    opacity: 0.6

                                })
                                .drag(function (dx, dy, x, y, e) {
                                    var dxdy = that.getDXDY(dx, dy);
                                    dx = dxdy.dx;
                                    dy = dxdy.dy;
                                    var el = line1;
                                    let lx = dx;
                                    let ly = dy;
                                    var parent = that.paper.getById(this.parentId);
                                    this.transform("T" + lx / scale + "," + ly / scale);
                                    /*
                                    el.attr({
                                        path: "M " + this.matrix.x(this.attr("cx"), this.attr("cy")) + " " + this.matrix.y(this.attr("cx"), this.attr("cy"))
                                            + " L " + el.attr("path")[1][5] + " " + el.attr("path")[1][6]
                                    });
                                    */
                                    var x2 = (line2.attr("path")[1].length > 3) ? line2.attr("path")[1][5] : line2.attr("path")[1][1];
                                    var y2 = (line2.attr("path")[1].length > 3) ? line2.attr("path")[1][6] : line2.attr("path")[1][2];
                                    var p = "M " + this.matrix.x(this.attr("cx"), this.attr("cy")) + " " + this.matrix.y(this.attr("cx"), this.attr("cy")) +
                                        " L " + x2 + " " + y2;
                                    var pathTotal = this.paper.path(p);
                                    var totalLength = Raphael.getTotalLength(pathTotal.attr("path"));
                                    var centerPoint = Raphael.getPointAtLength(
                                        pathTotal.attr("path"),
                                        totalLength / 2
                                    );
                                    if (lns.length > 1) {
                                        var txtbbox = textbox.getBBox();
                                        var eachLineLength = (totalLength - txtbbox.width) / 2;
                                        var pathLine1 = Raphael.getSubpath(pathTotal.attr("path"), 0, eachLineLength);
                                        var pathLine2 = Raphael.getSubpath(pathTotal.attr("path"), eachLineLength + txtbbox.width, totalLength);


                                        line1.attr("path", pathLine1);
                                        line2.attr("path", pathLine2);
                                    } else {
                                        line1.attr("path", pathTotal.attr("path").toString());
                                        line2.attr("path", pathTotal.attr("path").toString());
                                    }

                                    pathTotal.remove();

                                    textbox.transform("");
                                    textbox.attr({
                                        x: centerPoint.x,
                                        y: centerPoint.y,
                                        text: (Number.parseFloat(Raphael.getTotalLength(el.attr("path"))) / (that.scale)).toFixed(2) + " " + textbox.getUnit()
                                    });


                                    var textPosition = textbox.getTextAlign();
                                    var baseAngle = textbox.getAngle();
                                    var temptextPosition = textbox.getTextAlign();
                                    if([270,180].includes(baseAngle)){
                                        if(textPosition==="top"){
                                            temptextPosition = "bottom";
                                        }else if(textPosition==="bottom"){
                                            temptextPosition = "top";
                                        }
                                    }
                                    

                                    var angle = Raphael.angle(line1.attr("path")[0][1], line1.attr("path")[0][2], line2.attr("path")[1][1], line2.attr("path")[1][2]);
                                    switch (temptextPosition) {
                                        case "top":
                                            textbox.translate(-1 * Math.abs(20 * Math.sin(angle * 3.14 / 180)), -1 * Math.abs(20 * Math.cos(angle * 3.14 / 180)));
                                            break;
                                        case "bottom":
                                            textbox.translate(Math.abs(20 * Math.sin(angle * 3.14 / 180)), Math.abs(20 * Math.cos(angle * 3.14 / 180)));
                                            break;
                                        default:
                                    }

                                    var x2 = line2.attr("path")[1][1];
                                    var x1 = line1.attr("path")[0][1];
                                    var y2 = line2.attr("path")[1][2];
                                    var y1 = line1.attr("path")[0][2];
                                    switch(baseAngle){
                                        case 0:
                                        textbox.rotate((x2 < x1) ? angle : angle + 180);
                                        break;
                                        case 90:
                                        textbox.rotate((y1 < y2) ? angle : angle + 180);
                                        break;
                                        case 180:
                                        textbox.rotate((x1 < x2) ? angle : angle + 180);
                                        break;
                                        case 270:
                                        textbox.rotate((y2 < y1) ? angle : angle + 180);
                                        break;
                                    }







                                    
                                    that.updateMeasurementScale(element, textbox.getScale(), textbox.getUnit(), false);
                                }, function (x, y) {
                                    console.log(" x:" + x + " y:" + y);

                                }, function (e) {
                                    var el = line1;
                                    console.log("drag ended", e);
                                    let lx = this.matrix.x(this.attr("cx"), this.attr("cy"));
                                    let ly = this.matrix.y(this.attr("cx"), this.attr("cy"));
                                    lx = lx < 5 ? 0 : lx;
                                    ly = ly < 5 ? 0 : ly;
                                    lx = lx > paperWidth ? paperWidth - 5 : lx;
                                    ly = ly > paperHeight ? paperHeight - 5 : ly;
                                    this.attr({ cx: lx, cy: ly });
                                    this.transform("");

                                    var x2 = (line2.attr("path")[1].length > 3) ? line2.attr("path")[1][5] : line2.attr("path")[1][1];
                                    var y2 = (line2.attr("path")[1].length > 3) ? line2.attr("path")[1][6] : line2.attr("path")[1][2];
                                    var p = "M " + lx + " " + ly +
                                        " L " + x2 + " " + y2;
                                    var pathTotal = this.paper.path(p);
                                    var totalLength = Raphael.getTotalLength(pathTotal.attr("path"));
                                    var centerPoint = Raphael.getPointAtLength(
                                        pathTotal.attr("path"),
                                        totalLength / 2
                                    );
                                    if (lns.length > 1) {
                                        var txtbbox = textbox.getBBox();
                                        var eachLineLength = (totalLength - txtbbox.width) / 2;
                                        var pathLine1 = Raphael.getSubpath(pathTotal.attr("path"), 0, eachLineLength);
                                        var pathLine2 = Raphael.getSubpath(pathTotal.attr("path"), eachLineLength + txtbbox.width, totalLength);


                                        line1.attr("path", pathLine1);
                                        line2.attr("path", pathLine2);
                                    } else {
                                        line1.attr("path", pathTotal.attr("path"));
                                        line2.attr("path", pathTotal.attr("path"));
                                    }

                                    pathTotal.remove();

                                    textbox.transform("");
                                    var newText = (Number.parseFloat(Raphael.getTotalLength(el.attr("path"))) / (that.scale)).toFixed(2);
                                    // if (kendo.culture().name === "de-DE") {
                                    //     newText = newText.replace('.', ',');
                                    // }
                                    textbox.attr({
                                        x: centerPoint.x,
                                        y: centerPoint.y,
                                        text: newText + " " + textbox.getUnit()
                                    });

                                    var textPosition = textbox.getTextAlign();
                                    var baseAngle = textbox.getAngle();
                                    var temptextPosition = textbox.getTextAlign();
                                    if([270,180].includes(baseAngle)){
                                        if(textPosition==="top"){
                                            temptextPosition = "bottom";
                                        }else if(textPosition==="bottom"){
                                            temptextPosition = "top";
                                        }
                                    }
                                    

                                    var angle = Raphael.angle(line1.attr("path")[0][1], line1.attr("path")[0][2], line2.attr("path")[1][1], line2.attr("path")[1][2]);
                                    switch (temptextPosition) {
                                        case "top":
                                            textbox.translate(-1 * Math.abs(20 * Math.sin(angle * 3.14 / 180)), -1 * Math.abs(20 * Math.cos(angle * 3.14 / 180)));
                                            break;
                                        case "bottom":
                                            textbox.translate(Math.abs(20 * Math.sin(angle * 3.14 / 180)), Math.abs(20 * Math.cos(angle * 3.14 / 180)));
                                            break;
                                        default:
                                    }

                                    var x2 = line2.attr("path")[1][1];
                                    var x1 = line1.attr("path")[0][1];
                                    var y2 = line2.attr("path")[1][2];
                                    var y1 = line1.attr("path")[0][2];
                                    switch(baseAngle){
                                        case 0:
                                        textbox.rotate((x2 < x1) ? angle : angle + 180);
                                        break;
                                        case 90:
                                        textbox.rotate((y1 < y2) ? angle : angle + 180);
                                        break;
                                        case 180:
                                        textbox.rotate((x1 < x2) ? angle : angle + 180);
                                        break;
                                        case 270:
                                        textbox.rotate((y2 < y1) ? angle : angle + 180);
                                        break;
                                    }
                                    that.updateMeasurementScale(element, textbox.getScale(), textbox.getUnit(), true);
                                    //that.updateMeasurementbasicOnDb(element);
                                },
                                );

                            c1.data("isJoint", true);
                            c2.data("isJoint", true);
                            $(c1.node).css("z-index", "100");
                            $(c2.node).css("z-index", "100");
                            break;
                        } catch (ex) {
                            console.error(ex);
                        }
                }
            } catch (err) {
                console.error(err);
            }
        },

        drawPathJoint: function (paper, element, index, elementType) {
            var that = this;
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
                    var dxdy = that.getDXDY(dx, dy);
                    dx = dxdy.dx;
                    dy = dxdy.dy;
                    let lx = dx;
                    let ly = dy;
                    var parent = paper.getById(this.parentId);
                    this.transform("T" + lx / scale + "," + ly / scale);

                    var pathPoints = element.attrs.path.filter(p => ["M", "L"].includes(p[0]));
                    element.attrs.path = pathPoints;

                    if(
                        (index === 0 || index === element.attrs.path.length - 1)
                        && (element.attrs.path[0][1] === element.attrs.path[element.attrs.path.length - 1][1])
                        && (element.attrs.path[0][2] === element.attrs.path[element.attrs.path.length - 1][2])
                        ){
                        // first point
                        element.attrs.path[0][1] = this.matrix.x(this.attr("cx"), this.attr("cy"));
                        element.attrs.path[0][2] = this.matrix.y(this.attr("cx"), this.attr("cy"));
                        // last point
                        element.attrs.path[element.attrs.path.length - 1][1] = this.matrix.x(this.attr("cx"), this.attr("cy"));
                        element.attrs.path[element.attrs.path.length - 1][2] = this.matrix.y(this.attr("cx"), this.attr("cy"));
                    }else{
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
                    console.log(" x:" + x + " y:" + y);
                }, function (e) {
                    //console.log("drag ended", e);
                    let lx = this.matrix.x(this.attr("cx"), this.attr("cy"));
                    let ly = this.matrix.y(this.attr("cx"), this.attr("cy"));
                    this.attr({ cx: lx, cy: ly });
                    this.transform("");

                    if (elementType === "cloud") {
                        var pathPoints = element.attrs.path.filter(p => ["M", "L"].includes(p[0]));
                        element.attrs.path = pathPoints;
                    }

                    element.attrs.path[index][1] = lx;
                    element.attrs.path[index][2] = ly;

                    var pathTemp = "";
                    if (elementType !== "cloud") {

                        pathTemp += ("M " + element.attrs.path[0][1] + " " + element.attrs.path[0][2] + " ");

                        for (var j = 1; j < element.attrs.path.length; j++) {
                            pathTemp += ("L " + element.attrs.path[j][1] + " " + element.attrs.path[j][2] + " ");
                        }

                        //pathTemp += "z";
                    } else {
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
                    }

                    element.attr({
                        path: pathTemp
                    });

                    if (elementType !== "cloud") {
                        var points = [];
                        for (var j = 0; j < element.attrs.path.length; j++) {
                            points.push({
                                x: element.attrs.path[j][1],
                                y: element.attrs.path[j][2]
                            })
                        }
                        that.restoreMask(element);
                        that.updatePolylineOnDb(element, points);
                    } else {
                        var points = [];
                        var criticalPoints = element.attrs.path.filter(p => ["M", "L"].includes(p[0]));
                        for (var j = 0; j < criticalPoints.length; j++) {
                            points.push({
                                x: criticalPoints[j][1],
                                y: criticalPoints[j][2]
                            })
                        }
                        that.updateCloudOnDb(element, points);
                    }

                });
            circ.data("isJoint", true);
        },


        clearAllJoints: function () {
            var nodes = this.paper.childNodes;

            /*for(var i = 0; i< nodes.length; i++){
                if(nodes[i].data("isJoint") === true){
                    nodes[i].remove();
                }
            }*/

            this.paper.forEach(function (e) {
                if (e.data("isJoint") === true) {
                    e.remove();
                }
                return true;
            });

            var res = [];

            this.paper.forEach(function (el) {
                res.push(el);
            });

            for (var i = 0; i < res.length; i++) {
                if (res[i].data("isJoint") === true) {
                    res[i].remove();
                }
            }

        },

        clearAllSelectedText: function(){
            if (window.getSelection) {
                if (window.getSelection().empty) {  // Chrome
                  window.getSelection().empty();
                } else if (window.getSelection().removeAllRanges) {  // Firefox
                  window.getSelection().removeAllRanges();
                }
            } else if (document.selection) {  // IE?
            document.selection.empty();
            }
            AnnotationApplication.DrawStateService.setDrawState("SELECT", "");
        },

        stopDrawing: function () {
            SvgGlobalControllerLogic.disableHammerPan();
            // why z-index? because it is needed to be on top of 
            // all other elements in the textLayer when drawing. 
            // Here I revert the value. See "TwoDToolbar.js"
            console.log('Stopping Drawing');
            $("#pageContainer"+PDFViewerApplication.pdfViewer.currentPageNumber).css("box-shadow","");
            $(SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.paper.canvas).css("z-index", "");
            this.clickedPoints = [];
            this.isDrawing = false;
            this.currentDrawingType = "";
            this.drawingType = "";
            this.tempElement = null;

            $(this.paper.canvas).css("cursor", "default");
            $("#raphael" + this.pageNumber).parent().children("div:not(:first-child)").removeClass("hidden");
            AnnotationApplication.DrawStateService.setDrawState("SELECT", "");
            $(".textLayer > div").not(".raphael").show();
        },

        detectSelectedObjects: function (selectedArea) {
            var that = this;
            var detectedElements = [];
            var r1 = selectedArea.getBBox();
            that.paper.forEach(function (annotation) {
                var r2 = annotation.getBBox();
                if (!(r2.x > r1.x2 ||
                    r2.x2 < r1.x ||
                    r2.y > r1.y2 ||
                    r2.y2 < r1.y)) {

                    detectedElements.push(annotation);

                }
            });
            return detectedElements;
        },

        //=============================================================
        //========================= Draw control box ==================
        //=============================================================

        drawControlBox: function (element, paper) {
            $("#raphael" + PDFViewerApplication.pdfViewer.currentPageNumber).parent().children("div:not(:first-child)").addClass("hidden");
            var thatController = this;
            if (!SvgGlobalControllerLogic.isCtrlKeyPressed) thatController.clearAllCtrlBoxes();
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var baseNumber = 0;
            var strokeWidth = 3;
            var handleSize = 15 / currentScale;

            var currentX;
            var currentY;
            var ctrlBox;
            var ctrlBox_x;
            var ctrlBox_y;
            var ctrlBox_w;
            var ctrlBox_h;
            var ctrlBox_centerX;
            var ctrlBox_centerY;
            var invMat = element.matrix.invert();

            if (element.type === "ellipse") {
                ctrlBox_x = element.attr("cx") - element.attr("rx") - baseNumber;
                ctrlBox_y = element.attr("cy") - element.attr("ry") - baseNumber;
                ctrlBox_w = element.attr("rx") * 2 + baseNumber * 2;
                ctrlBox_h = element.attr("ry") * 2 + baseNumber * 2;
            } else {
                ctrlBox_x = element.attr("x") - baseNumber;
                ctrlBox_y = element.attr("y") - baseNumber;
                ctrlBox_w = element.attr("width") + baseNumber * 2;
                ctrlBox_h = element.attr("height") + baseNumber * 2;
            }

            // fill element to ease the drag
            // when the fill is empty
            if (element.attr("fill") === "") {
                thatController.drawMask(element);
            }

            ctrlBox = paper.rect(
                ctrlBox_x,
                ctrlBox_y,
                ctrlBox_w,
                ctrlBox_h
            )
                .attr({
                    fill: '',
                    stroke: 'orange',
                    'stroke-width': strokeWidth,
                    'stroke-dasharray': "-"
                })
                .rotate(element.getAngle());


            ctrlBox_centerX = ctrlBox.getBBox().cx;
            ctrlBox_centerY = ctrlBox.getBBox().cy;

            // helper methods: //

            var rotateVector = function (vec, ang) {
                ang = -ang * (Math.PI / 180);
                var cos = Math.cos(ang);
                var sin = Math.sin(ang);
                return new Array(Math.round(10000 * (vec[0] * cos - vec[1] * sin)) / 10000, Math.round(10000 * (vec[0] * sin + vec[1] * cos)) / 10000);
            };

            var GetPosition = function (dir, pos, delta, current) {
                switch (dir) {
                    case -1:
                        return pos;
                    case 0:
                        return current;
                    case 1:
                        return pos - delta;
                }
            };

            var GetLength = function (dir, delta, length) {
                switch (dir) {
                    case -1:
                        return length + delta;
                    case 0:
                        return length;
                    case 1:
                        return - delta;
                }
            }

            var onDrag = function (dx, dy, x, y, e, dirX, dirY, that) {
                //restore the not filled element
                thatController.restoreMask(element);
                if (e.type === "touchmove") {
                    var myoffset = thatController.getTouchOffset($("#pageContainer" + thatController.pageNumber + ":first"));
                    currentX = e.touches[0].pageX - myoffset.left;
                    currentY = e.touches[0].pageY - myoffset.top;

                    var paperWidth = parseFloat((thatController.paper.width).replace("px", ""));
                    var paperHeight = parseFloat((thatController.paper.height).replace("px", ""));

                    switch(thatController.getPageRotation()){
                        case 0:
                            currentX = e.touches[0].pageX - myoffset.left;
                            currentY = e.touches[0].pageY - myoffset.top;                        
                        break;
                        case 90:
                            currentX = e.touches[0].pageY - myoffset.top;
                            currentY = paperHeight - (e.touches[0].pageX - myoffset.left);                        
                        break;
                        case 180:
                            currentX = paperWidth - (e.touches[0].pageX  - myoffset.left);
                            currentY = e.touches[0].pageY - myoffset.top;                        
                        break;
                        case 270:
                            currentX = paperWidth - (e.touches[0].pageY - myoffset.top);
                            currentY = e.touches[0].pageX - myoffset.left;                                   
                        break;
                    }
                    currentX = currentX / currentScale;
                    currentY = currentY / currentScale;
                    
                } else if (false && navigator.userAgent.search("Firefox") >= 0) {
                    if (e.layerX == 0 && e.layerY == 0) {
                        e.preventDefault();
                        return false;
                    }
                    currentX = e.layerX;
                    currentY = e.layerY;
                    currentX = thatController.getXY(e, 1 / thatController.getScale()).x;
                    currentY = thatController.getXY(e, 1 / thatController.getScale()).y;
                } else {
                    currentX = e.offsetX;
                    currentY = e.offsetY;
                    currentX = thatController.getXY(e, 1 / thatController.getScale()).x;
                    currentY = thatController.getXY(e, 1 / thatController.getScale()).y;
                }
                
                //console.log(e.type);

                //thatController.paper.ellipse(currentX,currentY,3,3).attr("fill","green");

                var newX = invMat.x(currentX, currentY);
                var newY = invMat.y(currentX, currentY);
                ctrlBox_x = GetPosition(dirX, newX - baseNumber, ctrlBox_w, ctrlBox_x);
                ctrlBox_y = GetPosition(dirY, newY - baseNumber, ctrlBox_h, ctrlBox_y);


                if (["rect", "image", "highlight"].indexOf(element.type) > -1) {
                    // new width of control box:
                    ctrlBox_w = GetLength(dirX, element.attr("x") - newX, element.attr("width"));
                    ctrlBox_h = GetLength(dirY, element.attr("y") - newY, element.attr("height"));
                } else if (["ellipse"].indexOf(element.type) > -1) {
                    // new width of control box:
                    ctrlBox_w = 2 * GetLength(dirX, element.attr("cx") - newX - 2 * baseNumber, (dirX === 0) ? element.attr("rx") : 0);
                    ctrlBox_h = 2 * GetLength(dirY, element.attr("cy") - newY - 2 * baseNumber, (dirY === 0) ? element.attr("ry") : 0);
                }

                if (ctrlBox_w < 0) {
                    ctrlBox_x = ctrlBox_x + ctrlBox_w * (-dirX);
                    ctrlBox_w = -ctrlBox_w;
                }
                if (ctrlBox_h < 0) {
                    ctrlBox_y = ctrlBox_y + ctrlBox_h * (-dirY);
                    ctrlBox_h = -ctrlBox_h;
                }

                if (["ellipse"].indexOf(element.type) > -1) {
                    //update the circle
                    element.attr({
                        rx: ctrlBox_w / 2,
                        ry: ctrlBox_h / 2
                    });
                }

                // update the handle
                that.transform("");

                that.rotate(element.getAngle());
                that.attr({
                    x: currentX - handleSize / 2,
                    y: currentY - handleSize / 2
                });


                // update the ctrlBox
                ctrlBox.attr({
                    x: ctrlBox_x,
                    y: ctrlBox_y,
                    width: ctrlBox_w,
                    height: ctrlBox_h
                });
            };

            var onDragStop = function (e, angle) {
                if (["rect", "image", "highlight"].indexOf(element.type) > -1) {
                    // rollback the empty fill
                    thatController.restoreMask(element);

                    if (typeof angle === "undefined") { angle = 0 }
                    var centerDelta = [
                        (ctrlBox.getBBox().cx - ctrlBox_centerX),
                        (ctrlBox.getBBox().cy - ctrlBox_centerY)
                    ];
                    var centerDeltaRot = rotateVector(centerDelta, angle);

                    element.transform("");
                    element.attr({
                        x: ctrlBox.attr("x") + centerDelta[0] - centerDeltaRot[0],
                        y: ctrlBox.attr("y") + centerDelta[1] - centerDeltaRot[1],
                        width: ctrlBox.attr("width"),
                        height: ctrlBox.attr("height")
                    });
                    element.rotate(angle);

                    switch (element.type) {
                        case "rect":
                            if (element.getAnnotationType() === "highlight") {
                                thatController.updateHighlightOnDb(element);
                            } else {
                                thatController.updateRectOnDb(element);
                            }
                            break;
                        case "image":
                            thatController.updateStampOnDb(element);
                            break;
                    }

                } else if (["ellipse"].indexOf(element.type) > -1) {
                    thatController.updateCircleOnDb(element);
                }
                thatController.clearAllCtrlBoxes();
                thatController.drawControlBox(element, paper);
                $("#raphael" + thatController.pageNumber).parent().children("div:not(:first-child)").addClass("hidden");
            }

            if (["ellipse", "rect", "image", "highlight"].indexOf(element.type) > -1) {
                // left handles
                var lt = thatController.paper.rect(ctrlBox_x - (handleSize / 2), ctrlBox_y - (handleSize / 2), handleSize, handleSize)
                    .rotate(element.getAngle(), ctrlBox_centerX, ctrlBox_centerY)
                    .attr({ stroke: "orange", 'stroke-dasharray': "" })
                    .drag(
                        //onDrag
                        function (dx, dy, x, y, e) { onDrag(dx, dy, x, y, e, -1, -1, this); },
                        //onDragStart
                        function (x, y) { $("#raphael" + thatController.pageNumber).parent().children("div:not(:first-child)").addClass("hidden"); },
                        //onDragStop
                        function (e) { onDragStop(e, element.getAngle()); }
                    )
                    .data("type", "lt");

                var lm = thatController.paper.rect(ctrlBox_x - (handleSize / 2), ctrlBox_y + ctrlBox_h / 2 - (handleSize / 2), handleSize, handleSize)
                    .attr({ stroke: "orange", 'stroke-dasharray': "" })
                    .drag(
                        //onDrag
                        function (dx, dy, x, y, e) { onDrag(dx, dy, x, y, e, -1, 0, this); },
                        //onDragStart
                        function (x, y) { $("#raphael" + thatController.pageNumber).parent().children("div:not(:first-child)").addClass("hidden"); },
                        //onDragStop
                        function (e) { onDragStop(e, element.getAngle()); }
                    )
                    .rotate(element.getAngle(), ctrlBox_centerX, ctrlBox_centerY)
                    .data("type", "lm");

                var lb = thatController.paper.rect(ctrlBox_x - (handleSize / 2), ctrlBox_y - (handleSize / 2) + ctrlBox_h, handleSize, handleSize)
                    .attr({ stroke: "orange", 'stroke-dasharray': "" })
                    .drag(
                        //onDrag
                        function (dx, dy, x, y, e) { onDrag(dx, dy, x, y, e, -1, 1, this); },
                        //onDragStart
                        function (x, y) { $("#raphael" + thatController.pageNumber).parent().children("div:not(:first-child)").addClass("hidden"); },
                        //onDragStop
                        function (e) { onDragStop(e, element.getAngle()); }
                    )
                    .rotate(element.getAngle(), ctrlBox_centerX, ctrlBox_centerY)
                    .data("type", "lb");

                // middle handles
                var t = thatController.paper.rect(ctrlBox_x + ctrlBox_w / 2 - (handleSize / 2), ctrlBox_y - (handleSize / 2), handleSize, handleSize)
                    .attr({ stroke: "orange", 'stroke-dasharray': "" })
                    .drag(
                        //onDrag
                        function (dx, dy, x, y, e) { onDrag(dx, dy, x, y, e, 0, -1, this); },
                        //onDragStart
                        function (x, y) { $("#raphael" + thatController.pageNumber).parent().children("div:not(:first-child)").addClass("hidden"); },
                        //onDragStop
                        function (e) { onDragStop(e, element.getAngle()); }
                    )
                    .rotate(element.getAngle(), ctrlBox_centerX, ctrlBox_centerY)
                    .data("type", "t");

                var b = thatController.paper.rect(ctrlBox_x + ctrlBox_w / 2 - (handleSize / 2), ctrlBox_y + ctrlBox_h - (handleSize / 2), handleSize, handleSize)
                    .attr({ stroke: "orange", 'stroke-dasharray': "" })
                    .drag(
                        //onDrag
                        function (dx, dy, x, y, e) { onDrag(dx, dy, x, y, e, 0, 1, this); },
                        //onDragStart
                        function (x, y) { $("#raphael" + thatController.pageNumber).parent().children("div:not(:first-child)").addClass("hidden"); },
                        //onDragStop
                        function (e) { onDragStop(e, element.getAngle()); }
                    )
                    .rotate(element.getAngle(), ctrlBox_centerX, ctrlBox_centerY)
                    .data("type", "b");


                // right handles
                var rt = thatController.paper.rect(ctrlBox_x + ctrlBox_w - (handleSize / 2), ctrlBox_y - (handleSize / 2), handleSize, handleSize)
                    .attr({ stroke: "orange", 'stroke-dasharray': "" })
                    .drag(
                        //onDrag
                        function (dx, dy, x, y, e) { onDrag(dx, dy, x, y, e, 1, -1, this); },
                        //onDragStart
                        function (x, y) { $("#raphael" + thatController.pageNumber).parent().children("div:not(:first-child)").addClass("hidden"); },
                        //onDragStop
                        function (e) { onDragStop(e, element.getAngle()); }
                    )
                    .rotate(element.getAngle(), ctrlBox_centerX, ctrlBox_centerY)
                    .data("type", "rt");

                var rm = thatController.paper.rect(ctrlBox_x + ctrlBox_w - (handleSize / 2), ctrlBox_y + ctrlBox_h / 2 - (handleSize / 2), handleSize, handleSize)
                    .attr({ stroke: "orange", 'stroke-dasharray': "" })
                    .drag(
                        //onDrag
                        function (dx, dy, x, y, e) { onDrag(dx, dy, x, y, e, 1, 0, this); },
                        //onDragStart
                        function (x, y) { $("#raphael" + thatController.pageNumber).parent().children("div:not(:first-child)").addClass("hidden"); },
                        //onDragStop
                        function (e) { onDragStop(e, element.getAngle()); }
                    )
                    .rotate(element.getAngle(), ctrlBox_centerX, ctrlBox_centerY)
                    .data("type", "rm");

                var rb = thatController.paper.rect(ctrlBox_x + ctrlBox_w - (handleSize / 2), ctrlBox_y + ctrlBox_h - (handleSize / 2), handleSize, handleSize)
                    .attr({ stroke: "orange", 'stroke-dasharray': "" })
                    .drag(
                        //onDrag
                        function (dx, dy, x, y, e) { onDrag(dx, dy, x, y, e, 1, 1, this); },
                        //onDragStart
                        function (x, y) { $("#raphael" + thatController.pageNumber).parent().children("div:not(:first-child)").addClass("hidden"); },
                        //onDragStop
                        function (e) { onDragStop(e, element.getAngle()); }
                    )
                    .rotate(element.getAngle(), ctrlBox_centerX, ctrlBox_centerY)
                    .data("type", "rb");
            }

            // rotation handles
            // <<< still needs to work on this >>>
            var centerPoint = {
                x: (element.getBBox().x + element.getBBox().width / 2),
                y: (element.getBBox().y + element.getBBox().height / 2)
            }
            var tempAngle = element.getAngle();
            var angle = 0;
            var rotate = thatController.paper.ellipse(ctrlBox_x + ctrlBox_w / 2, ctrlBox_y - 35, handleSize / 2, handleSize / 2, false)
                .attr({ stroke: "orange", 'stroke-dasharray': "", 'stroke-width': 2, "fill": "orange" })
                .drag(
                    function (dx, dy, x, y, e) {  // move
                        if (e.type === "touchmove") {
                            var myoffset = thatController.getTouchOffset($("#pageContainer" + thatController.pageNumber + ":first"));
                            currentX = e.touches[0].pageX - myoffset.left;
                            currentY = e.touches[0].pageY - myoffset.top;

                            var paperWidth = parseFloat((thatController.paper.width).replace("px", ""));
                            var paperHeight = parseFloat((thatController.paper.height).replace("px", ""));

                            switch(thatController.getPageRotation()){
                                case 0:
                                    currentX = e.touches[0].pageX - myoffset.left;
                                    currentY = e.touches[0].pageY - myoffset.top;                        
                                break;
                                case 90:
                                    currentX = e.touches[0].pageY - myoffset.top;
                                    currentY = paperHeight - (e.touches[0].pageX - myoffset.left);                        
                                break;
                                case 180:
                                    currentX = paperWidth - (e.touches[0].pageX  - myoffset.left);
                                    currentY = e.touches[0].pageY - myoffset.top;                        
                                break;
                                case 270:
                                    currentX = paperWidth - (e.touches[0].pageY - myoffset.top);
                                    currentY = e.touches[0].pageX - myoffset.left;                                   
                                break;
                            }

                        } else if (navigator.userAgent.search("Firefox") >= 0) {
                            if (e.layerX == 0 && e.layerY == 0) {
                                e.preventDefault();
                                return false;
                            }
                            currentX = e.layerX;
                            currentY = e.layerY;
                        } else {
                            currentX = e.offsetX;
                            currentY = e.offsetY;
                        }

                        currentX = currentX / currentScale;
                        currentY = currentY / currentScale;

                        this.transform("");

                        this.attr({
                            cx: currentX,
                            cy: currentY
                        });


                        //deg = e.offsetX - rotatebeginX/10;
                        angle = Raphael.angle(currentX, currentY, centerPoint.x, centerPoint.y) + 90;

                        //console.log(angle);
                        //element.rotate(angle - tempAngle);
                        element.rotate(angle - tempAngle, ctrlBox_centerX, ctrlBox_centerY);
                        tempAngle = angle
                    }, function (x, y) {  // start
                        console.log(this.matrix.split().rotate)
                        $("#raphael" + thatController.pageNumber).parent().children("div:not(:first-child)").addClass("hidden");
                    }, function (e) {  //end
                        thatController.restoreMask(null);
                        element.rotate(angle - tempAngle);
                        element.data("Angle", tempAngle);
                        if (element.type === "rect") {
                            if (element.getAnnotationType() === "highlight") {
                                thatController.updateHighlightOnDb(element);
                            } else {
                                thatController.updateRectOnDb(element);
                            }
                        } else if (element.type === "ellipse") {
                            thatController.updateCircleOnDb(element);
                        } else if (element.getAnnotationType() === "stamp") {
                            thatController.updateStampOnDb(element);
                        } else if (element.getAnnotationType() === "image") {
                            thatController.updateImageOnDb(element);
                        }
                        thatController.clearAllCtrlBoxes();
                        thatController.drawControlBox(element, paper);
                        $("#raphael" + thatController.pageNumber).parent().children("div:not(:first-child)").addClass("hidden");
                    }
                )
                .rotate(element.getAngle(), ctrlBox_centerX, ctrlBox_centerY)
                .data("type", "rotate");


            var set = paper.set();

            [lt, lm, lb, t, b, rt, rm, rb].forEach(function (handle) {
                handle.attr({
                    fill: 'red',
                    stroke: '',
                    opacity: 0.6,
                    'stroke-width': 1,
                    'stroke-dasharray': ""
                });
            });

            if (["rect"].indexOf(element.type) > -1) {
                var id = element.getDocumentAnnotationId();
                //SvgGlobalControllerLogic.annotations[id].handleids = [lt, lm, lb, t, b, rt, rm, rb];
            }

            set.push(
                ctrlBox,
                lt, lm, lb,
                t, b,
                rt, rm, rb,
                rotate
            );


            set.data("isCtrlBox", true);

            //set.forEach(function(el) {
            //    el.attr({
            //        "ondrag":
            //            "function(e) {debugger;if (navigator.userAgent.search('Firefox'') >= 0 && e.layerX == 0 && e.layerY == 0) {e.preventDefault();return false;}}"
            //    });
            //});
        },

        drawControlBoxNoHandle: function (element, paper) {
            var thatController = this;
            if (!SvgGlobalControllerLogic.isCtrlKeyPressed) thatController.clearAllCtrlBoxes();
            var baseNumber = 3;

            var ctrlBox = paper.rect(
                element.getBBox().x - baseNumber,
                element.getBBox().y - baseNumber,
                element.getBBox().width + baseNumber * 2,
                element.getBBox().height + baseNumber * 2,
            )

                /*
                            var ctrlBox = paper.rect(
                                element.attr("x") - baseNumber,
                                element.attr("y") - baseNumber,
                                element.attr("width") + baseNumber * 2,
                                element.attr("height") + baseNumber * 2,
                            )*/

                .attr({
                    fill: '',
                    stroke: 'orange',
                    'stroke-width': 2,
                    'stroke-dasharray': "."
                })
                .rotate(element.getAngle());

            baseNumber = 5;
            var handleSize = 15;

            var ctrlBox_x = ctrlBox.attr("x");
            var ctrlBox_y = ctrlBox.attr("y");
            var ctrlBox_w = ctrlBox.attr("width");
            var ctrlBox_h = ctrlBox.attr("height");
            var ctrlBox_centerX = ctrlBox.getBBox().cx;
            var ctrlBox_centerY = ctrlBox.getBBox().cy;

            var set = paper.set();


            set.push(
                ctrlBox
            );


            set.data("isCtrlBox", true);

        },

        clearAllCtrlBoxes: function (keepSelectedElements) {
            $("#raphael" + PDFViewerApplication.pdfViewer.currentPageNumber).parent().children("div:not(:first-child)").removeClass("hidden");
            var that = this;
            var nodes = that.paper.childNodes;
            that.paper.forEach(function (e) {
                if (e.data("isCtrlBox") === true) {
                    e.remove();
                }
                return true;
            });
            var res = [];

            that.paper.forEach(function (el) {
                res.push(el);
            });

            for (var i = 0; i < res.length; i++) {
                if (res[i].data("isCtrlBox") === true) {
                    res[i].remove();
                }
            }
            if(!keepSelectedElements)SvgGlobalControllerLogic.selectedIds2 = [];
        },

        drawAnnotationMask: function (element, paper) {

        },

        //=============================================================
        //======================= Update / Create =====================
        //=============================================================

        createLineOnDb: function (element, points, isPasted, callback) {
            var that = this;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((that.paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((that.paper.height).replace("px", "")) / currentScale;
            //points = points.map(m => m / currentScale);

            var svgLine = {
                DocumentAnnotationId: "00000000-0000-0000-0000-000000000000",
                AnnotationType: "line",
                ParentId: "", // not implemented yet
                DocumentVersionId: AnnotationApplication.documentVersionId,
                Fill: element.attr("fill"),
                Stroke: element.attr("stroke"),
                StrokeWidth: element.attr("stroke-width"),
                Points: [
                    { X: parseFloat(points[0] / paperWidth), Y: parseFloat(points[1] / paperHeight), OrderNumber: 0 },
                    { X: parseFloat(points[2] / paperWidth), Y: parseFloat(points[3] / paperHeight), OrderNumber: 1 }
                ],
                //Top: element.attr("y"),
                //Left: element.attr("x"),
                //Width: element.attr("width"),
                //Height: element.attr("height"),
                //Angle: 0, // not implemented yet
                AnnotationName: "line",
                Opacity: element.attr("opacity"),
                ArrowEnd: element.attr("arrow-end"),
                ArrowStart: element.attr("arrow-start"),
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

            console.log(svgLine);

            this.finalizeAnnotationCreation(svgLine, element, isPasted);
        },

        updateLineOnDb: function (element, points, callback) {
            var that = this;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((that.paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((that.paper.height).replace("px", "")) / currentScale;
            var opacity = (element.attr("fill-opacity") + element.attr("opacity")) < 0.01 ?
                "transparent" : element.attr("fill-opacity");
            //points = points.map(m => m / currentScale);

            var svgLine = {
                DocumentAnnotationId: element.getDocumentAnnotationId(),
                AnnotationType: "line",
                ParentId: "", // not implemented yet
                DocumentVersionId: AnnotationApplication.documentVersionId,
                Fill: element.attr("fill"),
                Stroke: element.attr("stroke"),
                StrokeWidth: element.attr("stroke-width"),
                Points: [
                    { X: parseFloat(points[0] / paperWidth), Y: parseFloat(points[1] / paperHeight), OrderNumber: 0 },
                    { X: parseFloat(points[2] / paperWidth), Y: parseFloat(points[3] / paperHeight), OrderNumber: 1 }
                ],
                //Top: element.attr("y"),
                //Left: element.attr("x"),
                //Width: element.attr("width"),
                //Height: element.attr("height"),
                //Angle: 0, // not implemented yet
                AnnotationName: "line",
                Opacity: element.attr("opacity"),
                ArrowEnd: element.attr("arrow-end"),
                ArrowStart: element.attr("arrow-start"),
                IsSelectable: true,
                IsGroup: false, // not implemented yet
                Scale: "",
                ModifiedBy: element.getModifiedBy(),
                CreatedBy: element.getCreatedBy(),
                DeletedBy: null,
                CreatedOn: null,
                ModifiedOn: null,
                DeletedOn: null,
                EMSNodeId: null, // not implemented yet
                ChildDocumentId: null, // not implemented yet
                PageId: element.getPageId(),
                PageNumber: this.pageNumber,
                childrenIds: null // not implemented yet
            }

            this.finalizeAnnotationUpdate(svgLine, element);
        },

        createMeasurementbasicOnDb: function (set, textAlign, isPasted, callback) {
            var that = this;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((that.paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((that.paper.height).replace("px", "")) / currentScale;

            var points = [null, null, null, null];
            set.forEach(function (el) {
                if (el.attr("arrow-start") === "block" && el.type === "path") { // get the begin point
                    points[0] = el.attr("path")[0][1];
                    points[1] = el.attr("path")[0][2];
                }
                if (el.attr("arrow-end") === "block" && el.type === "path") { // get the end point
                    points[2] = el.attr("path")[1][1];
                    points[3] = el.attr("path")[1][2];
                }
            });

            var baseAngle = set.items.filter(m => m.type === "text")[0].getAngle();
            //points = points.map(m => m / currentScale);

            var txt = set.items.filter(m => m.type === "text")[0];

            var svgMeasurement = {
                DocumentAnnotationId: "00000000-0000-0000-0000-000000000000",
                AnnotationType: "measurementbasic",
                ParentId: "", // not implemented yet
                DocumentVersionId: AnnotationApplication.documentVersionId,
                Fill: set.items.filter(e => e.type === "path")[0].attr("fill"),
                Stroke: set.items.filter(e => e.type === "path")[0].attr("stroke"),
                StrokeWidth: set.items.filter(e => e.type === "path")[0].attr("stroke-width"),
                Points: [
                    { X: parseFloat(points[0] / paperWidth), Y: parseFloat(points[1] / paperHeight), OrderNumber: 0 },
                    { X: parseFloat(points[2] / paperWidth), Y: parseFloat(points[3] / paperHeight), OrderNumber: 1 }
                ],
                TextAlign: set.items.filter(e => e.type === "text")[0].getTextAlign(),
                Text: set.items.filter(m => m.type === "text")[0].attr("text"),
                Angle: baseAngle,
                AnnotationName: "measurementbasic",
                Opacity: set.items.filter(e => e.type === "path")[0].attr("opacity"),
                IsSelectable: true,
                IsGroup: true, // not implemented yet
                Scale: txt.getScale(),
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
                PageNumber: this.pageNumber,
                childrenIds: null // not implemented yet
            }

            console.log(svgMeasurement);

            that.finalizeAnnotationCreation(svgMeasurement, set, isPasted);
        },

        updateMeasurementbasicOnDb: function (set, callback) {
            var that = this;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((that.paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((that.paper.height).replace("px", "")) / currentScale;

            var points = [null, null, null, null];
            set.forEach(function (el) {
                if (el.attr("arrow-start") === "block" && el.type === "path") { // get the begin point
                    points[0] = el.attr("path")[0][1];
                    points[1] = el.attr("path")[0][2];
                }
                if (el.attr("arrow-end") === "block" && el.type === "path") { // get the end point
                    points[2] = el.attr("path")[1][1];
                    points[3] = el.attr("path")[1][2];
                }
            });

            var baseAngle = set.items.filter(m => m.type === "text")[0].getAngle();
            //points = points.map(m => m / currentScale);

            var svgMeasurement = {
                DocumentAnnotationId: set.items.filter(e => e.type === "path")[0].getDocumentAnnotationId(),
                AnnotationType: "measurementbasic",
                ParentId: "", // not implemented yet
                DocumentVersionId: AnnotationApplication.documentVersionId,
                Fill: set.items.filter(e => e.type === "path")[0].attr("fill"),
                Stroke: set.items.filter(e => e.type === "path")[0].attr("stroke"),
                StrokeWidth: set.items.filter(e => e.type === "path")[0].attr("stroke-width"),
                Points: [
                    { X: parseFloat(points[0] / paperWidth), Y: parseFloat(points[1] / paperHeight), OrderNumber: 0 },
                    { X: parseFloat(points[2] / paperWidth), Y: parseFloat(points[3] / paperHeight), OrderNumber: 1 }
                ],
                TextAlign: set.items.filter(e => e.type === "text")[0].getTextAlign(),
                Text: set.items.filter(m => m.type === "text")[0].attr("text"),
                Angle: baseAngle,
                AnnotationName: "measurementbasic",
                Opacity: set.items.filter(e => e.type === "path")[0].attr("opacity"),
                IsSelectable: true,
                IsGroup: true, // not implemented yet
                Scale: set.items.filter(m => m.type === "text")[0].getScale(),
                Unit: set.items.filter(m => m.type === "text")[0].getUnit(),
                ModifiedBy: set.items.filter(e => e.type === "path")[0].getModifiedBy(),
                CreatedBy: set.items.filter(e => e.type === "path")[0].getCreatedBy(),
                DeletedBy: null,
                CreatedOn: null,
                ModifiedOn: null,
                DeletedOn: null,
                EMSNodeId: null, // not implemented yet
                ChildDocumentId: null, // not implemented yet
                PageId: set.items.filter(e => e.type === "path")[0].getPageId(),
                PageNumber: this.pageNumber,
                childrenIds: null // not implemented yet
            }

            console.log(svgMeasurement);

            that.finalizeAnnotationUpdate(svgMeasurement, set);
        },

        createPolylineOnDb: function (element, points, isPasted, callback) {
            var that = this;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((that.paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((that.paper.height).replace("px", "")) / currentScale;
            if (SvgGlobalControllerLogic.getSvgController(this.pageNumber).canvas.tempElement) SvgGlobalControllerLogic.getSvgController(this.pageNumber).canvas.tempElement.remove();
            // add first point as last point too
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


            var svgPolygon = {
                DocumentAnnotationId: "00000000-0000-0000-0000-000000000000",
                AnnotationType: "polyline",
                ParentId: "", // not implemented yet
                DocumentVersionId: AnnotationApplication.documentVersionId,
                Fill: element.attr("fill"),
                Stroke: element.attr("stroke"),
                StrokeWidth: element.attr("stroke-width"),
                Points: svgPoints,
                Angle: 0, // not implemented yet
                AnnotationName: "polyline",
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

            this.finalizeAnnotationCreation(svgPolygon, element, isPasted);
        },

        updatePolylineOnDb: function (element, points, callback) {
            var that = this;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((that.paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((that.paper.height).replace("px", "")) / currentScale;
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


            var svgPolygon = {
                DocumentAnnotationId: element.getDocumentAnnotationId(),
                AnnotationType: "polyline",
                ParentId: "", // not implemented yet
                DocumentVersionId: AnnotationApplication.documentVersionId,
                Fill: element.attr("fill"),
                Stroke: element.attr("stroke"),
                StrokeWidth: element.attr("stroke-width"),
                Points: svgPoints,
                Angle: 0, // not implemented yet
                AnnotationName: "polyline",
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
                PageNumber: this.pageNumber,
                childrenIds: null // not implemented yet
            }

            this.finalizeAnnotationUpdate(svgPolygon, element);
        },

        createFreeDrawOnDb: function (element, points, isPasted, callback) {
            var that = this;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((that.paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((that.paper.height).replace("px", "")) / currentScale;
            if (SvgGlobalControllerLogic.getSvgController(this.pageNumber).canvas.tempElement) SvgGlobalControllerLogic.getSvgController(this.pageNumber).canvas.tempElement.remove();
            // add first point as last point too
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

            var svgfreeDraw = {
                DocumentAnnotationId: "00000000-0000-0000-0000-000000000000",
                AnnotationType: "freeDraw",
                ParentId: "", // not implemented yet
                DocumentVersionId: AnnotationApplication.documentVersionId,
                Fill: element.attr("fill"),
                Stroke: element.attr("stroke"),
                StrokeWidth: element.attr("stroke-width"),
                Points: svgPoints,
                Angle: 0, // not implemented yet
                AnnotationName: "freeDraw",
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

            this.finalizeAnnotationCreation(svgfreeDraw, element, isPasted);
        },

        updateFreeDrawOnDb: function (element, points, callback) {
            var that = this;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((that.paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((that.paper.height).replace("px", "")) / currentScale;
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

            var svgfreeDraw = {
                DocumentAnnotationId: element.getDocumentAnnotationId(),
                AnnotationType: "freeDraw",
                ParentId: "", // not implemented yet
                DocumentVersionId: AnnotationApplication.documentVersionId,
                Fill: element.attr("fill"),
                Stroke: element.attr("stroke"),
                StrokeWidth: element.attr("stroke-width"),
                Points: svgPoints,
                Angle: 0, // not implemented yet
                AnnotationName: "freeDraw",
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
                PageNumber: this.pageNumber,
                childrenIds: null // not implemented yet
            }

            this.finalizeAnnotationUpdate(svgfreeDraw, element);
        },

        createCloudOnDb: function (element, points, isPasted, callback) {
            var that = this;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((that.paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((that.paper.height).replace("px", "")) / currentScale;
            if (SvgGlobalControllerLogic.getSvgController(this.pageNumber).canvas.tempElement) SvgGlobalControllerLogic.getSvgController(this.pageNumber).canvas.tempElement.remove();
            // add first point as last point too
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



            var cloud = {
                DocumentAnnotationId: "00000000-0000-0000-0000-000000000000",
                AnnotationType: "cloud",
                ParentId: "", // not implemented yet
                DocumentVersionId: AnnotationApplication.documentVersionId,
                Fill: element.attr("fill"),
                Stroke: element.attr("stroke"),
                StrokeWidth: element.attr("stroke-width"),
                Points: svgPoints,
                Angle: 0, // not implemented yet
                AnnotationName: "cloud",
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

            this.finalizeAnnotationCreation(cloud, element, isPasted);
        },

        updateCloudOnDb: function (element, points, callback) {
            var that = this;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((that.paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((that.paper.height).replace("px", "")) / currentScale;
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

            var cloud = {
                DocumentAnnotationId: element.getDocumentAnnotationId(),
                AnnotationType: "cloud",
                ParentId: "", // not implemented yet
                DocumentVersionId: AnnotationApplication.documentVersionId,
                Fill: element.attr("fill"),
                Stroke: element.attr("stroke"),
                StrokeWidth: element.attr("stroke-width"),
                Points: svgPoints,
                Angle: 0, // not implemented yet
                AnnotationName: "cloud",
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
                PageNumber: this.pageNumber,
                childrenIds: null // not implemented yet
            }

            this.finalizeAnnotationUpdate(cloud, element);
        },

        createRectOnDb: function (element, isPasted, callback) {
            var that = this;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((that.paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((that.paper.height).replace("px", "")) / currentScale;
            if (SvgGlobalControllerLogic.getSvgController(this.pageNumber).canvas.tempElement) SvgGlobalControllerLogic.getSvgController(this.pageNumber).canvas.tempElement.remove();



            var opacity = (element.attr("fill-opacity") + element.attr("opacity")) < 0.01 ?
                "transparent" : element.attr("fill-opacity");
            //points = points.map(m=>AnnotationApplication.CanvasController.getCanvasById(1).getPointer(m));

            var svgRect = {
                DocumentAnnotationId: "00000000-0000-0000-0000-000000000000",
                AnnotationType: "rect",
                ParentId: "", // not implemented yet
                DocumentVersionId: AnnotationApplication.documentVersionId,
                Fill: (element.attr("fill") === "transparent" ? "" : element.attr("fill")),
                Stroke: element.attr("stroke"),
                StrokeWidth: element.attr("stroke-width"),
                Top: element.attr("y") / paperHeight,
                Left: element.attr("x") / paperWidth,
                Width: element.attr("width") / paperWidth,
                Height: element.attr("height") / paperHeight,
                Angle: element.getAngle() ? element.getAngle() : 0, // not implemented yet
                AnnotationName: "rect",
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

            console.log(svgRect);

            this.finalizeAnnotationCreation(svgRect, element, isPasted, callback);
        },

        updateRectOnDb: function (element, callback) {
            var that = this;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((that.paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((that.paper.height).replace("px", "")) / currentScale;

            var opacity = (element.attr("fill-opacity") + element.attr("opacity")) < 0.01 ?
                "transparent" : element.attr("fill-opacity");
            //points = points.map(m=>AnnotationApplication.CanvasController.getCanvasById(1).getPointer(m));


            var svgRect = {
                DocumentAnnotationId: element.getDocumentAnnotationId(),
                AnnotationType: "rect",
                ParentId: "", // not implemented yet
                DocumentVersionId: AnnotationApplication.documentVersionId,
                Fill: (element.attr("fill") === "transparent" ? "" : element.attr("fill")),
                Stroke: element.attr("stroke"),
                StrokeWidth: element.attr("stroke-width"),
                Top: element.attr("y") / paperHeight,
                Left: element.attr("x") / paperWidth,
                width: element.attr("width") / paperWidth,
                height: element.attr("height") / paperHeight,
                Angle: element.getAngle() ? element.getAngle() : 0, // not implemented yet
                AnnotationName: "rect",
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
                PageNumber: this.pageNumber,
                childrenIds: null // not implemented yet
            }

            console.log("svgRect", svgRect);

            this.finalizeAnnotationUpdate(svgRect, element);
        },

        createHighlightOnDb: function (element, isPasted, callback) {
            var that = this;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((that.paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((that.paper.height).replace("px", "")) / currentScale;
            if (SvgGlobalControllerLogic.getSvgController(this.pageNumber).canvas.tempElement) SvgGlobalControllerLogic.getSvgController(this.pageNumber).canvas.tempElement.remove();

            var opacity = (element.attr("fill-opacity") + element.attr("opacity")) < 0.01 ?
                "transparent" : element.attr("fill-opacity");
            //points = points.map(m=>AnnotationApplication.CanvasController.getCanvasById(1).getPointer(m));

            var svgRect = {
                DocumentAnnotationId: "00000000-0000-0000-0000-000000000000",
                AnnotationType: "highlight",
                ParentId: "", // not implemented yet
                DocumentVersionId: AnnotationApplication.documentVersionId,
                Fill: element.attr("fill"),
                Stroke: element.attr("stroke"),
                StrokeWidth: element.attr("stroke-width"),
                Top: element.attr("y") / paperHeight,
                Left: element.attr("x") / paperWidth,
                Width: element.attr("width") / paperWidth,
                Height: element.attr("height") / paperHeight,
                Angle: 0, // not implemented yet
                AnnotationName: "highlight",
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

            console.log(svgRect);

            this.finalizeAnnotationCreation(svgRect, element, isPasted, callback);
        },

        updateHighlightOnDb: function (element, callback) {
            var that = this;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((that.paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((that.paper.height).replace("px", "")) / currentScale;

            var opacity = (element.attr("fill-opacity") + element.attr("opacity")) < 0.01 ?
                "transparent" : element.attr("fill-opacity");
            //points = points.map(m=>AnnotationApplication.CanvasController.getCanvasById(1).getPointer(m));

            var svgRect = {
                DocumentAnnotationId: element.getDocumentAnnotationId(),
                AnnotationType: "highlight",
                ParentId: "", // not implemented yet
                DocumentVersionId: AnnotationApplication.documentVersionId,
                Fill: element.attr("fill"),
                Stroke: element.attr("stroke"),
                StrokeWidth: element.attr("stroke-width"),
                Top: element.attr("y") / paperHeight,
                Left: element.attr("x") / paperWidth,
                Width: element.attr("width") / paperWidth,
                Height: element.attr("height") / paperHeight,
                Angle: element.getAngle() ? element.getAngle() : 0, // not implemented yet
                AnnotationName: "highlight",
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
                PageNumber: this.pageNumber,
                childrenIds: null // not implemented yet
            }

            console.log("svgRect", svgRect);

            this.finalizeAnnotationUpdate(svgRect, element);
        },

        createCircleOnDb: function (element, isPasted, callback) {
            var that = this;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((that.paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((that.paper.height).replace("px", "")) / currentScale;
            if (SvgGlobalControllerLogic.getSvgController(this.pageNumber).canvas.tempElement) SvgGlobalControllerLogic.getSvgController(this.pageNumber).canvas.tempElement.remove();


            var opacity = (element.attr("fill-opacity") + element.attr("opacity")) < 0.01 ?
                "transparent" : element.attr("fill-opacity");
            //points = points.map(m=>AnnotationApplication.CanvasController.getCanvasById(1).getPointer(m));


            var svgCirc = {
                DocumentAnnotationId: "00000000-0000-0000-0000-000000000000",
                AnnotationType: "circ",
                ParentId: "", // not implemented yet
                DocumentVersionId: AnnotationApplication.documentVersionId,
                Fill: element.attr("fill"),
                Stroke: element.attr("stroke"),
                StrokeWidth: element.attr("stroke-width"),
                Top: element.attr("cy") / paperHeight,
                Left: element.attr("cx") / paperWidth,
                RadiusX: element.attr("rx") / paperWidth,
                RadiusY: element.attr("ry") / paperHeight,
                Angle: element.getAngle() ? element.getAngle() : 0, // not implemented yet
                AnnotationName: "circ",
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


            this.finalizeAnnotationCreation(svgCirc, element, isPasted, callback);
        },

        updateCircleOnDb: function (element, callback) {
            var that = this;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((that.paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((that.paper.height).replace("px", "")) / currentScale;



            var svgCirc = {
                DocumentAnnotationId: element.getDocumentAnnotationId(),
                AnnotationType: "circ",
                ParentId: "", // not implemented yet
                DocumentVersionId: AnnotationApplication.documentVersionId,
                Fill: element.attr("fill"),
                Stroke: element.attr("stroke"),
                StrokeWidth: element.attr("stroke-width"),
                Top: element.attr("cy") / paperHeight,
                Left: element.attr("cx") / paperWidth,
                RadiusX: element.attr("rx") / paperWidth,
                RadiusY: element.attr("ry") / paperHeight,
                Angle: element.getAngle(),
                AnnotationName: "circ",
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
                PageNumber: this.pageNumber,
                childrenIds: null // not implemented yet
            }

            console.log("svgRect", svgCirc);

            this.finalizeAnnotationUpdate(svgCirc, element);
        },

        createStampOnDb: function (element, isPasted, callback) {
            var that = this;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((that.paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((that.paper.height).replace("px", "")) / currentScale;
            if (SvgGlobalControllerLogic.getSvgController(this.pageNumber).canvas.tempElement) SvgGlobalControllerLogic.getSvgController(this.pageNumber).canvas.tempElement.remove();

            //points = points.map(m=>AnnotationApplication.CanvasController.getCanvasById(1).getPointer(m));

            var stamp = {
                DocumentAnnotationId: "00000000-0000-0000-0000-000000000000",
                AnnotationType: "stamp",
                ParentId: "", // not implemented yet
                DocumentVersionId: AnnotationApplication.documentVersionId,
                Top: element.attr("y") / paperHeight,
                Left: element.attr("x") / paperWidth,
                Width: element.attr("width") / paperWidth,
                Height: element.attr("height") / paperHeight,
                Src: element.attr("src"),
                Angle: element.getAngle() ? element.getAngle() : 0, // not implemented yet
                AnnotationName: "stamp",
                Opacity: 1,
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

            this.finalizeAnnotationCreation(stamp, element, isPasted, callback);

            /*
            $.ajax({
                url: element.attr("src"),
                dataType: "html",
                type: 'GET',
                success: function (response) {
                    //parser = new DOMParser();
                    //doc = parser.parseFromString(response, "image/svg+xml");
                    //var dims = doc.children[0].getAttribute('viewBox').split(' ');



                    var tempImg = new Image();
                    tempImg.src = "data:image/svg+xml;base64," + window.btoa(response);
                    tempImg.height = 67;
                    //tempImg.width = 67 * dims[2] / dims[3];
                    tempImg.width = 100;


                    SvgGlobalControllerLogic.getSvgController(this.pageNumber).canvas.finalizeAnnotationCreation(stamp, element);
                }
            });
            */
        },

        updateStampOnDb: function (element, callback) {
            var that = this;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((that.paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((that.paper.height).replace("px", "")) / currentScale;

            var opacity = (element.attr("fill-opacity") + element.attr("opacity")) < 0.01 ?
                "transparent" : element.attr("fill-opacity");
            //points = points.map(m=>AnnotationApplication.CanvasController.getCanvasById(1).getPointer(m));


            var stamp = {
                DocumentAnnotationId: element.getDocumentAnnotationId(),
                AnnotationType: "stamp",
                ParentId: "", // not implemented yet
                DocumentVersionId: AnnotationApplication.documentVersionId,
                Top: element.attr("y") / paperHeight,
                Left: element.attr("x") / paperWidth,
                Width: element.attr("width") / paperWidth,
                Height: element.attr("height") / paperHeight,
                Src: element.attr("src"),
                Angle: element.getAngle() ? element.getAngle() : 0, // not implemented yet
                AnnotationName: "stamp",
                Opacity: element.attr("opacity"),
                IsSelectable: true,
                IsGroup: false, // not implemented yet
                Scale: "",
                ModifiedBy: element.getModifiedBy(),
                CreatedBy: element.getCreatedBy(),
                DeletedBy: null,
                CreatedOn: null,
                ModifiedOn: null,
                DeletedOn: null,
                EMSNodeId: null, // not implemented yet
                ChildDocumentId: null, // not implemented yet
                PageId: element.getPageId(),
                PageNumber: this.pageNumber,
                childrenIds: null // not implemented yet
            }

            this.finalizeAnnotationUpdate(stamp, element);

        },

        createImageOnDb: function (element, url, isPasted, callback) {
            var that = this;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((that.paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((that.paper.height).replace("px", "")) / currentScale;
            if (SvgGlobalControllerLogic.getSvgController(this.pageNumber).canvas.tempElement) SvgGlobalControllerLogic.getSvgController(this.pageNumber).canvas.tempElement.remove();

            //points = points.map(m=>AnnotationApplication.CanvasController.getCanvasById(1).getPointer(m));

            var stamp = {
                DocumentAnnotationId: "00000000-0000-0000-0000-000000000000",
                AnnotationType: "image",
                ParentId: "", // not implemented yet
                DocumentVersionId: AnnotationApplication.documentVersionId,
                Top: element.attr("y") / paperHeight,
                Left: element.attr("x") / paperWidth,
                Width: element.attr("width") / paperWidth,
                Height: element.attr("height") / paperHeight,
                Src: url,
                Angle: element.getAngle() ? element.getAngle() : 0, // not implemented yet
                AnnotationName: "image",
                Opacity: 1,
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

            this.finalizeAnnotationCreation(stamp, element, isPasted, callback);
        },

        updateImageOnDb: function (element, callback) {
            var that = this;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((that.paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((that.paper.height).replace("px", "")) / currentScale;

            var opacity = (element.attr("fill-opacity") + element.attr("opacity")) < 0.01 ?
                "transparent" : element.attr("fill-opacity");
            //points = points.map(m=>AnnotationApplication.CanvasController.getCanvasById(1).getPointer(m));


            var stamp = {
                DocumentAnnotationId: element.getDocumentAnnotationId(),
                AnnotationType: "image",
                ParentId: "", // not implemented yet
                DocumentVersionId: AnnotationApplication.documentVersionId,
                Top: element.attr("y") / paperHeight,
                Left: element.attr("x") / paperWidth,
                Width: element.attr("width") / paperWidth,
                Height: element.attr("height") / paperHeight,
                Src: element.data("Src"),
                Angle: element.getAngle() ? element.getAngle() : 0, // not implemented yet
                AnnotationName: "image",
                Opacity: element.attr("opacity"),
                IsSelectable: true,
                IsGroup: false, // not implemented yet
                Scale: "",
                ModifiedBy: element.getModifiedBy(),
                CreatedBy: element.getCreatedBy(),
                DeletedBy: null,
                CreatedOn: null,
                ModifiedOn: null,
                DeletedOn: null,
                EMSNodeId: null, // not implemented yet
                ChildDocumentId: null, // not implemented yet
                PageId: element.getPageId(),
                PageNumber: this.pageNumber,
                childrenIds: null // not implemented yet
            }

            this.finalizeAnnotationUpdate(stamp, element);

        },

        getPageRotation: function () {
            var that = this;
            return PDFViewerApplication.pdfViewer.getPageView(that.pageNumber - 1).rotation;
        },

        createTextboxOnDb: function (element, isPasted, callback) {
            var that = this;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((that.paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((that.paper.height).replace("px", "")) / currentScale;
            if (SvgGlobalControllerLogic.getSvgController(this.pageNumber).canvas.tempElement) SvgGlobalControllerLogic.getSvgController(this.pageNumber).canvas.tempElement.remove();

            var text = null;
            var rect = null;

            element.forEach(function (el) {
                if (el.type === "text") {
                    text = el;
                } else if (el.type === "rect") {
                    rect = el;
                }
            });
            var rotation =
                console.log(element);

            var textbox = {
                DocumentAnnotationId: "00000000-0000-0000-0000-000000000000",
                Left: text.attr("x") / paperWidth,
                Top: text.attr("y") / paperHeight,
                Width: (text.getBBox().width) / paperWidth,
                Height: (text.getBBox().height) / paperHeight,
                AnnotationType: "textbox",
                Angle: that.getPageRotation(),
                ParentId: "", // not implemented yet
                DocumentVersionId: AnnotationApplication.documentVersionId,
                Fill: rect.attr("fill"),
                Stroke: rect.attr("stroke"),
                StrokeWidth: rect.attr("stroke-width"),
                Text: text.attr("text"),
                FontSize: text.attr("font-size") / currentScale,
                AnnotationName: "textbox",
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
                PageNumber: this.pageNumber,
                childrenIds: null // not implemented yet
            }

            this.finalizeAnnotationCreation(textbox, element, isPasted, callback);
        },

        updateTextboxOnDb: function (element, callback) {
            if (['emsgroup', 'emselement'].includes(element[0].getAnnotationType())) {
                var emsNodeId = element[0].data("EMSNodeId");
                dataExchange.sendParentMessage('selectObject',emsData[emsNodeId]);
                // TreeView_L.scrollToSelectedEmsNode(emsNodeId);
                return;
            }
            var that = this;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((that.paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((that.paper.height).replace("px", "")) / currentScale;

            var text = null;
            var rect = null;

            var bbox = element.items.filter(s => s.type === "text")[0].getBBox();
            element.forEach(function (el) {
                if (el.type === "text") {
                    text = el;
                    bbox = el.getBBox();
                } else if (el.type === "rect") {
                    rect = el;
                    /*
                    rect.attr({
                        x: bbox.x - 3,
                        y: bbox.y - 3,
                        width: bbox.width + 6,
                        height: bbox.height + 6
                    });
                    */
                }
            });

            var textbox = {
                DocumentAnnotationId: element[0].getDocumentAnnotationId(),
                Left: text.attr("x") / paperWidth,
                Top: text.attr("y") / paperHeight,
                Width: text.getBBox().width / paperWidth,
                Height: text.getBBox().height / paperHeight,
                AnnotationType: "textbox",
                Angle: (text.getAngle() !== undefined) ? Math.abs(text.getAngle()) : 0,
                ParentId: "", // not implemented yet
                DocumentVersionId: (loadedModule !== "EMS") ? AnnotationApplication.documentVersionId : AnnotationApplication.documentVersionId,
                Fill: rect.attr("fill"),
                Stroke: rect.attr("stroke"),
                StrokeWidth: rect.attr("stroke-width"),
                Text: text.attr("text"),
                FontSize: text.attr("font-size") / currentScale ,
                AnnotationName: "textbox",
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
                PageNumber: this.pageNumber,
                childrenIds: null // not implemented yet
            }

            this.finalizeAnnotationUpdate(textbox, element);
        },

        reConstructTextBoxRect: function (element) {
            var text = element.items.filter(s => s.type === "text" && s.attr("fill") !== ""  && s.attr("fill") !== null)[0];
            var rect = element.items.filter(s => s.type === "rect")[0];
            var bbox = text.getBBox();
            rect.transform("");

            rect.attr({
                x: bbox.x - 3,
                y: bbox.y - 3,
                width: bbox.width + 6,
                height: bbox.height + 6
            });

            //rect.rotate(rect.getAngle());
        },

        createCalloutOnDb: function (element, isPasted, callback) {
            var that = this;
            var fill;
            var rect;
            element.forEach(function (ele) {
                if (ele.type === "set") {
                    ele.forEach(function (el) {
                        if (el.type === "rect") {
                            fill = el.attr("fill");
                            rect = el;
                        }
                    });
                }
            });
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((that.paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((that.paper.height).replace("px", "")) / currentScale;
            if (SvgGlobalControllerLogic.getSvgController(this.pageNumber).canvas.tempElement) SvgGlobalControllerLogic.getSvgController(this.pageNumber).canvas.tempElement.remove();

            var set = {
                DocumentAnnotationId: "00000000-0000-0000-0000-000000000000",
                AnnotationType: "callout",
                ParentId: "", // not implemented yet
                DocumentVersionId: AnnotationApplication.documentVersionId,
                AnnotationName: "callout",
                Points: [
                    { X: parseFloat(element[0].attrs.path[0][1] / paperWidth), Y: parseFloat(element[0].attrs.path[0][2] / paperHeight), OrderNumber: 0 },// this is the shared point
                    { X: parseFloat(element[0].attrs.path[1][1] / paperWidth), Y: parseFloat(element[0].attrs.path[1][2] / paperHeight), OrderNumber: 1 },
                    { X: parseFloat(element[1].attrs.path[1][1] / paperWidth), Y: parseFloat(element[1].attrs.path[1][2] / paperHeight), OrderNumber: 2 }
                ],
                //Fill: element[0].attr("fill"),
                Fill: fill,
                Stroke: element[0].attr("stroke"),
                StrokeWidth: element[0].attr("stroke-width"),
                Text: element[2][0].attr("text"),
                FontSize: element[2][0].attr("font-size"),
                ArrowStart: "classic",
                ArrowEnd: "classic",
                Angle: -1*rect.getAngle(),
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
                PageNumber: this.pageNumber,
                childrenIds: null // not implemented yet
            }
            this.finalizeAnnotationCreation(set, element, isPasted, callback);
        },

        updateCalloutOnDb: function (element, callback) {
            var that = this;
            var fill = "";
            var rect = null;
            var text = null;
            element.forEach(function (ele) {
                if (ele.type === "set") {
                    ele.forEach(function (el) {
                        if (el.type === "rect") {
                            fill = el.attr("fill");
                            rect = el;
                        } else if (el.type === "text") {
                            text = el;
                        }
                    });
                }
            });

            var lines = element.items.filter(s => s.type === "path");
            if (text === null) text = element.items.filter(s => s.type === "text")[0];
            if (rect === null) rect = element.items.filter(s => s.type === "rect")[0];

            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((that.paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((that.paper.height).replace("px", "")) / currentScale;

            var set = {
                DocumentAnnotationId: element[0].getDocumentAnnotationId(),
                AnnotationType: "callout",
                ParentId: "", // not implemented yet
                DocumentVersionId: AnnotationApplication.documentVersionId,
                AnnotationName: "callout",
                Points: [
                    { X: parseFloat(lines[0].attrs.path[0][1] / paperWidth), Y: parseFloat(lines[0].attrs.path[0][2] / paperHeight), OrderNumber: 0 },// this is the shared point
                    { X: parseFloat(lines[0].attrs.path[1][1] / paperWidth), Y: parseFloat(lines[0].attrs.path[1][2] / paperHeight), OrderNumber: 1 },
                    { X: parseFloat(lines[1].attrs.path[1][1] / paperWidth), Y: parseFloat(lines[1].attrs.path[1][2] / paperHeight), OrderNumber: 2 }
                ],
                //Fill: element[0].attr("fill"),
                Fill: rect.attr("fill"),
                Stroke: lines[0].attr("stroke"),
                StrokeWidth: lines[0].attr("stroke-width"),
                Text: text.attr("text"),
                FontSize: text.attr("font-size"),
                Angle: -1*rect.getAngle(),
                IsSelectable: true,
                IsGroup: true, // not implemented yet
                Scale: "",
                ModifiedBy: element[0].getModifiedBy(),
                CreatedBy: element[0].getCreatedBy(),
                DeletedBy: null,
                CreatedOn: null,
                ModifiedOn: null,
                DeletedOn: null,
                EMSNodeId: null, // not implemented yet
                ChildDocumentId: null, // not implemented yet
                PageId: element[0].getPageId(),
                PageNumber: this.pageNumber,
                childrenIds: null // not implemented yet
            }
            this.finalizeAnnotationUpdate(set, element);
        },

        createTexttagOnDb: function (elementSet, isPasted, callback) {
            if (isPasted === undefined) isPasted = false;
            var that = this;
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
            that.finalizeAnnotationCreation(set, elementSet, isPasted, function (response) {
                var parentId = response.DocumentAnnotationId;
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

                        that.finalizeAnnotationCreation(image, el, isPasted, function (secResponse) {
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
                        that.finalizeAnnotationCreation(svgRect, el, isPasted, function (secResponse) {
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
        },

        updateTexttagOnDb: function (element, callback) {
            var that = this;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((that.paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((that.paper.height).replace("px", "")) / currentScale;

            var set = {
                DocumentAnnotationId: element[0].getDocumentAnnotationId(),
                AnnotationType: "texttag",
                ParentId: "", // not implemented yet
                DocumentVersionId: AnnotationApplication.documentVersionId,
                AnnotationName: "texttag",
                Points: [
                    { X: parseFloat(element[0].attrs.path[0][1] / paperWidth), Y: parseFloat(element[0].attrs.path[0][2] / paperHeight), OrderNumber: 0 },// this is the shared point
                    { X: parseFloat(element[0].attrs.path[1][1] / paperWidth), Y: parseFloat(element[0].attrs.path[1][2] / paperHeight), OrderNumber: 1 },
                    { X: parseFloat(element[1].attrs.path[1][1] / paperWidth), Y: parseFloat(element[1].attrs.path[1][2] / paperHeight), OrderNumber: 2 }
                ],
                Fill: element[0].attr("fill"),
                Stroke: element[0].attr("stroke"),
                StrokeWidth: element[0].attr("stroke-width"),
                Text: element[2][0].attr("text"),
                FontSize: element[2][0].attr("font-size"),
                IsSelectable: true,
                IsGroup: true, // not implemented yet
                Scale: "",
                ModifiedBy: element[0].getModifiedBy(),
                CreatedBy: element[0].getCreatedBy(),
                DeletedBy: null,
                CreatedOn: null,
                ModifiedOn: null,
                DeletedOn: null,
                EMSNodeId: null, // not implemented yet
                ChildDocumentId: null, // not implemented yet
                PageId: element[0].getPageId(),
                PageNumber: this.pageNumber,
                childrenIds: null // not implemented yet
            }
            this.finalizeAnnotationUpdate(set, element);
        },

        createEmsGroupOnDb: function (element, isPasted, callback) {
            var that = this;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((that.paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((that.paper.height).replace("px", "")) / currentScale;
            if (SvgGlobalControllerLogic.getSvgController(this.pageNumber).canvas.tempElement) SvgGlobalControllerLogic.getSvgController(this.pageNumber).canvas.tempElement.remove();

            var text = null;
            var rect = null;

            element.forEach(function (el) {
                if (el.type === "set") {
                    el.forEach(function (e) {
                        if (e.type === "text") {
                            text = e;
                        }
                    });
                } else if (el.type === "rect") {
                    rect = el;
                }
            });

            var set = {
                DocumentAnnotationId: "00000000-0000-0000-0000-000000000000",
                AnnotationType: "emsgroup",
                ParentId: "", // not implemented yet
                DocumentVersionId: AnnotationApplication.documentVersionId,
                AnnotationName: "emsgroup",
                Left: (text.attr("x") - 2 - text.getBBox().width / 2) / paperWidth,
                Top: (text.attr("y") - 2 - text.getBBox().height / 2) / paperHeight,
                Width: (rect.attr("width")) / paperWidth,
                Height: (rect.attr("height")) / paperHeight,
                Fill: null,
                Angle: (text.getAngle() !== undefined) ? Math.abs(text.getAngle()) : 0,
                Stroke: null,
                StrokeWidth: null,
                Text: text.attr("text"),
                FontSize: text.attr("font-size"),
                IsSelectable: true,
                IsGroup: true, // not implemented yet
                Scale: "",
                ModifiedBy: null,
                CreatedBy: null,
                DeletedBy: null,
                CreatedOn: null,
                ModifiedOn: null,
                DeletedOn: null,
                EMSNodeId: text.data("EMSNodeId"),
                ChildDocumentId: null, // not implemented yet
                PageId: "00000000-0000-0000-0000-000000000000",
                PageNumber: this.pageNumber,
                childrenIds: null // not implemented yet
            }
            this.finalizeAnnotationCreation(set, element, isPasted, callback);
        },

        reConstructEmsGroup: function (emsGroupSet) {
            var textEl;
            var textRect;
            var rect;
            var qr;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;

            emsGroupSet.forEach(function (el) {
                if (el.type === "set") {
                    el.forEach(function (e) {
                        if (e.type === "text") {
                            textEl = e;
                        } else if (e.type === "rect") {
                            textRect = e;
                        }
                    });
                } else if (el.type === "rect" && el.attr("fill") === "") {
                    rect = el;
                } else if (el.type === "text") {
                    textEl = el;
                } else if (el.type === "rect" && el.attr("fill") !== "") {
                    textRect = el;
                } else if (el.type === "image") {
                    qr = el;
                }
            });

            var textbbox = textEl.getBBox();


            // update QR location
            if (typeof qr !== "undefined") {
                qr.attr({
                    x: textbbox.x - 3
                });
            }

            // update rect location
            if (rect !== undefined) {
                rect.attr({
                    x: textbbox.x,
                    y: textbbox.y
                    //width: Math.max(textbbox.width, qr.attr("width"))
                    //width: textbbox.width * currentScale,
                    //height: textbbox.height
                });
            }

            // update textbox rect location
            textRect.attr({
                x: textbbox.x - 3,
                y: textbbox.y - 3,
                //width: rect !== undefined ? rect.attr("width") : Math.min(textbbox.width, qr.attr("width"))
                width: textbbox.width + 6,
                height: textbbox.height + 6
            });

            return emsGroupSet;

        },

        // use this for ems group
        // TODO: change the name
        reConstructEmsGroup3: function (emsGroupSet) {

            var textEl;
            var textRect;
            var rect;
            var qr;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;

            emsGroupSet.forEach(function (el) {
                if (el.type === "set") {
                    el.forEach(function (e) {
                        if (e.type === "text") {
                            textEl = e;
                        } else if (e.type === "rect") {
                            textRect = e;
                        }
                    });
                } else if (el.type === "rect" && el.attr("fill") === "") {
                    rect = el;
                } else if (el.type === "text") {
                    textEl = el;
                } else if (el.type === "rect" && el.attr("fill") !== "") {
                    textRect = el;
                } else if (el.type === "image") {
                    qr = el;
                }
            });
            var newFontSize = parseInt(textEl.attr("font-size"));

            var documentAnnotationId = emsGroupSet[0].getDocumentAnnotationId();
            var elmsToRemove = SvgGlobalControllerLogic.getElementsByDocumentAnnotationId(documentAnnotationId);
            elmsToRemove.forEach(function(elm){
                elm.remove();
            });
            var pageAnnotations = LocalAnnotationsControllerLogic.data[AnnotationApplication.documentVersionId][this.pageNumber];
            var elmToAdd = pageAnnotations.filter(s=>s.DocumentAnnotationId === documentAnnotationId);
            if(elmToAdd.length>0){
                elmToAdd[0].FontSize = newFontSize;
                this.addToPaper(elmToAdd[0], this.pageNumber, false, false);
            }
        },

        updateEmsGroupOnDb: function (element, callback) {
            try {
                var that = this;
                var currentScale = PDFViewerApplication.pdfViewer.currentScale;
                var paperWidth = parseFloat((that.paper.width).replace("px", "")) / currentScale;
                var paperHeight = parseFloat((that.paper.height).replace("px", "")) / currentScale;

                var text = element;
                var docId = element[0].getDocumentAnnotationId();
                var element = SvgGlobalControllerLogic.getElementsByDocumentAnnotationId(docId);


                var rect = null;

                element.forEach(function (el) {
                    if (el.type === "set") {
                        el.forEach(function (e) {
                            if (e.type === "text") {
                                text = e;
                            }
                        });
                    } else if (el.type === "rect") {
                        rect = el;
                    } else if (el.type === "text") {
                        text = el;
                    }
                });

                var text_text = element.filter(e => e.type === "text")[0].attr("text");
                var fontSize = element.filter(e => e.type === "text")[0].attr("font-size");
                fontSize = fontSize ? fontSize : 10;

                var set = {
                    DocumentAnnotationId: docId,
                    AnnotationType: "emsgroup",
                    ParentId: "", // not implemented yet
                    DocumentVersionId: AnnotationApplication.documentVersionId,
                    AnnotationName: "emsgroup",
                    // Left: rect.attr("x") / paperWidth,//(text.attr("x") - 2 - text.getBBox().width / 2) / paperWidth,
                    // Top: rect.attr("y") / paperHeight,//(text.attr("y") - 2 - text.getBBox().height / 2) / paperHeight
                    Left: (text.attr("x") - 2 - text.getBBox().width / 2) / paperWidth,
                    Top: (text.attr("y") - 2 - text.getBBox().height / 2) / paperHeight,
                    Width: rect.attr("width") / paperWidth,
                    Height: rect.attr("height") / paperHeight,
                    Fill: null,
                    Angle: (text.getAngle() !== undefined) ? Math.abs(text.getAngle()) : 0,
                    Stroke: null,
                    StrokeWidth: null,
                    Text: text_text,
                    FontSize: fontSize,
                    IsSelectable: true,
                    IsGroup: true, // not implemented yet
                    Scale: "",
                    ModifiedBy: rect.getModifiedBy(),
                    CreatedBy: rect.getCreatedBy(),
                    DeletedBy: null,
                    CreatedOn: null,
                    ModifiedOn: null,
                    DeletedOn: null,
                    EMSNodeId: rect.data("EMSNodeId"),
                    ChildDocumentId: null, // not implemented yet
                    PageId: rect.getPageId(),
                    PageNumber: this.pageNumber,
                    childrenIds: null // not implemented yet
                }
                element = that.paper.set().push(element[0], element[1], element[2]);
                this.finalizeAnnotationUpdate(set, element);
            } catch (ex) {
                console.error(ex);
            }
        },

        createEmsElementOnDb: function (element, isPasted, callback) {
            var that = this;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((that.paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((that.paper.height).replace("px", "")) / currentScale;
            if (SvgGlobalControllerLogic.getSvgController(this.pageNumber).canvas.tempElement) SvgGlobalControllerLogic.getSvgController(this.pageNumber).canvas.tempElement.remove();

            var text = null;
            var rect = null;
            var image = null

            element.forEach(function (el) {
                if (el.type === "set") {
                    el.forEach(function (e) {
                        if (e.type === "text") {
                            text = e;
                        } else if (e.type === "rect") {
                            rect = e;
                        }
                    });
                } else if (el.type === "image") {
                    image = el;
                }
            });

            var set = {
                DocumentAnnotationId: "00000000-0000-0000-0000-000000000000",
                AnnotationType: "emsgroup",
                ParentId: "", // not implemented yet
                DocumentVersionId: AnnotationApplication.documentVersionId,
                AnnotationName: "emsgroup",
                Left: (text.attr("x") - 2 - text.getBBox().width / 2) / paperWidth,
                Top: (text.attr("y") - 2 - text.getBBox().height / 2) / paperHeight,
                Width: rect.attr("width") / currentScale,
                Height: rect.attr("height") / currentScale,
                Fill: null,
                Stroke: null,
                Angle: that.getPageRotation(),
                StrokeWidth: null,
                Text: text.attr("text"),
                FontSize: text.attr("font-size"),
                IsSelectable: true,
                IsGroup: true, // not implemented yet
                Scale: "",
                ModifiedBy: null,
                CreatedBy: null,
                DeletedBy: null,
                CreatedOn: null,
                ModifiedOn: null,
                DeletedOn: null,
                EMSNodeId: text.data("EMSNodeId"),
                ChildDocumentId: null, // not implemented yet
                PageId: "00000000-0000-0000-0000-000000000000",
                PageNumber: this.pageNumber,
                childrenIds: null // not implemented yet
            }
            this.finalizeAnnotationCreation(set, element, isPasted, callback);
        },

        updateEmsElementOnDb: function (element, callback) {
            var that = this;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var paperWidth = parseFloat((that.paper.width).replace("px", "")) / currentScale;
            var paperHeight = parseFloat((that.paper.height).replace("px", "")) / currentScale;

            var text = null;
            var rect = null;
            var image = null

            element.forEach(function (el) {
                if (el.type === "set") {
                    el.forEach(function (e) {
                        if (e.type === "text") {
                            text = e;
                        } else if (e.type === "rect") {
                            rect = e;
                        }
                    });
                } else if (el.type === "image") {
                    image = el;
                }
            });

            var set = {
                DocumentAnnotationId: text.getDocumentAnnotationId(),
                AnnotationType: "emsgroup",
                ParentId: "", // not implemented yet
                DocumentVersionId: AnnotationApplication.documentVersionId,
                AnnotationName: "emsgroup",
                Left: rect.attr("x") / paperWidth,
                Top: rect.attr("y") / paperHeight,
                //Width:  rect.attr("width") / currentScale,
                //Height:  rect.attr("height") / currentScale,
                Fill: null,
                Angle: that.getPageRotation(),
                Stroke: null,
                StrokeWidth: null,
                Text: text.attr("text"),
                FontSize: text.attr("font-size"),
                IsSelectable: true,
                IsGroup: true, // not implemented yet
                Scale: "",
                Src: image.attr("src"),
                ModifiedBy: text.getModifiedBy(),
                CreatedBy: text.getCreatedBy(),
                DeletedBy: null,
                CreatedOn: null,
                ModifiedOn: null,
                DeletedOn: null,
                EMSNodeId: text.data("EMSNodeId"),
                ChildDocumentId: null, // not implemented yet
                PageId: text.getPageId(),
                PageNumber: this.pageNumber,
                childrenIds: null // not implemented yet
            }
            this.finalizeAnnotationUpdate(set, element);
        },


        finalizeAnnotationCreation: function (svgObject, element, isPasted, callback) {

            if (isPasted === undefined) isPasted = false;
            console.log("finalize isPasted", isPasted);
            var that = this;
            //if(!SvgGlobalControllerLogic.isAbleToEdit(element)) return;
            console.log("ready to create: ", svgObject);
            //fabricJsObject = AnnotationApplication.CanvasController.modifyDisplayProperties(fabricJsObject);
            /*
            var canvas = AnnotationApplication.CanvasController.getCanvasById(this.pageNumber);
            canvas.add(fabricJsObject);
            canvas.renderAll();
            */
            AnnotationApplication.CRUDController.createAnnotation(
                svgObject,
                function (response) {
                    // updating annotation List
                    if (!isPasted) {
                        var annList = $("#annotationListContainer");
                        if (annList.length > 0) {
                            AnnotationApplication.RightSidebarController.showAnnotationList();
                        }
                    }


                    if (['texttagrect', 'texttagimage'].includes(svgObject.AnnotationType)) {
                        svgObject.DocumentAnnotationId = element.getDocumentAnnotationId();
                    } else {
                        svgObject.DocumentAnnotationId = response.DocumentAnnotationId;
                    }
                    //SvgGlobalControllerLogic.allDbAnnotations.filter(s => s.page === that.pageNumber && s.documentVersionId === AnnotationApplication.documentVersionId)[0].annotations.push(svgObject);
                    LocalAnnotationsControllerLogic.addAnnotation(AnnotationApplication.documentVersionId, that.pageNumber, svgObject, that);
                    //if (loadedModule !== "EMS") WsCollaborationLogic.notifyNewAnnotationAvailable();
                    if (element.type === "set") {

                        element.forEach(function (el) {
                            if (el.type !== "set") {
                                el.data("DocumentAnnotationId", response.DocumentAnnotationId);
                                el.data("PageId", response.PageId);
                                el.data("CreatedBy", response.CreatedBy);
                                el.data("CreatedOn", Date(response.CreatedOn));
                                el.data("ModifiedBy", response.ModifiedBy);
                                el.data("ModifiedOn", Date(response.ModifiedOn));
                                el.data("AnnotationType", response.AnnotationType);
                                el.data("SvgController", that);
                            } else {
                                el.forEach(function (e) {
                                    if (e.type !== "set") {
                                        e.data("DocumentAnnotationId", response.DocumentAnnotationId);
                                        e.data("PageId", response.DocumentAnnotationId);
                                        e.data("CreatedBy", response.CreatedBy);
                                        e.data("CreatedOn", Date(response.CreatedOn));
                                        e.data("ModifiedBy", response.ModifiedBy);
                                        e.data("ModifiedOn", Date(response.ModifiedOn));
                                        e.data("AnnotationType", response.AnnotationType);
                                        e.data("SvgController", that);
                                    } else {
                                        e.forEach(function (elx) {
                                            elx.data("DocumentAnnotationId", response.DocumentAnnotationId);
                                            elx.data("PageId", response.DocumentAnnotationId);
                                            elx.data("CreatedBy", response.CreatedBy);
                                            elx.data("CreatedOn", Date(response.CreatedOn));
                                            elx.data("ModifiedBy", response.ModifiedBy);
                                            elx.data("ModifiedOn", Date(response.ModifiedOn));
                                            elx.data("AnnotationType", response.AnnotationType);
                                            elx.data("SvgController", that);
                                        });
                                    }
                                });
                            }
                        });

                        //element.items[0].data("DocumentAnnotationId", response.DocumentAnnotationId);
                        //console.log(element.items[0].data("DocumentAnnotationId"));
                    } else {
                        element.data("DocumentAnnotationId", response.DocumentAnnotationId);
                        element.data("PageId", response.PageId);
                        element.data("CreatedBy", response.CreatedBy);
                        element.data("CreatedOn", Date(response.CreatedOn));
                        element.data("ModifiedBy", response.ModifiedBy);
                        element.data("ModifiedOn", Date(response.ModifiedOn));
                        element.data("AnnotationType", response.AnnotationType);
                        element.data("SvgController", that);
                        /*console.log({
                            DocumentAnnotationId: element.data("DocumentAnnotationId"),
                            PageId: element.data("PageId"),
                            CreatedBy: element.data("CreatedBy"),
                            CreatedOn: element.data("CreatedOn"),
                            ModifiedBy: element.data("ModifiedBy"),
                            ModifiedOn: element.data("ModifiedOn"),
                        });*/
                        //element.drawMask();
                    }
                    if (callback) callback(response);
                });
        },

        drawMask: function (element) {
            var that = this;
            if (element.attr("fill") === "") {
                that.maskedElement = element;
                that.maskedElementFill = element.attr("fill");
                that.maskedElementOpacity = element.attr("opacity");
                element.attr({
                    fill: "white",
                    "fill-opacity": 0.01
                });
            }
        },

        restoreMask: function (element) {
            var that = this;
            if (that.maskedElement !== null) {
                that.maskedElement.attr({
                    fill: "",
                    "fill-opacity": that.maskedElementOpacity
                });
            }
            that.maskedElement = null;
            that.maskedElementFill = null;
            that.maskedElementOpacity = null;
        },

        finalizeAnnotationUpdate: function (svgObject, element, callback) {
            var that = this;
            if(!SvgGlobalControllerLogic.isAbleToEdit(element)) return;
            //console.log("ready to Update: ", svgObject);
            //svgObject = AnnotationApplication.CanvasController.modifyDisplayProperties(svgObject);
            /*
            var canvas = AnnotationApplication.CanvasController.getCanvasById(this.pageNumber);
            canvas.add(fabricJsObject);
            canvas.renderAll();
            */
            AnnotationApplication.CRUDController.updateAnnotation(svgObject, function (response) {




                LocalAnnotationsControllerLogic.updateAnnotation(
                    AnnotationApplication.documentVersionId,
                    that.pageNumber,
                    svgObject,
                    that);

                if (element.paper.getById(element.data("MaskId")) !== null) {
                    element.paper.getById(element.data("MaskId")).remove();
                }
                if (element.type !== "set" && element.getAnnotationType() === "rect") element.drawMask();

                if (AnnotationApplication.RightSidebarController.isSidebarOpen) {
                    if ((element.type === "set" && element.items[0].getAnnotationType() === "measurementbasic")
                        || (element.type !== "set" && element.getAnnotationType() === "measurementbasic")
                        || element.type === "set" && element.items[0].getAnnotationType() === "emsgroup") {
                        AnnotationApplication.RightSidebarController.closeSidebar();
                        AnnotationApplication.RightSidebarController
                            .openSidebar(
                                element,
                                SvgGlobalControllerLogic.selectedObject.svgController.pageNumber,
                                SvgGlobalControllerLogic.selectedObject.svgController.paper.getById(element[0].raphaelid ? element[0].raphaelid : element[0].id)
                            );
                        $(".rightSidebarTabTools").click();
                        SvgGlobalControllerLogic.selectedObject={
                            element : element,
                            svgController: that
                        }
                    }
                }
                

            });
        },

        updateStyle: function (element, type, style, saveToDb) {
            var that = this;
            if (type === "callout") {
                element[0].attr(style);
                element[1].attr(style);
            } else if (type === "measurementbasic") {
                var lns = element.items.filter(el => el.type === "path");
                lns[0].attr(style);
                if (lns.length > 1) {
                    lns[1].attr(style);
                }
            } else {
                element.attr(style);
            }

            if (saveToDb) {
                switch (type) {
                    case "line":
                        var points = that.generateLinePathBy(element);
                        that.updateLineOnDb(element, points);
                        break;
                    case "polyline":
                        var points = that.generatePolylinePathBy(element);
                        that.updatePolylineOnDb(element, points);
                        break;
                    case "rect":
                        //var points = that.generatePolylinePathBy(element);
                        that.updateRectOnDb(element);
                        break;
                    case "highlight":
                        //var points = that.generatePolylinePathBy(element);
                        that.updateHighlightOnDb(element);
                        break;
                    case "circ":
                        //var points = getSvgController(this.pageNumber ).canvas.generatePolylinePathBy(element);
                        that.updateCircleOnDb(element);
                        break;
                    case "text":
                        //var points = getSvgController(this.pageNumber ).canvas.generatePolylinePathBy(element);
                        that.updateTextboxOnDb(element);
                        break;
                    case "stamp":
                        //var points = getSvgController(this.pageNumber ).canvas.generatePolylinePathBy(element);
                        that.updateStampOnDb(element);
                        break;
                    case "cloud":
                        //var points = getSvgController(this.pageNumber ).canvas.generatePolylinePathBy(element);
                        that.updateCloudOnDb(element);
                        break;
                    case "callout":
                        that.updateCalloutOnDb(element);
                        break;
                }
            }
        },

        //===============================================================
        //======================== Element Events =======================
        //===============================================================

        // isAbleToEdit: function(element){
        //     var emsDrawingIsReadOnly = false;
        //     if(["emsgroup", "emselement"].includes(element[0].data("AnnotationType"))){
        //         var docAnnId = element[0].getDocumentAnnotationId();
        //         var emsNodeId = 
        //         LocalAnnotationsControllerLogic.data[AnnotationApplication.documentVersionId][this.pageNumber].filter(s=>s.DocumentAnnotationId === docAnnId)[0].EMSNodeId;
        //         emsDrawingIsReadOnly = TreeView_L.getTreeItemDataById(emsNodeId).ReadOnly;
        //     }
        //     var isAnonymous = ROLE === "Anonymous";
        //     if(!isAnonymous && !emsDrawingIsReadOnly){
        //         return true;
        //     }else{
        //         return false;
        //     }
        // },

        bindEventsToElement: function (element, paper, elementType) {

            
            
            // DRAWING_EXTERNAL_ID
            
            var isAnonymous = ROLE === "Anonymous";
            if(!isAnonymous){
                try {
                    var that = this;
                    var ts = null;//touchstart
                    var te = null;//touchend
                    var tm = null;//touchmove
                    if (elementType === "textbox") {
                        var hammer = new Hammer.Manager(element[0].node);
                        hammer.add(new Hammer.Tap({ event: "doubletap" }));
                        hammer.get('doubletap').set({ enable: true });
                        hammer.on("doubletap", function (e) {
                            //alert("double tap");
                            if (!["emsgroup", "emselement"].includes(element[0].getAnnotationType())) {
                                that.openTextBoxEdit(element, element);
                            } else {
                                dataExchange.sendParentMessage('selectObject',emsData[element[0].EmsNodeId]);
                                // TreeView_L.scrollToSelectedEmsNode(element[0].EmsNodeId, true);
                            }
                        });
                    }
                    element
                        .touchstart(function (e) {
                            if(!SvgGlobalControllerLogic.isAbleToEdit(element)) return;
                            console.log("touchstart", e);
                            ts = e;
                        })
                        .touchend(function (e) {
                            if(!SvgGlobalControllerLogic.isAbleToEdit(element)) return;
                            console.log("touchend", e);
                            te = e;
                            if (te.timeStamp - ts.timeStamp < 500) {
                                // tap
                                if (elementType === "measurementbasic") {
                                    console.log("text dbl clicked!");
                                    that.clearAllJoints();
                                    that.openMeasurementScaleEdit(element);
                                    that.onElementClick(element, paper, elementType);
                                } else {
                                    that.onElementClick(element, paper, elementType);
                                }


                            }
                        })
                        .touchmove(function (e) {
                            if(!SvgGlobalControllerLogic.isAbleToEdit(element)) return;
                            console.log("touchmove", e);
                            tm = e;

                        })
                        .click(function (e) {
                            if(!SvgGlobalControllerLogic.isAbleToEdit(element)) return;
                            if (element.type === "text" && ["emsgroup", "emselement"].includes(element[0].getAnnotationType())) {
                                return;
                            }
                            that.onElementClick(element, paper, elementType);
                        })
                        .mouseover(function (e) {
                            if(!SvgGlobalControllerLogic.isAbleToEdit(element)) return;
                            that.onElementMouseOver(e);
                        })
                        .mouseout(function (e) {
                            if(!SvgGlobalControllerLogic.isAbleToEdit(element)) return;
                            that.onElementMouseOut(e);
                        })
                        .dblclick(function () {
                            if(!SvgGlobalControllerLogic.isAbleToEdit(element)) return;
                            if (['textbox'].includes(elementType)) {
                                console.log("text dbl clicked!");
                                if (!["emsgroup", "emselement"].includes(element[0].getAnnotationType())) {
                                    that.openTextBoxEdit(element, element);
                                } else {
                                    dataExchange.sendParentMessage('selectObject',emsData[element[0].EmsNodeId]);
                                    // TreeView_L.scrollToSelectedEmsNode(element[0].EmsNodeId, true);
                                }
                            }
                            if (["measurementbasic"].includes(elementType)) {
                                console.log("text dbl clicked!");
                                that.clearAllJoints();
                                that.openMeasurementScaleEdit(element);
                            }
                        })
                        .mouseup(function (e) {
                            if(!SvgGlobalControllerLogic.isAbleToEdit(element)) return;
                            //var element = that.getElementByDocId(this.data("DocumentAnnotationId"));
                            that.mouseupHandler(e, element, paper, elementType);
                        })
                        .drag(
                            function (dx, dy, x, y, e) {  // move
                                if(!SvgGlobalControllerLogic.isAbleToEdit(element)) return;
                                var dxdy = that.getDXDY(dx, dy);
                                dx = dxdy.dx;
                                dy = dxdy.dy;
                                that.onElementDragging(element, dx, dy, x, y, e, elementType);
                                e.stopPropagation();
                            }, function (x, y) {  // start
                                if(!SvgGlobalControllerLogic.isAbleToEdit(element)) return;
                                that.onElementDragStart(element, x, y, elementType);
                            }, function (e) {  //end
                                if(!SvgGlobalControllerLogic.isAbleToEdit(element)) return;
                                that.onElementDragEnd(element, e, elementType);
                            }
                        );
                } catch (ex) {
                    console.error(ex);
                }
            }
        },


        onElementDragging: function (element, dx, dy, x, y, e, elementType) {
            var that = this;
            try {
                //SvgGlobalControllerLogic.allSelectedObjects = SvgGlobalControllerLogic.allSelectedObjects.filter(s =>s !== null || (s !== null && s.type === "set" && s[0] !== null) );
                SvgGlobalControllerLogic.allSelectedObjects = SvgGlobalControllerLogic.allSelectedObjects.filter(s => s[0] !== null);
                var enableMultiselect = true;
                if (that.drawingType.toLowerCase() === "select" && SvgGlobalControllerLogic.allSelectedObjects.length > 1 && enableMultiselect) {
                    if (!this.isDrawing && (Math.abs(dx) + Math.abs(dy) !== 0)) {
                        SvgGlobalControllerLogic.isDraggingElement = true;
                        var lx = dx;// + ox ;
                        var ly = dy;// + oy ;

                        SvgGlobalControllerLogic.allSelectedObjects.forEach(function (el) {
                           
                            var angle = el.matrix.split().rotate;
                            el.transform("");
                            el.transform("T" + lx + "," + ly + "r" + angle);
                            //el.transform("T" + lx + "," + ly);
                            //el.rotate(angle, el.getBBox().cx, el.getBBox().cy);
                        });
                    }
                } else {
                    
                    SvgGlobalControllerLogic.allSelectedObjects = [];
                    //that.detectSelectedObjects(that.tempElement);
                    //that.clearAllCtrlBoxes();
                    //console.log(that.tempElement);
                    
                    if (['rect', 'stamp', 'image', 'textbox', 'highlight'].includes(elementType)) {
                        if (!this.isDrawing && (Math.abs(dx) + Math.abs(dy) !== 0)) {
                            SvgGlobalControllerLogic.isDraggingElement = true;
                            var lx = dx;// + ox ;
                            var ly = dy;// + oy ;

                            element.transform("T" + lx / that.getScale() + "," + ly / that.getScale() + "r" + element.getAngle());
                            if (elementType === "textbox" && element[0].data("textbox")) {
                                //element.rotate(element.getAngle());
                                that.reConstructTextBoxRect(element);
                            }
                            if (element.type === "set" && element[0].data("isCalloutTextbox")) {
                                var line = this.paper.getById(element[0].data("isCalloutTextbox"));
                                var path = line.attr("path");

                                line.attr("path", "M " + path[0][1] + " " + path[0][2]
                                    + " L " + (element.getBBox().x + element.getBBox().width/2) + " " + (element.getBBox().y + element.getBBox().height/2));
                            }
                            if (element.type === "set" && ['emsgroup', 'emselement'].includes(element[0].getAnnotationType()) && element.items[0].getDocumentAnnotationId() !== undefined) {
                                var txtRect = SvgGlobalControllerLogic.getElementsByDocumentAnnotationId(element.items[0].getDocumentAnnotationId());
                                txtRect.forEach(function (el) {
                                    if (el.type === "rect" && el.attr("fill") === "") {
                                        el.transform("T" + lx / that.getScale() + "," + ly / that.getScale());
                                    } else {
                                        el.transform("T" + lx / that.getScale() + "," + ly / that.getScale() + "r" + element.getAngle());
                                    }
                                    /*
                                    if (el.type !== "text" && ['emsgroup'].includes(el.getAnnotationType())) {
                                        el.transform("T" + lx / that.getScale() + "," + ly / that.getScale()+ "r"+element.getAngle());
                                    } else if (el.type === "image" && ['emselement'].includes(el.getAnnotationType())) {
                                        el.transform("T" + lx / that.getScale() + "," + ly / that.getScale()+ "r"+element.getAngle());
                                    }
                                    */
                                });
                            }
                        }
                    }

                    if (['circ'].includes(elementType)) {
                        if (!this.isDrawing && (Math.abs(dx) + Math.abs(dy) !== 0)) {
                            SvgGlobalControllerLogic.isDraggingElement = true;
                            var lx = dx;// + ox ;
                            var ly = dy;// + oy ;

                            element.transform("T" + lx / that.getScale() + "," + ly / that.getScale());
                            element.rotate(element.data("Angle"));
                        }
                    }

                    if (['polyline', 'cloud','freedraw'].includes(elementType)) {
                        if (!that.isDrawing && (Math.abs(dx) + Math.abs(dy) !== 0)) {
                            SvgGlobalControllerLogic.isDraggingElement = true;
                            var lx = dx;// + ox ;
                            var ly = dy;// + oy ;

                            //nx = x;
                            //ny = y;

                            element.transform("T" + lx / that.getScale() + "," + ly / that.getScale());
                        }
                    }
                }
            } catch (ex) {
                console.error(ex);
            }

        },

        onElementDragStart: function (element, x, y, elementType) {
            var that = this;
            
            that.clearAllCtrlBoxes();
            // removing alone text element for measurementbasic
            /*
            for(var i=0; i<SvgGlobalControllerLogic.allSelectedObjects.length; i++){
                var items = SvgGlobalControllerLogic.allSelectedObjects;
                if(items[i].type === "text" && items[i].getAnnotationType() === "measurementbasic"){
                    var correspondingLine = items.filter(s=>s.getDocumentAnnotationId() === items[i].getDocumentAnnotationId()
                        && s.type === "path");
                    if(correspondingLine.length === 0){
                        SvgGlobalControllerLogic.allSelectedObjects[i] = null;
                    }
                }
            }
            */
            SvgGlobalControllerLogic.allSelectedObjects = SvgGlobalControllerLogic.allSelectedObjects.filter(s => s !== null);
            SvgGlobalControllerLogic.allSelectedObjects = SvgGlobalControllerLogic.allSelectedObjects.filter(s => !(s.type === "text" && s.getAnnotationType() === "measurementbasic"));
            SvgGlobalControllerLogic.allSelectedObjects = SvgGlobalControllerLogic.allSelectedObjects.filter(s => 
                !(
                    s.type === "rect" 
                    && s.getAnnotationType() === "emsgroup" 
                    && s.attr("fill") === ""
                    && SvgGlobalControllerLogic.getElementsByDocumentAnnotationId(s.getDocumentAnnotationId()).filter(p=>
                        p.type === "text" 
                        && SvgGlobalControllerLogic.allSelectedObjects.includes(p)
                    ).length === 0
                )
            );

            if (['rect', 'circ', 'stamp', 'image', 'textbox', 'highlight'].includes(elementType)) {
                this.clearAllJoints();
            }
        },

        onElementDragEnd: function (element, e, elementType) {
            var that = this;
            var scale = PDFViewerApplication.pdfViewer.currentScale;
            try {
                var enableMultiselect = true;
                if (that.drawingType.toLowerCase() === "select" && SvgGlobalControllerLogic.allSelectedObjects.length > 0 && enableMultiselect) {
                    if (!this.isDrawing && SvgGlobalControllerLogic.isDraggingElement) {
                        this.restoreMask(element);
                        SvgGlobalControllerLogic.isDraggingElement = false;
                        SvgGlobalControllerLogic.allSelectedObjects = SvgGlobalControllerLogic.allSelectedObjects.filter(s => s[0] !== null);
                        var emsVisitedText = [];
                        var calloutVisitedAnnotation = [];
                        var measurementVisitedAnnotation = [];
                        SvgGlobalControllerLogic.allSelectedObjects.forEach(function (el) {
                            var angle = el.matrix.split().rotate;
                            el.rotate(-1 * angle);
                            var dx = el.matrix.split().dx;
                            var dy = el.matrix.split().dy;
                            var newX = el.attr("x") + dx;
                            var newY = el.attr("y") + dy;
                            var annotationType = el.type === "set" ? el[0].getAnnotationType() : el.getAnnotationType();
                            if (['rect', 'stamp', 'image', 'highlight'].includes(annotationType)) {

                                //el.rotate(-1 * angle);
                                var transString = el.matrix.toTransformString();
                                //var x = el.matrix.x(el.attr("x"), el.attr("y"));
                                //var y = el.matrix.y(el.attr("x"), el.attr("y"));

                                //var centerE = that.paper.ellipse(el.getBBox().cx, el.getBBox().cy, 3, 3).attr("fill","green").toFront();
                                el.transform("");


                                el.attr({
                                    x: newX,
                                    y: newY
                                });
                                el.rotate(angle);
                                el.data("Angle", angle);
                                var aftertransString = el.matrix.toTransformString();
                                switch (el.getAnnotationType()) {
                                    case 'rect':
                                        that.updateRectOnDb(el);
                                        break;
                                    case 'stamp':
                                        that.updateStampOnDb(el);
                                        break;
                                    case 'image':
                                        that.updateImageOnDb(el);
                                        break;
                                    case 'highlight':
                                        that.updateHighlightOnDb(el);
                                        break;
                                }
                                //el.rotate(angle, el.getBBox().cx, el.getBBox().cy);
                            } else if (['circ'].includes(annotationType)) {

                                el.rotate(-1 * angle);

                                el.transform("");

                                el.attr({
                                    cx: el.attr("cx") + dx,
                                    cy: el.attr("cy") + dy
                                })
                                    .rotate(angle);
                                el.data("Angle", angle);
                                that.updateCircleOnDb(el);
                            } else if (['line', 'polyline', 'cloud'].includes(annotationType)) {

                                el.transform("");
                                switch (el.getAnnotationType()) {
                                    case "line":
                                        var tempPath = "";
                                        for (var i = 0; i < el.attr("path").length; i++) {
                                            var tpx = (parseFloat(el.attr("path")[i][1]) + dx).toFixed(0);
                                            var tpy = (parseFloat(el.attr("path")[i][2]) + dy).toFixed(0);
                                            tempPath = tempPath + (i === 0 ? el.attr("path")[i][0] : " " + el.attr("path")[i][0]) + " " + tpx + " " + tpy;
                                        }
                                        el.attr("path", tempPath);
                                        that.updateLineOnDb(el, that.generateLinePathBy(el));
                                        break;
                                    case "polyline":
                                        var tempPath = "";
                                        for (var i = 0; i < el.attr("path").length; i++) {
                                            var tpx = (parseFloat(el.attr("path")[i][1]) + dx).toFixed(0);
                                            var tpy = (parseFloat(el.attr("path")[i][2]) + dy).toFixed(0);
                                            tempPath = tempPath + (i === 0 ? "M " : " L ") + tpx + " " + tpy;
                                        }
                                        //tempPath += (" L " + (parseFloat(el.attr("path")[0][1]) + dx).toFixed(0) + " " + (parseFloat(el.attr("path")[0][2]) + dy).toFixed(0));
                                        //tempPath += " Z";
                                        el.attr("path", tempPath);
                                        var points = [];
                                        el.attr("path").forEach(function (p) {
                                            points.push({
                                                x: p[1],
                                                y: p[2]
                                            });
                                        });
                                        //points.pop();
                                        that.updatePolylineOnDb(el, points);
                                        break;
                                    case "cloud":
                                        var tempPath = "";
                                        var mPoints = el.attr("path").filter(p => p[0].toLowerCase() === "m" || p[0].toLowerCase() === "l");
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

                                        el.attr("path", tempPath);
                                        that.updateCloudOnDb(el, points);
                                        break;
                                }

                                el.attr({
                                    //cx: el.attr("cx") + dx,
                                    //cy: el.attr("cy") + dy
                                })
                                //.rotate(angle);
                                //that.updateCircleOnDb(el);


                            } else if (['freeDraw'].includes(annotationType)) {
                                console.log(el.attr("path"));
                                el.transform("");
                                var tempPath = "";
                                el.attr("path").forEach(function (p) {
                                    tempPath += (p[0] + " " + (parseInt(p[1]) + dx).toFixed(0) + " " + (parseInt(p[2]) + dy).toFixed(0));
                                });
                                el.attr("path", tempPath);
                                var points = [];
                                el.attr("path").forEach(function (p) {
                                    points.push({
                                        x: parseInt(p[1]),
                                        y: parseInt(p[2])
                                    });
                                });
                                that.updateFreeDrawOnDb(el, points);
                            } else if (['textbox'].includes(annotationType)) {
                                if (el.type === "text") {
                                    el.transform("");
                                    el.attr({
                                        x: parseInt(el.attr("x")) + dx,
                                        y: parseInt(el.attr("y")) + dy
                                    });
                                    var elms = SvgGlobalControllerLogic.getElementsByDocumentAnnotationId(el.getDocumentAnnotationId());
                                    var set = that.paper.set();
                                    elms.forEach(function (elx) {
                                        set.push(elx);
                                    });
                                    that.reConstructTextBoxRect(elms);
                                    that.updateTextboxOnDb(set);
                                } else {
                                    var elms = SvgGlobalControllerLogic.getElementsByDocumentAnnotationId(el.getDocumentAnnotationId());
                                    that.reConstructTextBoxRect(elms);
                                    //that.updateTextboxOnDb(set);
                                }
                            } else if (['emsgroup'].includes(annotationType)) {
                                if (el.type === "text") {
                                    el.transform("");
                                    el.attr({
                                        x: parseInt(el.attr("x")) + dx,
                                        y: parseInt(el.attr("y")) + dy
                                    });
                                    var elms = SvgGlobalControllerLogic.getElementsByDocumentAnnotationId(el.getDocumentAnnotationId());
                                    var set = that.paper.set();
                                    elms.forEach(function (elx) {
                                        set.push(elx.type === "set" ? elx[0] : elx);
                                    });
                                    that.updateEmsGroupOnDb(set);
                                } else {
                                    var cleanedAllSelectedObjects = [];
                                    SvgGlobalControllerLogic.allSelectedObjects.forEach(function (item) {
                                        if (item.type === "set") {
                                            item.forEach(function (elx) {
                                                cleanedAllSelectedObjects.push(elx);
                                            });
                                        } else {
                                            cleanedAllSelectedObjects.push(item);
                                        }
                                    });


                                    var mainElObject = cleanedAllSelectedObjects.filter(
                                        s => s.getDocumentAnnotationId() === (el.type === "set" ? el[0].getDocumentAnnotationId() : el.getDocumentAnnotationId())
                                            && s.type === "text"
                                    );


                                    if (mainElObject.length === 0 && el.getDocumentAnnotationId() !== undefined) {
                                        var txt = SvgGlobalControllerLogic.getElementsByDocumentAnnotationId(el.getDocumentAnnotationId()).filter(s => s.type === "text");
                                        if (txt.length > 0) {
                                            if (!emsVisitedText.includes(txt[0].getDocumentAnnotationId())) {
                                                emsVisitedText.push(txt[0].getDocumentAnnotationId());

                                                // the text is missing which is the main object to update
                                                // find it and update the value
                                                txt[0].transform("");
                                                txt[0].attr({
                                                    x: parseInt(txt[0].attr("x")) + dx,
                                                    y: parseInt(txt[0].attr("y")) + dy
                                                });
                                                var elms = SvgGlobalControllerLogic.getElementsByDocumentAnnotationId(txt[0].getDocumentAnnotationId());
                                                var textrect = elms.filter(s => s.type === 'rect');
                                                textrect.forEach(function (rect) {
                                                    rect.attr({
                                                        x: parseInt(rect.attr("x")) + dx,
                                                        y: parseInt(rect.attr("y")) + dy
                                                    });
                                                });
                                                elms = SvgGlobalControllerLogic.getElementsByDocumentAnnotationId(txt[0].getDocumentAnnotationId());
                                                var set = that.paper.set();
                                                elms.forEach(function (elx) {
                                                    set.push(elx.type === "set" ? elx[0] : elx);
                                                });
                                                that.updateEmsGroupOnDb(set);
                                            }
                                        }

                                    }
                                    el.transform("");
                                    el.attr({
                                        x: el.attr("x") + dx,
                                        y: el.attr("y") + dy
                                    });
                                }

                            } else if (['callout'].includes(annotationType)) {
                                if (el.getDocumentAnnotationId() !== undefined) {
                                    if (!calloutVisitedAnnotation.includes(el.getDocumentAnnotationId())) {
                                        // reconstruct callout:
                                        calloutVisitedAnnotation.push(el.getDocumentAnnotationId());
                                        var docId = el.getDocumentAnnotationId();
                                        var elms = SvgGlobalControllerLogic.getElementsByDocumentAnnotationId(docId);
                                        elms.forEach(function (elx) {


                                            switch (elx.type) {
                                                case "path":
                                                    var tempPath = "";
                                                    elx.transform("");
                                                    elx.attr("path").forEach(function (p) {
                                                        tempPath += (" " + p[0] + " " + (parseInt(p[1]) + dx) + " " + (parseInt(p[2]) + dy));
                                                    });
                                                    elx.attr("path", tempPath);
                                                    break;
                                                case "text":
                                                    elx.transform("");
                                                    elx.attr({
                                                        x: elx.attr("x") + dx,
                                                        y: elx.attr("y") + dy
                                                    });
                                                    break;
                                                case "rect":
                                                    elx.transform("");
                                                    elx.attr({
                                                        x: elx.attr("x") + dx,
                                                        y: elx.attr("y") + dy
                                                    });
                                                    break;
                                            }
                                        });
                                        var set = that.paper.set();
                                        elms.forEach(function (elx) {
                                            set.push(elx);
                                        })
                                        that.updateCalloutOnDb(set);
                                    }
                                }
                            } else if (['measurementbasic'].includes(annotationType)) {
                                if (el.getDocumentAnnotationId() !== undefined) {
                                    if (!measurementVisitedAnnotation.includes(el.getDocumentAnnotationId())) {
                                        // reconstruct measurementbasic:
                                        measurementVisitedAnnotation.push(el.getDocumentAnnotationId());
                                        var docId = el.getDocumentAnnotationId();
                                        var elms = SvgGlobalControllerLogic.getElementsByDocumentAnnotationId(docId);
                                        var lines = elms.filter(s => s.type === "path");
                                        var angle;

                                        if (lines.length === 1) {
                                            angle = Raphael.angle(lines[0].attr("path")[0][1], lines[0].attr("path")[0][2], lines[0].attr("path")[1][1], lines[0].attr("path")[1][2]);

                                        } else {
                                            angle = Raphael.angle(lines[0].attr("path")[0][1], lines[0].attr("path")[0][2], lines[1].attr("path")[1][1], lines[1].attr("path")[1][2]);

                                        }




                                        elms.forEach(function (elx) {
                                            switch (elx.type) {
                                                case "path":
                                                    var tempPath = "";
                                                    elx.transform("");
                                                    elx.attr("path").forEach(function (p) {
                                                        tempPath += (" " + p[0] + " " + (parseInt(p[1]) + dx) + " " + (parseInt(p[2]) + dy));
                                                    });
                                                    elx.attr("path", tempPath);
                                                    break;
                                                case "text":
                                                    lines = elms.filter(s => s.type === "path");
                                                    var angle = elx.getAngle();
                                                    elx.rotate(-1 * angle);
                                                    elx.transform("");
                                                    elx.attr({
                                                        x: elx.attr("x") + dx,
                                                        y: elx.attr("y") + dy
                                                    });
                                                    elx.rotate(angle);

                                                    if (lines.length === 1) {
                                                        var angle = Raphael.angle(lines[0].attr("path")[0][1], lines[0].attr("path")[0][2], lines[0].attr("path")[1][1], lines[0].attr("path")[1][2]);
                                                        switch (elx.getTextAlign()) {
                                                            case "top":
                                                                elx.translate(-1 * Math.abs(20 * Math.sin(angle * 3.14 / 180)), -1 * Math.abs(20 * Math.cos(angle * 3.14 / 180)));
                                                                break;
                                                            case "bottom":
                                                                elx.translate(Math.abs(20 * Math.sin(angle * 3.14 / 180)), Math.abs(20 * Math.cos(angle * 3.14 / 180)));

                                                                break;
                                                            default:
                                                        }
                                                        elx.rotate((lines[0].attr("path")[1][1] < lines[0].attr("path")[0][1]) ? angle : angle + 180);
                                                    } else {
                                                        var angle = Raphael.angle(lines[0].attr("path")[0][1], lines[0].attr("path")[0][2], lines[1].attr("path")[1][1], lines[1].attr("path")[1][2]);
                                                        switch (elx.getTextAlign()) {
                                                            case "top":
                                                                elx.translate(-1 * Math.abs(20 * Math.sin(angle * 3.14 / 180)), -1 * Math.abs(20 * Math.cos(angle * 3.14 / 180)));
                                                                break;
                                                            case "bottom":
                                                                elx.translate(Math.abs(20 * Math.sin(angle * 3.14 / 180)), Math.abs(20 * Math.cos(angle * 3.14 / 180)));
                                                                break;
                                                            default:
                                                        }
                                                        elx.rotate((lines[1].attr("path")[1][1] < lines[0].attr("path")[0][1]) ? angle : angle + 180);
                                                    }


                                                    break;
                                                case "rect":
                                                    elx.transform("");
                                                    elx.attr({
                                                        x: elx.attr("x") + dx,
                                                        y: elx.attr("y") + dy
                                                    });
                                                    break;
                                            }
                                            if (elx.type === "path") {
                                                var textbox = elms.filter(s => s.type === "text");
                                                if (textbox.length > 0) {
                                                    textbox = textbox[0];
                                                    var lines = elms.filter(s => s.type === "path");



                                                }
                                            }

                                        });
                                        var set = that.paper.set();
                                        elms.forEach(function (elx) {
                                            set.push(elx);
                                        })
                                        that.updateMeasurementbasicOnDb(set);
                                    }
                                }
                            } else {
                                el.transform("");
                                el.attr({
                                    x: newX,
                                    cx: newX,
                                    y: newY,
                                    cy: newY
                                }).rotate(angle);
                            }
                        });
                        SvgGlobalControllerLogic.allSelectedObjects = [];
                        that.clearAllJoints();
                        that.clearAllCtrlBoxes();
                    }
                } else {
                    //this.clearAllCtrlBoxes();
                    //this.clearAllJoints();
                    var paperWidth = parseInt(that.paper.canvas.parentElement.parentElement.parentElement.style.width.replace("px", "")) / scale;
                    var paperHeight = parseInt(that.paper.canvas.parentElement.parentElement.parentElement.style.height.replace("px", "")) / scale;
                    var dx, dy, newX, newY, angle;
                    if (typeof element !== "undefined" && !(element.length > 1)) {
                        angle = element.matrix.split().rotate;
                        element.attr({ "class": "hidden" });
                        element.rotate(-angle);
                        dx = element.matrix.split().dx;
                        dy = element.matrix.split().dy;
                        element.rotate(angle);
                        element.attr({ "class": "" });
                        newX = element.attr("x") + dx;
                        newY = element.attr("y") + dy;
                        if (['circ'].includes(elementType)) {
                            newX = element.attr("cx") + dx;
                            newY = element.attr("cy") + dy;
                        }
                        angle = element.matrix.split().rotate;
                    }
                    if (['rect', 'stamp', 'image', 'highlight'].includes(elementType)) {
                        if (!this.isDrawing && SvgGlobalControllerLogic.isDraggingElement) {
                            // rollback the empty fill
                            this.restoreMask(element);

                            element.rotate(-1 * element.data("Angle"));

                            newX = newX < 5 ? 0 : newX;
                            newY = newY < 5 ? 0 : newY;
                            newX = newX > paperWidth ? paperWidth - 10 : newX;
                            newY = newY > paperHeight ? paperHeight - 10 : newY;

                            element.attr("x", newX);
                            element.attr("y", newY);
                            element.transform("");
                            element.rotate(element.data("Angle"));

                            switch (elementType) {
                                case 'rect':
                                    this.updateRectOnDb(element);
                                    break;
                                case 'stamp':
                                    this.updateStampOnDb(element);
                                    break;
                                case 'image':
                                    this.updateImageOnDb(element);
                                    break;
                                case 'highlight':
                                    this.updateHighlightOnDb(element);
                                    break;
                            }
                        }
                    }
                    if (['circ'].includes(elementType)) {
                        if (!this.isDrawing && SvgGlobalControllerLogic.isDraggingElement) {
                            // rollback the empty fill
                            this.restoreMask(element);
                            element.rotate(-1 * element.data("Angle"));
                            newX = element.attr("cx") + dx;
                            newY = element.attr("cy") + dy;
                            newX = newX < 5 ? 0 : newX;
                            newY = newY < 5 ? 0 : newY;
                            newX = newX > paperWidth ? paperWidth - 10 : newX;
                            newY = newY > paperHeight ? paperHeight - 10 : newY;

                            element.attr("cx", newX);
                            element.attr("cy", newY);
                            element.transform("");
                            element.rotate(element.data("Angle"));

                            this.updateCircleOnDb(element);
                        }
                    }
                    if (['textbox'].includes(elementType)) {
                        if (!this.isDrawing && SvgGlobalControllerLogic.isDraggingElement) {
                            var text = element[0];

                            var textboxDragEnd = function (element, e, elementType) {

                            }

                            var emsDragEnd = function (element, e, elementType) {

                            }

                            var calloutDragEnd = function (element, e, elementType) {

                            }

                            if (element.type === "set" && ['emsgroup', 'emselement'].includes(element[0].getAnnotationType()) && element.items[0].getDocumentAnnotationId() !== undefined) {
                                var txtRect = SvgGlobalControllerLogic.getElementsByDocumentAnnotationId(element.items[0].getDocumentAnnotationId());
                                txtRect.forEach(function (elx) {
                                    if (elx.type !== "text" && ['emsgroup', 'emselement'].includes(elx.getAnnotationType())) {

                                        if (elx.type === "rect" && elx.attr("fill") === "") {
                                            //elx.rotate(-elx.getAngle());
                                            var dx = elx.matrix.split().dx;
                                            var dy = elx.matrix.split().dy;

                                            dx = elx.transform().filter(s => s[0] === "T")[0][1];
                                            dy = elx.transform().filter(s => s[0] === "T")[0][2];

                                            var newX = elx.attr("x") + dx;
                                            var newY = elx.attr("y") + dy;

                                            elx.attr("x", newX);
                                            elx.attr("y", newY);
                                            elx.transform("");
                                        } else if (elx.type === "image") {
                                            //elx.rotate(-elx.getAngle());
                                            var dx = elx.matrix.split().dx;
                                            var dy = elx.matrix.split().dy;

                                            dx = elx.transform().filter(s => s[0] === "T")[0][1];
                                            dy = elx.transform().filter(s => s[0] === "T")[0][2];

                                            var newX = elx.attr("x") + dx;
                                            var newY = elx.attr("y") + dy;

                                            elx.attr("x", newX);
                                            elx.attr("y", newY);
                                            elx.transform("");
                                            elx.rotate(-txtRect[0].getAngle());
                                        }
                                    }
                                });
                            }

                            element.forEach(function (el) {
                                el.rotate(-el.getAngle());
                                var dx = el.matrix.split().dx;
                                var dy = el.matrix.split().dy;
                                var newX = el.attr("x") + dx;
                                var newY = el.attr("y") + dy;

                                switch (0) {
                                    case 0:
                                        newX = el.attr("x") + dx;
                                        newY = el.attr("y") + dy;
                                        break;
                                    case 90:
                                        newX = el.attr("y") + dy;
                                        newY = el.attr("x") + dx;
                                        break;
                                    case 180:
                                        newX = el.attr("x") + dx;
                                        newY = el.attr("y") + dy;
                                        break;
                                    case 270:
                                        newX = el.attr("y") + dy;
                                        newY = el.attr("x") + dx;
                                        break;
                                }


                                // if the object gets out of screen
                                if (!['emsgroup', 'emselement'].includes(element[0].getAnnotationType())) {
                                    newX = newX < 5 ? 0 : newX;
                                    newY = newY < 5 ? 0 : newY;
                                    switch(that.getPageRotation() % 360){
                                        case 0:
                                        case 180:
                                            newX = newX > paperWidth ? paperWidth - 10 : newX;
                                            newY = newY > paperHeight ? paperHeight - 10 : newY;
                                        break;
                                        case 90:
                                        case 270:
                                            newX = newX > paperHeight ? paperHeight - 10 : newX;
                                            newY = newY > paperWidth ? paperWidth - 10 : newY;
                                        break;
                                        default:
                                            newX = newX > paperWidth ? paperWidth - 10 : newX;
                                            newY = newY > paperHeight ? paperHeight - 10 : newY;
                                        break;
                                    }
                                    
                                }

                                if (el.getAnnotationType() === "callout" && el.type === "rect") {
                                    newX = element.items.filter(s => s.type === "text")[0].getBBox().x - 3;
                                    newY = element.items.filter(s => s.type === "text")[0].getBBox().y - 3;
                                }

                                el.attr("x", newX);
                                el.attr("y", newY);
                                el.transform("");
                            }, element)



                            element.transform("");
                            that.reConstructTextBoxRect(element);
                            if (element.type === "set" && element[0].data("isCalloutTextbox")) {
                                var line = this.paper.getById(element[0].data("isCalloutTextbox"));
                                var path = line.attr("path");
                                element.items.forEach(function(el){
                                    el.rotate(el.getAngle());
                                });

                                line.attr("path", "M " + path[0][1] + " " + path[0][2]
                                + " L " + (element.getBBox().x + element.getBBox().width/2) + " " + (element.getBBox().y + element.getBBox().height/2));

                                // line.attr("path", "M " + path[0][1] + " " + path[0][2]
                                //     + " L " + element.getBBox().x + " " + element.getBBox().y);
                                
                                this.updateCalloutOnDb(element[0].data("parent"));
                            } else if (element.type === "set" && ['emsgroup', 'emselement'].includes(element[0].getAnnotationType())) {
                                if (element[0].getAnnotationType() === "emsgroup") {
                                    if (elementType === "textbox") {
                                        element.rotate(element.getAngle());
                                    }
                                    this.updateEmsGroupOnDb(element);
                                } else {
                                    if (elementType === "textbox") {
                                        element.rotate(element.getAngle());
                                    }
                                    this.updateEmsElementOnDb(element);
                                }

                            } else {
                                if (elementType === "textbox") {
                                    element.rotate(element.getAngle());
                                }
                                this.updateTextboxOnDb(element);
                            }
                        }
                    }

                    if (['polyline'].includes(elementType)) {
                        if (!that.isDrawing) {
                            // rollback the empty fill
                            this.restoreMask(element);
                            //var lx = nx - ox;
                            //var ly = ny - oy;
                            var polyPoints = [];
                            element.attrs.path.forEach(function (m) {
                                if (m[0].toLowerCase() !== "z") {
                                    m[1] += dx;
                                    m[2] += dy;
                                    polyPoints.push({
                                        x: m[1],
                                        y: m[2]
                                    });
                                }
                            });
                            element.transform("");

                            var pathTemp = "";
                            pathTemp += ("M " + element.attrs.path[0][1] + " " + element.attrs.path[0][2] + " ");

                            for (var j = 1; j < element.attrs.path.length; j++) {
                                if (element.attrs.path[j][0].toLowerCase() !== "z") {
                                    pathTemp += ("L " + element.attrs.path[j][1] + " " + element.attrs.path[j][2] + " ");
                                }
                            }
                            //pathTemp += "z";
                            element.attr({
                                path: pathTemp
                            });
                            that.updatePolylineOnDb(element, polyPoints);
                            //that.clearAllJoints();
                            //that.clearAllCtrlBoxes();
                        }
                    }
                    if (['cloud'].includes(elementType)) {
                        if (!that.isDrawing) {
                            //var lx = nx - ox;
                            //var ly = ny - oy;
                            var polyPoints = [];
                            element.attrs.path.forEach(function (m) {
                                if (["m"].includes(m[0].toLowerCase())) {
                                    m[1] += element.matrix.split().dx;
                                    m[2] += element.matrix.split().dy;
                                    polyPoints.push({
                                        x: m[1],
                                        y: m[2]
                                    });
                                }
                            });
                            element.transform("");

                            var pathTemp = "";
                            pathTemp += ("M " + element.attrs.path[0][1] + " " + element.attrs.path[0][2] + " ");

                            for (var j = 1; j < element.attrs.path.length; j++) {
                                if (element.attrs.path[j][0].toLowerCase() !== "z") {
                                    pathTemp += ("L " + element.attrs.path[j][1] + " " + element.attrs.path[j][2] + " ");
                                }
                            }
                            pathTemp += "z";
                            pathTemp = SvgGlobalControllerLogic.CreateCloudPath(polyPoints);
                            element.attr({
                                path: pathTemp
                            });
                            that.updateCloudOnDb(element, polyPoints);
                            //that.clearAllJoints();
                            //that.clearAllCtrlBoxes();
                        }
                    }
                    if (['freedraw'].includes(elementType)) {
                        if (!that.isDrawing) {
                            // rollback the empty fill
                            this.restoreMask(element);
                            //var lx = nx - ox;
                            //var ly = ny - oy;
                            var polyPoints = [];
                            element.attrs.path.forEach(function (m) {
                                if (m[0].toLowerCase() !== "z") {
                                    m[1] += dx;
                                    m[2] += dy;
                                    polyPoints.push({
                                        x: m[1],
                                        y: m[2]
                                    });
                                }
                            });
                            element.transform("");

                            var pathTemp = "";
                            pathTemp += ("M " + element.attrs.path[0][1] + " " + element.attrs.path[0][2] + " ");

                            for (var j = 1; j < element.attrs.path.length; j++) {
                                if (element.attrs.path[j][0].toLowerCase() !== "z") {
                                    pathTemp += ("L " + element.attrs.path[j][1] + " " + element.attrs.path[j][2] + " ");
                                }
                            }
                            //pathTemp += "z";
                            element.attr({
                                path: pathTemp
                            });
                            that.updateFreeDrawOnDb(element, polyPoints);
                            //that.clearAllJoints();
                            //that.clearAllCtrlBoxes();
                        }
                    }
                    SvgGlobalControllerLogic.isDraggingElement = false;
                    if (e.which !== 3) SvgGlobalControllerLogic.allSelectedObjects = [];
                    return element;
                }
            } catch (ex) {
                console.error(ex);
            }


        },

        onElementMouseOut: function (e) {
            ////console.log(e);
            $(SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.paper.canvas).css("z-index", "");
            $(e.target).css("cursor", "default");
        },

        onElementMouseOver: function (e) {
            ////console.log(e);
            $(SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.paper.canvas).css("z-index", "100");
            $(e.target).css("cursor", "pointer");
        },

        onElementClick: function (element, paper, elementType) {
            var that = this;
            that.restoreMask(null);
            // enable the properties button as element is selected
            //AnnotationApplication.Toolbar.widget.enable("#TwoDSettingsButton", true);

            SvgGlobalControllerLogic.selectedObject = {
                element: element,
                svgController: that
            };
            //console.log(SvgGlobalControllerLogic.allSelectedObjects);
            if (SvgGlobalControllerLogic.isCtrlKeyPressed) {
                SvgGlobalControllerLogic.allSelectedObjects.push(SvgGlobalControllerLogic.selectedObject.element);
                console.log(SvgGlobalControllerLogic.allSelectedObjects);
            } else {
                SvgGlobalControllerLogic.allSelectedObjects = [];
                //SvgGlobalControllerLogic.allSelectedObjects.push(SvgGlobalControllerLogic.selectedObject.element);
            }

            if (!['stamp', 'image'].includes(elementType)) {
                SvgGlobalControllerLogic.currentRightClickedObject = {
                    element: element,
                    pageNumber: this.pageNumber,
                    annotation: paper.getById(element[0].raphaelid ? element[0].raphaelid : element[0].id),
                };
                if (SvgGlobalControllerLogic.getSvgController(this.pageNumber).canvas.contextMenu) {
                    SvgGlobalControllerLogic.getSvgController(this.pageNumber).canvas.contextMenu.destroyContextMenu();
                }
                if (AnnotationApplication.RightSidebarController.isSidebarOpen && ['emselement', 'emsgroup'].includes(elementType)) {
                    AnnotationApplication.RightSidebarController
                        .openSidebar(element, that.pageNumber, that.paper.getById(element[0].raphaelid ? element[0].raphaelid : element[0].id));
                    $(".rightSidebarTabTools").click();
                }

            }

            if (['rect', 'circ', 'stamp', 'image', 'highlight'].includes(elementType)) {
                that.drawMask(element);
                that.drawControlBox(element, paper);
            } else if (["callout", "measurementbasic"].includes(elementType)) {
                console.log("group clicked");
                this.drawJoints(element, elementType);
            } else if (["emsgroup", "emselement"].includes(elementType) || loadedModule === "EMS") {
                SvgGlobalControllerLogic.currentRightClickedObject = {
                    element: element,
                    pageNumber: this.pageNumber,
                    annotation: paper.getById(element[0].raphaelid ? element[0].raphaelid : element[0].id),
                };
            } else if (["line"].includes(elementType)) {
                SvgGlobalControllerLogic.selectedObject = {
                    element: element,
                    svgController: that
                };
                //console.log("clicked: ", e);
                if (!SvgGlobalControllerLogic.isCtrlKeyPressed) {
                    that.clearAllJoints();
                    that.clearAllCtrlBoxes();
                }
                that.drawJoints(element, "line");

                SvgGlobalControllerLogic.currentRightClickedObject = {
                    element: element,
                    pageNumber: this.pageNumber,
                    annotation: paper.getById(element[0].raphaelid ? element[0].raphaelid : element[0].id),
                };
            } else if (["polyline", "cloud"].includes(elementType)) {
                that.drawMask(element);
                SvgGlobalControllerLogic.selectedObject = {
                    element: element,
                    svgController: that
                };
                that.clearAllJoints();
                that.clearAllCtrlBoxes();
                if (!that.isDrawing) that.drawJoints(element, elementType);

                SvgGlobalControllerLogic.currentRightClickedObject = {
                    element: element,
                    pageNumber: this.pageNumber,
                    annotation: paper.getById(element[0].raphaelid ? element[0].raphaelid : element[0].id),
                };
            }
            if (AnnotationApplication.RightSidebarController.isSidebarOpen && !['emselement', 'emsgroup'].includes(elementType)) {
                AnnotationApplication.RightSidebarController
                    .openSidebar(element, that.pageNumber, that.paper.getById(element[0].raphaelid ? element[0].raphaelid : element[0].id));
                $(".rightSidebarTabTools").click();
            } else {
                if (loadedModule !== "EMS" && !that.isDrawing) AnnotationApplication.RightSidebarController
                    .openSidebar(element, that.pageNumber, that.paper.getById(element[0].raphaelid ? element[0].raphaelid : element[0].id));
                AnnotationApplication.RightSidebarController.closeSidebar();
            }
            $("#raphael" + that.pageNumber).parent().children("div:not(:first-child)").addClass("hidden");
            //SvgGlobalControllerLogic.copyAnnotationsToSession([element]);
        },



        //===============================================================
        //======================== Right Click ==========================
        //===============================================================

        rightClickHandler: function (element, paper, event) {
            SvgGlobalControllerLogic.openContextMenu(event,element);
            return;
            var that = this;
            that.restoreMask(null);
            var annotation = element;
            if (element.localName !== "svg") {
                annotation = paper.getById(element[0].raphaelid ? element[0].raphaelid : element[0].id)
            }
            SvgGlobalControllerLogic.currentRightClickedObject = {
                element: element,
                pageNumber: this.pageNumber,
                annotation: annotation,
            };
            event.preventDefault();
            if (SvgGlobalControllerLogic.getSvgController(this.pageNumber).canvas.contextMenu) {
                SvgGlobalControllerLogic.getSvgController(this.pageNumber).canvas.contextMenu.destroyContextMenu();
            }
            var emsNodeId = null;
            var projectId = null;
            var threeD_vl = null;
            //var canvas = AnnotationApplication.CanvasController.getCanvasById(this.pageNumber);
            //console.log("canvas: ", element.type === "set" ? element[0] : element);
            var settings = {
                event: event,
                mesh: annotation,
                objectType: (element.localName !== "svg") ? "ANNOTATION" : "CANVAS",
                emsNodeId: emsNodeId,
                projectId: projectId,
                threeD_vl: threeD_vl,
                misc: element
            }

            SvgGlobalControllerLogic.selectedObject = {
                element: element,
                svgController: that
            };
            SvgGlobalControllerLogic.getSvgController(this.pageNumber).canvas.contextMenu = new ContextMenu(settings);
            if (SvgGlobalControllerLogic.allSelectedObjects.length > 0) {
                //SvgGlobalControllerLogic.copyAnnotationsToSession(SvgGlobalControllerLogic.allSelectedObjects);
            } if (element.type !== undefined) {
                //SvgGlobalControllerLogic.copyAnnotationsToSession([element]);
            }
        },

        removeAnnotation: function (fabricJsAnnotation) {
            var element = SvgGlobalControllerLogic.getSvgController(this.pageNumber).canvas.getElementByDocId(fabricJsAnnotation.DocumentAnnotationId);
            console.log(element);
        },


        //================================================================
        // ======================= import from SVG =======================
        //================================================================

        

        addToPaper: function (annotation, pageNumber, isPasted, isPaperResized) {
            var that = this;
            var paperWidth = 0;
            var paperHeight = 0;
            var currentScale = 1;

            // hack: remove the quotes in annotationName
            // and annotationType
            annotation.AnnotationType = annotation.AnnotationType.replace("\"", "").replace("\"", "");
            annotation.AnnotationName = annotation.AnnotationName.replace("\"", "").replace("\"", "");

            if (true) { //rein: we have different scaling logic now! // if (isPaperResized) {
                paperWidth = that.paper.width.replace('px', '') / PDFViewerApplication.pdfViewer.currentScale;
                paperHeight = that.paper.height.replace('px', '') / PDFViewerApplication.pdfViewer.currentScale;
            } else {
                paperWidth = parseFloat((SvgGlobalControllerLogic.all.filter(s => s.page === pageNumber)[0].canvas.paper.width).replace("px", ""));
                paperHeight = parseFloat((SvgGlobalControllerLogic.all.filter(s => s.page === pageNumber)[0].canvas.paper.height).replace("px", ""));
            }

            //if (isPasted) {
            //    var paperWidthCandidate = parseFloat((SvgGlobalControllerLogic.all.filter(s => s.page === annotation.PageNumber)[0].canvas.paper.width).replace("px", ""));
            //    var paperHeightCandidate = parseFloat((SvgGlobalControllerLogic.all.filter(s => s.page === annotation.PageNumber)[0].canvas.paper.height).replace("px", ""));
            //    // in case that the target page size is smaller than the source page size
            //    paperWidth = (paperWidth < paperWidthCandidate) ? paperWidth : paperWidthCandidate;
            //    paperHeight = (paperHeight < paperHeightCandidate) ? paperHeight : paperHeightCandidate;
            //}
            try {
                var element;
                var svgObject = null;
                var widthMultiplier = paperWidth;
                var heightMultiplier = paperHeight;
                if ((annotation.Left > 2 || annotation.Left < -1) || (annotation.top > 2 || annotation.top < -1)) {
                    widthMultiplier = currentScale;
                    heightMultiplier = currentScale;
                }
                switch (annotation.AnnotationType.toLowerCase()) {
                    case "rect":
                        var x = annotation.Left * paperWidth;
                        var y = annotation.Top * paperHeight;
                        var w = annotation.Width * paperWidth;
                        var h = annotation.Height * paperHeight;
                        if (annotation.Left > 1) {
                            x = annotation.Left;
                            y = annotation.Top;
                            w = annotation.Width;
                            h = annotation.Height;
                        }

                        svgObject = new SvgRect(
                            that,
                            annotation.DocumentAnnotationId,
                            "rect",
                            pageNumber,
                            null,
                            annotation.Angle,
                            null,
                            annotation.Angle,
                            [],
                            [],
                            []
                        );

                        
                        if(isPasted){
                            svgObject.drawBoxAfterSave = true;
                            svgObject.create(x, y, w, h);
                            svgObject.element.attr({
                                fill: annotation.Fill,
                                stroke: annotation.Stroke,
                                'stroke-width': annotation.StrokeWidth,
                                'stroke-dasharray': "",
                                "opacity": annotation.Opacity
                            });
                            svgObject.update();
                        }else{
                            svgObject.draw(x, y, w, h);
                            svgObject.element.attr({
                                fill: annotation.Fill,
                                stroke: annotation.Stroke,
                                'stroke-width': annotation.StrokeWidth,
                                'stroke-dasharray': "",
                                "opacity": annotation.Opacity
                            });
                            svgObject.bindEvents();
                        }
                        

                        break;
                    case "highlight":
                        var x = annotation.Left * paperWidth;
                        var y = annotation.Top * paperHeight;
                        var w = annotation.Width * paperWidth;
                        var h = annotation.Height * paperHeight;
                        if (annotation.Left > 1) {
                            x = annotation.Left;
                            y = annotation.Top;
                            w = annotation.Width;
                            h = annotation.Height;
                        }

                        svgObject = new SvgHighlight(
                            that,
                            annotation.DocumentAnnotationId,
                            "highlight",
                            pageNumber,
                            null,
                            annotation.Angle,
                            null,
                            annotation.Angle,
                            [],
                            [],
                            []
                        );

                        
                        if(isPasted){
                            svgObject.drawBoxAfterSave = true;
                            svgObject.create(x, y, w, h);
                            
                            svgObject.update();
                        }else{
                            svgObject.draw(x, y, w, h);
                            
                            svgObject.bindEvents();
                        }
                        break;
                    case "circ":
                        var x = annotation.Left * paperWidth;
                        var y = annotation.Top * paperHeight;
                        var rx = annotation.RadiusX * paperWidth;
                        var ry = annotation.RadiusY !== null ? annotation.RadiusY * paperHeight : rx;
                        if (annotation.Left > 1) {
                            x = annotation.Left * currentScale;
                            y = annotation.Top * currentScale;
                            rx = annotation.RadiusX * currentScale;
                            ry = annotation.RadiusY !== null ? annotation.RadiusY * currentScale : rx;
                        }

                       
                        svgObject = new SvgCircle(
                            that,
                            annotation.DocumentAnnotationId,
                            "circ",
                            pageNumber,
                            null,
                            annotation.Angle,
                            null,
                            annotation.Angle,
                            [],
                            [],
                            []
                        );
                        if(isPasted){
                            svgObject.drawBoxAfterSave = true;
                            svgObject.create(x, y, rx, ry, false);
                            svgObject.element.attr({
                                fill: annotation.Fill,
                                stroke: annotation.Stroke,
                                'stroke-width': annotation.StrokeWidth,
                                'stroke-dasharray': "",
                                "opacity": annotation.Opacity
                            });
                            svgObject.update();
                        }else{
                            svgObject.draw(x, y, rx, ry, false);
                            svgObject.element.attr({
                                fill: annotation.Fill,
                                stroke: annotation.Stroke,
                                'stroke-width': annotation.StrokeWidth,
                                'stroke-dasharray': "",
                                "opacity":annotation.Opacity
                            });
                            svgObject.bindEvents();
                        }
                        
                        
                        break;
                    case "line":
                        var p1 = annotation.Points.filter(p => p.OrderNumber === 0)[0];
                        var p2 = annotation.Points.filter(p => p.OrderNumber === 1)[0];
                        var x1 = p1.X * paperWidth;
                        var y1 = p1.Y * paperHeight;
                        var x2 = p2.X * paperWidth;
                        var y2 = p2.Y * paperHeight;
                        if (annotation.Left > 1) {
                            var x1 = p1.X * currentScale;
                            var y1 = p1.Y * currentScale;
                            var x2 = p2.X * currentScale;
                            var y2 = p2.Y * currentScale;
                        }

                        svgObject = new SvgLine(
                            that,
                            annotation.DocumentAnnotationId,
                            "line",
                            pageNumber,
                            null,
                            annotation.Angle,
                            null,
                            [],
                            [],
                            []
                        );


                        if(isPasted){
                            svgObject.drawBoxAfterSave = true;
                            svgObject.create(x1, y1, x2, y2, false);
                            svgObject.element.attr({
                                fill: annotation.Fill,
                                stroke: annotation.Stroke,
                                'stroke-width': annotation.StrokeWidth,
                                'stroke-dasharray': "",
                                "opacity": annotation.Opacity,
                                "arrow-end":annotation.ArrowEnd,
                                "arrow-start": annotation.ArrowStart
                            });
                            svgObject.update();
                        }else{
                            svgObject.draw(x1, y1, x2, y2, false);
                            svgObject.element.attr({
                                fill: annotation.Fill,
                                stroke: annotation.Stroke,
                                'stroke-width': annotation.StrokeWidth,
                                'stroke-dasharray': "",
                                "opacity":annotation.Opacity,
                                "arrow-end":annotation.ArrowEnd,
                                "arrow-start": annotation.ArrowStart
                            });
                            svgObject.bindEvents();
                        }

                        // svgObject.draw(x1, y1, x2, y2, false);
                        // svgObject.element.attr({
                        //     fill: '',
                        //     stroke: '#009EE3',
                        //     'stroke-width': 5,
                        //     'stroke-dasharray': ""
                        // });
                        // svgObject.bindEvents();
                        break;
                    case "measurementbasic":
                        var p1 = annotation.Points.filter(p => p.OrderNumber === 0)[0];
                        var p2 = annotation.Points.filter(p => p.OrderNumber === 1)[0];
                        var x1 = p1.X * paperWidth;
                        var y1 = p1.Y * paperHeight;
                        var x2 = p2.X * paperWidth;
                        var y2 = p2.Y * paperHeight;
                        var unit = annotation.Unit ? annotation.Unit : "px";



                        //element = that.drawMeasurementbasic(x1, y1, x2, y2, annotation.TextAlign, unit, annotation.Scale, false, annotation.Angle);
                        
                        svgObject = new SvgMeasurementToolBasic(
                            that,
                            annotation.DocumentAnnotationId,
                            "measurementbasic",
                            pageNumber,
                            null,
                            annotation.Angle,
                            null,
                            [],
                            [],
                            []
                        );

                        if(isPasted){
                            svgObject.drawBoxAfterSave = true;
                            svgObject.create(x1, y1, x2, y2, annotation.TextAlign, unit, annotation.Scale, false, annotation.Angle, annotation.Text);
                            svgObject.element.line1.attr({
                                fill: '',
                                stroke: '#009EE3',
                                'stroke-width': annotation.StrokeWidth,
                                'stroke-dasharray': ""
                            });
                            svgObject.element.text.attr({
                                fill:"black",
                                "font-size": 15 / PDFViewerApplication.pdfViewer.currentScale
                            })
                            if(svgObject.element.line2 !== null){
                                svgObject.element.line2.attr({
                                    fill: '',
                                    stroke: '#009EE3',
                                    'stroke-width': annotation.StrokeWidth,
                                    'stroke-dasharray': ""
                                });
                            }
                            
                            // svgObject.bindEvents(svgObject.element.text);
                            // svgObject.bindEvents(svgObject.element.line1);
                            // if(svgObject.element.line2 !== null)svgObject.bindEvents(svgObject.element.line2);
                        }else{
                            svgObject.draw(x1, y1, x2, y2, annotation.TextAlign, unit, annotation.Scale, false, annotation.Angle, annotation.Text);
                            svgObject.element.line1.attr({
                                fill: '',
                                stroke: '#009EE3',
                                'stroke-width': annotation.StrokeWidth,
                                'stroke-dasharray': ""
                            });
                            svgObject.element.text.attr({
                                fill:"black",
                                "font-size": 15 / PDFViewerApplication.pdfViewer.currentScale
                            })
                            if(svgObject.element.line2 !== null){
                                svgObject.element.line2.attr({
                                    fill: '',
                                    stroke: '#009EE3',
                                    'stroke-width': annotation.StrokeWidth,
                                    'stroke-dasharray': ""
                                });
                            }
                            
                            svgObject.bindEvents(svgObject.element.text);
                            svgObject.bindEvents(svgObject.element.line1);
                            if(svgObject.element.line2 !== null)svgObject.bindEvents(svgObject.element.line2);
                        }
                        
                        

                        break;
                    case "polyline":
                        var newPoints = [];
                        for (var i = 0; i < annotation.Points.length; i++) {
                            newPoints.push({
                                x: parseFloat(annotation.Points.filter(p => p.OrderNumber === i)[0].X * paperWidth),
                                y: parseFloat(annotation.Points.filter(p => p.OrderNumber === i)[0].Y * paperHeight)
                            });
                        }
                        if (annotation.Left > 1) {
                            newPoints = [];
                            for (var i = 0; i < annotation.Points.length; i++) {
                                newPoints.push({
                                    x: parseFloat(annotation.Points.filter(p => p.OrderNumber === i)[0].X * currentScale),
                                    y: parseFloat(annotation.Points.filter(p => p.OrderNumber === i)[0].Y * currentScale)
                                });
                            }
                        }
                        
                        svgObject = new SvgPolyline(
                            that,
                            annotation.DocumentAnnotationId,
                            "polyline",
                            pageNumber,
                            null,
                            annotation.Angle,
                            null,
                            [],
                            [],
                            []
                        );

                        if(isPasted){
                            svgObject.drawBoxAfterSave = true;
                            svgObject.create(newPoints, false, false);
                            svgObject.element.attr({
                                fill: annotation.Fill,
                                stroke: annotation.Stroke,
                                'stroke-width': annotation.StrokeWidth,
                                'stroke-dasharray': "",
                                opacity: annotation.Opacity
                            });
                            //svgObject.bindEvents();
                        }else{
                            svgObject.draw(newPoints, false, false);
                            svgObject.element.attr({
                                fill: annotation.Fill,
                                stroke: annotation.Stroke,
                                'stroke-width': annotation.StrokeWidth,
                                'stroke-dasharray': "",
                                opacity: annotation.Opacity
                            });
                            svgObject.bindEvents();
                        }
                        
                        break;
                    case "cloud":
                        var newPoints = [];

                        annotation.Points.forEach(function (point) {
                            newPoints.push({
                                x: parseFloat(point.X * paperWidth),
                                y: parseFloat(point.Y * paperHeight)
                            });
                        });
                        if (annotation.Left > 1) {
                            newPoints = [];
                            annotation.Points.forEach(function (point) {
                                newPoints.push({
                                    x: parseFloat(point.X * currentScale),
                                    y: parseFloat(point.Y * currentScale)
                                });
                            });
                        }

                        svgObject = new SvgCloud(
                            that,
                            annotation.DocumentAnnotationId,
                            "cloud",
                            pageNumber,
                            null,
                            annotation.Angle,
                            null,
                            [],
                            [],
                            []
                        );

                        if(isPasted){
                            svgObject.drawBoxAfterSave = true;
                            svgObject.create(newPoints, true, false);
                            svgObject.element.attr({
                                fill: annotation.Fill,
                                stroke: annotation.Stroke,
                                'stroke-width': annotation.StrokeWidth,
                                'stroke-dasharray': "",
                                opacity: annotation.Opacity
                            });
                            //svgObject.bindEvents();
                        }else{
                            svgObject.draw(newPoints, true, false);
                            svgObject.element.attr({
                                fill: annotation.Fill,
                                stroke: annotation.Stroke,
                                'stroke-width': annotation.StrokeWidth,
                                'stroke-dasharray': "",
                                opacity: annotation.Opacity
                            });
                            svgObject.bindEvents();
                        }
                        
                        break;
                    case "stamp":

                        // element = that.drawStamp(
                        //     annotation.Src,
                        //     annotation.Left * widthMultiplier,
                        //     annotation.Top * heightMultiplier,
                        //     annotation.Width * widthMultiplier,
                        //     annotation.Height * heightMultiplier,
                        //     false
                        // );
                        
                        svgObject = new SvgStamp(
                            that,
                            annotation.DocumentAnnotationId,
                            "stamp",
                            pageNumber,
                            null,
                            annotation.Angle,
                            null,
                            annotation.Angle,
                            [],
                            [],
                            []
                        );
                        
                        // svgObject.element.attr({
                        //     fill: '',
                        //     stroke: '#009EE3',
                        //     'stroke-width': 5,
                        //     'stroke-dasharray': ""
                        // });
                        if(isPasted){
                            svgObject.drawBoxAfterSave = true;
                            svgObject.create(
                                annotation.Src,
                                annotation.Left * widthMultiplier,
                                annotation.Top * heightMultiplier,
                                annotation.Width * widthMultiplier,
                                annotation.Height * heightMultiplier,
                                function(){
                                    svgObject.element.attr({
                                        opacity: annotation.Opacity
                                    });
                                }
                            );
                            
                            svgObject.update();
                        }else{
                            svgObject.draw(
                                annotation.Src,
                                annotation.Left * widthMultiplier,
                                annotation.Top * heightMultiplier,
                                annotation.Width * widthMultiplier,
                                annotation.Height * heightMultiplier,
                                function(){
                                    svgObject.element.attr({
                                        opacity: annotation.Opacity
                                    });
                                }
                            );
                            
                            svgObject.bindEvents();
                        }
                        break;
                    case "defect":

                        // element = that.drawStamp(
                        //     annotation.Src,
                        //     annotation.Left * widthMultiplier,
                        //     annotation.Top * heightMultiplier,
                        //     annotation.Width * widthMultiplier,
                        //     annotation.Height * heightMultiplier,
                        //     false
                        // );
                        
                        svgObject = new SvgDefect(
                            that,
                            annotation.DocumentAnnotationId,
                            "defect",
                            pageNumber,
                            null,
                            annotation.Angle,
                            null,
                            annotation.Angle,
                            annotation.EMSNodeId,
                            [],
                            [],
                            []
                        );
                        
                        // svgObject.element.attr({
                        //     fill: '',
                        //     stroke: '#009EE3',
                        //     'stroke-width': 5,
                        //     'stroke-dasharray': ""
                        // });
                        if(isPasted){
                            svgObject.drawBoxAfterSave = true;
                            svgObject.create(
                                annotation.Src,
                                annotation.Left * widthMultiplier,
                                annotation.Top * heightMultiplier,
                                annotation.Width * widthMultiplier,
                                annotation.Height * heightMultiplier,
                                function(){
                                    svgObject.element.attr({
                                        opacity: annotation.Opacity
                                    });
                                }
                            );
                            
                            svgObject.update();
                        }else{
                            svgObject.draw(
                                annotation.Src,
                                annotation.Left * widthMultiplier,
                                annotation.Top * heightMultiplier,
                                annotation.Width * widthMultiplier,
                                annotation.Height * heightMultiplier,
                                annotation.FontSize,
                                function(){
                                    // svgObject.element.attr({
                                    //     opacity: annotation.Opacity
                                    // });
                                }
                            );
                            svgObject.bindEvents();
                        }
                        break;
                    case "image":
                        // that.drawImage(
                        //     annotation.Src,
                        //     null,
                        //     annotation.Left * widthMultiplier,
                        //     annotation.Top * heightMultiplier,
                        //     annotation.Width * widthMultiplier,
                        //     annotation.Height * heightMultiplier,
                        //     annotation.ChildDocumentId,
                        //     false,
                        //     function (element) {
                        //         element.data("DocumentAnnotationId", annotation.DocumentAnnotationId);
                        //         element.data("AnnotationType", annotation.AnnotationType);
                        //         element.data("PageId", annotation.PageId);
                        //         element.data("CreatedBy", annotation.CreatedBy);
                        //         element.data("CreatedOn", annotation.CreatedOn);
                        //         element.data("ModifiedBy", annotation.ModifiedBy);
                        //         element.data("ModifiedOn", annotation.ModifiedOn);
                        //         element.data("Angle", annotation !== null ? annotation.Angle : 0);
                        //         element.rotate(annotation !== null ? annotation.Angle : 0);
                        //         element.data("SvgController", that);
                        //         element.data("Src", annotation.Src);

                        //         if (isPasted) that.createImageOnDb(element, annotation.Src, isPasted);
                        //     }
                        // );

                        svgObject = new SvgImage(
                            that,
                            annotation.DocumentAnnotationId,
                            "image",
                            pageNumber,
                            null,
                            annotation.Angle,
                            null,
                            annotation.Angle,
                            [],
                            [],
                            []
                        );

                        if(isPasted){
                            svgObject.drawBoxAfterSave = true;
                            svgObject.create(
                                annotation.Src,
                                null,
                                annotation.Left * widthMultiplier,
                                annotation.Top * heightMultiplier,
                                annotation.Width * widthMultiplier,
                                annotation.Height * heightMultiplier,
                                annotation.ChildDocumentId,
                                true,
                                function(){
                                    svgObject.element.attr({
                                        opacity: annotation.Opacity
                                    });
                                }
                            );
                            
                            svgObject.update();
                        }else{
                            svgObject.create(
                                annotation.Src,
                                null,
                                annotation.Left * widthMultiplier,
                                annotation.Top * heightMultiplier,
                                annotation.Width * widthMultiplier,
                                annotation.Height * heightMultiplier,
                                annotation.ChildDocumentId,
                                false,
                                function(){
                                    svgObject.element.attr({
                                        opacity: annotation.Opacity
                                    });
                                    svgObject.bindEvents();
                                }
                            );
                            
                            
                        }

                        //if (isPasted) that.createImageOnDb(element);
                        break;
                    case "freedraw":
                        var newPoints = [];
                        for (var i = 0; i < annotation.Points.length; i++) {
                            newPoints.push({
                                x: parseFloat(annotation.Points.filter(p => p.OrderNumber === i)[0].X * paperWidth),
                                y: parseFloat(annotation.Points.filter(p => p.OrderNumber === i)[0].Y * paperHeight)
                            });
                        }

                        if (annotation.Left > 1) {
                            newPoints = [];
                            annotation.Points.forEach(function (point) {
                                newPoints.push({
                                    x: parseFloat(point.X * currentScale),
                                    y: parseFloat(point.Y * currentScale)
                                });
                            })
                        }



                        //element = that.drawFreeDraw(newPoints, false);

                        svgObject = new SvgFreeDraw(
                            that,
                            annotation.DocumentAnnotationId,
                            "freeDraw",
                            pageNumber,
                            null,
                            annotation.Angle,
                            null,
                            annotation.Angle,
                            [],
                            [],
                            []);

                            // svgObject.draw(newPoints);
                            // svgObject.element.attr({
                            //     fill: '',
                            //     stroke: annotation.Stroke,
                            //     'stroke-width': annotation.StrokeWidth,
                            //     'stroke-dasharray': ""
                            // });




                            if(isPasted){
                                svgObject.drawBoxAfterSave = true;
                                svgObject.create(newPoints);
                                svgObject.element.attr({
                                    fill: annotation.Fill,
                                    stroke: annotation.Stroke,
                                    'stroke-width': annotation.StrokeWidth,
                                    'stroke-dasharray': "",
                                    "opacity": annotation.Opacity
                                });
                                svgObject.update();
                            }else{
                                svgObject.draw(newPoints);
                                svgObject.element.attr({
                                    fill: annotation.Fill,
                                    stroke: annotation.Stroke,
                                    'stroke-width': annotation.StrokeWidth,
                                    'stroke-dasharray': "",
                                    "opacity": annotation.Opacity
                                });
                                svgObject.bindEvents();
                            }


                            svgObject.bindEvents();
                        //if (isPasted) that.createFreeDrawOnDb(element, newPoints, isPasted);
                        break;
                    case "textbox":
                        var ann = annotation;
                        annotation.FontSize = annotation.FontSize === null ? 10 : annotation.FontSize;
                        var element;
                        if (annotation.Left > 1) {
                            // element = that.drawText(
                            //     annotation.Left,
                            //     annotation.Top,
                            //     annotation.Text,
                            //     false,
                            //     annotation.FontSize
                            // );
                            
                            svgObject = new SvgTextbox(
                                that,
                                annotation.DocumentAnnotationId,
                                "textbox",
                                annotation.Text,
                                pageNumber,
                                null,
                                annotation.Angle,
                                [],
                                [],
                                []
                            );

                            if(isPasted){
                                svgObject.create(annotation.Left,
                                        annotation.Top,
                                        annotation.Text,
                                        false,
                                        annotation.FontSize);
                                svgObject.element.rect1.attr({
                                    fill: annotation.Fill,
                                    stroke: annotation.Stroke,
                                    'stroke-width': annotation.StrokeWidth,
                                    'stroke-dasharray': "",
                                    "opacity": annotation.Opacity
                                });
                                svgObject.element.text.attr({
                                    text: annotation.Text,
                                    "font-size":annotation.FontSize
                                });
                                svgObject.update();
                            }else{
                                svgObject.draw(annotation.Left,
                                    annotation.Top,
                                    annotation.Text,
                                    false,
                                    annotation.FontSize);
                                svgObject.element.rect1.attr({
                                    fill: annotation.Fill,
                                    stroke: annotation.Stroke,
                                    'stroke-width': annotation.StrokeWidth,
                                    'stroke-dasharray': "",
                                    "opacity": annotation.Opacity
                                });
                                svgObject.element.text.attr({
                                    text: annotation.Text,
                                    "font-size":annotation.FontSize * PDFViewerApplication.pdfViewer.currentScale
                                });
                                svgObject.bindEvents();
                            }

                            // svgObject.draw(
                            //     annotation.Left,
                            //     annotation.Top,
                            //     annotation.Text,
                            //     false,
                            //     annotation.FontSize
                            // );
                            // svgObject.element.attr({
                            //     fill: '',
                            //     stroke: '#009EE3',
                            //     'stroke-width': 5,
                            //     'stroke-dasharray': ""
                            // });
                            // svgObject.bindEvents();
                        } else {
                            // element = that.drawText(
                            //     annotation.Left * paperWidth,
                            //     annotation.Top * paperHeight,
                            //     annotation.Text,
                            //     false,
                            //     annotation.FontSize * PDFViewerApplication.pdfViewer.currentScale
                            // );
                            svgObject = new SvgTextbox(
                                that,
                                annotation.DocumentAnnotationId,
                                "textbox",
                                annotation.Text,
                                pageNumber,
                                null,
                                annotation.Angle,
                                null,
                                [],
                                [],
                                []
                            );

                            if(isPasted){
                                svgObject.drawBoxAfterSave = true;
                                svgObject.create(
                                    annotation.Left * paperWidth,
                                    annotation.Top * paperHeight,
                                    annotation.Text,
                                    //false,
                                    annotation.FontSize);
                                svgObject.element.rect1.attr({
                                    fill: annotation.Fill,
                                    stroke: annotation.Stroke,
                                    'stroke-width': annotation.StrokeWidth,
                                    'stroke-dasharray': "",
                                    "opacity": annotation.Opacity
                                });
                                svgObject.element.text.attr({
                                    text: annotation.Text,
                                    "font-size":annotation.FontSize
                                });
                                svgObject.update();
                            }else{
                                svgObject.draw(
                                    annotation.Left * paperWidth,
                                    annotation.Top * paperHeight,
                                    annotation.Text,
                                    //false,
                                    annotation.FontSize);
                                svgObject.element.rect1.attr({
                                    fill: annotation.Fill,
                                    stroke: annotation.Stroke,
                                    'stroke-width': annotation.StrokeWidth,
                                    'stroke-dasharray': "",
                                    "opacity": annotation.Opacity
                                });
                                // svgObject.element.text.attr({
                                //     text: annotation.Text,
                                //     "font-size":annotation.FontSize
                                // });
                                svgObject.bindEvents();
                            }

                            // svgObject.draw(
                            //     annotation.Left * paperWidth,
                            //     annotation.Top * paperHeight,
                            //     annotation.Text,
                            //     false,
                            //     annotation.FontSize * PDFViewerApplication.pdfViewer.currentScale
                            // );
                            // svgObject.element.attr({
                            //     fill: '',
                            //     stroke: '#009EE3',
                            //     'stroke-width': 5,
                            //     'stroke-dasharray': ""
                            // });
                            // svgObject.bindEvents();
                            
                        }

                        
                        break;
                    case "callout":
                        var newPoints = [];
                        annotation.FontSize = annotation.FontSize === null ? 10 : annotation.FontSize;

                        newPoints.push(
                            {
                                x: parseFloat(annotation.Points.filter(p => p.OrderNumber === 1)[0].X * paperWidth),
                                y: parseFloat(annotation.Points.filter(p => p.OrderNumber === 1)[0].Y * paperHeight)
                            },
                            {
                                x: parseFloat(annotation.Points.filter(p => p.OrderNumber === 0)[0].X * paperWidth),
                                y: parseFloat(annotation.Points.filter(p => p.OrderNumber === 0)[0].Y * paperHeight)
                            },
                            {
                                x: parseFloat(annotation.Points.filter(p => p.OrderNumber === 2)[0].X * paperWidth),
                                y: parseFloat(annotation.Points.filter(p => p.OrderNumber === 2)[0].Y * paperHeight)
                            },
                            { // extra to just fullfill the requirement
                                x: parseFloat(annotation.Points.filter(p => p.OrderNumber === 2)[0].X * paperWidth),
                                y: parseFloat(annotation.Points.filter(p => p.OrderNumber === 2)[0].Y * paperHeight)
                            }
                        );

                        that.clickedPoints = newPoints;
                        var baseAngle = annotation.Angle === null? 0 : annotation.Angle;
                        //element = that.drawCallout(newPoints, annotation.Text, false, annotation.FontSize, false, baseAngle);

                        svgObject = new SvgCallout(
                            that,
                            annotation.DocumentAnnotationId,
                            annotation.AnnotationType,
                            pageNumber,
                            null,
                            annotation.Angle,
                            null,
                            [],
                            [],
                            []
                        );

                        if(isPasted){
                            svgObject.drawBoxAfterSave = true;
                            svgObject.create(
                                newPoints, annotation.Text, annotation.FontSize, false, baseAngle
                            );
                            svgObject.element.lineHead.attr({
                                fill: '',
                                opacity: annotation.Opacity,
                                stroke: annotation.Stroke,
                                'stroke-width': annotation.StrokeWidth,
                                'stroke-dasharray': ""
                            });
                            svgObject.element.lineTale.attr({
                                fill: '',
                                opacity: annotation.Opacity,
                                stroke: annotation.Stroke,
                                'stroke-width': annotation.StrokeWidth,
                                'stroke-dasharray': ""
                            });
                            svgObject.element.text.attr({
                                text: annotation.Text,
                                "font-size": annotation.FontSize
                            });
                            svgObject.element.rect1.attr({
                                fill: annotation.Fill,
                                opacity: annotation.Opacity,
                                stroke: "black",
                                'stroke-dasharray': ""
                            });
                            // svgObject.bindTextboxEvents(svgObject.element.text);
                            // svgObject.bindTextboxEvents(svgObject.element.rect1);
                            // svgObject.bindLineEvents(svgObject.element.lineHead);
                            // svgObject.bindLineEvents(svgObject.element.lineTale);
                            // svgObject.createMask();
                            that.clickedPoints =[];
                        }else{
                            svgObject.draw(
                                newPoints, annotation.Text, annotation.FontSize, false, baseAngle
                            );
                            svgObject.element.lineHead.attr({
                                fill: '',
                                opacity: annotation.Opacity,
                                stroke: annotation.Stroke,
                                'stroke-width': annotation.StrokeWidth,
                                'stroke-dasharray': ""
                            });
                            svgObject.element.lineTale.attr({
                                fill: '',
                                opacity: annotation.Opacity,
                                stroke: annotation.Stroke,
                                'stroke-width': annotation.StrokeWidth,
                                'stroke-dasharray': ""
                            });
                            svgObject.element.text.attr({
                                text: annotation.Text,
                                "font-size": annotation.FontSize
                            });
                            svgObject.element.rect1.attr({
                                fill: annotation.Fill,
                                opacity: annotation.Opacity,
                                stroke: "black",
                                'stroke-dasharray': ""
                            });
                            svgObject.bindTextboxEvents(svgObject.element.text);
                            svgObject.bindTextboxEvents(svgObject.element.rect1);
                            svgObject.bindLineEvents(svgObject.element.lineHead);
                            svgObject.bindLineEvents(svgObject.element.lineTale);
                            svgObject.createMask();
                            that.clickedPoints =[];
                        }

                        
                        break;
                    case "texttagrect":
                        var r1 = that.paper.rect(
                            annotation.Left * paperWidth,
                            annotation.Top * paperHeight,
                            annotation.Width * paperWidth,
                            annotation.Height * paperHeight,
                        );
                        r1.attr({
                            fill: 'yellow',
                            opacity: 0.3,
                            stroke: '#009EE3',
                            'stroke-width': 1,
                            'stroke-dasharray': ""
                        });
                        //if (isPasted) that.createte(element);
                        r1.data("DocumentAnnotationId", annotation.ParentId);
                        r1.data("PageId", annotation.PageId);
                        r1.data("CreatedBy", annotation.CreatedBy);
                        r1.data("CreatedOn", annotation.CreatedOn);
                        r1.data("ModifiedBy", annotation.ModifiedBy);
                        r1.data("ModifiedOn", annotation.ModifiedOn);

                        var svgObject = null;
                        if(Object.keys(SvgGlobalControllerLogic.annotations2).indexOf(annotation.DocumentAnnotationId) === -1){
                            svgObject = new SvgTextTag(
                                that,
                                annotation.ParentId,
                                "texttag",
                                annotation.PageNumber,
                                annotation.Angle,
                                0,
                                annotation.Angle,
                                0,
                                [],
                                [],
                                []
                            );
                            svgObject.element = that.paper.set();
                            LocalAnnotationsControllerLogic.addAnnotation(
                                AnnotationApplication.documentVersionId,
                                annotation.PageNumber,
                                annotation,
                                svgObject);
                            SvgGlobalControllerLogic.addToAnnotations2(annotation.ParentId, svgObject);
                        }else{
                            svgObject = SvgGlobalControllerLogic.annotations2[annotation.ParentId];
                        }
                        svgObject.element.push(r1);

                        break;
                    case "texttagimage":
                        var img = that.paper.image(
                            '/Content/images/DocumentViewer/pinSelectedText.png',
                            annotation.Left * paperWidth,
                            annotation.Top * paperHeight,
                            25,
                            25
                        );
                        img.attr({
                            opacity: 0.5,
                            title: annotation.Text,
                        });
                        img.data("DocumentAnnotationId", annotation.ParentId);
                        img.data("PageId", annotation.PageId);
                        img.data("CreatedBy", annotation.CreatedBy);
                        img.data("CreatedOn", annotation.CreatedOn);
                        img.data("ModifiedBy", annotation.ModifiedBy);
                        img.data("ModifiedOn", annotation.ModifiedOn);

                    var svgObject = null;
                    if(Object.keys(SvgGlobalControllerLogic.annotations2).indexOf(annotation.DocumentAnnotationId) === -1){
                        svgObject = new SvgTextTag(
                            that,
                            annotation.ParentId,
                            "texttag",
                            annotation.PageNumber,
                            annotation.Angle,
                            0,
                            annotation.Angle,
                            0,
                            [],
                            [],
                            []
                        );
                        svgObject.element = that.paper.set();
                        LocalAnnotationsControllerLogic.addAnnotation(
                            AnnotationApplication.documentVersionId,
                            annotation.PageNumber,
                            annotation,
                            svgObject);
                        SvgGlobalControllerLogic.addToAnnotations2(annotation.ParentId, svgObject);
                    }else{
                        svgObject = SvgGlobalControllerLogic.annotations2[annotation.ParentId];
                        
                    }
                    svgObject.element.push(img);
                        
                        break;
                    case "emsgroup":
                        var x = annotation.Left;
                        var y = annotation.Top;
                        var w = annotation.Width;
                        var h = annotation.Height;
                        if (annotation.Left > 1) {
                            x = annotation.Left;
                            y = annotation.Top;
                            w = annotation.Width;
                            h = annotation.Height;
                        }else{
                            x = x * paperWidth;
                            y = y * paperHeight;
                            w = w * paperWidth;
                            h = h * paperHeight;
                        }

                        var svgObject = new SvgEmsGroup(
                            that,
                            annotation.DocumentAnnotationId,
                            "emsgroup",
                            that.pageNumber,
                            null,
                            annotation.Angle,
                            null,
                            annotation.EMSNodeId
                        );
                        
                        if(isPasted){
                            svgObject.drawBoxAfterSave = true;
                            svgObject.create(
                                x,
                                y,
                                w,
                                h,
                                annotation.EMSNodeId,
                                false,
                                false,
                                annotation.FontSize,
                                null,
                                annotation.Version
                            );
                            //svgObject.bindEvents();
                            //svgObject.createMask();
                        }else{
                            svgObject.draw(
                                x,
                                y,
                                w,
                                h,
                                annotation.EMSNodeId,
                                false,
                                false,
                                annotation.FontSize,
                                null,
                                annotation.Version,
                                annotation.Fill
                            )
                            svgObject.bindEvents();
                            svgObject.createMask();
                        }
                        
                        break;
                    case "emselement":
                        

                        break;
                }
                if(!isPasted)SvgGlobalControllerLogic.afterAddingToPaper(svgObject);
                
            } catch (ex) {
                console.log("failed to load object: ");
            }
        },

        loadSvgAnnotationsByPage: function (pageNumber) {
            var that = this;

            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var raphaelObjects = [];
            var docverId = typeof (AnnotationApplication.documentVersionId) !== 'undefined' ? AnnotationApplication.documentVersionId : AnnotationApplication.documentVersionId;
            if(docverId === null)return;
            SvgGlobalControllerLogic.getSvgAnnotations(docverId, pageNumber, function (annotations) {
                // store all annotations from db into paper variable
                that.dbAnnotations = annotations;

                SvgGlobalControllerLogic.allDbAnnotations.push({
                    annotations: annotations,
                    page: pageNumber,
                    documentVersionId: AnnotationApplication.documentVersionId
                });

                if(annotations !== ""){
                    LocalAnnotationsControllerLogic.addManyAnnotation(
                        AnnotationApplication.documentVersionId,
                        pageNumber,
                        annotations,
                        that,
                        null);

                    annotations.forEach(annotation => {
                        if (annotation !== null) {
                            setTimeout(function(){that.addToPaper(annotation, pageNumber, false, false)},200);
                            //console.log(annotation.AnnotationType);

                        }
                    });
                }
            });
        },

        RefreshSvgAnnotationsByPage: function (pageNumber) {
            var that = this;

            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var raphaelObjects = [];
            var docverId = typeof (AnnotationApplication.documentVersionId) !== 'undefined' ? AnnotationApplication.documentVersionId : AnnotationApplication.documentVersionId;
            if(docverId === null)return;
            SvgGlobalControllerLogic.clearAndGetSvgAnnotations(docverId, pageNumber, function (annotations) {
                // store all annotations from db into paper variable
                that.dbAnnotations = annotations;

                SvgGlobalControllerLogic.allDbAnnotations.push({
                    annotations: annotations,
                    page: pageNumber,
                    documentVersionId: AnnotationApplication.documentVersionId
                });

                if(annotations !== ""){
                    LocalAnnotationsControllerLogic.addManyAnnotation(
                        AnnotationApplication.documentVersionId,
                        pageNumber,
                        annotations,
                        that,
                        null);

                    annotations.forEach(annotation => {
                        if (annotation !== null) {
                            setTimeout(function(){that.addToPaper(annotation, pageNumber, false, false)},200);
                            //console.log(annotation.AnnotationType);

                        }
                    });
                }
            });
        },

        reLoadSvgAnnotations: function () {
            var that = this;


            //var annsSet = SvgGlobalControllerLogic.allDbAnnotations.filter(s => s.page === that.pageNumber && s.documentVersionId === AnnotationApplication.documentVersionId);
            var annsSet = LocalAnnotationsControllerLogic.data[AnnotationApplication.documentVersionId][that.pageNumber];
            annsSet.forEach(annotation => {
                if (annotation !== null) {
                    that.addToPaper(annotation, that.pageNumber, false, false);
                    //console.log(annotation.AnnotationType);
                }
            });
            // if (AnnotationApplication.Toolbar.showQR) {
            //     SvgGlobalControllerLogic.enableEmsQr();
            // }
            /*
            if (typeof annsSet !== "undefined") {
                var anns = annsSet[0].annotations;
                anns.forEach(annotation => {
                    if (annotation !== null) {
                        that.addToPaper(annotation, that.pageNumber, false, false);
                        //console.log(annotation.AnnotationType);
                    }
                });
            }
            */
        },



        getElementByDocId: function (docId) {
            var res = [];
            SvgGlobalControllerLogic.getSvgController(this.pageNumber).canvas.paper.forEach(function (el) {
                res.push(el);
            });
            for (var i = 0; i < res.length; i++) {
                if (res[i].data("DocumentAnnotationId") === docId) {
                    return res[i];
                }
            }
            return null;
        },

        //=======================================================
        //====================== Helper functions ===============
        //=======================================================

        getPolylinePoints: function (polyline) {
            var polyPoints = [];
            polyline.attrs.path.forEach(function (m) {
                if (m[0].toLowerCase() !== "z") {
                    polyPoints.push({
                        x: m[1],
                        y: m[2]
                    });
                }
            });
            return polyPoints;
        },

        updateAllMeasurementScales: function (scale, unit) {
            var that = this;
            that.MeasurementSets.forEach(function (set) {
                that.updateMeasurementScale(set, that.scale, that.unit, true);
            });
        },

        updateMeasurementScale: function (set, scale, unit, updateDb) {
            var that = this;
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            var lns = set.items.filter(m => m.type === "path");
            if (lns.length !== 0) {
                var textbox = set.items.filter(m => m.type === "text")[0];
                var px = 0;
                if (lns.length > 1) {
                    var x1 = lns[0].attr("path")[0][1];
                    var y1 = lns[0].attr("path")[0][2];
                    var x2 = lns[1].attr("path")[1][1];
                    var y2 = lns[1].attr("path")[1][2];
                    if (lns[1].attr("path")[1].length > 3) {
                        x2 = lns[1].attr("path")[1][5];
                        y2 = lns[1].attr("path")[1][6];
                    }
                    px = that.getTwoPointDistance(x1, y1, x2, y2);
                } else {
                    var x1 = lns[0].attr("path")[0][1];
                    var y1 = lns[0].attr("path")[0][2];
                    var x2 = lns[0].attr("path")[1][1];
                    var y2 = lns[0].attr("path")[1][2];
                    if (lns[0].attr("path")[1].length > 3) {
                        x2 = lns[0].attr("path")[1][5];
                        y2 = lns[0].attr("path")[1][6];
                    }
                    px = that.getTwoPointDistance(x1, y1, x2, y2);
                }
                console.log(px);
                var newText = (px * scale).toFixed(2);
                // if (kendo.culture().name === "de-DE") {
                //     newText = newText.replace('.', ',');
                // }
                newText = SvgGlobalControllerLogic.formatMeasurementText(newText, unit)
                textbox.attr("text", newText );//+ " " + unit);
                textbox.data("Scale", scale);
                textbox.data("Unit", unit);
                if (updateDb) that.updateMeasurementbasicOnDb(set);
            }
        },

        getTwoPointDistance: function (x1, y1, x2, y2) {
            var dx = x1 - x2;
            var dy = y1 - y2;
            var d = Math.sqrt(dx * dx + dy * dy);
            return d;
        },

        generatePolylinePathBy: function (points) {
            var pathTemp = "";
            pathTemp += ("M " + points[0].x + " " + points[0].y + " ");

            for (var i = 1; i < points.length; i++) {
                pathTemp += ("L " + points[i].x + " " + points[i].y + " ");
            }
            pathTemp += "z";
            return pathTemp;
        },

        generateLinePathBy: function (element) {
            var points = [
                element.attrs.path[0][1],
                element.attrs.path[0][2],
                element.attrs.path[1][1],
                element.attrs.path[1][2]
            ]
            return points;
        },

        pathArrayToString: function (pathArray, scale) {
            curvedPath = "";
            for (var i = 0; i < pathArray.length; i++) {
                for (var j = 0; j < pathArray[i].length; j++) {
                    if (j > 0) {
                        curvedPath += (pathArray[i][j] * scale + " ");
                    } else {
                        curvedPath += (pathArray[i][j] + " ");
                    }
                }
            }

            return curvedPath;
        },

        GenerateApiModel: function (annotation, annotationType) {
            var apiModel = {
                "DocumentAnnotationId": annotation.data("DocumentAnnotationId"),
                "AnnotationType": annotationType,
                "ParentId": "", // not implemented yet
                "DocumentVersionId": AnnotationApplication.documentVersionId,
                "Fill": annotation.attr("fill"),
                "Stroke": annotation.attr("stroke"),
                "StrokeWidth": annotation.attr("stroke-width"),
                "Text": annotation.attr("text"),
                "FontSize": annotation.attr("font-size"),
                "TextAlign": annotation.attr("text-anchor"),
                "Top": annotation.attr("y"),
                "Left": annotation.attr("x"),
                "Width": annotation.attr("width"),
                "Height": annotation.attr("height"),
                "RadiusX": annotation.attr("rx"),
                "RadiusY": annotation.attr("ry"), // not implemented yet
                "Angle": 0, // not implemented yet
                "AnnotationName": annotationType,
                "Opacity": annotation.attr("opacity"),
                "IsSelectable": true,
                "IsGroup": false, // not implemented yet
                "Scale": "",
                "ModifiedBy": "",
                "CreatedBy": null,
                "DeletedBy": "",
                "CreatedOn": null,
                "ModifiedOn": null,
                "DeletedOn": null,
                "EMSNodeId": null, // not implemented yet
                "ChildDocumentId": null, // not implemented yet
                "PageId": "00000000-0000-0000-0000-000000000000",
                "PageNumber": this.pageNumber,
                "childrenIds": null // not implemented yet
            }
            return apiModel;
        },

        generateQrCode: function (id, callback) {
            var that = this;
            var emsNodeId = id;
            var createDiv = document.createElement('div');
            createDiv.id = "qrCode_" + emsNodeId;
            document.body.appendChild(createDiv);
            document.getElementsByTagName('body')[0].appendChild(createDiv);
            //var qrUrl = "EmsNodeId=" + emsNodeId;
           var qrUrl = window.parent.QrUrlAddress + "&EmsNodeId=" + emsNodeId;
            var qrCode = new QRCode(document.getElementById("qrCode_" + emsNodeId), {
                text: qrUrl,
                width: 128,
                height: 128,
                colorDark : "#000000",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.H
            });
            // let image = qrCode.makeImage();
            // qrCode.makeCode("http://naver.com");
            var canvas = document.getElementById("qrCode_" + emsNodeId).querySelector('canvas');

            var dataURL = canvas.toDataURL();
 
            if (callback) callback(dataURL);
            // $('#' + "qrCode_" + emsNodeId).kendoQRCode({
            //     value: qrUrl,
            //     size: 150,
            //     background: "white",
            //     renderAs: "svg",
            //     border: {
            //         color: "white",
            //         width: 0
            //     }
            // });

            //console.log($('#' + "qrCode_" + emsNodeId).html());
            //var qrpath = $("#qrCode_"+ emsNodeId +" > div > svg > g").children("path:last").attr("d");
            //return qrpath;



           // var qrCode = $("#qrCode_" + emsNodeId).getKendoQRCode();
           //qrcode.clear(); // clear the code.
//qrcode.makeCode("http://naver.com");


            // qrCode.exportImage().done(function (data) {
            //     if (callback) callback(data);
            //     $("#img-image").remove();
            //     $('#' + "qrCode_" + emsNodeId).remove();
            // });

        },

        getSelectedTextOnPdf: function getSelectedTextOnPdf() {
            var text = "";
            if (window.getSelection) {
                text = window.getSelection().toString();
                if (window.getSelection().baseNode != null) {
                    var css = window.getSelection().baseNode.parentElement.style.cssText;
                    var leftTxt = css.split(';')[0];
                    var topTxt = css.split(';')[1];
                    console.log(leftTxt + " - " + topTxt);
                }
            } else if (document.selection && document.selection.type != "Control") {
                text = document.selection.createRange().text;
            }
            return text;
        },

        reDrawMeasurementbasic: function (element, textAlign) {
            var that = this;
            var tempElement = element;
            var ln = element.items.filter(e => e.type === "path");
            var x1 = ln[0].attr("path")[0][1];
            var y1 = ln[0].attr("path")[0][2];
            var x2 = (ln.length > 1) ? ln[1].attr("path")[1][5] : ln[0].attr("path")[1][1];
            var y2 = (ln.length > 1) ? ln[1].attr("path")[1][6] : ln[0].attr("path")[1][2];
            var unit = element.items.filter(s => s.type === "text")[0].getUnit();
            var angle = element.items.filter(s => s.type === "text")[0].getAngle();
            var scale = element.items.filter(s => s.type === "text")[0].data("Scale");
            var newelement = that.drawMeasurementbasic(x1, y1, x2, y2, textAlign, unit, scale, false, angle);

            newelement.forEach(function (el) {
                if (el.type === "set") {
                    el.forEach(function (elx) {
                        elx.data("DocumentAnnotationId", element[0].getDocumentAnnotationId());
                        elx.data("AnnotationType", element[0].getAnnotationType());
                        elx.data("PageId", element[0].getPageId());
                        elx.data("CreatedBy", element[0].getCreatedBy());
                        elx.data("CreatedOn", element[0].getCreatedOn());
                        elx.data("ModifiedBy", element[0].getModifiedBy());
                        elx.data("ModifiedOn", element[0].getModifiedOn());
                        elx.data("Unit", unit);
                    });
                } else {
                    el.data("DocumentAnnotationId", element[0].getDocumentAnnotationId());
                    el.data("AnnotationType", element[0].getAnnotationType());
                    el.data("PageId", element[0].getPageId());
                    el.data("CreatedBy", element[0].getCreatedBy());
                    el.data("CreatedOn", element[0].getCreatedOn());
                    el.data("ModifiedBy", element[0].getModifiedBy());
                    el.data("ModifiedOn", element[0].getModifiedOn());
                    el.data("Unit", unit);
                }

            });
            element = newelement;
            element.data("TextAlign", textAlign);

            // updating style
            var tempLines = tempElement.items.filter(s => s.type === "path");
            if (tempLines.length > 0) {
                var newLines = element.items.filter(s => s.type === "path");
                newLines.forEach(function (ln) {
                    ln.attr({
                        "stroke": tempLines[0].attr("stroke"),
                        "stroke-width": tempLines[0].attr("stroke-width")
                    });
                });
            }

            tempElement.remove();
            SvgGlobalControllerLogic.selectedObject = {
                element: element,
                svgController: that
            };

            return element;
        },

        getTouchOffset: function (obj) {
            var myoffset = {
                left: obj.offset().left - $(window).scrollLeft(),
                top: obj.offset().top - $(window).scrollTop()
            }
            return myoffset;
        },

        onPageRotated: function (degree) {
            var that = this;
            var paperWidth = (typeof that.paper.width === "number") ? that.paper.width : parseInt(that.paper.width.replace("px", ""));
            var paperHeight = (typeof that.paper.height === "number") ? that.paper.height : parseInt(that.paper.height.replace("px", ""));
            that.paper.ellipse(paperHeight / 2, paperWidth / 2, 10, 10).attr("fill", "red");
            that.paper.ellipse(0, 0, 10, 10).attr("fill", "green");
            that.paper.rect(0, 0, paperWidth, paperHeight).attr("stroke", "green");
            /*
            that.paper.forEach(function (item) {
                //item.rotate(degree, paperWidth/2, paperHeight/2);
                //item.translate(0, paperWidth-paperHeight);
                var origX = item.attr("x") / paperHeight;
                var origY = item.attr("y") / paperWidth;
                var origWidth = item.attr("width") / paperHeight;
                var origHeight = item.attr("height") / paperWidth;
                item.attr({
                    x: (1 - origY- origHeight) * paperWidth,
                    y: origX * paperHeight,
                    width: origHeight * paperWidth,
                    height: origWidth * paperHeight,
                });
            });
            */


            // testing update of locall ann didnt work
            /*
            var seenIds = [];
            var docVer = AnnotationApplication.documentVersionId;
            that.paper.forEach(function(item){
                var annId = item.getDocumentAnnotationId();
                if(!seenIds.includes(annId)){
                    seenIds.push(annId);
                    var ann = LocalAnnotationsControllerLogic.getAnnotationById(docVer, that.pageNumber, annId);
                    if(ann !== null){
                        var tempX = ann.Left;
                        var tempY = ann.Top;
                        var tempW = ann.Width;
                        var tempH = ann.Height;
    
                        ann.Left = 1 - tempY - tempH;
                        ann.Top = tempX;
                        ann.Width = tempH;
                        ann.height = tempW;
                        
                        
                        LocalAnnotationsControllerLogic.updateAnnotation(docVer, that.pageNumber, ann, that, null);
                    }
                    
                }
            });
            SvgGlobalControllerLogic.RenderSvgAnnotations(that.pageNumber, true);
            */




            /*

            that.paper.forEach(function (item) {
                //item.rotate(degree, paperWidth/2, paperHeight/2);
                //item.translate(0, paperWidth-paperHeight);
                item.rotate(degree, paperWidth / 2, paperHeight / 2)
            });
            */
        },

        isMobileDevice: function(){
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
                return true;
            }else{
                return false;
            }
        },

    }
    return SvgController;
})();




/*
SvgController.getPointer = function (e, pageNumber) {
    var sx;
    var sy;
    sx = e.clientX ? e.clientX : e.originalEvent.layerX;
    sy = e.clientY ? e.clientY : e.originalEvent.layerY;
    sx -= parseInt($("#pageContainer" + pageNumber).css("margin-left").replace("px", ""));
    sy -= parseInt($("#pageContainer" + pageNumber).css("margin-top").replace("px", ""));
    return {
        x: sx,
        y: sy
    }
}
*/
