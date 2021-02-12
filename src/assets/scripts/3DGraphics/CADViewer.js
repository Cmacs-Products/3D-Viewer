var CADViewer = (function () {
    function CADViewer(toolbar) {
        this.toolbar = toolbar;
        this.scale = 1;
        this.angle = 0;
        this.paperWidth;
        this.paperHeight;
        this.lineSet;
        this.cutPlaneSvgController;
        this.shapes;
        this.showQR = false;
        this.allQrCodes = [];
        this.storedChildrenData;

        this.isStatusVisible = false;

        this.dragStartPoint = {
            x: null,
            y: null
        }

        this.useHammer = true;

        this.viewerDragStartTempPoint = {x:null,y:null};
    }

    CADViewer.prototype = {

        constructor: CADViewer,


        renderCutPlaneByAnnotationObject: function (documentSvgAnnotationApiModels) {
            this.scale = 1;
            var oldCutPlaneViewer = $("#cutplaneviewer");
            if (oldCutPlaneViewer.length === 0) {
                $(".sbimcutplane").append('<div id="cutplaneviewer"></div>');
            }
            $("#cutplaneviewer").html("");
            var newContent = `<div id="pageContainer1" style="width:100%; height:100%;"><div class="textLayer" style="width:100%; height:100%;"></div></div>`;
            $("#cutplaneviewer").html(newContent);
            this.cutPlaneSvgController = new SvgController(-1);
            documentSvgAnnotationApiModels.forEach(annotation => {
                if (annotation !== null) {
                    this.cutPlaneSvgController.addToPaper(annotation, -1, false, false);
                }
            });
        },

        onResizeContainer: function () {
            var container = document.getElementById('cutplaneviewer');
            if (typeof container === "undefined"
                || typeof this.cutPlaneSvgController === "undefined"
                || typeof this.cutPlaneSvgController.paper === "undefined") {
                return;
            }

            $('#layout').css("height");
           // this.paperWidth = $("#layout").css("width").replace('px', '');
           // this.paperHeight = ($("#layout").css("height").replace('px', '') - 62);
           this.paperWidth = "916";
           this.paperHeight = "470";
            this.cutPlaneSvgController.paper.setSize(this.paperWidth + "px", this.paperHeight + "px");
            this.cutPlaneSvgController.paper.setViewBox(-this.paperWidth / 2, -this.paperHeight / 2, this.paperWidth, this.paperHeight, false);

            var angleRad = (this.angle) * Math.PI / 180;
            var dx = 1.1 * Math.max(this.maxX, -1 * this.minX);
            var dy = 1.1 * Math.max(this.maxY, -1 * this.minY);
            this.calculateScale(Math.abs(dx * Math.cos(angleRad)) + Math.abs(dy * Math.sin(angleRad)), Math.abs(dx * Math.sin(angleRad)) + Math.abs(dy * Math.cos(angleRad)), true);
            
            //this.destroyRotateButton(this);
            //this.createRotateButton(this);
            if(this.showQR === true){
                this.clearQrCodes();
                this.showQrCodes();
                this.showQR = true
            }
        },

        renderLines: function (shapes) {
            var that = this;
            that.shapes = shapes;
            this.cutPlaneSvgController.paper.clear();

            //var dx = 2.5 * Math.max(this.maxX, -1 * this.minX);
            //var dy = 2.5 * Math.max(this.maxY, -1 * this.minY);

            this.cutPlaneSvgController.paper.setStart();
            shapes.forEach(shape => {
                shape.lines.forEach(line => {
                    var linePath = "";
                    line.points.forEach(function (point) {
                        linePath += ("L" + (point.x) + "," + (-point.y));
                    });

                    // replace first 'L' with 'M'
                    linePath = linePath.replace("L", "M");
                    linePath += "z";

                    // draw Lines
                    var path = this.cutPlaneSvgController.paper.path(linePath).attr("stroke-width", line.thickness);

                    // add style
                    if (Object.keys(line).includes("color")) that.setObjectFillColor(path, line.color);
                    if (Object.keys(line).includes("fill")) that.setObjectStrokeColor(path, line.fill);

                    // QR code
                    //if (shape.emsNode != null)
                    //that.drawQrCodeForLine(shape);
                });
            });
            this.lineSet = this.cutPlaneSvgController.paper.setFinish();

            //this.calculateScale(dx, dy);
        },

        setObjectStrokeColor: function (element, color) {
            element.attr("stroke", color);
        },

        setObjectFillColor: function (element, color) {
            element.attr("fill", color);
        },

        setStatusVisible: function(showStatus){
            if(showStatus){
                var that = this;
                that.cutPlaneSvgController.paper.forEach(function(element){
                    if (element.type === "rect" && rect.data("emsnodeid")){
                        var rect = element;
                        var nodeId = rect.data("emsnodeid");
                        var status = FilterStatusesLogic.GetCurrentEmsNodeStatus(nodeId);
                        //var status = FilterStatusesLogic.GetElementStatus($("li[data-id='"+ nodeId +"']")[0]);
                        var color = FilterStatusesLogic.GetStatusColorHex(status);
                        rect.attr({
                            fill: color
                        });
                    }
                });
            }else{
                var that = this;
                that.cutPlaneSvgController.paper.forEach(function(element){
                    if(element.type === "rect"){
                        var rect = element;
                        rect.attr({
                            fill: "#26BEAD"
                        });
                    }
                });
            }
            
        },


        getStatusColorHex(status) {
            switch (status) {
              case "OnHold":
                return "#f6503c";
              case "InProgress":
                return "#ffc634";
              case "Completed":
                return "#00ce7d";
              case "Assigned":
                return "#009fe3";
              case "UnAssigned":
                return "#97a0ae";
              case null: // case: excluded from filter results
                return null;
              default:
                return "#a100cd";
            }
          },

        drawQrCodeForLine: function (shape) {
            try{
                var that = this;
                var allPoints = [].concat.apply([], shape.lines.map(function (line) { return line.points }));
                var lineQrX = Math.min.apply(null, allPoints.map(p => p.x));
                var lineQrY = Math.max.apply(null, allPoints.map(p => p.y));
                switch(that.angle % 360){
                    case 0:

                    break;
                    case 90:
                    var lineQrX = Math.min.apply(null, allPoints.map(p => p.y));
                    var lineQrY = -1 * Math.max.apply(null, allPoints.map(p => p.x));
                    break;
                    case 180:
                    var lineQrX = -1 * Math.min.apply(null, allPoints.map(p => p.x));
                    var lineQrY = -1 * Math.max.apply(null, allPoints.map(p => p.y));
                    break;
                    case 270:
                    var lineQrX = -1 * Math.min.apply(null, allPoints.map(p => p.y));
                    var lineQrY = Math.max.apply(null, allPoints.map(p => p.x));
                    break;
                }
                

                // hidden text to show the qr code
                if (shape.emsNode && ![null, undefined].includes(shape.emsNode)) {
                    var text = this.cutPlaneSvgController.paper.text(
                        lineQrX * that.scale,
                        -lineQrY * that.scale,
                        shape.emsNode.Name
                    );
                    text.attr({
                        x: text.attr("x") + text.getBBox().width/2,
                        y: text.attr("y") + text.getBBox().height/2,
                        fill: "black"//"#26BEAD"
                    });
                    var rect = this.cutPlaneSvgController.paper.rect(
                        text.getBBox().x - 2,
                        text.getBBox().y - 2,
                        text.getBBox().width + 4,
                        text.getBBox().height + 4
                    );

                    var status = CADViewer.prototype.storedChildrenData.filter(x => x.EMSNodeId === (shape.emsNode.EMSNodeId))[0].Status;
                    var color = CADViewer.prototype.getStatusColorHex(status);
                    // var status = FilterStatusesLogic.GetCurrentEmsNodeStatus(shape.emsNode.dataId);
                    // var color = FilterStatusesLogic.GetStatusColorHex(status);
                    rect.attr({
                        fill: color
                    });
                    rect.data("emsnodeid", shape.emsNode.dataId);
                    text.toFront();
                    this.cutPlaneSvgController.generateQrCode(shape.emsNode.EMSNodeId, function (data) {
                        var qrImage = that.cutPlaneSvgController.paper.image(
                            data,
                            lineQrX * that.scale,
                            -lineQrY * that.scale + rect.getBBox().height,
                            75 / 4,
                            75 / 4
                        ).toFront();
                        qrImage.attr("title", (typeof shape.emsNode !== 'undefined' ? shape.emsNode.EMSNodeId : "No Id Defined!"));
                        that.allQrCodes.push(qrImage);
                    });
                }
            }catch(ex){
                console.error(ex);
            }
        },

        calculateScale: function (dx, dy, apply = true) {
            // why this? because I want to fit that to page
            this.scale = Math.min(
                this.paperWidth / (2 * dx),
                this.paperHeight / (2 * dy)
            ) * 0.8;
            if (apply) {
                this.applyScale(this.scale);
            } else {
                return this.scale;
            }
        },

        detectLineIntersection: function (x1, y1, x2, y2) {
            var that = this;
            that.cutPlaneSvgController.paper.forEach(function (annotation) {
                var r2 = annotation.getBBox();
                if (!(r2.x > r1.x2 ||
                    r2.x2 < r1.x ||
                    r2.y > r1.y2 ||
                    r2.y2 < r1.y)) {

                    detectedElements.push(annotation);

                }
            });
        },

        applyScale: function (scale, rotation) {
            var that = this;
            if (typeof scale !== "undefined") {
                this.scale = scale;
            }
            if (typeof rotation !== "undefined" && rotation !== "NaN") {
                this.angle = rotation;
            }
            // do the scaling and this.rotation
            var newMatrix = Raphael.matrix(that.scale, 0, 0, that.scale, 0, 0);
            newMatrix.rotate(that.angle, 0, 0);
            var idsToRemove = [];
            that.cutPlaneSvgController.paper.forEach(function (elm) {
                if (elm.data("transform") != false && !["rect","image","text"].includes(elm.type)) {
                    elm.attr('transform', newMatrix.toTransformString());
                }else if(["image","rect","text"].includes(elm.type)){
                    idsToRemove.push(elm.id);
                }
            });
            idsToRemove.forEach(function(id){
                var elm = that.cutPlaneSvgController.paper.getById(id);
                elm.remove();
            });

        },

        createRotateButton: function (that) {

            var r = 5;
            var tempAngle = -90;
            that.rotationCircle = that.cutPlaneSvgController.paper.circle(that.paperWidth / 2 - 60, 60 - that.paperHeight / 2, r * 5).attr({
                "stroke": "red",
                "stroke-width": 4,
                "opacity": 0.5
            }).data("transform", false);
            that.rotationHandle = that.cutPlaneSvgController.paper.circle(that.paperWidth / 2 - 60, 60 - r * 5 - that.paperHeight / 2, 5)
                .rotate(that.angle, that.paperWidth / 2 - 60, 60 - that.paperHeight / 2)
                .attr("fill", "orange")
                .data("transform", false)
                .drag(function (dx, dy, x, y, e) {  // move

                    var angle = 90 + Raphael.angle(
                        e.offsetX - that.paperWidth / 2,
                        e.offsetY - that.paperHeight / 2,
                        that.rotationCircle.attr("cx"),
                        that.rotationCircle.attr("cy")
                    );

                    var angleRemainder = angle % 90;
                    var angleModulo = Math.floor(angle / 90) * 90;
                    var snapRadius = 5;

                    if (angleRemainder < snapRadius) {
                        angle = angleModulo;
                    } else if (angleRemainder > 90 - snapRadius) {
                        angle = angleModulo + 90;
                    }

                    that.rotationHandle.rotate(
                        angle - that.angle,
                        that.rotationCircle.attr("cx"),
                        that.rotationCircle.attr("cy")
                    );


                    angleRad = (angle) * Math.PI / 180;
                    var dx = 1.1 * Math.max(that.maxX, -1 * that.minX);
                    var dy = 1.1 * Math.max(that.maxY, -1 * that.minY);
                    that.calculateScale(Math.abs(dx * Math.cos(angleRad)) + Math.abs(dy * Math.sin(angleRad)), Math.abs(dx * Math.sin(angleRad)) + Math.abs(dy * Math.cos(angleRad)), false);
                    that.applyScale(that.scale, angle);
                    //that.lineSet.forEach(function (line) {
                    //    line.rotate(
                    //        angle - tempAngle,
                    //        that.paperWidth / 2,
                    //        that.paperHeight / 2
                    //    )
                    //});

                    //that.angle = angle;

                }, function (x, y) {  // start

                }, function (e) {  //end
                    //var angle = Raphael.angle(
                    //    that.rotationHandle.attr("cx"),
                    //    that.rotationHandle.attr("cy"),
                    //    that.rotationCircle.attr("cx"),
                    //    that.rotationCircle.attr("cy")
                    //);
                    //that.renderCutPlane(lines, undefined, angle);
                });
        },

        destroyRotateButton: function (that) {
            if (typeof that.rotationHandle !== "undefined") {
                that.rotationHandle.remove();
            }
            if (typeof that.rotationCircle !== "undefined") {
                that.rotationCircle.remove();
            }
        },

        renderCutPlane: function (shapes,SvgControllerData) {
            var that = this;
            this.scale = 1;
            this.angle = 0;
            that.allQrCodes = [];
            //$(".sbimcutplane").removeClass("hidden");
            //var scaleMultiplier = 100;
            var oldCutPlaneViewer = $("#cutplaneviewer");
            if (oldCutPlaneViewer.length === 0) {
                $(".sbimcutplane").append('<div id="cutplaneviewer" class="cutPlaneContainer"></div>');
            }
            $("#cutplaneviewer").html("");
            // AnnotationApplication.documentVersionId = "00000000-0000-0000-0000-000000000000";
            // var indexToRemove = null;
            // SvgGlobalControllerLogic.all.forEach(function (cont, index) {
            //     if (cont.documentVersionId === "00000000-0000-0000-0000-000000000000") {
            //         indexToRemove = index;
            //     }
            // });
            // if (indexToRemove !== null) delete SvgGlobalControllerLogic.all[indexToRemove];
            var newContent = '<div id="pageContainer-1">' +
                '<div id="cadCiewerWrapper" class="textLayer" style="width:100%; height:100%;">' +
                '</div>' +
                '</div>';
            $("#cutplaneviewer").html(newContent);
            this.cutPlaneSvgController = new SvgControllerData(-1, true);
            that.clearQrCodes();
            $(this.cutPlaneSvgController.paper.canvas).parent().css("background-color", "white");

            if(this.useHammer){
                this.setupTouch($(that.cutPlaneSvgController.paper.canvas).parent());
                this.setupScroll($(that.cutPlaneSvgController.paper.canvas).parent());
            }else{
                $(this.cutPlaneSvgController.paper.canvas).parent().attr("draggable", "true");
                $(this.cutPlaneSvgController.paper.canvas).parent().attr("ondragstart", "cadViewer.viewerDragStart(event)");
                //$(this.cutPlaneSvgController.paper.canvas).parent().attr("ondrag", "cadViewer.viewerDragging(event)");
                $(this.cutPlaneSvgController.paper.canvas).parent().attr("ondragend", "cadViewer.viewerDragging(event)");
            }

            this.cutPlaneSvgController.paper.clear();

            var allLines = [].concat.apply([], shapes.map(function (shape) { return shape.lines }));
            var allPoints = [].concat.apply([], allLines.map(function (line) { return line.points }));

            this.minX = Math.min.apply(null, allPoints.map(p => p.x));
            this.maxX = Math.max.apply(null, allPoints.map(p => p.x));
            this.minY = Math.min.apply(null, allPoints.map(p => p.y));
            this.maxY = Math.max.apply(null, allPoints.map(p => p.y));

            //this.maxX = Math.max.apply(null, lines.map(s => Math.max.apply(null, s.points.map(p => p.x))));

            //this.scale = scale === undefined ? 1 : scale;
            //this.rotation = rotation === undefined ? 0 : rotation;

            this.renderLines(shapes);
            this.onResizeContainer();


            if(this.showQR === true){
                this.clearQrCodes();
                this.showQrCodes();
                this.showQR = true
            }

            //var zlX1 = this.paperWidth/2 - 60;
            //var zlY1 = 60 + 5 * r + 80;

            // var zoomLine = this.cutPlaneSvgController.paper.path("M" + zlX1 + "," + zlY1 + "L" + zlX1 + "," + (zlY1 + 150)).
            //     attr({
            //         "stroke-width": 8,
            //         "opacity": 0.5
            //     });
            // var zoomHandle = this.cutPlaneSvgController.paper.circle(zlX1, zlY1 + 75, 5)
            //     .attr("fill", "orange")
            //     .drag(function (dx, dy, x, y, e) {  // move


            //     }, function (x, y) {  // start

            //     }, function (e) {  //end

            //     });


        },
        viewerDragStart: function(e){
            var that = this;
            that.viewerDragStartTempPoint = {
                x: e.offsetX,
                y: e.offsetY
            };
        },

        viewerDragging: function(e){
            var that = this;
            var x = that.cutPlaneSvgController.paper._viewBox[0],
                y = that.cutPlaneSvgController.paper._viewBox[1],
                w = that.cutPlaneSvgController.paper._viewBox[2],
                h = that.cutPlaneSvgController.paper._viewBox[3],
                fit = that.cutPlaneSvgController.paper._viewBox[4];

                var dx = e.layerX - that.viewerDragStartTempPoint.x,
                dy = e.layerY - that.viewerDragStartTempPoint.y;
            that.cutPlaneSvgController.paper.setViewBox(x - dx, y - dy, w , h, fit);

            that.viewerDragStartTempPoint = {
                x: e.layerX,
                y: e.layerY
            };
        },


        copyStylesInline: function (destinationNode, sourceNode) {
            var containerElements = ["svg", "g"];
            for (var cd = 0; cd < destinationNode.childNodes.length; cd++) {
                var child = destinationNode.childNodes[cd];
                if (containerElements.indexOf(child.tagName) != -1) {
                    copyStylesInline(child, sourceNode.childNodes[cd]);
                    continue;
                }
                var style = sourceNode.childNodes[cd].currentStyle || window.getComputedStyle(sourceNode.childNodes[cd]);
                if (style == "undefined" || style == null) continue;
                for (var st = 0; st < style.length; st++) {
                    child.style.setProperty(style[st], style.getPropertyValue(style[st]));
                }
            }
        },

        triggerDownload: function (imgURI, fileName) {
            var evt = new MouseEvent("click", {
                view: window,
                bubbles: false,
                cancelable: true
            });
            var a = document.createElement("a");
            a.setAttribute("download", fileName);
            a.setAttribute("href", imgURI);
            a.setAttribute("target", '_blank');
            a.dispatchEvent(evt);
        },

        downloadImageAsPng: function () {
            var that = this;
            if(typeof that.rotationCircle !== 'undefined')that.rotationCircle.hide();
            if(typeof that.rotationCircle !== 'undefined')that.rotationHandle.hide();
            var svg = cadViewer.cutPlaneSvgController.paper.canvas;
            var fileName = CutPlaneSection.dataItem.Name.replace(/[^a-z0-9]/gi, '_') + ".png";
            var copy = svg.cloneNode(true);
            this.copyStylesInline(copy, svg);
            var canvas = document.createElement("canvas");
            canvas.setAttribute("width", this.paperWidth * 1);
            canvas.setAttribute("height", this.paperHeight * 1);
            var ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, this.paperWidth * 1, this.paperHeight * 1);
            var data = (new XMLSerializer()).serializeToString(copy);
            var DOMURL = window.URL || window.webkitURL || window;
            var img = new Image();
            var svgBlob = new Blob([data], { type: "image/svg+xml;charset=utf-8" });
            var url = DOMURL.createObjectURL(svgBlob);
            img.onload = function () {
                ctx.drawImage(img, 0, 0);
                DOMURL.revokeObjectURL(url);
                if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
                    var blob = canvas.msToBlob();
                    navigator.msSaveOrOpenBlob(blob, fileName);
                }
                else {
                    var imgURI = canvas
                        .toDataURL("image/png")
                        .replace("image/png", "image/octet-stream");
                    cadViewer.triggerDownload(imgURI, fileName);
                }
                if(typeof that.rotationCircle !== 'undefined')that.rotationCircle.hide();
                if(typeof that.rotationCircle !== 'undefined')that.rotationHandle.hide();
                //document.removeChild(canvas);
            };
            img.src = url;
        },

        downloadImageAsSvg: function () {
            var that = this;
            if(typeof that.rotationCircle !== 'undefined')that.rotationCircle.hide();
            if(typeof that.rotationCircle !== 'undefined')that.rotationHandle.hide();


            var svg = cadViewer.cutPlaneSvgController.paper.canvas;
            var fileName = CutPlaneSection.dataItem.Name.replace(/[^a-z0-9]/gi, '_') + ".svg";
            var copy = svg.cloneNode(true);
            this.copyStylesInline(copy, svg);
            var canvas = document.createElement("canvas");
            canvas.setAttribute("width", this.paperWidth * 1);
            canvas.setAttribute("height", this.paperHeight * 1);
            var ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, this.paperWidth * 1, this.paperHeight * 1);
            var data = (new XMLSerializer()).serializeToString(copy);
            var DOMURL = window.URL || window.webkitURL || window;
            var img = new Image();
            var svgBlob = new Blob([data], { type: "image/svg+xml;charset=utf-8" });
            var url = DOMURL.createObjectURL(svgBlob);

            if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
                navigator.msSaveOrOpenBlob(svgBlob, fileName);
            }
            else {
                cadViewer.triggerDownload(url, fileName);
            }

            if(typeof that.rotationCircle !== 'undefined')that.rotationCircle.show();
            if(typeof that.rotationCircle !== 'undefined')that.rotationHandle.show();

        },

        print: function () {
            var that = this;
            return new Promise(function (resolve, reject) {
                var lines = CutPlaneSection.finalArray;
                $.ajax({
                    type: 'POST',
                    url: '/api/Annotation/DownloadCutPlaneWithAnnotations',
                    data: {
                        Lines: lines,
                        scale: that.scale,
                        includeQR: false
                    },
                    headers: {
                        Authorization: "Bearer " + window.AuthenticationToken
                    },
                    success: function (response) {
                        resolve(response);
                    },
                    error: function (response) {
                        reject(response);
                    }
                });
            });
        },

        zoomIn: function () {
            var that = this;
            var x = that.cutPlaneSvgController.paper._viewBox[0],
                y = that.cutPlaneSvgController.paper._viewBox[1],
                w = that.cutPlaneSvgController.paper._viewBox[2],
                h = that.cutPlaneSvgController.paper._viewBox[3],
                fit = that.cutPlaneSvgController.paper._viewBox[4];
            that.cutPlaneSvgController.paper.setViewBox(x*0.8, y*0.8, w * 0.8, h * 0.8, fit)
        },

        zoomOut: function () {
            var that = this;
            var x = that.cutPlaneSvgController.paper._viewBox[0],
                y = that.cutPlaneSvgController.paper._viewBox[1],
                w = that.cutPlaneSvgController.paper._viewBox[2],
                h = that.cutPlaneSvgController.paper._viewBox[3],
                fit = that.cutPlaneSvgController.paper._viewBox[4];
            that.cutPlaneSvgController.paper.setViewBox(x*1.25, y*1.25, w * 1.25, h * 1.25, fit)
        },

        showQrCodes: function(){
            var that = this;
            if(that.allQrCodes.length === 0){
                that.shapes.forEach(function (shape) {
                    if (shape.emsNode) {
                        that.drawQrCodeForLine(shape);
                    }
                });
            }else{
                that.allQrCodes.forEach(function(qr){
                    qr.show();
                });
            }
        },

        hideQrCodes: function(){
            var that = this;
            that.allQrCodes.forEach(function(qr){
                qr.hide();
            });
        },

        clearQrCodes: function(){
            var that = this;
            that.allQrCodes.forEach(function(el){
                el.remove();
            })
            // CADViewer.prototype.allQrCodes.forEach(function(el){
            //     el.remove();
            // })
            that.allQrCodes = [];
            that.showQR = false;
            // CADViewer.prototype.allQrCodes = [];
            // CADViewer.prototype.showQR = false;
        },

        setupTouch: function(element){
            // Hammer js function
            var that = this;
            this.hammer = new Hammer.Manager(element[0]);

            this.hammer.add(new Hammer.Pan({ event: "pan" }));

            this.hammer.get('pan').set({ enable: true });

            var isMouseDown = false;
            this.hammer.on("pan", function (evt) {
                try{
                    var e = evt;
                    console.log("panstart", e);
                    
                    
                    // touch start
                    if( !isMouseDown){
                        var e = evt;
                        if(typeof evt.originalEvent !== 'undefined'){
                            e = evt.originalEvent;
                        }else if(typeof evt.srcEvent !== 'undefined'){
                            e = evt.srcEvent;
                        }
                        isMouseDown = true;
                        //console.log(e);
                        that.viewerDragStartTempPoint = {
                            x: e.layerX,
                            y: e.layerY
                        };
                    }else if(isMouseDown && !e.isFinal){
                        var e = evt;
                        if(typeof evt.originalEvent !== 'undefined'){
                            e = evt.originalEvent;
                        }else if(typeof evt.srcEvent !== 'undefined'){
                            e = evt.srcEvent;
                        }
                        if(isMouseDown){
                            console.log(e);
                            var x = that.cutPlaneSvgController.paper._viewBox[0],
                                y = that.cutPlaneSvgController.paper._viewBox[1],
                                w = that.cutPlaneSvgController.paper._viewBox[2],
                                h = that.cutPlaneSvgController.paper._viewBox[3],
                                fit = that.cutPlaneSvgController.paper._viewBox[4];
        
                                var dx = e.layerX - that.viewerDragStartTempPoint.x,
                                dy = e.layerY - that.viewerDragStartTempPoint.y;
                                console.log(dx +" , "+dy);
                            that.cutPlaneSvgController.paper.setViewBox(x - dx, y - dy, w , h, fit);
        
                            that.viewerDragStartTempPoint = {
                                x: e.layerX,
                                y: e.layerY
                            };
                        }
                    }

                    // touch end
                    if(isMouseDown && e.isFinal){
                        var e = evt;
                        if(typeof evt.originalEvent !== 'undefined'){
                            e = evt.originalEvent;
                        }else if(typeof evt.srcEvent !== 'undefined'){
                            e = evt.srcEvent;
                        }
                        //console.log(e);
                        that.viewerDragStartTempPoint = {
                            x: null,
                            y: null
                        };
                        isMouseDown = false;
                    }
                }catch(ex){
                    console.error(ex);
                }

            });
        },

        setupScroll: function(element){
            
            var that = this;
            var isMouseDown = false;
            var onmousedown = function(evt){
                var e = evt;
                if(typeof evt.originalEvent !== 'undefined'){
                    e = evt.originalEvent;
                }
                isMouseDown = true;
                console.log(e);
                that.viewerDragStartTempPoint = {
                    x: e.layerX,
                    y: e.layerY
                };
            }

            var onmousemove = function(evt){
                var e = evt;
                if(typeof evt.originalEvent !== 'undefined'){
                    e = evt.originalEvent;
                }
                if(isMouseDown){
                    console.log(e);
                    var x = that.cutPlaneSvgController.paper._viewBox[0],
                        y = that.cutPlaneSvgController.paper._viewBox[1],
                        w = that.cutPlaneSvgController.paper._viewBox[2],
                        h = that.cutPlaneSvgController.paper._viewBox[3],
                        fit = that.cutPlaneSvgController.paper._viewBox[4];

                        var dx = e.layerX - that.viewerDragStartTempPoint.x,
                        dy = e.layerY - that.viewerDragStartTempPoint.y;
                    that.cutPlaneSvgController.paper.setViewBox(x - dx, y - dy, w , h, fit);

                    that.viewerDragStartTempPoint = {
                        x: e.layerX,
                        y: e.layerY
                    };
                }
            }

            var onmouseup = function(evt){
                var e = evt;
                if(typeof evt.originalEvent !== 'undefined'){
                    e = evt.originalEvent;
                }
                console.log(e);
                that.viewerDragStartTempPoint = {
                    x: null,
                    y: null
                };
                isMouseDown = false;
            }

            $(element[0]).on('mousedown', onmousedown);
            $(element[0]).on('mousemove', onmousemove);
            $(element[0]).on('mouseup', onmouseup);



            //element[0].addEventListener('touchstart', onmousedown, false);
            //element[0].addEventListener('touchmove', onmousemove, false);
            //element[0].addEventListener('touchend', onmouseup, false);

        },

    }

    return CADViewer;

})();