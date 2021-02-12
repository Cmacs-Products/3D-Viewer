
'use strict';

var DownloadAnnotationController = (function DownloadAnnotationControllerClosure() {

    function DownloadAnnotationController() {
        this.count = 1;
        this.token = null;
        this.readyForDownload = false;
        this.canvasesComplete = 0;
        this.tempScaleValue = -1;
    };

    DownloadAnnotationController.prototype = {

        constructor: DownloadAnnotationController,

        generateToken: function () {
            var that = this;
            $.ajax({
                type: "GET",
                async: false,
                url: "/Document/InitializeDownloadWithAnnotations",
                success: function (response) {
                    console.log(response);
                    that.token = response;
                }
            });
            //this.downloadWhenComplete();
        },

        initializeDownloadableCanvasesPageRange: function DownloadAnnotationController_initializeDownloadableCanvasesPageRange(isShared, viewType, startPage, endPage) {
            if(typeof isShared === 'undefined' || isShared === null) isShared = false;
            if(typeof viewType === 'undefined' || viewType === null) viewType = '';

            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {

                if (this.readyState === 1) {
                    // opened
                    //processOverlayId = Loading_OL.startGenericLoadingScreenWithDelay("DownloadingZipFile");
                }
                if (this.readyState === 3) {
                    // loading

                }
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        // Typical action to be performed when the document is ready:
                        //window.location = xhttp.responseURL;
                    } else {
                        // error

                    }
                    //Loading_OL.stopGenericLoadingScreen(processOverlayId);
                }
            };
            xhttp.onload = function (e) {
                if (this.status === 200) {
                    window.location = e.target.response;
                    //// Create a new Blob object using the 
                    ////response data of the onload object
                    //var blob = new Blob([this.response], { type: 'application/pdf' });
                    ////Create a link element, hide it, direct 
                    ////it towards the blob, and then 'click' it programatically
                    //var a = document.createElement("a");
                    //a.style = "display: none";
                    //document.body.appendChild(a);
                    ////Create a DOMString representing the blob 
                    ////and point the link element towards it
                    //var url = window.URL.createObjectURL(blob);
                    //a.href = url;
                    //var name = xhttp.getResponseHeader("Content-Disposition")
                    //    .replace("\"", "")
                    //    .replace(".pdf\"", ".pdf")
                    //    .replace("attachment; filename=", "");

                    //name = decodeURI(name);

                    //a.download = name;
                    ////programatically click the link to trigger the download
                    //a.click();
                    ////release the reference to the file by revoking the Object URL
                    ////window.URL.revokeObjectURL(url);
                    ////window.navigator.msSaveBlob(blob, name);

                } else {
                    //deal with your error state here
                    //console.error(e);
                    // $("body").append("<span id='DownloadErrorPopup'></span>");
                    // var DownloadErrorPopup = $("#DownloadErrorPopup").kendoNotification().data("kendoNotification");
                    // DownloadErrorPopup.show("Incompatible or protected document!","info");
                }
            };
            // var includeQR = typeof window.parent.FilterStatusesLogic !== 'undefined' ? ['qr', 'nameqr'].indexOf(window.parent.FilterStatusesLogic.selectedIconType.split('_')[1]) > -1 : false;  //AnnotationApplication.Toolbar.showQR;// ? "1" : "0";
            
            var includeQR = false;
            if (viewType.includes('qr')) {
                includeQR = true;
            }
            var urlToCall = '/api/Annotation/DownloadDocumentWithAnnotationsPageRange/' + AnnotationApplication.documentVersionId + '/' + viewType + '/' + startPage + '/' + endPage;
            if(isShared){
               urlToCall = '/api/ShareDocument/DownloadDocumentWithAnnotationsPageRange/' + AnnotationApplication.documentVersionId + '/' + viewType + '/' + startPage + '/' + endPage;
            }
            xhttp.open("GET", urlToCall, true);
            xhttp.setRequestHeader("Authorization", "Bearer " + window.AuthenticationToken);
            xhttp.responseType = 'text';
            xhttp.send(null);
        },


        initializeDownloadableCanvases: function DownloadAnnotationController_initializeDownloadableCanvases(isShared, viewType) {
            if(typeof isShared === 'undefined' || isShared === null) isShared = false;
            if(typeof viewType === 'undefined' || viewType === null) viewType = '';

            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {

                if (this.readyState === 1) {
                    // opened
                    //processOverlayId = Loading_OL.startGenericLoadingScreenWithDelay("DownloadingZipFile");
                }
                if (this.readyState === 3) {
                    // loading

                }
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        // Typical action to be performed when the document is ready:
                        //window.location = xhttp.responseURL;
                    } else {
                        // error

                    }
                    //Loading_OL.stopGenericLoadingScreen(processOverlayId);
                }
            };
            xhttp.onload = function (e) {
                if (this.status === 200) {
                    window.location = e.target.response;
                    //// Create a new Blob object using the 
                    ////response data of the onload object
                    //var blob = new Blob([this.response], { type: 'application/pdf' });
                    ////Create a link element, hide it, direct 
                    ////it towards the blob, and then 'click' it programatically
                    //var a = document.createElement("a");
                    //a.style = "display: none";
                    //document.body.appendChild(a);
                    ////Create a DOMString representing the blob 
                    ////and point the link element towards it
                    //var url = window.URL.createObjectURL(blob);
                    //a.href = url;
                    //var name = xhttp.getResponseHeader("Content-Disposition")
                    //    .replace("\"", "")
                    //    .replace(".pdf\"", ".pdf")
                    //    .replace("attachment; filename=", "");

                    //name = decodeURI(name);

                    //a.download = name;
                    ////programatically click the link to trigger the download
                    //a.click();
                    ////release the reference to the file by revoking the Object URL
                    ////window.URL.revokeObjectURL(url);
                    ////window.navigator.msSaveBlob(blob, name);

                } else {
                    //deal with your error state here
                    //console.error(e);
                    // $("body").append("<span id='DownloadErrorPopup'></span>");
                    // var DownloadErrorPopup = $("#DownloadErrorPopup").kendoNotification().data("kendoNotification");
                    // DownloadErrorPopup.show("Incompatible or protected document!","info");
                }
            };
            // var includeQR = typeof window.parent.FilterStatusesLogic !== 'undefined' ? ['qr', 'nameqr'].indexOf(window.parent.FilterStatusesLogic.selectedIconType.split('_')[1]) > -1 : false;  //AnnotationApplication.Toolbar.showQR;// ? "1" : "0";
            
            var includeQR = false;
            if (viewType.includes('qr')) {
                includeQR = true;
            }
            var urlToCall = '/api/Annotation/DownloadDocumentWithAnnotations/' + AnnotationApplication.documentVersionId + '/' + viewType;
            if(isShared){
               urlToCall = '/api/shareDocument/DownloadDocumentWithAnnotations/' + AnnotationApplication.documentVersionId + '/' + viewType;
            }
            xhttp.open("GET", urlToCall, true);
            xhttp.setRequestHeader("Authorization", "Bearer " + window.AuthenticationToken);
            xhttp.responseType = 'text';
            xhttp.send(null);
        },

        /*
        initializeDownloadableCanvases: function DownloadAnnotationController_initializeDownloadableCanvases() {
            var that = this;
            var pagesTotal = PDFViewerApplication.pagesCount;
            var processed = 0;
            //var count = 1;
            
            for (this.count; this.count <= pagesTotal; this.count++) {

                var pageNumber = this.count;
                
                //Loading_OL.updateDescription(VIEW_RESOURCES.Resource.ExportingPage + " " + (canvasesComplete + 1) + " " + VIEW_RESOURCES.Resource.Of + " " + pagesTotal);

                //console.log(pageNumber);
                $.ajax({
                    type: 'GET',
                    url: '/Annotation/GetAnnotations',
                    async: true,
                    pageNumber: pageNumber,
                    count: this.count,
                    data: {
                        DocumentVersionId: AnnotationApplication.documentVersionId || AnnotationApplication.documentId,
                        CanvasId: pageNumber,
                        Context: "DOCUMENT"
                    },
                    success: function (response) {
                        var that = this;
                        var pageNumber = response.CanvasId;

                        //var readyForDownload = false;
                        //if (canvasesComplete >= pagesTotal) {
                        //    readyForDownload = true;
                        //}
                        //AnnotationApplication.DownloadAnnotationController.readyForDownload = readyForDownload;
                        

                        var shapeDetails = response.ShapeDetails;

                        console.log(pageNumber);
                        console.log(shapeDetails);
                        
                        if (shapeDetails !== '{"objects":[],"background":""}') {

                            var width = document.getElementById("pageContainer" + pageNumber).offsetWidth;
                            var height = document.getElementById("pageContainer" + pageNumber).offsetHeight;
                            var canvasId = "downloadCanvas_" + pageNumber;
                            var canvas = document.createElement('canvas');

                            //console.log(canvasId);

                            canvas.setAttribute("id", canvasId);
                            canvas.setAttribute("width", width);
                            canvas.setAttribute("height", height);
                            //document.getElementById('annotationDownloadContainer').appendChild(canvas);

                            canvas = new fabric.StaticCanvas(canvas, {//canvasId
                                selection: false,
                                allowTouchScrolling: false,
                                isDrawingMode: false,
                                skipTargetFind: true,
                                width: width,
                                height: height,
                            });

                            canvas.setZoom(PDFViewerApplication.pdfViewer.currentScale);

                            //var shapeDetails = response.ShapeDetails;
                            var shapeDetailsParsed = JSON.parse(shapeDetails);
                            var annotations = shapeDetailsParsed.objects;

                            var newAnnotationObjects = AnnotationApplication.CanvasController.getNewShapeDetails(annotations, canvas, false);
                            var newShapeDetails = newAnnotationObjects.newShapeDetails;

                            var reconstructedObjects = newAnnotationObjects.reconstructedObjects;
                            var imgData;

                            //Load the canvas

                            canvas.loadFromJSON(JSON.stringify(newShapeDetails), function () {
                                
                                for (var i in reconstructedObjects) {
                                    if (reconstructedObjects[i]) {
                                        canvas.add(reconstructedObjects[i]);
                                    }
                                }

                                canvas.lowerCanvasEl.width = canvas.width;
                                canvas.lowerCanvasEl.height = canvas.height;

                                imgData = canvas.toDataURL('png');

                                AnnotationApplication.DownloadAnnotationController.uploadCanvasImage(response.CanvasId, imgData);

                                //if (readyForDownload) {
                                //    Loading_OL.updateDescription(VIEW_RESOURCES.Resource.ExportComplete + ". " + VIEW_RESOURCES.Resource.ProcessingFile + ".");
                                //    AnnotationApplication.DownloadAnnotationController.download();
                                //    //that.count = 0;
                                //}

                                if (canvas !== 0) {
                                    canvas.renderAll();
                                }

                                AnnotationApplication.DownloadAnnotationController.canvasesComplete++;

                                Loading_OL.updateDescription(VIEW_RESOURCES.Resource.ExportingPage + " " + (AnnotationApplication.DownloadAnnotationController.canvasesComplete) + " " + VIEW_RESOURCES.Resource.Of + " " + pagesTotal);
                                var readyForDownload = false;
                                if (AnnotationApplication.DownloadAnnotationController.canvasesComplete >= pagesTotal) {
                                    readyForDownload = true;
                                }
                                AnnotationApplication.DownloadAnnotationController.readyForDownload = readyForDownload;

                                that = 0;
                                canvas = 0;
                            });
                        } else {
                            AnnotationApplication.DownloadAnnotationController.canvasesComplete++;
                            Loading_OL.updateDescription(VIEW_RESOURCES.Resource.ExportingPage + " " + (AnnotationApplication.DownloadAnnotationController.canvasesComplete) + " " + VIEW_RESOURCES.Resource.Of + " " + pagesTotal);
                            var readyForDownload = false;
                            if (AnnotationApplication.DownloadAnnotationController.canvasesComplete >= pagesTotal) {
                                readyForDownload = true;
                            }
                            AnnotationApplication.DownloadAnnotationController.readyForDownload = readyForDownload;
                        }
                        //Loading_OL.updateDescription(VIEW_RESOURCES.Resource.ExportingPage + " " + (AnnotationApplication.DownloadAnnotationController.canvasesComplete) + " " + VIEW_RESOURCES.Resource.Of + " " + pagesTotal);
                        //var readyForDownload = false;
                        //if (AnnotationApplication.DownloadAnnotationController.canvasesComplete >= pagesTotal) {
                        //    readyForDownload = true;
                        //}
                        //AnnotationApplication.DownloadAnnotationController.readyForDownload = readyForDownload;
                    }
                });

                //this.count++;
                processed++;

                if (processed >= 10) {
                    this.count++;
                    console.log("ten proccesed. breaking execution. waiting for ajax to complete.");
                    $(document).ajaxStop(function () {
                        console.log("ajax complete, starting next 10");
                        that.initializeDownloadableCanvases();
                    });
                    break;
                }              

            }
        },

        downloadWhenComplete: function () {
            var that = this;
            if ($.active > 0 || !AnnotationApplication.DownloadAnnotationController.readyForDownload) {

                setTimeout(function () {
                    that.downloadWhenComplete();
                }, 500);

            } else {
                Loading_OL.updateDescription(VIEW_RESOURCES.Resource.ExportComplete + ". " + VIEW_RESOURCES.Resource.ProcessingFile + ".");
                AnnotationApplication.DownloadAnnotationController.download();
                PDFViewerApplication.pdfViewer.currentScaleValue = this.tempScaleValue;
                return;
            }
        },
*/
        uploadCanvasImage: function DownloadAnnotationController_uploadCanvasImage(canvasId, img) {
            $.ajax({
                type: 'POST',
                url: '/Document/CanvasImage',
                //cache: false,
                data: {
                    DocumentVersionExternalId: AnnotationApplication.documentVersionId,
                    CanvasId: canvasId,
                    ImageData: img,
                    Context: "DOCUMENT"
                },
                async: false,
                success: function (response) {
                    console.log(response);
                }
            })
        },

        download: function DownloadAnnotationController_download() {
            //console.log("image deferred complete");
            var that = this;
            var docId = AnnotationApplication.documentVersionId;
            var projId = AnnotationApplication.projectId;
            var url = "/Document/PdfWithAnnotations?DocumentVersionId=" + docId + "&DocumentId=" + AnnotationApplication.documentId + "&ProjectId=" + projId;

            var a = document.createElement('a');
            var ifr = document.createElement('iframe');
            var docHelper = new DocumentHelper();


            if (ifr) {
                ifr.src = url;
                var pagesTotal = PDFViewerApplication.pagesCount;
                var modifier = pagesTotal < 50 ? 250 : 350;
                ifr.load = (function () {
                    //console.log(pagesTotal);
                    setTimeout(function () {
                        Loading_OL.stopGenericLoadingScreen(AnnotationApplication.LoadingOverlayProcID);
                        console.log("/Document/PdfWithAnnotations");
                        setTimeout(function () {
                            $.ajax({
                                type: "GET",
                                url: "/Document/DownloadWithAnnotationsComplete",
                                data: {
                                    code: that.token
                                },
                                success: function (response) {
                                    //console.log(response);                                    
                                }
                            });
                        }, 10000);

                    }, pagesTotal * modifier);
                })();
                document.getElementById('iframeDownloadContainer').appendChild(ifr);
            } else if (a.click) {
                // If a.click is available on the browser, 
                // create an anchor element with a download attribute
                // then simulate a click
                a.href = url;
                a.target = '_parent';
                // Add download attribute if available
                // this ensures the file will be downloaded
                if ('download' in a) {
                    a.download = "CMACS File Download";
                }
                // IE and some FF versions require the <a> to be in the document
                (document.body || document.documentElement).appendChild(a);
                // Simulate the click
                a.click();
                // Remove the download link 
                a.parentNode.removeChild(a);
                Loading_OL.stopGenericLoadingScreen(AnnotationApplication.LoadingOverlayProcID);
            } else {
                // Otherwise, fallback and open the url in a new window
                // which will automatically download the file
                // Note: This may trigger a popup blocker
                window.open(url);
                Loading_OL.stopGenericLoadingScreen(AnnotationApplication.LoadingOverlayProcID);
            }
            AnnotationApplication.downloadInProgress = false;
            AnnotationApplication.DownloadAnnotationController = 0;
            AnnotationApplication.DownloadAnnotationController = new DownloadAnnotationController();
        },

    };

    return DownloadAnnotationController;

})();

