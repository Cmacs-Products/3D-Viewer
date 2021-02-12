var PropertyTool = (function PropertyToolClosure() {

    function PropertyTool(toolAppendContainer, annotation, canvas, canvasId, toolType, propertyName, prettyName) {
        this.annotation = annotation;
        this.toolAppendContainer = toolAppendContainer;
        this.propertyName = propertyName;
        this.canvas = canvas;
        this.prettyName = prettyName;
        this.toolType = toolType;
        this.canvasId = canvasId;
    };

    PropertyTool.prototype = {

        constructor: PropertyTool,

        init: function PropertyTool_init() {
            var that = this;

            $.ajax({
                type: "POST",
                url: "/Annotation/GetPropertyToolPartial",
                data: {
                    //annotation: JSON.stringify(this.annotation),
                    annotationId: this.annotation.annotationId,
                    //propertyName: this.propertyName,
                    //prettyName: this.prettyName,
                    //canvas: JSON.stringify(this.canvas),
                    //canvasId: this.canvasId,
                    //toolType: this.toolType
                },
                success: function (response) {
                    that.toolAppendContainer.append(response);
                }
            });
        }
    };

    return PropertyTool;
})();