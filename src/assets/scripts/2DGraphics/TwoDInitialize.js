//var AnnotationApplication = {};

var initializeAnnotations = function () {
    
    var agent = window.navigator.userAgent;
    var isMobileTablet = agent.match(/iPad|iPhone|Android|Mobile|Tablet|Phone/);
    var screenWidth = document.documentElement.clientWidth;
    console.log(isMobileTablet);

    //document.documentElement.appendChild("<h1>" + screenWidth + "</h1>")
    // Toggle Touch Scrolling buttons if mobile or tablet
    if (isMobileTablet) {
        $("#scroll-mode-off-secondary").removeClass("hidden");
        $("#toggleHandTool").addClass("hidden");
    }

    //// Set zoom according to sreen size
    // if (screenWidth < 860 && screenWidth > 779) {
    //    PDFViewerApplication.pdfViewer.currentScaleValue = .9;
    //}
    //else if (screenWidth < 780 && screenWidth > 694) {
    //    PDFViewerApplication.pdfViewer.currentScaleValue = .8;
    //}
    //else if (screenWidth < 695 && screenWidth > 614) {
    //    PDFViewerApplication.pdfViewer.currentScaleValue = .7;
    //}
    //else if (screenWidth < 615 && screenWidth > 539) {
    //    PDFViewerApplication.pdfViewer.currentScaleValue = .6;
    //}
    //else if (screenWidth < 540 && screenWidth > 449) {
    //    PDFViewerApplication.pdfViewer.currentScaleValue = .5;
    //}
    //else if (screenWidth < 450 && screenWidth > 364) {
    //    PDFViewerApplication.pdfViewer.currentScaleValue = .4;
    //}
    //else if (screenWidth < 365 && screenWidth > 284) {
    //    PDFViewerApplication.pdfViewer.currentScaleValue = .3;
    //}
    //else if (screenWidth < 285) {
    //    PDFViewerApplication.pdfViewer.currentScaleValue = .25;
    //}
    
    var measurementScale;
    var defaultScale = measurementScale = {
        "FromValue": "1",
        "FromUnit": "in",
        "ToValue": "1",
        "ToUnit": "ft",
        "PixelValue": "0",
        "DisplayValue": null,
    };
    
    if (loadedModule === "DOCUMENT" && DocumentScale !== "") {
        var regex = new RegExp("&quot;", 'g');
        DocumentScale = measurementScale = JSON.parse(DocumentScale.replace(regex, "\""));
        //console.log(DocumentScale);
    }
    


    AnnotationApplication = {
        // Used to determin if we're in EMS or Document
        viewerType: loadedModule,

        //viewResources: VIEW_RESOURCES,

        // Used to determein mTool's measurement scale
        documentScale: measurementScale,
        //documentScale: DocumentScale !== null ? JSON.parse(DocumentScale) : defaultScale,
        
        // External ID of document Version
        // Set by viewbag in /Views/document/PDFViewer.cshtml
        documentId: documentExternalId,

        // // External ID of document Version
        // // Set by viewbag in /Views/document/PDFViewer.cshtml
         documentVersionId: documentExternalId,

        // // External ID of project
        // // Set by viewbag in /Views/document/PDFViewer.cshtml
         projectId: ProjectId,

        // Canvas the scroll to annotation lives on
        // Set by viewbag in PDFViewer.cshtml if coming here from clicking on an annotation task
        // or set by the user when clicking an annotation from the list
        // rein: will be overwritten by iframe container
        scrollAnnotationCanvasId: 1,

        // Id of the annotation the user wants to scroll to
        // Set by viewbag in PDFViewer.cshtml if coming here from clicking on an annotation task
        // or set by the user when clicking an annotation from the list
        // rein: will be overwritten by iframe container
        scrollAnnotationId: null,

        // User agent of user's device
        agent: agent,

        // Boolean - true if user is on a mobile device or tablet
        isMobileTablet: window.IsMobileDevice,

        // Pixel width of user's display
        screenWidth: screenWidth,

        // Keeps track FabricJS canvases
        canvases: [],

        // The URL PDF.js uses to load the document into the viewer
        DEFAULT_URL: null,

        FALLBACK_URL: "/Content/PDF/_Blank.pdf",

        emsFirstRun: true,

        downloadInProgress: false,

        // In EMS, this is the id of the drawing node
        // We need this Id in order to load the drawings into the scrolling tabs
        drawingNodeExternalId: null,

        loadingOverlayName: AnnotationApplication.loadingOverlayName,
        downloadOverlayName: "annotationDownload",
        LoadingOverlayProcID: typeof (AnnotationApplication.LoadingOverlayProcID) !== "undefined" ? AnnotationApplication.LoadingOverlayProcID : null,

        DrawStateService: new DrawStateService(),
        // Toolbar: new TwoDToolbar(),
        //RenderDrawState: new RenderDrawState(),
        CRUDController: new CRUDController(),
        CanvasController: new CanvasController(),
        //CalloutUtils: new CalloutUtils(),
        //CalloutReconstructor: new CalloutReconstructor(),
        RightSidebarController: new RightSidebarController(),
        Utils: new TwoDUtils(),
        AnnotationAjaxService: new AnnotationAjaxService(),
        ImageUploadController: new ImageUploadController(),
        DownloadAnnotationController: new DownloadAnnotationController(),
        //MeasurementUtils: new MeasurementUtils(),
        //CopyPaste: new CopyPaste()
    };

    //AnnotationApplication.Utils.disableAll();
    //AnnotationApplication.Utils.enableAll();
    AnnotationApplication.AnnotationAjaxService.ajaxStop();

    var viewerContainer = document.getElementById("viewer");
    viewerContainer.oncontextmenu = function (e) {
        return false;
    }

    $('canvas').bind('contextmenu', function (e) {
        return false;
    });

    //window.onContextMenu = function () {
    //    return false;
    //}

    //console.log(PDFViewerApplication.pdfViewer);
}

//initializeAnnotations();

//Loading_OL.stopGenericLoadingScreen(uuid);
//AnnotationApplication.downloadOverlayName