//var DownloadAnnotationController = (function DownloadAnnotationControllerClosure() {

//    function DownloadAnnotationController() {
//        this.annotationCanvases = [];
//        this.canvasDeffereds = [];
//        this.imageDeffereds = [];
//    };

//    DownloadAnnotationController.prototype = {

//        constructor: DownloadAnnotationController,

//        initializeDownloadableCanvases: function DownloadAnnotationController_initializeDownloadableCanvases(settings) {

//            var that = this;
//            var pagesTotal = PDFViewerApplication.pagesCount;
//            for (var i = 0; i < pagesTotal; i++) {
//                var pageNumber = i + 1;
//                this.canvasDeffereds.push($.ajax({
//                    type: 'GET',
//                    url: '/Annotation/GetAnnotations',
//                    cache: false,
//                    pageNumber: pageNumber,
//                    data: {
//                        DocumentVersionId: AnnotationApplication.documentVersionId,
//                        CanvasId: pageNumber,
//                        Context: "DOCUMENT"
//                    },
//                    async: true,
//                    success: function (response) {
//                        that.annotationCanvases.push(new DownloadableAnnotationCanvas().generateCanvas(response, this.pageNumber));
//                    }
//                }));
//            }

//            $.when.apply(null, this.canvasDeffereds).done(function () {
//                console.log("canvas deferred complete");
//                // Set a 5 second timeout to ensure canvases are done rendering before exporting
//                setTimeout(function () {
//                    that.download();
//                }, 5000);
//            });

