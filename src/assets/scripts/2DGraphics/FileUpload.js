"use strict";
var FileUpload = (function () {

    function FileUpload(IsHiddenFile) {
        this.inUploadProcessDocuments = [];
        this.finishedUploadProcessDocuments = [];
        this.failedUploadProcessDocuments = [];
        this.useUploadDialog = false;
        this.IsHiddenFile = (IsHiddenFile === null || typeof IsHiddenFile === 'undefined')
            ? false
            : IsHiddenFile;
    }
    FileUpload.prototype = {
        constructor: FileUpload,

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
        //    error: function (response, data) { <callback> },
        //    convert: bool if the upload will trigger direct conversion or not (default)
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

        startUpload: function (input) {
            var that = this;
            var multiple;
            var files = [];

            if (that.IsHiddenFile && $("#UploadDialog").is(':visible') === true) {
                that.useUploadDialog = true;
            }

            // show msg to user when decided tp leave the page
            that.enableOnPageClose();

            this.completedFiles = {};

            // some valiation

            if (typeof input.file === "undefined" || input.file == null || input.file.size == 0) {
                throw "Invalid file object"
            } else if (input.file instanceof FileList) {
                multiple = true;
                files = input.file;
            } else if (input.file instanceof Array) {
                multiple = true;
                files = input.file;
            } else { // backward compatible
                multiple = false;
            }

            if (typeof input.parentId === "undefined" || input.parentId === null || input.parentId.length !== 36) {
                throw "Invalid parentId Guid"
            }




            ////first ajax call:
            if (multiple) {
                for (var i = 0; i < files.length; i++) { // iterator should work with fileList and array object
                    var singleInput = jQuery.extend(true, {}, input);
                    singleInput.file = files[i];
                    //that.createDocumentVersionPlaceHolder(singleInput);
                    that.upload(singleInput);
                }
            } else {
                //that.createDocumentVersionPlaceHolder(input);
                that.upload(input);
            }
        },

        enableOnPageClose: function () {
            var that = this;
            //if (typeof FileExplLogic === 'undefined') return;

        },

        disableOnPageClose: function () {
            //if (typeof FileExplLogic === 'undefined') return;

        },


        createDocumentVersionPlaceHolder: function (input) {
            var that = this;
            var extension = ".";
            var name = input.file.name;
            var file = input.file;

            if ("rawFile" in input.file) {
                file = input.file.rawFile;
            }

            var now = ((new Date())).getTime();

            var periodPresents = name.indexOf(".") > -1
            if (periodPresents) {
                extension = name.split(".").pop();
                name = name.slice(0, -(1 + extension.length))
            }

            if (now - file.lastModified < 5000 && input.file.name === "image.jpg" && /iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                name = name + "_" + now;
            }

            var docInfo = {
                ParentId: input.parentId,
                Name: name,
                Extensions: [extension]
            }


            var url = "/api/Document/CreateDocumentVersionPlaceHolder/" + input.data.nodeSourceId;
            if (!(input.convert)) {
                if (input.data.isDocumentTemplate) { // is document template upload
                    url = url + "DocumentTemplateToS3";
                } else {
                    url = url + "ToS3";
                }

            }

            $.ajax({
                type: "POST",
                url: url,
                headers: {
                    Authorization: "Bearer " + window.parent.AuthenticationToken
                },
                data: JSON.stringify(docInfo),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                error: function (e) {
                    that.deleteDocumentVersionPlaceHolder(that, input);
                    input.error(e, input.data);
                    input.complete(e, input.data, Array.from(Object.values(that.completedFiles), x => x.Document));

                },
                success: function (e) {
                    var Document = e;
                    Document.enable = false;
                    that.uploadToDocumentVersionPlaceHolder(Document, input, operationId, that);
                    input.complete(e, input.data, Array.from(Object.values(that.completedFiles), x => x.Document));

                }
            });
        },

        uploadToDocumentVersionPlaceHolder: function (Document, input, operationId, that) {
            //var that = FileOperationLogic;

            //var processOverlayId = Loading_OL.startGenericLoadingScreenWithDelay("uploadToDocumentVersionPlaceHolder");
            //var currentOperationId = FileOperationLogic.addFileOperationToRecord();

            var uploadComplete = function (e) {
                //that.completedFiles[document.DocumentId] = document;

                input.complete(Array.from(Object.values(that.completedFiles)), input.data, Array.from(Object.values(that.completedFiles), x => x.Document));
            }

            var error = function (e) {
                try {
                    Loading_OL.stopGenericLoadingScreen(processOverlayId);
                } catch (e) {
                    console.error("An error occurred uring the upload completion callback");
                }
                try {
                    delete that.completedFiles[Document.DocumentId];
                    that.deleteDocumentVersionPlaceHolder(that, input, Document, thisUploadOperationId);
                    input.error(e, input.data);
                    uploadComplete(e);
                } catch (e) {
                    console.error("An error occurred uring the upload error callback");
                }
            }

            var success = function (e) {

                try {
                    //Loading_OL.stopGenericLoadingScreen(processOverlayId);
                } catch (e) {
                    console.error("An error occurred uring the upload completion callback");
                }
                try {
                    //var update = e;//.find(function (d) { return !d.Document.Compressed });
                    //Document = update.Document;
                    //that.completedFiles[Document.DocumentId] = update;
                    var updates = []
                    if (Array.isArray(e)) {
                        updates = e;
                        e.forEach(function (update) {
                            update.Document.enable = true;
                            that.completedFiles[update.Document.DocumentId] = update;
                        });
                    } else {
                        updates.push(e);
                        updates[0].Document.enable = true;
                        that.completedFiles[updates[0].Document.DocumentId] = updates[0];
                    }
                    // show msg to user when decided tp leave the page

                    input.attach(e,
                        input.data,
                        updates[0].Document,
                        function () {
                            input.success(e, input.data, updates[0].Document);
                            if (that.IsHiddenFile) uploadComplete(e);
                        },
                        function () {
                            that.deleteDocumentVersionPlaceHolder(that, input, updates[0].Document, operationId);
                            input.error(e, input.data);
                            uploadComplete(e);
                        });


                } catch (e) {
                    console.error("An error occurred uring the upload success callback");
                }
            }

            var fileData;

            if (typeof input.file.rawFile !== "undefined") {
                fileData = input.file.rawFile;
            } else {
                fileData = input.file;
            }

            if (input.convert) {
                var myFormData = new FormData();

                myFormData.append('attachments', fileData, input.file.name);
                $.ajax({
                    type: "POST",
                    url: Document.UploadUri,
                    headers: {
                        Authorization: "Bearer " + window.parent.AuthenticationToken
                    },
                    data: myFormData,
                    cache: false,
                    contentType: false,
                    processData: false,
                    error: error,
                    success: success
                });
            } else if (that.IsHiddenFile) {
                if (Document.Hidden) {
                    HiddenFileUploadLogic.addDocument(Document);
                    //HiddenFileUploadLogic.refresh();
                }
                $.ajax({
                    type: "PUT",
                    url: Document.UploadUri,
                    data: fileData,
                    processData: false,
                    contentType: 'binary/octet-stream',
                    error: error,
                    success: function (e) {
                        //success(e);
                        that.DocumentVersionUploadComplete(that, Document, success, error);
                    },
                    error: function (e) {
                        console.error(e);
                    }
                });
            } else {

                $.ajax({
                    type: "PUT",
                    url: Document.UploadUri,
                    data: fileData,
                    processData: false,
                    contentType: 'binary/octet-stream',
                    error: error,
                    xhr: function (e) {  // custom xhr

                        var myXhr = $.ajaxSettings.xhr();
                        if (myXhr.upload) { // check if upload property exists
                            myXhr.upload.addEventListener('progress', progressHandlingFunction, false); // for handling the progress of the upload
                        }
                        return myXhr;
                    },
                    success: function (e) {
                        that.DocumentVersionUploadComplete(that, Document, success, error);
                    },
                    error: function (e) {
                        console.error(e);
                    }
                });

            }
        },

        DocumentVersionUploadComplete: function (that, Document, success, error) {

            $.ajax({
                type: "POST",
                url: "/api/Document/DocumentVersionUploadComplete/" + Document.DocumentVersionId,
                headers: {
                    Authorization: "Bearer " + window.parent.AuthenticationToken
                },
                success: success,
                error: error
            });
        },

        deleteDocumentVersionPlaceHolder: function (that, input, Document, operationId) {
            //var that = FileOperationLogic;
            var Document = Document;
            $.ajax({
                type: "Get",
                url: "/api/Document/DeleteDocumentVersion/" + Document.DocumentVersionId,
                headers: {
                    Authorization: "Bearer " + window.parent.AuthenticationToken
                },
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                error: function (e) {
                    input.error(e, input.data);
                },
                complete: function (e) {
                    //input.complete(e,input.data)
                    input.complete(e, input.data, Array.from(Object.values(that.completedFiles), x => x.Document));
                }
            })
        },

        validateUploadProcess: function (that, fileUploadProcess) {
            if (typeof fileUploadProcess !== "undefined") {
                return fileUploadProcess;
            } else {
                return function (folder, file) {
                    that.uploadFile(folder, file, that);
                }
            }
        },

        validateFolderCreateProcess: function (folderCreateProcess, fileUploadProcess) {
            if (typeof folderCreateProcess !== "undefined") {
                return folderCreateProcess;
            } else {
                return function (parent, name, successcallback, data) {

                }
            }
        },

        
        addIconProgressbar: function (docId, name, extension) {

        },



      beforeUpload: function (input) {
        var that = this;
        //FileOperationLogic.inUploadProcessDocuments.push(input.file);
        return new Promise(function (resolve, reject) {
          that.createPlaceHolder(input).then(
            placeholder => {
              // add to view


              return resolve(placeholder);
            },
            error => {
              //console.error(error);
              return reject(error);
            }
          );
        });
      },

      addToView: function (placeholder) {
        

      },

      disableIcon: function (document) {
        // var data = FileExplLogic.getSelectedElementData($("#" + document.DocumentId + "-progress").parent());
        // data.enable = false;
      },

      enableIcon: function (document) {
        // var data = FileExplLogic.getSelectedElementData($("#" + document.DocumentId + "-progress").parent());
        // data.enable = true;
      },

      hideProgressBar: function (document) {

      },
        
        uploadFailed(error, input, document) {
        var that = this;


        that.deleteDocumentVersionPlaceHolder(that, input, document, null);
      },

      upload: function (input) {
        var that = this;
        that.beforeUpload(input).then(
          data => {
            var placeholder = data;
            that.uploadToS3(data, input).then(
              data => {
                that.afterUpload(placeholder, input, data);
              },
              error => {
                that.uploadFailed(error, input);
              }
            )
          },
          error => {
          }
        );
      },

      removeFromArray: function (element, array) {
        var index = array.indexOf(element);
        if (index > -1) {
          array.splice(index, 1);
        }

        var index = array.indexOf(element.rawFile);
        if (index > -1) {
          array.splice(index, 1);
        }
      },

      afterUpload(document, input, dt) {
        var that = this;
        return that.informServerAboutSuccessfulUpload(document).then(
          data => {
            input.success(data, input.data, document);
          });
      },

      informServerAboutSuccessfulUpload(document) {
        var that = this;
        return new Promise(function (resolve, reject) {
          $.ajax({
            type: "POST",
            url: "/api/Document/DocumentVersionUploadComplete/" + document.DocumentVersionId,
            headers: {
              Authorization: "Bearer " + window.parent.AuthenticationToken
            },
            success: function (data) {
              return resolve(data);
            },
            error: function (err) {
              return reject(err);
            }
          });
        });

      },

      generateFileNameToUpload: function (file, name) {
        var extension = ".";
        var now = ((new Date())).getTime();
        var periodPresents = name.indexOf(".") > -1
        if (periodPresents) {
          extension = name.split(".").pop();
          name = name.slice(0, -(1 + extension.length))
        }
        if (now - file.lastModified < 5000 && file.name === "image.jpg" && /iPhone|iPad|iPod/i.test(navigator.userAgent)) {
          name = name + "_" + now;
        }
        return name;
      },

      getExtension: function (name) {
        var extension = ".";
        var periodPresents = name.indexOf(".") > -1
        if (periodPresents) {
          extension = name.split(".").pop();
        }
        return extension;
      },


      createPlaceHolder: function (input) {
        var that = this;
        return new Promise(function (resolve, reject) {
          try {
            var extension = ".";
            var name = input.file.name;
            var file = input.file;

            if ("rawFile" in input.file) {
              file = input.file.rawFile;
            }

            var docInfo = {
              ParentId: input.parentId,
              Name: that.generateFileNameToUpload(file, name),
              Extensions: [that.getExtension(name)],
              //ProjectId: (typeof ProjectId !== 'undefined') ? ProjectId : projectId
            }

            var projId =ProjectId;
            if (typeof projId !== 'undefined' && that.IsHiddenFile && typeof input.objectId !== 'undefined') {
              docInfo.ProjectId = projId;
              docInfo.ObjId = input.objectId;
            }
            // else if(typeof projId !== 'undefined' && that.IsHiddenFile && typeof input.objectId !== 'undefined'){
            //     docInfo.ProjectId = projId;
            //     docInfo.ObjId = input.objectId;
            // }

            var url = "/api/Document/CreateDocumentVersionPlaceHolder/";
            if (!(input.convert)) {
              if (input.data && input.data.isDocumentTemplate) { // is document template upload
                url = url + "DocumentTemplateToS3/" + input.data.nodeSourceId;
              } else {
                url = url + "ToS3";
              }
            }

            if (that.useUploadDialog) {
              url = "/api/Document/CreateHiddenDocumentVersionPlaceHolder/ToS3";
            }

            $.ajax({
              type: "POST",
              url: url,
              headers: {
                Authorization: "Bearer " + window.parent.AuthenticationToken
              },
              data: JSON.stringify(docInfo),
              contentType: "application/json; charset=utf-8",
              dataType: "json",
              error: function (e) {
                return reject(e);
              },
              success: function (e) {
                return resolve(e);
              }
            });
          } catch (ex) {
            return reject(ex);
          }

        });
      },

      uploadToS3: function (placeHolder, input) {
        var that = this;
        return new Promise(function (resolve, reject) {
          var fileData;
          try {
            if (typeof input.file.rawFile !== "undefined") {
              fileData = input.file.rawFile;
            } else {
              fileData = input.file;
            }
            if (input.convert) {
              var myFormData = new FormData();
              myFormData.append('attachments', fileData, input.file.name);
              $.ajax({
                type: "POST",
                url: placeHolder.UploadUri,
                headers: {
                  Authorization: "Bearer " + window.parent.AuthenticationToken
                },
                data: myFormData,
                cache: false,
                contentType: false,
                processData: false,
                error: function (e) {
                  return reject(e);
                },
                success: function (e) {
                  return resolve(e);
                }
              });
            } else if (that.IsHiddenFile) { // in case of hidden file upload
              //that.addToView(document);


              $.ajax({
                type: "PUT",
                url: placeHolder.UploadUri,
                data: fileData,
                processData: false,
                contentType: 'binary/octet-stream',
                xhr: function (e) {  // custom xhr
                  var myXhr = $.ajaxSettings.xhr();
                  return myXhr;
                },
                error: function (e) {
                  return reject(e);
                },
                success: function (e) {
                  return resolve(e);
                }
              });
            } else { // in case of regular upload



              $.ajax({
                type: "PUT",
                url: placeHolder.UploadUri,
                data: fileData,
                processData: false,
                contentType: 'binary/octet-stream',
                xhr: function (e) {  // custom xhr

                  var myXhr = $.ajaxSettings.xhr();
                  return myXhr;
                },
                error: function (e) {
                  return reject(e);
                },
                success: function (e) {
                  return resolve(e);
                }
              });

            }
          } catch (ex) {
            return reject(ex);
          }


          // has to get converted


        });
      },


    }

    return FileUpload;
})();
