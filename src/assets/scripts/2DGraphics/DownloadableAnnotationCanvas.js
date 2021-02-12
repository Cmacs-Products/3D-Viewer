var DownloadableAnnotationCanvas = (function DownloadAnnotationClosure() {

    function DownloadableAnnotationCanvas() { };

    DownloadableAnnotationCanvas.prototype = {

        constructor: DownloadableAnnotationCanvas,

        generateCanvas: function DownloadAnnotation_generateCanvas(response, pageNumber) {

            console.log(response);

            var shapeDetails = response.ShapeDetails;

            // If shapDetails isn't null, leave as is, 
            // otherwise set as empty FabricJS JSON string)
            shapeDetails = shapeDetails ? shapeDetails : '{"objects":[],"background":""}';

            var width = document.getElementById("pageContainer" + pageNumber).offsetWidth;
            var height = document.getElementById("pageContainer" + pageNumber).offsetHeight;
            var canvasId = "downloadCanvas_" + pageNumber;
            var canvas = document.createElement('canvas');

            console.log(canvasId);

            canvas.setAttribute("id", canvasId);
            canvas.setAttribute("width", width);
            canvas.setAttribute("height", height);
            document.getElementById('annotationDownloadContainer').appendChild(canvas);

            canvas = new fabric.StaticCanvas(canvasId, {
                selection: false,
                allowTouchScrolling: false,
                isDrawingMode: false,
                skipTargetFind: true
            });

            // Set canvas dimensions
            var currentScale = PDFViewerApplication.pdfViewer.currentScale;
            
            // Set Canvas dimension
            canvas.setDimensions({
                width: width,
                height: height,
            });

            var shapeDetails = response.ShapeDetails;
            var shapeDetailsParsed = JSON.parse(shapeDetails);
            var annotations = shapeDetailsParsed.objects;

            var newAnnotationObjects = AnnotationApplication.CanvasController.getNewShapeDetails(annotations, canvas, false);
            var newShapeDetails = newAnnotationObjects.newShapeDetails;

            var reconstructedObjects = newAnnotationObjects.reconstructedObjects;

            // Load the canvas
            canvas.loadFromJSON(JSON.stringify(newShapeDetails), function () {
                canvas.renderAll();

                for (var i in reconstructedObjects) {
                    if (reconstructedObjects[i]) {
                        canvas.add(reconstructedObjects[i]);
                    }
                }

                canvas.renderAll();
            });
            
            return canvas;
        },
    };

    return DownloadableAnnotationCanvas;

})();