//        },

//        download: function DownloadAnnotationController_download() {
//            var that = this;

//            $("#iframeDownloadContainer").empty();

//            for (var i in this.annotationCanvases) {
//                var canvas = this.annotationCanvases[i];
//                var img = canvas.toDataURL('png');
//                var canvasId = canvas.lowerCanvasEl.id.split('_')[1];

//                this.imageDeffereds.push($.ajax({
//                    type: 'POST',
//                    url: '/Document/CanvasImage',
//                    cache: false,
//                    data: {
//                        DocumentVersionExternalId: AnnotationApplication.documentVersionId,
//                        CanvasId: canvasId,
//                        ImageData: img,
//                        Context: "DOCUMENT"
//                    },
//                    async: true,
//                    success: function (response) {
//                        console.log(response);
//                    }
//                }));
//            }

//            console.log("continuing...")

//            $.when.apply(null, this.imageDeffereds).done(function () {

//                console.log("image deferred complete");

//                var docId = AnnotationApplication.documentVersionId;
//                var projId = AnnotationApplication.projectId;
//                var url = "/Document/PdfWithAnnotations?DocumentVersionExternalId=" + docId + "&ProjectId=" + projId;

//                var a = document.createElement('a');
//                var ifr = document.createElement('iframe');
//                var docHelper = new DocumentHelper();


