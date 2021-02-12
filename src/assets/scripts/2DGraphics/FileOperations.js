"use strict";

var FileOperations = (function FileOperations() {

    function FileOperations(ProjectId, resources) {
        console.log("loaded FileOperations");
        this.ProjectId = ProjectId;
        this.Resources = resources;
        this.clipboard = [];
        this.fileOpenFrame = document.createElement('iframe');
        this.fileOpenFrame.style.display = "none";
        this.fileOpenFrame.style.id = "fileOpenFrame";
        this.attachDocumentCallback = new function (e) { console.log(e) }
        this.initiallySelected = [];
        this.draggingOperation = false;
        this.fileOperationIds = [];
        document.body.appendChild(this.fileOpenFrame);    
        this.docHelper = new DocumentHelper();
        this.inUploadProcessDocuments = [];
        this.cachedFilesDict = new Object();
    }

    FileOperations.prototype = {

        constructor: FileOperations,


        GetPublicImageUrl: function (imageType, objectGuid, success, error) {
            switch(imageType) {
                case "CustomerLogo":
                case "UserImage":
                case "ProjectImage":
                case "MarketerLogo":
                case "MarketerShowcaseImage":
                case "ProductLogo":
                case "ProductModel":
                case "ProductMaterial":
                    //var request = new XMLHttpRequest();
                    //request.open("get", "/api/Document/GetPresigned" + imageType + "/" + objectGuid, false);
                    //request.send();
                    //return request.responseText;

                    $.ajax({
                        type: "GET",
                        url: "/Document/Get" + imageType + "?Id=" + objectGuid,
                        headers: {
                            Authorization: "Bearer " + window.AuthenticationToken
                        },
                        error: function (e) {
                            //FileOperationLogic.onFailedFileOperation(e, document);
                            if (typeof error !== "undefined") {
                                error(e);
                            }
                        },
                        success: function (e) {
                            if (e.indexOf(' ') >= 0) {
                                // pretty sure this isn't what I asked for
                                if (typeof error !== "undefined") {
                                    error(e);
                                }
                            } else {
                                if (typeof success !== "undefined") {
                                    success(e);
                                }
                                console.log(e);
                                return e;
                            }
                        }
                    });
                    break;
                default:
                    throw new exception("Invalid imageType.");
                    break
            }
        },

        PostPublicImageUrl: function (blob, imageType, objectGuid, success, error) {
            var blob = blob;
            var imageType = imageType;
            var objectGuid = objectGuid;
            var success = success;
            var error = error;

            switch(imageType) {
                case "CustomerLogo":
                case "UserImage":
                case "ProjectImage":
                case "MarketerLogo":
                case "MarketerShowcaseImage":
                case "ProductLogo":
                case "ProductModel":
                case "ProductMaterial":
                    var myFormData = new FormData();
                    myFormData.append('attachement', new File([blob], objectGuid));

                    $.ajax({
                        type: "POST",
                        url: "/api/Document/Upload" + imageType + "/" + objectGuid,
                        headers: {
                            Authorization: "Bearer " + window.AuthenticationToken
                        },

                        data: myFormData,
                        cache: false,
                        contentType: false,
                        processData: false,
                        error: function (e) {
                            FileOperationLogic.onFailedFileOperation(e, document);
                            error(e);
                        },
                        success: function (e) {
                            success(e);
                        }
                    });
                    break;
                default:
                    throw "Invalid imageType.";
                    break;
            }
            
        },

        // Either field'DocmuentId' or'DocumentVersionId' is required
        downloadItem:function(DocumentId, DocumentVersionId, Extension, callback, processOverlayId, errorCallback)
        {
            if (!errorCallback) {
                errorCallback = function () { };
            }
            // if a preseigned URL as efined globally, we don't need to fetch it and just call the callback with the url
            if (!(window.presignedUrl === undefined || window.presignedUrl === null || window.presignedUrl === "")) {
                if (callback != null) {
                    if (Extension === ".mtl") {
                        callback(window.presignedMtlUrl, processOverlayId);
                    } else {
                        callback(window.presignedUrl, processOverlayId);
                    }
                } else {
                    window.location = window.presignedUrl;
                }
                return;
            }

            var forViewer = (typeof Extension !== "undefined");
            // otherwise, let's start looking at the parameters passed
            var that = this;
            if (typeof DocumentId !== "undefined" && DocumentId != null && typeof DocumentId.DocumentId !== "undefined") {
                // we were actually passed the entire object (consisten to other methods). best split it out to get the parameters we need!
                //DocumentVersionId = DocumentId.DocumentVersionId;
                if (typeof DocumentId.Extensions !== "undefined" && DocumentId.Extensions.length>0 )
                {
                    Extension = DocumentId.Extensions[0];
                }
                DocumentId = DocumentId.DocumentId;
            }

            if (typeof Extension !== "undefined" && Extension.toLowerCase() === ".claim") {
                Extension = ".pdf";
                forViewer = true;
            } else if (typeof forViewer === "undefined") {
                forViewer = false;
            }
            
            // decide if we'll fetch based on document version id or document id
            var methodExtension = "";
            var id;
            if ((typeof DocumentVersionId !== "undefined") && DocumentVersionId != null) {
                id = DocumentVersionId;
                methodExtension = "Version";
            } else if ((typeof DocumentId !== "undefined") && DocumentId != null) {
                id = DocumentId;
                methodExtension = "";
            } else {
                try {
                    Loading_OL.stopGenericLoadingScreen(processOverlayId);
                } catch (e) { console.log("loadingoverlaylogic not instantiated"); 
                }
                throw "Invalid input to download Item. Either field'DocmuentId' or'DocumentVersionId' is required.";
            }

            /// based on the rewuested extension and application, let's define which url to use
            var URL;

            if (forViewer) {
                URL = "/api/Document/GetPresigned" + methodExtension + "URL/" + id + "/" + Extension.replace(".", "").toUpperCase();
                
            } else if (window.presignedUrl === undefined || window.presignedUrl === null || window.presignedUrl === "") {
                URL = "/api/Document/GetPresigned" + methodExtension + "URL/" + id+"/";
            }

            // initate a loading screen
            if (typeof processOverlayId === "undefined") {
                try {
                    processOverlayId = Loading_OL.startGenericLoadingScreenWithDelay("Download");
                } catch (e) { console.log("loadingoverlaylogic not instantiated"); }
            }else if(processOverlayId === 0){
                // see Viewer.js line 8670
                processOverlayId = Loading_OL.startGenericLoadingScreenWithDelay("ConvertDocuemnt", 0, VIEW_RESOURCES.Resource.ConvertDocumentMsg);
            }
            
            // if(id+Extension in that.cachedFilesDict){ // Why? because if the file is cached we use the cache
            //     var response = that.cachedFilesDict[id+Extension];
            //     if (callback != null) {
            //         try{
            //             // Check if the url to file is expired or not
            //             fetch(response).then(
            //                 data=>{
                                
            //                     if(data.status === 403){
            //                         // expired => remove from cache object and get a new presigned url
            //                         Loading_OL.stopGenericLoadingScreen(processOverlayId);
            //                         delete that.cachedFilesDict[id+Extension];
            //                         that.downloadItem(DocumentId, DocumentVersionId, Extension, callback, null, errorCallback);
            //                     }else{
            //                         // use cache
            //                         callback(response, processOverlayId);
            //                         Loading_OL.stopGenericLoadingScreen(processOverlayId);
            //                     }
                                
            //                 },
            //                 err => {
            //                     console.error(err);
            //                     Loading_OL.stopGenericLoadingScreen(processOverlayId);
            //                     delete that.cachedFilesDict[id+Extension];
            //                     that.downloadItem(DocumentId, DocumentVersionId, Extension, callback, null, errorCallback);
            //                 }
            //             ).catch(function (err) {
            //                 errorCallback();
            //                 console.error(err); 
            //             });
            //         } catch (ex) {
            //             delete that.cachedFilesDict[id+Extension];
            //             that.downloadItem(DocumentId, DocumentVersionId, Extension, callback, processOverlayId, errorCallback);
            //         }
                    
            //     } else {
            //         try{
            //             window.location = response;
            //         }catch(ex){
            //             delete that.cachedFilesDict[DocumentVersionId+Extension];
            //             that.downloadItem(DocumentId, DocumentVersionId, Extension, callback, processOverlayId, errorCallback);
            //         }
                    
            //     }
            // }else{
                $.ajax({
                    url: URL,
                    type: "GET",
                    dataType: "json",
                    headers: {
                        Authorization: "Bearer " + window.AuthenticationToken
                    },
                    success: function (response) {
                        that.AddCachedFilesDict(id+Extension, response);
                        if (callback != null) {
                            callback(response, processOverlayId);
                        } else {
                            window.location = response;
                        }
                    },
                    error: function (response) {
                        errorCallback();
                        // var actions = [{ text: that.Resources['OK'] }];
                        // ErrorMessageCustom(that.Resources['ServerIssue'], null, that.Resources['ServerIssue'], actions);
                        // if (processOverlayId) {
                        //     Loading_OL.stopGenericLoadingScreen(processOverlayId);
                        // }
                    },
                    complete: function (e) {
                        // if (processOverlayId) {
                        //     Loading_OL.stopGenericLoadingScreen(processOverlayId);
                        // }
                    },
                });
            //}

            

        },

        downloadAsZipItems: function(DocumentIds, DocumentVersionIds, Extension, callback) {
            var that = this;
            var parameter = "";
            var documentIds = []
            for (var i = 0; i < DocumentIds.length; i++) {
                documentIds.push(DocumentIds[i].DocumentId);
                parameter += ("data%5B%5D=" + DocumentIds[i].DocumentId + "&");
            }

            var processOverlayId = "";
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {

                if(this.readyState === 1){
                    // opened
                    processOverlayId = Loading_OL.startGenericLoadingScreenWithDelay("DownloadingZipFile");
                }
                if(this.readyState === 3){
                    // loading
                    
                }
                if(this.readyState === 4){
                    if (this.status === 200) {
                        // Typical action to be performed when the document is ready:
                        //window.location = xhttp.responseURL;
                    }else{
                        // error
                        
                    }
                    Loading_OL.stopGenericLoadingScreen(processOverlayId);
                }
            };
            xhttp.onload = function (e) {
                if (this.status == 200) {
                    window.location = e.target.response;


                    // // Create a new Blob object using the 
                    // //response data of the onload object
                    // var blob = new Blob([this.response], { type: 'application/zip' });
                    // //Create a link element, hide it, direct 
                    // //it towards the blob, and then 'click' it programatically
                    // var a = document.createElement("a");
                    // a.style = "display: none";
                    // document.body.appendChild(a);
                    // //Create a DOMString representing the blob 
                    // //and point the link element towards it
                    // var url = window.URL.createObjectURL(blob);
                    // a.href = url;
                    // var name = xhttp.getResponseHeader("Content-Disposition")
                    //     .replace("\"", "")
                    //     .replace(".zip\"", ".zip")
                    //     .replace("attachment; filename=", "");

                    // name  = decodeURI(name);

                    // a.download = name;
                    // //programatically click the link to trigger the download
                    // a.click();
                    // //release the reference to the file by revoking the Object URL
                    // //window.URL.revokeObjectURL(url);
                    // //window.navigator.msSaveBlob(blob, name);

                } else {
                    //deal with your error state here
                }
            };
            xhttp.open("GET", "/api/Document/DownloadAsZip/?" + parameter, true);
            xhttp.timeout = 15*60*1000;
            xhttp.setRequestHeader("Authorization", "Bearer " + window.AuthenticationToken);
            xhttp.responseType = 'text';
            xhttp.send(null);
        },

        ExtractHere: function(DocumentId, DocumentVersionIds, Extension, callback) {
            var that = this;
            var parameter = "";

            var processOverlayId = "";
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {

                if (this.readyState === 1) {
                    // opened
                    processOverlayId = Loading_OL.startGenericLoadingScreenWithDelay("ExtractHere");
                }
                if (this.readyState === 3) {
                    // loading

                }
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        console.log("Extracted the data");
                    } else {
                        // error

                    }
                    Loading_OL.stopGenericLoadingScreen(processOverlayId);
                }
            };
            xhttp.onload = function (e) {
                if (this.status == 200) {
                    that.clipboard = [];
                    //that.documentOperationUpdate(that, msg.responseJSON);
                    console.log(JSON.parse(e.target.responseText))
                    that.documentOperationUpdate(that, JSON.parse(e.target.responseText));
                } else {
                    //deal with your error state here
                }
            };
            xhttp.open("GET", "/api/Document/ExtractHere/?documentExternalId=" + DocumentId.DocumentId, true);
            xhttp.setRequestHeader("Authorization", "Bearer " + window.AuthenticationToken);
            //xhttp.responseType = 'blob';
            xhttp.send(null);

        },

        Restore: function (DocumentIds) {
            var that = this;
            var parameter = "";

            var urlParams = "";
            for (var i = 0; i < DocumentIds.length; i++) {
                urlParams += ("Id[]=" + DocumentIds[i].DocumentId + "&");
            }

            var processOverlayId = "";
            DocumentIds.forEach(doc => {
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function () {
                    if (this.readyState === 1) {
                        // opened
                        processOverlayId = Loading_OL.startGenericLoadingScreenWithDelay("Restore");
                    }
                    if (this.readyState === 3) {
                        // loadingf
                    }
                    if (this.readyState === 4) {
                        if (this.status === 200) {
                            console.log("Restored the document!");
                        } else {
                            // error
                        }
                        Loading_OL.stopGenericLoadingScreen(processOverlayId);
                    }
                };
                xhttp.onload = function (e) {
                    if (this.status == 200) {
                        that.clipboard = [];
                        console.log(JSON.parse(e.target.responseText));
                        that.documentOperationUpdate(that, JSON.parse(e.target.response));
                        FileTreeExplLogic.openTrash(FileTreeExplLogic);
                    } else {
                        //deal with your error state here
                    }
                };
                //xhttp.open("GET", "/api/Document/RestoreDocument/?Id=" + DocumentId.DocumentId, true);
                xhttp.open("POST", "/api/Document/v2/RestoreDocument/" + doc.DocumentId, true);
                xhttp.setRequestHeader("Authorization", "Bearer " + window.AuthenticationToken);
                xhttp.send(null);
            });
        },

        getDocumentObject: function (DocumentId, success, error) {
            //Rein: I removed this loadingOL because it was called everytime we are trying to get info on a websocket update.
            //var processOverlayId = Loading_OL.startGenericLoadingScreenWithDelay("getDocumentObject");
            $.ajax({
                url: "/api/Document/GetDocument/" + DocumentId,
                type: "GET",
                headers: {
                    Authorization: "Bearer " + window.AuthenticationToken
                },
                dataType: "json",
                success: function (response) {

                    if (success != null) {
                        success(response);
                    }
                    //Loading_OL.stopGenericLoadingScreen(processOverlayId);
                },
                error: function(response)
                {

                    if (error != null) {
                        error(response);
                    }
                    //Loading_OL.stopGenericLoadingScreen(processOverlayId);
                }
            })
        },

        getDocumentObjectsNew: function (DocumentIds, success, error) {
            //Rein: I removed this loadingOL because it was called everytime we are trying to get info on a websocket update.
            //var processOverlayId = Loading_OL.startGenericLoadingScreenWithDelay("getDocumentObjectsNew");
            $.ajax({
                url: "/api/Document/GetDocumentsFromIdList/",
                type: "POST",
                data: JSON.stringify(DocumentIds),
                headers: {
                    Authorization: "Bearer " + window.AuthenticationToken
                },
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (response) {

                    if (success != null) {
                        success(response);
                    }
                    //Loading_OL.stopGenericLoadingScreen(processOverlayId);
                },
                error: function (response) {

                    if (error != null) {
                        error(response);
                    }
                    //Loading_OL.stopGenericLoadingScreen(processOverlayId);
                }
            });
        },

        getDocumentObjects: function (DocumentIds, success, error) {
            //rein: async is better!
            FileOperationLogic.getDocumentObjectsNew(DocumentIds, success, error);

            //var parameter = "";
            //var documentIds = []
            //for (var i = 0; i < DocumentIds.length; i++) {
            //    documentIds.push(DocumentIds[i]);
            //    parameter += ("Id%5B%5D=" + DocumentIds[i] + "&");
            //}



            //var xhttp = new XMLHttpRequest();
            //xhttp.onreadystatechange = function () {
                
            //};
            //xhttp.onload = function (e) {
            //    if (this.status == 200) {
            //        success(JSON.parse(e.currentTarget.responseText));
                    

            //    } else {
            //        //deal with your error state here
            //    }
            //};
            //xhttp.open("GET", "/api/Document/GetDocuments/?" + parameter, true);
            //xhttp.setRequestHeader("Authorization", "Bearer " + window.AuthenticationToken);
            //xhttp.responseType = "application/json";
            //xhttp.send(null);
        },

        getDocumentVersionObject: function (DocumentVerId, success, error) {
            var processOverlayId = Loading_OL.startGenericLoadingScreenWithDelay("getDocumentVersionObject");
            $.ajax({
                url: "/api/Document/GetDocumentVersion/" + DocumentVerId,
                type: "GET",
                headers: {
                    Authorization: "Bearer " + window.AuthenticationToken
                },
                dataType: "json",
                success: function (response) {
                    if (success != null) {
                        success(response);
                    }
                    Loading_OL.stopGenericLoadingScreen(processOverlayId);
                },
                error: function (response) {
                    if (error != null) {
                        error(response);
                    }
                    Loading_OL.stopGenericLoadingScreen(processOverlayId);
                }
            })
        },

        getDocumentVersionObjects: function (DocumentId, success, error) {
            var processOverlayId = Loading_OL.startGenericLoadingScreenWithDelay("getDocumentVersionObjects");
            $.ajax({
                url: "/api/Document/GetDocumentVersions/"+DocumentId ,
                type: "GET",
                headers: {
                    Authorization: "Bearer " + window.AuthenticationToken
                },
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (response) {
                    if (success != null) {
                        success(response);
                    }
                    Loading_OL.stopGenericLoadingScreen(processOverlayId);
                },
                error: function (response) {
                    if (error != null) {
                        error(response);
                    }
                    Loading_OL.stopGenericLoadingScreen(processOverlayId);
                }
            })
        },

        getDocumentChildren: function (DocumentId, success, error) {
            $.ajax({
                url: "/api/Document/GetChildren/" + DocumentId,
                type: "GET",
                headers: {
                    Authorization: "Bearer " + window.AuthenticationToken
                },
                dataType: "json",
                success: function (response) {
                    if (success != null) {
                        var documents = [];
                        for (var key in response) {
                             documents.push(response[key]);
                        }
                        success(documents);
                    }
                },
                error: function (response) {
                    if (error != null) {
                        var documents = [];
                        for (var key in response) {
                            documents.push(response[key]);
                        }
                        error(documents);
                    }
                }
            })
        },

        fileVersionItem: function (Document) {
            var window = $("#filesVersionWindow").data("kendoWindow");
            window.refresh({
                url: "/Document/Partial_GetDocumentVersions?DocumentId=" + Document.DocumentId + "&ProjectId=" + Document.ProjectId
            });
            $("#filesVersionWindow").parent(".k-widget.k-window").addClass("filekmodel").removeClass("docfolderkmodel folderkmodel").css({ "position": "fixed" });
            $("#filesVersionWindow").addClass('filesVersionWindow');
            window.center();
            window.open();
        },

        permissionItem: function (Document) {
            var window = $("#FolderPermissionsWindow").data("kendoWindow");
            $("#FolderPermissionsWindow").parent(".k-widget.k-window").addClass('folderkmodel').removeClass("docfolderkmodel filekmodel");
            $("#FolderPermissionsWindow").addClass("FolderPermissionsWindow");

            window.refresh({
                url: "/Document/Partial_GetFolderGroupPermissions?documentId=" + Document.DocumentId + "&projectExtId=" + Document.ProjectId
            });
            window.center();
            window.open();
        },

        openItem: function (Document, OpenEditor) {
            var that = this;
            if (Document.enable === false) {
                return;
            } else if (Document.Shortcut && !(Document.ShortcutTo)) {
                ErrorMessageCustom(that.Resources['ShortcutBrokenDelete'], null, that.Resources['ResourceNotFound'], [{ text: htmlDecode(that.Resources['Delete']), action: function () { that.callDeleteService(Document) } },{ text: that.Resources['Cancel'] }])
                return;
            }
            var doc =jQuery.extend(true, {}, Document);
            OpenEditor = OpenEditor === undefined || OpenEditor == null ? false : OpenEditor;
            if ( doc.ShortcutTo !== null) {
                doc.DocumentId = doc.ShortcutTo;
            }
            if (FileOperationLogic.hasViewer(doc)) {
                window.open(FileOperationLogic.getDocumentViewerLink(doc,OpenEditor));
            } else {
                FileOperationLogic.downloadItem(doc.DocumentId, doc.DocumentVersionId, doc.Extensions[0]);
            }
        },

        openOfficeItem: function (Document) {
            var that = this;
            if (Document.enable === false) {
                return;
            }
            var doc = jQuery.extend(true, {}, Document);
            //OpenEditor = OpenEditor === undefined || OpenEditor == null ? false : OpenEditor;

            //if (FileOperationLogic.hasViewer(doc)) {
                window.open(FileOperationLogic.getOfficeViewerLink(doc));
            //} 
        },

        getDocumentViewerLink: function (Document, OpenEditor) {
            var url = '/Document/DocumentViewer?docId=' + Document.DocumentId;
            if (!OpenEditor && typeof Document.DocumentVersionId !== "undefined") {
                url += '&docVerId=' + Document.DocumentVersionId;
            }
            if (typeof Document.ProjectId !== "undefined" || Document.ProjectId === "" || Document.ProjectId == null) {
                url = url + '&projectExtId=' + Document.ProjectId;
            }
            if (OpenEditor) {
                url += "&openEditor=" + OpenEditor;
            }
            return url;
        },

        getOfficeViewerLink: function (Document) {
            var url = '/Document/OfficeViewer?docId=' + Document.DocumentId;
            if (typeof Document.DocumentVersionId !== "undefined") {
                url += '&docVerId=' + Document.DocumentVersionId;
            }
            if (typeof Document.ProjectId !== "undefined" || Document.ProjectId === "" || Document.ProjectId == null) {
                url = url + '&projectExtId=' + Document.ProjectId;
            }
            return url;
        },

        //copyItem: function (Document) {
        //    this.clipboard = [Document];
        //    this.mode = "copy";
        //    if (typeof FileExplLogic !== "undefined") {
        //        FileExplLogic.getCurrentExplorerWidget().refresh();
        //    }
        //},

        //cutItem: function (Document) {
        //    this.clipboard = [Document];
        //    // store current doc id in global context
        //    this.mode = "cut";
        //    //this.updateModelData();
        //    if (typeof FileExplLogic !== "undefined") {
        //        FileExplLogic.getCurrentExplorerWidget().refresh();
        //    }
        //},

        copyItems: function (Documents) {
            this.clipboard = Documents;
            this.mode = "copy";
            if (typeof FileExplLogic !== "undefined") {
                FileExplLogic.getCurrentExplorerWidget().refresh();
            }
        },

        cutItems: function (Documents) {
            this.clipboard = Documents;
            // store current doc id in global context
            this.mode = "cut";
            //this.updateModelData();
            if (typeof FileExplLogic !== "undefined") {
                FileExplLogic.getCurrentExplorerWidget().refresh();
            }
        },

        deleteClipboard: function () {
            var that = this;
            that.deleteItems(that.clipboard, function () { that.clipboard = [] });
        },

        pasteItem: function (Document, includeAnnotations) {
            var that = this;
            var source = this.clipboard;
            var dest = Document;
            var destType = $('#selectedDocNameId').text();


            var URL;
            var infoModel = [];

            if (this.mode == "cut") {
                for (var i=0; i<source.length; i++){
                    infoModel.push({
                        DocumentId: source[i].DocumentId,
                        ParentId: dest.DocumentId
                    })
                }
                URL = "/api/Document/UpdateDocuments/";

            } else {

                if (includeAnnotations) {
                    URL = "/api/Document/DuplicateDocuments/";
                    for (var i = 0; i < source.length; i++) {
                        infoModel.push({
                            DocumentId: source[i].DocumentId,
                            ParentId: dest.DocumentId
                        })
                    }
                } else {
                    URL = "/api/Document/DuplicateDocumentWithoutAnnotations/";
                    var infoModel = {
                        DocumentId: source[0].DocumentId,
                        ParentId: dest.DocumentId
                    }
                }

            }

            var processOverlayId = Loading_OL.startGenericLoadingScreenWithDelay("pasteItemOverlay");
            // make backend call
            $.ajax({
                type: "PUT",
                url: URL,
                data: JSON.stringify(infoModel),
                headers: {
                    Authorization: "Bearer " + window.AuthenticationToken
                },
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (msg) {
                    //that.clipboard = [];

                    //if (that.mode != "cut" && includeAnnotations) {
                    //    if (msg.responseJSON == null) {
                    //        that.documentOperationUpdate(that, msg.responseJSON);
                    //    } else {
                            
                    //    }
                    //} else {
                        if (msg.responseJSON == null || msg.responseJSON == "undefined") {
                            that.documentOperationUpdate(that, msg);
                        } else {
                            that.documentOperationUpdate(that, msg.responseJSON);
                        }
                        
                    //}

                    //if (that.mode == "cut") {
                    //    FileTreeExplLogic.updateMovedDocuments(msg.responseJSON);
                    //} else if (that.mode != "cut" && !includeAnnotations) {
                    //    FileTreeExplLogic.updateDocument(msg.responseJSON);
                    //} else {
                    //    FileTreeExplLogic.updateDocuments(msg.responseJSON);
                    //}
                    Loading_OL.stopGenericLoadingScreen(processOverlayId);

                },
                error: function (e) {
                    Loading_OL.stopGenericLoadingScreen(processOverlayId);
                    try {
                        that.onFailedFileOperation(e, document);
                    } catch (e) {
                        console.error("An error occurred during the copy/paste");
                    }
                },
            });
        },

        editItem: function (Document, callback) {
            $("#editNameModal")
                .parent(".k-widget.k-window")
                .attr("class", " ")
                .addClass("k-widget k-window docnewfolderkmodel");

            if (typeof FileExplLogic !== "undefined") {
                FileExplLogic.isConfirmationWindowOpen = true;

            $('#editNameModal').data("kendoWindow")
                .bind("close", function () { FileExplLogic.isConfirmationWindowOpen = false });
            }

            this.showDialog("#editNameModal", Document, callback);
        },

        createFolderItem: function (Document) {
            if (typeof Document === "undefined") {
                Document = FileTreeExplLogic.dataItems;
            }
            this.showDialog('#addFolderModal', Document);
        },

        deleteItem: function (Document, callback) {
            var that = this;


            this.deleteItemDialog(
                function () {
                that.callDeleteService(Document, callback);
            })
            return;
        },



        deleteItemDialog: function (callback) {
            var that = this;
            

            //var kendoWindow = $("<div />").kendoWindow({
            //    title: that.Resources['Confirm'],
            //    resizable: false,
            //    modal: true
            //});

            ErrorMessageCustom(that.Resources['DeleteFilesFoldersWarning'], null, that.Resources['Confirm'], [{ text: that.Resources['OK'], action:callback }, { text: that.Resources['Cancel']}])

            //kendoWindow.data("kendoWindow")
            //    .content($("#delete-confirmation").html())
            //    .center().open();
            //kendoWindow
            //    .find(".delete-confirm,.delete-cancel")
            //        .click(function () {
            //            if ($(this).hasClass("delete-confirm")) {
            //                callback();
            //            }
            //            kendoWindow.data("kendoWindow").close();
            //        })
            //        .end();
            //return;
        },

        deleteItems: function (Documents, callback) {
            var that = this;


            this.deleteItemsDialog(
                function () {
                    that.callDeleteItemsService(Documents, callback);
                })
            return;
        },

        hardDeleteItems: function (Documents, callback) {
            var that = this;


            this.hardDeleteItemsDialog(
                function () {
                    that.callHardDeleteItemsService(Documents, callback);
                })
            return;
        },

        deleteItemsDialog: function (callback) {
            var that = this;
            FileExplLogic.isConfirmationWindowOpen = true;

            //var kendoWindow = $("<div />").kendoWindow({
            //    title: that.Resources['Confirm'],
            //    resizable: false,
            //    modal: true,
            //    close: function (e) {
            //        FileExplLogic.isConfirmationWindowOpen = false;
            //    }
            //});

            ErrorMessageCustom(
                that.Resources['DeleteFilesFoldersWarning'],
                null,
                that.Resources['Confirm'],
                [
                    { text: that.Resources['OK'], action: callback },
                    { text: that.Resources['Cancel'], action: function(){FileExplLogic.isConfirmationWindowOpen = false;} }
                ]);
            //kendoWindow.data("kendoWindow")
            //    .content($("#delete-confirmation").html())
            //    .center().open();
            //kendoWindow
            //    .find(".delete-confirm,.delete-cancel")
            //        .click(function () {
            //            if ($(this).hasClass("delete-confirm")) {
            //                callback();
            //            }
            //            kendoWindow.data("kendoWindow").close();
            //    })
            //    .end();
            //return;
        },

        hardDeleteItemsDialog: function (callback) {
            var that = this;


            //var kendoWindow = $("<div id='hardDeleteModal'/>").kendoWindow({
            //    title: that.Resources['Confirm'],
            //    resizable: false,
            //    modal: true
            //});

            ErrorMessageCustom(that.Resources['DeleteFilesFoldersWarning'], null, that.Resources['Confirm'], [{ text: that.Resources['OK'], action: callback }, { text: that.Resources['Cancel'] }])

            //kendoWindow.data("kendoWindow")
            //    .content($("#delete-confirmation").html())
            //    .center().open();
            //kendoWindow
            //    .find(".delete-confirm,.delete-cancel")
            //    .click(function () {
            //        if ($(this).hasClass("delete-confirm")) {
            //            callback();
            //        }
            //        kendoWindow.data("kendoWindow").close();
            //    })
            //    .end();
            //return;
        },

        PropertiesDialog: function (Document, tab) {
            var window = $("#PropertiesWindow").data("kendoWindow");
            //$("#PropertiesWindow").addClass('DoubleClickWindowOption');
            //var dialog = $("#PropertiesWindow").data("kendoWindow");
            var title = FileOperationLogic.Resources['Properties']+  ': ' + Document.Name ;
            window.title(title);
            window.refresh({
                url: "/Document/Partial_GetProperties?DocumentId=" + Document.DocumentId + "&ProjectId=" + Document.ProjectId + "&Tab="+tab
            });
            $(".k-widget.k-window").attr("class", " ").addClass("k-widget k-window scheduletaskkmodel");
            $("#PropertiesWindow").addClass('DoubleClickWindowOption');
            window.center();
            window.open();
        },

        importAnnotations: function (Document) {
            var window = $("#DocumentAnnotationImportWindow").data("kendoWindow");
            //$("#DocumentAnnotationImportWindow").addClass('DoubleClickWindowOption');

            window.refresh({
                url: "/Document/Partial_GetDocumentVersionWithAnnotation?DocumentId=" + Document.DocumentId + "&ProjectId=" + Document.ProjectId
            });
            $(".k-widget.k-window").attr("class", " ").addClass("k-widget k-window scheduletaskkmodel");
            $("#DocumentAnnotationImportWindow").addClass('DoubleClickWindowOption');
            window.title(FileOperationLogic.Resources['AnnotationTools']);
            window.center();
            window.open();
        },



        //rein: not tested (or referenced)
        unzipFile: function (e) {
            // validation, cannot change extension - editNameErrorMessage
            var docInfo = {
                Name: $('#txtEditDocName_unzip').val(),
                DocumentId: $('#txtEditDocId_unzip').val(),
                DocumentVersionId: $('#txtEditDocVerId_unzip').val()
            };
            if (docInfo.Name == null || docInfo.Name == '') {
                $('#unzipfolderErrorMessage').html(FileOperationLogic.Resources['NameEmpty']);
                $('#unzipfolderErrorMessage').show();
                return;
            }
            var origName = $('#txtEditDocOrigName_unzip').val();

            $.ajax({
                type: "POST",
                url: "/Document/UnzipFile/",
                headers: {
                    Authorization: "Bearer " + window.AuthenticationToken
                },
                data: JSON.stringify(docInfo),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                complete: function (msg) {
                    FileOperationLogic.updateModelData();
                }
            });
            $("#txtEditDocName_unzip").val("");
            $('#UnzipFolderName').data("kendoWindow").close();
            // $('#addFolderModal').data("kendoWindow").destroy();
            //FileExplLogic.updateView();
        },

        //unzipItem: function (Document) {
        //    $("#UnzipFolderName").parent(".k-widget.k-window").attr("class", " ").addClass("k-widget k-window docnewfolderkmodel");
        //    this.showDialogForUnzip("#UnzipFolderName", docId, docVerId, origName, documentType);
        //},

        searchDocuments: function (query) {
            var querySplit = query.replace(","," ").replace(";"," ").split(" ");
            querySplit.forEach(function (part, index, theArray) {
                theArray[index] = theArray[index].toUpperCase();
            });

            try {
                FileTreeExplLogic.searchItems = [];
                var currentPath = '<a onclick="FileExplLogic.refreshTreeContents(\'' +
                    FileTreeExplLogic.dataItems.DocumentId +
                    '\')" style="cursor:pointer;" > . / </a>';
                if (FileTreeExplLogic.dataItems.items != null && FileTreeExplLogic.dataItems.items.length > 0) {
                    this.searchFolderRecursively(currentPath, FileTreeExplLogic.dataItems.items, querySplit);
                }
            } catch (e) {
                console.log(
                    "Attempt to refresh the folder view failed. 'FileTreeExplorerLogic' not loaded yet (or not called 'FileTreeExplLogic').");
            }

        },

        /////////////////////////////////////////////////////////////////////////////
        /////////////////////////////  helper functions /////////////////////////////
        /////////////////////////////////////////////////////////////////////////////


        getDataItem: function (targetElement) {
            if (typeof targetElement === "undefined") { return; }
            var returnDocument;
            if (
                (typeof targetElement.classList !== "undefined" && targetElement.classList.contains('currentFolderReferenceObject')) ||
                (typeof targetElement.hasClass !== "undefined" && targetElement.hasClass('currentFolderReferenceObject'))
            ) {
                returnDocument = FileTreeExplLogic.dataItems;
            }
            if (typeof returnDocument === "undefined" && FileTreeExplLogic.treeView != null) {
                returnDocument = FileTreeExplLogic.treeView.dataItem(targetElement.closest('.treeViewElement'));
            }
            if (typeof returnDocument === "undefined" && FileTreeExplLogic.selectedTreeView != null) {
                var returnDocument = FileTreeExplLogic.selectedTreeView.dataItem(targetElement.closest('.treeViewElement'));
            }
            if (typeof returnDocument === "undefined" && typeof FileExplLogic !== "undefined" && FileExplLogic != null) {
                var KendoItem = FileExplLogic.getCurrentExplorerWidget();
                var returnDocument = KendoItem.dataItem(targetElement.closest('.documentReferenceObject'));
            }
            if (typeof returnDocument === "undefined" && window.document.getElementById("filesAndFoldersPartialContainer").contains(targetElement[0])) {
                var returnDocument = FileTreeExplLogic.dataItems;
            }
            return returnDocument;
        },

        startFileOperation: function (buttonId, documents) {
            if (typeof FileExplLogic !== "undefined" && FileExplLogic.toolbar.multiSelect) {
                FileExplLogic.multiSelect = false;
                $('#multiMobile').prop('checked', false);
            }
            $('.holdObject').removeClass('holdObject');
            switch (buttonId) {
                case 'RenameId':
                    FileOperationLogic.editItem(documents[0]);
                    break;
                case 'PermissionId':
                    FileOperationLogic.permissionItem(documents[0]);
                    break;
                //case 'UnzipId':
                //    FileOperationLogic.unzipItem(documents[0]);
                //    break;
                case 'DeleteId':
                    FileOperationLogic.deleteItem(documents[0]);
                    break;
                case 'DeleteMultipleId':
                    FileOperationLogic.deleteItems(documents);
                    break;
                case 'CopyId':
                    FileOperationLogic.copyItems(documents);
                    break;
                case 'CutId':
                    FileOperationLogic.cutItems(documents);
                    break;
                case 'PasteId':
                    FileOperationLogic.pasteItem(documents[0], false);
                    break;
                case 'PasteAnnotationId':
                    FileOperationLogic.pasteItem(documents[0], true);
                    break;
                case 'DownloadId':
                    FileOperationLogic.downloadItem(documents[0]);
                    break;
                case 'DownloadAsZipId':
                    FileOperationLogic.downloadAsZipItems(documents);
                    break;
                case 'ExtractHereId':
                    FileOperationLogic.ExtractHere(documents[0]);
                    break;
                case 'RestoreId':
                    //FileOperationLogic.Restore(documents[0]);
                    FileOperationLogic.Restore(documents);
                    break;
                case 'HardDeleteId':
                    FileOperationLogic.hardDeleteItems(documents);
                    break;
                case 'ShareId':                  
                    //showShareDialog("DOCUMENT", documents[0].DocumentVersionId);
                    FileOperationLogic.PropertiesDialog(documents[0], "Share");
                    break;
                case 'PropertiesId':
                    FileOperationLogic.PropertiesDialog(documents[0],"General");
                    break;
                case 'OpenId':
                    if (FileOperationLogic.isFolder(documents[0])) {
                        FileTreeExplLogic.onNavigate(documents[0]);
                        } else {
                        FileOperationLogic.openItem(documents[0], false);
                        }
                    break;
                case 'OpenInEditorId':
                    //alert("test");
                    FileOperationLogic.openOfficeItem(documents[0]);
                    break;
                case 'FileVersionId':
                    FileOperationLogic.fileVersionItem(documents[0]);
                    break;
                case 'EditId':
                    FileOperationLogic.openItem(documents[0], true);
                    break;
                case 'ImportAnnotationId':
                    FileOperationLogic.importAnnotations(documents[0]);
                    break;
                case 'CreateFolderId':
                    FileOperationLogic.createFolderItem(documents[0]);
                    break;
                case 'DuplicateAsShortcutId':
                    FileOperationLogic.duplicateAsShortcuts(documents);
                    break;
                case 'PasteAsShortcutId':
                    FileOperationLogic.pasteAsShortcuts(documents[0]);
                    break;
                case 'NewWordDocumentId':
                    FileOperationLogic.createNewOfficeFile("DOCX", documents[0].DocumentId);
                    break;
                case 'NewExcelDocumentId':
                    FileOperationLogic.createNewOfficeFile("XLSX", documents[0].DocumentId);
                    break;
                case 'NewPpptDocumentId':
                    FileOperationLogic.createNewOfficeFile("PPTX", documents[0].DocumentId);
                    break;
            }
        },

      

        hasViewer: function (document) {
            if (typeof document.Extensions === "undefined" || document.Extensions == null) {
                return false
            }
            for (var i = 0; i < document.Extensions.length; i++) {
                switch (document.Extensions[i].replace(".", "").toUpperCase()) {
                    case "MP3":
                    case "MP4":
                    case "MKV":
                    case "MOV":
                    case "OGV":
                    case "FLAC":
                    case "WAV":
                    case "WEBM":
                    case "OBJ":
                    //case "GLB":
                    case "STL":
                    case "DAE":
                    case "PDF":
                    case "X31":
                    case "X52":
                    case "X61":
                    case "X80":
                    case "X81":
                    case "X82":
                    case "X83":
                    case "X84":
                    case "X84P":
                    case "X85":
                    case "X86":
                    case "X87":
                    case "X93":
                    case "X94":
                    case "X96":
                    case "X97":
                        return true;
                        break;
                }
            }
            return false;
        },

        isFolder: function(document) {
            return (typeof document !== "undefined" && document.Type.indexOf("FOLDER") > -1);
        },

        isTrash: function (document) {
            return (typeof document !== "undefined" && document.Type.indexOf("TRASH") > -1);
        },

        isFileOrShortcut: function (document) {
            return (typeof document !== "undefined" && document.Type.indexOf("FOLDER") == -1);
        },

        hasAnnotations: function(document) {
            return document.Extensions.some(function(e) {
                return e.replace(".", "").toUpperCase() === "PDF";
            });
        },

        isReadWrite: function (document) {
            if (document.PermissionCode === "WRITE") {
                return true;
            } else if (typeof document.ShortcutTo !== "undefined" && document.ShortcutTo != null && typeof FileTreeExplLogic !== "undefined") {
                var shortcutDoc = FileTreeExplLogic.documentArray[document.ShortcutTo];
                if (typeof shortcutDoc !== "undefined" && shortcutDoc.PermissionCode === "WRITE") {
                    return true;
                }
                
            }
            return false;
        },

        isRootFolder: function (document) {
            return (typeof document.ParentId == "undefined" || document.ParentId == null);
        },

        hasItemOnClipboard: function () { return FileOperationLogic.clipboard.length >0; },


        duplicateAsShortcuts: function (documents) {
            var shortcuts = [];
            documents.forEach(
                function (d) {
                    shortcuts.push({
                        ShortcutTo: d.DocumentId,
                        ParentId: d.ParentId,
                        ProjectId: d.ProjectId,
                        ProductId: d.ProductId,
                    });
                }
            );
            FileOperationLogic.createShortcuts(shortcuts);
        },

        pasteAsShortcuts: function (destination) {
            var shortcuts = [];
            FileOperationLogic.clipboard.forEach(
                function (d) {
                    shortcuts.push({
                        ShortcutTo: d.DocumentId,
                        ParentId: destination.Type === "FOLDER" ? destination.DocumentId : destination.ParentId,
                        ProjectId: destination.ProjectId,
                        ProductId: destination.ProductId,
                    });
                }
            );
            FileOperationLogic.createShortcuts(shortcuts);
        },

        createShortcuts: function (documents) {
            var processOverlayId = Loading_OL.startGenericLoadingScreenWithDelay("createShortCuts");
            $.ajax({
                type: "POST",
                url: "/api/Document/CreateShortcuts/",
                data: JSON.stringify(documents),
                headers: {
                    Authorization: "Bearer " + window.AuthenticationToken
                },
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (msg) {
                    FileOperationLogic.documentOperationUpdate(FileOperationLogic, msg);
                    Loading_OL.stopGenericLoadingScreen(processOverlayId);

                },
                error: function (e) {
                    Loading_OL.stopGenericLoadingScreen(processOverlayId);
                    console.error("An error occurred during the creation of the shortcut(s)");
                },
            });
        },

        /////////////////////////////////////////////////////////////////////////////
        ///////////////////////////// "upload" functions ////////////////////////////
        /////////////////////////////////////////////////////////////////////////////

        AttachDocument: function (input, loadDialog) {
            loadDialog = typeof loadDialog === 'undefined' ? true : loadDialog;
            // This function provides a dialogue for associating documents in the document tree with another object 
            // (EMS nodes, Tasks, etc.)
            // It currently does not allow already associated nodes to be removed, but this may be a feature in the future.
            // 
            // The following can be provided in the input object:
            // 
            // input = {
            //    attachedDocumentIds: [<array of document Guids already associated>],
            //    attach: function (response, data, document, successCallback, errorCallback) { <callback>, see last note! },
            //    detach: function (response, data, document, successCallback, errorCallback) { <callback>, see last note! },
            //    complete: function (response, data) { <callback> },
            //    success: function (response, data, document) { <callback> },
            //    updateSuccess: function (response, data, document) { <callback> }, (called on rename)
            //    error: function (response, data) { <callback> }
            //    containerId: "ID if the div in whish the dialog should apear - optional; without a popup will be generated",
            //    data: { <any data you'd like to pass to your callbacks> },
            // };
            //
            // where: 
            // - "response" will be the ajax response of the previous function call
            // - "data" is as provided in the input
            // - "document" is the documentApiModel being created
            //
            // notes: 
            // - the 'detach' callback will be called if an error occurs after calling the 'input.attach' callback
            // - if anything goes wrong, the 'error' callback is called before calling the 'input.complete' callback
            // - The "input.attach" and 'input.detach' callbacks must call the provided 'successCallback' or 'errorCallback': 

            // store the input on the object after validation
            var that = FileOperationLogic;
            input.attach = that.validateCallback(input.attach);
            input.detach = that.validateCallback(input.detach);
            input.success = that.validateCallback(input.success);
            input.updateSuccess = that.validateCallback(input.updateSuccess);
            input.error = that.validateCallback(input.error);
            input.complete = that.validateCallback(input.complete);
            this.documentAttachInput = input;
            this.documentAttachEmbed = true;

            if (typeof this.initiallySelected === "undefined" || this.initiallySelected == null) {
                this.initiallySelected = [];
            } else {
                this.initiallySelected = this.documentAttachInput.attachedDocumentIds.slice(0);
            }

            var window = $('#AttachFileWindow').data("kendoWindow");
            $(".k-widget.k-window").attr("class", " ").addClass("k-widget k-window dockmodel");

            try {
                window.unbind('close');
            } catch (e) { console.log("no callback associated yet with attach file dialog") }

            if(loadDialog){
                var url = "/Document/PartialFileSelectorTree?ProjectId=" + FileOperationLogic.ProjectId + "&selectedDocumentIds=" + this.documentAttachInput.selectedDocumentIds;
                FileTreeExplLogic.ready = false;
                if (input.containerId) {
                    if (input.forceEmbedButtons) {
                        this.documentAttachEmbed = false;
                    }
                    $(document).ready(function () {
                        $('#' + input.containerId).load(url);
                    });
                } else {
                    this.documentAttachEmbed = false;
                    $("#AttachFileWindow").addClass("uploadWindow");
                    //EMS REMOVE CLASS
                    $(".k-widget.k-window").attr("class", " ").addClass("k-widget k-window dockmodel");
                    window.content('<div id="loadingGifHolder"></div>');
                    window.refresh({
                        url: url
                    });
                    window.center();
                    window.open();
                }     
            }       
        },

        AttachHiddenDocument: function (input) {
            // This function provides a div for associating hidden documents with another object. 
            // (EMS nodes, Tasks, etc.)
            // 
            // The following can be provided in the input object:
            // 
            // input = {
            //    parentId: "DocumentGuidOfFolderDocumentshouldResideIn - required",
            //    attachedDocumentIds: [<array of document Guids already associated>],
            //    attach: function (response, data, document, successCallback, errorCallback) { <callback>, see last note! },
            //    detach: function (response, data, document, successCallback, errorCallback) { <callback>, see last note! },
            //    complete: function (response, data) { <callback> },
            //    success: function (response, data, document) { <callback> },
            //    updateSuccess: function (response, data, document) { <callback> }, (called on rename)
            //    error: function (response, data) { <callback> }
            //    click: function (documentId) { <callback> } //  trigger for clicking on the filename on the grid
            //    filterPDF: <true; false> // default: false. if true, it only allows pdf documents or documents that can be converted to pdf (for EMS)
            //    data: { <any data you'd like to pass to your callbacks> }, 
            //    containerId: "ID if the div in whish the dialog should apear - optional; without a popup will be generated",
            //    readOnly: true or false
            // };
            //
            // where: 
            // - "response" will be the ajax response of the previous function call
            // - "data" is as provided in the input
            // - "document" is the documentApiModel being created
            //
            // notes: 
            // - the 'detach' callback will be called if an error occurs after calling the 'input.attach' callback
            // - if anything goes wrong, the 'error' callback is called before calling the 'input.complete' callback
            // - The "input.attach" and 'input.detach' callbacks must call the provided 'successCallback' or 'errorCallback': 
            
            // store the input on the object after validation
            var that = FileOperationLogic;
            if (typeof input === "undefined"){input = {};}
            input.attach = that.validateCallback(input.attach);
            input.detach = that.validateCallback(input.detach);
            input.success = that.validateCallback(input.success);
            input.updateSuccess = that.validateCallback(input.updateSuccess);
            input.error = that.validateCallback(input.error);
            input.complete = that.validateCallback(input.complete);
            if (typeof input.click === "undefined") {
                input.click = that.openItem;
            }
            that.validateCallback(input.click);
            
            //input.clickWrapper = function (id) {
                //FileOperationLogic.documentAttachInput.click(HiddenFileUploadLogic.hiddenGridWidget.dataSource.get(id));

                //ScrlTabs.loadDocumentsIntoScrollingTabs(
                //    TreeView_L.treeView.dataSource.options.data[0].items.find(i => i.spriteCssClass.toLowerCase().includes("icon-drawing2")).id,
                //    id,
                //    function () {
                //        //var document = TreeViewLogic.lastOpenDocument;
                //        //pdfStatus = document.Extensions.some(function (f) { return ScrlTabs.docHelper.matchSupportedPDFExtensions(f, ScrlTabs.docHelper); });
                //        //if (data.updateScrollingTabs) {
                //        //    ScrlTabs.ScrollingTabOpen(document.DocumentId, document.DocumentVersionId, document.Extensions[0], pdfStatus);
                //        //}
                //    }
                //);

           // };

            if (typeof input.parentId === "undefined" || input.parentId === null || input.parentId.length !== 36) {
                throw "Invalid parentId Guid"
            }
            if (typeof input.filterPDF === "undefined") { input.filterPDF = false; }


            this.documentAttachInput = input;
            this.documentAttachEmbed = true;

            if (typeof this.initiallySelected === "undefined" || this.initiallySelected == null) {
                this.initiallySelected = [];
            } else {
                this.initiallySelected = this.documentAttachInput.attachedDocumentIds.slice(0);
            }

            if (typeof FileTreeExplLogic !== "undefined") {
                FileTreeExplLogic.parentId = input.parentId;
            }

            if (!input.containerId) {
                this.documentAttachEmbed = false;
                input.containerId = CreateHiddenDocumentDialog();
            }

            HiddenFileUploadLogic.initHiddenUpload(input);


        },


        CreateHiddenDocumentDialog: function () {
            // This function provides a dialogue for associating hidden documents with another object 
            // (EMS nodes, Tasks, etc.). It provides a wrapper for AttachHiddenDocument that creates the popup.

            var window = $('#AttachHiddenFileWindow').data("kendoWindow");
            try {
                window.unbind('close');
            } catch (e) { console.log("no callback associated yet with attach file dialog") }


            $("#AttachHiddenFileWindow").addClass("uploadWindow");
            $(".k-widget.k-window").attr("class", " ").addClass("k-widget k-window");
            if (typeof HiddenFileUploadLogic === "undefined") {
                throw "'HiddenFileUploadLogic' not found, unable to populate dialog." 
            }

            var parentId = 'AttachHiddenFileWindowDialogContainer';
            window.content("<div id='" + parentId + "'></div>")

            window.center();
            window.open();

            return parentId
        },

        upload: function (input, isHidden) {


            // This function wraps around the following callbacks (if everything goes right):
            // - FileOperationLogic.createDocumentVersionPlaceHolder
            // - input.attachCallback
            // - FileOperationLogic.uploadToDocumentVersionPlaceHolder
            // - input.success
            // - input.complete
            // 
            // The following can be provided in the input object:
            // 
            // input = {
            //    file: "TheActualFileObject - required. can be a single file, a FileList object (from regular input element upload event) or an array (from kendo upload event)",
            //    parentId: "DocumentGuidOfFolderDocumentshouldResideIn - required",
            //    data: { <any data you'd like to pass to your callbacks> },
            //    attach: function (response, data, document, successCallback, errorCallback) { <callback>, see last note! },
            //    detach: function (response, data, document, successCallback, errorCallback) { <callback>, see last note! },
            //    complete: function (response, data) { <callback> },
            //    success: function (response, data, document) { <callback> },
            //    error: function (response, data) { <callback> }
            // };
            //
            // where: 
            // - "response" will be the ajax response of the previous function call
            // - "data" is as provided in the input
            // - "document" is the documentApiModel being created
            //
            // notes: 
            // - the 'detach' callback will be called if an error occurs after calling the 'input.attach' callback
            // - if anything goes wrong, the 'error' callback is called before calling the 'input.complete' callback
            // - The "input.attach" and 'input.detach' callbacks must call the provided 'successCallback' or 'errorCallback': 

            // create a fileUpload object that will take care of the rest

            // the gantt object means that we are in Schedule
            //var currentFileUpload = new FileUpload(typeof FileExplLogic === 'undefined' && typeof gantt === 'undefined');
            isHidden = typeof isHidden !== 'undefined' ? isHidden : false;
            var currentFileUpload = new FileUpload(isHidden);
            currentFileUpload.startUpload(input);
            return currentFileUpload;
        },

        /////////////////////////////////////////////////////////////////////////////
        //////////////////////////// "private" functions ////////////////////////////
        /////////////////////////////////////////////////////////////////////////////
        
        addFileOperationToRecord: function (id) {
            if (typeof id === "undefined") {
                var id = kendo.guid();
            }
            this.fileOperationIds.push(id)
            return id;
        },

        isLastFileOperation: function (id) {
            if (this.fileOperationIds.includes(id)) {
                this.fileOperationIds.splice(this.fileOperationIds.indexOf(id), 1);
            }
            if (this.fileOperationIds.length === 0) {
                return true;
            } else if(this.inUploadProcessDocuments.length === 0){
                return true;
            }else { 
                return false; 
            }
        },

        validateCallback: function (callback) {
            if (typeof callback === "undefined" || callback == null) {
                return function (event, dat, doc, success, error) {
                    if (typeof success !== "undefined") { success(); }
                };
            } else {
                return callback;
            }
        },

        updateModelData: function (parentId) {
            try {
                if (typeof parentId === "undefined") {
                    parentId = FileTreeExplLogic.ParentId;
                }
                //FileTreeExplLogic.loadDocumentData();
                FileExplLogic.updateView();

            } catch (e) {
                console.log("Attempt to refresh the folder view failed. 'FileExplorerLogic.js' or 'FileTreeExplorerLogic' not loaded yet (or not called 'FileExplLogic' and 'FileTreeExplLogic', respectively).");
            }
        },



        onStartFileOperation: function (e) {
            try {
                //Loading_OL.startGenericLoadingScreenWithDelay("Upload");
            } catch (e) {
                console.log("LoadingOverlayLogic is not (correctly) loaded.");
            }

            $(".k-upload-status").remove();
        },

        onCompleteFileOperation: function (e) {
            try {
                if (typeof FileTreeExplLogic.treeView !== "undefined"){
                    //FileTreeExplLogic.loadDocumentData();
                    FileExplLogic.updateView();
                }
            }catch (error) {
                console.log("FileExplorerLogic is not (correctly) loaded.");
            }
            //Loading_OL.stopGenericLoadingScreenByName('Upload');
            //FileOperationLogic.onUploadComplete(e);
        },

        onUploadComplete: function (e) {
            try {
                Loading_OL.overlayForceClose();
            } catch (error) {
                console.log("LoadingOverlayLogic is not (correctly) loaded.");
            }
            $(".k-upload-status").remove();
        },

        onFailedFileOperation: function (m, document) {
            var that = FileOperationLogic;
            var actions = [{ text: that.Resources['OK'] }];
            var showMessage = "";
            var errorMessage = that.Resources['ServerIssue'];
            var notificationType = that.Resources['ServerIssue'];
            if (typeof document !== "undefined") {
                showMessage = document.Name + ": ";
            }
            try {
                if (JSON.parse(m.XMLHttpRequest.response).ExceptionType == "CMACSServices.Exceptions.DuplicateException") {
                    errorMessage = "A duplicate file and version exists.";
                    notificationType = that.Resources['Duplicate'];
                }
            } catch (e) { console.log("Error message returned was in unsupported format. throwing generic error");}
            showMessage = showMessage + errorMessage;
            
            ErrorMessageCustom(showMessage, null, notificationType, actions);
        },

        closeunzipfolder: function (e) {
            var w = window.parent.$("#UnzipFolderName").data("kendoWindow");
            w.close();
        },

        putEditName: function (e) {
            var that = FileOperationLogic;
            // validation, cannot change extension - editNameErrorMessage
            var DocumentId = $('#txtEditDocId').val();
            var docInfo = {
                Name: $('#txtEditDocName').val(),
                DocumentId: DocumentId,
            };
            if (docInfo.Name == null || docInfo.Name.trim(' ') == '') {
                $('#editNameErrorMessage').html(that.Resources['NameEmpty']);
                $('#editNameErrorMessage').show();
                return;
            }
            var processOverlayId = Loading_OL.startGenericLoadingScreenWithDelay("putEditName");
            $.ajax({
                type: "PUT",
                url: "/api/Document/UpdateDocument/",
                headers: {
                    Authorization: "Bearer " + window.AuthenticationToken
                },
                data: JSON.stringify(docInfo),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (msg) {
                    that.documentOperationUpdate(that, msg);
                    if (typeof HiddenFileUploadLogic !== "undefined" && typeof HiddenFileUploadLogic.hiddenGridWidget !== "undefined" ) {
                        HiddenFileUploadLogic.refresh();
                        that.documentAttachInput.updateComplete(msg, that.documentAttachInput.data, msg[0].Document);
                    }

                },

                complete: function (msg) {
                    //that.updateModelData();
                    Loading_OL.stopGenericLoadingScreen(processOverlayId);  
                    $('#editNameModal').data("kendoWindow").close();
                    try {
                        RefreshSelectedNode();
                    } catch (e) {
                        //console.log("Rein: this code should not exist. There should be a callback for code specific to one view. This is for document templates.")
                    }
                }
            });
        },

        searchFolderRecursively: function (parentPath, items, query) {
            // the actual search
            var matchingItems = items.filter(
                function (element) {
                    var returnVal = true;
                    var i = 0;
                        //if (element.Name == "Contract additions") {
                        // 
                        //}
                    while (returnVal == true && i < query.length) { // each item must have a match
                        returnVal = typeof element.searchIndex.find(function (keyword) {
                            return (keyword.indexOf(query[i]) > -1)
                        }) !== "undefined"
                        i++;
                    }
                    return returnVal;
                }
            )

            // add to array
            for (var i = 0; i < matchingItems.length; i++) {
                var item = matchingItems[i];

                item["parentPath"] = parentPath;
                try {
                    FileTreeExplLogic.searchItems.push(item);
                } catch (e) {
                    console.log("Attempt to refresh the folder view failed. 'FileTreeExplorerLogic.js' not loaded yet (or not called  'FileTreeExplLogic').");
                }
            }

            for (var i = 0; i < items.length; i++) {
                var item = items[i];

                if (item.items != null && item.items.length > 0) {
                    var childParentPath = parentPath +
                        '<a onclick="FileExplLogic.refreshTreeContents(\'' +
                            item.DocumentId +
                        '\')" style="cursor:pointer;" >' +
                            item.Name +
                        ' / </a>'
                    this.searchFolderRecursively(childParentPath, item.items, query);
                }
            }
        },

        blockSpecialChar: function (e){
            var that = this;
            var k;
            document.all ? k = e.keyCode : k = e.which;
            var specials = [47, 92, 58, 42, 63, 34, 60, 62, 124];
            if(k === 13){
                that.postFolderData(e);
            }
            return (specials.indexOf(k) > -1) ? false : true;
            //return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k >= 48 && k <= 57));
        },

        postFolderData: function (e) {
            var that = this;
            var parentId;
            try {
                parentId = $('#txtEditDocId').val();
                if (typeof parentId === "undefined") {
                    parentId = FileTreeExplLogic.parentId;
                }
            } catch (e) {
                console.log("Attempt to refresh the folder view failed.  'FileTreeExplorerLogic' not loaded yet (or not called and 'FileTreeExplLogic').");
                return;
            }
            var docInfo = {
                Name: $('#txtFolderName').val(),
                ParentId: parentId
            };
            that.createFolder(
                docInfo,
                that.onFolderCreated,
                function (e) { that.onFolderCreateError(e, docInfo); },
                function () { }
            );
            $("#txtFolderName").val("");
            $('#addFolderModal').data("kendoWindow").close();
        },

        createFolder: function (newFolderModel,onSuccess,onError,onComplete) {
            $.ajax({
                type: "POST",
                url: "/api/Document/CreateFolder/",
                headers: {
                    Authorization: "Bearer " + window.AuthenticationToken
                },
                data: JSON.stringify(newFolderModel),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: onSuccess,
                error: onError,
                complete: onComplete
            });
        },

        createNewOfficeFile: function (fileType, folderId) {

            try {
                var parentId = folderId;
                var docInfo = {
                    Name: fileType,
                    ParentId: parentId
                };
            }
                catch (e) {
                console.log("Attempt to refresh the folder view failed.  'FileTreeExplorerLogic' not loaded yet (or not called and 'FileTreeExplLogic').");
                return;
            }


            $.ajax({
                type: "POST",
                url: "/api/Document/CreateNewOfficeFile/",
                headers: {
                    Authorization: "Bearer " + window.AuthenticationToken
                },
                data: JSON.stringify(docInfo),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: this.onFolderCreated,
                error: function (e) { this.onFolderCreateError(e, docInfo); },
                complete: function () { }
            });
        },

        onFolderCreated: function (document) {
            FileOperationLogic.documentOperationUpdate(FileOperationLogic, [{ Document: document, Messages: [] }]);
            //FileOperationLogic.updateModelData();

        },
        
        onFolderCreateError: function(e,document) {
            var actions = [{ text: this.Resources['OK'] }];
            var showMessage = document.Name + ": " + this.Resources['ServerIssue'];
            ErrorMessageCustom(showMessage, null, this.Resources['ServerIssue'], actions);
        },

        showDialog: function (divId, Document, callback) {
            $(divId).parent(".k-widget.k-window").attr("class", " ").addClass("k-widget k-window docnewfolderkmodel");
            //console.log("divId: " + divId);
            var winObj = $(divId).data("kendoWindow");
            if (winObj) {
                if (Document != null) {
                    $('#txtEditDocId').val(Document.DocumentId);
                    $('#txtEditDocName').val(Document.Name);
                    $('#txtEditDocOrigName').val(Document.Name);
                    $('#txtEditDocType').val(Document.Type);
                }
                winObj.options.Visible = true;
                winObj.open();
                winObj.center();
            }
            if (callback) callback();
        },

        CloseWindow: function () {
            var window = $("#addFolderModal").data("kendoWindow");
            window.close();
        },

        CloseWindow2: function () {
            var window = $("#editNameModal").data("kendoWindow");
            window.close();
        },
        //showDialogForUnzip: function (divId, docId,docVerId, origName, documentType) {
        //    console.log("divId: " + divId);
        //    var winObj = $(divId).data("kendoWindow");
        //    if (winObj) {
        //        if ($('#txtEditDocId_unzip')) {
        //            $('#txtEditDocId_unzip').val(docId);
        //            $('#txtEditDocVerId_unzip').val(docVerId);
        //            $('#txtEditDocName_unzip').val(origName);
        //            $('#txtEditDocOrigName_unzip').val(origName);
        //        }
        //        winObj.options.Visible = true;
        //        winObj.open();
        //        winObj.center();
        //    }
        //},

        callDeleteService: function (Document, successCallback) {
            this.callDeleteItemsService([Document], successCallback);
        },

        callDeleteItemsService: function (Documents, successCallback) {

            var processOverlayId = Loading_OL.startGenericLoadingScreenWithDelay("callDeleteItemsService");

            var that = FileOperationLogic;
            var documentIds = [];
            for (var i = 0; i < Documents.length; i++) {
                documentIds.push(Documents[i].DocumentId);
            }
            documentIds.forEach(function(docId){
                $.ajax({
                    type: "DELETE",
                    url: "/api/Document/v2/DeleteDocument/"+docId,
                    //data: JSON.stringify(documentIds),
                    headers: {
                        Authorization: "Bearer " + window.AuthenticationToken
                    },
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (msg) {
                        try{
                            FileTreeExplLogic.deleteDocumentsFromWidgets(documentIds);
                        } catch (e) { console.log('document not found.');}
                        that.documentOperationUpdate(that, msg);

                        if (typeof successCallback !== "undefined" && successCallback !== null) {
                            successCallback(msg);
                        }
                        if (typeof FileExplLogic !== 'undefined') FileExplLogic.isConfirmationWindowOpen = false;
                    },
                    error: function (msg) {
                        console.log("an error occured while trying to delete: " + msg);
                        FileExplLogic.isConfirmationWindowOpen = false;
                    },
                    complete: function (msg) {
                        Loading_OL.stopGenericLoadingScreen(processOverlayId);
                        console.log("deletion of document procedure finalized");
                        FileExplLogic.isConfirmationWindowOpen = false;
                    }
                });
            });
        },

        callHardDeleteItemsService: function (Documents, successCallback) {

            var processOverlayId = Loading_OL.startGenericLoadingScreenWithDelay("callDeleteItemsService");

            var that = FileOperationLogic;
            var documentIds = []
            for (var i = 0; i < Documents.length; i++) {
                documentIds.push(Documents[i].DocumentId);
            }
            documentIds.forEach(function(docId){
                $.ajax({
                    type: "DELETE",
                    url: "/api/Document/v2/HardDeleteDocument/"+docId,
                    //data: JSON.stringify(documentIds),
                    headers: {
                        Authorization: "Bearer " + window.AuthenticationToken
                    },
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (msg) {
                        try {
                            FileTreeExplLogic.deleteDocumentsFromWidgets(documentIds);
                        } catch (e) { console.log('document not found.'); }
                        that.documentOperationUpdate(that, msg);

                        if (typeof successCallback !== "undefined" && successCallback !== null) {
                            successCallback();
                        }
                    },
                    error: function (msg) {
                        console.log("an error occured while trying to delete: " + msg);
                    },
                    complete: function (msg) {
                        Loading_OL.stopGenericLoadingScreen(processOverlayId);
                        console.log("deletion of document procedure finalized");
                        if (typeof FileTreeExplLogic !== "undefined") {
                            FileTreeExplLogic.openTrash(FileTreeExplLogic);
                        }
                    }
                });
            });
        },

        deleteNode: function (docId) {
            try{
                var item = FileTreeExplLogic.treeView.dataSource.get(docId);
                if (item && item.uid) {
                    var node = this.treeView.findByUid(item.uid);
                    this.treeView.remove(node);
                }
            } catch (e) {
                console.log("Attempt to refresh the folder view failed. 'FileTreeExplorerLogic' not loaded yet (or not called and 'FileTreeExplLogic').");
                return;
            }
        },


        onDocPermClose: function onDocPermClose(e) {
            $(this.element).empty();
        },

        AttachHiddenDocumentAsShortcut: function(docIds, that){
            return new Promise(function(resolve,reject){
                try{
                    var input = that.documentAttachInput;
                    var docInfos = [];
                    docIds.forEach(docId => {
                        var document  = FileTreeExplLogic.documentArray[docId];
                        var docInfo = {
                            ParentId: document.ParentId,
                            Name: document.Name,
                            Extensions: [document.Extension.replace('.','')],
                            DocumentId: docId,
                            ProjectId: document.ProjectId,
                            ObjId: input.objectId
                        }
                        docInfos.push(docInfo);
                    });
                    
    
                    var url = "/api/Document/CreateHiddenShortcuts";
                    $.ajax({
                        type: "POST",
                        url: url,
                        headers: {
                            Authorization: "Bearer " + window.AuthenticationToken
                        },
                        data: JSON.stringify(docInfos),
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        error: function (e) {
                            return reject(e);
                        },
                        success: function (e) {
                            return resolve(e);
                        }
                    });
                }catch(ex){
                    console.error(ex);
                }
            });
            
        },

        DetachHiddenDocumentAsShortcut: function(docId, that){
            return new Promise(function(resolve,reject){
                try{
                    var input = that.documentAttachInput;
                    var document  = FileTreeExplLogic.documentArray[docId];
                    Object.values(FileTreeExplLogic.documentArray).filter(function(d){
                        return d.ShortcutTo === docId;
                    });
                    var docInfo = {
                        ParentId: document.ParentId,
                        Name: document.Name,
                        Extensions: [document.Extension.replace('.','')],
                        DocumentId: docId,
                        ProjectId: document.ProjectId,
                        ObjId: input.objectId
                    }
    
                    var url = "/api/Document/DetachHiddenDocument/" + docId;
                    $.ajax({
                        type: "POST",
                        url: url,
                        headers: {
                            Authorization: "Bearer " + window.AuthenticationToken
                        },
                        //data: JSON.stringify(docInfo),
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        error: function (e) {
                            return reject(e);
                        },
                        success: function (e) {
                            return resolve(e);
                        }
                    });
                }catch(ex){
                    console.error(ex);
                }
            });
            
        },


        saveSelected: function (e, that) {
            that.fileOperationIds = FileTreeExplLogic.additionallySelected.concat(FileTreeExplLogic.additionallyDeselected);


            var additionallySelectedTempArray = FileTreeExplLogic.additionallySelected.slice(0);
            var additionallyDeselectedTempArray = FileTreeExplLogic.additionallyDeselected.slice(0);

            FileOperationLogic.getAttachedShortcuts(that.documentAttachInput.objectId).then(
                data=>{
                    var selectedShortcutObjectsFromApi = data;

                    // destils the documentapi object and returns it to the provided 'attach' callback.
                    FileOperationLogic.AttachHiddenDocumentAsShortcut(additionallySelectedTempArray, that).then(
                        data=>{
                            data.forEach(function(document){
                                var docId = document.ShortcutTo;
                                that.documentAttachInput.attach(
                                    e,
                                    that.documentAttachInput.data,
                                    document,
                                    function (e) {
                                        try {
                                            //FileTreeExplLogic.onSelectFile(FileTreeExplLogic, document);
                                            FileOperationLogic.initiallySelected.push(docId);
                                            if (FileOperationLogic.isLastFileOperation(docId)) {
                                                FileOperationLogic.documentAttachInput.complete();
                                            }
                                            FileTreeExplLogic.additionallySelected.splice(FileTreeExplLogic.additionallySelected.indexOf(docId), 1);
                                        } catch (e) { console.log("Unable to save, dialog must already be closed"); }
                                    },
                                    function (e) {
                                        var actions = [{ text: that.Resources['OK'] }];
                                        ErrorMessageCustom(document.Name + ": " + that.Resources["AttachFailed"], null, that.Resources['ServerIssue'], actions);
                                        if (FileOperationLogic.isLastFileOperation(docId)) {
                                            FileOperationLogic.documentAttachInput.complete();
                                        }
                                    }
                                );
                            });
                        },
                        err=>{

                        }
                    );

                    additionallyDeselectedTempArray.forEach(function (docId) {
                        //for (var i = FileTreeExplLogic.additionallyDeselected.length - 1; i > -1; i--) {
                        var document = FileTreeExplLogic.getCleanDocumentObject(docId);
                        
                        // if(true){
                        //     var grid = $("#NodeFileGrid").data("kendoGrid");
                        //     var attachedShortcuts = grid.dataItems();
                        //     document = attachedShortcuts.filter(function(d){return d.ShortcutTo === docId});
                        //     if(document.length>0){
                        //         document = document[0];
                        //     }
                        // }else{
                        //     // call API

                        // }

                        document = selectedShortcutObjectsFromApi.filter(function(d){return d.ShortcutTo === docId});
                        if(document.length>0){
                            document = document[0];
                        }


                        that.documentAttachInput.detach(
                            e,
                            that.documentAttachInput.data,
                            document,
                            function (e) {
                                try {
                                    //FileTreeExplLogic.onDisableFile(FileTreeExplLogic, document);
                                    FileOperationLogic.initiallySelected.splice(FileOperationLogic.initiallySelected.indexOf(docId), 1);
                                    if (FileOperationLogic.isLastFileOperation(docId)) {
                                        FileOperationLogic.documentAttachInput.complete();
                                    }
                                    FileTreeExplLogic.additionallyDeselected.splice(FileTreeExplLogic.additionallyDeselected.indexOf(docId), 1);
                                } catch (e) { console.log("Unable to save, dialog must already be closed"); }
                            },
                            function (e) {
                                var actions = [{ text: that.Resources['OK'] }];
                                ErrorMessageCustom(document.Name + ": " + that.Resources["DetachFailed"], null, that.Resources['ServerIssue'], actions);
                                if (FileOperationLogic.isLastFileOperation(docId)) {
                                    FileOperationLogic.documentAttachInput.complete();
                                }
                            }
                        );
                    });


                },
                err=>{

                }
            );

           
        },

        getAttachedShortcuts: function(objectId){
            return new Promise(function(resolve,reject){
                $.ajax({
                    type: "GET",
                    url: "/api/Document/GetObjectHiddenShortcuts/"+objectId,
                    headers: {
                        Authorization: "Bearer " + window.AuthenticationToken
                    },
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    error: function (e) {
                        return reject(e);
                    },
                    success: function (e) {
                        return resolve(e);
                    }
                });
            });
        },

        saveAndClose: function (e, that) {
            // destils the documentapi object and returns it to the provided 'attach' callback.
            $(e.currentTarget.closest('.k-window-content')).data('kendo-window').close();
            that.saveSelected(e, that)

            // cleans the tree
            FileTreeExplLogic.destroyTreeWidget();
            $("#UploadDialog").data("kendoDialog").close();
            
        },

        //updateUploadUrl: function () {
        //        var uploadButtons = $('[id="fileOperationsUploadHook"]');
        //        for (var i = 0; i < uploadButtons.length; i++) {
        //            var uploadObject = $(uploadButtons[i]).find("[data-role='upload']").data("kendoUpload");
        //            if (typeof uploadObject !== "undefined") {
        //                uploadObject.options.async.saveUrl = FileOperationLogic.getUploadUrl();
        //            }
        //        }
        //},

        //getUploadUrl: function () {
        //    return "/api/Document/Upload/" + FileTreeExplLogic.parentId
        //},

        documentOperationUpdate: function (that, updates) {

            updates = updates.filter(function (u) { 
                if("Compressed" in u){
                    return !u.Compressed;
                }else{
                    return !u.Document.Compressed;
                }
             });

            if (typeof updates.length !== "undefined") {

                var errorUpdates = updates.filter(function (e) {
                    return e.Messages.length > 0;
                })
                if (errorUpdates.length > 0) {
                    that.updateErrorMessages(that, errorUpdates);
                }
            }
            if (typeof FileTreeExplLogic !== "undefined") {
                for (var i = 0; i < updates.length; i++) {
                    var originalDocument = FileTreeExplLogic.documentArray[updates[i].Document.DocumentId];

                    that.updateChildrenIds(originalDocument, updates[i].Document);

                    FileTreeExplLogic.documentArray[updates[i].Document.DocumentId] = updates[i].Document;

                }
                if (typeof HiddenFileUploadLogic !== "undefined" && typeof HiddenFileUploadLogic.hiddenGridWidget !== "undefined") {
                    for (var i = 0; i < updates.length; i++) {
                        var data = HiddenFileUploadLogic.hiddenGridWidget.dataSource.get(updates[i].Document.DocumentId); //get the row data so it can be referred later
                        if (typeof data === "undefined") {
                            var addDoc = updates[i].Document;
                            addDoc.Extension = addDoc.Extensions[0];
                            HiddenFileUploadLogic.hiddenGridWidget.dataSource.add(addDoc);
                        } else {
                            data.set("Name", updates[i].Document.Name);
                        }
                    }
                    HiddenFileUploadLogic.hiddenGridWidget.refresh();
                }
                try {
                    FileTreeExplLogic.requiredTreeLoads = 1;
                    FileTreeExplLogic.deriveViewModels();
                } catch (e) { console.log('unable to update the tree. It might not be loaded.'); }
                if (typeof FileExplLogic === "undefined") {
                    try {
                        FileTreeExplLogic.refreshTreeContents(FileTreeExplLogic.parentId);
                    } catch (e) { console.log('unable to refresh tree'); }
                } else {
                    FileExplLogic.refreshTreeContents(FileTreeExplLogic.parentId);
                }
            }
        },

        updateChildrenIds: function (originalDoc, updatedDoc) {

            var newParent = FileTreeExplLogic.documentArray[updatedDoc.ParentId];

            if (typeof originalDoc !== "undefined") {
                var oldParent = FileTreeExplLogic.documentArray[originalDoc.ParentId];
                if (typeof oldParent !== "undefined" && typeof oldParent.DocumentChildrenIds !== "undefined" && oldParent.DocumentChildrenIds.includes(originalDoc.DocumentId) && oldParent.DocumentId != newParent.DocumentId) {
                    oldParent.DocumentChildrenIds.splice(oldParent.DocumentChildrenIds.indexOf(originalDoc.DocumentId), 1);
                }
            }

            if (typeof newParent !== "undefined" && typeof newParent.DocumentChildrenIds !== "undefined" && !newParent.DocumentChildrenIds.includes(updatedDoc.DocumentId)) {
                newParent.DocumentChildrenIds.push(updatedDoc.DocumentId);
            }
        },
        
        updateErrorMessages: function (that, errorUpdates) {
            
            var actions = [{ text: that.Resources['OK'] }];
            var err;
            var errs = [];
            var dataSource = new kendo.data.DataSource({});
            var arr = [];
            for (var i = 0; i < errorUpdates.length; i++) {
                var doc = errorUpdates[i].Document;
                var Name = doc.Name;
               
                if (doc.Extensions.length > 0) {
                   Name = doc.Name + doc.Extensions[0];
                }
               
                errs= (errorUpdates[i].Messages);
                    for (var j = 0; j < errs.length; j++) {
                        err = errs[j];
                        dataSource.data().push({
                            FileName: Name, Messages: err         
                        })
                }
            }
          
            var content = $("#deleteMessageIdGrid").kendoGrid({
                    dataSource: {
                        data: dataSource.data(),
                        group: { field: "FileName" }
                },
                    toolbar: kendo.template($("#deleteMessageTemplate").html()),
                    groupable: false,
                    selectable: "multiple row",
                    scrollable: false,
                    dataBound: function () {
                        this.collapseRow(this.tbody.find("tr.k-grouping-row"));
                    },
                columns: [
                   
                        {
                            field: "FileName",
                            title: that.Resources['FileName'],
                            filterable: true,
                            hidden: true
                            
                        },
                        {
                            field: "Messages",
                            title: "Warning",
                        }
                      
                    ],
            });

            //$('#deleteMessageIdGrid').prepend("<label>The file cannot be deleted because it is associated with other objects</label>");
            //$("#deleteMessageIdGrid").collapse(".k-item");
            ErrorMessageCustomGrid(content, null , that.Resources['Information'], actions);
            
        },
        //updateErrorMessages: function (that, errorUpdates) {
        //    var actions = [{ text: that.Resources['OK'] }];
        //    var message = '<div height="300px"><table>';
        //    for (var i = 0; i < errorUpdates.length; i++) {

        //        var doc = errorUpdates[i].Document;
        //        var Name = doc.Name;
        //        if (doc.Extensions.length > 0) {
        //            Name = doc.Name + doc.Extensions[0];
        //        }

        //        message = message + '<tr><td style="padding:5px">' + Name + ': </td><td><table>';

        //        var errs = errorUpdates[i].Messages;
        //        for (var j=0; j<errs.length; j++){
        //            var err = errs[j];
        //            message = message + '<tr><td style="padding:5px">' + err + '</td></tr>';
        //        }

        //        message = message + '</table></td></tr>';
        //    }
        //    message = message + '</table></div>'
          
        //    ErrorMessageCustom(message, null, that.Resources['Information'], actions);
        //}


        AddCachedFilesDict: function(docVerId, url){
            var that = this;
            if (docVerId in that.cachedFilesDict) {
                // do nothing
            } else {
                that.cachedFilesDict[docVerId] = url;
            }
        },

        getFromCachedFilesDict: function(docVerId){
            var that = this;
            return that.cachedFilesDict[docVerId];
        },

        deleteFromCachedFilesDict: function(docVerId){
            var that = this;
            if(docVerId in that.cachedFilesDict){
                delete that.cachedFilesDict[docVerId];
            }
            
        },

        updateCachedFilesDict: function(docVerId, url){
            var that = this;
            if(docVerId in that.cachedFilesDict){
                that.cachedFilesDict[docVerId] = url;
            }else{
                that.AddCachedFilesDict(docVerId, url);
            }
        },

	}

