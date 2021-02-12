var AnnotationAjaxService = (function AnnotationAjaxServiceClosure() {
    function AnnotationAjaxService() {
        this.pendingSaveRequests = [];
        this.pendingLoadRequests = [];
        this.pendingDeleteRequests = [];
        this.annotationTaskloaded = false;
    }

    AnnotationAjaxService.prototype = {
        ajaxStop: function AnnotationAjaxService_ajaxStop() {
            //var that = this;
            //$(document).ajaxStop(function () {
            //    if (AnnotationApplication.scrollAnnotationId && !that.annotationTaskloaded) {
            //        try{
            //            var annotationId = AnnotationApplication.scrollAnnotationId;
            //            var canvasId = AnnotationApplication.scrollAnnotationCanvasId;
            //            AnnotationApplication.CanvasController.scrollToAnnotation(annotationId, canvasId);
            //            that.annotationTaskloaded = true;
            //        } catch(e){ console.log("Tried to scroll to annotation, but none was defined.")}
            //    }
            //});
        },
        addPendingSaveRequest: function AnnotationAjaxService_addPendingSaveRequest(request) {
            this.pendingSaveRequests.push(request);
        },
        addPendingLoadRequest: function AnnotationAjaxService_addPendingLoadRequest(request) {
            this.pendingLoadRequests.push(request);
        },
        addPendingDeleteRequest: function AnnotationAjaxService_addPendingDeleteRequest(request) {
            this.pendingDeleteRequests.push(request);
        },

        getPendingSaveRequests: function AnnotationAjaxService_addPendingSaveRequests() {
            return this.pendingLoadRequests;
        },
        getPendingLoadRequests: function AnnotationAjaxService_getPendingLoadRequests() {
            return this.pendingLoadRequests;
        },
        getPendingDeleteRequests: function AnnotationAjaxService_getPendingDeleteRequests() {
            return this.pendingDeleteRequests;
        },

        emptyPendingLoadRequests: function AnnotationAjaxService_emptyPendingLoadRequests() {
            this.pendingLoadRequests = [];
        },
        emptyPendingSaveRequests: function AnnotationAjaxService_emptyPendingSaveRequests() {
            this.pendingSaveRequests = [];
        },
        emptyPendingDeleteRequests: function AnnotationAjaxService_emptyPendingDeleteRequests() {
            this.pendingDeleteRequests = [];
        },

        pendingLoadRequestsComplete: function AnnotationAjaxService_pendingLoadRequestsComplete(callback) {
            $.when.apply(null, this.pendingLoadRequests).done(function () {
                callback();
            });
        },
        pendingSaveRequestsComplete: function AnnotationAjaxService_pendingSaveRequestsComplete(callback) {
            $.when.apply(null, this.pendingSaveRequests).done(function () {
                callback();
            });
        },
        pendingDeleteRequestsComplete: function AnnotationAjaxService_pendingDeleteRequestsComplete(callback) {
            $.when.apply(null, this.pendingDeleteRequests).done(function () {
                callback();
            });
        },

    }

    return AnnotationAjaxService;
})();

