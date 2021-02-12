var TwoDUtils = (function UtilsClosure() {

    function TwoDUtils() {
        this.viewerContainer = $("#viewerContainer");
        this.hiddenSpacer = $("#hiddenSpacer");
        this.loadingIcon = $("#loadingIcon");
        this.loadingOverlay = $("#loadingOverlay");
        this.consoleLog = console.log;
        this.consoleDebug = console.debug;
        this.consoleWarn = console.warn;
    };

    TwoDUtils.prototype = {

        createRandomId: function Utils_createRandomId() {
            var min = 99;
            var max = 999999;
            var random = Math.floor(Math.random() * (max - min + 1)) + min;
            var id = random;

            return id;
        },

        ajaxStop: function Utils_ajaxStop() {
            $(document).ajaxStop(function () {
               // Do something after all ajax requests complete
            });
        },

        showLoadingOverlay: function Utils_showLoadingOverlay() {
            this.viewerContainer.css({ "opacity": ".2" });
            this.hiddenSpacer.removeClass("hidden");
            this.loadingIcon.removeClass("hidden");
            this.loadingOverlay.removeClass("hidden");
        },

        hideLoadingOverlay: function Utils_hideLoadingOverlay() {
            this.viewerContainer.css({ "opacity": "1" });
            this.hiddenSpacer.addClass("hidden");
            this.loadingIcon.addClass("hidden");
            this.loadingOverlay.addClass("hidden");
        },


        //notify: function Utils_notify(msg, type) {
        //    //console.log("notifying...");
        //    $.notify({
        //        // options
        //        message: msg
        //    }, {
        //        // settings
        //        type: type
        //    });
        //},
        
        removeContextMenu: function () {
            var contextMenu = $("#context-menu").data("kendoContextMenu");
            if (contextMenu) {
                console.log("destroy");
                contextMenu.destroy();
            }
        },
        
        adjustViewerScale: function () {
            var screenWidth = document.documentElement.clientWidth;

            // Set zoom according to sreen size
            if (screenWidth < 860 && screenWidth > 779) {
                PDFViewerApplication.pdfViewer.currentScaleValue = .9;
            }
            else if (screenWidth < 780 && screenWidth > 694) {
                PDFViewerApplication.pdfViewer.currentScaleValue = .8;
            }
            else if (screenWidth < 695 && screenWidth > 614) {
                PDFViewerApplication.pdfViewer.currentScaleValue = .7;
            }
            else if (screenWidth < 615 && screenWidth > 539) {
                PDFViewerApplication.pdfViewer.currentScale = .6;
                PDFViewerApplication.pdfViewer.currentScaleValue = .6;
            }
            else if (screenWidth < 540 && screenWidth > 449) {
                PDFViewerApplication.pdfViewer.currentScale = .5;
            }
            else if (screenWidth < 450 && screenWidth > 364) {
                PDFViewerApplication.pdfViewer.currentScaleValue = .4;
            }
            else if (screenWidth < 365 && screenWidth > 284) {
                PDFViewerApplication.pdfViewer.currentScaleValue = .3;
            }
            else if (screenWidth < 285) {
                PDFViewerApplication.pdfViewer.currentScaleValue = .25;
            }
        },

        openNewFile: function (url, documentId, documentVersionId, annotationId, canvasId) {
            AnnotationApplication.LoadingOverlayProcID = Loading_OL.startGenericLoadingScreenWithDelay(AnnotationApplication.loadingOverlayName, 0);
            AnnotationApplication.documentId = documentId;
            AnnotationApplication.documentVersionId = documentVersionId;
            AnnotationApplication.scrollAnnotationCanvasId = canvasId;
            AnnotationApplication.scrollAnnotationId = annotationId;
            AnnotationApplication.DEFAULT_URL = url;
            //AnnotationApplication.emsFirstRun = true;
            if (PDFViewerApplication) {
                AnnotationApplication.CRUDController.GetDocumentPagesRotation(
                    AnnotationApplication.documentVersionId,
                    null,
                    true
                ).then(
                    data=>{
                        documentPagesRotation = data;
                        PDFViewerApplication.open(url);
                    },
                    error=>{
                        console.error(error);
                    }
                )
                
                
            }
        },
        
        refreshDocument: function () {
            SvgGlobalControllerLogic.RemoveDocumentFrom_AllDbAnnotations(AnnotationApplication.documentVersionId);
            AnnotationApplication.LoadingOverlayProcID= Loading_OL.startGenericLoadingScreenWithDelay(AnnotationApplication.loadingOverlayName, 0);

            try{
                FileOperationLogic.downloadItem(
                    AnnotationApplication.documentId,
                    AnnotationApplication.documentVersionId,
                    ".pdf",
                    function webViewerLoadCallback(url) {
                        PDFViewerApplication.open(url);
                    }
                );
            } catch (e) {
                console.log("Unable to load document. DocumentId: " + AnnotationApplication.documentId + ". DocumentVersionId: " + AnnotationApplication.documentVersionId + ".");
                Loading_OL.stopGenericLoadingScreen(AnnotationApplication.LoadingOverlayProcID);
            }
        },
        
        loadBlankDocIfLastDoc: function (externalId) {
            if (externalId == AnnotationApplication.documentVersionId) {
                this.loadBlankDocument();
            }
        },

        checkIfClosedFilesMatchesCurrenFile: function (externalId) {
            if (externalId == AnnotationApplication.documentVersionId) {
                this.loadBlankDocument();
            }
        },
        
        loadBlankDocument: function () {
            var FALLBACK_URL = "/Content/PDF/_Blank.pdf";
            AnnotationApplication.documentVersionId = null;
            AnnotationApplication.scrollAnnotationCanvasId = null;
            AnnotationApplication.scrollAnnotationId = null;
            AnnotationApplication.DEFAULT_URL = AnnotationApplication.FALLBACK_URL;
            AnnotationApplication.emsFirstRun = true;
            PDFViewerApplication.open(AnnotationApplication.FALLBACK_URL);
        },

        refreshEmsTagLists: function () {
            if (AnnotationApplication.viewerType === "EMS") {

                var DocumentTagContainer = $("#DocumentTagContainer");

                var isDocTagContainerHidden = DocumentTagContainer.hasClass("hidden")
                console.log(isDocTagContainerHidden);
                if (window.parent.CPaneService.panelType.endsWith("TAGS")) {
                    window.parent.CPaneService.loadPanel();
                }
            }
            var annList = $("#annotationListContainer");
            if (annList.length > 0) {
                AnnotationApplication.RightSidebarController.showAnnotationList();
            }
        },

        findAndRemoveAnnotation: function (annotationIds) {
            if (typeof PDFViewerApplication !== "undefined") {
                var canvas;
                //console.log("scaling annotations");
                var visible = PDFViewerApplication.pdfViewer._getVisiblePages();
                var visiblePages = visible.views;
                var totalPagesVisible = visiblePages.length;
                var page;
                for (var k in annotationIds) {
                    for (var i = 0; i < totalPagesVisible; i++) {
                        page = visiblePages[i];
                        canvas = $('#annotationCanvasPage_' + page.id)[0].fabric;
                        //canvas = AnnotationApplication.canvases[i];

                        if (typeof (canvas.type) !== "undefined" && canvas.type === "fabricjs") {
                            var objects = canvas.getObjects();

                            for (var j in objects) {
                                var annotation = objects[j];
                                var annotationId = annotationIds[k]
                                if (annotation.DocumentAnnotationId == annotationId) {
                                    canvas.remove(annotation);
                                }

                            }
                            canvas.renderAll();
                        }
                    }
                }
            }

        },

        toggleQR: function (mesh, canvas) {
            for (var i in mesh._objects) {
                if (mesh._objects[i].annotationType === "qrCode") {
                    if (mesh._objects[i].visible) {
                        this.hideQR(mesh, canvas);
                        break;
                    } else {
                        this.showQR(mesh, canvas);
                        break;
                    }
                }
            }
            canvas.renderAll();
        },

        hideQR: function (mesh, canvas) {
            
            for (var i in mesh._objects) {
                if (mesh._objects[i].annotationType === "qrCode") {
                    mesh._objects[i].visible = false;
                    mesh.set("dirty", true);
                }
            }
            for (var i in mesh.objects) {
                if (mesh.objects[i].annotationType === "qrCode") {
                    mesh.objects[i].visible = false;
                }
            }
        },

        showQR: function (mesh, canvas) {
            for (var i in mesh._objects) {
                if (mesh._objects[i].annotationType === "qrCode") {
                    mesh._objects[i].visible = true;
                    mesh.set("dirty", true);
                }
            }
            for (var i in mesh.objects) {
                if (mesh.objects[i].annotationType === "qrCode") {
                    mesh.objects[i].visible = true;
                }
            }

        },

        showAllQR: function () {
            //AnnotationApplication.CanvasController.getCanvases().forEach(function (canvas) {
            //    canvas._objects.forEach(function (annotation) {
            //        AnnotationApplication.Utils.showQR(annotation, canvas);
            //    });
            //    if (canvas) {
            //        canvas.renderAll();
            //    }
            //});
            SvgGlobalControllerLogic.enableEmsQr();
        },

        hideAllQR: function () {
            //AnnotationApplication.CanvasController.getCanvases().forEach(function (canvas) {
            //    canvas._objects.forEach(function (annotation) {
            //        AnnotationApplication.Utils.hideQR(annotation, canvas);
            //    });
            //    if (canvas) {
            //        canvas.renderAll();
            //    }
            //});
            SvgGlobalControllerLogic.disableEmsQr();
        },
        
    };

    return TwoDUtils;
})();