var RightSidebarController = (function RightSidebarControllerClosure() {
    function RightSidebarController() {
        this.addCommentBtn = $("#commentAdd");
        this.rightSideBar = $("#rightSideBar");
        this.commentContainer = $("#commentContainer");
        this.mainContainer = $("#mainContainer");
        this.viewerContainer = $("#viewerContainer");
        this.rightSideBarAppendContainer = $("#rightSideBarAppendContainer");
        this.commentMinimizeButton = $("#commentMinimizeButton");
        this.commentMaximizeButton = $("#commentMaximizeButton");
        this.annotationListContainer = $("#annotationListContainer");
        this.existingSidebar = [];
        this.lastDocumentAnnotationId = null;
        this.isSidebarOpen = false;
        this.commentControllers = [];
        this.activeAnnotation;
        this.canvas;
    };

    RightSidebarController.prototype = {

        constructor: RightSidebarController,

        openSidebarUtil: function RightSidebarController_openSidebarUtilTools() {
            this.isSidebarOpen = true;
            this.mainContainer.css({
                "right": "320px"
            });
            //if (AnnotationApplication.viewerType === "DOCUMENT") {
                this.rightSideBar.css({
                    "right": "0px",
                    "display": "initial"
                });
            //}
            //this.rightSideBar.removeClass('hidden');
            //if(loadedModule !== "EMS")AnnotationApplication.Toolbar.widget.toggle('#TwoDSettingsButton', true);

        },
        closeSidebarUtil: function RightSidebarController_closeSidebarUtil() {
            this.isSidebarOpen = false;
            this.mainContainer.css({
                "right": "0px"
            });
            //if (AnnotationApplication.viewerType === "DOCUMENT") {
                this.rightSideBar.css({
                    "right": "-320px",
                    "display": "none"
                });
            //}
            //this.rightSideBar.addClass("hidden");
            //if($("#TwoDSettingsButton").length>0)AnnotationApplication.Toolbar.widget.toggle('#TwoDSettingsButton', false);
        },

        setEmsSidebarCss: function RightSidebarController_openTools(canvas, canvasId, annotation) {
            var viewerHeight = this.viewerContainer[0].clientHeight;
            this.rightSideBar.css({
                "height": (viewerHeight + 50) + "px"
            });
        },

        closeAndEmptySidebar: function () {
            //if(loadedModule !== "EMS"){
                this.closeSidebarUtil();
                this.lastDocumentAnnotationId = null;
            //}
            
        },

        openSidebar: function RightSidebarController_openSidebar(canvas, pageNumber, annotation) {
            try {
                //annotation = annotation.length ? annotation[0] : annotation;

                if (this.lastDocumentAnnotationId !== annotation.annotationId) {
                    this.rightSideBarAppendContainer.empty();
                }
                if (annotation.annotationId !== null) {//&& this.lastDocumentAnnotationId !== annotation.DocumentAnnotationId
                    this.canvas = canvas;
                    this.lastDocumentAnnotationId = annotation.annotationId;
                    this.activeAnnotation = annotation;
                    this.rightSideBarAppendContainer.empty();
                    this.rightSideBarAppendContainer.append(new RightSidebarTemplate(this.canvas, pageNumber, this.activeAnnotation));

                    if (AnnotationApplication.viewerType === "EMS") {
                        this.setEmsSidebarCss();
                    }

                    this.openSidebarUtil();
                }
            } catch (ex) {
                console.log("Unable to open the property tool", annotation);
            }
        },

        openSidebarIfClosed: function RightSidebarController_openSidebarIfClosedr() {
            if (!AnnotationApplication.RightSidebarController.isSidebarOpen) {
                AnnotationApplication.RightSidebarController.openSidebarUtil();
            }
        },

        getActiveAnnotation: function RightSidebarController_getActiveAnnotation(canvas, annotation) {
            return this.activeAnnotation;
        },

        sidebarOpen: function RightSidebarController_sidebarOpen() {
            return this.isSidebarOpen;
        },

        isAnnotationListContainerOpen: function RightSidebarController_isAnnotationListContainerOpen() {
            if ($("#annotationListContainer").length > 0) {
                return true;
            } else {
                return false;
            }
        },

        createSidebar: function RightSidebarController_createSidebar() {
            this.rightSidebarTemplate.clone
        },

        sidebarExists: function RightSidebarController_sidebarExists(id) {
            for (var i = 0; i < this.existingSidebar.length; i++) {
                if (this.existingSidebar[i] === id) {
                    return true;
                }
            }
            this.existingSidebar.push(id);
            return false;
        },

        closeSidebar: function RightSidebarController_closeSidebar(canvas) {
            //console.trace();
            //if (typeof (canvas) !== "undefined") {
            //    canvas.deactivateAll();
            //}
            //this.rightSideBarAppendContainer.empty();
            //this.lastDocumentAnnotationId = null;            
            this.closeSidebarUtil();
        },

        noAnnotationSelectedNotice: function () {
            var msg = '<div class="annotationListActive" style="width:300px;">'
                + '<h3 style="text-align: center">' + GetResourceString('NoItems') +'</h3>'
                    + '</div>';

            this.rightSideBarAppendContainer.empty();
            this.rightSideBarAppendContainer.append(msg);
        },

        showAnnotationList: function RightSidebarController_showAnnotationList() {
            // hide rotation buttons
            $("#rotateCcw").addClass("hidden");
            $("#rotateCw").addClass("hidden");


            if (typeof (this.canvas) !== "undefined") {
                //AnnotationApplication.CanvasController.setAnnotationEditMode(this.canvas, false);
            }
            $("#annotationListView").empty();
            $("#annotationListView").removeClass("hidden").append(new AnnotationList(false));
            $("#thumbnailView, #outlineView, #attachmentsView").addClass("hidden");
            $("#sidebarContent").addClass("sidebarContentAnnotationList");
            if (!$("#outerContainer").hasClass("sidebarOpen")) {
                $("#sidebarToggle").click();
            }

            $('#viewThumbnail').removeClass('toggled');
            $('#viewOutline').removeClass('toggled');
            $('#viewAnnotationHistoryList').removeClass('toggled');
            $('.annotationListTabsExport').addClass("hidden");
            $('#viewAnnotationList').addClass('toggled');

            //$("#annotationListView").addClass("hidden")
            //this.rightSideBarAppendContainer.append(new AnnotationList());

            //this.lastDocumentAnnotationId = null;
            //this.rightSideBarAppendContainer.empty();
            //if (AnnotationApplication.viewerType === "EMS") {
            //    this.setEmsSidebarCss();
            //}
            //this.openSidebarUtil();
        },

        showAnnotationHistoryList: function RightSidebarController_showAnnotationList() {
            // hide rotation buttons
            $("#rotateCcw").addClass("hidden");
            $("#rotateCw").addClass("hidden");

            $("#annotationListView").empty();
            $("#annotationListView").removeClass("hidden").append(new AnnotationList(true));

            $("#thumbnailView, #outlineView, #attachmentsView").addClass("hidden");
            $("#sidebarContent").addClass("sidebarContentAnnotationList");
            if (!$("#outerContainer").hasClass("sidebarOpen")) {
                $("#sidebarToggle").click();
            }

            $('#viewThumbnail').removeClass('toggled');
            $('#viewOutline').removeClass('toggled');
            $('#viewAnnotationList').removeClass('toggled');
            $('.annotationListTabsExport').removeClass("hidden");
            $('#viewAnnotationHistoryList').addClass('toggled');

            //$("#annotationListView").addClass("hidden")
            //this.rightSideBarAppendContainer.append(new AnnotationList());

            //this.lastDocumentAnnotationId = null;
            //this.rightSideBarAppendContainer.empty();
            //if (AnnotationApplication.viewerType === "EMS") {
            //    this.setEmsSidebarCss();
            //}
            //this.openSidebarUtil();
        },

        rotateSidebarCcw: function (selectedThumbnails) { // CCW
            //var selectedThumbnails = this.getSelectedThumbnails();
            PDFViewerApplication.toolbar.setPageRotationCcw(selectedThumbnails);
        },

        rotateSidebarCw: function (selectedThumbnails) { // CW
            //var selectedThumbnails = this.getSelectedThumbnails();
            PDFViewerApplication.toolbar.setPageRotationCw(selectedThumbnails);
        },

        rotateAllCcw: function(selectedThumbnails){
            // var selectedThumbnails = this.selectAllThumbnails();
            // PDFViewerApplication.toolbar.setPageRotationCcw(selectedThumbnails);
            
            
            // var p = PDFViewerApplication.pdfViewer.getPageView(pageNumber - 1);
            // p.forceRendering();

            // var visibleViews = PDFViewerApplication.pdfViewer._getVisiblePages().views; 
            // visibleViews.forEach(view => {
            //     //PDFViewerApplication.pdfViewer.getPageView(pageNumber)
            //     PDFViewerApplication.pdfViewer.renderingQueue.renderView(view);
            // });


           // var selectedThumbnails = this.selectAllThumbnails();
            PDFViewerApplication.toolbar.setPageRotationCcw(selectedThumbnails);
            
        },

        rotateAllCw: function(selectedThumbnails){
            //var selectedThumbnails = this.selectAllThumbnails();
            PDFViewerApplication.toolbar.setPageRotationCw(selectedThumbnails);
        },

        getSelectedThumbnails: function () {
            var selectedPages = [];
            var selectedThumbs = $('.thumbnail.selected');
            for(var i=0; i< selectedThumbs.length; i++){
                var pageNumber = null;
                if (selectedThumbs[i]) {
                    pageNumber = parseInt(selectedThumbs[i].getAttribute("data-page-number"));
                    selectedPages.push(pageNumber);
                    selectedThumbs[i].classList.remove('selected');
                }
                var thumbnail = document.querySelector('div.thumbnail[data-page-number="' + pageNumber + '"]');
                if (thumbnail) {
                    thumbnail.classList.add('selected');
                }
            }
            return selectedPages;
        },

        selectAllThumbnails: function () {
            var totalPages = PDFViewerApplication.pagesCount;
            var selectedPages = [];
            for(var i=1; i<totalPages+1; i++){
                selectedPages.push(i);
            }
            return selectedPages;
        },



    };

    return RightSidebarController;
})();