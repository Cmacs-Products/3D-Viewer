var TwoDToolbar = (function () {
    function TwoDToolbar() {
        
        this.widget;
        this.searchMenu;
        this.versions = [];
        this.iconTypes = [];
        this.annotationsHidden = false;
        this.showQR = false;
        this.stampsShownInAnnotationDropdown = false;
        //this.stampDropdownButtons = [
        //    { text: VIEW_RESOURCES.Resource.Approved + " (DE)", spriteCssClass: "far fa-dot-circle", attributes: { "src": "/Scripts/PDFJS/images/DE/stamps-01.svg", "class": "stampButton cultureDE greenIcon  stampApproved" } },
        //    { text: VIEW_RESOURCES.Resource.Final + " (DE)", spriteCssClass: "far fa-dot-circle", attributes: { "src": "/Scripts/PDFJS/images/DE/stamps-02.svg", "class": "stampButton cultureDE greenIcon  stampFinal" } },
        //    { text: VIEW_RESOURCES.Resource.Complete + " (DE)", spriteCssClass: "far fa-dot-circle", attributes: { "src": "/Scripts/PDFJS/images/DE/stamps-03.svg", "class": "stampButton cultureDE greenIcon  stampComplete" } },
        //    { text: VIEW_RESOURCES.Resource.Paid + " (DE)", spriteCssClass: "far fa-dot-circle", attributes: { "src": "/Scripts/PDFJS/images/DE/stamps-04.svg", "class": "stampButton cultureDE greenIcon  stampPaid" } },
        //    { text: VIEW_RESOURCES.Resource.NotApproved + " (DE)", spriteCssClass: "far fa-dot-circle", attributes: { "src": "/Scripts/PDFJS/images/DE/stamps-05.svg", "class": "stampButton cultureDE redIcon    stampNotApproved" } },
        //    { text: VIEW_RESOURCES.Resource.Void + " (DE)", spriteCssClass: "far fa-dot-circle", attributes: { "src": "/Scripts/PDFJS/images/DE/stamps-06.svg", "class": "stampButton cultureDE redIcon    stampVoid" } },
        //    { text: VIEW_RESOURCES.Resource.Confidential + " (DE)", spriteCssClass: "far fa-dot-circle", attributes: { "src": "/Scripts/PDFJS/images/DE/stamps-07.svg", "class": "stampButton cultureDE redIcon    stampConfidential" } },
        //    { text: VIEW_RESOURCES.Resource.NotPaid + " (DE)", spriteCssClass: "far fa-dot-circle", attributes: { "src": "/Scripts/PDFJS/images/DE/stamps-08.svg", "class": "stampButton cultureDE redIcon    stampNotPaid" } },
        //    { text: VIEW_RESOURCES.Resource.Incomplete + " (DE)", spriteCssClass: "far fa-dot-circle", attributes: { "src": "/Scripts/PDFJS/images/DE/stamps-09.svg", "class": "stampButton cultureDE blueIcon   stampIncomplete" } },
        //    { text: VIEW_RESOURCES.Resource.Draft + " (DE)", spriteCssClass: "far fa-dot-circle", attributes: { "src": "/Scripts/PDFJS/images/DE/stamps-10.svg", "class": "stampButton cultureDE blueIcon   stampDraft" } },
        //    { text: VIEW_RESOURCES.Resource.Copy + " (DE)", spriteCssClass: "far fa-dot-circle", attributes: { "src": "/Scripts/PDFJS/images/DE/stamps-11.svg", "class": "stampButton cultureDE blueIcon   stampCopy" } },
        //    { text: VIEW_RESOURCES.Resource.PublicRelease + " (DE)", spriteCssClass: "far fa-dot-circle", attributes: { "src": "/Scripts/PDFJS/images/DE/stamps-12.svg", "class": "stampButton cultureDE blueIcon   stampPublicRelease" } },
        //    { text: VIEW_RESOURCES.Resource.Approved + " (EN)", spriteCssClass: "far fa-dot-circle", attributes: { "src": "/Scripts/PDFJS/images/EN/stamps-01.svg", "class": "stampButton cultureEN greenIcon  stampApproved" } },
        //    { text: VIEW_RESOURCES.Resource.Final + " (EN)", spriteCssClass: "far fa-dot-circle", attributes: { "src": "/Scripts/PDFJS/images/EN/stamps-02.svg", "class": "stampButton cultureEN greenIcon  stampFinal" } },
        //    { text: VIEW_RESOURCES.Resource.Complete + " (EN)", spriteCssClass: "far fa-dot-circle", attributes: { "src": "/Scripts/PDFJS/images/EN/stamps-03.svg", "class": "stampButton cultureEN greenIcon  stampComplete" } },
        //    { text: VIEW_RESOURCES.Resource.Paid + " (EN)", spriteCssClass: "far fa-dot-circle", attributes: { "src": "/Scripts/PDFJS/images/EN/stamps-11.svg", "class": "stampButton cultureEN greenIcon  stampPaid" } },
        //    { text: VIEW_RESOURCES.Resource.NotApproved + " (EN)", spriteCssClass: "far fa-dot-circle", attributes: { "src": "/Scripts/PDFJS/images/EN/stamps-04.svg", "class": "stampButton cultureEN redIcon    stampNotApproved" } },
        //    { text: VIEW_RESOURCES.Resource.Void + " (EN)", spriteCssClass: "far fa-dot-circle", attributes: { "src": "/Scripts/PDFJS/images/EN/stamps-05.svg", "class": "stampButton cultureEN redIcon    stampVoid" } },
        //    { text: VIEW_RESOURCES.Resource.Confidential + " (EN)", spriteCssClass: "far fa-dot-circle", attributes: { "src": "/Scripts/PDFJS/images/EN/stamps-06.svg", "class": "stampButton cultureEN redIcon    stampConfidential" } },
        //    { text: VIEW_RESOURCES.Resource.NotPaid + " (EN)", spriteCssClass: "far fa-dot-circle", attributes: { "src": "/Scripts/PDFJS/images/EN/stamps-12.svg", "class": "stampButton cultureEN redIcon    stampNotPaid" } },
        //    { text: VIEW_RESOURCES.Resource.Incomplete + " (EN)", spriteCssClass: "far fa-dot-circle", attributes: { "src": "/Scripts/PDFJS/images/EN/stamps-07.svg", "class": "stampButton cultureEN blueIcon   stampIncomplete" } },
        //    { text: VIEW_RESOURCES.Resource.Draft + " (EN)", spriteCssClass: "far fa-dot-circle", attributes: { "src": "/Scripts/PDFJS/images/EN/stamps-08.svg", "class": "stampButton cultureEN blueIcon   stampDraft" } },
        //    { text: VIEW_RESOURCES.Resource.Copy + " (EN)", spriteCssClass: "far fa-dot-circle", attributes: { "src": "/Scripts/PDFJS/images/EN/stamps-09.svg", "class": "stampButton cultureEN blueIcon   stampCopy" } },
        //    { text: VIEW_RESOURCES.Resource.PublicRelease + " (EN)", spriteCssClass: "far fa-dot-circle", attributes: { "src": "/Scripts/PDFJS/images/EN/stamps-10.svg", "class": "stampButton cultureEN blueIcon   stampPublicRelease" } }
        //];
        //this.annotationButtons = [
        //    {
        //        id: "TwoDViewerAnnRect",
        //        name: VIEW_RESOURCES.Resource.DrawRectangle,
        //        drawState: "RECT",
        //        sprite: 'far fa-square'
        //        //img: "/Content/images/DocumentViewer/Asset1.png"
        //    },
        //    {
        //        id: "TwoDViewerAnnCirc",
        //        name: VIEW_RESOURCES.Resource.DrawCircle,
        //        drawState: "CIRC",
        //        sprite: 'far fa-circle'
        //        //img: '/Content/images/DocumentViewer/Asset2.png'
        //    },
        //    {
        //        id: "TwoDViewerAnnLine",
        //        name: VIEW_RESOURCES.Resource.DrawLine,
        //        drawState: "LINE",
        //        sprite: 'far fa-slash'
        //        //img: '/Content/images/DocumentViewer/Asset3.png'
        //    },
        //    {
        //        id: "TwoDViewerAnnDraw",
        //        name: VIEW_RESOURCES.Resource.FreeDraw,
        //        drawState: "DRAW",
        //        sprite: 'far fa-pen-alt'
        //        //img: '/Content/images/DocumentViewer/Asset38.png'
        //    },
        //    {
        //        id: "TwoDViewerAnnMeasure",
        //        name: VIEW_RESOURCES.Resource.MeasurementTool,
        //        drawState: "MEASURE",
        //        sprite: 'far fa-ruler'
        //        //img: '/Content/images/DocumentViewer/Asset4.png'
        //    },
        //    {
        //        id: "TwoDViewerAnnCallout",
        //        name: VIEW_RESOURCES.Resource.Callout,
        //        drawState: "CALLOUT",
        //        sprite: 'far fa-megaphone'
        //        //img: '/Content/images/DocumentViewer/Asset6.png'
        //    },
        //    {
        //        id: "TwoDViewerAnnTextTag",
        //        name: VIEW_RESOURCES.Resource.Tag,
        //        drawState: "TEXTTAG",
        //        sprite: 'far fa-map-pin'
        //        //enabled: false
        //    },
        //    {
        //        id: "TwoDViewerAnnText",
        //        name: VIEW_RESOURCES.Resource.TextBox,
        //        drawState: "TEXT",
        //        sprite: 'far fa-i-cursor'
        //        //img: '/Content/images/DocumentViewer/Asset7.png'
        //    },
        //    {
        //        id: "TwoDViewerAnnCustom",
        //        name: VIEW_RESOURCES.Resource.CustomShape,
        //        drawState: "CUSTOM",
        //        sprite: 'far fa-draw-polygon'
        //        //img: '/Content/images/DocumentViewer/Asset8.png'
        //    },
        //    {
        //        id: "TwoDViewerAnnHighlight",
        //        name: VIEW_RESOURCES.Resource.HighlightText,
        //        drawState: "HIGHLIGHT",
        //        sprite: 'far fa-highlighter'
        //        //img: '/Content/images/DocumentViewer/Asset9.png'
        //    },
        //    {
        //        id: "TwoDViewerAnnCloud",
        //        name: VIEW_RESOURCES.Resource.Cloud,
        //        drawState: "CLOUD",
        //        sprite: 'far fa-cloud'
        //        //img: '/Content/images/DocumentViewer/Asset5.png'
        //    },
        //    {
        //        id: "TwoDViewerAnnImageUpload",
        //        name: VIEW_RESOURCES.Resource.ImageUpload,
        //        drawState: "IMAGEUPLOAD",
        //        sprite: 'far fa-image'
        //    },
        //    {
        //        id: "TwoDViewerAnnStamp",
        //        name: VIEW_RESOURCES.Resource.Stamp,
        //        drawState: "STAMP",
        //        sprite: 'far fa-stamp',
        //        //img: '/Content/images/DocumentViewer/Asset11.png',
        //        menuButtons: this.stampDropdownButtons,
        //        overflow: "never",
        //        click: function (e) {
        //            AnnotationApplication.Toolbar.onDrawAnnotationClick("STAMP", e.target.attr('src'));
        //        }
        //    }
        //];

    }

    TwoDToolbar.prototype = {
        constructor: TwoDToolbar,
        

        destroyToolbar: function() {
            if (this.widget) {
                this.widget.destroy();
                $("#Toolbar2D").empty();
            }
            if (this.searchMenu) {
                this.searchMenu.destroy();
                // not sure why the above destroy removes the element, but let's put it back
                var searchContainer = document.createElement('div');
                searchContainer.id = 'Toolbar2DSearchMenu';
                searchContainer.classList.add('documentviewertoolbarhanger');
                document.getElementById("mainContainer").append(searchContainer);
            }
        },

        createToolbar: function() {

            var that = this;
            this.DocumentId = AnnotationApplication.documentId;
            this.selectedVersionId = AnnotationApplication.documentVersionId;
            //this.selectedIconType = "type_default";
            this.showQR = false;
            var dropdown = $('#TwoVersionDropdown');
            try {
                $(dropdown).data("kendoDropDownList").destroy();
            } catch (e) {
                console.log("clearing version dropdown failed");
            }

            if (typeof this.DocumentId !== "undefined") {

                var createToolbarCallback = function() {
                    that.destroyToolbar();
                    $("#Toolbar2D").kendoToolBar({
                        resizable: true,
                        open: function(e) {
                            if (that.stampsShownInAnnotationDropdown) {
                                //var hideNonStampButtons = $('.hideOnStampsUnhide');
                                //var showStampButtons = $('a.showOnStampsUnhide');
                                //hideNonStampButtons.each(function (index) {
                                //    that.widget.hide(hideNonStampButtons[index]);
                                //});
                                //showStampButtons.each(function (index) {
                                //    $(showStampButtons[index]).removeClass('k-overflow-hidden');
                                //    that.widget.show(showStampButtons[index]);
                                //});
                                //that.stampsShownInAnnotationDropdown = false; // revert to default state
                            } else {
                                //var showStampButtons = $('.hideOnStampsUnhide');
                                //var hideNonStampButtons = $('a.showOnStampsUnhide');
                                //hideNonStampButtons.each(function (index) {
                                //    that.widget.hide($(hideNonStampButtons[index]));
                                //});
                                //showStampButtons.each(function (index) {
                                //    that.widget.show($(showStampButtons[index]));
                                //});
                                var toolBarButtons = that.annotationButtons; // all elemtents in the toolbar
                                toolBarButtons.forEach(
                                    function(buttonProps) {
                                        //var toolBarButton = toolBarButtons[toolBarButtonIndex];
                                        var id = buttonProps.id;
                                        var dropdownElement = $('a.' + id + 'dropdown');
                                        if ($('#' + id).css('display') === 'none' ||
                                            $('#' + id).parent().css('display') === 'none') {
                                            that.widget.show(dropdownElement);
                                        } else {
                                            that.widget.hide(dropdownElement);
                                        }
                                    }
                                );
                                //if (that.annotationsHidden) {
                                //    that.widget.hide($('.HideAnnotations'));
                                //    that.widget.show($('.ShowAnnotations'));
                                //} else {
                                //    that.widget.hide($('.ShowAnnotations'));
                                //    that.widget.show($('.HideAnnotations'));
                                //}
                                //that.widget.enable('.SelectAnnottations', AnnotationApplication.DrawStateService.drawState !== "SELECT")
                            }
                        }

                    });
                    that.widget = $("#Toolbar2D").data("kendoToolBar");

                    $('#Toolbar2DSearchMenu').kendoContextMenu({
                        orientation: 'horizontal',
                        target: "#Toolbar2D.searchMenuTarget",
                        filter: ".neverShowOnrightClickOnlyOnButtonToggle",
                        closeOnClick: false,
                        close: function(e) {
                            $('twoDToolbarSearch').removeClass('k-state-active');
                        }
                    });
                    that.searchMenu = $("#Toolbar2DSearchMenu").data("kendoContextMenu");

                    that.createToolbarButtons();
                    if (that.searchMenu !== undefined) that.createToolbarSearchMenuButtons();

                    //$('#Toolbar2DSearchMenu').tooltip({
                    //    trigger: 'hover',
                    //    container: 'body'
                    //});
                    //that.disableOnClippingList = $('a.disableOnClipping');
                    //ScrlTabs.refreshTagImportButton(selectedVersionExternalId);
                    //ScrlTabs.refreshStatusFilterDropdown("2DView");
                    $("#Toolbar2DSearchMenu").addClass('ViewerButtonDropdown');
                    $(".ViewerButton span").removeClass('k-icon k-sprite');
                    $(".hideOnStampsUnhide span").removeClass('k-icon k-sprite');
                    $(".ViewerButton span span").removeClass('k-icon k-sprite');
                    $(".stampButton span").removeClass('k-icon k-sprite');
                    $(".documentviewertoolbarhanger span").removeClass('k-icon k-sprite');

                    if (ROLE === 'Anonymous') $("#twoDToolbarDocProperties_overflow").addClass('hidden');

                    $('.k-list-container.k-split-container, .k-overflow-container.k-list-container')
                        .addClass('ViewerButtonDropdown k-overflow-container');
                    that.widget.resize();

                    $('.ViewerButtonDropdown').children().addClass('ViewerButton');

                    $('#TwoDAnnotationDropdown_optionlist li.ViewerButton a').contents().filter(function() {
                        return this.nodeType === 3;
                    }).wrap('<span class="k-text"></span>');
                    $('#TwoDViewerAnnStamp_optionlist li.ViewerButton a').contents().filter(function() {
                        return this.nodeType === 3;
                    }).wrap('<span class="k-text"></span>');

                    $('#TwoDIconDropdown_wrapper').addClass('floatRight');

                    if (
                        /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i
                            .test(navigator.userAgent)) {
                        $('.ViewerButton').tooltip('destroy');
                    } else {
                        
                    }
                };

                //if (ProjectId !== null && ProjectId !== "" && ROLE !== "Anonymous") {
                if (ProjectId !== null && ROLE !== "Anonymous"
                ) { // because opening a document from document template had issue with version dropdown
                    FileOperationLogic.getDocumentVersionObjects(this.DocumentId,
                        function(versions) {
                            that.versions = [];
                            Object.keys(versions).forEach(function(v) {
                                that.versions.push(versions[v]);
                            });
                            that.versions = that.versions.sort(function(a, b) {
                                return kendo.parseDate(b.VersionCreatedOn) < kendo.parseDate(a.VersionCreatedOn);
                            });

                            if (!that.selectedVersionId) {
                                that.selectedVersionId = that.versions[that.versions.length - 1].DocumentVersionId;
                            }

                            that.showImportButton = (
                                that.versions.length > 1 &&
                                (that.selectedVersionId === null ||
                                    that.selectedVersionId === that.versions[that.versions.length - 1].DocumentVersionId
                                )
                            );
                            createToolbarCallback();
                        },
                        FileOperationLogic.onFailedFileOperation
                    );
                } else {
                    createToolbarCallback();
                }
            }
        },
       
   
      

        showAllAnnotations(){
            $(".canvas-container").removeClass("hidden");
            $(".textLayer").each(function(i, e) { $(e).first('svg').removeClass('hidden') });

        },

        hideAllAnnotations(){
            $(".canvas-container").addClass("hidden");
            $(".textLayer").each(function(i, e) { $(e).first('svg').addClass('hidden') });
        },

        addAnnotationDropdown: function() {
            var that = this;
            var menuButtons = [
                {
                    text: VIEW_RESOURCES.Resource.ShowAnnotations,
                    template: "<div class='far fa-file-alt'>this is a template</div>",
                    hidden: false,
                    spriteCssClass: "far fa-eye",
                    attributes: { "class": "ShowAnnotations hideOnStampsUnhide" }
                }, {
                    text: VIEW_RESOURCES.Resource.HideAnnotations,
                    hidden: false,
                    spriteCssClass: "far fa-eye-slash",
                    attributes: { "class": "HideAnnotations hideOnStampsUnhide" }
                }, {
                    text: VIEW_RESOURCES.Resource.SelectAnnotationsBox,
                    //imageUrl: "/Content/images/DocumentViewer/Asset27.png",
                    spriteCssClass: "far fa-mouse-pointer",
                    attributes: {
                        "class": "ViewerButton SelectAnnottations annotationButton hideOnStampsUnhide",
                        "drawState": "SELECT"
                    },
                    //enable: false
                    selected: true
                }, {
                    text: "",
                    attributes: { "class": "k-separator hideOnStampsUnhide" }
                }
            ];

            this.annotationButtons.forEach(function(prop) {
                var buttonDef = {
                    text: prop.name,
                    imageUrl: prop.img,
                    attributes: {
                        class: prop.id + "dropdown dropdown annotationButton hideOnStampsUnhide",
                        drawState: prop.drawState
                    }
                };

                if (typeof prop.overflow !== "undefined") {
                    buttonDef.overflow = prop.overflow;
                }
                if (prop.drawState === AnnotationApplication.DrawStateService.getDrawState()) {
                    buttonDef.attributes.class = buttonDef.attributes.class + " k-state-selected";
                }
                if (prop.img) {
                    buttonDef.imageUrl = prop.img;
                } else if (prop.sprite) {
                    buttonDef.spriteCssClass = prop.sprite;
                }
                if (prop.enabled === false) {
                    buttonDef.enable = false;
                }
                menuButtons.push(buttonDef);
            });

            menuButtons.push({
                    text: VIEW_RESOURCES.Resource.DownloadAnnotations + " (PDF)",
                    spriteCssClass: "icon-DownloadWithAnnotations",
                    attributes: { "class": "DownloadWithAnnotations hideOnStampsUnhide" }
                },
                {
                    text: VIEW_RESOURCES.Resource.DownloadWithout,
                    //imageUrl: "/Content/images/DocumentViewer/Asset28.png",
                    spriteCssClass: "far fa-download",
                    attributes: { "class": "DownloadWithoutAnnotations hideOnStampsUnhide" }
                },
                {
                    text: VIEW_RESOURCES.Resource.Download,
                    //imageUrl: "/Content/images/DocumentViewer/Asset28.png",
                    spriteCssClass: "far fa-file-download",
                    attributes: { "class": "DownloadOriginal hideOnStampsUnhide" }
                },
                {
                    text: "",
                    attributes: { "class": "k-separator hideOnStampsUnhide" }
                },
                {
                    text: VIEW_RESOURCES.Resource.DeleteAnnotation,
                    //imageUrl: "/Content/images/DocumentViewer/Asset24.png",
                    spriteCssClass: "far fa-trash-alt",
                    attributes: { "class": "ViewerButton DeleteAnnotation hideOnStampsUnhide" },
                    enable: true
                },
                {
                    //imageUrl: "/Content/images/DocumentViewer/Asset23.png",
                    spriteCssClass: "far fa-file-import",
                    text: VIEW_RESOURCES.Resource.ImportAnnotations,
                    enable: this.showImportButton,
                    attributes: {
                        "class": "annotationButton ViewerButton ImportAnnotationsdropdown hideOnStampsUnhide"
                    }
                });

            this.stampDropdownButtons.forEach(function(prop) {
                var buttonDef = jQuery.extend(true, {}, prop);
                buttonDef.hidden = true;
                buttonDef.attributes.drawState = "STAMP";
                buttonDef.attributes.class = buttonDef.attributes.class + " showOnStampsUnhide";
                buttonDef.overflow = "never";
                menuButtons.push(buttonDef);
            });

            this.widget.add({
                type: "splitButton",
                id: "TwoDAnnotationDropdown",
                spriteCssClass: "far fa-edit",
                text: VIEW_RESOURCES.Resource.AnnotationTools,
                showText: "overflow",
                overflow: 'never',
                attributes: {
                    class: "ViewerButton",
                    "data-original-title": VIEW_RESOURCES.Resource.AnnotationTools,
                    "data-toggle": "tooltip",
                    "data-placement": "bottom"
                },
                menuButtons: menuButtons,
                click: function(e) {
                    if (e.target.hasClass('HideAnnotations')) {
                        that.annotationsHidden = true;
                        $(".canvas-container").addClass("hidden");
                        $(".textLayer").each(function(i, e) { $(e).first('svg').addClass('hidden') });
                    } else if (e.target.hasClass('ShowAnnotations')) {
                        that.annotationsHidden = false;
                        $(".canvas-container").removeClass("hidden");
                        $(".textLayer").each(function(i, e) { $(e).first('svg').removeClass('hidden') });
                    } else if (e.target.hasClass('DownloadWithAnnotations')) {
                        that.downloadDocWithAnnotations();
                    } else if (e.target.hasClass('DownloadOriginal')) {
                        FileOperationLogic.downloadItem(AnnotationApplication.documentId,
                            AnnotationApplication.documentVersionId);
                    } else if (e.target.hasClass('DownloadWithoutAnnotations')) {
                        PDFViewerApplication.eventBus.dispatch('download');
                    } else if (e.target.hasClass('DeleteAnnotation')) {


                        AnnotationApplication.CRUDController.deleteAnnotations(SvgGlobalControllerLogic.selectedIds2)
                            .then(
                                data => {

                                },
                                err => {

                                }
                            );


                        // SvgGlobalControllerLogic.allSelectedObjects = SvgGlobalControllerLogic.allSelectedObjects.filter(s => s.type !== null
                        //     && !(['emsgroup'].includes(s.getAnnotationType()) && s.type === "image"));

                        // if (SvgGlobalControllerLogic.selectedObject.element != null && SvgGlobalControllerLogic.allSelectedObjects.length === 0) {
                        //     var element = SvgGlobalControllerLogic.selectedObject.element;
                        //     AnnotationApplication.CRUDController.prepareDelete(null, element);
                        //     SvgGlobalControllerLogic.selectedObject = {
                        //         element: null,
                        //         svgController: null
                        //     };

                        // } else if (SvgGlobalControllerLogic.allSelectedObjects.length > 0) {
                        //     var annIds = [];
                        //     var paper = SvgGlobalControllerLogic.allSelectedObjects[0].paper;
                        //     SvgGlobalControllerLogic.allSelectedObjects.forEach(function (el) {
                        //         if (el.element !== undefined) {
                        //             if (el.element.getDocumentAnnotationId() !== undefined) {
                        //                 annIds.push(el.element.getDocumentAnnotationId());
                        //             } else {
                        //                 el.remove();
                        //             }
                        //         } else {
                        //             if (el.getDocumentAnnotationId() !== undefined) {
                        //                 annIds.push(el.getDocumentAnnotationId());
                        //             } else {
                        //                 el.remove();
                        //             }
                        //         }

                        //     });

                        //     SvgGlobalControllerLogic.clearAllJoints();
                        //     try {

                        //         AnnotationApplication.CRUDController.prepareDelete().then(
                        //             data => {
                        //                 console.log(data);
                        //             },
                        //             error => {
                        //                 console.error(error);
                        //             }
                        //         );


                        //         //AnnotationApplication.CRUDController.deleteAnnotation(annIds, function () {

                        //         //    LocalAnnotationsControllerLogic.deleteManyAnnotationById(AnnotationApplication.documentVersionId, null, annIds, null)

                        //         //    annIds.forEach(function (annId) {
                        //         //        var elms = SvgGlobalControllerLogic.getElementsByDocumentAnnotationId(annId);
                        //         //        elms.forEach(function (el) {
                        //         //            el.remove();
                        //         //        });
                        //         //    });
                        //         //});
                        //     } catch (ex) {
                        //         console.error("Something went wrong when deleting!", annIds);
                        //     }
                        // }

                    } else if (e.target.hasClass('ImportAnnotationsdropdown')) {
                        FileOperationLogic.importAnnotations({
                            DocumentId: AnnotationApplication.documentId,
                            DocumentVersionId: AnnotationApplication.documentVersionId,
                            ProjectId: AnnotationApplication.projectId
                        });
                        //} else if (e.target.hasClass('TwoDViewerAnnStampdropdown')) {
                        //    setTimeout(function () {
                        //        // trigger re-opening in "stamps shown mode"
                        //        that.stampsShownInAnnotationDropdown = true;
                        //        $('#TwoDAnnotationDropdown').parent().children()[1].click();
                        //    }, 200);
                    } else if (e.target.hasClass('annotationButton') || e.target.hasClass('stampButton')) {
                        that.onDrawAnnotationClick(e.target.attr('drawState'), e.target.attr('src'));
                    }
                }
            });
        },

        addAnnotationToolbarButtons() {
            var that = this;
            var classes = "annotationButton";


            var addButton = function(prop) {

                var buttonDef = {
                    type: "button",
                    id: prop.id,
                    text: prop.name,
                    showText: "overflow",
                    attributes: {
                        class: "ViewerButton " + classes,
                        "drawState": prop.drawState,
                        "data-original-title": prop.name,
                        "data-toggle": "tooltip",
                        "data-placement": "bottom"
                    },
                    toggle: function(e) { that.onDrawAnnotationClick(prop.drawState) },
                    click: prop.click
                }
                if (prop.menuButtons) {
                    buttonDef.type = "splitButton";
                    buttonDef.menuButtons = prop.menuButtons;
                    buttonDef.overflow = "never";
                } else {
                    buttonDef.attributes.class = buttonDef.attributes.class + ' floatRight';
                    buttonDef.togglable = true;
                }

                if (prop.img) {
                    buttonDef.imageUrl = prop.img;
                } else if (prop.sprite) {
                    buttonDef.spriteCssClass = prop.sprite;
                }

                if (prop.enabled === false) {
                    buttonDef.enable = false
                }

                that.widget.add(buttonDef);
            }

            // actually add the buttons
            this.annotationButtons.reverse().forEach(function(prop) {
                addButton(prop);
            });
        },


        createPageNumberInput: function() {

            this.widget.add({
                template: '<div id="twoDToolbarPageNumberInputContainer" class="displayInlineBlock">' +
                    '<label id="twoDToolbarPageNumberLabel" class="toolbarLabel" for="twoDToolbarPageNumberInput" data-l10n-id="page_label">' +
                    VIEW_RESOURCES.Resource.Page +
                    ': </label>' +
                    '<input type="number" id="twoDToolbarPageNumberInput" class="toolbarField pageNumber" value="1" size="8" min="1"></input>' +
                    '<span id="twoDToolbarNumPages" class="toolbarLabel"></span>' +
                    '</div>',
                overflowTemplate: '<div id="twoDToolbarPageNumberInputContainerOverflow" class="hidden">',
                attributes: {
                    class: "ViewerButton floatLeft"
                }
            });

            // let viewer.js update
            PDFViewerApplication.toolbar.items.numPages = document.getElementById('twoDToolbarNumPages');
            PDFViewerApplication.toolbar.items.pageNumber = document.getElementById('twoDToolbarPageNumberInput');

            // add listeners
            $('#twoDToolbarPageNumberInput').click(function(e) { PDFViewerApplication.toolbar.select(); });
            $('#twoDToolbarPageNumberInput').change(function(e) {
                PDFViewerApplication.pdfViewer.currentPageLabel = e.originalEvent.target.value;
                if (e.originalEvent.target.value !== PDFViewerApplication.pdfViewer.currentPageNumber.toString() &&
                    e.originalEvent.target.value !== PDFViewerApplication.pdfViewer.currentPageLabel) {
                    PDFViewerApplication.toolbar.setPageNumber(PDFViewerApplication.pdfViewer.currentPageNumber,
                        PDFViewerApplication.pdfViewer.currentPageLabel);
                }
            });
        },

        createToolbarSearchMenuButtons: function() {
            this.searchMenu.append(
                [
                    {
                        text:
                            '<div class="findButton"><label for="findInput" class="toolbarLabel" data-l10n-id="find_label">' +
                                VIEW_RESOURCES.Resource.Find +
                                ':</label><input id="twoDToolbarFindInput" class="toolbarField" oninput="PDFViewerApplication.findBar.dispatchEvent(' +
                                "''" +
                                ');"></div>',
                        encoded: false
                    },
                    {
                        text: "",
                        cssClass: "findButton findPrevious",
                        spriteCssClass: "icon-FinePrevious"
                    },
                    {
                        text: "",
                        cssClass: "findButton findNext",
                        spriteCssClass: "icon-FineNext"
                    },
                    {
                        text:
                            '<div class="findButton"><input type="checkbox" id="twoDToolbarFindHighlightAll" class="toolbarField" onchange="PDFViewerApplication.findBar.dispatchEvent(' +
                                "'highlightallchange'" +
                                ');"></input><label for="findHighlightAll" class="toolbarLabel" data-l10n-id="find_highlight">' +
                                VIEW_RESOURCES.Resource.HighlightAll +
                                '</label></div>',
                        encoded: false
                        //text: VIEW_RESOURCES.Resource.HighlightAll,
                        //cssClass: "findButton findHighlightAll",
                    },
                    {
                        text:
                            '<div class="findButton" ><input type="checkbox" id="twoDToolbarFindMatchCase" class="toolbarField" onchange="PDFViewerApplication.findBar.dispatchEvent(' +
                                "'casesensitivitychange'" +
                                ');"></input><label for="findMatchCase" class="toolbarLabel" data-l10n-id="find_match_case_label">' +
                                VIEW_RESOURCES.Resource.Matchcase +
                                '</label></div>',
                        encoded: false
                        //text: VIEW_RESOURCES.Resource.Matchcase,
                        //cssClass: "findButton findMatchCase",
                    },
                    {
                        text:
                            '<div class="findButton"  style="width: 100px"><span id="twoDToolbarFindResultsCount" class="toolbarLabel hidden"></span><span id="twoDToolbarFindMsg" class="toolbarLabel"></span></div>',
                        encoded: false
                    }
                ]
            );

            // tooltips
            $('.findPrevious').attr("title", VIEW_RESOURCES.Resource.Previous).attr("data-toggle", "tooltip")
                .attr("data-placement", "bottom");
            $('.findNext').attr("title", VIEW_RESOURCES.Resource.Next).attr("data-toggle", "tooltip")
                .attr("data-placement", "bottom");

            // search functionality connection to viewer.js
            PDFViewerApplication.findBar.findField = document.getElementById('twoDToolbarFindInput');
            PDFViewerApplication.findBar.findMsg = document.getElementById('twoDToolbarFindMsg');
            PDFViewerApplication.findBar.findResultsCount = document.getElementById('twoDToolbarFindResultsCount');
            PDFViewerApplication.findBar.highlightAll = document.getElementById('twoDToolbarFindHighlightAll');
            PDFViewerApplication.findBar.caseSensitive = document.getElementById('twoDToolbarFindMatchCase');

            // additional triggers
            $('.findButton.findPrevious').click(function(e) {
                PDFViewerApplication.findBar.dispatchEvent('again', true);
            });
            $('.findButton.findNext').click(function(e) {
                PDFViewerApplication.findBar.dispatchEvent('again', false);
            });

        },

        createVersionSplitButton: function() {
            var mainText;
            var buttons = [];
            var that = this;

            for (var i = 0; i < this.versions.length; i++) {
                this.versions[i].Number = i + 1;
                buttons.push({
                    id: this.versions[i].DocumentVersionId,
                    text: VIEW_RESOURCES.Resource.Version + this.versions[i].Number,
                    spriteCssClass: "far fa-file",
                    showIcon: "overflow",
                    attributes: {
                        class: "menuimageurl"
                    },
                    enable: (this.versions[i].DocumentVersionId !== this.selectedVersionId),
                    click: function(e) {
                        var version = e.target.attr('id');
                        if (version === null || typeof version === 'undefined') {
                            version = $(e.target).parent().attr("id").split('_')[0];
                        }
                        if (version !== "TwoDVersionDropdown") {
                            FileOperationLogic.downloadItem(
                                that.DocumentId,
                                version,
                                ".pdf",
                                function(url) {
                                    AnnotationApplication.Utils.openNewFile(url, that.DocumentId, version);
                                }
                            );
                        }
                    }
                });
                if (this.versions[i].DocumentVersionId === this.selectedVersionId) {
                    mainText = VIEW_RESOURCES.Resource.Version + this.versions[i].Number;
                }
            }

            this.widget.add(
                {
                    type: "splitButton",
                    id: "TwoDVersionDropdown",
                    text: mainText,
                    spriteCssClass: "far fa-file",
                    attributes: {
                        class: "ViewerButton floatLeft"
                    },
                    menuButtons: buttons,
                    click: function(e) {
                        var version = e.target.attr('id');
                        if (version === null || typeof version === 'undefined') {
                            version = $(e.target).parent().attr("id");
                        }
                        if (version !== "TwoDVersionDropdown") {
                            FileOperationLogic.downloadItem(
                                that.DocumentId,
                                version,
                                ".pdf",
                                function(url) {
                                    AnnotationApplication.Utils.openNewFile(url, that.DocumentId, version);
                                }
                            );
                        }
                    }
                });
        },

        createToolbarButtons: function() {
            var that = this;
            //////////////////// Left buttons ///////////////////////////
            if ((AnnotationApplication.viewerType === "EMS" && window.IsMobileDevice)) {
                this.widget.add(
                    {
                        type: "button",
                        id: "Button2DNavigateLeftFromRightPane",
                        spriteCssClass: "far fa-arrow-left",
                        text: VIEW_RESOURCES.Resource.Details,
                        showText: "overflow",
                        overflow: "never",
                        attributes: {
                            class: "ViewerButton floatLeft",
                            "data-original-title": VIEW_RESOURCES.Resource.Details,
                            "data-toggle": "tooltip",
                            "data-placement": "bottom"
                        },
                        click: function(e) {
                            window.parent.navigateToPane.NavigateToPane('center-pane', $('#vertical').data('kendoSplitter'));
                        }
                    }
                );

                this.widget.add({ type: "separator", attributes: { class: "floatLeft" } });

            }

            this.widget.add(
                {
                    type: "button",
                    togglable: true,
                    id: "leftSidebarToggle",
                    spriteCssClass: "far fa-arrow-alt-square-right",
                    text: VIEW_RESOURCES.Resource.DocumentProperties,
                    showText: "overflow",
                    attributes: {
                        class: "ViewerButton floatLeft",
                        "data-original-title": VIEW_RESOURCES.Resource.DocumentProperties,
                        "data-toggle": "tooltip",
                        "data-placement": "bottom"
                    },
                    overflow: "never",
                    toggle: function(e) { PDFViewerApplication.pdfSidebar.toggle(PDFViewerApplication.pdfSidebar); }
                }
            );

            if (ROLE !== "Anonymous") {
                this.widget.add({ type: "separator", attributes: { class: "floatLeft" } });

                this.createVersionSplitButton();

            }

            this.widget.add({ type: "separator", attributes: { class: "floatLeft" } });

            this.widget.add(
                {
                    type: "button",
                    togglable: true,
                    id: "twoDToolbarSearch",
                    spriteCssClass: "far fa-search",
                    text: VIEW_RESOURCES.Resource.Find,
                    showText: "overflow",
                    attributes: {
                        class: "ViewerButton floatLeft searchMenuTarget",
                        "data-original-title": VIEW_RESOURCES.Resource.Find,
                        "data-toggle": "tooltip",
                        "data-placement": "bottom"
                    },
                    toggle: function(e) {
                        if (e.target.hasClass('k-state-active')) {
                            that.searchMenu.open(e.target);
                            $('#twoDToolbarFindInput').focus();
                        } else {
                            that.searchMenu.close();
                        }
                    }
                }
            );

            this.widget.add(
                {
                    type: "buttonGroup",
                    attributes: {
                        class: "floatLeft"
                    },
                    buttons: [
                        {
                            id: "twoDToolbarPreviousPage",
                            spriteCssClass: "far fa-angle-left",
                            attributes: {
                                class: "ViewerButton",
                                "data-original-title": VIEW_RESOURCES.Resource.PreviousPage,
                                "data-toggle": "tooltip",
                                "data-placement": "bottom"
                            },
                            togglable: false,
                            text: VIEW_RESOURCES.Resource.PreviousPage,
                            showText: "overflow",
                            group: "pageNav",
                            click: function(e) {
                                PDFViewerApplication.toolbar.eventBus.dispatch('previouspage');
                            },
                            overflow: "never"
                        },
                        {
                            id: "twoDToolbarNextPage",
                            spriteCssClass: "far fa-angle-right",
                            attributes: {
                                class: "ViewerButton",
                                "data-original-title": VIEW_RESOURCES.Resource.NextPage,
                                "data-toggle": "tooltip",
                                "data-placement": "bottom"
                            },
                            togglable: false,
                            text: VIEW_RESOURCES.Resource.NextPage,
                            showText: "overflow",
                            group: "pageNav",
                            click: function(e) {
                                PDFViewerApplication.toolbar.eventBus.dispatch('nextpage');
                            },
                            overflow: "never"
                        }
                    ],
                    overflow: "auto"
                });

            if (AnnotationApplication.viewerType !== "EMS") {
                this.createPageNumberInput();
            }
            //////////////////// some that wil always be in the dropdown ///////////////////////////
            if (ROLE !== "Anonymous") {
                this.widget.add(
                    {
                        type: "button",
                        id: "twoDToolbarRotateCCW",
                        spriteCssClass: "far fa-undo",
                        text: VIEW_RESOURCES.Resource.RotateCounterclockwise,
                        showText: "overflow",
                        overflow: 'always',
                        attributes: {
                            class: "ViewerButton floatLeft ",
                            "data-original-title": VIEW_RESOURCES.Resource.RotateCounterclockwise,
                            "data-toggle": "tooltip",
                            "data-placement": "bottom"
                        },
                        click: function(e) {
                            //PDFViewerApplication.toolbar.eventBus.dispatch('rotateccw');
                            //PDFViewerApplication.toolbar.setPageRotationCcw();
                            AnnotationApplication.RightSidebarController.rotateAllCcw();
                        }
                    }
                );

                this.widget.add(
                    {
                        type: "button",
                        id: "twoDToolbarRotateCW",
                        spriteCssClass: "far fa-redo",
                        text: VIEW_RESOURCES.Resource.RotateClockwise,
                        showText: "overflow",
                        overflow: 'always',
                        attributes: {
                            class: "ViewerButton floatLeft ",
                            "data-original-title": VIEW_RESOURCES.Resource.RotateClockwise,
                            "data-toggle": "tooltip",
                            "data-placement": "bottom"
                        },
                        click: function(e) {
                            //PDFViewerApplication.toolbar.eventBus.dispatch('rotatecw');
                            //PDFViewerApplication.toolbar.setPageRotationCw();
                            AnnotationApplication.RightSidebarController.rotateAllCw();
                        }
                    }
                );
            }

            this.widget.add(
                {
                    type: "button",
                    id: "twoDToolbarFirstPage",
                    spriteCssClass: "far fa-angle-double-left",
                    text: VIEW_RESOURCES.Resource.GoTheFirstPage,
                    showText: "overflow",
                    overflow: 'always',
                    attributes: {
                        class: "ViewerButton floatLeft",
                        "data-original-title": VIEW_RESOURCES.Resource.GoTheFirstPage,
                        "data-toggle": "tooltip",
                        "data-placement": "bottom"
                    },
                    click: function(e) {
                        PDFViewerApplication.toolbar.eventBus.dispatch('firstpage');
                    }
                }
            );

            this.widget.add(
                {
                    type: "button",
                    id: "twoDToolbarLastPage",
                    spriteCssClass: "far fa-angle-double-right",
                    text: VIEW_RESOURCES.Resource.GoTheLastPage,
                    showText: "overflow",
                    overflow: 'always',
                    attributes: {
                        class: "ViewerButton floatLeft",
                        "data-original-title": VIEW_RESOURCES.Resource.GoTheLastPage,
                        "data-toggle": "tooltip",
                        "data-placement": "bottom"
                    },
                    click: function(e) {
                        PDFViewerApplication.toolbar.eventBus.dispatch('lastpage');
                    }
                }
            );


            //////////////////// center buttons ///////////////////////////
            this.widget.add(
                {
                    type: "buttonGroup",
                    buttons: [
                        {
                            type: "button",
                            id: "twoDToolbarZoomIn",
                            spriteCssClass: "far fa-search-plus",
                            text: VIEW_RESOURCES.Resource.ZoomIn,
                            showText: "overflow",
                            attributes: {
                                class: "ViewerButton",
                                "data-original-title": VIEW_RESOURCES.Resource.ZoomIn,
                                "data-toggle": "tooltip",
                                "data-placement": "bottom"
                            },
                            click: function(e) {
                                PDFViewerApplication.toolbar.eventBus.dispatch('zoomin');
                            },
                            group: "zoomButtons"
                        },
                        {
                            type: "button",
                            id: "twoDToolbarZoomOut",
                            spriteCssClass: "far fa-search-minus",
                            text: VIEW_RESOURCES.Resource.ZoomOut,
                            showText: "overflow",
                            attributes: {
                                class: "ViewerButton ",
                                "data-original-title": VIEW_RESOURCES.Resource.ZoomOut,
                                "data-toggle": "tooltip",
                                "data-placement": "bottom"
                            },
                            click: function(e) {
                                PDFViewerApplication.toolbar.eventBus.dispatch('zoomout');
                            },
                            group: "zoomButtons"
                        }
                    ],
                    overflow: "auto"
                });

            PDFViewerApplication.toolbar.items.zoomIn = document.getElementById('twoDToolbarZoomIn');

            PDFViewerApplication.toolbar.items.zoomOut = document.getElementById('twoDToolbarZoomOut');

            this.widget.add(
                {
                    type: "splitButton",
                    id: "ToggleZoomLevelButton",
                    text: VIEW_RESOURCES.Resource.AutomaticZoom,
                    attributes: {
                        "value": "auto",
                        class: "ViewerButton",
                        "data-original-title": VIEW_RESOURCES.Resource.Zoom,
                        "data-toggle": "tooltip",
                        "data-placement": "bottom"
                    },
                    menuButtons: [
                        {
                            id: "pageAutoOption",
                            attributes: { "class": "zoomleveloption", "value": "auto" },
                            text: VIEW_RESOURCES.Resource.AutomaticZoom,
                            selected: true
                        },
                        {
                            id: "pageActualOption",
                            attributes: { "class": "zoomleveloption", "value": "page-actual" },
                            text: VIEW_RESOURCES.Resource.ActualSize
                        },
                        {
                            id: "pageFitOption",
                            attributes: { "class": "zoomleveloption", "value": "page-fit" },
                            text: VIEW_RESOURCES.Resource.FitPage
                        },
                        {
                            id: "pageWidthOption",
                            attributes: { "class": "zoomleveloption", "value": "page-width" },
                            text: VIEW_RESOURCES.Resource.FullWidth
                        },
                        { attributes: { "class": "zoomleveloption", "value": "0.5" }, text: "50%" },
                        { attributes: { "class": "zoomleveloption", "value": "0.75" }, text: "75%" },
                        { attributes: { "class": "zoomleveloption", "value": "1" }, text: "100%" },
                        { attributes: { "class": "zoomleveloption", "value": "1.25" }, text: "125%" },
                        { attributes: { "class": "zoomleveloption", "value": "1.5" }, text: "150%" },
                        { attributes: { "class": "zoomleveloption", "value": "2" }, text: "200%" },
                        { attributes: { "class": "zoomleveloption", "value": "3" }, text: "300%" },
                        { attributes: { "class": "zoomleveloption", "value": "4" }, text: "400%" },
                        { attributes: { "class": "zoomleveloption", "value": "5" }, text: "500%" },
                        { attributes: { "class": "zoomleveloption", "value": "6" }, text: "600%" }
                    ],
                    click: function(e) {
                        PDFViewerApplication.pdfViewer.currentScaleValue = e.target.attr("value");
                        if (typeof AnnotationApplication.CanvasController !== "undefined") {
                            AnnotationApplication.CanvasController.scaleCanvas();
                            AnnotationApplication.CanvasController.scaleAnnotations();
                        }
                    }
                });
            PDFViewerApplication.toolbar.items.scaleSelect = document.getElementById('ToggleZoomLevelButton');

            this.widget.add({ // only shows in overflow
                overflow: "always",
                template: "<div class='hidden'></div>",
                overflowTemplate: "<div class='k-separator'></div>"
            });

            // this.widget.add({
            //     type: "button",
            //     id: "twoDToolbarDocProperties",
            //     spriteCssClass: "far fa-ellipsis-h",
            //     text: VIEW_RESOURCES.Resource.DocumentProperties,
            //     showText: "overflow",
            //     overflow: 'always',
            //     attributes: {
            //         class: "ViewerButton ",
            //         "data-original-title": VIEW_RESOURCES.Resource.DocumentProperties,
            //         "data-toggle": "tooltip",
            //         "data-placement": "bottom"
            //     },
            //     click: function (e) {
            //         PDFViewerApplication.pdfDocumentProperties.open();
            //     }
            // });


            //////////////////// right buttons, ordered from right to left ///////////////////////////

            this.widget.add({ // spacer
                overflow: "never",
                template: "<div style='height: 10px; width:52px'></div>",
                attributes: { class: "floatRight" }
            });

            this.widget.add({ // only shows in overflow
                overflow: "auto",
                template: "<div class='hidden'></div>",
                overflowTemplate: "<div class='k-separator'></div>"
            });


            if(AnnotationApplication.viewerType !== "EMS" && window.parent.loadedModule === "EMS"){
                this.widget.add({
                    type: "button",
                    togglable: true,
                    id: "TwoDFilterStatus",
                    spriteCssClass: "far fa-eye",
                    text: window.parent.VIEW_RESOURCES.Resource.StatusView,
                    showText: "overflow",
                    selected: window.parent.FilterStatusesLogic.isStatusVisible,
                    attributes: {
                        class: "floatRight ViewerButton statusOn",
                        "data-original-title": window.parent.VIEW_RESOURCES.Resource.StatusView,
                        "data-toggle": "tooltip",
                        "data-placement": "bottom"
                    },
                    toggle: function(e) {
                        window.parent.FilterStatusesLogic.setStatusVisible(!window.parent.FilterStatusesLogic.isStatusVisible);
                    }
                });

                this.widget.add({
                    type: "button",
                    id: "TwoDFilterButton",
                    spriteCssClass: "far fa-filter",
                    text: window.parent.VIEW_RESOURCES.Resource.FilterStatus,
                    showText: "overflow",
                    attributes: {
                        class: "floatRight ViewerButton filterStatus",
                        "data-original-title": window.parent.VIEW_RESOURCES.Resource.FilterStatus,
                        "data-toggle": "tooltip",
                        "data-placement": "bottom"
                    },
                    click: function(e) {
                        window.parent.FilterStatusesLogic.showFilterTree();
                        //$(".k-widget.k-window").attr("class", " ").addClass("k-widget k-window assigntempsbimkmodel");
                        //$('#StatusFilterDropdown2DView_mn_active').addClass('modelheight');
                    }
                });

                this.createIconSplitButton();
            }


            if (ROLE !== "Anonymous") {
                this.widget.add({
                    type: "button",
                    togglable: true,
                    id: "TwoDSettingsButton",
                    spriteCssClass: "far fa-cog",
                    text: VIEW_RESOURCES.Resource.Settings,
                    showText: "overflow",
                    overflow: "never",
                    enable: false,
                    attributes: {
                        class: "floatRight ViewerButton",
                        "data-original-title": VIEW_RESOURCES.Resource.Settings,
                        "data-toggle": "tooltip",
                        "data-placement": "bottom"
                    },
                    toggle: function(e) {
                        var rightSidebarTools = $("#rightSidebarAnnotation_tools");
                        var sidebarOpen = AnnotationApplication.RightSidebarController.sidebarOpen();
                        var canvas = AnnotationApplication.CanvasController.getCurrentCanvas();
                        var pageNumber = PDFViewerApplication.pdfViewer.currentPageNumber;
                        var annotation = null;

                        annotation = SvgGlobalControllerLogic.selectedIds2.length > 0
                            ? SvgGlobalControllerLogic.annotations2[SvgGlobalControllerLogic.selectedIds2]
                            : null;
                        if (!sidebarOpen && annotation && rightSidebarTools.length <= 0) {
                            annotation.svgController.clearAllCtrlBoxes(true);
                            annotation.svgController.clearAllJoints();
                            annotation.svgController.clearAllSelectedText();
                            var pageNumber = annotation.pageNumber;
                            AnnotationApplication.RightSidebarController.openSidebar(null, pageNumber, annotation);
                        } else if (!sidebarOpen && rightSidebarTools.length > 0) {
                            AnnotationApplication.RightSidebarController.openSidebarUtil();
                        } else {
                            AnnotationApplication.RightSidebarController.closeSidebar();
                            if (e.checked) {
                                that.widget.toggle(e.target, false);
                            }
                        }

                        // try { annotation = SvgGlobalControllerLogic.currentRightClickedObject.element; } catch (e) { }
                        // if (annotation === null) {
                        //     try { annotation = SvgGlobalControllerLogic.selectedObject.element; } catch (e) { }
                        // }


                        // if (!sidebarOpen && annotation && rightSidebarTools.length <= 0) {
                        //     SvgGlobalControllerLogic.getSvgController(pageNumber).canvas.restoreMask(null);
                        //     var pageNumber = SvgGlobalControllerLogic.currentRightClickedObject !== null ? SvgGlobalControllerLogic.currentRightClickedObject.pageNumber : SvgGlobalControllerLogic.selectedObject.svgController.pageNumber;
                        //     var annotation = SvgGlobalControllerLogic.currentRightClickedObject !== null ? SvgGlobalControllerLogic.currentRightClickedObject.annotation : SvgGlobalControllerLogic.selectedObject.svgController.paper.getById(annotation[0].raphaelid ? annotation[0].raphaelid : annotation[0].id);
                        //     AnnotationApplication.RightSidebarController.openSidebar(null, pageNumber, annotation);
                        // } else if (!sidebarOpen && rightSidebarTools.length > 0) {
                        //     SvgGlobalControllerLogic.getSvgController(pageNumber).canvas.restoreMask(null);
                        //     AnnotationApplication.RightSidebarController.openSidebarUtil();
                        // } else {
                        //     AnnotationApplication.RightSidebarController.closeSidebar();
                        //     if (e.checked) {
                        //         that.widget.toggle(e.target, false);
                        //     }
                        // }
                    }
                });
            }

            if (ProjectId != null &&
                ProjectId != "" &&
                AnnotationApplication.viewerType !== "EMS" &&
                ROLE !== "Anonymous") {
                this.addAnnotationDropdown();
            }

            if (ProjectId != null &&
                ProjectId != "" &&
                ROLE !== "Anonymous" &&
                AnnotationApplication.viewerType === "EMS") {
                var importText = VIEW_RESOURCES.Resource.Import;
                this.widget.add({
                    type: "button",
                    id: "ImportAnnotations",
                    //imageUrl: "/Content/images/DocumentViewer/Asset23.png",
                    spriteCssClass: "far fa-file-import",
                    text: importText,
                    showText: "overflow",
                    enable: this.showImportButton,
                    attributes: {
                        class: "floatRight ViewerButton annotationButton",
                        "data-original-title": importText,
                        "data-toggle": "tooltip",
                        "data-placement": "bottom"
                    },
                    click: function(e) {
                        FileOperationLogic.importAnnotations({
                            DocumentId: AnnotationApplication.documentId,
                            DocumentVersionId: AnnotationApplication.documentVersionId,
                            ProjectId: AnnotationApplication.projectId
                        });
                    }
                });
            }

            if (AnnotationApplication.viewerType !== "EMS" && ROLE !== "Anonymous") {

                this.widget.add({
                    type: "button",
                    id: "TwoDshareButton",
                    spriteCssClass: "far fa-share-alt",
                    text: VIEW_RESOURCES.Resource.ShareDocument,
                    showText: "overflow",
                    attributes: {
                        class: "floatRight ViewerButton",
                        "data-original-title": VIEW_RESOURCES.Resource.ShareDocument,
                        "data-toggle": "tooltip",
                        "data-placement": "bottom"
                    },
                    click: function(e) {
                        showShareDialog("DOCUMENT", AnnotationApplication.documentVersionId);
                    }
                });

                this.widget.add({ type: "separator", attributes: { class: "floatRight" } });

                //id, name, drawState, icon
            }

            if (ProjectId !== null &&
                ProjectId !== "" &&
                AnnotationApplication.viewerType !== "EMS" &&
                ROLE !== "Anonymous") {
                this.addAnnotationToolbarButtons();

            }

            if (AnnotationApplication.viewerType === "EMS" || AnnotationApplication.viewerType === "IFRAME") {
                this.widget.add({
                    type: "button",
                    togglable: true,
                    id: "TwoDFilterStatus",
                    spriteCssClass: "far fa-eye",
                    text: VIEW_RESOURCES.Resource.StatusView,
                    showText: "overflow",
                    selected: window.parent.FilterStatusesLogic.isStatusVisible,
                    attributes: {
                        class: "floatRight ViewerButton statusOn",
                        "data-original-title": VIEW_RESOURCES.Resource.StatusView,
                        "data-toggle": "tooltip",
                        "data-placement": "bottom"
                    },
                    toggle: function(e) {
                        window.parent.FilterStatusesLogic.setStatusVisible(!window.parent.FilterStatusesLogic.isStatusVisible);
                    }
                });

                this.widget.add({
                    type: "button",
                    id: "TwoDFilterButton",
                    spriteCssClass: "far fa-filter",
                    text: window.parent.VIEW_RESOURCES.Resource.FilterStatus,
                    showText: "overflow",
                    attributes: {
                        class: "floatRight ViewerButton filterStatus",
                        "data-original-title": VIEW_RESOURCES.Resource.FilterStatus,
                        "data-toggle": "tooltip",
                        "data-placement": "bottom"
                    },
                    click: function(e) {
                        window.parent.FilterStatusesLogic.showFilterTree();
                        //$(".k-widget.k-window").attr("class", " ").addClass("k-widget k-window assigntempsbimkmodel");
                        //$('#StatusFilterDropdown2DView_mn_active').addClass('modelheight');
                    }
                });

                this.createIconSplitButton();
                // this.widget.add({
                //     type: "button",
                //     togglable: true,
                //     selected: this.showQR,
                //     id: "TwoDShowQRButton",
                //     spriteCssClass: "far fa-qrcode",
                //     text: VIEW_RESOURCES.Resource.QRCodes,
                //     showText: "overflow",
                //     attributes: {
                //         class: "floatRight ViewerButton",
                //         "data-original-title": VIEW_RESOURCES.Resource.QRCodes,
                //         "data-toggle": "tooltip",
                //         "data-placement": "bottom"
                //     },
                //     toggle: function (e) {
                //         if (that.showQR) {
                //             AnnotationApplication.Utils.hideAllQR();
                //             that.showQR = false;
                //         } else {
                //             AnnotationApplication.Utils.showAllQR();
                //             that.showQR = true;
                //         }
                //     }
                // });

                this.widget.add({
                    type: "button",
                    id: "DownloadWithAnnotations",
                    spriteCssClass: "icon-DownloadWithAnnotations",
                    text: VIEW_RESOURCES.Resource.DownloadTags,
                    showText: "overflow",
                    attributes: {
                        class: "floatRight ViewerButton",
                        "data-original-title": VIEW_RESOURCES.Resource.DownloadTags,
                        "data-toggle": "tooltip",
                        "data-placement": "bottom"
                    },
                    click: function(e) {
                        that.downloadDocWithAnnotations();
                    }
                });

            }


            if (ProjectId === null ||
                ProjectId === "" ||
                ROLE === "Anonymous" ||
                AnnotationApplication.viewerType === "EMS") {
                this.widget.add({
                    type: "button",
                    id: "DownloadWithoutAnnotations",
                    spriteCssClass: "far fa-download",
                    text: VIEW_RESOURCES.Resource.DownloadWithoutTags,
                    showText: "overflow",
                    attributes: {
                        class: "floatRight ViewerButton",
                        "data-original-title": VIEW_RESOURCES.Resource.DownloadWithoutTags,
                        "data-toggle": "tooltip",
                        "data-placement": "bottom"
                    },
                    click: function(e) {
                        PDFViewerApplication.eventBus.dispatch('download');
                    }
                });
                this.widget.add({
                    type: "button",
                    id: "DownloadOriginal",
                    spriteCssClass: "far fa-file-download",
                    text: VIEW_RESOURCES.Resource.Download,
                    showText: "overflow",
                    attributes: {
                        class: "floatRight ViewerButton",
                        "data-original-title": VIEW_RESOURCES.Resource.Download,
                        "data-toggle": "tooltip",
                        "data-placement": "bottom"
                    },
                    click: function(e) {
                        FileOperationLogic.downloadItem(AnnotationApplication.documentId,
                            AnnotationApplication.documentVersionId);
                    }
                });
                if (AnnotationApplication.viewerType !== "EMS")
                    this.widget.add({
                        type: "button",
                        id: "DownloadWithAnnotations",
                        spriteCssClass: "icon-DownloadWithAnnotations",
                        text: VIEW_RESOURCES.Resource.DownloadAnnotations + " (PDF)",
                        showText: "overflow",
                        attributes: {
                            class: "floatRight ViewerButton",
                            "data-original-title": VIEW_RESOURCES.Resource.DownloadAnnotations,
                            "data-toggle": "tooltip",
                            "data-placement": "bottom"
                        },
                        click: function(e) {
                            AnnotationApplication.DownloadAnnotationController.initializeDownloadableCanvases(true);
                        }
                    });
            }
        },

        createIconSplitButton: function() {
            var mainText;
            var buttons = [];
            var that = this;

            this.iconTypes = [
                { type: "name", icon: " fal fa-font", text: " " + VIEW_RESOURCES.Resource.Name },
                { type: "pin", icon: " fal fa-map-marker-alt", text: " " + VIEW_RESOURCES.Resource.Tag },
                { type: "qr", icon: " fal fa-qrcode", text: " " + VIEW_RESOURCES.Resource.QRCode },
                {
                    type: "default",
                    icon: " fal fa-map-marker",
                    text: " " +
                        VIEW_RESOURCES.Resource.Tag +
                        " " +
                        VIEW_RESOURCES.Resource.And +
                        " " +
                        VIEW_RESOURCES.Resource.Name
                },
                {
                    type: "nameqr",
                    icon: " fal fa-cube",
                    text: " " +
                        VIEW_RESOURCES.Resource.Name +
                        " " +
                        VIEW_RESOURCES.Resource.And +
                        " " +
                        VIEW_RESOURCES.Resource.QRCode
                }
            ];

            for (var i = 0; i < this.iconTypes.length; i++) {
                buttons.push({
                    id: "type_" + this.iconTypes[i].type,
                    text: this.iconTypes[i].text,
                    spriteCssClass: "far fa-file",
                    icon: this.iconTypes[i].icon,
                    //showIcon: "overflow",
                    attributes: {
                        class: "menuimageurl"
                    },
                    enable: (this.iconTypes[i].type !== window.parent.FilterStatusesLogic.selectedIconType),
                    click: function(e) {
                        var type = e.target.attr('id');
                        if (type === null || typeof type === 'undefined') {
                            type = $(e.target).parent().attr("id");
                        }
                        window.parent.FilterStatusesLogic.selectedIconType = type;
                        if (["type_qr", "type_nameqr"].indexOf(type) !== -1) {
                            AnnotationApplication.Toolbar.showQR = true;
                        } else {
                            AnnotationApplication.Toolbar.showQR = false;
                        }
                        
                        SvgGlobalControllerLogic.updateEmsIcons(type);
                        var cls = that.iconTypes.filter(function(ic) {
                            return ic.type === window.parent.FilterStatusesLogic.selectedIconType.split('_')[1]
                        })[0].icon;
                        $("#TwoDIconDropdown").children("span:first").attr("class", "");
                        $("#TwoDIconDropdown").children("span:first").addClass(cls);
                        $('#TwoDIconDropdown_wrapper').addClass('floatRight');
                        // update disabled item in options
                        $("#TwoDIconDropdown_optionlist > li > a").removeClass("k-state-disabled");
                        $("#" + window.parent.FilterStatusesLogic.selectedIconType).addClass("k-state-disabled");
                    }
                });
                if (this.iconTypes[i].type === window.parent.FilterStatusesLogic.selectedIconType) {
                    mainText = VIEW_RESOURCES.Resource.Type;
                }
            }

            this.widget.add(
                {
                    type: "splitButton",
                    id: "TwoDIconDropdown",
                    text: mainText,
                    spriteCssClass: that.iconTypes.filter(function(ic) {
                        return ic.type === window.parent.FilterStatusesLogic.selectedIconType.split('_')[1]
                    })[0].icon,
                    attributes: {
                        class: "ViewerButton floatLeft"
                    },
                    menuButtons: buttons,
                    click: function(e) {
                        var type = e.target.attr('id');
                        if (type === null || typeof type === 'undefined') {
                            type = $(e.target).parent().attr("id");
                        }

                        window.parent.FilterStatusesLogic.selectedIconType = type;
                        that.widget.spriteCssClass = that.iconTypes.filter(function(ic) {
                            return ic.type === window.parent.FilterStatusesLogic.selectedIconType.split('_')[1]
                        })[0].icon;
                    }
                });
        },

        downloadDocWithAnnotations: function() {
            /*
            // Close sidebars and menus if open
            AnnotationApplication.RightSidebarController.closeSidebar();
            AnnotationApplication.downloadInProgress = true;

            // Show loading overlay and prevent user from clicking things
            AnnotationApplication.LoadingOverlayProcID = Loading_OL.startGenericLoadingScreenWithDelay(AnnotationApplication.downloadOverlayName, 0, VIEW_RESOURCES.Resource.DownloadWithAnnotationStart);

            // Scale Canvas and annotation to 100%
            // This ensures that the downloaded document looks correct
            AnnotationApplication.DownloadAnnotationController.tempScaleValue = PDFViewerApplication.pdfViewer.currentScaleValue;
            PDFViewerApplication.pdfViewer.currentScaleValue = 1;

            AnnotationApplication.CanvasController.scaleCanvas();
            //AnnotationApplication.CanvasController.scaleAnnotations();

            // Start the download process
            this.waitForLoadingOverlay(function () {
                AnnotationApplication.DownloadAnnotationController.generateToken();
                AnnotationApplication.DownloadAnnotationController.initializeDownloadableCanvases();
                //PDFViewerApplication.pdfViewer.currentScaleValue = tempScaleValue;
            });
            */
            AnnotationApplication.DownloadAnnotationController.initializeDownloadableCanvases();
        },

        onDrawAnnotationClick: function(drawState, stampState) {
            var drawstate = AnnotationApplication.DrawStateService.getDrawState();

            if (drawstate === drawState) {
                if (drawState === "DRAW") {
                    //AnnotationApplication.CanvasController.getCurrentCanvas().fabric.isDrawingMode = false;
                    SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas
                        .isDrawing = false;
                    SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas
                        .stopDrawing();

                }
                drawState = "SELECT";
                stampState = "";
                $("#pageContainer" + PDFViewerApplication.pdfViewer.currentPageNumber).css("box-shadow", "");
            }

            if (drawstate === "CALLOUT" || drawstate === "CUSTOM" || drawstate === "CLOUD") {
                try {
                    AnnotationApplication.RenderDrawState.reset();
                } catch (e) {
                    console.log("no objects to remove".e);
                }
            }
            AnnotationApplication.DrawStateService.setDrawState(drawState, stampState);
            if (drawState === "TEXTTAG") {
                //AnnotationApplication.CanvasController.drawSelectedText();

                //SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.drawTextTag();

                var svgObject = new SvgTextTag(
                    SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas,
                    null,
                    "texttag",
                    PDFViewerApplication.pdfViewer.currentPageNumber,
                    null,
                    0,
                    null,
                    0,
                    [],
                    [],
                    []
                );
                svgObject.create();


            } else if (drawState === "IMAGEUPLOAD") {
                AnnotationApplication.ImageUploadController.uploadImage(function(img) {
                    SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas
                        .uploadedImage = img;
                    SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas
                        .isDrawing = true;
                    $(SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas
                        .paper.canvas).css("z-index", "100");
                    SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas
                        .drawingType = "image";
                });

            }

            if (drawState === "SELECT") {
                //AnnotationApplication.CanvasController.deactivateAllCanvases();
                for (var i = 0; i < AnnotationApplication.CanvasController.activeCanvas.length; i++) {
                    AnnotationApplication.CanvasController.toggleSvgToCanvas(i + 1, false);
                }
                SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas
                    .isDrawing = false;
                SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas
                    .drawingType = "select";
                $("#raphael" + PDFViewerApplication.pdfViewer.currentPageNumber).parent()
                    .children("div:not(:first-child)").removeClass("hidden");
                SvgGlobalControllerLogic.enableHammerPan();
                //AnnotationApplication.DrawStateService.setDrawState("ok");
            } else if (drawState === "LINE") {
                // why z-index? because it is needed to be on top of 
                // all other elements in the textLayer when drawing. 
                // Here I set the value. See "SvgController.js"
                $("#pageContainer" + PDFViewerApplication.pdfViewer.currentPageNumber)
                    .css("box-shadow", "5px 5px 5px 5px darkkhaki");
                $("#pageContainer" + PDFViewerApplication.pdfViewer.currentPageNumber)
                    .css("box-shadow", "5px 5px 5px 5px #009ee3");
                SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas
                    .isDrawing = true;
                $(SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas
                    .paper.canvas).css("z-index", "100");
                SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas
                    .drawingType = "line";
                $("#raphael" + PDFViewerApplication.pdfViewer.currentPageNumber).parent()
                    .children("div:not(:first-child)").addClass("hidden");
                SvgGlobalControllerLogic.enableHammerPan();
                $(".textLayer > div").not(".raphael").hide();
            } else if (drawState === "CUSTOM") {
                $("#pageContainer" + PDFViewerApplication.pdfViewer.currentPageNumber)
                    .css("box-shadow", "5px 5px 5px 5px darkkhaki");
                $("#pageContainer" + PDFViewerApplication.pdfViewer.currentPageNumber)
                    .css("box-shadow", "5px 5px 5px 5px #009ee3");
                SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas
                    .isDrawing = true;
                $(SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas
                    .paper.canvas).css("z-index", "100");
                SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas
                    .drawingType = "polyline";
                $("#raphael" + PDFViewerApplication.pdfViewer.currentPageNumber).parent()
                    .children("div:not(:first-child)").addClass("hidden");
                SvgGlobalControllerLogic.enableHammerPan();
                $(".textLayer > div").not(".raphael").hide();
            } else if (drawState === "MEASURE") {
                $("#pageContainer" + PDFViewerApplication.pdfViewer.currentPageNumber)
                    .css("box-shadow", "5px 5px 5px 5px darkkhaki");
                $("#pageContainer" + PDFViewerApplication.pdfViewer.currentPageNumber)
                    .css("box-shadow", "5px 5px 5px 5px #009ee3");
                SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas
                    .isDrawing = true;
                $(SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas
                    .paper.canvas).css("z-index", "100");
                SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas
                    .drawingType = "measurementbasic";
                $("#raphael" + PDFViewerApplication.pdfViewer.currentPageNumber).parent()
                    .children("div:not(:first-child)").addClass("hidden");
                SvgGlobalControllerLogic.enableHammerPan();
                $(".textLayer > div").not(".raphael").hide();
            } else if (drawState === "DRAW") {
                $("#pageContainer" + PDFViewerApplication.pdfViewer.currentPageNumber)
                    .css("box-shadow", "5px 5px 5px 5px darkkhaki");
                $("#pageContainer" + PDFViewerApplication.pdfViewer.currentPageNumber)
                    .css("box-shadow", "5px 5px 5px 5px #009ee3");
                SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas
                    .isDrawing = true;
                $(SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas
                    .paper.canvas).css("z-index", "100");
                SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas
                    .drawingType = "freeDraw";
                $("#raphael" + PDFViewerApplication.pdfViewer.currentPageNumber).parent()
                    .children("div:not(:first-child)").addClass("hidden");
                SvgGlobalControllerLogic.enableHammerPan();
                $(".textLayer > div").not(".raphael").hide();
            } else if (drawState === "RECT") {
                $("#pageContainer" + PDFViewerApplication.pdfViewer.currentPageNumber)
                    .css("box-shadow", "5px 5px 5px 5px darkkhaki");
                $("#pageContainer" + PDFViewerApplication.pdfViewer.currentPageNumber)
                    .css("box-shadow", "5px 5px 5px 5px #009ee3");
                SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas
                    .isDrawing = true;
                $(SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas
                    .paper.canvas).css("z-index", "100");
                SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas
                    .drawingType = "rect";
                $("#raphael" + PDFViewerApplication.pdfViewer.currentPageNumber).parent()
                    .children("div:not(:first-child)").addClass("hidden");
                SvgGlobalControllerLogic.enableHammerPan();
                $(".textLayer > div").not(".raphael").hide();
            } else if (drawState === "HIGHLIGHT") {
                $("#pageContainer" + PDFViewerApplication.pdfViewer.currentPageNumber)
                    .css("box-shadow", "5px 5px 5px 5px darkkhaki");
                $("#pageContainer" + PDFViewerApplication.pdfViewer.currentPageNumber)
                    .css("box-shadow", "5px 5px 5px 5px #009ee3");
                SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas
                    .isDrawing = true;
                $(SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas
                    .paper.canvas).css("z-index", "100");
                SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas
                    .drawingType = "highlight";
                $("#raphael" + PDFViewerApplication.pdfViewer.currentPageNumber).parent()
                    .children("div:not(:first-child)").addClass("hidden");
                SvgGlobalControllerLogic.enableHammerPan();
                $(".textLayer > div").not(".raphael").hide();
            } else if (drawState === "CIRC") {
                $("#pageContainer" + PDFViewerApplication.pdfViewer.currentPageNumber)
                    .css("box-shadow", "5px 5px 5px 5px darkkhaki");
                $("#pageContainer" + PDFViewerApplication.pdfViewer.currentPageNumber)
                    .css("box-shadow", "5px 5px 5px 5px #009ee3");
                SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas
                    .isDrawing = true;
                $(SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas
                    .paper.canvas).css("z-index", "100");
                SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas
                    .drawingType = "circ";
                $("#raphael" + PDFViewerApplication.pdfViewer.currentPageNumber).parent()
                    .children("div:not(:first-child)").addClass("hidden");
                SvgGlobalControllerLogic.enableHammerPan();
                $(".textLayer > div").not(".raphael").hide();
            } else if (drawState === "TEXT") {
                $("#pageContainer" + PDFViewerApplication.pdfViewer.currentPageNumber)
                    .css("box-shadow", "5px 5px 5px 5px darkkhaki");
                $("#pageContainer" + PDFViewerApplication.pdfViewer.currentPageNumber)
                    .css("box-shadow", "5px 5px 5px 5px #009ee3");
                SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas
                    .isDrawing = true;
                $(SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas
                    .paper.canvas).css("z-index", "100");
                SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas
                    .drawingType = "text";
                $("#raphael" + PDFViewerApplication.pdfViewer.currentPageNumber).parent()
                    .children("div:not(:first-child)").addClass("hidden");
                SvgGlobalControllerLogic.enableHammerPan();
                $(".textLayer > div").not(".raphael").hide();
            } else if (drawState === "STAMP") {
                $("#pageContainer" + PDFViewerApplication.pdfViewer.currentPageNumber)
                    .css("box-shadow", "5px 5px 5px 5px darkkhaki");
                $("#pageContainer" + PDFViewerApplication.pdfViewer.currentPageNumber)
                    .css("box-shadow", "5px 5px 5px 5px #009ee3");
                SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas
                    .isDrawing = true;
                $(SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas
                    .paper.canvas).css("z-index", "100");
                SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas
                    .drawingType = "stamp";
                $("#raphael" + PDFViewerApplication.pdfViewer.currentPageNumber).parent()
                    .children("div:not(:first-child)").addClass("hidden");
                SvgGlobalControllerLogic.enableHammerPan();
                $(".textLayer > div").not(".raphael").hide();
            } else if (drawState === "CLOUD") {
                $("#pageContainer" + PDFViewerApplication.pdfViewer.currentPageNumber)
                    .css("box-shadow", "5px 5px 5px 5px darkkhaki");
                $("#pageContainer" + PDFViewerApplication.pdfViewer.currentPageNumber)
                    .css("box-shadow", "5px 5px 5px 5px #009ee3");
                SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas
                    .isDrawing = true;
                $(SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas
                    .paper.canvas).css("z-index", "100");
                SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas
                    .drawingType = "cloud";
                $("#raphael" + PDFViewerApplication.pdfViewer.currentPageNumber).parent()
                    .children("div:not(:first-child)").addClass("hidden");
                SvgGlobalControllerLogic.enableHammerPan();
                $(".textLayer > div").not(".raphael").hide();
            } else if (drawState === "CALLOUT") {
                $("#pageContainer" + PDFViewerApplication.pdfViewer.currentPageNumber)
                    .css("box-shadow", "5px 5px 5px 5px darkkhaki");
                $("#pageContainer" + PDFViewerApplication.pdfViewer.currentPageNumber)
                    .css("box-shadow", "5px 5px 5px 5px #009ee3");
                SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas
                    .isDrawing = true;
                $(SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas
                    .paper.canvas).css("z-index", "100");
                SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas
                    .drawingType = "callout";
                $("#raphael" + PDFViewerApplication.pdfViewer.currentPageNumber).parent()
                    .children("div:not(:first-child)").addClass("hidden");
                SvgGlobalControllerLogic.enableHammerPan();
                $(".textLayer > div").not(".raphael").hide();
            } else {
                //AnnotationApplication.CanvasController.activateAllCanvases();
                for (var i = 0; i < AnnotationApplication.CanvasController.activeCanvas.length; i++) {
                    AnnotationApplication.CanvasController.toggleSvgToCanvas(i + 1, true);
                }
            }

        },

        selectAnnotationButton: function(drawState, stampState) {
            var that = AnnotationApplication.Toolbar;
            that.annotationButtons.forEach(
                function(button) {
                    // toggle the annotation buttons
                    if ($('#' + button.id).length) {
                        that.widget.toggle('#' + button.id,
                            (button.drawState === drawState && button.id !== "TwoDViewerAnnStamp"));
                    }
                    if (button.drawState === drawState && button.id !== "TwoDViewerAnnStamp") {
                        $('.' + button.id + 'dropdown').addClass('k-state-selected');
                        if (button.drawState === "DRAW" && button.drawState === drawState) {
                            AnnotationApplication.DrawStateService.showLineSettingsDialog();
                        }
                    } else {
                        $('.' + button.id + 'dropdown').removeClass('k-state-selected');
                        if (button.drawState === "DRAW" && button.drawState !== drawState) {
                            AnnotationApplication.DrawStateService.closeLineSettingsDialog();
                        }
                    }
                }
            );

            that.stampDropdownButtons.forEach(
                function(button) {
                    // toggle the stamp buttons
                    if (button.attributes.src === stampState) {
                        $("a[src='" + button.attributes.src + "']").addClass('k-state-selected');
                    } else {
                        $("a[src='" + button.attributes.src + "']").removeClass('k-state-selected');
                    }
                }
            );

            if (drawState === "SELECT") {
                $("a[drawstate='SELECT']").addClass('k-state-selected');
            } else {
                $("a[drawState='SELECT']").addClass('k-state-selected');
            }
        },

        waitForLoadingOverlay: function(callback) {
            var that = this;
            if ($(".loadingoverlay").length <= 0) {

                setTimeout(function() {
                        that.waitForLoadingOverlay(callback);
                    },
                    500);

            } else {
                callback();
            }
        }
    };

    return TwoDToolbar;

})();
