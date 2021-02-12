
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

var ContextMenu = (function () {

    function ContextMenu(settings) {
        this.event = settings.event;
        this.mesh = settings.mesh;
        this.objectType = settings.objectType;
        this.emsNodeId = settings.emsNodeId;
        this.systemSubTypeId = settings.systemSubTypeId;
        this.projectId = settings.projectId;
        this.threeD_vl = settings.threeD_vl;
        this.misc = settings.misc;
        
        //this.viewer = document.getElementById("viewer");
        //this.defaultcontext2D = this.viewer.oncontextmenu;
        //console.log(this.mesh);

        // Destroy any existing context menus first
        this.destroyContextMenuIfExists();

        //if (!this.mesh) {
        //    return;
        //}

        if ((window.location.href.indexOf(window.location.host + "/Marketer") > -1) || ["DOCUMENT", "EMS"].indexOf(loadedModule) < 0) {
            return;
        }

        // Create new context menu
        var ul = document.createElement('ul');
        ul.id = "context-menu";
        ul.style.width = "150px";
        ul.style.zIndex = "9999";
        ul.style.display = "inherit";
        ul.oncontextmenu = function (e) {
            console.log("context menu returning false");
            return false;
        }
        document.body.appendChild(ul);

        var hiddenPartCount = null;
        var contextMenuString = "";

        if (this.objectType !== "ANNOTATION" && this.objectType !== "CANVAS") {
            hiddenPartCount = Three.DocumentEventHandler.lasthiddenPart.length;
        }

        if (this.objectType === "GENERIC" && (hiddenPartCount > 0)) {
           
            contextMenuString = '<li id="unhideLastHidden"><i class="far fa-eye contexticon" aria-hidden="true"></i> ' + VIEW_RESOURCES.Resource.UnhideLastPart + '</li>'
                + '<li id="unhideAll"><i class="far fa-eye contexticon" aria-hidden="true"></i> ' + VIEW_RESOURCES.Resource.UnhideAllParts + '</li>';
        }

        if (this.objectType === "MESH") {
            ul.style.width = "200px";
            contextMenuString = '<li id="hidePart"><i class="far fa-eye-slash contexticon" aria-hidden="true"></i> ' + VIEW_RESOURCES.Resource.HidePart + '</li>';
            contextMenuString += '<li id="contextMenuTag"><i class="far fa-map-marker contexticon" aria-hidden="true"></i> ' + VIEW_RESOURCES.Resource.Tag + '</li>';
        }

        if (this.objectType === "TAG") {
            contextMenuString = '<li id="hidePart"><i class="far fa-eye-slash contexticon" aria-hidden="true"></i> ' + VIEW_RESOURCES.Resource.HidePart + '</li>'
                + '<li class="k-separator"></li>'
                + '<li id="openTagDocument"><i class="far fa-folder-open contexticon"></i> ' + VIEW_RESOURCES.Resource.Open + '</li>'
                + '<li id="deleteTag"><i class="far fa-trash-alt contexticon"></i> ' + VIEW_RESOURCES.Resource.Delete + '</li>';
        }

        if ((this.objectType === "MESH" || this.objectType === "TAG") && (hiddenPartCount > 0)) {
            contextMenuString += '<li id="unhideLastHidden"><i class="far fa-eye contexticon" aria-hidden="true"></i> ' + VIEW_RESOURCES.Resource.UnhideLastPart + '</li>'
                + '<li id="unhideAll"><i class="far fa-eye contexticon" aria-hidden="true"></i> ' + VIEW_RESOURCES.Resource.UnhideAllParts + '</li>';
        }

        if (this.objectType === "ELEMENT") {
            ul.style.width = "248px";
            //contextMenuString = '<li id="viewSubSystem"><i class="far fa-cube contexticon" aria-hidden="true"></i> ' + VIEW_RESOURCES.Resource.ViewSubsystem + '</li>';
            contextMenuString = '<li id="viewSubSystem"><i class="far fa-cube contexticon" aria-hidden="true"></i> ' + VIEW_RESOURCES.Resource.ViewSubsystem + '</li>'
                + '<li id="showSubSystem" style ="word-wrap: break-word"><i class="far fa-cubes contexticon" aria-hidden="true"></i><span>' + VIEW_RESOURCES.Resource.ShowSubsystem + '</span></li>';
            if (Three.DocumentEventHandler.showAllElementsWithSubtype) {
                contextMenuString += '<li id="hideSubSystem"><i class="far fa-eye contexticon" aria-hidden="true"></i> ' + VIEW_RESOURCES.Resource.HideSubsystem + '</li>';
            }
            }

        if (this.objectType === "SUBSYSTEM") {
            return;
        }

        if (this.objectType === "ANNOTATION") {

            if (this.mesh.type !== "texttagimage" && AnnotationApplication.viewerType !== "EMS") {
                contextMenuString += '<li id="annotationComment"><i class="far fa-comments contexticon" aria-hidden="true"></i> ' + VIEW_RESOURCES.Resource.Comments + '</li>'
                    + '<li id="annotationTask"><i class="far fa-tasks contexticon" aria-hidden="true"></i> ' + VIEW_RESOURCES.Resource.ToDos + '</li>'
                    + '<li id="annotationProperties"><i class="far fa-wrench contexticon" aria-hidden="true"></i> ' + VIEW_RESOURCES.Resource.Properties + '</li>'
                //+ '<li id="annotationCut"><span class="far fa-cut contexticon"></span> ' + VIEW_RESOURCES.Resource.Cut + '</li>';
            } else if (this.mesh.type !== "texttagimage" && AnnotationApplication.viewerType === "EMS") {
                contextMenuString += '<li id="annotationProperties"><i class="far fa-wrench contexticon" aria-hidden="true"></i> ' + VIEW_RESOURCES.Resource.Properties + '</li>'
            }
            else if (AnnotationApplication.viewerType === "EMS") {
                contextMenuString += '<li id="annotationProperties"><i class="fa fa-wrench contexticon" aria-hidden="true"></i> ' + VIEW_RESOURCES.Resource.Properties + '</li>';
            }

            if ((this.mesh.type === "ems" || this.mesh.type === "emsGroup")
                && (this.mesh.type === "ems" || this.mesh.type === "emsGroup")) {
                contextMenuString += '<li id="hideShowQR"><i class="fa fa-qrcode contexticon" aria-hidden="true"></i> ' + "Toggle QR code" + '</li>';
            }

            if (!['texttagimage'].includes(this.mesh.type)) {
                contextMenuString += '<li id="annotationCopy"><i class="far fa-clone contexticon"></i> ' + VIEW_RESOURCES.Resource.Copy + '</li>'
            }
            contextMenuString += '<li id="annotationDelete"><i class="far fa-trash-alt contexticon"></i> ' + VIEW_RESOURCES.Resource.Delete + '</li>';

            if (AnnotationApplication.viewerType !== "EMS") {
                contextMenuString += '<li id="annotationListAll"><i class="fa fa-list contexticon" aria-hidden="true"></i> ' + VIEW_RESOURCES.Resource.ListAll + '</li>';
            }
        }

        if (this.objectType === "CANVAS") {
            contextMenuString = '<li id="annotationPaste"><i class="far fa-clipboard contexticon"></i> ' + VIEW_RESOURCES.Resource.Paste + '</li>'
                + '<li id="annotationListAll"><i class="far fa-list contexticon" aria-hidden="true"></i> ' + VIEW_RESOURCES.Resource.ListAll + '</li>';

        }

        $('#context-menu').empty().append(contextMenuString);

        this.bindContextMenu();

        if (contextMenuString === "") {
            this.destroyContextMenuIfExists();
        }
    }

    ContextMenu.prototype = {
        constructor: ContextMenu,

        bindContextMenu: function bindContextMenu() {

            var that = this;

            $('#context-menu').kendoContextMenu({
                target: '#ThreeJS',
                closeOnClick: true,
                close: function () {
                    $('#context-menu').empty();
                },
                select: function (e) {
                    var id = e.item.id;
                    //alert("select");
                    switch (id) {

                        // 3D Context Menu Options
                        case "hidePart":
                            that.hidePart();
                            break;
                        case "contextMenuTag":
                            that.contextMenuTag();
                            break;
                        case "unhideLastHidden":
                            that.unhideLastHidden();
                            break;
                        case "unhideAll":
                            that.unhideAll();
                            break;
                        case "focus":
                            that.focus();
                            break;
                        case "openTagDocument":
                            that.openTagDocument();
                            break;
                        case "deleteTag":
                            that.deleteTag();
                            break;
                        case "viewSubSystem":
                            that.viewSubSystem();
                            break;
                        case "showSubSystem":
                            that.showSubSystem();
                            break;
                        case "hideSubSystem":
                            that.hideSubSystem();
                            break;

                        // 2D Context Menu Options
                        case "annotationComment":
                            that.annotationComment();
                            break;
                        case "annotationTask":
                            that.annotationTask();
                            break;
                        case "annotationProperties":
                            that.annotationProperties();
                            break;
                        case "annotationCopy":
                            that.annotationCopy();
                            break;
                        case "annotationCut":
                            that.annotationCut();
                            break;
                        case "annotationPaste":
                            that.annotationPaste(that);
                            break;
                        case "annotationListAll":
                            that.annotationList();
                            break;
                        case "annotationDelete":
                            that.annotationDelete();
                            break;

                        case "hideShowQR":
                            AnnotationApplication.Utils.toggleQR(that.mesh, that.misc);
                            that.misc.renderAll();
                            that.destroyContextMenu();
                            break;

                        // Ya done goofed!
                        default:
                            break;
                    }
                },
            });

            //alert($("#document-top-nav").height());
            //alert($("#2DViewerToolbar").height());
            ;
            $('#context-menu').css({
                "z-index": "1000",
                "display": "inherit",
                "position": "fixed",
                "top": (this.event.type !== "press" ? this.event.pageY : this.event.srcEvent.pageY) || $(".navbar-header").height() + $("#2DViewerToolbar").height(),
                "left": (this.event.type !== "press" ? this.event.pageX : this.event.srcEvent.pageX) || 1,
            });
        },

        //disableDefaultContextMenu: function () {
        //    this.viewer.oncontextmenu = function (e) {
        //        return false;
        //    }
        //},

        //ebableDefaultContextMenu: function () {
        //    this.viewer.oncontextmenu = this.defaultcontext2D;
        //},

        annotationComment: function destroyContextMenu() {
            AnnotationApplication.RightSidebarController.openSidebar(this.misc, this.mesh.pageNumber, this.mesh);
            $(".rightSidebarTabComments").click();
            this.destroyContextMenu();
        },

        annotationTask: function () {
            AnnotationApplication.RightSidebarController.openSidebar(this.misc, this.mesh.pageNumber, this.mesh);
            
            $(".rightSidebarTabTasks").click();
            this.destroyContextMenu();
        },

        annotationProperties: function () {
            
            AnnotationApplication.RightSidebarController.openSidebar(this.misc, this.mesh.pageNumber, this.mesh);
            $(".rightSidebarTabTools").click();
            this.destroyContextMenu();
        },

        annotationCopy: function () {
            this.destroyContextMenu();
            try {
                // if (SvgGlobalControllerLogic.allSelectedObjects.length > 1) {
                //     SvgGlobalControllerLogic.allSelectedObjects = SvgGlobalControllerLogic.allSelectedObjects.filter(s => s.type !== null);
                //     SvgGlobalControllerLogic.copyAnnotationsToSession(SvgGlobalControllerLogic.allSelectedObjects);
                // } else {
                //     SvgGlobalControllerLogic.copyAnnotationsToSession([this.mesh]);
                // }
                // //AnnotationApplication.CopyPaste.copyAnnotation(this.mesh);


                if (SvgGlobalControllerLogic.selectedIds2.length > 0) {
                    SvgGlobalControllerLogic.copyAnnotationsToSession(SvgGlobalControllerLogic.selectedIds2);
                } else {
                    //SvgGlobalControllerLogic.copyAnnotationsToSession([]);
                }
            } catch (ex) {
                console.error("copy annotations issue!");
            }
        },

        annotationCut: function () {
            this.destroyContextMenu();
            AnnotationApplication.CopyPaste.cutAnnotation(this.mesh, this.misc);
        },

        annotationPaste: function (e) {
            this.destroyContextMenu();
            var annotationsToPaste = SvgGlobalControllerLogic.GetAnnotationsInSession().then(
                result => SvgGlobalControllerLogic.PasteAnnotations(result, e),
                error => console.log(error)
            );
            //AnnotationApplication.CopyPaste.pasteAnnotation(this.mesh, this.event);
        },

        annotationList: function () {
            this.destroyContextMenu();
            AnnotationApplication.RightSidebarController.showAnnotationList();
        },

        annotationDelete: function () {
            this.destroyContextMenu();

            this.mesh.Delete();
            if (loadedModule === "EMS" && CPaneService.panelType.endsWith("TAGS")) {
                CPaneService.loadPanel();
            }


            // SvgGlobalControllerLogic.allSelectedObjects = SvgGlobalControllerLogic.allSelectedObjects.filter(s=>s.type !== null);
            // if (SvgGlobalControllerLogic.allSelectedObjects.length > 0) {
            //     var annIds = [];
                
            //     //var paper = SvgGlobalControllerLogic.allSelectedObjects[0].paper;
            //     SvgGlobalControllerLogic.allSelectedObjects.forEach(function (el) {
            //         el = el.element ? el.element : el;
            //         if(el.type === "set"){
            //             el.forEach(function(elx){
            //                 if(elx.getDocumentAnnotationId() !== undefined){
            //                     annIds.push(elx.getDocumentAnnotationId());
            //                 }else{
            //                     elx.remove();
            //                 }
            //             });
            //         }else{
            //             if(el.getDocumentAnnotationId() !== undefined){
            //                 annIds.push(el.getDocumentAnnotationId());
            //             }else{
            //                 el.remove();
            //             }
            //         }
                    
            //     });
    
            //     SvgGlobalControllerLogic.clearAllJoints();
            //     try {
            //         AnnotationApplication.CRUDController.deleteAnnotation(annIds);
            //     } catch (ex) {
            //         console.error("Something went wrong when deleting!", annIds);
            //     }
            //     SvgGlobalControllerLogic.allSelectedObjects = [];
            //     if(loadedModule === "EMS" && $("#DocumentTagGrid").length > 0)$("#DocumentTagGrid").data("kendoGrid").dataSource.read();
            // }else{
            //     AnnotationApplication.CRUDController.prepareDelete(this.mesh, this.misc);
            //     if(loadedModule === "EMS" && $("#DocumentTagGrid").length > 0){
            //         $("#DocumentTagGrid").data("kendoGrid").dataSource.read();
            //     }
            // }
        },

        destroyContextMenuIfExists: function () {
            var contextMenu = $("#context-menu").data("kendoContextMenu");
            var contextMenuString = "";

            if (contextMenu != null) {
                contextMenu.destroy();
            }
        },

        hidePart: function () {
            this.mesh.visible = false;
            Three.DocumentEventHandler.lasthiddenPart.push(this.mesh);
            if (Three.scene.getObjectByName("myCube")) {
                Three.scene.remove(Three.scene.getObjectByName("myCube"));
            }
            this.destroyContextMenu();
        },

        contextMenuTag: function () {
            if (!Three.ThreeDTagUtils.isTagMode) {
                Three.SELECTED = null;
                Three.Utils.remove3DSelection();
                Three.ThreeDTagUtils.enableTagMode();
            } else {
                Three.ThreeDTagUtils.disableTagMode();
            }

            var x = parseInt($('#context-menu').css("left").replace("px", ""));
            var y = parseInt($('#context-menu').css("top").replace("px", ""));

            var $el = $("canvas:first");
            var offset = $el.offset();
            var event = jQuery.Event("mousedown", {
                which: 0,
                type: "fakeClick",
                offsetX: x,
                offsetY: y
            });
            Three.DocumentEventHandler.onDocumentClick(event);
        },

        unhideLastHidden: function () {

            var length = Three.DocumentEventHandler.lasthiddenPart.length;

            if (length > 0) {
                Three.DocumentEventHandler.lasthiddenPart[length - 1].visible = true;
                Three.DocumentEventHandler.lasthiddenPart.pop();
            }



            this.destroyContextMenu();
        },
        unhideAll: function () {
            var mesh = Three.ModelLoader.getModel();
            mesh.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    child.visible = true;
                }
            });
            Three.DocumentEventHandler.lasthiddenPart = [];
            Three.ThreeDTagUtils.showAllTags();
            this.destroyContextMenu();
        },
        focus: function () {
            Three.Utils.zoomToObject(this.mesh);
            this.destroyContextMenu();
        },


        destroyContextMenu: function destroyContextMenu() {
            //console.log("destroy");
            var contextMenu = $("#context-menu").data("kendoContextMenu");
            if (contextMenu != null) {
                contextMenu.destroy();
            }
        },

        openTagDocument: function () {

            var docUrl = "";
            this.mesh.projectId = this.mesh.projectId !== undefined ? this.mesh.projectId : ProjectId;
            this.mesh.documentId = this.mesh.documentId !== undefined ? this.mesh.documentId : DocumentExternalId;

            //if (this.mesh.hasOwnProperty("documentId")) {
            docUrl = "/Document/DocumentViewer?projectExtId=" + this.mesh.projectId + "&docId=" + this.mesh.documentId + "&openEditor=false";
            console.log(docUrl);
            Three.ThreeDTagUtils.create3DTagWindow(docUrl);
            /*}
            else {

                var that = this;
                var docExtId = this.mesh.documentVersionId;
                var projExtId = getParameterByName('projectId', this.mesh.documentUrl);
                
                $.ajax({
                    type: "GET",
                    url: "/api/Document/GetDocumentVersion/" + docExtId,
                    success: function (response) {
                        //response = JSON.parse(response);

                        that.mesh.projectId = projExtId;
                        that.mesh.documentVersionId = docExtId;
                        that.mesh.documentId = response.DocumentId;

                        var spriteDetails = {
                            position: that.mesh.position,
                            annotationName: that.mesh.annotationName,
                            annotationType: that.mesh.annotationType,
                            DocumentAnnotationId: that.mesh.DocumentAnnotationId,
                            tagNumber: that.mesh.tagNumber,
                            base64Image: that.mesh.base64Image,
                            //documentUrl: that.currentSprite.documentUrl
                            projectId: projExtId,
                            documentId: response.DocumentId,
                            documentVersionId: docExtId,
                        }

                        AnnotationApplication.CRUDController.updateAnnotation(spriteDetails, function (response) {
                            console.log(response);
                            console.log("3d tag updated");
                        });

                        docUrl = "/Document/DocumentViewer?projectExtId=" + projExtId + "&docId=" + that.mesh.documentExternalId + "&docVerId=" + docExtId + "&openEditor=false";
                        Three.ThreeDTagUtils.create3DTagWindow(docUrl);
                    }
                });                
            }*/

            this.destroyContextMenu();
        },

        deleteTag: function () {
            Three.ThreeDTagUtils.deleteTag(this.mesh);
            this.destroyContextMenu();
        },

        viewSubSystem: function () {
            this.threeD_vl.selectSubSystem(this.systemSubTypeId);
            
            //console.log("viewing subsystem: ", this.emsNodeId);
            //var that = this;
            //$.ajax({
            //    type: "GET",
            //    data: {
            //        selectedEmsNodeId: this.emsNodeId,
            //        projectId: this.projectId
            //    },
            //    url: "/EMS/GetSystemSubTypeForNode",
            //    success: function (response) {
            //        //$("#closeSubSystemViewButton").removeClass("hidden");
            //        that.threeD_vl.selectSubSystem(response);
            //    }
            //});

            this.destroyContextMenu();
        },

        showSubSystem: function () {
            Three.SELECTED = Three.DocumentEventHandler.MENUSELECTED;
            this.threeD_vl.highlightElementWithSameSystem(this.systemSubTypeId, this.mesh.name);
            Three.DocumentEventHandler.showAllElementsWithSubtype = true;
            // $('li#showSubSystem').find('span')[0].textContent = 'Hide Elements';
            this.destroyContextMenu();
            //$('li#showSubSystem').find('span')[0].textContent = 'Hide Elements';

        },
        hideSubSystem: function () {
            this.threeD_vl.removeHighlight(this.systemSubTypeId);
            Three.DocumentEventHandler.showAllElementsWithSubtype = false;
            this.destroyContextMenu();
        }
    }

    return ContextMenu;

})();
