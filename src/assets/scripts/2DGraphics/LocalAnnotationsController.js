"use strict";

var LocalAnnotationsController = (function () {

    function LocalAnnotationsController() {
        this.data = new Object();
        this.pdfPageRotations = new Object();
    };

    LocalAnnotationsController.prototype = {
        constructor: LocalAnnotationsController,

        isPageExists: function(docVerId, pageNumber){
            var that = this;
            if(Object.keys(that.data).includes(docVerId)){
                if(Object.keys(that.data[docVerId]).includes(pageNumber.toString())){
                    return true;
                }
            }
            return false;
        },

        

        //=================================================== Document Version ============
        addDocument: function (docVerId) {
            var that = this;
            if (docVerId in that.data) {
                // do nothing
            } else {
                that.data[docVerId] = new Object();
            }
        },

        deleteDocument: function (docVerId) {
            var that = this;
            if (docVerId in that.data) { //doc
                delete that.data[docVerId];
            }
        },

        //=================================================== Page ==========================
        addPage: function (docVerId, pageNumber, annotations, svgController) {
            var that = this;
            that.addDocument(docVerId)
            if (pageNumber in that.data[docVerId]) {
                // do nothing
            } else {
                if(annotations){
                    that.data[docVerId][pageNumber] = annotations;
                }else{
                    that.data[docVerId][pageNumber] = [];
                }
            }
        },

        deletePage: function (docVerId, pageNumber) {
            var that = this;
            if (docVerId in that.data) { //doc
                if(Object.keys(that.data[docVerId].includes(pageNumber.toString()))){
                    delete that.data[docVerId][pageNumber];
                }
            }
        },

        //=================================================== Annotation ====================

        addAnnotation: function (docVerId, pageNumber, annotation, svgController, callback) {
            var that = this;
            that.addDocument(docVerId);
            that.addPage(docVerId, pageNumber, null, svgController);
            that.data[docVerId][pageNumber].push(annotation);

            if (callback) callback(); // callback
        },

        addManyAnnotation: function (docVerId, pageNumber, annotations, svgController, callback) {
            try{
                var that = this;
                that.addDocument(docVerId);
                that.addPage(docVerId, pageNumber, null, svgController);
                if(annotations !== ""){
                    annotations.forEach(function (annotation) {
                        that.addAnnotation(docVerId, pageNumber, annotation, svgController)
                    });
                }
                
    
                if (callback) callback(); // callback
            }catch(ex){
                console.error(ex);
            }
            
        },

        deleteAnnotation: function (docVerId, pageNumber, annotation, svgController, callback) {
            var that = this;
            if (docVerId in that.data) { //doc
                if (pageNumber in that.data[docVerId]) { // page
                    var index = that.data[docVerId][pageNumber]
                        .map(m => m.DocumentAnnotationId).indexOf(annotation.DocumentAnnotationId);

                    if (index > -1) {
                        that.data[docVerId][pageNumber].splice(index, 1);
                    }
                }
            }

            if (callback) callback(); // callback
        },

        deleteAnnotationById: function (docVerId, pageNumber, documentAnnotationId, svgController, callback) {
            var that = this;
            if (docVerId in that.data) { //doc
                if (pageNumber in that.data[docVerId]) { // page
                    var index = that.data[docVerId][pageNumber]
                        .map(m => m.DocumentAnnotationId).indexOf(documentAnnotationId);

                    if (index > -1) {
                        that.data[docVerId][pageNumber].splice(index, 1);
                    }
                }
            }

            if (callback) callback(); // callback
        },

        deleteManyAnnotationById: function (docVerId, pageNumber, documentAnnotationIds, svgController, callback) {
            var that = this;

            if (pageNumber !== null) {
                documentAnnotationIds.forEach(function (documentAnnotationId) {
                    that.deleteAnnotationById(docVerId, pageNumber, documentAnnotationId);
                });
            } else {
                // delete annotation regardless of knowing the pageNumber
                if (docVerId in that.data) { //doc
                    Object.keys(that.data[docVerId]).forEach(function (pageNumber) {
                        documentAnnotationIds.forEach(function (documentAnnotationId) {
                            that.deleteAnnotationById(docVerId, pageNumber, documentAnnotationId);
                        });
                    });
                }
            }


            if (callback) callback(); // callback
        },

        updateAnnotation: function (docVerId, pageNumber, annotation, svgController, callback) {
            var that = this;
            that.deleteAnnotation(docVerId, pageNumber, annotation, null, null);
            that.addAnnotation(docVerId, pageNumber, annotation, null, null);

            if (callback) callback(); // callback
        },

        getAnnotationById: function(docVerId, pageNumber, documentAnnotationId){
            var that = this;
            var result = null;
            if (docVerId in that.data) { //doc
                if (pageNumber in that.data[docVerId]) { // page
                    var index = that.data[docVerId][pageNumber]
                        .map(m => m.DocumentAnnotationId).indexOf(documentAnnotationId);

                    if (index > -1) {
                        result = that.data[docVerId][pageNumber][index];
                        return result;
                    }
                }
            }
            return result;
        },

        //=================================================== PDF Page Rotate =======================
        isPageRotationExists: function(docVerId, pageNumber){
            var that = this;
            if(Object.keys(that.pdfPageRotations).includes(docVerId)){
                if(Object.keys(that.pdfPageRotations[docVerId]).includes(pageNumber.toString())){
                    return true;
                }
            }
            return false;
        }, 

        addPdfPageRotation: function(docVerId, pageNumber, rotation){
            var that = this;
            //if(!that.isPageRotationExists(docVerId, pageNumber)){
                if (docVerId in that.pdfPageRotations) {
                    // do nothing
                } else {
                    that.pdfPageRotations[docVerId] = new Object();
                }
                if (pageNumber in that.pdfPageRotations[docVerId]) {
                    // do nothing
                    that.pdfPageRotations[docVerId][pageNumber] = rotation;
                } else {
                    if(rotation){
                        that.pdfPageRotations[docVerId][pageNumber] = rotation;
                    }else{
                        that.pdfPageRotations[docVerId][pageNumber] = 0;
                    }
                }

            //}
        },

        //=================================================== Refresh =======================
        getAnnotationsFromBackend: function (docVerId, pageNumber) {
            var that = this;
            const getAnnotationUrl = (documentMetaData.sharedId ? '/api/ShareDocument/GetAnnotations/' + docVerId + '/' +  pageNumber: '/Annotation/GetAnnotations');
            return new Promise(function(resolve, reject){
                var request = $.ajax({
                    type: 'GET',
                    url: getAnnotationUrl,
                    data: {
                        documentVersionId: docVerId,
                        pageNumber: pageNumber
                    },
                    success: function (response) {
                        resolve(response);
                    },
                    error: function(error){
                        reject(error);
                    }
                });
            });
        },

        refreshLocalPageFromBackend: function(docVerId, pageNumber){
            var that = this;

            that.getAnnotationsFromBackend(docVerId, pageNumber).then(
                result=>{
                    that.deletePage(docVerId, pageNumber);
                    that.addPage(docVerId, pageNumber, result, null);
                },
                error=>{
                    console.error(error);
                }
            );
        },


        // end of methods
    }

    return LocalAnnotationsController;
})();