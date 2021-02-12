var CRUDController = (function CRUDControllerClosure() {

    function CRUDController() {
        this.deleteDialogOpen = false;
    }

    CRUDController.prototype = {

        constructor: CRUDController,

        isDeleteDialogOpen: function CRUDController_isDeleteDialogOpen() {
            return this.deleteDialogOpen;
        },

        prepareDelete: function CRUDController_prepareDelete(annotation, element) {
            var that = this;
            return new Promise(function(resolve,reject){
                
                
                //var annotationIds = [element.type !== "set" ? element.getDocumentAnnotationId() : element[0].getDocumentAnnotationId()];
    
                that.deleteAnnotations(element).then(
                    data=>{
                        resolve(data);
                    },
                    error=>{
                        reject(error);
                    }
                );
    
                /*
                if ((annotation && annotation.type === "i-text" && annotation.isEditing)) {
                    return;
                }
                */
                // SvgGlobalControllerLogic.allSelectedObjects.forEach(function (selectedObject) {
                //     if (selectedObject !== undefined) {
                //         var id = selectedObject.element.type !== "set" ? selectedObject.element.getDocumentAnnotationId() : selectedObject.element[0].getDocumentAnnotationId()
                //         //AnnotationApplication.CRUDController.prepareDelete(null, selectedObject.element);
                //         if (id) {
                //             if (!annotationIds.includes(id)) {
                //                 annotationIds.push(id);
                //             }
                //         }
                //     }
                // });
    
                // var showConfirmation = function(){
                //     AnnotationApplication.CRUDController.confirmDelete(annotationIds, function () {
    
                //         AnnotationApplication.Utils.refreshEmsTagLists();
                //         element.remove();
                //         SvgGlobalControllerLogic.clearAllJoints();
        
                //         SvgGlobalControllerLogic.allSelectedObjects.forEach(function (selectedObject) {
                //             AnnotationApplication.CRUDController.deleteAnnotation(null, selectedObject.element);
                //         });
                //         //AnnotationApplication.RightSidebarController.closeSidebar(that.canvas);
                //     });
                // }
    
                
                // console.log(associatedTodos);
            })
            
            
        },

        beforeDelete: function(){
            return new Promise(function(resolve,reject){
                return resolve([]);
                var that = this;
                //var annotationIds = [element.type !== "set" ? element.getDocumentAnnotationId() : element[0].getDocumentAnnotationId()];
                var annotationIds = [];
                // collecting Ids
                SvgGlobalControllerLogic.allSelectedObjects.forEach(function (selectedObject) {
                    if (selectedObject !== undefined) {
                        var id = selectedObject.type !== "set" ? selectedObject.getDocumentAnnotationId() : selectedObject[0].getDocumentAnnotationId()
                        //AnnotationApplication.CRUDController.prepareDelete(null, selectedObject.element);
                        if (id) {
                            if (!annotationIds.includes(id)) {
                                annotationIds.push(id);
                            }
                        }
                    }
                });
                resolve(annotationIds);
            });
            
        },

        //getAssociatedTodos:function(annotationIds){
        //    return new Promise(function(resolve,reject){
        //        var associatedTodos = [];
        //        var counter = annotationIds.length;
        //        annotationIds.forEach(function(id){
        //            $.ajax({
        //                type: 'GET',
        //                url: '/api/Annotation/GetTodoList?id=' + id,
        //                contentType: "application/json; charset=utf-8",
        //                dataType: "json",
        //                headers: {
        //                    Authorization: "Bearer " + window.AuthenticationToken
        //                },
        //                success: function (response) {
        //                    counter--;
        //                    console.log(response);
        //                    associatedTodos = associatedTodos.concat(response);
        //                    if(counter === 0) resolve(associatedTodos);
        //                },
        //                error: function(response){
        //                    counter--;
        //                    console.log(response);
        //                    if(counter === 0) resolve(associatedTodos);
        //                }
        //            });
        //        });
        //    });
        //},

        showConfirmation: function(todos, annotationIds){
            return new Promise(function(resolve,reject){
                AnnotationApplication.CRUDController.confirmDelete(annotationIds, todos).then(
                    data=>{
                        if(data){
                            resolve(annotationIds);
                        }else{
                            resolve([]);
                        }
                    },
                    err=>{

                    }
                );
            });
            
        },


        deleteAnnotations: function(annotationIds){
            var that = this;
            if(SvgGlobalControllerLogic.isAnonymous()) return;
            return new Promise(function(resolve,reject){
                
                that.beforeDelete().then(
                    dt=>{
                        AnnotationApplication.Utils.refreshEmsTagLists();
                        var canDelete = true;
                        if(typeof element !== 'undefined'){
                            canDelete = SvgGlobalControllerLogic.isAbleToEdit(element);
                            element.remove();
                        }
                        SvgGlobalControllerLogic.clearAllJoints();

                        annotationIds.forEach(function(id){
                            if(canDelete){
                                var svgObject = SvgGlobalControllerLogic.annotations2[id];
                                if(typeof svgObject !== 'undefined'){
                                    AnnotationApplication.CRUDController.deleteAnnotation([id]);
                                    if(svgObject.type === 'defect' || svgObject.type === 'emsgroup'){
                                        var msg = {
                                            exchangeId: AnnotationApplication.documentVersionId,
                                            event: {
                                                eventType: "refreshTagGrids",
                                                value: {
                                                    object: "refreshTagGrids",                                     
                                                }
                                            }
                                      }
                                        dataExchange.sendParentMessage('refreshTagGrids',msg);
                                    }
                                    svgObject.remove();
                                }
                                
                            }
                        });
                        // that.getAssociatedTodos(annotationIds).then(
                        //     todos=>{
                        //         console.log("ToDos", todos);
                        //         that.showConfirmation(todos, annotationIds).then(
                        //             data=>{
                        //                 if(data.length === 0){
                        //                     resolve(data);
                        //                 }else{
                        //                     AnnotationApplication.Utils.refreshEmsTagLists();
                        //                     var canDelete = true;
                        //                     if(typeof element !== 'undefined'){
                        //                         canDelete = SvgGlobalControllerLogic.isAbleToEdit(element);
                        //                         element.remove();
                        //                     }
                        //                     SvgGlobalControllerLogic.clearAllJoints();
    
                        //                     annotationIds.forEach(function(id){
                        //                         if(canDelete){
                        //                             var svgObject = SvgGlobalControllerLogic.annotations2[id];
                        //                             if(typeof svgObject !== 'undefined'){
                        //                                 AnnotationApplication.CRUDController.deleteAnnotation([id]);
                        //                                 svgObject.remove();
                        //                             }
                                                    
                        //                         }
                        //                     });
                            
                        //                     // SvgGlobalControllerLogic.allSelectedObjects.forEach(function (selectedObject) {
                        //                     //     var element = typeof selectedObject.element === 'undefined' ? selectedObject : selectedObject.element;
                        //                     //     if(SvgGlobalControllerLogic.isAbleToEdit(element)){
                        //                     //         AnnotationApplication.CRUDController.deleteAnnotation([element.getDocumentAnnotationId()]);
                        //                     //     }
                        //                     // });
                        //                 }
                                        
                        //                 resolve(data);
                        //             },
                        //             error=>{
                        //                 console.error(error);
                        //                 reject(error);
                        //             }
                        //         );
                        //         //deleteAnnotations(annotationIds);
                        //     },
                        //     error=>{
                        //         console.error(error);
                        //         reject(error);
                        //     }
                        // );
                    },
                    error=>{
                        console.error(error);
                        reject(error);
                    }
                );
            });
        },

        confirmDelete: function CRUDController_confirmDelete(annotationIds, todos, callback) {
            var that = this;
            return new Promise(function(resolve, reject){
                //var kendoWindow = $("#kendoWindow");
                var template = "<div class='row k-popup-bottom'></div>";
                var existingWindow = $("#kendoConfirm");

                this.deleteDialogOpen = true;

                if (existingWindow.length > 0) {

                    var loadedModule = AnnotationApplication.viewerType;

                    if (loadedModule === "EMS") {
                        existingWindow.parent().parent().remove();
                    }
                    //else if (loadedModule === "DOCUMENT") {
                    //    existingWindow.parent().parent().parent().remove();
                    //}

                }

                //kendoWindow.kendoWindow({
                //    maxWidth: "400px",
                //    maxHeight: "250px",
                //    visible: false,
                //    draggable: false,
                //    resizable: false,
                //    iframe:true,
                //    modal: true,
                //    //actions: ["Close"],
                //}).data("kendoWindow").center().open().content(template);
                //$("#kendoConfirm").click(function () {
                //    AnnotationApplication.RightSidebarController.closeAndEmptySidebar();
                //    that.deleteAnnotation(annotationIds, callback);
                //    kendoWindow.data("kendoWindow").close();
                //    this.deleteDialogOpen = false;
                //});
                //$("#kendoDecline").click(function () {
                //    kendoWindow.data("kendoWindow").close();
                //    this.deleteDialogOpen = false;
                //});
                //$(".k-widget.k-window").addClass("deletekmodel");

                var txt = VIEW_RESOURCES.Resource.AreYouSureAnnotation + (todos.length>0 ? '<div style="font-weight:bold; margin-top:2rem;">'+ VIEW_RESOURCES.Resource.AnnotationHasAssociationNotice +'</div>' : "");
                ErrorMessageCustom(txt, null, GetResourceString("Confirm"), [{
                    text: VIEW_RESOURCES.Resource.ok, action: function (callback) {
                        AnnotationApplication.RightSidebarController.closeAndEmptySidebar();
                        //that.deleteAnnotation(annotationIds, callback);
                        this.deleteDialogOpen = false;
                        return resolve(true);
                    }
                }, {
                    text: VIEW_RESOURCES.Resource.cancel, action: function () {
                        this.deleteDialogOpen = false;
                        return resolve(false);
                    }
                }]);
            });
            
        },
        createAnnotation: function CRUDController_saveAnnotation(annotation, callback, emsNode) {
            //var mScale = AnnotationApplication.documentScale;
            if(SvgGlobalControllerLogic.isAnonymous()) return;
            // If an EMSNode is preset, Store the ID to the annotation
            if (typeof (emsNode) !== "undefined") {
                isEms = true;
                emsNodeId = emsNode.id;
                annotation.EMSNodeId = emsNode.id;
            }
            else if (annotation !== null && annotation.hasOwnProperty("EMSNodeId")) {
                isEms = true;
                emsNodeId = annotation.EMSNodeId;
            }

            // Store page dimension in annotation
            // Used by copy/paste to determine if an annotation is still on the page while pasting
            //AnnotationApplication.CanvasController.annotationSetPageDimensions(annotation, canvas);

            $.ajax({
                type: 'POST',
                url: '/Annotation/Create',
                data: {
                    documentSvgAnnotationApiModel: JSON.stringify(annotation)
                },
                success: function (response) {
                    console.log("CREATE: ", response);
                    if ((loadedModule === "EMS" || window.parent.loadedModule === "EMS") && window.parent.CPaneService.panelType.endsWith("TAGS")) {
                        window.parent.CPaneService.loadPanel();
                    }
                    if (callback) {
                        callback(response);
                    }
                },
                error: function(error){
                    console.error(error);
                }
            });
        },

        updateAnnotation: function CRUDController_updateAnnotation(annotation, callback) {
            //console.log("updateAnnotation");
            if(SvgGlobalControllerLogic.isAnonymous()) return;
            var that = this;
            if (annotation.DocumentAnnotationId === null || annotation.DocumentAnnotationId === undefined) {
                return;
            }

            if (annotation.AnnotationType === "joint") return;

            var defaultScale = {
                "FromValue": "1",
                "FromUnit": "in",
                "ToValue": "1",
                "ToUnit": "ft",
                "PixelValue": "0",
                "DisplayValue": null,
            };

            var documentScale = typeof (AnnotationApplication.documentScale) !== "undefined" && AnnotationApplication.documentScale !== null ? AnnotationApplication.documentScale : defaultScale;

            //AnnotationApplication.CanvasController.annotationSetPageDimensions(annotation, canvas);

            $.ajax({
                type: 'POST',
                url: '/Annotation/Update',
                data: {
                    documentSvgAnnotationApiModel: JSON.stringify(annotation)
                },
                success: function (response) {

                    if (typeof (callback) !== "undefined" && callback !== null) {
                        callback(response);
                    }

                    //console.log("UPDATE: ", response);
                    //this.canvas.setActiveObject(this.annotation);
                }
            });

        },

        getAnnotations: function CRUDController_getAnnotations(canvasId, callback, includeHistory) {

            //var includeHistory = typeof includeHistory == true ? true : false;
            var request = $.ajax({
                type: 'GET',
                url: (sharedId? '/SharedAnnotations/' + sharedId + '/' : '/Annotation/') + 'GetAnnotations',
                data: {
                    DocumentVersionId: AnnotationApplication.documentVersionId,
                    CanvasId: canvasId,
                    Context: AnnotationApplication.viewerType,//"DOCUMENT"
                    includeHistory: includeHistory
                },
                success: function (response) {
                    callback(response);
                }
            });

            if (typeof (request) === "undefined") {
            }

            AnnotationApplication.AnnotationAjaxService.addPendingLoadRequest(request);

            return request;
        },

        deleteAnnotation: function CRUDController_deleteAnnotation(annotationIds, callback) {
            var documentAnnotationIds = [];
            var annotationIdType = typeof (annotationIds);
            if(SvgGlobalControllerLogic.isAnonymous()) return;
            // Delete method can be passed a single ID or an array of IDs
            // This conditional statement makes sure it is handled correctly
            if (annotationIdType === "number") {
                documentAnnotationIds.push(annotationIds);
            }
            else if (annotationIdType === "object" && annotationIds !== null && annotationIds.hasOwnProperty("length")) {
                documentAnnotationIds = annotationIds;
            }
            else {
                console.log("Delete annotation failed. Did you pass a single annotation Id or an array of annotation Ids?", annotationIds);
                return;
            }

            var request = $.ajax({
                type: 'POST',
                url: '/Annotation/DeleteAnnotation',
                dataType: 'text',
                data: {
                    DocumentAnnotationIds: documentAnnotationIds,
                },
                success: function (response) {
                    console.log("Delete Success: ", response);
                    if ((loadedModule === "EMS" || parent.window.loadedModule === "EMS") && (window.parent.CPaneService.panelType.endsWith("TAGS"))) {
                        window.parent.CPaneService.loadPanel();
                    }

                    documentAnnotationIds.forEach(id => {
                        var elements = SvgGlobalControllerLogic.getElementsByDocumentAnnotationId(id);
                        elements.forEach(function (element) {
                            if (['texttagrect', 'texttagimage'].includes(element.getAnnotationType())) {
                                var elms = SvgGlobalControllerLogic.getElementsByDocumentAnnotationId(element.getDocumentAnnotationId());
                                elms.forEach(function (rects) {
                                    rects.remove();
                                });
                            } else {
                                element.remove();
                            }

                        });
                    });


                    //if($('#annotationListActive').length>0)$('#annotationListActive').data('kendoGrid').refresh();
                    //if($('#annotationListHistory').length>0)$('#annotationListHistory').data('kendoGrid').refresh();
                    //AnnotationApplication.RightSidebarController.showAnnotationList();

                    /*
                    var newAllDbAnnotations = []
                    SvgGlobalControllerLogic.allDbAnnotations.forEach(function (page) {
                        var annsInPage = []
                        //pageNumber = page.page;
                        page.annotations.forEach(function (annotation) {
                            //var documentAnnotationId = element.type === "set" ? element[0].getDocumentAnnotationId() : element.getDocumentAnnotationId();
                            if ( !annotationIds.includes(annotation.DocumentAnnotationId)) {
                                annsInPage.push(annotation);
                            }
                        });
                        newAllDbAnnotations.push({
                            annotations: annsInPage,
                            page: page.page,
                            documentVersionId: AnnotationApplication.documentVersionId
                        });
                    });
                    SvgGlobalControllerLogic.allDbAnnotations = newAllDbAnnotations;
                    */
                    LocalAnnotationsControllerLogic.deleteManyAnnotationById(
                        AnnotationApplication.documentVersionId,
                        null,
                        annotationIds,
                        null,
                        null);

                    SvgGlobalControllerLogic.allSelectedObjects = [];
                    if (callback) {
                        callback();
                    }

                }
            });

            AnnotationApplication.AnnotationAjaxService.addPendingDeleteRequest(request);
        },

        exportAsExcel: function CRUDController_exportAsExcel(canvasId, callback, includeHistory) {

            //var includeHistory = typeof includeHistory == true ? true : false;

            var request = $.ajax({
                type: 'GET',
                url: '/Annotation/ExportAsExcel',
                data: {
                    DocumentVersionId: AnnotationApplication.documentVersionId,
                    CanvasId: canvasId,
                    Context: AnnotationApplication.viewerType,//"DOCUMENT"
                    includeHistory: includeHistory
                },
                success: function (response) {
                    callback(response);
                }
            });

            if (typeof (request) === "undefined") {
            }

            AnnotationApplication.AnnotationAjaxService.addPendingLoadRequest(request);

            return request;
        },


        //===============================================================
        //============================= PDF Page ========================
        //===============================================================
        updatePagesRotation: function CRUDController_updatePagesRotation(rotationList) {
            if(SvgGlobalControllerLogic.isAnonymous()) return;
            return new Promise(function (resolve, reject) {
                console.log("update Page Rotation");
                var that = this;

                $.ajax({
                    type: 'POST',
                    url: '/api/Annotation/UpdatePagesRotation',
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: JSON.stringify(rotationList),
                    headers: {
                        Authorization: "Bearer " + window.AuthenticationToken
                    },
                    success: function (response) {
                        resolve(response);
                    },
                    error: function (response) {
                        reject(response);
                    }
                });
            });
        },

        GetDocumentPagesRotation: function CRUDController_GetDocumentPagesRotation(documentVersionId, pageNumber, readFromDb) {
            return new Promise(function (resolve, reject) { 
                if (!readFromDb) { // preloaded pagesrotation
                    var thisPageRotation = documentPagesRotation.filter(d=>d.PageNumber === pageNumber);
                    if(thisPageRotation.length > 0){
                        resolve(thisPageRotation[0]);
                    }else{
                        resolve({
                            DocumentVersionId : null,
                            PageExternalId : null,
                            Scale : "",
                            Rotate : 0,
                            PageNumber : 0
                        });
                    }
                    
                } else {
                    var that = this;
                    var query = "DocumentVersionId=" + documentVersionId;
                    if (pageNumber) {
                        query += ("&pageNumber=" + pageNumber);
                    }

                    $.ajax({
                        type: 'GET',
                        url: '/api/Annotation/GetDocumentPagesRotation/'+documentVersionId+'/',
                        headers: {
                            Authorization: "Bearer " + window.AuthenticationToken
                        },
                        success: function (response) {
                            resolve(response);
                        },
                        error: function (response) {
                            reject(response);
                        }
                    });
                }
            });
        },



        // GetDocumentPagesRotation: function CRUDController_GetDocumentPagesRotation(documentVersionId, pageNumber) {
        //     return new Promise(function (resolve, reject) {
        //         if (false) { // preloaded pagesrotation
        //             resolve(documentPagesRotation[pageNumber - 1]);
        //         } else {
        //             console.log("update Page Rotation");
        //             var that = this;
        //             var query = "DocumentVersionId=" + documentVersionId;
        //             if (pageNumber) {
        //                 query += ("&pageNumber=" + pageNumber);
        //             }

        //             $.ajax({
        //                 type: 'GET',
        //                 url: '/api/Annotation/GetDocumentPagesRotation/'+documentVersionId+'/',
        //                 headers: {
        //                     Authorization: "Bearer " + window.AuthenticationToken
        //                 },
        //                 success: function (response) {
        //                     resolve(response);
        //                 },
        //                 error: function (response) {
        //                     reject(response);
        //                 }
        //             });
        //         }
        //     });
        // },




    }

    return CRUDController;

})();
