
function dataUrltoFile(url, filename, mimeType) {
    return (fetch(url)
        .then(function (res) { return res.arrayBuffer(); })
        .then(function (buf) { return new File([buf], filename, { type: mimeType }); })
        .then(function (file) {
            FileOperationLogic.fileUploadAndAttach(file, FileTreeExplLogic.parentId, new function (e) { var annotation = ann; }, new function (e) { })
        })
    );
}

var ThreeDTagUtils = (function () {

    function ThreeDTagUtils(resource) {
        this.currentSprite = null;
        this.isTagMode = false;
        this.threeDTags = [];
        this.Resource = resource;
    }

    ThreeDTagUtils.prototype = {
        constructor: ThreeDTagUtils,

        dataUrltoFile: function (url, filename, mimeType) {
            var that = this;
            return (fetch(url)
                .then(function (res) { return res.arrayBuffer(); })
                .then(function (buf) { return new File([buf], filename, { type: mimeType }); })
                .then(function (file) {
                    that.create3dTagDocument(file)
                })
            );
        },

        create3dTagDocument: function (file) {

            var that = this;
            file.extension = ".png";

            $.ajax({
                type: "GET",
                headers: {
                    Authorization: "Bearer " + window.parent.AuthenticationToken
                },
                url: "/api/Document/GetHiddenTHREEDAnnotationFolder/" + ProjectId,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                headers: {
                    Authorization: "Bearer " + window.parent.AuthenticationToken
                },
                success: function (response) {
                    console.log(response);

                    var documentApiModel = {
                        Name: DocumentVersionExternalId,
                        ParentId: response.DocumentId
                    }

                    $.ajax({
                        type: "POST",
                        url: "/api/Document/FindOrCreateFolder/",
                        data: JSON.stringify(documentApiModel),
                        headers: {
                            Authorization: "Bearer " + window.parent.AuthenticationToken
                        },
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (response, data, document) {
                            var upload = (new FileUpload(false));
                            upload.startUpload({
                                file: file,
                                parentId: response.DocumentId,
                                data: { },
                                attach: function (response, data, document, successCallback, errorCallback) {
                                    
                                    that.currentSprite.projectId = document.ProjectId;
                                    that.currentSprite.documentId = document.DocumentId;
                                    that.currentSprite.documentVersionId = document.DocumentVersionId;

                                    var spriteDetails = {
                                        position: that.currentSprite.position,
                                        annotationName: that.currentSprite.annotationName,
                                        annotationType: that.currentSprite.annotationType,
                                        DocumentAnnotationId: that.currentSprite.DocumentAnnotationId,
                                        tagNumber: that.currentSprite.tagNumber,
                                        base64Image: that.currentSprite.base64Image,
                                        projectId: document.ProjectId,
                                        documentId: document.DocumentId,
                                        documentVersionId: document.DocumentVersionId,
                                    }

                                    var documentAnnotationApiModel = {
                                        DocumentVersionId: document.DocumentVersionId,
                                        AnnotationId: that.currentSprite.DocumentAnnotationId
                                    }

                                    $.ajax({
                                        type: "POST",
                                        url: "/api/Document/Link3dTagDocument/",
                                        headers: {
                                            Authorization: "Bearer " + window.parent.AuthenticationToken
                                        },
                                        data: JSON.stringify(documentAnnotationApiModel),
                                        contentType: "application/json; charset=utf-8",
                                        dataType: "json",
                                        success: function (response) {
                                            console.log("link 3d tag document: ", response);
                                            successCallback();
                                        },
                                        error: errorCallback
                                    });


                                    var annotation = {
                                        DocumentAnnotationId: that.currentSprite.DocumentAnnotationId,
                                        AnnotationType: that.currentSprite.annotationType,
                                        ParentId: "", // not implemented yet
                                        DocumentVersionId: document.DocumentVersionId,
                                        AnnotationName: that.currentSprite.annotationName,
                                        Left: -1 ,
                                        Top: -1,
                                        Points:[
                                            {
                                                X:that.currentSprite.position.x,
                                                Y:that.currentSprite.position.y,
                                                Z:that.currentSprite.position.z
                                            }
                                        ],
                                        Fill: null,
                                        Stroke: null,
                                        StrokeWidth: null,
                                        Text: that.currentSprite.tagNumber.toString(),
                                        IsSelectable: true,
                                        IsGroup: false, // not implemented yet
                                        Scale: "",
                                        Src: that.currentSprite.base64Image,
                                        ModifiedBy: null,
                                        CreatedBy: null,
                                        DeletedBy: null,
                                        CreatedOn: null,
                                        ModifiedOn: null,
                                        DeletedOn: null,
                                        ChildDocumentId: null, // not implemented yet
                                        PageId: "00000000-0000-0000-0000-000000000000",
                                        PageNumber: 0,
                                        childrenIds: null // not implemented yet
                                    }


                                    AnnotationApplication.CRUDController.updateAnnotation(annotation, function (response) {
                                        console.log(response);
                                        console.log("update success");
                                    });

                                },
                                detach: function (response, data, document, successCallback, errorCallback) {
                                    var documentAnnotationApiModel = {
                                        AnnotationId: that.currentSprite.DocumentAnnotationId
                                    }
                                    $.ajax({
                                        type: "POST",
                                        url: "/api/Document/Unlink3dTagDocument/",
                                        headers: {
                                            Authorization: "Bearer " + window.parent.AuthenticationToken
                                        },
                                        data: JSON.stringify(documentAnnotationApiModel),
                                        contentType: "application/json; charset=utf-8",
                                        dataType: "json",
                                        success: function (response) {
                                            console.log("unlink 3d tag document: ", response);
                                            successCallback();
                                        },
                                        error: errorCallback
                                    });
                                },
                                complete: function (response, data, document) { },
                                success: function (response, data, document) {
                                    that.create3DTagWindow(document);
                                },
                                error: function (response, data) { }
                            });
                        }
                    });
                }
            });

        },

        load3DTags: function () {
            var that = this;

            var request = $.ajax({
                type: 'GET',
                url: '/Annotation/GetAnnotations',
                data: {
                    DocumentVersionId: DocumentVersionExternalId,
                    CanvasId: 1,
                    Context: "DOCUMENT",//"DOCUMENT"
                    includeHistory: false
                },
                success: function (response) {

                    response.forEach(function(annotation){

                        try{
                            var spriteMap = new THREE.TextureLoader().load(annotation.Src);
                            var spriteMaterial = new THREE.SpriteMaterial({
                                map: spriteMap,
                                color: 0xffffff,
                                depthTest: false,
                                transparent: true
                            });
    
                            var sprite = new THREE.Sprite(spriteMaterial);
                            sprite.position.set(annotation.Points[0].X, annotation.Points[0].Y, annotation.Points[0].Z);
                            sprite.scale.set(.95, 1.15, 1);
    
                            sprite.annotationName = annotation.AnnotationName;
                            sprite.annotationType = annotation.AnnotationType;
                            sprite.DocumentAnnotationId = annotation.DocumentAnnotationId;
                            sprite.tagNumber = parseInt(annotation.Text);
                            sprite.base64Image = annotation.Src;
                            sprite.documentVersionId = annotation.DocumentVersionId;
    
                            if (annotation.DocumentId !== null) {
                                sprite.projectId = annotation.projectId;
                                sprite.documentId = annotation.DocumentId;
                                sprite.documentVersionId = annotation.documentVersionId;
                            }
                            else {
                                sprite.documentUrl = annotation.documentUrl;
                            }
                            
                            var model = Three.ModelLoader.getModel();
                            model.add(sprite);
    
                            that.threeDTags.push(sprite);
                        }catch(ex){
                            console.error(ex);
                        }
                        
                    });
                }
            });
        },

        create3DTagWindow: function (document) {
            dataExchange.sendParentMessage('openTagModal',document);
        },

        deleteTag: function (tag) {

            var documentAnnotationIds = [
                tag.DocumentAnnotationId
            ];

            var request = $.ajax({
                type: 'POST',
                url: '/Annotation/DeleteAnnotation',
                dataType: 'text',
                data: {
                    DocumentAnnotationIds: documentAnnotationIds,
                },
                success: function (response) {
                    console.log("Delete Success: ", response);
                    var model = Three.ModelLoader.getModel();
                    model.remove(tag);
                }
            });
        },

        hideAllTags: function () {
            var tags = this.threeDTags;
            var tag = null;

            for (var i in tags) {
                tag = tags[i];
                tag.visible = false;
            }
            Three.render();
        },

        showAllTags: function () {
            var tags = this.threeDTags;
            var tag = null;

            for (var i in tags) {
                tag = tags[i];
                tag.visible = true;
            }

            Three.render();
        },

        enableTagMode: function () {
            Three.ThreeDTagUtils.isTagMode = true;
            Three.container.style.cursor = 'not-allowed';
            Three.controls.enabled = false;
            //Three.navControls.enabled = false;
        },

        disableTagMode: function () {
            Three.ThreeDTagUtils.isTagMode = false;
            Three.container.style.cursor = 'auto';
            Three.controls.enabled = true;
            //Three.navControls.enabled = true;
        },

        removeTagsFromModel: function () {
            var model = Three.ModelLoader.getModel();
            var objectsForRemoval = [];
            model.traverse(function (child) {
                if (child instanceof THREE.Sprite) {
                    console.log(model);
                    console.log(child);
                    objectsForRemoval.push(child);
                }
            });

            console.log(objectsForRemoval);

            for (var i = 0, length = objectsForRemoval.length; i < length; i++ ) {
                model.remove(objectsForRemoval[i]);
            }
        },

        addTagsToModel: function () {
            var model = Three.ModelLoader.getModel();
            var tags = Three.ThreeDTagUtils.threeDTags;
            console.log(tags);

            for (var i = 0, length = tags.length; i < length; i++) {
                model.add(tags[i]);
            }
        }

    }

    return ThreeDTagUtils;

})();
