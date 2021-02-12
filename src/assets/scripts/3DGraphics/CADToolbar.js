var CADToolbar = (function () {
    function CADToolbar() {
        this.widget;
    //    this.versions = [];
    //    this.annotationsHidden = false;
        this.showQR = false;
    //    this.stampsShownInAnnotationDropdown = false;
    //    this.stampDropdownButtons = [
    //        { text: VIEW_RESOURCES.Resource.Approved + " (DE)", spriteCssClass: "far fa-dot-circle", attributes: { "src": "/Scripts/PDFJS/images/DE/stamps-01.svg", "class": "stampButton cultureDE greenIcon  stampApproved" } },
    //        { text: VIEW_RESOURCES.Resource.Final + " (DE)", spriteCssClass: "far fa-dot-circle", attributes: { "src": "/Scripts/PDFJS/images/DE/stamps-02.svg", "class": "stampButton cultureDE greenIcon  stampFinal" } },
    //        { text: VIEW_RESOURCES.Resource.Complete + " (DE)", spriteCssClass: "far fa-dot-circle", attributes: { "src": "/Scripts/PDFJS/images/DE/stamps-03.svg", "class": "stampButton cultureDE greenIcon  stampComplete" } },
    //        { text: VIEW_RESOURCES.Resource.Paid + " (DE)", spriteCssClass: "far fa-dot-circle", attributes: { "src": "/Scripts/PDFJS/images/DE/stamps-11.svg", "class": "stampButton cultureDE greenIcon  stampPaid" } },
    //        { text: VIEW_RESOURCES.Resource.NotApproved + " (DE)", spriteCssClass: "far fa-dot-circle", attributes: { "src": "/Scripts/PDFJS/images/DE/stamps-04.svg", "class": "stampButton cultureDE redIcon    stampNotApproved" } },
    //        { text: VIEW_RESOURCES.Resource.Void + " (DE)", spriteCssClass: "far fa-dot-circle", attributes: { "src": "/Scripts/PDFJS/images/DE/stamps-05.svg", "class": "stampButton cultureDE redIcon    stampVoid" } },
    //        { text: VIEW_RESOURCES.Resource.Confidential + " (DE)", spriteCssClass: "far fa-dot-circle", attributes: { "src": "/Scripts/PDFJS/images/DE/stamps-06.svg", "class": "stampButton cultureDE redIcon    stampConfidential" } },
    //        { text: VIEW_RESOURCES.Resource.NotPaid + " (DE)", spriteCssClass: "far fa-dot-circle", attributes: { "src": "/Scripts/PDFJS/images/DE/stamps-12.svg", "class": "stampButton cultureDE redIcon    stampNotPaid" } },
    //        { text: VIEW_RESOURCES.Resource.Incomplete + " (DE)", spriteCssClass: "far fa-dot-circle", attributes: { "src": "/Scripts/PDFJS/images/DE/stamps-07.svg", "class": "stampButton cultureDE blueIcon   stampIncomplete" } },
    //        { text: VIEW_RESOURCES.Resource.Draft + " (DE)", spriteCssClass: "far fa-dot-circle", attributes: { "src": "/Scripts/PDFJS/images/DE/stamps-08.svg", "class": "stampButton cultureDE blueIcon   stampDraft" } },
    //        { text: VIEW_RESOURCES.Resource.Copy + " (DE)", spriteCssClass: "far fa-dot-circle", attributes: { "src": "/Scripts/PDFJS/images/DE/stamps-09.svg", "class": "stampButton cultureDE blueIcon   stampCopy" } },
    //        { text: VIEW_RESOURCES.Resource.PublicRelease + " (DE)", spriteCssClass: "far fa-dot-circle", attributes: { "src": "/Scripts/PDFJS/images/DE/stamps-10.svg", "class": "stampButton cultureDE blueIcon   stampPublicRelease" } },
    //        { text: VIEW_RESOURCES.Resource.Approved + " (EN)", spriteCssClass: "far fa-dot-circle", attributes: { "src": "/Scripts/PDFJS/images/EN/stamps-01.svg", "class": "stampButton cultureEN greenIcon  stampApproved" } },
    //        { text: VIEW_RESOURCES.Resource.Final + " (EN)", spriteCssClass: "far fa-dot-circle", attributes: { "src": "/Scripts/PDFJS/images/EN/stamps-02.svg", "class": "stampButton cultureEN greenIcon  stampFinal" } },
    //        { text: VIEW_RESOURCES.Resource.Complete + " (EN)", spriteCssClass: "far fa-dot-circle", attributes: { "src": "/Scripts/PDFJS/images/EN/stamps-03.svg", "class": "stampButton cultureEN greenIcon  stampComplete" } },
    //        { text: VIEW_RESOURCES.Resource.Paid + " (EN)", spriteCssClass: "far fa-dot-circle", attributes: { "src": "/Scripts/PDFJS/images/EN/stamps-11.svg", "class": "stampButton cultureEN greenIcon  stampPaid" } },
    //        { text: VIEW_RESOURCES.Resource.NotApproved + " (EN)", spriteCssClass: "far fa-dot-circle", attributes: { "src": "/Scripts/PDFJS/images/EN/stamps-04.svg", "class": "stampButton cultureEN redIcon    stampNotApproved" } },
    //        { text: VIEW_RESOURCES.Resource.Void + " (EN)", spriteCssClass: "far fa-dot-circle", attributes: { "src": "/Scripts/PDFJS/images/EN/stamps-05.svg", "class": "stampButton cultureEN redIcon    stampVoid" } },
    //        { text: VIEW_RESOURCES.Resource.Confidential + " (EN)", spriteCssClass: "far fa-dot-circle", attributes: { "src": "/Scripts/PDFJS/images/EN/stamps-06.svg", "class": "stampButton cultureEN redIcon    stampConfidential" } },
    //        { text: VIEW_RESOURCES.Resource.NotPaid + " (EN)", spriteCssClass: "far fa-dot-circle", attributes: { "src": "/Scripts/PDFJS/images/EN/stamps-12.svg", "class": "stampButton cultureEN redIcon    stampNotPaid" } },
    //        { text: VIEW_RESOURCES.Resource.Incomplete + " (EN)", spriteCssClass: "far fa-dot-circle", attributes: { "src": "/Scripts/PDFJS/images/EN/stamps-07.svg", "class": "stampButton cultureEN blueIcon   stampIncomplete" } },
    //        { text: VIEW_RESOURCES.Resource.Draft + " (EN)", spriteCssClass: "far fa-dot-circle", attributes: { "src": "/Scripts/PDFJS/images/EN/stamps-08.svg", "class": "stampButton cultureEN blueIcon   stampDraft" } },
    //        { text: VIEW_RESOURCES.Resource.Copy + " (EN)", spriteCssClass: "far fa-dot-circle", attributes: { "src": "/Scripts/PDFJS/images/EN/stamps-09.svg", "class": "stampButton cultureEN blueIcon   stampCopy" } },
    //        { text: VIEW_RESOURCES.Resource.PublicRelease + " (EN)", spriteCssClass: "far fa-dot-circle", attributes: { "src": "/Scripts/PDFJS/images/EN/stamps-10.svg", "class": "stampButton cultureEN blueIcon   stampPublicRelease" } }
    //    ];
    //    this.annotationButtons = [
    //        {
    //            id: "TwoDViewerAnnRect",
    //            name: VIEW_RESOURCES.Resource.DrawRectangle,
    //            drawState: "RECT",
    //            img: "/Content/images/DocumentViewer/Asset1.png"
    //        },
    //        {
    //            id: "TwoDViewerAnnCirc",
    //            name: VIEW_RESOURCES.Resource.DrawCircle,
    //            drawState: "CIRC",
    //            img: '/Content/images/DocumentViewer/Asset2.png'
    //        },
    //        {
    //            id: "TwoDViewerAnnLine",
    //            name: VIEW_RESOURCES.Resource.DrawLine,
    //            drawState: "LINE",
    //            img: '/Content/images/DocumentViewer/Asset3.png'
    //        },
    //        {
    //            id: "TwoDViewerAnnDraw",
    //            name: VIEW_RESOURCES.Resource.FreeDraw,
    //            drawState: "DRAW",
    //            img: '/Content/images/DocumentViewer/Asset38.png'
    //        },
    //        {
    //            id: "TwoDViewerAnnMeasure",
    //            name: VIEW_RESOURCES.Resource.MeasurementTool,
    //            drawState: "MEASURE",
    //            img: '/Content/images/DocumentViewer/Asset4.png'
    //        },
    //        {
    //            id: "TwoDViewerAnnCallout",
    //            name: VIEW_RESOURCES.Resource.Callout,
    //            drawState: "CALLOUT",
    //            img: '/Content/images/DocumentViewer/Asset6.png'
    //        },
    //        {
    //            id: "TwoDViewerAnnTextTag",
    //            name: VIEW_RESOURCES.Resource.Tag,
    //            drawState: "TEXTTAG",
    //            sprite: 'far fa-map-marker fa-2x',
    //            //enabled: false
    //        },
    //        {
    //            id: "TwoDViewerAnnText",
    //            name: VIEW_RESOURCES.Resource.TextBox,
    //            drawState: "TEXT",
    //            img: '/Content/images/DocumentViewer/Asset7.png'
    //        },
    //        {
    //            id: "TwoDViewerAnnCustom",
    //            name: VIEW_RESOURCES.Resource.CustomShape,
    //            drawState: "CUSTOM",
    //            img: '/Content/images/DocumentViewer/Asset8.png'
    //        },
    //        {
    //            id: "TwoDViewerAnnHighlight",
    //            name: VIEW_RESOURCES.Resource.HighlightText,
    //            drawState: "HIGHLIGHT",
    //            img: '/Content/images/DocumentViewer/Asset9.png'
    //        },
    //        {
    //            id: "TwoDViewerAnnCloud",
    //            name: VIEW_RESOURCES.Resource.Cloud,
    //            drawState: "CLOUD",
    //            img: '/Content/images/DocumentViewer/Asset5.png'
    //        },
    //        {
    //            id: "TwoDViewerAnnImageUpload",
    //            name: VIEW_RESOURCES.Resource.ImageUpload,
    //            drawState: "IMAGEUPLOAD",
    //            img: '/Content/images/DocumentViewer/Asset33.png'
    //        },
    //        {
    //            id: "TwoDViewerAnnStamp",
    //            name: VIEW_RESOURCES.Resource.Stamp,
    //            drawState: "STAMP",
    //            img: '/Content/images/DocumentViewer/Asset11.png',
    //            menuButtons: this.stampDropdownButtons,
    //            overflow: "never",
    //            click: function (e) {
    //                AnnotationApplication.Toolbar.onDrawAnnotationClick("STAMP", e.target.attr('src'));
    //            }
    //        }
    //    ];

    }

    CADToolbar.prototype = {

        constructor: CADToolbar,

        destroyToolbar: function () {
            if (this.widget) {
                this.widget.destroy();
                $("#ToolbarCAD").empty();
            }
        },

        createToolbar: function () {

            var that = this;
            this.DocumentId = AnnotationApplication.documentId;
            this.selectedVersionId = AnnotationApplication.documentVersionId;
            this.showQR = false;
            var dropdown = $('#TwoVersionDropdown');
            try {
                $(dropdown).data("kendoDropDownList").destroy();
            } catch (e) { console.log("clearing version dropdown failed"); }

            //if (typeof this.DocumentId !== "undefined") {

                var createToolbarCallback = function () {
                    that.destroyToolbar();
                    $("#ToolbarCAD").kendoToolBar({
                        resizable: false,
                        open: function (e) {
                                //var toolBarButtons = that.annotationButtons; // all elemtents in the toolbar
                                //toolBarButtons.forEach(
                                //    function (buttonProps) {
                                //        //var toolBarButton = toolBarButtons[toolBarButtonIndex];
                                //        var id = buttonProps.id;
                                //        var dropdownElement = $('a.' + id + 'dropdown');
                                //        if ($('#' + id).css('display') === 'none' || $('#' + id).parent().css('display') === 'none') {
                                //            that.widget.show(dropdownElement);
                                //        } else {
                                //            that.widget.hide(dropdownElement);
                                //        }
                                //    }
                                //);

                        }

                    });
                    that.widget = $("#ToolbarCAD").data("kendoToolBar");

                    that.createToolbarButtons();

                    $('.k-list-container.k-split-container, .k-overflow-container.k-list-container')
                        .addClass('ViewerButtonDropdown k-overflow-container');
                    that.widget.resize();

                    //$('.ViewerButtonDropdown').children().addClass('ViewerButton');

                    //$('#TwoDAnnotationDropdown_optionlist li.ViewerButton a').contents().filter(function () {
                    //    return this.nodeType === 3;
                    //}).wrap('<span class="k-text"></span>');
                    //$('#TwoDViewerAnnStamp_optionlist li.ViewerButton a').contents().filter(function () {
                    //    return this.nodeType === 3;
                    //}).wrap('<span class="k-text"></span>');
                    $(document).ready(function (e) {
                        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
                            $('[data-toggle="tooltip"]').tooltip('destroy');
                        }
                        else {
                            $('[data-toggle="tooltip"]').tooltip({
                                trigger: 'hover',
                                container: 'body'
                            });
                            $('[data-toggle="tooltip"]').on('click', function () {
                                $(this).blur();
                            });
                        }
                    });
                }

                if (ProjectId !== null && ProjectId !== "" && ROLE !== "Anonymous") {
                    //FileOperationLogic.getDocumentVersionObjects(this.DocumentId,
                    //    function (versions) {
                    //        that.versions = [];
                    //        Object.keys(versions).forEach(function (v) {
                    //            that.versions.push(versions[v]);
                    //        });
                    //        that.versions = that.versions.sort(function (a, b) {
                    //            return kendo.parseDate(b.VersionCreatedOn) < kendo.parseDate(a.VersionCreatedOn);
                    //        });

                    //        if (!that.selectedVersionId) { that.selectedVersionId = that.versions[that.versions.length - 1].DocumentVersionId; }

                    //        that.showImportButton = (
                    //            that.versions.length > 1
                    //            && (that.selectedVersionId === null ||
                    //                that.selectedVersionId === that.versions[that.versions.length - 1].DocumentVersionId
                    //            )
                    //        );
                            createToolbarCallback();
                    //    },
                    //    FileOperationLogic.onFailedFileOperation
                    //);
                } else {
                    createToolbarCallback();
                }
            //}
        },

        addAnnotationDropdown: function () {
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
                    text: VIEW_RESOURCES.Resource.SelectAnnotations +" / Selection Box" ,
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

            this.annotationButtons.forEach(function (prop) {
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
                text: VIEW_RESOURCES.Resource.DownloadAnnotations,
                //imageUrl: "/Content/images/DocumentViewer/Asset30.png",
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
                    text: "",
                    attributes: { "class": "k-separator hideOnStampsUnhide" }
                },
                {
                    text: VIEW_RESOURCES.Resource.DeleteAnnotation,
                    //imageUrl: "/Content/images/DocumentViewer/Asset24.png",
                    spriteCssClass: "far fa-trash-alt",
                    attributes: { "class": "ViewerButton DeleteAnnotation hideOnStampsUnhide" },
                    enable: false
                },
                {
                    //imageUrl: "/Content/images/DocumentViewer/Asset23.png",
                    spriteCssClass: "far fa-file-import",
                    text: VIEW_RESOURCES.Resource.ImportAnnotations,
                    enable: this.showImportButton,
                    attributes: { "class": "annotationButton ViewerButton ImportAnnotationsdropdown hideOnStampsUnhide" }
                });

            this.stampDropdownButtons.forEach(function (prop) {
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
                //imageUrl: "/Content/images/DocumentViewer/Asset13.png",
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
                click: function (e) {
                    if (e.target.hasClass('HideAnnotations')) {
                        that.annotationsHidden = true;
                        $(".canvas-container").addClass("hidden");
                        $(".textLayer").each(function (i, e) { $(e).first('svg').addClass('hidden') });
                    } else if (e.target.hasClass('ShowAnnotations')) {
                        that.annotationsHidden = false;
                        $(".canvas-container").removeClass("hidden");
                        $(".textLayer").each(function (i, e) { $(e).first('svg').removeClass('hidden') });
                    } else if (e.target.hasClass('DownloadWithAnnotations')) {
                        that.downloadDocWithAnnotations();
                    } else if (e.target.hasClass('DownloadWithoutAnnotations')) {
                        //PDFViewerApplication.eventBus.dispatch('download');
                    } else if (e.target.hasClass('DeleteAnnotation')) {
                        var objSelected = that.canvas.getActiveObject();
                        if (objSelected) {
                            AnnotationApplication.CRUDController.prepareDelete(objSelected, that.canvas);
                            AnnotationApplication.CanvasController.removeAllJoints(that.canvas);
                        }

                    } else if (e.target.hasClass('ImportAnnotationsdropdown')) {
                        FileOperationLogic.importAnnotations({ DocumentId: AnnotationApplication.documentId, DocumentVersionId: AnnotationApplication.documentVersionId, ProjectId: AnnotationApplication.projectId });
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


            var addButton = function (prop) {

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
                    toggle: function (e) { that.onDrawAnnotationClick(prop.drawState) },
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

                if (prop.enabled === false) { buttonDef.enable = false }

                that.widget.add(buttonDef);
            }

            // actually add the buttons
            this.annotationButtons.reverse().forEach(function(prop) {
                addButton(prop);
            });
        },


        createPageNumberInput: function () {

            //this.widget.add({
            //    template: '<div id="CADToolbarPageNumberInputContainer" class="displayInlineBlock">' +
            //        '<label id="CADToolbarPageNumberLabel" class="toolbarLabel" for="CADToolbarPageNumberInput" data-l10n-id="page_label">' + VIEW_RESOURCES.Resource.Page + ': </label>' +
            //        '<input type="number" id="CADToolbarPageNumberInput" class="toolbarField pageNumber" value="1" size="8" min="1"></input>' +
            //        '<span id="CADToolbarNumPages" class="toolbarLabel"></span>' +
            //        '</div>',
            //    overflowTemplate: '<div id="CADToolbarPageNumberInputContainerOverflow" class="hidden">',
            //    attributes: {
            //        class: "ViewerButton floatLeft"
            //    }
            //});

            // let viewer.js update
            //PDFViewerApplication.toolbar.items.numPages = document.getElementById('CADToolbarNumPages');
            //PDFViewerApplication.toolbar.items.pageNumber = document.getElementById('CADToolbarPageNumberInput');

            //// add listeners
            //$('#CADToolbarPageNumberInput').click(function (e) { PDFViewerApplication.toolbar.select(); });
            //$('#CADToolbarPageNumberInput').change(function (e) {
            //    PDFViewerApplication.pdfViewer.currentPageLabel = e.originalEvent.target.value;
            //    if (e.originalEvent.target.value !== PDFViewerApplication.pdfViewer.currentPageNumber.toString() && e.originalEvent.target.value !== PDFViewerApplication.pdfViewer.currentPageLabel) {
            //        PDFViewerApplication.toolbar.setPageNumber(PDFViewerApplication.pdfViewer.currentPageNumber, PDFViewerApplication.pdfViewer.currentPageLabel);
            //    }
            //});
        },

        createToolbarSearchMenuButtons: function () {
            //this.searchMenu.append(
            //    [{
            //        text: '<div class="findButton"><label for="findInput" class="toolbarLabel" data-l10n-id="find_label">' + VIEW_RESOURCES.Resource.Find + ':</label><input id="CADToolbarFindInput" class="toolbarField" oninput="PDFViewerApplication.findBar.dispatchEvent(' + "''" + ');"></div>',
            //        encoded: false,
            //    },
            //    {
            //        text: "",
            //        cssClass: "findButton findPrevious",
            //        spriteCssClass: "far fa-chevron-up"
            //    },
            //    {
            //        text: "",
            //        cssClass: "findButton findNext",
            //        spriteCssClass: "far fa-chevron-down"
            //    },
            //    {
            //        text: '<div class="findButton"><input type="checkbox" id="CADToolbarFindHighlightAll" class="toolbarField" onchange="PDFViewerApplication.findBar.dispatchEvent(' + "'highlightallchange'" + ');"></input><label for="findHighlightAll" class="toolbarLabel" data-l10n-id="find_highlight">' + VIEW_RESOURCES.Resource.HighlightAll + '</label></div>',
            //        encoded: false,
            //        //text: VIEW_RESOURCES.Resource.HighlightAll,
            //        //cssClass: "findButton findHighlightAll",
            //    },
            //    {
            //        text: '<div class="findButton" ><input type="checkbox" id="CADToolbarFindMatchCase" class="toolbarField" onchange="PDFViewerApplication.findBar.dispatchEvent(' + "'casesensitivitychange'" + ');"></input><label for="findMatchCase" class="toolbarLabel" data-l10n-id="find_match_case_label">' + VIEW_RESOURCES.Resource.Matchcase + '</label></div>',
            //        encoded: false,
            //        //text: VIEW_RESOURCES.Resource.Matchcase,
            //        //cssClass: "findButton findMatchCase",
            //    },
            //    {
            //        text: '<div class="findButton"  style="width: 100px"><span id="CADToolbarFindResultsCount" class="toolbarLabel hidden"></span><span id="CADToolbarFindMsg" class="toolbarLabel"></span></div>',
            //        encoded: false
            //    }
            //    ]
            //);

            //// tooltips
            //$('.findPrevious').attr("title", VIEW_RESOURCES.Resource.Previous).attr("data-toggle", "tooltip").attr("data-placement", "bottom");
            //$('.findNext').attr("title", VIEW_RESOURCES.Resource.Next).attr("data-toggle", "tooltip").attr("data-placement", "bottom");

            //// search functionality connection to viewer.js
            //PDFViewerApplication.findBar.findField = document.getElementById('CADToolbarFindInput');
            //PDFViewerApplication.findBar.findMsg = document.getElementById('CADToolbarFindMsg');
            //PDFViewerApplication.findBar.findResultsCount = document.getElementById('CADToolbarFindResultsCount');
            //PDFViewerApplication.findBar.highlightAll = document.getElementById('CADToolbarFindHighlightAll');
            //PDFViewerApplication.findBar.caseSensitive = document.getElementById('CADToolbarFindMatchCase');

            //// additional triggers
            //$('.findButton.findPrevious').click(function (e) { PDFViewerApplication.findBar.dispatchEvent('again', true); });
            //$('.findButton.findNext').click(function (e) { PDFViewerApplication.findBar.dispatchEvent('again', false); });
        },

        createVersionSplitButton: function () {
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
                    enable: (this.versions[i].DocumentVersionId !== this.selectedVersionId)
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
                    click: function (e) {
                        var version = e.target.attr('id');
                        if (version !== "TwoDVersionDropdown") {
                            FileOperationLogic.downloadItem(
                                that.DocumentId,
                                version,
                                ".pdf",
                                function (url) {
                                    AnnotationApplication.Utils.openNewFile(url, that.DocumentId, version);
                                }
                            );
                        }
                    }
                });
        },

        createToolbarButtons: function () {
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
                        click: function (e) { navigateToPane.NavigateToPane('center-pane', $('#vertical').data('kendoSplitter')); }
                    }
                );

                this.widget.add({ type: "separator", attributes: { class: "floatLeft" } });

            }

            //if (ROLE !== "Anonymous") {
            //    this.widget.add({ type: "separator", attributes: { class: "floatLeft" } });

            //    this.createVersionSplitButton();
            //}

            //this.widget.add({ type: "separator", attributes: { class: "floatLeft" } });

            
            //////////////////// some that wil always be in the dropdown ///////////////////////////


            //////////////////// center buttons ///////////////////////////
            this.widget.add(
                {
                    type: "buttonGroup",
                    buttons: [
                        {
                           type: "button",
                           id: "CADToolbarZoomIn",
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
                               //PDFViewerApplication.toolbar.eventBus.dispatch('zoomin');
                               //alert("zoom in");
                               cadViewer.zoomIn();
                           },
                           group: "zoomButtons"
                        },
                        {
                           type: "button",
                           id: "CADToolbarZoomOut",
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
                               //PDFViewerApplication.toolbar.eventBus.dispatch('zoomout');
                               //alert("zoom out");
                               cadViewer.zoomOut();
                           },
                           group: "zoomButtons"
                        }
                    ],
                    overflow: "auto"
                });

            //PDFViewerApplication.toolbar.items.zoomIn = document.getElementById('CADToolbarZoomIn');

            //PDFViewerApplication.toolbar.items.zoomOut = document.getElementById('CADToolbarZoomOut');

            //this.widget.add(
            //    {
            //        type: "splitButton",
            //        id: "ToggleZoomLevelButton",
            //        text: VIEW_RESOURCES.Resource.AutomaticZoom,
            //        attributes: {
            //            "value": "auto",
            //            class: "ViewerButton",
            //            "data-original-title": VIEW_RESOURCES.Resource.Zoom,
            //            "data-toggle": "tooltip",
            //            "data-placement": "bottom"
            //        },
            //        menuButtons: [
            //            { id: "pageAutoOption", attributes: { "class": "zoomleveloption", "value": "auto" }, text: VIEW_RESOURCES.Resource.AutomaticZoom, selected: true },
            //            { id: "pageActualOption", attributes: { "class": "zoomleveloption", "value": "page-actual" }, text: VIEW_RESOURCES.Resource.ActualSize },
            //            { id: "pageFitOption", attributes: { "class": "zoomleveloption", "value": "page-fit" }, text: VIEW_RESOURCES.Resource.FitPage },
            //            { id: "pageWidthOption", attributes: { "class": "zoomleveloption", "value": "page-width" }, text: VIEW_RESOURCES.Resource.FullWidth },
            //            { attributes: { "class": "zoomleveloption", "value": "0.5" }, text: "50%" },
            //            { attributes: { "class": "zoomleveloption", "value": "0.75" }, text: "75%" },
            //            { attributes: { "class": "zoomleveloption", "value": "1" }, text: "100%" },
            //            { attributes: { "class": "zoomleveloption", "value": "1.25" }, text: "125%" },
            //            { attributes: { "class": "zoomleveloption", "value": "1.5" }, text: "150%" },
            //            { attributes: { "class": "zoomleveloption", "value": "2" }, text: "200%" },
            //            { attributes: { "class": "zoomleveloption", "value": "3" }, text: "300%" },
            //            { attributes: { "class": "zoomleveloption", "value": "4" }, text: "400%" },
            //            { attributes: { "class": "zoomleveloption", "value": "5" }, text: "500%" },
            //            { attributes: { "class": "zoomleveloption", "value": "6" }, text: "600%" }
            //        ],
            //        click: function (e) {
            //            PDFViewerApplication.pdfViewer.currentScaleValue = e.target.attr("value");
            //            if (typeof AnnotationApplication.CanvasController !== "undefined") {
            //                AnnotationApplication.CanvasController.scaleCanvas();
            //                AnnotationApplication.CanvasController.scaleAnnotations();
            //            }
            //        }
            //    });
            //PDFViewerApplication.toolbar.items.scaleSelect = document.getElementById('ToggleZoomLevelButton');

            this.widget.add({ // only shows in overflow
                overflow: "always",
                template: "<div class='hidden'></div>",
                overflowTemplate: "<div class='k-separator'></div>"
            });
            

            //////////////////// right buttons, ordered from right to left ///////////////////////////

            //this.widget.add({ // spacer
            //    overflow: "never",
            //    template: "<div style='height: 10px; width:52px'></div>",
            //    attributes: { class: "floatRight" }
            //});

            //this.widget.add({ // only shows in overflow
            //    overflow: "auto",
            //    template: "<div class='hidden'></div>",
            //    overflowTemplate: "<div class='k-separator'></div>"
            //});


            //if (ProjectId != null && ProjectId != "" && AnnotationApplication.viewerType !== "EMS" && ROLE !== "Anonymous") {
            //    this.addAnnotationDropdown();
            //}

            //if (ProjectId != null && ProjectId != "" && ROLE !== "Anonymous" && AnnotationApplication.viewerType === "EMS") {
            //    var importText = VIEW_RESOURCES.Resource.Import;
            //    this.widget.add({
            //        type: "button",
            //        id: "ImportAnnotations",
            //        imageUrl: "/Content/images/DocumentViewer/Asset23.png",
            //        text: importText,
            //        showText: "overflow",
            //        enable: this.showImportButton,
            //        attributes: {
            //            class: "floatRight ViewerButton annotationButton",
            //            "data-original-title": importText,
            //            "data-toggle": "tooltip",
            //            "data-placement": "bottom"
            //        },
            //        click: function (e) {
            //            FileOperationLogic.importAnnotations({ DocumentId: AnnotationApplication.documentId, DocumentVersionId: AnnotationApplication.documentVersionId, ProjectId: AnnotationApplication.projectId });
            //        }
            //    });
            //}

            //if (AnnotationApplication.viewerType !== "EMS" && ROLE !== "Anonymous") {

            //    this.widget.add({
            //        type: "button",
            //        id: "TwoDshareButton",
            //        spriteCssClass: "far fa-share-alt fa-2x",
            //        text: VIEW_RESOURCES.Resource.ShareDocument,
            //        showText: "overflow",
            //        attributes: {
            //            class: "floatRight ViewerButton",
            //            "data-original-title": VIEW_RESOURCES.Resource.ShareDocument,
            //            "data-toggle": "tooltip",
            //            "data-placement": "bottom"
            //        },
            //        click: function (e) {
            //            showShareDialog("DOCUMENT", AnnotationApplication.documentVersionId);
            //        }
            //    });

            //    this.widget.add({ type: "separator", attributes: { class: "floatRight" } });

            //    //id, name, drawState, icon
            //}

            //if (ProjectId !== null && ProjectId !== "" && AnnotationApplication.viewerType !== "EMS" && ROLE !== "Anonymous") {
            //    this.addAnnotationToolbarButtons();

            //}

            //if (AnnotationApplication.viewerType === "EMS") {

               //this.widget.add({
               //    type: "button",
               //    togglable: true,
               //    id: "TwoDFilterStatus",
               //    //imageUrl: "/Content/images/DocumentViewer/Asset25.png",
               //    spriteCssClass: "far fa-filter",
               //    text: VIEW_RESOURCES.Resource.StatusOn,
               //    showText: "overflow",
               //    selected: FilterStatusesLogic.isStatusVisible,
               //    attributes: {
               //        class: "floatRight ViewerButton statusOn",
               //        "data-original-title": VIEW_RESOURCES.Resource.StatusOn,
               //        "data-toggle": "tooltip",
               //        "data-placement": "bottom"
               //    },
               //    toggle: function (e) {
               //        if(!cadViewer.isStatusVisible){
               //             cadViewer.setStatusVisible(!cadViewer.isStatusVisible);
               //             cadViewer.isStatusVisible = !cadViewer.isStatusVisible
               //        }else{
               //             cadViewer.setStatusVisible(!cadViewer.isStatusVisible);
               //             cadViewer.isStatusVisible = !cadViewer.isStatusVisible
               //        }
                       
               //    }
               //});

               this.widget.add({
                   type: "button",
                   togglable: true,
                   selected: cadViewer.showQR,
                   id: "CADShowQRButton",
                   spriteCssClass: "far fa-qrcode",
                   text: VIEW_RESOURCES.Resource.QRCodes,
                   showText: "overflow",
                   attributes: {
                       class: "floatRight ViewerButton",
                       "data-original-title": VIEW_RESOURCES.Resource.QRCodes,
                       "data-toggle": "tooltip",
                       "data-placement": "bottom"
                   },
                   toggle: function (e) {
                       if (!cadViewer.showQR) {
                            cadViewer.showQrCodes();
                            cadViewer.showQR = true;
                       } else {
                            cadViewer.hideQrCodes();
                            cadViewer.showQR = false;
                       }
                   }
               });

               this.widget.add({
                type: "button",
                //togglable: true,
                //selected: cadViewer.showQR,
                id: "rotateCW",
                spriteCssClass: "far fa-redo",
                   text: VIEW_RESOURCES.Resource.QRRotate,
                showText: "overflow",
                attributes: {
                    class: "floatRight ViewerButton",
                    "data-original-title": VIEW_RESOURCES.Resource.QRRotate,
                    "data-toggle": "tooltip",
                    "data-placement": "bottom"
                },
                click: function(e){
                    var that = cadViewer;
                    var angleRad = (that.angle + 90) * Math.PI / 180;
                    var dx = 1.1 * Math.max(that.maxX, -1 * that.minX);
                    var dy = 1.1 * Math.max(that.maxY, -1 * that.minY);
                    that.calculateScale(Math.abs(dx * Math.cos(angleRad)) + Math.abs(dy * Math.sin(angleRad)), Math.abs(dx * Math.sin(angleRad)) + Math.abs(dy * Math.cos(angleRad)), false);
                    that.applyScale(that.scale, that.angle + 90);

                    if(that.showQR === true){
                        that.clearQrCodes();
                        that.showQrCodes();
                        that.showQR = true
                    }else{
                        that.clearQrCodes();
                    }
                }
            });

            //    this.widget.add({
            //        type: "button",
            //        id: "DownloadWithAnnotations",
            //        imageUrl: "/Content/images/DocumentViewer/Asset30.png",
            //        text: VIEW_RESOURCES.Resource.DownloadAnnotations,
            //        showText: "overflow",
            //        attributes: {
            //            class: "floatRight ViewerButton",
            //            "data-original-title": VIEW_RESOURCES.Resource.DownloadAnnotations,
            //            "data-toggle": "tooltip",
            //            "data-placement": "bottom"
            //        },
            //        click: function (e) {
            //            cadViewer.downloadImage();
            //        }
            //    });
            //}
               /*
            this.widget.add({
                type: "button",
                id: "DownloadWithAnnotations",
                imageUrl: "/Content/images/DocumentViewer/Asset30.png",
                text: VIEW_RESOURCES.Resource.DownloadAnnotations,
                showText: "overflow",
                attributes: {
                    class: "floatRight ViewerButton",
                    "data-original-title": VIEW_RESOURCES.Resource.DownloadAnnotations,
                    "data-toggle": "tooltip",
                    "data-placement": "bottom"
                },
                click: function (e) {
                    cadViewer.downloadImage();
                }
            });
            */

            this.widget.add({
                type: "splitButton",
                id: "DownloadWithAnnotations",
                spriteCssClass: "icon-DownloadWithAnnotations",
                //imageUrl: "/Content/images/DocumentViewer/Asset30.png",
                text: VIEW_RESOURCES.Resource.DownloadTags,
                showText: "overflow",
                attributes: {
                    class: "ViewerButton",
                    "data-original-title": VIEW_RESOURCES.Resource.DownloadTags,
                    "data-toggle": "tooltip",
                    "data-placement": "bottom"
                },
                menuButtons: [
                    { 
                        text: "As PNG",
                        click: function(e){
                            cadViewer.downloadImageAsPng();
                        }
                    },
                    { 
                        text: "As SVG",
                        click: function(e){
                            cadViewer.downloadImageAsSvg();
                        }
                    }
                ]
            });
            $("#DownloadWithAnnotations_wrapper").addClass("floatRight");

            //if (ProjectId === null || ProjectId === "" || ROLE === "Anonymous" || AnnotationApplication.viewerType === "EMS") {
            //    this.widget.add({
            //        type: "button",
            //        id: "DownloadWithoutAnnotations",
            //        imageUrl: "/Content/images/DocumentViewer/Asset28.png",
            //        text: VIEW_RESOURCES.Resource.Download,
            //        showText: "overflow",
            //        attributes: {
            //            class: "floatRight ViewerButton",
            //            "data-original-title": VIEW_RESOURCES.Resource.Download,
            //            "data-toggle": "tooltip",
            //            "data-placement": "bottom"
            //        },
            //        click: function (e) {
            //            PDFViewerApplication.eventBus.dispatch('download');
            //        }
            //    });
            //}


        },

        downloadDocWithAnnotations: function () {
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

        onDrawAnnotationClick: function (drawState, stampState) {
            var drawstate = AnnotationApplication.DrawStateService.getDrawState();

            if (drawstate === drawState) {
                if (drawState === "DRAW") {
                    //AnnotationApplication.CanvasController.getCurrentCanvas().fabric.isDrawingMode = false;
                    SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.isDrawing = false;
                    SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.stopDrawing();

                }
                drawState = "SELECT";
                stampState = "";
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
                SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.drawTextTag();

            } else if (drawState === "IMAGEUPLOAD") {
                AnnotationApplication.ImageUploadController.uploadImage(function (img) {
                    SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.uploadedImage = img;
                    SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.isDrawing = true;
                    $(SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.paper.canvas).css("z-index", "100");
                    SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.drawingType = "image";
                });

            }

            if (drawState === "SELECT") {
                //AnnotationApplication.CanvasController.deactivateAllCanvases();
                for (var i = 0; i < AnnotationApplication.CanvasController.activeCanvas.length; i++) {
                    AnnotationApplication.CanvasController.toggleSvgToCanvas(i + 1, false);
                }
                SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.isDrawing = false;
                SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.drawingType = "select";
                $("#raphael"+PDFViewerApplication.pdfViewer.currentPageNumber).parent().children("div:not(:first-child)").removeClass("hidden");
                SvgGlobalControllerLogic.enableHammerPan();
                //AnnotationApplication.DrawStateService.setDrawState("ok");
            } else if (drawState === "LINE") {
                // why z-index? because it is needed to be on top of 
                // all other elements in the textLayer when drawing. 
                // Here I set the value. See "SvgController.js"
                SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.isDrawing = true;
                $(SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.paper.canvas).css("z-index", "100");
                SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.drawingType = "line";
                $("#raphael"+PDFViewerApplication.pdfViewer.currentPageNumber).parent().children("div:not(:first-child)").addClass("hidden");
                SvgGlobalControllerLogic.enableHammerPan();
            } else if (drawState === "CUSTOM") {
                SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.isDrawing = true;
                $(SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.paper.canvas).css("z-index", "100");
                SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.drawingType = "polyline";
                $("#raphael"+PDFViewerApplication.pdfViewer.currentPageNumber).parent().children("div:not(:first-child)").addClass("hidden");
                SvgGlobalControllerLogic.enableHammerPan();
            } else if (drawState === "MEASURE") {
                SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.isDrawing = true;
                $(SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.paper.canvas).css("z-index", "100");
                SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.drawingType = "measurementbasic";
                $("#raphael"+PDFViewerApplication.pdfViewer.currentPageNumber).parent().children("div:not(:first-child)").addClass("hidden");
                SvgGlobalControllerLogic.enableHammerPan();
            } else if (drawState === "DRAW") {
                SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.isDrawing = true;
                $(SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.paper.canvas).css("z-index", "100");
                SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.drawingType = "freeDraw";
                $("#raphael"+PDFViewerApplication.pdfViewer.currentPageNumber).parent().children("div:not(:first-child)").addClass("hidden");
                SvgGlobalControllerLogic.enableHammerPan();
            } else if (drawState === "RECT") {
                SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.isDrawing = true;
                $(SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.paper.canvas).css("z-index", "100");
                SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.drawingType = "rect";
                $("#raphael"+PDFViewerApplication.pdfViewer.currentPageNumber).parent().children("div:not(:first-child)").addClass("hidden");
                SvgGlobalControllerLogic.enableHammerPan();
            } else if (drawState === "HIGHLIGHT") {
                SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.isDrawing = true;
                $(SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.paper.canvas).css("z-index", "100");
                SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.drawingType = "highlight";
                $("#raphael"+PDFViewerApplication.pdfViewer.currentPageNumber).parent().children("div:not(:first-child)").addClass("hidden");
                SvgGlobalControllerLogic.enableHammerPan();
            } else if (drawState === "CIRC") {
                SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.isDrawing = true;
                $(SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.paper.canvas).css("z-index", "100");
                SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.drawingType = "circ";
                $("#raphael"+PDFViewerApplication.pdfViewer.currentPageNumber).parent().children("div:not(:first-child)").addClass("hidden");
                SvgGlobalControllerLogic.enableHammerPan();
            } else if (drawState === "TEXT") {
                SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.isDrawing = true;
                $(SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.paper.canvas).css("z-index", "100");
                SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.drawingType = "text";
                $("#raphael"+PDFViewerApplication.pdfViewer.currentPageNumber).parent().children("div:not(:first-child)").addClass("hidden");
                SvgGlobalControllerLogic.enableHammerPan();
            } else if (drawState === "STAMP") {
                SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.isDrawing = true;
                $(SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.paper.canvas).css("z-index", "100");
                SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.drawingType = "stamp";
                $("#raphael"+PDFViewerApplication.pdfViewer.currentPageNumber).parent().children("div:not(:first-child)").addClass("hidden");
                SvgGlobalControllerLogic.enableHammerPan();
            } else if (drawState === "CLOUD") {
                SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.isDrawing = true;
                $(SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.paper.canvas).css("z-index", "100");
                SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.drawingType = "cloud";
                $("#raphael"+PDFViewerApplication.pdfViewer.currentPageNumber).parent().children("div:not(:first-child)").addClass("hidden");
                SvgGlobalControllerLogic.enableHammerPan();
            } else if (drawState === "CALLOUT") {
                SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.isDrawing = true;
                $(SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.paper.canvas).css("z-index", "100");
                SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas.drawingType = "callout";
                $("#raphael"+PDFViewerApplication.pdfViewer.currentPageNumber).parent().children("div:not(:first-child)").addClass("hidden");
                SvgGlobalControllerLogic.enableHammerPan();
            } else {
                //AnnotationApplication.CanvasController.activateAllCanvases();
                for (var i = 0; i < AnnotationApplication.CanvasController.activeCanvas.length; i++) {
                    AnnotationApplication.CanvasController.toggleSvgToCanvas(i + 1, true);
                }
            }

        },

        //selectAnnotationButton: function (drawState, stampState) {
        //    var that = AnnotationApplication.Toolbar;
        //    that.annotationButtons.forEach(
        //        function(button) {
        //            // toggle the annotation buttons
        //            if ($('#' + button.id).length) {
        //                that.widget.toggle('#' + button.id,
        //                    (button.drawState === drawState && button.id !== "TwoDViewerAnnStamp"));
        //            }
        //            if (button.drawState === drawState && button.id !== "TwoDViewerAnnStamp") {
        //                $('.' + button.id + 'dropdown').addClass('k-state-selected');
        //                if (button.drawState === "DRAW" && button.drawState === drawState) {
        //                    AnnotationApplication.DrawStateService.showLineSettingsDialog();
        //                }
        //            } else {
        //                $('.' + button.id + 'dropdown').removeClass('k-state-selected');
        //                if (button.drawState === "DRAW" && button.drawState !== drawState) {
        //                    AnnotationApplication.DrawStateService.closeLineSettingsDialog();
        //                }
        //            }
        //        }
        //    );

        //    that.stampDropdownButtons.forEach(
        //        function (button) {
        //            // toggle the stamp buttons
        //            if (button.attributes.src === stampState) {
        //                $("a[src='" + button.attributes.src + "']").addClass('k-state-selected');
        //            } else {
        //                $("a[src='" + button.attributes.src + "']").removeClass('k-state-selected');
        //            }
        //        }
        //    );

        //    if (drawState === "SELECT") {
        //        $("a[drawstate='SELECT']").addClass('k-state-selected');
        //    } else {
        //        $("a[drawState='SELECT']").addClass('k-state-selected');
        //    }
        //},

        waitForLoadingOverlay: function (callback) {
            var that = this;
            if ($(".loadingoverlay").length <= 0) {

                setTimeout(function () {
                    that.waitForLoadingOverlay(callback);
                }, 500);

            } else {
                callback();
            }
        }
    }

    return CADToolbar;

})();