//                if (ifr) {
//                    ifr.src = url;
//                    var pagesTotal = PDFViewerApplication.pagesCount;
//                    var modifier = pagesTotal < 100 ? 100 : 150;
//                    ifr.load = (function () {
//                        console.log(pagesTotal);
//                        setTimeout(function () {
//                            Loading_OL.stopGenericLoadingScreen(AnnotationApplication.LoadingOverlayProcID);
//                        }, pagesTotal * modifier);
//                    })();
//                    document.getElementById('iframeDownloadContainer').appendChild(ifr);
//                } else if (a.click) {
//                    // If a.click is available on the browser, 
//                    // create an anchor element with a download attribute
//                    // then simulate a click
//                    a.href = url;
//                    a.target = '_parent';
//                    // Add download attribute if available
//                    // this ensures the file will be downloaded
//                    if ('download' in a) {
//                        a.download = "CMACS File Download";
//                    }
//                    // IE and some FF versions require the <a> to be in the document
//                    (document.body || document.documentElement).appendChild(a);
//                    // Simulate the click
//                    a.click();
//                    // Remove the download link 
//                    a.parentNode.removeChild(a);
//                    Loading_OL.stopGenericLoadingScreen(AnnotationApplication.LoadingOverlayProcID);
//                } else {
//                    // Otherwise, fallback and open the url in a new window
//                    // which will automatically download the file
//                    // Note: This may trigger a popup blocker
//                    window.open(url);
//                    Loading_OL.stopGenericLoadingScreen(AnnotationApplication.LoadingOverlayProcID);
//                }

//                $("#annotationDownloadContainer").empty();
//                that.annotationCanvases = [];
//                that.canvasDeffereds = [];
//                that.imageDeffereds = []
//            });

//        },
//    };

//    return DownloadAnnotationController;

//})();
