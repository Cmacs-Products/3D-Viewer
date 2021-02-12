"use strict";

var UploadDialog = (function () {

    function UploadDialog(objectId, moduleType) {
        this.objectId = objectId;
        this.module = moduleType;
        this.inputForExisting = null;
        this.inputForNew = null;
        this.dialog = null;
        this.attachedDocumentIds = [];
        

    };

    UploadDialog.prototype = {
        constructor: UploadDialog,

        openAttachDocumentOptionWindow: function (inputForExisting, inputForNew) {
            var that = this;
            that.inputForExisting = inputForExisting;
            that.inputForNew = inputForNew;
            return new Promise(function (resolve, reject) {
                var action = [
                    {
                        text: VIEW_RESOURCES_MASTER.Resource.Close
                    }
                ];

                if ($("#UploadDialog").length === 0) {
                    $("body").append(`<div id="UploadDialog" data-role="dialog" class="k-content k-window-content k-dialog-content" tabindex="0"></div>`);
                }

                var content = "";
                
                if(typeof FileOperationLogic.ProjectId !== 'undefined' && FileOperationLogic.ProjectId !== null){
                    content += `
                    <div style="padding:5px;">
                        <button id="attachExistingButton" class="btn btn-success" style="width:-webkit-fill-available;width: -moz-available;">
                            <span class="fal fa-file"></span>
                            `+VIEW_RESOURCES_MASTER.Resource.ChooseFromExisting+`
                        </button>
                    </div>`;
                }
            
                 content +=   `<div style="padding:5px;">
                        <div id="UploadDialogFileList">
                            
                        </div>
                        <button id="attachNewButton" class="btn btn-success" style="width:-webkit-fill-available;width: -moz-available;">
                            <span class="fal fa-upload"></span>
                            `+VIEW_RESOURCES_MASTER.Resource.UploadNew+`
                        </button>
                        <div id="DocumentTreeviewButtonWrapper" class="hidden" style="margin-top:4px; height: 50px; width:100%">
                            <div id="fileOperationsUploadHook">
                                <input name="attachmentsShortcut" id="attachmentsShortcut" class="FileSelectMenuUploadButton" type="file" />
                            </div>
                        </div>
                        
                    </div>
                `;
                that.dialog = ErrorMessageCustom(content,
                    'UploadDialog',
                    VIEW_RESOURCES_MASTER.Resource.HowDoYouWantToAttach ,
                    action);

                $("#attachNewButton").removeClass("hidden");
                $("#attachExistingButton").removeClass("hidden");
                $('#DocumentTreeviewButtonWrapper').addClass("hidden");

                var openExistingDialog = function () { that.openExistingDialog(); };

                $("#attachNewButton").on("click", function () { 
                    that.createUploadButtonV2(that.sampleOnUploadCompleted()) 
                });
                $("#attachExistingButton").on("click", openExistingDialog);
            });
        },

        close: function(){
            var that = this;
            that.dialog.data("kendoDialog").close();
        },

        openExistingDialog: function () {
            var that = this;
            //debugger;

            // FileOperationLogic.AttachDocument({
            //     attachedDocumentIds: attachedDocuments,
            //     attach: that.AttachDocumentToEmsNode,
            //     detach: that.DetachDocumentToEmsNode,
            //     objectId: selectedid,
            //     data: { selectedNodeId: selectedid },
            //     complete: that.onDocumentAttachComplete
            // });

            // open the document hierarchy window 
            FileOperationLogic.getAttachedShortcuts(that.objectId).then(
                data=>{
                    var docIds = data.map(s=>s.ShortcutTo);
                    that.attachedDocumentIds = docIds;
                    that.inputForExisting.attachedDocumentIds = docIds;
                    FileOperationLogic.AttachDocument(that.inputForExisting);
                },
                err=>{
                    console.error(err);
                }
            );
            
        },

        createUploadButtonV2: function (onUploadCompleted) {
            var that = this;
            if(that.inputForNew === null){console.error("please set inputForNew!")}
            $("#attachNewButton").addClass("hidden");
            $("#attachExistingButton").addClass("hidden");

            $('#DocumentTreeviewButtonWrapper').removeClass("hidden");
            
            $("#attachmentsShortcut").kendoUpload({
                async: {
                    saveUrl: "placeholder",
                    autoUpload: false
                },
                showFileList: false,
                localization: {
                    select: VIEW_RESOURCES_MASTER.Resource.UploadFiles
                },
                complete: onUploadCompleted,
                error: FileOperationLogic.onFailedFileOperation,
                select: function (e) {
                    e.preventDefault();
                    that.inputForNew.file = e.files;
                    FileOperationLogic.upload(that.inputForNew, true);
                },
            });
        },

        sampleNewInput: function () {
            var that = this;
            var input = {
                //file: e.files,
                objectId: that.objectId, // required
                parentId: "11111111-1111-1111-1111-111111111111", // should be guid but not all zero. this is not important but we have to pass sth to backend
                attach: function (actionUpdate, objectId, document, onSuccess, onError) {
                    // document.Compressed = actionUpdate.Document.Compressed;
                    // actionUpdate.Document = document;
                    // FileOperationLogic.documentOperationUpdate(FileOperationLogic, [actionUpdate]);
                    // that.onToggleChecked(e, that, true, actionUpdate.Document);
                    var data = {
                        selectedNodeId : that.objectId
                    };
                    FileOperationLogic.documentAttachInput.attach(FileOperationLogic.documentAttachInput.attach(null, data, document, function(){}, function(){}));
                }//,
                //complete: function (response, data, documents) {

                    //var actionUpdates = response;
                    //if(!Array.isArray(actionUpdates)){
                    //    actionUpdates = [{
                    //        Document: actionUpdates,
                    //        Messages: []
                    //    }];
                    //}
                    //FileOperationLogic.documentOperationUpdate(FileOperationLogic, actionUpdates);
                    //for (var i = 0; i < documents.length; i++) {
                    //    that.onToggleChecked(e, that, true, documents[i]);
                    //}
                //}
            };
            return input;
        },

        sampleOnUploadCompleted: function () {
            //alert("Upload Completed");
        },

        // end of methods
    }



    return UploadDialog;
})();