return FileOperations;

})();

////document.appendChild("<div id=\"statusSanj\" style=\"position:absolute; top:100px;\"></div>");
//$("body").append("<div id=\"statusSanj\" style=\"position:absolute; top:80%;left:80%;background-color:yellow;padding:50px;\">\
//<div class=\"progress\">\
//  <div class=\"progress-bar progress-bar-info\" role=\"progressbar\" aria-valuenow=\"20\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 20%\">\
//    <span class=\"sr-only\">20% Complete</span>\
//  </div>\
//</div>\
//</div>");
//var statusSanj = {
//    begin: function () {
//        $("#statusSanj").removeClass("hidden");
//    },
//    end: function () {
//        $("#statusSanj").addClass("hidden");
//    },
//    updateMessage: function (msg) {
//        document.getElementById("statusSanj").innerText = msg;
//        var reg = msg.match('([0-9][0-9]?)\/([0-9][0-9]?)\s*');
//        $("#statusSanj").children(":first").children(":first").attr("aria-valuenow", reg[1]);
//        $("#statusSanj").children(":first").children(":first").attr("aria-valuemax", reg[2]);
//        console.log(reg);
//    }

//}

//     //Reference the auto-generated proxy for the hub.  
//var chat = $.connection.globalHub;
//    // Create a function that the hub can call back to display messages.
//chat.client.sendMessageToUser = function (msg) {
//    statusSanj.begin();
//    statusSanj.updateMessage(msg);
//};

//chat.client.loadProgress = function (current, total) {
//    console.log(current + " out of " + total);
//    statusSanj.begin();
//    statusSanj.updateMessage(msg);
//};
