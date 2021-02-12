var DrawStateService = (function DrawStateServiceClosure() {

  function DrawStateService() {
        this.stampUrl =""
        this.drawState = "SELECT";
        this.stampState = "";
        this.sbimText = "";
        this.emsNode = {
            id: "",
            name: ""
        }
        this.defaultProps = {
            lineColor: "red",
            lineWidth: 1
        }
    };

    DrawStateService.prototype = {
        constructor: DrawStateService,

        getDrawState: function DrawStateService_getDrawState() {
            return this.drawState;
        },
        getStampState: function DrawStateService_getStampState() {
            return this.stampState;
        },
        setSelect: function DrawStateService_setSelect() {
            //AnnotationApplication.Toolbar.selectAnnotationButton("SELECT");
            this.drawState = "SELECT";
            //AnnotationApplication.CanvasController.activateAllCanvases();
            //AnnotationApplication.CanvasController.getCurrentCanvas().isDrawingMode = false;
            //AnnotationApplication.CanvasController.setCanvasCursorDefault();
            //AnnotationApplication.CanvasController.deactivateAllCanvases();
        },
        setDrawState: function DrawStateService_setDrawState(drawState, stampState) {
            //AnnotationApplication.Toolbar.selectAnnotationButton(drawState, stampState);
            this.drawState = drawState;//.getAttribute("drawState");
            this.stampState = stampState;
            if (this.drawState === "CLOUD") {
                //this.stampState = state.childNodes[3];
            }

            if (this.drawState !== "SELECT") {
                //AnnotationApplication.CanvasController.setCanvasCursorCrosshair();
                //AnnotationApplication.CanvasController.deactivateAllCanvases();
            } else {
                AnnotationApplication.CanvasController.activateAllCanvases();
            }
            dataExchange.sendParentMessage('changeDrawState', drawState);
            //console.log(this.getDrawState());
        },

        //step 1 ( when you select the context menu option)
        setEmsDrawState: function DrawStateService_setEmsDrawState(text) {
            this.drawState = "EMS";
            //AnnotationApplication.CanvasController.setCanvasCursorCrosshair();
            // ScrlTabs.drawings.iframes[ScrlTabs.current].AnnotationApplication.DrawStateService.drawState = "EMS";
            // SvgGlobalControllerLogic = ScrlTabs.drawings.iframes[ScrlTabs.current].SvgGlobalControllerLogic;
            // PDFViewerApplication = ScrlTabs.drawings.iframes[ScrlTabs.current].PDFViewerApplication;

            SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.isDrawing = true;
            $(SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.paper.canvas).css("z-index", "100");
            SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.drawingType = 
                this.emsNodes.length == 1 && this.emsNodes[0].Type.toUpperCase() === 'GROUP' ? "emsgroup" : "emselement";
            SvgGlobalControllerLogic.enableHammerPan();
            $(".textLayer > div").not(".raphael").hide();
        },

        setDefectDrawState : function(){
            this.drawState = "defect";
            //AnnotationApplication.CanvasController.setCanvasCursorCrosshair();

            SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.isDrawing = true;
            $(SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.paper.canvas).css("z-index", "100");
            SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.drawingType = "defect";
            SvgGlobalControllerLogic.enableHammerPan();
            $(".textLayer > div").not(".raphael").hide();
        },

        setEmsGroupDrawState: function DrawStateService_setEmsDrawState(text) {
            this.drawState = "EMSGROUP";
            //AnnotationApplication.CanvasController.setCanvasCursorCrosshair();

            // ScrlTabs.drawings.iframes[ScrlTabs.current].AnnotationApplication.DrawStateService.drawState = "EMSGROUP";
            // SvgGlobalControllerLogic = ScrlTabs.drawings.iframes[ScrlTabs.current].SvgGlobalControllerLogic;
            // PDFViewerApplication = ScrlTabs.drawings.iframes[ScrlTabs.current].PDFViewerApplication;

            SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.isDrawing = true;
            $(SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.paper.canvas).css("z-index", "100");
            SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.drawingType = "emsgroup";
            SvgGlobalControllerLogic.enableHammerPan();
            $(".textLayer > div").not(".raphael").hide();
        },
        updateEmsNode: function DrawStateService_updateEmsNode(nodeId, nodeName, nodeType) {

            if (AnnotationApplication.documentId && this.emsNode.id === nodeId) {
                this.setEmsNode(nodeId, nodeName, nodeType);
            }

        },
        getEmsText: function DrawStateService_getEmsText() {
            return this.emsNode.name;
        },
        getEmsNode: function DrawStateService_getEmsNode() {
            return this.emsNode;
        },
        setEmsNode: function DrawStateService_setEmsNode(nodeId, nodeName, nodeType) {
            // if (AnnotationApplication.documentId) {

                AnnotationApplication.CanvasController.deactivateAllCanvases();
                //AnnotationApplication.RenderDrawState.listen();

                this.emsNode = {
                    id: nodeId,
                    name: nodeName
                };


                switch (nodeType) {
                    case "ELEMENT":
                        this.setEmsDrawState();
                        break;
                    case "GROUP":
                        this.setEmsGroupDrawState();
                        break;
                    default:
                        break;
                }
            // }
        },
        
        setEmsNodes: function DrawStateService_setEmsNode(nodes) {
            // if (AnnotationApplication.documentId) {

                AnnotationApplication.CanvasController.deactivateAllCanvases();
                //AnnotationApplication.RenderDrawState.listen();
                this.emsNodes=[];
                nodes.forEach(node =>{
                    node.id = node.EMSNodeId;
                    node.name = node.Name;
                    this.emsNodes.push(node);
                });

                if (nodes.length === 1 && nodes[0].Type === "GROUP"){
                    this.setEmsGroupDrawState();
                } else {
                    this.setEmsDrawState();
                }
            // }
        },

        setDefectNodes: function DrawStateService_setDefectNodes(nodes) {
            // if (AnnotationApplication.documentId) {

                AnnotationApplication.CanvasController.deactivateAllCanvases();
                //AnnotationApplication.RenderDrawState.listen();
                this.emsNodes=[];
                nodes.forEach(node =>{
                    node.id=node.DefectId;
                    node.name = node.Title;
                    this.emsNodes.push(node)
                });

                // this.emsNode = {
                //     id: nodeId,
                //     name: nodeName
                // };

                this.setDefectDrawState();
            // }
        },

        getDefectNode: function DrawStateService_getEmsNode() {
            return this.emsNode;
        },

        resetEmsNode: function DrawStateService_resetEmsNode() {
            this.emsNode = {
                id: "",
                name: ""
            }
            this.setSelect();
        },

        GetLineSettingsPartial: function () {
            var that = this;
            that.createLineSettingsDialog();
            // var model = jQuery.extend(true, {}, that.defaultProps);
            // model.type = "path";
            // $.ajax({
            //     type: "POST",
            //     url: "/Annotation/Partial_AnnotationProperties",
            //     data: JSON.stringify(model),
            //     dataType: "html",
            //     success: function (e) {
            //         that.createLineSettingsDialog(e);
            //         that.lineSettingsDialog.open();
            //     },
            //     error: function (e) {
            //         console.log("unable to open the dialog")
            //     }
            // });
        },

        createLineSettingsDialog: function (content) {
            var onStrokeColorChange = function(e) {
                SvgGlobalControllerLogic.freeDrawProperties.color = e.value;
            }

            var onStrokeColorSelect = function(e) {
                onStrokeColorChange(e);
            }

            var onStrokeWidthSlide = function(e) {
                SvgGlobalControllerLogic.freeDrawProperties.strokeWidth = e.value;
            }

            var div = $("#freedrawtool")[0];
            $(div).html("");
            $(div).removeClass("hidden");
            $(div).css("min-width", "50px");
            $(div).css("min-height", "250px");
            $(div).css("top", "30%");
            $(div).css("right", "20px");
            $(div).css("opacity", "0.9");
            $(div).append('<input id="freedrawcolorpicker" />');
            $(div).append('<input id="freedrawslider" class="balSlider verticalslider" value="0" title="slider"/>');
            
            $("#freedrawcolorpicker").kendoColorPicker({
                value: "#ffffff",
                buttons: false,
                value: SvgGlobalControllerLogic.freeDrawProperties.color,
                select: onStrokeColorChange
            });

            var slider = $("#freedrawslider").kendoSlider({
                increaseButtonTitle: "Right",
                decreaseButtonTitle: "Left",
                min: 1,
                max: 31,
                smallStep: 1,
                largeStep: 10,
                value: SvgGlobalControllerLogic.freeDrawProperties.strokeWidth,
                orientation: "vertical",
                slide: onStrokeWidthSlide,
                change: onStrokeWidthSlide
            }).data("kendoSlider");

            
            // $('#LineSettingsDialog').html(content);
            // $('#LineSettingsDialog').kendoWindow({
            //     title: VIEW_RESOURCES.Resource.Properties,
            //     visible: false,
            //     actions: [
            //         "Close"
            //     ]
            // });
            // this.lineSettingsDialog = $('#LineSettingsDialog').data('kendoWindow')
            // this.lineSettingsDialog.center();
        },

        showLineSettingsDialog: function () {
            if (typeof this.lineSettingsDialog === "undefined") {
                this.GetLineSettingsPartial();
            } else {
                this.lineSettingsDialog.open();
            }
        },
        closeLineSettingsDialog: function () {
            var div = $("#freedrawtool")[0];
            $(div).html("");
            $(div).addClass("hidden");

            // if (typeof this.lineSettingsDialog !== "undefined") {
            //     this.lineSettingsDialog.close();
            // }
            // AnnotationApplication.CanvasController.RenderCanvasInSVG(1);
            // AnnotationApplication.CanvasController.deactivateAllCanvases();
        },
    };
    return DrawStateService;
})();
