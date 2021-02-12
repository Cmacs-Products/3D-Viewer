var num = 1;
var ThreeDTag = (function () {

    function ThreeDTag(settings) {

        var position = settings.position;

        this.sprite = null;
        this.emsNode = settings.emsNode;

        var that = this;

        $.ajax({
            type: "GET",
            url: "/Annotation/getThreeDTag",
            data: {
                documentVersionExternalId: DocumentVersionExternalId
            },
            success: function (data) {

                //var spriteData = JSON.parse(data);
                //console.log(spriteData);
                //var base64Image = "data:image/png;base64," + spriteData.base64String;
                var base64Image = "data:image/png;base64," + data.Src;

                var spriteMap = new THREE.TextureLoader().load(base64Image);
                var spriteMaterial = new THREE.SpriteMaterial({
                    map: spriteMap,
                    color: 0xffffff,
                    depthTest: false,
                    transparent: true
                });
                that.sprite = new THREE.Sprite(spriteMaterial);
                that.sprite.position.set(position.x, position.y, position.z);
                that.sprite.scale.set(.9, 1.1, 1);
                //that.sprite.visible = false;

                that.sprite.annotationName = "3DTag";
                that.sprite.annotationType = "3DTag";
                that.sprite.DocumentAnnotationId = -1;
                //that.sprite.tagNumber = spriteData.tagNumber;
                that.sprite.tagNumber = parseInt(data.Text);
                that.sprite.base64Image = base64Image;

                that.createTag();

               // dataExchange.sendParentMessage('pushTags',that.sprite);
                Three.ThreeDTagUtils.threeDTags.push(that.sprite);

                var model = Three.ModelLoader.getModel();
                model.add(that.sprite);
                //Three.scene.add(that.sprite);

            },
            error: function(err){
                console.error(err);
            }
        });

    }

    ThreeDTag.prototype = {
        constructor: ThreeDTag,

        createTag: function (callback) {
            //console.log("createAnnotation");
            var that = this;
            var mScale = {
                "FromValue": null,
                "FromUnit": null,
                "ToValue": null,
                "ToUnit": null,
                "PixelValue": null,
                "DisplayValue": null,
            };
            var isEms = false;
            var emsNodeId = null;

            //console.log(emsNode);

            if (typeof (emsNode) !== "undefined") {
                isEms = true;
                emsNodeId = emsNode.id;
            }

            var spriteDetails = {
                position: this.sprite.position,
                annotationName: this.sprite.annotationName,
                annotationType: this.sprite.annotationType,
                DocumentAnnotationId: this.sprite.DocumentAnnotationId,
                tagNumber: this.sprite.tagNumber,
                base64Image: this.sprite.base64Image
            }

            console.log(spriteDetails);
            console.log(this.sprite);

            Three.ThreeDTagUtils.currentSprite = this.sprite;


            var annotation = {
                DocumentAnnotationId: "00000000-0000-0000-0000-000000000000",
                AnnotationType: this.sprite.annotationType,
                ParentId: "", // not implemented yet
                DocumentVersionId: DocumentVersionExternalId,
                AnnotationName: this.sprite.annotationName,
                Left: -1 ,
                Top: -1,
                Points:[
                    {X:this.sprite.position.x, Y:this.sprite.position.y,Z:this.sprite.position.z}
                ],
                Fill: null,
                Stroke: null,
                StrokeWidth: null,
                Text: this.sprite.tagNumber.toString(),
                IsSelectable: true,
                IsGroup: false, // not implemented yet
                Scale: "",
                Src: this.sprite.base64Image,
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
            

            $.ajax({
                type: 'POST',
                url: '/Annotation/Create',
                data: {
                    documentSvgAnnotationApiModel: JSON.stringify(annotation)
                    /*CanvasId: 1,
                    Scale: null,//JSON.stringify(mScale),
                    Context: loadedModule,//"DOCUMENT",
                    ShapeDetails: JSON.stringify(spriteDetails),//this.sprite.ToJSON(),//
                    ExternalId: DocumentVersionExternalId,
                    MeasureScale: null,//JSON.stringify(mScale),
                    EMS: isEms,
                    EMSNodeId: emsNodeId*/
                },
                success: function (response) {
                    //that.sprite.DocumentAnnotationId = response.Message;
                    that.sprite.DocumentAnnotationId = response.DocumentAnnotationId;
                    console.log("Annotation created successfully: ", response);
                    //Three.ThreeDTagUtils.hideAllTags();
                    // if (Three.ThreeDToolbar.showTransformControls) {
                    //     //Three.ToolbarEventHandler.hideTransformControls();
                    //     Three.ThreeDToolbar.showTransformControls = false;
                    //     Three.ControlUtils.hideTransformControls();
                    // }
 
                    Three.ThreeDTagUtils.isTagMode = true; 
                    Three.Utils.triggerCanvasExport();                  
                }
            });
        },

    }

    return ThreeDTag;

})();