"use strict";

var FileContextMenu = (function FileContextMenu() {

    function FileContextMenu(ProjectId, resources) {
        //console.log("loaded FileOperations");
        this.ProjectId = ProjectId;
        this.Resources = resources;
        this.container = $("#filecontextmenu");
        this.documents = [];
	}

    FileContextMenu.prototype = {

        constructor: FileContextMenu,


        /////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////  Context Menu ///////////////////////////////
        /////////////////////////////////////////////////////////////////////////////

        init: function (targetId) {
            var that = FileContextMenuLogic;
            that.container.kendoContextMenu({
                //target: "#" + targetId,
                filter: ".documentReferenceObject",
                orientation: "vertical",
                open: FileContextMenuLogic.onOpenFileContextMenu,
                select: FileContextMenuLogic.onSelectFileContextMenu,
                deactivate: function (e) {
                    
                   
                        $('#filesAndFoldersPartialContainer.documentReferenceObject').removeClass('holdObject');

                },
                activate: function (e) {
                    if ($(FileExplLogic.lastMouseUp.target).closest('.documentReferenceObject').attr('id') === "filesAndFoldersPartialContainer") {
                        $('#filesAndFoldersPartialContainer.documentReferenceObject').addClass('holdObject');
                    }
                },
            });
            that.FileContextMenu = $("#filecontextmenu").data("kendoContextMenu");
        },

        onSelectFileContextMenu: function (event) {
            var that = FileContextMenuLogic;
            try {
                var buttonId = $(event.item).find("div")[0].id;

                var docs = [];
                that.documents = that.documents.length ===0 ? FileExplLogic.touchDocuments : that.documents;
                if (buttonId === "OpenId" || buttonId === "downloadId") { // clone the objects and remove the versionId
                    that.documents.forEach(function (doc) {
                        var newDoc = jQuery.extend(true, {}, doc);
                        delete newDoc.DocumentVersionId;
                        docs.push(newDoc);
                    });
                } else {
                    docs = that.documents;
                }

                //var docs = Array.from(jQuery.extend(true, {}, that.documents));
                //if (typeof docs[0] !== "undefined" &&(buttonId === "OpenId" || buttonId === "downloadId")) {
                //    delete docs[0].DocumentVersionId;
                //}
                if (buttonId === "OpenId" && docs.length == 1 && FileOperationLogic.isTrash(docs[0])) {
                    FileTreeExplLogic.openTrash(FileTreeExplLogic);
                } else {
                    FileOperationLogic.startFileOperation(buttonId, docs);
                }

            } catch (e) {
                console.error("Error while processing context menu option", e);
            }
            //return false;
        },




        onCleanFileContextMenu: function (event) {
            var that = FileContextMenuLogic;
            that.FileContextMenu.remove("#placeholder");
            that.FileContextMenu.remove(that.container.find("#OpenId").parent().parent());
            that.FileContextMenu.remove(that.container.find("#CopyId").parent().parent());
            that.FileContextMenu.remove(that.container.find("#RenameId").parent().parent());
            that.FileContextMenu.remove(that.container.find("#PermissionId").parent().parent());
            //that.FileContextMenu.remove(that.container.find("#UnzipId").parent().parent());
            that.FileContextMenu.remove(that.container.find("#DeleteId").parent().parent());
            that.FileContextMenu.remove(that.container.find("#DeleteMultipleId").parent().parent());
            that.FileContextMenu.remove(that.container.find("#CutId").parent().parent());
            that.FileContextMenu.remove(that.container.find("#PasteId").parent().parent());
            that.FileContextMenu.remove(that.container.find("#PasteAnnotationId").parent().parent());
            that.FileContextMenu.remove(that.container.find("#DownloadId").parent().parent());
            that.FileContextMenu.remove(that.container.find("#DownloadAsZipId").parent().parent());
            that.FileContextMenu.remove(that.container.find("#ExtractHereId").parent().parent());
            that.FileContextMenu.remove(that.container.find("#ShareId").parent().parent());
            //that.FileContextMenu.remove(that.container.find("#FileVersionId").parent().parent());
            that.FileContextMenu.remove(that.container.find("#SharedWithId").parent().parent());
            that.FileContextMenu.remove(that.container.find("#SeparatorA").parent().parent());
            that.FileContextMenu.remove(that.container.find("#SeparatorB").parent().parent());
            that.FileContextMenu.remove(that.container.find("#EditId").parent().parent());
            that.FileContextMenu.remove(that.container.find("#PropertiesId").parent().parent());
            that.FileContextMenu.remove(that.container.find("#ImportAnnotationId").parent().parent());
            that.FileContextMenu.remove(that.container.find("#RestoreId").parent().parent());
            that.FileContextMenu.remove(that.container.find("#HardDeleteId").parent().parent());
            that.FileContextMenu.remove(that.container.find("#CreateFolderId").parent().parent());
            that.FileContextMenu.remove(that.container.find("#DuplicateAsShortcutId").parent().parent());
            that.FileContextMenu.remove(that.container.find("#PasteAsShortcutId").parent().parent());
        },

        onOpenFileContextMenu: function (event) {

            var that = FileContextMenuLogic;
            that.documents = [];
            //call the selection handler
            FileExplLogic.handleSelection(true);
            //making sure the just clicked object is actually included in the selection
            if ($(FileExplLogic.lastMouseUp.target).closest('.documentReferenceObject').attr('id') === "filesAndFoldersPartialContainer") {
                $('#filesAndFoldersPartialContainer.documentReferenceObject').addClass('holdObject');
            } else {
                $(FileExplLogic.lastMouseUp.target).closest('#filesAndFoldersPartialContainer .documentReferenceObject').addClass('holdObject');
            }

            // select whatever folder we clicked in the treeview (not the explorer view if clicked in the explorer view, that is handled elsewhere, accounting for shift, control)
            var data;
            
            if (window.document.getElementById("folderTreeView").contains(event.event.target)) {
                FileTreeExplLogic.treeView.select(event.event.currentTarget);
                data = FileTreeExplLogic.treeView.dataItem(event.event.target);

                //try{
                //    var KendoItem = $('#' + FileExplLogic.currentViewMode + 'View').data((FileExplLogic.currentViewMode == "Details") ? 'kendoGrid' : 'kendoListView');
                //    var treeData = KendoItem.dataSource.get(data.DocumentId);
                //    var treeElement = KendoItem.dataSource.getByUid(treeData.uid)
                //    KendoItem.select(treeElement);
                //} catch (e) { console.log("Could not select this document in the explorer view: " + data.Name); }

                that.documents = [data];

            } else if (event.event.target.id === 'filesAndFoldersPartialContainer') {
                data = FileTreeExplLogic.dataItems;
                that.documents = [data];
            } else if (window.document.getElementById("filesAndFoldersPartialContainer").contains(event.event.target)) {

                data = FileExplLogic.getSelectedElementData(event.event.target);
                try{
                    var treeData = FileTreeExplLogic.treeView.dataSource.get(data.DocumentId);
                    var treeElement = $('#folderTreeView').find("[data-uid='" + treeData.uid + "']");
                    FileTreeExplLogic.treeView.select(treeElement);
                } catch (e) { console.log("Could not select this document in the tree.");}
                that.documents = FileExplLogic.getSelectedElementsData();

            } 
            
            if (that.documents.length === 0 && (window.document.getElementById("filesAndFoldersPartialContainer").contains(event.event.target))) {
                data = FileTreeExplLogic.dataItems;
                that.documents = [data];
            }
            
            that.documents = that.documents.filter(function (d) { return d.enable !== false });
            if (that.documents.length > 1) {
                that.documents.filter(function (d) { return d.Type.indexOf('TRASH') < 0});
            }
            if (that.documents.length === 0) {
                event.preventDefault();
                return;
            }
            that.onCleanFileContextMenu(event);

            var targetElement;
            if (typeof event.event.target !== "undefined") {
                targetElement = $(event.event.target);
            } else {
                targetElement = event.sender.element
            }
            var document = FileOperationLogic.getDataItem(targetElement);
            if (typeof document === "undefined") { return; }

            var ExplorerBackgroundClick = ($(FileExplLogic.lastMouseUp.target).closest('.documentReferenceObject').attr('id') === "filesAndFoldersPartialContainer");
            var ExplorerClick = window.document.getElementById("filesAndFoldersPartialContainer").contains(FileExplLogic.lastMouseUp.target);
            var buttons = that.listRelevantButtons(document, ExplorerBackgroundClick, ExplorerClick);
            var list = [];

            for (var i = 0; i < buttons.length; i++) {
                if (buttons[i].id.indexOf("Separator") > -1) {
                    list.push({ text: '<div id="' + buttons[i].id + '" class="k-separator"></div>', encoded: false, disabled: "disabled" });
                } else {
                    list.push({ text: '<div id="' + buttons[i].id + '">' + buttons[i].content + buttons[i].text + '</div>', encoded: false });
                }
            }
            that.FileContextMenu.append(list);
            that.FileContextMenu.enable($("#SeparatorA").parent().parent(), false);
            that.FileContextMenu.enable($("#SeparatorB").parent().parent(), false);

            var currentDoc = FileTreeExplLogic.documentArray[document.DocumentId];
            if (!FileTreeExplLogic.dataItems.isTrash && currentDoc && currentDoc.PermissionCode === 'READ') that.FileContextMenu.disable($("#ExtractHereId").parent().parent(), false);
            if (window.document.getElementById("EditId")) {
                that.FileContextMenu.enable($("#EditId").parent().parent(), document.LockId !== "");
            //    that.FileContextMenu.enable($("#EditId").parent().parent(), false);
            //    WsEditorLockLogic.getcurrentDocumentViewers(document);
            }
            FileExplLogic.touchDocuments = that.documents;
        },

        getInlineButtons: function (document) {
            var buttons = FileContextMenuLogic.listRelevantButtons(document);
            var returnString = "";

            for (var i = 0; i < buttons.length; i++) {
                if (buttons[i].id.indexOf("Separator") > -1) {
                    continue;
                } else {
                    returnString =
                        returnString +
                        '<span id="' +
                        buttons[i].id +
                        '" title="'+buttons[i].text+'"'+
                        ' onclick="FileOperationLogic.startFileOperation(' + "'" + buttons[i].id + "', FileTreeExplLogic.documentArray['"+document.DocumentId+"'])"+'">' +
                        buttons[i].content +
                        '</span>';
                }
            }
            return '<p style=" display: inline; ">' + returnString + "</p>";
        },

        listRelevantButtons: function (document, ExplorerBackgroundClick, explorerClick) {
            ExplorerBackgroundClick = (typeof ExplorerBackgroundClick === "undefined") ? false : ExplorerBackgroundClick;
            var that = this;
            var contextContentA = [];
            var contextContentB = [];

            if (that.documents.every(FileOperationLogic.isTrash) && !ExplorerBackgroundClick) {
                return [{ id: "OpenId", content: '<i class="far fa-folder-open"></i> &nbsp;', text: this.Resources['Open'] }];
            }
            else if (FileTreeExplLogic.dataItems.isTrash && explorerClick) {
                if (ExplorerBackgroundClick) {
                    return [];
                }
                if (that.documents.every(FileOperationLogic.isReadWrite)) {
                    contextContentA.push({ id: "RestoreId", content: '<i class="far fa-repeat contexticon"></i> &nbsp;', text: this.Resources['Recover'] });
                }
                if ((window.isProjectManager === "True")) {
                    contextContentA.push({ id: "HardDeleteId", content: '<i class="far fa-trash-alt contexticon"></i> &nbsp;', text: this.Resources['Delete'] });
                }
                return contextContentA;
            } else {
                if (that.documents.length > 1) {
                    contextContentA.push({ id: "CutId", content: '<i class="far fa-cut contexticon"></i> &nbsp;', text: this.Resources['Cut'] });
                    contextContentA.push({ id: "CopyId", content: '<i class="far fa-clone contexticon"></i> &nbsp;', text: this.Resources['Copy'] });
                    if (that.documents.every(FileOperationLogic.isFileOrShortcut) && that.documents.every(FileOperationLogic.isReadWrite)){
                        contextContentA.push({ id: "DuplicateAsShortcutId", content: '<i class="icon-Shortcut contexticon"></i> &nbsp;', text: this.Resources['CreateShortcuts'] });
                    }
                    contextContentB.push({ id: "DeleteMultipleId", content: '<i class="far fa-trash-alt contexticon"></i> &nbsp;', text: this.Resources['Delete'] });
                    contextContentB.push({ id: "DownloadAsZipId", content: '<i class="far fa-file-archive contexticon"></i> &nbsp;', text: this.Resources['DownloadAsZip'] });
                } else {

                    if (!ExplorerBackgroundClick) {
                        contextContentA.push({ id: "OpenId", content: '<i class="far fa-folder-open"></i> &nbsp;', text: this.Resources['Open'] });
                        contextContentB.push({ id: "CopyId", content: '<i class="far fa-clone contexticon"></i> &nbsp;', text: this.Resources['Copy'] });
                        if (FileOperationLogic.isFileOrShortcut(that.documents[0]) && FileOperationLogic.isReadWrite(that.documents[0])) {
                            contextContentA.push({ id: "DuplicateAsShortcutId", content: '<i class="icon-Shortcut contexticon"></i> &nbsp;', text: this.Resources['CreateShortcut'] });
                        }
                    }
                    //if (FileOperationLogic.isReadWrite(that.documents[0]) && (document.Extension === ".xlsx" || document.Extension === ".csv" || document.Extension === ".docx" || document.Extension === ".html" || document.Extension === ".txt" || document.Extension === ".rtf" || document.Extension === ".claim" )) {// shawn shawnxlsx
                    //    contextContentA.push({ id: "EditId", content: '<i class="far fa-pencil-alt contexticon"></i> &nbsp;', text: this.Resources['Edit'] + " (BETA)" });
                    //}


                    if (FileOperationLogic.isReadWrite(document)) {

                        //if we have stuff on the clipboard
                        if (FileOperationLogic.clipboard.length === 1) {
                            if (FileOperationLogic.hasAnnotations(FileOperationLogic.clipboard[0])) {
                                contextContentB.push({ id: "PasteAnnotationId", content: '<i class="far fa-clipboard contexticon"></i> &nbsp;', text: this.Resources['PasteAnnotation'] });
                                if (FileOperationLogic.mode !== 'cut') {
                                    contextContentB.unshift({ id: "PasteId", content: '<i class="far fa-clipboard contexticon"></i> &nbsp;', text: this.Resources['Paste'] });
                                    if (FileOperationLogic.clipboard.every(FileOperationLogic.isFileOrShortcut)){
                                        contextContentB.push({ id: "PasteAsShortcutId", content: '<i class="far fa-file contexticon"></i> &nbsp;', text: this.Resources['PasteAsShortcut'] });
                                    }
                                }
                            } else { // just paste whatever is there, with annotations if any
                                contextContentB.push({ id: "PasteAnnotationId", content: '<i class="far fa-clipboard contexticon"></i> &nbsp;', text: this.Resources['Paste'] });
                            }
                        } else if (FileOperationLogic.clipboard.length > 1) {
                            contextContentB.push({ id: "PasteAnnotationId", content: '<i class="far fa-clipboard contexticon"></i> &nbsp;', text: this.Resources['Paste'] });
                            if (FileOperationLogic.clipboard.every(FileOperationLogic.isFileOrShortcut)) {
                                contextContentB.push({ id: "PasteAsShortcutId", content: '<i class="far fa-file contexticon"></i> &nbsp;', text: this.Resources['PasteAsShortcuts'] });
                            }
                        }

                        if (!FileOperationLogic.isRootFolder(document) && !ExplorerBackgroundClick && document.PermissionCode === "WRITE") {
                            //basic read-write stuff
                            contextContentA.push({ id: "CutId", content: '<i class="far fa-cut contexticon"></i> &nbsp;', text: this.Resources['Cut'] });

                            contextContentB.push({ id: "SeparatorA" });
                            if (this.documents.length > 1) {
                                contextContentB.push({ id: "DeleteMultipleId", content: '<i class="far fa-trash-alt contexticon"></i> &nbsp;', text: this.Resources['Delete'] });
                            } else {
                                contextContentB.push({ id: "DeleteId", content: '<i class="far fa-trash-alt contexticon"></i> &nbsp;', text: this.Resources['Delete'] });
                            }
                            contextContentB.push({ id: "RenameId", content: '<i class="far fa-pencil-alt contexticon"></i> &nbsp;', text: this.Resources['Rename'] });
                            contextContentB.push({ id: "SeparatorB" });
                        }
                    }

                    // Any document that can be opened in the 2DViewer can be annotation on.
                    // If this Document is one such document, allow them to import annotations 
                    // from previous versions
                    // - Shawn
                    if (new DocumentHelper().matchAny2DViewerExtension(document.Extension)) {
                        contextContentB.push({ id: "ImportAnnotationId", content: '<i class="far fa-file-import contexticon"></i> &nbsp;', text: this.Resources['ImportAnnotations'] });
                    }

                    if (FileOperationLogic.isFolder(document)) {
                        //folders only      
                        contextContentB.push({
                            id: "DownloadAsZipId", content: '<i class="far fa-file-archive contexticon"></i> &nbsp;', text: this.Resources['DownloadAsZip']
                        });
                        if (document.PermissionCode === "WRITE") {
                            contextContentB.push({ id: "CreateFolderId", content: '<i class="far fa-folder-plus contexticon"></i> &nbsp;', text: this.Resources['AddFolder'] });
                        }
                        //contextContentB.push({ id: "PermissionId", content: '<i class="far fa-lock contexticon"></i> &nbsp;', text: this.Resources['Permission'] });
                    } else {
                        if (document.Extension === ".zip") {
                            contextContentB.push({ id: "ExtractHereId", content: '<i class="far fa-file-archive contexticon"></i> &nbsp;', text: this.Resources['ExtractHere'] });
                        }
                        contextContentB.push({ id: "ShareId", content: '<i class="far fa-share-alt contexticon"></i> &nbsp;', text: this.Resources['ShareDocument'] });
                        //contextContentB.push({ id: "FileVersionId", content: '<i class="far fa-info-circle contexticon"></i> &nbsp;', text: this.Resources['FileVersions'] });
                        contextContentB.push({ id: "DownloadId", content: '<i class="far fa-download contexticon"></i> &nbsp;', text: this.Resources['DownloadDocument'] });
                    }

                
                    if (!FileOperationLogic.isRootFolder(document)) {
                        contextContentB.push({ id: "PropertiesId", content: '<i class="far fa-ellipsis-v contexticon"></i> &nbsp;', text: this.Resources['Properties'] });
                    }
                }
                return contextContentA.concat(contextContentB);
            }
        }
    }

        return FileContextMenu;

})();
