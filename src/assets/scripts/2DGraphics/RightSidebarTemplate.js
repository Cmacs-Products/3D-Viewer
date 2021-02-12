var RightSidebarTemplate = (function RightSidebarTemplateClosure() {
    function RightSidebarTemplate(canvas, canvasId, annotation) {

        var that = this;

        // Canvas
        this.canvas = canvas;
        this.canvasId = canvasId;

        // Annotation
        this.annotation = annotation;
        this.annotationType = annotation.type;
        this.annotationId = annotation.annotationId;

        // Right Sidebar Template Clone
        this.rightSidebarTemplate = $("#rightSidebarTemplate").clone();
        this.rightSidebarTemplate.attr("id", "rightSidebarAnnotation_tools");
        //this.rightSidebarTemplate.attr("id", "rightSidebarAnnotation_" + this.annotationId);
        this.rightSidebarTemplate.removeClass("hidden");
        this.annotationName = this.rightSidebarTemplate.find(".annotationName");
        this.noToolsNotice = this.rightSidebarTemplate.find(".noToolsNotice");

        // Containers
        this.rightSideBarTools = this.rightSidebarTemplate.find(".rightSideBarTools");
        this.rightSideBarComments = this.rightSidebarTemplate.find(".rightSideBarComments");
        this.rightSideBarTasks = this.rightSidebarTemplate.find(".rightSideBarTasks");

        // Navigation
        this.rightSideBarTabs = this.rightSidebarTemplate.find(".rightSideBarTabs");
        this.rightSidebarTabTools = this.rightSidebarTemplate.find(".rightSidebarTabTools");
        this.rightSidebarTabComments = this.rightSidebarTemplate.find(".rightSidebarTabComments");
        this.rightSidebarTabTasks = this.rightSidebarTemplate.find(".rightSidebarTabTasks");

        // Property Tool Containers - tools should be append to appropriate container
        this.defaultPropertyContainer = this.rightSidebarTemplate.find(".defaultPropertyContainer ");
        this.strokeColorContainer = this.rightSidebarTemplate.find(".strokeColorContainer");
        this.strokeWidthContainer = this.rightSidebarTemplate.find(".strokeWidthContainer");
        this.fillColorContainer = this.rightSidebarTemplate.find(".fillColorContainer");
        this.opacityContainer = this.rightSidebarTemplate.find(".opacityContainer");
        //this.textProperties = this.rightSidebarTemplate.find(".textProperties");

        // Activate Sidebar tab navigation
        this.rightSidebarTabTools.click(function () {
            that.rightSidebarTabTools.addClass("active");
            that.rightSideBarTools.removeClass("hidden");

            that.rightSidebarTabComments.removeClass("active");
            that.rightSideBarComments.addClass("hidden");

            that.rightSidebarTabTasks.removeClass("active");
            that.rightSideBarTasks.addClass("hidden");
        });
        this.rightSidebarTabComments.click(function () {
            that.rightSidebarTabTools.removeClass("active");
            that.rightSideBarTools.addClass("hidden");

            that.rightSidebarTabComments.addClass("active");
            that.rightSideBarComments.removeClass("hidden");

            that.rightSidebarTabTasks.removeClass("active");
            that.rightSideBarTasks.addClass("hidden");
        });
        this.rightSidebarTabTasks.click(function () {
            that.rightSidebarTabTools.removeClass("active");
            that.rightSideBarTools.addClass("hidden");

            that.rightSidebarTabComments.removeClass("active");
            that.rightSideBarComments.addClass("hidden");

            that.rightSidebarTabTasks.addClass("active");
            that.rightSideBarTasks.removeClass("hidden");
        });

        var displayId = this.annotationId;

        // Add Annotation Name to Sidebar
        this.annotationName.text(annotation.annotationName + ": " + displayId);

        if (AnnotationApplication.viewerType === "DOCUMENT") {
            // Add Comments Panel
            new CommentController(annotation, this.rightSideBarComments);

            // Add Tasks Panel
            this.rightSideBarTasks.append(new TaskController(annotation).initialize());
        } else if (AnnotationApplication.viewerType === "EMS") {
            this.rightSideBarTools.removeClass("hidden");
            this.rightSideBarComments.addClass("hidden");
            this.rightSideBarTabs.addClass("hidden");
        }

        if (this.annotation.hasOwnProperty("paper")) {
            this.annotation.DocumentAnnotationId = this.annotation.data("DocumentAnnotationId");
            
        }
        
        new PropertyTool(this.defaultPropertyContainer, annotation, canvas, this.canvasId, "text", "", "").init();

        return this.rightSidebarTemplate;
    };

    RightSidebarTemplate.prototype = {

    };

    return RightSidebarTemplate;
})();