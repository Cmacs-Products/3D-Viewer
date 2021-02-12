var ImageUploadController = (function ImageUploadControllerClosure() {
    function ImageUploadController() {
        this.uploadedImage = null;
    }

    ImageUploadController.prototype = {
        constructor: ImageUploadController,
        getBase64Image: function ImageUploadController_getBase64Image(img) {
            // Create an empty canvas element
            var canvas = document.createElement("canvas");            
            canvas.width = img.width;
            canvas.height = img.height;

            // Copy the image contents to the canvas
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);

            // Get the data-URL formatted image
            // Firefox supports PNG and JPEG. You could check img.src to
            // guess the original format, but be aware the using "image/jpg"
            // will re-encode the image.
            var dataURL = canvas.toDataURL("image/png");
            //var replaced = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");


            return dataURL;
        },
        uploadImage: function ImageUploadController_uploadImage(callback) {
            var that = this;
            var hiddenImageUploadDOM = document.getElementById("hiddenImageUploadDOM");
            hiddenImageUploadDOM.click();
            hiddenImageUploadDOM.addEventListener('change', function (e) {
                //console.log(this.files);
              e.preventDefault();

                if(callback)callback(e.target.files[0]);
                var reader = new FileReader();
                reader.onload = function (event) {
                    var img = new Image();
                    img.src = event.target.result;
                    img.onload = function () {

                        that.uploadedImage = img;
                        //if (callback) callback(img);
                        
                    }
                }

                if (e.target.files.length > 0) {
                    console.log(" > 0");
                    reader.readAsDataURL(e.target.files[0]);
                } else {
                    console.log(" select ");
                    AnnotationApplication.DrawStateService.setSelect();
                    SvgGlobalControllerLogic.getSvgController(PDFViewerApplication.pdfViewer.currentPageNumber).canvas
                    .stopDrawing();
                }

            }, false);
        },
        getImage: function ImageUploadController_getImage() {
            return this.uploadedImage;
        }

    }

    return ImageUploadController;
})();
