var ScrollingTabs = (function () {

    function ScrollingTabs(projectId, drawingsId, resource) {

        //this.ScrollingTabs = $("#ScrollingTabs");
        this.ProjectId = projectId;
        this.viewerInitialized = false;
        this.toolbarInitialized = false;
        this.docId = '';
        this.nodeId = drawingsId;
        this.files = {};
        this.resource = resource;
        this.twoDDocumentArray = [];
        this.openDocument;
        this.versionList;
        this.docHelper;
        //this.firstLoad = true;
        this.drawings = {
            current: null,
            iframes:{}
        };
    }

    ScrollingTabs.prototype = {
        constructor: ScrollingTabs,

        loadDocumentsIntoScrollingTabs: function (nodeId, docId, successCallback) {
            this.docHelper = new DocumentHelper();
            var successCallback = successCallback;
            if (typeof nodeId === "undefined") {
                nodeId = ScrlTabs.nodeId;
            } else {
                ScrlTabs.nodeId = nodeId;
            }
            if (typeof docId === "undefined") {
                docId = ScrlTabs.docId;
            }

            var model = {
                ProjectId: this.ProjectId,
                EMSNodeId: nodeId,
            };

            var success = function (_documents) {
                if (!ScrlTabs.toolbarInitialized) {
                    $("#ScrollingTabs").kendoMenu({
                        scrollable: true,
                        orientation: "horizontal"
                    });
                    ScrlTabs.toolbarInitialized = true;
                }
                ScrlTabs.updateDropdown(_documents, docId);
                if (typeof successCallback !== "undefined") { successCallback(); }
                

            };

            emsNode_Ops.getDocumentList(model, success);


        },

        deselectAllButtons: function (id) {
            if (typeof (id) !== 'undefined') {
                var menu = $("#ScrollingTabs").data("kendoMenu");
                // open the sub menu of "Item1"
                //menu.open(id);
                ScrlTabs.setActive($(id))
            }

        },

        setActive: function setActive(element) {
            $(".emsTabActive").removeClass("emsTabActive");
            element.addClass("emsTabActive");
        },

        clear2DButtons: function () {
            this.twoDDocumentArray = [];
            for (var i in ScrlTabs.files) {
                var file = ScrlTabs.files[i];
                id = "#docTab_" + file.DocumentId;
                $("#ScrollingTabs").data("kendoMenu").remove(id);
                $(id).remove();
            }
            ScrlTabs.files = {};
        },

        updateDropdown: function (response, docId) {
            var that = this;
            // response.forEach(resp => {
            //     if($("#iframe_"+resp.DocumentId).length === 0){
            //         $("#iframeContainer").prepend(
            //             `<button class="tablink" onclick="openPage('`+resp.DocumentId+`', this, 'yellow')"><b>`+resp.Name +`</b>`+ resp.Extensions[0]+`</button>`
            //         );
        
            //         // $("#iframeContainer").append(
        
            //         //     `<div id="iframe_`+resp.DocumentId+`" class="tabcontent" style="height:100%">
            //         //         <iframe src="`+window.location.origin+`/Document/DocumentViewer?docId=`+resp.DocumentId+`&projectExtId=`+ProjectId+`" height="100%" width="100%"></iframe>
            //         //     </div>`
                        
            //         //     // `<iframe src="http://localhost:52421/Document/DocumentViewer?docId=ec4713f4-7094-48c0-89dc-b14e4ba3e830&projectExtId=09085efa-a784-4301-a302-17d4faa6554b" height="100%" width="100%"></iframe>`
            //         // );
            //     }
            // });
            


            console.log("updating scrolingtabs");
            ScrlTabs.clear2DButtons();
            ScrlTabs.files = response.filter(doc => doc.Extensions.some(ext => ext.toUpperCase() === ".PDF"));//(response.Data);
            if (ScrlTabs.files.filter(e => e.DocumentId === docId).length === 0) {
                ScrlTabs.docId = '';
                docId = '';
            }
            this.twoDDocumentArray = ScrlTabs.files;
            NoTabs = Object.keys(ScrlTabs.files).length;
            
            if (NoTabs <= 0) {
                if ($("#CASTViewer").length) {
                    $("#CASTViewer").children()[0].click();
                }
                else if (!$("#2DView").hasClass("hidden")) {
                    //AnnotationApplication.Utils.loadBlankDocument();
                    this.closeAllViewers();
                }
                //return;
            }
            
            for (var i = 0; i < NoTabs; i++) {
                var file = ScrlTabs.files[i];

                //var name = file.Name.split(".");
                //name.pop();
                //name = name.join(".");
                var id = "docTab_" + file.DocumentId;
                //var onclick = "function(){ScrlTabs.handleScrollingTabclick('" + file.DocumentVersionlId + "')}"
                $("#ScrollingTabs").data("kendoMenu").append({
                    //type: "button",
                    text: ScrlTabs.files[i].Name + ScrlTabs.files[i].Extensions[0],
                    //id: id,
                    cssClass: "ScrolingTabButton docTab",
                    attr: {
                        id: id,
                        pdfstatus: file.Extensions.some(function (f) { return ScrlTabs.docHelper.matchSupportedPDFExtensions(f, ScrlTabs.docHelper); }),
                        extension: ".pdf"
                    },
                    // select: function(e){
                    //     var docId = $(e.target).closest("li").attr("id").split('_')[1];
                    //     openPage(docId);
                    // }
                    select: ScrlTabs.handleScrollingTabclick,
                    //togglable: true
                });
                //$('#' + id).on('click', ScrlTabs.handleScrollingTabclick);

            }
            
            selected = $('#docTab_' + docId)
            if (typeof (docId) !== "undefined" && docId !== null && selected.length > 0) {
                $('#docTab_' + docId).children()[0].click();
                //ScrlTabs.firstLoad = false;
            }
            else if (ScrlTabs.files.length > 0 && $("#3DView").hasClass("hidden")) {


                var valid2DViewerExtension = null;
                var count = ScrlTabs.files.length - 1;

                for (var i = count; i >= 0; i--) {
                    valid2DViewerExtension = ScrlTabs.files[i].Extensions.some(function (f) { return ScrlTabs.docHelper.matchSupportedPDFExtensions(f, ScrlTabs.docHelper); });
                    if (valid2DViewerExtension) {
                        //if (!ScrlTabs.firstLoad) {
                        var tabId = "#docTab_" + ScrlTabs.files[i].DocumentId;
                        $(tabId).children()[0].click();
                        //} else {
                        //    ScrlTabs.firstLoad = false;
                        //}
                        break;
                    }
                    else {
                        continue;
                    }
                }

                // in case of a 3d view being open do nothing, leaving us the case withouth 2d or 3d files:   
            } else if (!($("#3DView").hasClass("hidden"))) {
                $(".sbim0d").removeClass("hidden");
                $("#2DView").addClass("hidden");
                //ScrlTabs.firstLoad = false;
            }
            $('#horizontal').resize()
            $('#ScrollingTabs').data('kendoMenu').resize(true)
        },

        handleScrollingTabclick: function (e) {
            if (typeof AnnotationApplication.lock !== "undefined" && AnnotationApplication.lock == true) {
                console.log("pdf rendering in progress!");
            } else {
                //var processOverlayId = Loading_OL.startGenericLoadingScreenWithDelay("handleScrollingTabclick");
                //Loading_OL.startGenericLoadingScreenWithDelay(AnnotationApplication.loadingOverlayName, null);
                var tab = $(e.target[0]).closest('li');
                var pdfStatus = tab.attr("pdfstatus");
                var extension = tab.attr("extension");
                var externalId = $(e.target).closest('li').attr("id").replace("docTab_", "");
                var file = ScrlTabs.files.find(function (document) {
                    return document.DocumentId == externalId;
                });
                if (typeof file === 'undefined') {
                    return;
                }
                var versionExternalId = file.DocumentVersionId;

                ScrlTabs.ScrollingTabOpen(externalId, versionExternalId, extension, pdfStatus);

            }
        },

        ScrollingTabOpen: function (externalId, versionExternalId, extension, pdfStatus, processOverlayId) {

            $('#annotationListView').addClass('hidden');
            var valid2dExtension = ScrlTabs.docHelper.matchAny2DViewerExtension(extension);
            if (pdfStatus !== "false" && valid2dExtension) {

                if ("#docTab_" + externalId != ScrlTabs.docId || versionExternalId != AnnotationApplication.documentVersionId) { //an actual update!
                    AnnotationApplication.documentId = externalId;
                    ScrlTabs.deselectAllButtons("#docTab_" + externalId);
                    ScrlTabs.showDocViewer("#docTab_" + externalId);

                    if (versionExternalId != AnnotationApplication.documentVersionId) {
                        ScrlTabs.openFile2DViewer(externalId, versionExternalId, null, null, extension);

                        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
                            navigateToPane.NavigateToPane("right-pane", $('#vertical').data('kendoSplitter'));
                        }
                    }
                    ScrlTabs.docId = "#docTab_" + externalId;
                }
            }
            else {
                TreeView_L.AppendLogMessage(ScrlTabs.resource.FileFormatNotSupported, 'danger');
            }

            //Loading_OL.stopGenericLoadingScreen(processOverlayId);
        },

        showCastViewer: function (suppressLoad) {
            var processOverlayId = Loading_OL.startGenericLoadingScreenWithDelay("handleScrollingTabclick");
            AnnotationApplication.lock = false;
            Loading_OL.stopGenericLoadingScreenByName('2d-document-overlay');

            if (!ScrlTabs.toolbarInitialized) {
                $("#ScrollingTabs").kendoMenu({
                    scrollable: true,
                    orientation: "horizontal"
                });
                ScrlTabs.toolbarInitialized = true;
            }

            if ($("#CASTViewer").length == 0) {
                var name = TreeView_L.Resource.CastViewer;
                var id = "CASTViewer";
                if (ScrlTabs.files.length > 0) {
                    $("#ScrollingTabs").data("kendoMenu").insertBefore([{
                        text: name,
                        cssClass: "ScrolingTabButton",
                        attr: { id: id }
                    }],
                        "li:first-child");
                } else {
                    $("#ScrollingTabs").data("kendoMenu").append([{
                        text: name,
                        cssClass: "ScrolingTabButton",
                        attr: { id: id }
                    }]);
                }

                button = $('#' + id)
                $(button).addClass("ScrolingTabButton")
                $(button).on('click', ScrlTabs.showCastViewer)
                $(document).ready(function () {
                    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
                        $('#SettingsButton').tooltip('destroy');
                    }
                    else {
                        $('#SettingsButton').tooltip({
                            trigger: 'hover',
                            container: 'body'
                        });
                        $('#SettingsButton').on('click', function () {
                            $(this).blur();
                        });
                    }
                });
                //button.parent().prepend(button);

                //overflowbutton = $('#' + id + '_overflow')
                //$(overflowbutton).addClass("ScrolingTabButton")
                //$(overflowbutton).on('click', ScrlTabs.showCastViewer)
                //overflowbutton.parent().prepend(overflowbutton);
            }

            if (suppressLoad == true) {
                $("#3DView").click();
            } else {
                ScrlTabs.docId = "#CASTViewer";
                if ($("#3DView").hasClass("hidden")) {
                    $(".sbim0d").addClass("hidden");
                    $("#2DView").addClass("hidden");
                    $("#3DView").removeClass("hidden");
                    //$("#CASTViewer").click();
                    //$("#vertical").trigger("resize");
                    navigateToPane.tryLoadThreeD();
                }


                Three.DocumentEventHandler.onResizeContainer();
                ScrlTabs.deselectAllButtons("#CASTViewer");
                //ThreeD_VL.onLoading3DmodelComplete();
                ScrlTabs.addVersionDropdown("3DView", Three.DocumentId, Three.DocumentVersionId);
                ScrlTabs.refreshStatusFilterDropdown("3DView");

                if (typeof Three.DocumentVersionId !== "undefined" && Three.DocumentVersionId != null) {
                    FileOperationLogic.getDocumentVersionObject(
                        Three.DocumentVersionId,
                        function (Document) { ScrlTabs.openDocument = Document; },
                        function (e) { }
                    );
                }
            }
            Loading_OL.stopGenericLoadingScreen(processOverlayId);
        },

        closeCastViewer: function closeCastViewer() {
            var checkTabs = false;
            if (!($("#3DView").hasClass("hidden"))) {
                checkTabs = true;
                $("#3DView").addClass("hidden");
            }
            ScrlTabs.removeCastViewerTab();
            if (checkTabs) {
                ScrlTabs.checkFileTabsExist();
            }
        },

        removeCastViewerTab: function () {
            if (typeof ($("#ScrollingTabs").data("kendoMenu")) != "undefined") {
                $("#ScrollingTabs").data("kendoMenu").remove('#CASTViewer');
            }
            var cadViewerButton = $('#CADViewerButton');
            if (cadViewerButton.length > 0) {
                $("#ScrollingTabs").data("kendoMenu").remove('#CADViewer');
            }
        },

        checkFileTabsExist: function () {
            if (ScrlTabs.files.length == 0) { // there are no other documents            
                $(".sbim0d").removeClass("hidden");
            }
            else { //click on the first non-hidden item
                $("#docTab_" + ScrlTabs.files[(ScrlTabs.files.length - 1)].DocumentId).children()[0].click();
            }
        },

        showDocViewer: function () {
            $("#3DView").addClass("hidden");
            $(".sbim0d").addClass("hidden");
            $(".sbimcutplane").addClass("hidden");
            $("#2DView").removeClass("hidden");
        },

        hideDocViewer: function () {
            $(".sbim2d").addClass("hidden");
        },

        closeAllViewers: function () {
            $(".sbim0d").removeClass("hidden");
            $(".sbim2d").addClass("hidden");
            $(".sbim3d").addClass("hidden");
            $(".sbimcutplane").addClass("hidden");
        },

        clickCutPlaneViewerButton: function () {
            ThreeD_VL.current3DModelNode._loaded = false;
            ScrlTabs.docId = 'docTab_CADViewerButton';
            AnnotationApplication.documentVersionId = null;
            var cadViewerButton = $('#' + ScrlTabs.docId);
            if (cadViewerButton.length < 1) {
                var id = "docTab_CADViewerButton";
                $("#ScrollingTabs").data("kendoMenu").insertBefore([{
                    text: (CutPlaneSection.dataItem.Name),
                    cssClass: "ScrolingTabButton",
                    attr: { id: id }
                }],
                    "li:first-child");
            }

            button = $('#' + id)
            $(button).addClass("ScrolingTabButton");
            $(button).on('click', ScrlTabs.showCutPlaneViewer);
            $(document).ready(function () {
                $('#SettingsButton').tooltip({
                    trigger: 'hover',
                    container: 'body'
                });
                $('#SettingsButton').on('click', function () {
                    $(this).blur();
                });
            });

            this.showCutPlaneViewer();
            this.loadCutPlanViewer();
        },

        showCutPlaneViewer: function () {
            ScrlTabs.docId = 'docTab_CADViewerButton';
            AnnotationApplication.documentVersionId = null;
            var cadViewerButton = $('#' + ScrlTabs.docId);
            $(".sbim0d").addClass("hidden");
            $(".sbim2d").addClass("hidden");
            //$(".sbim2d").remove();// remove this later: there is a conflict with other 
            //$("#pageContainer1").remove();
            $(".sbim3d").addClass("hidden");
            $(".sbimcutplane").removeClass("hidden");
            ScrlTabs.setActive($("#docTab_CADViewerButton"));
        },

        loadCutPlanViewer: function () {
            cadViewer.renderCutPlane(CutPlaneSection.finalArray);
        },

        hideCutPlaneViewer: function () {
            $(".sbimcutplane").addClass("hidden");
        },


        GetDocumentPagesRotation: function CRUDController_GetDocumentPagesRotation(documentVersionId, pageNumber) {
            return new Promise(function (resolve, reject) {
                if (false) { // preloaded pagesrotation
                    resolve(documentPagesRotation[pageNumber - 1]);
                } else {
                    console.log("update Page Rotation");
                    var that = this;
                    var query = "DocumentVersionId=" + documentVersionId;
                    if (pageNumber) {
                        query += ("&pageNumber=" + pageNumber);
                    }

                    $.ajax({
                        type: 'GET',
                        url: '/api/Annotation/GetDocumentPagesRotation/' + documentVersionId + '/',
                        headers: {
                            Authorization: "Bearer " + window.AuthenticationToken
                        },
                        success: function (response) {
                            resolve(response);
                        },
                        error: function (response) {
                            reject(response);
                        },
                        timeout: 4000 // sets timeout to 3 seconds
                    });
                }
            });
        },

        //waitForLoadingScreanToUnlock: function () {
        //    if (Object.keys(Loading_OL.loadingOverlayStartTimes).length == 0) {
        //        window.setTimeout(ScrlTabs.waitForLoadingScreanToUnlock, 100); /* this checks the flag every 100 milliseconds*/
        //    } else {
        //        AnnotationApplication.lock = false;
        //    }
        //},

        // shawn
        openFile2DViewer: function (docExtId, docVerExtId, annotationId, canvasId, extension) {
            var that = this;
            var docExtId = docExtId;
            var docVerExtId = docVerExtId;

            // var docId = $(e.target).closest("li").attr("id").split('_')[1];

            if (typeof docExtId === 'undefined' || docExtId == null || docExtId === "null") {
                docExtId = ScrlTabs.files.find(d => d.DocumentVersionIds.includes(docVerExtId)).DocumentId;
            }
            openPage(docExtId);
            ScrlTabs.deselectAllButtons("#docTab_" + docExtId);
return;

            if (docExtId == null) {
                docExtId = ScrlTabs.twoDDocumentArray.find(function (d) { return d.DocumentVersionId === docVerExtId; }).DocumentId;
            }
            var annotationId = annotationId;
            var canvasId = canvasId;
            var extension = extension;

            if (AnnotationApplication.documentVersionId !== null
                && LocalAnnotationsControllerLogic !== null) LocalAnnotationsControllerLogic.deleteDocument(AnnotationApplication.documentVersionId);

            var onsuccess = function (Document) {
                try {
                    that.GetDocumentPagesRotation(Document.DocumentVersionId, null).then(
                        data => {
                            documentPagesRotation = data;
                            ScrlTabs.docId = "#docTab_" + docExtId;
                            ScrlTabs.openDocument = Document;
                            AnnotationApplication.documentVersionId = Document.DocumentVersionId;
                            AnnotationApplication.documentId = Document.DocumentId;
                            FileName = Document.Name;
                            if (!ScrlTabs.viewerInitialized) {
                                //PDFJS.webViewerLoad(externalId);

                                if (ScrlTabs.twoDDocumentArray.filter(function (d) { return d.DocumentVersionId === Document.DocumentVersionId && (d.DocumentId === Document.DocumentId || d.Shortcut === true); }).length > 0) {
                                    PDFJS.webViewerLoad(docExtId, docVerExtId, extension, ScrlTabs.ProjectId);
                                }
                                //webViewerLoad(externalId, ScrlTabs.ProjectId);
                                ScrlTabs.addVersionDropdown("2DView", docExtId, docVerExtId);


                            }
                            else if (!AnnotationApplication.lock && ScrlTabs.twoDDocumentArray.filter(function (d) { return d.DocumentVersionId === Document.DocumentVersionId && d.DocumentId === Document.DocumentId; }).length > 0) {
                                AnnotationApplication.lock = true;
                                //var url = '/Document/DownloadFile?bucket=PDF&externalId=' + externalId + '.pdf&projectId=' + ScrlTabs.ProjectId;
                                FileOperationLogic.downloadItem(
                                    docExtId,
                                    docVerExtId,
                                    ".pdf",
                                    function (url) {
                                        AnnotationApplication.Utils.openNewFile(url, Document.DocumentId, Document.DocumentVersionId, annotationId, canvasId);
                                        ScrlTabs.addVersionDropdown("2DView", docExtId, docVerExtId);
                                    },
                                    null,
                                    function () {
                                        AnnotationApplication.lock = false;
                                    }
                                );
                            }

                            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
                                navigateToPane.NavigateToPane("right-pane", $('#vertical').data('kendoSplitter'));
                            }
                        },
                        error => {
                            AnnotationApplication.lock = false;
                            console.error(error);
                        }
                    );
                } catch (e) {
                    console.log(e);
                }



            }


            var onerror = function (e) {
                AnnotationApplication.lock = true;
                ErrorMessageCustom(FileOperationLogic.Resources['ServerIssue'],
                    null,
                    FileOperationLogic.Resources['ServerIssue'],
                    [{ text: FileOperationLogic.Resources['OK'] }]);
            };
            var annotationId = annotationId;
            var canvasId = canvasId;
            var extension = extension;
            if (typeof extension === "undefined") { extension = ".pdf"; }
            ScrlTabs.showDocViewer();
            ScrlTabs.deselectAllButtons("#docTab_" + docExtId);
            //AnnotationApplication.documentVersionId = Document.DocumentVersionId;
            //AnnotationApplication.documentId = Document.DocumentId;
            if (typeof docVerExtId !== "undefined" &&
                typeof AnnotationApplication !== "undefined" &&
                typeof AnnotationApplication.documentVersionId !== "undefined" &&
                docVerExtId === AnnotationApplication.documentVersionId) {

                AnnotationApplication.CanvasController.scrollToAnnotation(annotationId, canvasId);

            } else if (typeof docVerExtId !== "undefined" && docVerExtId != null) {
                onsuccess(
                    that.twoDDocumentArray.find(d => d.DocumentVersionId === docVerExtId)
                );
                //FileOperationLogic.getDocumentVersionObject(
                //    docVerExtId,
                //    onsuccess,
                //    onerror
                //);
            } else {
                onsuccess(
                    that.twoDDocumentArray.find(d => d.DocumentId === docExtId)
                );
                //FileOperationLogic.getDocumentObject(
                //    docExtId,
                //    onsuccess,
                //    onerror
                //);
            }

        },

        addVersionDropdown: function (containerId, DocumentExternalId, selectedVersionExternalId) {
            //    var viewerContainer = $('#' + containerId)[0];
            //    var dropdownContainer = $(viewerContainer).find("div[id='DocumentVersionDropdownContainer']")[0];
            //    var dropdown = $(dropdownContainer).find("input[id='DocumentVersionDropdown']")[0];
            //    try {
            //        $(dropdown).data("kendoDropDownList").destroy();
            //    } catch (e) { console.log("clearing version dropdown"); }

            //    if (typeof DocumentExternalId !== "undefined" && DocumentExternalId != null) {
            //    FileOperationLogic.getDocumentVersionObjects(DocumentExternalId,
            //        function (versions) {
            //            ScrlTabs.versionList = [];
            //            Object.keys(versions).forEach(function (v) {
            //                ScrlTabs.versionList.push(versions[v]);
            //            });
            //            ScrlTabs.versionList = ScrlTabs.versionList.sort(function (a, b) {
            //                return kendo.parseDate(b.VersionCreatedOn) < kendo.parseDate(a.VersionCreatedOn);
            //            });

            //            var selectObject;
            //            if (typeof selectedVersionExternalId === "undefined" || selectedVersionExternalId == null) {
            //                selectObject = ScrlTabs.versionList[ScrlTabs.versionList.length - 1].DocumentVersionId;
            //            } else {
            //                var selectObject = selectedVersionExternalId;
            //            }

            //            for (var i = 0; i < ScrlTabs.versionList.length; i++) {
            //                ScrlTabs.versionList[i].Number = i + 1;
            //            }

            //            $(dropdownContainer).empty();
            //            $(dropdownContainer)
            //                .append(
            //                    '<input class="DocumentVersionDropdown" id="DocumentVersionDropdown" style="width: 90px !important"/>');
            //            dropdown = $(dropdownContainer).find("input[id='DocumentVersionDropdown']")[0];
            //            $(dropdown).kendoDropDownList({
            //                dataTextField: "Number",
            //                dataValueField: "DocumentVersionId",
            //                dataSource: { data: ScrlTabs.versionList },
            //                value: selectObject,
            //                change: function (e) {
            //                    var widget = $('#DocumentVersionDropdown').data('kendoDropDownList');
            //                    var Document = widget.dataItem(widget.selectedIndex);
            //                    ScrlTabs.openFile2DViewer(Document.DocumentId, Document.DocumentVersionId);
            //                },
            //                valueTemplate: "<span class=\"k-state-default\">" + VIEW_RESOURCES.Resource.Version + " #: data.Number #</span>",
            //                template: "<span class=\"k-state-default\">" + VIEW_RESOURCES.Resource.Version + " #: data.Number #</span>",
            //            });

            //            ScrlTabs.refreshTagImportButton(selectedVersionExternalId);
            //            ScrlTabs.refreshStatusFilterDropdown("2DView");
            //        },
            //        FileOperationLogic.onFailedFileOperation
            //    );
            //}
        },

        refreshTagImportButton: function (selectedVersionExternalId) {
            var show =
            (
                ScrlTabs.versionList.length > 1 &&
                (selectedVersionExternalId == null ||
                    selectedVersionExternalId == ScrlTabs.versionList[ScrlTabs.versionList.length - 1].DocumentVersionId
                )
            );
            if (show) {
                $('#emsImportAnnotations').removeClass('hidden');
                $('#emsImportAnnotations-secondary').removeClass('hidden');
            } else {
                $('#emsImportAnnotations').addClass('hidden');
                $('#emsImportAnnotations-secondary').addClass('hidden');
            }
        },

        refreshStatusFilterDropdown: function (view) {
            var dropdown = $('#' + view).find('[id="StatusFilterDropdown' + view + '"]').attr('style', 'background-color: transparent; border-color: transparent; border: none;');
            //dropdown.find('.k-icon.k-i-arrow-60-down').addClass('hidden');
            dropdown.find('.k-sprite.k-icon ').attr('style', 'color:#fff').removeClass('k-sprite');
            dropdown.find('.k-state-default .k-link').attr('style', 'padding: .58em 1.8em .58em .9em');
            dropdown.find('.k-link').first().attr('style', 'padding:8px;');//.append("<i class='far fa-filter' style='margin: 0;'/>")
            dropdown.find('.StatusFilterDropdownIcon')
                .attr('style', "font-size:16px; margin:0; margin-right:6px;");
            dropdown.find('.StatusFilterDropdownButton2DView').attr('style', 'border:none;');
            dropdown.find('.StatusFilterDropdownButton3DView').attr('style', 'border:none;');
        },



        //onSelectStatusFilter: function(e){
        //    if ($(e.item).hasClass("statusOn")) {
        //        FilterStatusesLogic.isStatusVisible = true;
        //        FilterStatusesLogic.isFilterEnabled = false;
        //        FilterStatusesLogic.refreshViewers();
        //    } else if ($(e.item).hasClass("statusOff")) {
        //        FilterStatusesLogic.isStatusVisible = false;
        //        FilterStatusesLogic.refreshViewers();
        //    } else if ($(e.item).hasClass("filterOn")) {
        //        FilterStatusesLogic.showFilterTree();
        //        $(".k-widget.k-window").attr("class", " ").addClass("k-widget k-window assigntempsbimkmodel");
        //        $('#StatusFilterDropdown2DView_mn_active').addClass('modelheight');

        //    }
        // },

        onImportAnnotations: function (e) {
            FileOperationLogic.importAnnotations(ScrlTabs.openDocument);
        },

        disableButtons: function(){
            var menu = $("#ScrollingTabs").data("kendoMenu");
            menu.enable($("#ScrollingTabs").children(), false);
        },

        enableButtons: function(){
            var menu = $("#ScrollingTabs").data("kendoMenu");
            menu.enable($("#ScrollingTabs").children(), true);
        }
    
    }
    return ScrollingTabs;
})();