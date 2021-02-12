
var Gui = (function () {

    function Gui() {

        var that = this;

        this.resetObjectButton = $("#resetObjectButton");
        this.centerModelButton = $("#centerModelButton");
        this.showHideGridToggle = $("#showHideGridToggle");
        this.snapToGridToggle = $("#snapToGridToggle");
        this.showHideImageToggle = $("#showHideImageToggle");
        this.showHideGradientToggle = $("#showHideGradientToggle");
        this.showHiddenLineToggle = $("#showHiddenLineToggle");
        this.explodeModelToggle = $("#explodeModelToggle");
        //this.upOrientationZ = $("#upOrientationZ");

        this.isWireframe = false;
        this.isImage = false;
        this.isGradient = false;
        this.isCastShadow = false;
        this.ghostMode = false;
        this.hiddenLine = false;
        this.showHiddenLine = false;
        this.isToggleObject = false;
        this.snapToGrid = false;
        this.upOrientation = "y";
        this.gradientType = "Linear";
        this.wireFrameToggle = "Default";
        this.backgroundColor = "#ffffff";
        this.ambientOcclusion = false;
        this.originalGroupPosition;
        this.spacing = 5;
        this.positionDelta = new THREE.Vector3();
        this.scaleDelta = new THREE.Vector3();
        this.rotateDelta = new THREE.Vector3();
        this.positionSliderUpdate = false;
        this.scaleSliderUpdate = false;
        this.rotationSliderUpdate = false;
        this.rotationAngle;
        this.hiddenLineDropDownValue = "";


        var theme = document.cookie.split(';').reduce((cookies, cookie) => {
            let [name, value] = cookie.split('=').map(c => c.trim());
            cookies[name] = value;
            return cookies;
        }, {})["theme"];
        if (theme == 'ColorTheme') {
            this.startColor = '#37afe0';
            this.stopColor = '#00365d';
        }
        else if (theme == 'DarkTheme') {
            this.startColor = '#3a434a';
            this.stopColor = '#171c21';
        }
        else {
            this.startColor = '#ffffff';
            this.stopColor = '#666666';
        }
        // rein: overriding colors on request  of TJ:
        this.startColor = '#009fe3';
        this.stopColor = '#ffffff';

        // COLOR SETTINGS
        //this.bgColorPicker = $("#bgColorPicker").kendoColorPalette({
        //    palette: "basic",
        //    change: function (e) {
        //        var value = this.value();
        //        that.bgColorPickerChange(value);
        //        if (!that.isGradient) {
        //            that.showHideGradientToggle.click();
        //        }

        //    }

        //}).data("kendoSlider");

        // SCALE
        //this.scaleXSlider = $("#scaleXSlider").kendoSlider({
        //    //increaseButtonTitle: "Right",
        //    //decreaseButtonTitle: "Left",
        //    min: 10^-6,
        //    max: 10^6,
        //    smallStep: 1,
        //    largeStep: 10 ^ 6,
        //    change: this.scaleXSliderUpdate,
        //    slide: this.scaleXSliderUpdate
        //}).data("kendoSlider");

        //this.scaleYSlider = $("#scaleYSlider").kendoSlider({
        //    min: 10^-6,
        //    max: 10^6,
        //    smallStep: 1,
        //    largeStep: 10 ^ 6,
        //    change: this.scaleYSliderUpdate,
        //    slide: this.scaleYSliderUpdate
        //}).data("kendoSlider");

        //this.scaleZSlider = $("#scaleZSlider").kendoSlider({
        //    min: 10^-6,
        //    max: 10^6,
        //    smallStep: 1,
        //    largeStep: 10 ^ 6,
        //    change: this.scaleZSliderUpdate,
        //    slide: this.scaleZSliderUpdate
        //}).data("kendoSlider");


        //this.explodeModelSlider = $("#explodeModelSlider").kendoSlider({
        //    min: 0,
        //    max: 1,
        //    smallStep: 0.05,
        //    largeStep: 1,
        //    change: this.explodeModelSliderUpdate,
        //    slide: this.explodeModelSliderUpdate
        //}).data("kendoSlider");

        //this.startColorStop = $("#startColorStop").kendoColorPicker({
        //    value: this.startColor,
        //    buttons: false,
        //    select: this.previewStartColor

        //}).data("kendoColorPicker");

        //this.stopColorStop = $("#stopColorStop").kendoColorPicker({
        //    value: this.stopColor,
        //    buttons: false,
        //    select: this.previewStopColor

        //}).data("kendoColorPicker");

        //// POSITION
        //this.positionXSlider = $("#positionXSlider").kendoSlider({
        //    min: -100,
        //    max: 100,
        //    smallStep: 5,
        //    largeStep: 100,
        //    change: this.positionXSliderUpdate,
        //    slide: this.positionXSliderUpdate
        //}).data("kendoSlider");

        //this.positionYSlider = $("#positionYSlider").kendoSlider({
        //    min: -100,
        //    max: 100,
        //    smallStep: 5,
        //    largeStep: 100,
        //    change: this.positionYSliderUpdate,
        //    slide: this.positionYSliderUpdate
        //}).data("kendoSlider");

        //this.positionZSlider = $("#positionZSlider").kendoSlider({
        //    min: -100,
        //    max: 100,
        //    smallStep: 5,
        //    largeStep: 100,
        //    change: this.positionZSliderUpdate,
        //    slide: this.positionZSliderUpdate
        //}).data("kendoSlider");


        //// ROTATION
        //this.rotationXSlider = $("#rotationXSlider").kendoSlider({
        //    min: -360,
        //    max: 360,
        //    smallStep: 15,
        //    largeStep: 360,
        //    change: this.rotationXSliderUpdate,
        //    slide: this.rotationXSliderUpdate
        //}).data("kendoSlider");

        //if (loadedModule == "DOCUMENT" && extension == ".ifc") {
        //    this.rotationXSlider.value(-90);
        //}

        //this.rotationYSlider = $("#rotationYSlider").kendoSlider({
        //    min: -360,
        //    max: 360,
        //    smallStep: 15,
        //    largeStep: 360,
        //    change: this.rotationYSliderUpdate,
        //    slide: this.rotationYSliderUpdate
        //}).data("kendoSlider");

        //this.rotationZSlider = $("#rotationZSlider").kendoSlider({
        //    min: -360,
        //    max: 360,
        //    smallStep: 15,
        //    largeStep: 360,
        //    change: this.rotationZSliderUpdate,
        //    slide: this.rotationZSliderUpdate
        //}).data("kendoSlider");

        //var data = [
        //    { text: "y", value: "y" },
        //    { text: "z", value: "z" },
        //];

        //var gradientData = [
        //    { text: "Linear", value: "Linear" },
        //    { text: "Radial", value: "Radial" },


        //];

        //var wireFrameData = [
        //    { text: VIEW_RESOURCES.Resource.Default, value: "Default" },
        //    { text: VIEW_RESOURCES.Resource.Mesh, value: "Wireframe" },
        //    { text: VIEW_RESOURCES.Resource.CastShadow, value: "Cast Shadow" },
        //    { text: VIEW_RESOURCES.Resource.GhostMode, value: "Ghost Mode" },
        //    { text: VIEW_RESOURCES.Resource.HiddenLine, value: "Hidden Line" },
        //    { text: VIEW_RESOURCES.Resource.None, value: "None" }
        //];

        //this.upOrientationZ = $("#upOrientationZ").kendoDropDownList({
        //    dataTextField: "text",
        //    dataValueField: "value",
        //    dataSource: data,
        //    //height: 50,
        //    change: function (e) {
        //        var value = this.value();
        //        that.setUpOrientation(value);
        //    }
        //}).data("kendoDropDownList");

        //this.gradientTypeLinear = $("#gradientTypeLinear").kendoDropDownList({
        //    dataTextField: "text",
        //    dataValueField: "value",
        //    dataSource: gradientData,
        //    //height: 50,
        //    change: function (e) {
        //        var value = this.value();
        //        that.setGradientType(value);
        //    }
        //}).data("kendoDropDownList");


        //this.wireframeToggle = $("#wireframeToggle").kendoDropDownList({
        //    dataTextField: "text",
        //    dataValueField: "value",
        //    dataSource: wireFrameData,
        //    //height: 50,
        //    change: function (e) {
        //        var value = this.value();
        //        that.setObjectType(value);
                
        //    }
        //}).data("kendoDropDownList");

        //// PANEL BAR
        //$("#bgPanelBar").kendoPanelBar({
        //    expandMode: "single", //multiple

        //}).data("kendoPanelBar").expand(">li:first");

        //this.wireframeToggle.click(function() {
        //    that.toggleWireframe();
        //});
        //showHideImageToggle
        this.showHideImageToggle.click(function () {
            that.toggleBackgroundImage();
        });

        this.showHideGradientToggle.click(function () {
            that.toggleGradient();
        });

        this.showHiddenLineToggle.click(function () {
            that.toggleHiddenLine();
        })
        
        this.resetObjectButton.click(function() {
            that.resetObject();
        });

        this.centerModelButton.click(function () {
            that.centerModel();
        });

        this.showHideGridToggle.click(function () {
            that.toggleGridVisibility();
        });

        this.snapToGridToggle.click(function () {
            that.toggleSnapToGrid();
        });

        //this.upOrientationZ.click(function () {
        //    that.toggleUpOrientation();
        //});

    }

    Gui.prototype = {
        constructor: Gui,

        bgColorPickerChange: function (e) {
            $('td.k-color-selected').removeClass('k-color-selected');
            $('td.k-state-selected').addClass('k-color-selected');
            $('td.k-state-selected').removeClass('k-state-selected');
            Three.Gui.backgroundColor = e;
            console.log(Three.Gui.backgroundColor);
            //var dec = Three.GuiControls.BackgroundColor;
            Three.scene.background = Three.Gui.backgroundColor;
            Three.renderer.setClearColor(Three.Gui.backgroundColor);
            Three.render();
        },

        previewStartColor: function (e) {
            var that = this;
            this.startColor = e;
            if (!(Three.Gui.isGradient)) {
                if (Three.Gui.gradientType == 'Linear') {
                    var texture = new THREE.Texture(Three.Gui.generateTexture(this.startColor, Three.Gui.stopColor));
                }
                else if (Three.Gui.gradientType == 'Radial') {
                    var texture = new THREE.Texture(Three.Gui.generateRadialTexture(this.startColor, Three.Gui.stopColor));
                }
                texture.needsUpdate = true;
                Three.scene.background = texture;
            }


        },

        previewStopColor: function (e) {
            var that = this;
            this.stopColor = e;
            //Three.Gui.gradientType;
            if (!(Three.Gui.isGradient)) {
                if (Three.Gui.gradientType == 'Linear') {
                    var texture = new THREE.Texture(Three.Gui.generateTexture(Three.Gui.startColor, this.stopColor));
                }
                else if (Three.Gui.gradientType == 'Radial') {
                    var texture = new THREE.Texture(Three.Gui.generateRadialTexture(Three.Gui.startColor, this.stopColor));
                }
                texture.needsUpdate = true;
                Three.scene.background = texture;
            }

        },


        scaleXSliderUpdate: function (e) {
            var mesh = Three.ModelLoader.getModel();
            if ($('#TranslateButton').hasClass('k-state-active') || $('#RotateButton').hasClass('k-state-active')) {
                $('#ScaleButton').addClass('k-state-active');
                $('#TranslateButton').removeClass('k-state-active');
                $('#RotateButton').removeClass('k-state-active');
            }

            var selectionCube = Three.ModelLoader.getSelectionCube();

            if (selectionCube) {
                Three.Utils.removeObjectFromScene(Three.scene, selectionCube);
            }

            if (Three.fileType === "dae") {
                mesh.scale.x = e.value * 0.0254;
            //} else if ((loadedModule == "EMS")) {
            //    if ((ThreeD_VL.current3DModelNode.Type === "SystemSubType")) {
            //        mesh.scale.x = e.value * 0.001;
            //    } else {
            //        mesh.scale.x = e.value;
            //    }
            } else {
                //if (loadedModule == "DOCUMENT") {
                    var originalScale = mesh.scale.clone();
                    Three.Gui.scaleDelta.set((e.value), originalScale.y, originalScale.z);
                    Three.transformControls.axis = "X";
                    Three.transformControls.mode = "scale";
                    Three.Gui.scaleSliderUpdate = true;
                    Three.transformControls.object = mesh;
                    Three.transformControls.dragging = true;
                    Three.transformControls.pointerMove();
                
            }
            //Three.render();
            Three.Gui.scaleSliderUpdate = false;
            Three.Gui.callForUpdatingDirectLight(mesh);


        },

        scaleYSliderUpdate: function (e) {
            var mesh = Three.ModelLoader.getModel();
            if ($('#TranslateButton').hasClass('k-state-active') || $('#RotateButton').hasClass('k-state-active')) {
                $('#ScaleButton').addClass('k-state-active');
                $('#TranslateButton').removeClass('k-state-active');
                $('#RotateButton').removeClass('k-state-active');
            }

            var selectionCube = Three.ModelLoader.getSelectionCube();

            if (selectionCube) {
                Three.Utils.removeObjectFromScene(Three.scene, selectionCube);
            }

            if (Three.fileType === "dae") {
                mesh.scale.y = e.value * 0.0254;
            //}
            //else if ((loadedModule == "EMS")) {
            //    if ((ThreeD_VL.current3DModelNode.Type === "SystemSubType")) {
            //        mesh.scale.y = e.value * 0.001;
            //    } else {
            //        mesh.scale.y = e.value;
            //    }
            } else {
                
                    var originalScale = mesh.scale.clone();
                    Three.Gui.scaleDelta.set(originalScale.x, (e.value), originalScale.z);
                    Three.transformControls.axis = "Y";
                    Three.transformControls.mode = "scale";
                    Three.Gui.scaleSliderUpdate = true;
                    Three.transformControls.object = mesh;
                    Three.transformControls.dragging = true;
                    Three.transformControls.pointerMove();
                
            }
            //Three.render();
            Three.Gui.scaleSliderUpdate = false;
            Three.Gui.callForUpdatingDirectLight(mesh);

        },

        scaleZSliderUpdate: function (e) {
            var mesh = Three.ModelLoader.getModel();
            if ($('#TranslateButton').hasClass('k-state-active') || $('#RotateButton').hasClass('k-state-active')) {
                $('#ScaleButton').addClass('k-state-active');
                $('#TranslateButton').removeClass('k-state-active');
                $('#RotateButton').removeClass('k-state-active');
            }
            var selectionCube = Three.ModelLoader.getSelectionCube();

            if (selectionCube) {
                Three.Utils.removeObjectFromScene(Three.scene, selectionCube);
            }

            if (Three.fileType === "dae") {
                mesh.scale.z = e.value * 0.0254;
            //} else if ((loadedModule == "EMS")) {
            //    if ((ThreeD_VL.current3DModelNode.Type === "SystemSubType")) {
            //        mesh.scale.z = e.value * 0.001;
            //    } else {
            //        mesh.scale.z = e.value;
            //    }
            } else {
                
                    var originalScale = mesh.scale.clone();
                    Three.Gui.scaleDelta.set(originalScale.x, originalScale.y, (e.value));
                    Three.transformControls.axis = "Z";
                    Three.transformControls.mode = "scale";
                    Three.Gui.scaleSliderUpdate = true;
                    Three.transformControls.object = mesh;
                    Three.transformControls.dragging = true;
                    Three.transformControls.pointerMove();
               
            }
            //Three.render();
            Three.Gui.scaleSliderUpdate = false;
            Three.Gui.callForUpdatingDirectLight(mesh);

        },

        callForUpdatingDirectLight: function (mesh) {
            if (Three.Gui.isCastShadow) {
                var BBhelper = new THREE.BoxHelper(mesh);
                if (!BBhelper.geometry.boundingSphere) {
                    BBhelper.geometry.computeBoundingSphere();
                }
                var BSphere = BBhelper.geometry.boundingSphere;
                Three.Gui.updateDirectionalLightForShadows(BSphere);
            }

        },

        add: function (v1, v2) {

            this.x = (v1.x + v2.x);
            this.y = (v1.y + v2.y);
            this.z = (v1.z + v2.z);

            return this;
        },

        explodeModelSliderUpdate: function (e) {
            var mesh = Three.ModelLoader.getModel();
            mesh.traverse(function (child) {

                if (Three.Gui.showHiddenLine) {
                   
                    Three.Gui.showHiddenLineToggle.click();
                }
                if (!(child instanceof THREE.Mesh)) {

                    var groupChildren = child.children.length;
                   
                    if (Three.Gui.upOrientation == "y") {
                        for (var i = 0; i < groupChildren; i++) {
                           
                            var differencePosition = new THREE.Vector3((child.children[i].originalBoundingSpherePosition.x - child.originalBoundingSpherePosition.x) * e.value, (child.children[i].originalBoundingSpherePosition.y - child.originalBoundingSpherePosition.y) * e.value, (child.children[i].originalBoundingSpherePosition.z - child.originalBoundingSpherePosition.z) * e.value);
                            var newPosition = differencePosition.clone().add(child.children[i].originalPosition);
                            child.children[i].position.set((newPosition.x), (newPosition.y), (newPosition.z));
                        }

                    }
                    else {
                        
                        for (var i = 0; i < groupChildren; i++) {

                            
                            var differencePosition = new THREE.Vector3((child.children[i].originalBoundingSpherePosition.x - child.originalBoundingSpherePosition.x) * e.value, (child.children[i].originalBoundingSpherePosition.y - child.originalBoundingSpherePosition.y) * e.value, (child.children[i].originalBoundingSpherePosition.z - child.originalBoundingSpherePosition.z) * e.value);
                            var newPosition = differencePosition.clone().add(child.children[i].originalPosition);
                            child.children[i].position.set((newPosition.x), (newPosition.y), (newPosition.z));

                        }
                    }

                }

            });

        },


        hex: function (x) {
            x = x.toString(16);
            return (x.length == 1) ? '0' + x : x;

        },

        generateTexture: function (startColor, stopColor) {

            var theme = document.cookie.split(';').reduce((cookies, cookie) => {
                let [name, value] = cookie.split('=').map(c => c.trim());
                cookies[name] = value;
                return cookies;
            }, {})["theme"];

            // create canvas
            canvas = document.createElement('canvas');
            canvas.width = Three.container.clientWidth;
            canvas.height = Three.container.clientHeight;
            // get context
            var context = canvas.getContext('2d');
            // draw gradient
            context.rect(0, 0, canvas.width, canvas.height);
            var gradient = context.createLinearGradient(canvas.width, 0, canvas.width, canvas.height);

            this.color1 = startColor.replace('#', '');
            this.color6 = stopColor.replace('#', '');

            this.r2 = Math.ceil(parseInt(this.color1.substring(0, 2), 16) * 0.8 + parseInt(this.color6.substring(0, 2), 16) * (1 - 0.8));
            this.g2 = Math.ceil(parseInt(this.color1.substring(2, 4), 16) * 0.8 + parseInt(this.color6.substring(2, 4), 16) * (1 - 0.8));
            this.b2 = Math.ceil(parseInt(this.color1.substring(4, 6), 16) * 0.8 + parseInt(this.color6.substring(4, 6), 16) * (1 - 0.8));
            this.color2 = "#" + Three.Gui.hex(this.r2) + Three.Gui.hex(this.g2) + Three.Gui.hex(this.b2);

            this.r3 = Math.ceil(parseInt(this.color1.substring(0, 2), 16) * 0.6 + parseInt(this.color6.substring(0, 2), 16) * (1 - 0.6));
            this.g3 = Math.ceil(parseInt(this.color1.substring(2, 4), 16) * 0.6 + parseInt(this.color6.substring(2, 4), 16) * (1 - 0.6));
            this.b3 = Math.ceil(parseInt(this.color1.substring(4, 6), 16) * 0.6 + parseInt(this.color6.substring(4, 6), 16) * (1 - 0.6));
            this.color3 = "#" + Three.Gui.hex(this.r3) + Three.Gui.hex(this.g3) + Three.Gui.hex(this.b3);

            this.r4 = Math.ceil(parseInt(this.color1.substring(0, 2), 16) * 0.4 + parseInt(this.color6.substring(0, 2), 16) * (1 - 0.4));
            this.g4 = Math.ceil(parseInt(this.color1.substring(2, 4), 16) * 0.4 + parseInt(this.color6.substring(2, 4), 16) * (1 - 0.4));
            this.b4 = Math.ceil(parseInt(this.color1.substring(4, 6), 16) * 0.4 + parseInt(this.color6.substring(4, 6), 16) * (1 - 0.4));
            this.color4 = "#" + Three.Gui.hex(this.r4) + Three.Gui.hex(this.g4) + Three.Gui.hex(this.b4);

            this.r5 = Math.ceil(parseInt(this.color1.substring(0, 2), 16) * 0.2 + parseInt(this.color6.substring(0, 2), 16) * (1 - 0.2));
            this.g5 = Math.ceil(parseInt(this.color1.substring(2, 4), 16) * 0.2 + parseInt(this.color6.substring(2, 4), 16) * (1 - 0.2));
            this.b5 = Math.ceil(parseInt(this.color1.substring(4, 6), 16) * 0.2 + parseInt(this.color6.substring(4, 6), 16) * (1 - 0.2));
            this.color5 = "#" + Three.Gui.hex(this.r5) + Three.Gui.hex(this.g5) + Three.Gui.hex(this.b5);

            if (theme == 'ColorTheme') {
                gradient.addColorStop(0, startColor); // light blue 
                gradient.addColorStop(0.17, this.color2);
                gradient.addColorStop(0.43, this.color3);
                gradient.addColorStop(0.66, this.color4);
                gradient.addColorStop(0.86, this.color5);
                gradient.addColorStop(1, stopColor);
            }
            else if (theme == 'DefaultTheme') {
                gradient.addColorStop(0, startColor);
                //gradient.addColorStop(0, '#fefefe');
                gradient.addColorStop(0.17, this.color2);
                gradient.addColorStop(0.49, this.color3);
                gradient.addColorStop(0.7, this.color4);
                gradient.addColorStop(0.87, this.color5);
                gradient.addColorStop(1, stopColor);
            }
            else {
                gradient.addColorStop(0, startColor);
                gradient.addColorStop(0.28, this.color2);
                gradient.addColorStop(0.49, this.color3);
                gradient.addColorStop(0.7, this.color4);
                gradient.addColorStop(0.87, this.color5);
                gradient.addColorStop(1, stopColor);

            }

            context.fillStyle = gradient;
            context.fill();
            Three.Gui.startColor = startColor;
            Three.Gui.stopColor = stopColor;
            Three.BackgroundRendering.startColor = startColor;
            Three.BackgroundRendering.stopColor = stopColor;
            return canvas;


        },

        generateRadialTexture: function (startColor, stopColor) {

            var theme = document.cookie.split(';').reduce((cookies, cookie) => {
                let [name, value] = cookie.split('=').map(c => c.trim());
                cookies[name] = value;
                return cookies;
            }, {})["theme"];
            // create canvas
            canvas = document.createElement('canvas');
            canvas.width = Three.container.clientWidth;
            canvas.height = Three.container.clientHeight;
            // get context
            var ctx = canvas.getContext('2d');
            // draw gradient
            x = canvas.width / 2;
            y = canvas.height / 2;
            //radius of inner circle
            radiusStart = (canvas.width / 2) / 20;
            radiusEnd = 800.5;
            if (true) {
                radiusEnd = (x + y) / 2;
            }
            if (canvas.width > canvas.height) {
                var radius = canvas.width;
            }
            else {
                var radius = canvas.height;
            }
            var grad = ctx.createRadialGradient(x, y, radiusStart, x, y, radiusEnd);

            this.color1 = startColor.replace('#', '');
            this.color6 = stopColor.replace('#', '');

            this.r2 = Math.ceil(parseInt(this.color1.substring(0, 2), 16) * 0.8 + parseInt(this.color6.substring(0, 2), 16) * (1 - 0.8));
            this.g2 = Math.ceil(parseInt(this.color1.substring(2, 4), 16) * 0.8 + parseInt(this.color6.substring(2, 4), 16) * (1 - 0.8));
            this.b2 = Math.ceil(parseInt(this.color1.substring(4, 6), 16) * 0.8 + parseInt(this.color6.substring(4, 6), 16) * (1 - 0.8));
            this.color2 = "#" + Three.Gui.hex(this.r2) + Three.Gui.hex(this.g2) + Three.Gui.hex(this.b2);

            this.r3 = Math.ceil(parseInt(this.color1.substring(0, 2), 16) * 0.6 + parseInt(this.color6.substring(0, 2), 16) * (1 - 0.6));
            this.g3 = Math.ceil(parseInt(this.color1.substring(2, 4), 16) * 0.6 + parseInt(this.color6.substring(2, 4), 16) * (1 - 0.6));
            this.b3 = Math.ceil(parseInt(this.color1.substring(4, 6), 16) * 0.6 + parseInt(this.color6.substring(4, 6), 16) * (1 - 0.6));
            this.color3 = "#" + Three.Gui.hex(this.r3) + Three.Gui.hex(this.g3) + Three.Gui.hex(this.b3);

            this.r4 = Math.ceil(parseInt(this.color1.substring(0, 2), 16) * 0.4 + parseInt(this.color6.substring(0, 2), 16) * (1 - 0.4));
            this.g4 = Math.ceil(parseInt(this.color1.substring(2, 4), 16) * 0.4 + parseInt(this.color6.substring(2, 4), 16) * (1 - 0.4));
            this.b4 = Math.ceil(parseInt(this.color1.substring(4, 6), 16) * 0.4 + parseInt(this.color6.substring(4, 6), 16) * (1 - 0.4));
            this.color4 = "#" + Three.Gui.hex(this.r4) + Three.Gui.hex(this.g4) + Three.Gui.hex(this.b4);

            this.r5 = Math.ceil(parseInt(this.color1.substring(0, 2), 16) * 0.2 + parseInt(this.color6.substring(0, 2), 16) * (1 - 0.2));
            this.g5 = Math.ceil(parseInt(this.color1.substring(2, 4), 16) * 0.2 + parseInt(this.color6.substring(2, 4), 16) * (1 - 0.2));
            this.b5 = Math.ceil(parseInt(this.color1.substring(4, 6), 16) * 0.2 + parseInt(this.color6.substring(4, 6), 16) * (1 - 0.2));
            this.color5 = "#" + Three.Gui.hex(this.r5) + Three.Gui.hex(this.g5) + Three.Gui.hex(this.b5);

            if (theme == 'ColorTheme') {
                grad.addColorStop(0, startColor);
                grad.addColorStop(0.17, this.color2);
                grad.addColorStop(0.43, this.color3);
                grad.addColorStop(0.66, this.color4);
                grad.addColorStop(0.8, this.color5);
                grad.addColorStop(1, stopColor);
            }
            else if (theme == 'DefaultTheme') {
                grad.addColorStop(0, startColor);
                // grad.addColorStop(0, '#fefefe');
                grad.addColorStop(0.25, this.color2);
                grad.addColorStop(0.49, this.color3);
                grad.addColorStop(0.7, this.color4);
                grad.addColorStop(0.87, this.color5);
                grad.addColorStop(1, stopColor);
            }
            else {
                grad.addColorStop(0, startColor);
                grad.addColorStop(0.28, this.color2);
                grad.addColorStop(0.49, this.color3);
                grad.addColorStop(0.7, this.color4);
                grad.addColorStop(0.87, this.color5);
                grad.addColorStop(1, stopColor);
            }

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2, false);
            ctx.fillStyle = grad;
            ctx.fill();
            Three.Gui.startColor = startColor;
            Three.Gui.stopColor = stopColor;
            Three.BackgroundRendering.startColor = startColor;
            Three.BackgroundRendering.stopColor = stopColor;
            return canvas;

        },

        positionXSliderUpdate: function (e) {
            var mesh = Three.ModelLoader.getModel();

            if ( $('#ScaleButton').hasClass('k-state-active') || $('#RotateButton').hasClass('k-state-active')) {
                $('#TranslateButton').addClass('k-state-active');
                $('#ScaleButton').removeClass('k-state-active');
                $('#RotateButton').removeClass('k-state-active');
            }
            var selectionCube = Three.ModelLoader.getSelectionCube();

            if (selectionCube) {
                Three.Utils.removeObjectFromScene(Three.scene, selectionCube);
            }
            //if (loadedModule == "DOCUMENT") {
                var originalPosition = mesh.position.clone();
                Three.Gui.positionDelta.set((e.value), originalPosition.y, originalPosition.z);
                Three.transformControls.axis = "X";
                Three.Gui.positionSliderUpdate = true;
                Three.transformControls.mode = "translate";
                Three.transformControls.object = mesh;
                Three.transformControls.dragging = true;
                Three.transformControls.pointerMove();
            //} else {
            //    mesh.position.x = e.value;
            //}
            //Three.render();
            Three.Gui.positionSliderUpdate = false;
            Three.Gui.callForUpdatingDirectLight(mesh);

        },

        positionYSliderUpdate: function (e) {
            var mesh = Three.ModelLoader.getModel();
            if ($('#ScaleButton').hasClass('k-state-active') || $('#RotateButton').hasClass('k-state-active')) {
                $('#TranslateButton').addClass('k-state-active');
                $('#ScaleButton').removeClass('k-state-active');
                $('#RotateButton').removeClass('k-state-active');
            }
            var selectionCube = Three.ModelLoader.getSelectionCube();

            if (selectionCube) {
                Three.Utils.removeObjectFromScene(Three.scene, selectionCube);
            }
            //if (loadedModule == "DOCUMENT") {
                var originalPosition = mesh.position.clone();
                Three.Gui.positionDelta.set(originalPosition.x, (e.value), originalPosition.z);
                Three.transformControls.axis = "Y";
                Three.transformControls.mode = "translate";
                Three.Gui.positionSliderUpdate = true;
                //var pointer = event.changedTouches ? event.changedTouches[0] : event;
                //var rect = Three.renderer.domElement.getBoundingClientRect();
                //var outputPoint = {
                //    x: (pointer.clientX - rect.left) / rect.width * 2 - 1,
                //    y: - (pointer.clientY - rect.top) / rect.height * 2 + 1,
                //    button: event.button
                //}
                Three.transformControls.object = mesh;
                Three.transformControls.dragging = true;
                Three.transformControls.pointerMove();
            //} else {
            //    mesh.position.y = e.value;
            //}
            //Three.render();
            Three.Gui.positionSliderUpdate = false;
            Three.Gui.callForUpdatingDirectLight(mesh);

        },

        positionZSliderUpdate: function (e) {
            var mesh = Three.ModelLoader.getModel();
            if ( $('#ScaleButton').hasClass('k-state-active') || $('#RotateButton').hasClass('k-state-active')) {
                $('#TranslateButton').addClass('k-state-active');
                $('#ScaleButton').removeClass('k-state-active');
                $('#RotateButton').removeClass('k-state-active');
            }
            var selectionCube = Three.ModelLoader.getSelectionCube();

            if (selectionCube) {
                Three.Utils.removeObjectFromScene(Three.scene, selectionCube);
            }
           // if (loadedModule == "DOCUMENT") {
                var originalPosition = mesh.position.clone();
                Three.Gui.positionDelta.set(originalPosition.x, originalPosition.y, (e.value));
                Three.transformControls.axis = "Z";
                Three.transformControls.mode = "translate";
                Three.Gui.positionSliderUpdate = true;
                Three.transformControls.object = mesh;
                Three.transformControls.dragging = true;
                Three.transformControls.pointerMove();
            //} else {
            //    mesh.position.z = e.value;
            //}
            //Three.render();
            Three.Gui.positionSliderUpdate = false;
            Three.Gui.callForUpdatingDirectLight(mesh);

        },

        rotationXSliderUpdate: function (e) {
            var mesh = Three.ModelLoader.getModel();
            if ($('#TranslateButton').hasClass('k-state-active') || $('#ScaleButton').hasClass('k-state-active')) {
                $('#RotateButton').addClass('k-state-active');
                $('#TranslateButton').removeClass('k-state-active');
                $('#ScaleButton').removeClass('k-state-active');
               
            }
            var selectionCube = Three.ModelLoader.getSelectionCube();

            if (selectionCube) {
                Three.Utils.removeObjectFromScene(Three.scene, selectionCube);
            }

            //mesh.rotation.x = e.value * Math.PI / 180;
            //var originalrotation = mesh.rotation.clone();
           // if (loadedModule == "DOCUMENT") {
                Three.Gui.rotationAngle = e.value * Math.PI / 180;
                //Three.Gui.rotateDelta.set((e.value * Math.PI / 180), originalrotation._y, originalrotation._z);
                Three.transformControls.axis = "X";
                Three.transformControls.mode = "rotate";
                Three.Gui.rotationSliderUpdate = true;
                Three.transformControls.object = mesh;
                Three.transformControls.dragging = true;
                Three.transformControls.pointerMove();
            //} else {
            //    mesh.rotation.x = e.value * Math.PI / 180;
            //}
            //Three.render();
            Three.Gui.rotationSliderUpdate = false;
        },

        rotationYSliderUpdate: function (e) {
            var mesh = Three.ModelLoader.getModel();
            if ($('#TranslateButton').hasClass('k-state-active') || $('#ScaleButton').hasClass('k-state-active')) {
                $('#RotateButton').addClass('k-state-active');
                $('#TranslateButton').removeClass('k-state-active');
                $('#ScaleButton').removeClass('k-state-active');
               
            }
            var selectionCube = Three.ModelLoader.getSelectionCube();

            if (selectionCube) {
                Three.Utils.removeObjectFromScene(Three.scene, selectionCube);
            }
            //mesh.rotation.y = e.value * Math.PI / 180;
            //if (loadedModule == "DOCUMENT") {
                Three.Gui.rotationAngle = e.value * Math.PI / 180;
                //Three.Gui.rotateDelta.set((e.value * Math.PI / 180), originalrotation._y, originalrotation._z);
                Three.transformControls.axis = "Y";
                Three.transformControls.mode = "rotate";
                Three.Gui.rotationSliderUpdate = true;
                Three.transformControls.object = mesh;
                Three.transformControls.dragging = true;
                Three.transformControls.pointerMove();
            //} else {
            //    mesh.rotation.y = e.value * Math.PI / 180;
            //}
            //Three.render();
            Three.Gui.rotationSliderUpdate = false;
        },

        rotationZSliderUpdate: function (e) {
            var mesh = Three.ModelLoader.getModel();
            if ($('#TranslateButton').hasClass('k-state-active') || $('#ScaleButton').hasClass('k-state-active')) {
                $('#RotateButton').addClass('k-state-active');
                $('#TranslateButton').removeClass('k-state-active');
                $('#ScaleButton').removeClass('k-state-active');
                
            }
            var selectionCube = Three.ModelLoader.getSelectionCube();

            if (selectionCube) {
                Three.Utils.removeObjectFromScene(Three.scene, selectionCube);
            }

            //mesh.rotation.z = e.value * Math.PI / 180;
            //if (loadedModule == "DOCUMENT") {
                Three.Gui.rotationAngle = e.value * Math.PI / 180;
                //Three.Gui.rotateDelta.set((e.value * Math.PI / 180), originalrotation._y, originalrotation._z);
                Three.transformControls.axis = "Z";
                Three.transformControls.mode = "rotate";
                Three.Gui.rotationSliderUpdate = true;
                Three.transformControls.object = mesh;
                Three.transformControls.dragging = true;
                Three.transformControls.pointerMove();
            //} else {
            //    mesh.rotation.z = e.value * Math.PI / 180;
            //}
            //Three.render();
            Three.Gui.rotationSliderUpdate = false;
        },

        setWireframe: function (mesh) {
            mesh.traverse(function (child) {
                for (var i = 0, groupChildren = child.children.length; i < groupChildren; i++) {
                    if (child.children[i] instanceof THREE.Group) {
                        for (var j = 0; j < child.children[i].children.length; j++) {
                            child.children[i].children[j].material.wireframe = Three.Gui.isWireframe;
                        }
                    } else {

                        if (child.children[i].material.length && child.children[i].material.length > 0) {
                            for (var j = 0, materialLength = child.children[i].material.length;
                                j < materialLength;
                                j++) {
                                child.children[i].material[j].wireframe = Three.Gui.isWireframe;
                            }
                        }
                        //child.children[i].material.wireframe = Three.Gui.isWireframe;
                    }
                }
                
            });
        },

        toggleWireframe: function () {
            var that = this;
            var mesh = Three.ModelLoader.getModel();
            var selectionCube = Three.ModelLoader.getSelectionCube();

            if (selectionCube) {
                Three.Utils.removeObjectFromScene(Three.scene, selectionCube);
            }

            if (Three.fileType !== ".stl") {
                Three.Gui.setWireframe(mesh);
                
            } else {
                mesh.traverse(function (child) {
                    if (child instanceof THREE.Mesh) {
                    if (child.material.length && child.material.length > 0) {
                        for (var j = 0, materialLength = child.material.length;
                            j < materialLength;
                            j++) {
                            child.material[j].wireframe = Three.Gui.isWireframe;
                        }
                    } else {
                        child.material.wireframe = Three.Gui.isWireframe;
                    }
                }
                });
            }

            

        },


        toggleBackgroundImage: function () {
            var that = this;

            if (this.isGradient) {
                this.showHideGradientToggle.click();
            }
            if (!this.isImage) {
                var loader = new THREE.TextureLoader();
                loader.crossOrigin = true;

                var theme = document.cookie.split(';').reduce((cookies, cookie) => {
                    let [name, value] = cookie.split('=').map(c => c.trim());
                    cookies[name] = value;
                    return cookies;
                }, {})["theme"];
                var texture = loader.load('/Content/3DGraphics/' + theme + '.png');
                Three.scene.background = texture;
                Three.render();
            }
            else {
                Three.scene.background = '#ffffff';
            }

            this.isImage = !this.isImage;

        },

        toggleGradient: function () {
            var that = this;
            if (this.isImage) {
                this.showHideImageToggle.click();
            }
            if (this.isGradient) {
                if (Three.Gui.gradientType == 'Radial') {
                    var texture = new THREE.Texture(Three.Gui.generateRadialTexture(this.startColor, this.stopColor));
                }
                else if (Three.Gui.gradientType == 'Linear') {
                    var texture = new THREE.Texture(Three.Gui.generateTexture(this.startColor, this.stopColor));
                }
                texture.needsUpdate = true;
                Three.scene.background = texture;
                Three.render();
            }
            else {

                Three.scene.background = '#FFFFFF';

            }
            this.isGradient = !this.isGradient;

        },

        toggleHiddenLine: function () {

            Three.SELECTED = Three.scene.getObjectByName("MainMesh");
            Three.Gui.showHiddenLine = !Three.Gui.showHiddenLine;
            //var value = $("#wireframeToggle").val();
            Three.Gui.setObjectType(Three.Gui.hiddenLineDropDownValue);
            
            
        },

        resetObject: function() {
            var mesh = Three.ModelLoader.getModel();
            var selectionCube = Three.ModelLoader.getSelectionCube();
            // var dropdownlist = $("#wireframeToggle").data("kendoDropDownList");
            // dropdownlist.value("Default");
            // if ($('#TranslateButton').hasClass('k-state-active') || $('#ScaleButton').hasClass('k-state-active') || $('#RotateButton').hasClass('k-state-active')) {
            //     $('#TranslateButton').removeClass('k-state-active');
            //     $('#ScaleButton').removeClass('k-state-active');
            //     $('#RotateButton').removeClass('k-state-active');
            // }
            // if (selectionCube) {
            //     Three.Utils.removeObjectFromScene(Three.scene, selectionCube);
            // }

            //Three.gridHelper.visible = true;
            if (!Three.gridHelper.visible) {
                this.showHideGridToggle.click()
            }

            if (this.isWireframe) {
                this.toggleWireframe();
            }

            if (Three.Gui.ghostMode) {
                this.ghostMode = false;
                Three.Utils.set3DObjectMaterial(Three.ModelLoader.getModel(), 0);
            }
            if (Three.Gui.showHiddenLine) {
                Three.Gui.showHiddenLine = !Three.Gui.showHiddenLine;
                Three.Gui.toggleHiddenLine();
            }
            if (Three.Gui.isCastShadow) {
                Three.Gui.isCastShadow = false;
                Three.ModelLoader.ambientOcclusion = false;
                Three.Utils.set3DObjectMaterial(Three.ModelLoader.getModel(), 0);
            }
           

            if (Three.fileType === "dae") {
                mesh.scale.set(0.0254, 0.0254, 0.0254);
                mesh.rotation.set(-1.5707963267948966, 0, 0);
            } else {
                mesh.scale.set(1, 1, 1);
                mesh.rotation.set(0, 0, 0);
            }

            // else if ((Three.fileType.toLowerCase().replace(".", "") != "glb") && (loadedModule == "EMS")) {
            //     mesh.scale.set(0.001, 0.001, 0.001);
            //     mesh.rotation.set(0, 0, 0);
            //     mesh.rotateX(-Math.PI / 2);
            //     mesh.rotateZ(-Math.PI / 2);

            // } 

            mesh.position.set(0, 0, 0);

            // this.scaleXSlider.value(1);
            // this.scaleYSlider.value(1);
            // this.scaleZSlider.value(1);

            // this.positionXSlider.value(0);
            // this.positionYSlider.value(0);
            // this.positionZSlider.value(0);

            // if (this.upOrientation === "z") {
            //     this.rotationXSlider.value(-90);
            // } else {
            //     this.rotationXSlider.value(0);
            // }
            // this.rotationYSlider.value(0);
            // this.rotationZSlider.value(0);

            // if (Three.fileType.toLowerCase().replace(".", "") == "glb") {
            //     if (!(ThreeD_VL.current3DModelNode.Type === "SystemSubType")) {
            //         this.setUpOrientationY();
            //     }
            // } else if (loadedModule == "EMS") {
            //     Three.Gui.setUpOrientationY();
            // }

            Three.renderer.setClearColor("#ffffff");
            Three.Utils.centerObject(mesh);
            Three.render();
        },

        centerModel: function () {
            var mesh = Three.ModelLoader.getModel();
            var selectionCube = Three.ModelLoader.getSelectionCube();

            if (selectionCube) {
                Three.Utils.removeObjectFromScene(Three.scene, selectionCube);
            }

            Three.Utils.centerObject(mesh);
            this.positionXSlider.value(0);
            this.positionYSlider.value(0);
            this.positionZSlider.value(0);
        },

        toggleGridVisibility: function () {
            Three.gridHelper.visible = !Three.gridHelper.visible;
        },

        toggleSnapToGrid: function (snapGrid) {
            if (snapGrid) {
                Three.transformControls.setTranslationSnap(1);
                Three.transformControls.setRotationSnap(THREE.Math.degToRad(15));
            } else {
                Three.transformControls.setTranslationSnap(null);
                Three.transformControls.setRotationSnap(null);
            }

            //this.snapToGrid = !this.snapToGrid;
        },

        setUpOrientationY: function () {
            Three.Utils.setUpOrientationY();
            this.upOrientation = "y";
            //this.upOrientationZ.select(0);
            //this.rotationXSlider.value(0);
        },

        setUpOrientationZ: function () {
            Three.Utils.setUpOrientationZ();
            this.upOrientation = "z";
            //this.upOrientationZ.select(1);
            //this.rotationXSlider.value(-90);
        },

        setUpOrientation: function (orientation) {

            var selectionCube = Three.ModelLoader.getSelectionCube();

            if (selectionCube) {
                Three.Utils.removeObjectFromScene(Three.scene, selectionCube);
            }

            switch (orientation) {
                case "y":
                    this.setUpOrientationY();
                    break;
                case "z":
                    this.setUpOrientationZ();
                    break;
            }

        },

        setGradientType: function (gradientType) {
            var selectionCube = Three.ModelLoader.getSelectionCube();
            if (selectionCube) {
                Three.Utils.removeObjectFromScene(Three.scene, selectionCube);
            }
            if (!this.isGradient) {
                switch (gradientType) {
                    case "Linear":
                        this.gradientType = "Linear";
                        Three.BackgroundRendering.gradientType = "Linear";
                        var texture1 = new THREE.Texture(Three.Gui.generateTexture(Three.Gui.startColor, Three.Gui.stopColor));
                        texture1.needsUpdate = true; // important!
                        Three.scene.background = texture1;
                        break;
                    case "Radial":
                        this.gradientType = "Radial";
                        Three.BackgroundRendering.gradientType = "Radial";
                        var texture2 = new THREE.Texture(Three.Gui.generateRadialTexture(Three.Gui.startColor, Three.Gui.stopColor));
                        texture2.needsUpdate = true; // important!
                        Three.scene.background = texture2;
                        break;
                }

            }
        },


        setObjectType: function (objectType) {
            var selectionCube = Three.ModelLoader.getSelectionCube();
            Three.SELECTED = Three.scene.getObjectByName("MainMesh");
            if (selectionCube) {
                Three.Utils.removeObjectFromScene(Three.scene, selectionCube);
            }
           
            switch (objectType) {
                case "Default":
                    if (!Three.gridHelper.visible) {
                         Three.gridHelper.visible = !Three.gridHelper.visible;
                     }
                    this.wireFrameToggle = "Default";

                    if (this.isWireframe) {
                        this.isWireframe = false;
                        this.toggleWireframe();
                    }
                    if (Three.Gui.ghostMode) {
                        this.ghostMode = false;
                        Three.Utils.set3DObjectMaterial(Three.ModelLoader.getModel(), 0);
                    }

                    if (Three.Gui.isCastShadow) {
                        Three.Gui.isCastShadow = false;
                        Three.ModelLoader.ambientOcclusion = false;
                        Three.Utils.set3DObjectMaterial(Three.ModelLoader.getModel(), 0);
                    }
                    if (Three.Gui.showHiddenLine) {
                        if (!Three.Gui.isWireframe) {
                            if (Three.fileType !== ".stl") {
                                // if ($("#showHiddenLineToggle").is(':checked')) {
                                Three.SELECTED.traverse(function (child) {

                                    //if (child instanceof THREE.Group) {
                                        for (var i = 0, groupChildren = child.children.length; i < groupChildren; i++) {
                                            if (child.children[i] instanceof THREE.Mesh) {
                                                var geometry = new THREE.EdgesGeometry(child.children[i].geometry);
                                                var line = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: 0x000000 }));
                                                line.position.set(child.children[i].position.x, child.children[i].position.y, child.children[i].position.z);
                                                line.rotation.set(child.children[i].rotation.x, child.children[i].rotation.y, child.children[i].rotation.z);
                                                line.scale.set(child.children[i].scale.x, child.children[i].scale.y, child.children[i].scale.z);
                                                line.up.set(child.children[i].up.x, child.children[i].up.y, child.children[i].up.z);
                                                //line.position.set(child.children[i].position.x, child.children[i].position.y, child.children[i].position.z);
                                            }
                                            
                                            child.add(line);
                                            if (!child.children[i].visible) {
                                                child.children[i].visible = true;
                                            }
                                        }
                                    //}

                                });
                            } else {
                                Three.SELECTED.traverse(function (child) {
                                    if (child instanceof THREE.Mesh) {
                                        var geometry = new THREE.EdgesGeometry(child.geometry);
                                        var line = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: 0x000000 }));
                                        child.add(line);
                                        
                                    }

                                    if (child.material.length && child.material.length > 0) {
                                        for (var j = 0, materialLength = child.material.length;
                                            j < materialLength;
                                            j++) {
                                            child.material[j].visible = true;
                                        }
                                    } else {
                                        child.material.visible = true;
                                    }
                                    
                                   
                                });
                            }
                            //Three.Gui.showHiddenLine = !Three.Gui.showHiddenLine;

                        }
                        else {
                            if (Three.fileType !== ".stl") {
                                Three.SELECTED.traverse(function (child) {
                                    if (child instanceof THREE.Group) {
                                        for (var i = (child.children.length) - 1; i > 0; i--) {
                                            if (child.children[i] instanceof THREE.LineSegments) {

                                                if (child.children[i].geometry.type == "EdgesGeometry") {
                                                    child.children[i].parent.remove(child.children[i]);
                                                }
                                            }
                                        }

                                    }
                                });
                            } else {
                                Three.SELECTED.traverse(function (child) {
                                    if (child instanceof THREE.Mesh) {
                                        for (var i = (child.children.length) - 1; i >= 0; i--) {
                                            if (child.children[i] instanceof THREE.LineSegments) {
                                                if (child.children[i].geometry.type == "EdgesGeometry") {
                                                    child.children[i].parent.remove(child.children[i]);
                                                }
                                            }
                                        }
                                    }
                                });

                            }
                        }
                    } else {
                        Three.SELECTED.traverse(function (child) {
                            if (child instanceof THREE.Group) {

                                for (var i = (child.children.length) - 1; i >= 0; i--) {
                                    if (child.children[i] instanceof THREE.LineSegments) {
                                        if (child.children[i].geometry.type == "EdgesGeometry") {
                                            child.children[i].parent.remove(child.children[i]);
                                        }
                                    } else {
                                        child.children[i].visible = true;
                                    }


                                }
                            } else {
                                for (var i = (child.children.length) - 1; i >= 0; i--) {
                                    if (child.children[i] instanceof THREE.LineSegments) {
                                        if (child.children[i].geometry.type == "EdgesGeometry") {
                                            child.children[i].parent.remove(child.children[i]);
                                        }
                                    } else {
                                        child.children[i].visible = true;
                                    }


                                }
                            }
                        });

                    }
                    this.isCastShadow = false;
                    this.ghostMode = false;
                    Three.ModelLoader.ambientOcclusion = false;
                    Three.Utils.set3DObjectMaterial(Three.SELECTED, 0);
                    if ($('#ThreeDFilterStatus').hasClass("k-state-active")) {
                        $('#ThreeDFilterStatus').removeClass("k-state-active");
                    }
                    break;
                case "Wireframe":
                    if (!Three.gridHelper.visible) {
                        Three.gridHelper.visible = !Three.gridHelper.visible;
                    }
                    this.wireFrameToggle = "Wireframe";
                    this.isCastShadow = false;
                    Three.ModelLoader.ambientOcclusion = false;
                    this.isWireframe = true;
                    Three.Utils.set3DObjectMaterial(Three.SELECTED, 0);
                    this.toggleWireframe();
                    
                    if (Three.Gui.showHiddenLine) {

                        if (Three.fileType !== ".stl") {
                            Three.SELECTED.traverse(function (child) {
                                if (child instanceof THREE.Group) {
                                    for (var i = (child.children.length) - 1; i > 0; i--) {
                                        if (child.children[i] instanceof THREE.LineSegments) {
                                            if (child.children[i].geometry.type == "EdgesGeometry") {
                                                child.children[i].parent.remove(child.children[i]);
                                            }

                                        }
                                    }

                                } else {
                                     for (var i = (child.children.length) - 1; i > 0; i--) {
                                        if (child.children[i] instanceof THREE.LineSegments) {
                                            if (child.children[i].geometry.type == "EdgesGeometry") {
                                                child.children[i].parent.remove(child.children[i]);
                                            }

                                        }
                                    }
                                }
                            });
                        } else {
                            Three.SELECTED.traverse(function (child) {
                                if (child instanceof THREE.Mesh) {
                                    for (var i = (child.children.length) - 1; i >= 0; i--) {
                                        if (child.children[i] instanceof THREE.LineSegments) {
                                            if (child.children[i].geometry.type == "EdgesGeometry") {
                                                child.children[i].parent.remove(child.children[i]);
                                            }
                                        }
                                    }
                                }

                            });
                        }

                        this.showHiddenLineToggle.click();


                    } else {

                    }

                    break;
                case "Cast Shadow":
                    if (Three.gridHelper.visible) {
                         Three.gridHelper.visible = !Three.gridHelper.visible;
                     }
                    this.wireFrameToggle = "Cast Shadow";
                    if (this.isWireframe) {
                        this.isWireframe = false;
                        this.toggleWireframe();
                    }
                    this.isCastShadow = true;
                    if (typeof FilterStatusesLogic != "undefined") {
                        FilterStatusesLogic.setStatusVisible(false);
                    }
                    Three.ModelLoader.ambientOcclusion = true;
                    //Three.Gui.showHiddenLine = !Three.Gui.showHiddenLine;
                    Three.ModelLoader.loadNewTextureHdr(function () {
                        if(!Three.SELECTED){
                            Three.SELECTED = Three.scene.getObjectByName("MainMesh");
                        }

                        var BBhelper = new THREE.BoxHelper(Three.SELECTED);
                        if (!BBhelper.geometry.boundingSphere) {
                            BBhelper.geometry.computeBoundingSphere();
                        }
                        var BSphere = BBhelper.geometry.boundingSphere;

                        if (!Three.Gui.showHiddenLine) {
                            if (Three.fileType !== ".stl") {
                                Three.SELECTED.traverse(function (child) {
                                    if (child instanceof THREE.Group) {
                                        if(child.children.length > 0){
                                        for (var i = (child.children.length) - 1; i > 0; i--) {
                                            if (child.children[i] instanceof THREE.LineSegments) {
                                                if (child.children[i].geometry.type == "EdgesGeometry") {
                                                    child.children[i].parent.remove(child.children[i]);
                                                }
                                            }
                                        }
                                    }

                                    } else {
                                        if(child.children.length > 0){
                                        for (var i = (child.children.length) - 1; i > 0; i--) {
                                            if (child.children[i] instanceof THREE.LineSegments) {
                                                if (child.children[i].geometry.type == "EdgesGeometry") {
                                                    child.children[i].parent.remove(child.children[i]);
                                                }
                                            }
                                        }
                                    }
                                    }
                                });
                            } else {
                                Three.SELECTED.traverse(function (child) {
                                    if (child instanceof THREE.Mesh) {
                                        for (var i = (child.children.length) - 1; i >= 0; i--) {
                                            if (child.children[i] instanceof THREE.LineSegments) {
                                                if (child.children[i].geometry.type == "EdgesGeometry") {
                                                    child.children[i].parent.remove(child.children[i]);
                                                }
                                            }
                                        }
                                    }

                                });
                            }

                        } else {
                            if (Three.fileType !== ".stl") {
                                // if ($("#showHiddenLineToggle").is(':checked')) {
                                Three.SELECTED.traverse(function (child) {

                                    //if (child instanceof THREE.Group) {
                                        for (var i = 0, groupChildren = child.children.length; i < groupChildren; i++) {
                                            if (child.children[i] instanceof THREE.Mesh) {
                                                var geometry = new THREE.EdgesGeometry(child.children[i].geometry);
                                                var line = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: 0x000000 }));
                                                line.position.set(child.children[i].position.x, child.children[i].position.y, child.children[i].position.z);
                                                line.rotation.set(child.children[i].rotation.x, child.children[i].rotation.y, child.children[i].rotation.z);
                                                line.scale.set(child.children[i].scale.x, child.children[i].scale.y, child.children[i].scale.z);
                                                line.up.set(child.children[i].up.x, child.children[i].up.y, child.children[i].up.z);
                                            } 
                                            child.add(line);
                                            if (!child.children[i].visible) {
                                                child.children[i].visible = true;
                                            }
                                        }
                                    //}

                                });
                            } else {
                                Three.SELECTED.traverse(function (child) {
                                    if (child instanceof THREE.Mesh) {
                                        var geometry = new THREE.EdgesGeometry(child.geometry);
                                        var line = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: 0x000000 }));
                                        child.add(line);
                                       
                                    }
                                    if (child.material.length && child.material.length > 0) {
                                        for (var j = 0, materialLength = child.material.length;
                                            j < materialLength;
                                            j++) {
                                            child.material[j].visible = true;
                                        }
                                    } else {
                                        child.material.visible = true;
                                    }
                                });
                            }

                        }
                        if(Three.fileType === ".glb"){

                        Three.Utils.set3DObjectMaterial(Three.SELECTED, 3);
                       
                      
                        }
                        Three.Gui.updateDirectionalLightForShadows(BSphere);
                    

                    });


                    break;
                case "Ghost Mode":
                    if (!Three.gridHelper.visible) {
                        Three.gridHelper.visible = !Three.gridHelper.visible;
                    }
                    this.wireFrameToggle = "Ghost Mode";
                    if (this.isWireframe) {
                        this.isWireframe = false;
                        this.toggleWireframe();
                    }
                    if ($('#ThreeDFilterStatus').hasClass("k-state-active")) {
                        $('#ThreeDFilterStatus').removeClass("k-state-active");
                    }
                    this.ghostMode = true;
                    this.isCastShadow = false;
                    Three.ModelLoader.ambientOcclusion = false;
                    if (!Three.Gui.showHiddenLine) {
                        if (Three.fileType !== ".stl") {
                            Three.SELECTED.traverse(function (child) {
                                if (child instanceof THREE.Group) {
                                    for (var i = (child.children.length) - 1; i > 0; i--) {
                                        if (child.children[i] instanceof THREE.LineSegments) {
                                            if (child.children[i].geometry.type == "EdgesGeometry") {
                                                child.children[i].parent.remove(child.children[i]);
                                            }
                                        }
                                    }

                                } else {
                                    for (var i = (child.children.length) - 1; i > 0; i--) {
                                        if (child.children[i] instanceof THREE.LineSegments) {
                                            if (child.children[i].geometry.type == "EdgesGeometry") {
                                                child.children[i].parent.remove(child.children[i]);
                                            }
                                        }
                                    }
                                }
                            });
                        } else {
                            Three.SELECTED.traverse(function (child) {
                                if (child instanceof THREE.Mesh) {
                                    for (var i = (child.children.length) - 1; i >= 0; i--) {
                                        if (child.children[i] instanceof THREE.LineSegments) {
                                            if (child.children[i].geometry.type == "EdgesGeometry") {
                                                child.children[i].parent.remove(child.children[i]);
                                            }
                                        }
                                    }
                                }

                            });
                        }
                        
                    } else {
                        if (Three.fileType !== ".stl") {
                            // if ($("#showHiddenLineToggle").is(':checked')) {
                            Three.SELECTED.traverse(function (child) {

                               
                                    for (var i = 0, groupChildren = child.children.length; i < groupChildren; i++) {
                                        if (child.children[i] instanceof THREE.Mesh) {
                                            var geometry = new THREE.EdgesGeometry(child.children[i].geometry);
                                            var line = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: 0x000000 }));
                                            line.position.set(child.children[i].position.x, child.children[i].position.y, child.children[i].position.z);
                                            line.rotation.set(child.children[i].rotation.x, child.children[i].rotation.y, child.children[i].rotation.z);
                                            line.scale.set(child.children[i].scale.x, child.children[i].scale.y, child.children[i].scale.z);
                                            line.up.set(child.children[i].up.x, child.children[i].up.y, child.children[i].up.z);
                                        } 
                                        child.add(line);
                                        if (!child.children[i].visible) {
                                            child.children[i].visible = true;
                                        }
                                    }
                                //}

                            });
                        } else {
                            Three.SELECTED.traverse(function (child) {
                                if (child instanceof THREE.Mesh) {
                                    var geometry = new THREE.EdgesGeometry(child.geometry);
                                    var line = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: 0x000000 }));
                                    child.add(line);
                                    
                                }
                                if (child.material.length && child.material.length > 0) {
                                    for (var j = 0, materialLength = child.material.length;
                                        j < materialLength;
                                        j++) {
                                        child.material[j].visible = true;
                                    }
                                } else {
                                    child.material.visible = true;
                                }
                            });
                        }
                    }
                    Three.Utils.set3DObjectMaterial(Three.SELECTED, 1);
                    break;

                case "Hidden Line":
                    if (!Three.gridHelper.visible) {
                        Three.gridHelper.visible = !Three.gridHelper.visible;
                    }
                    this.wireFrameToggle = "Hidden Line";
                    this.hiddenLine = true;
                    this.isCastShadow = false;
                    Three.ModelLoader.ambientOcclusion = false;
                    if (this.isWireframe) {
                        this.isWireframe = false;
                        this.toggleWireframe();
                    }
                    if (!Three.Gui.showHiddenLine) {
                        //if (!($("#showHiddenLineToggle").is(':checked'))) {
                        Three.Gui.showHiddenLine = !Three.Gui.showHiddenLine;
                        this.showHiddenLineToggle.click();

                        //}
                    }
                    //var mesh = Three.SELECTED.clone();
                    if (Three.Gui.showHiddenLine) {
                        if (Three.fileType != ".stl") { 
                        Three.SELECTED.traverse(function (child) {
                            //if (child instanceof THREE.Group) {
                            for (var i = 0, groupChildren = child.children.length; i < groupChildren; i++) {
                                if (child.children[i] instanceof THREE.Mesh) {
                                    var geometry = new THREE.EdgesGeometry(child.children[i].geometry);
                                    var line = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: 0x000000 }));
                                    line.position.set(child.children[i].position.x, child.children[i].position.y, child.children[i].position.z);
                                    line.rotation.set(child.children[i].rotation.x, child.children[i].rotation.y, child.children[i].rotation.z);
                                    line.scale.set(child.children[i].scale.x, child.children[i].scale.y, child.children[i].scale.z);
                                    line.up.set(child.children[i].up.x, child.children[i].up.y, child.children[i].up.z);
                                }
                                child.add(line);
                                if (!child.children[i].visible) {
                                    child.children[i].visible = true;
                                }
                            }
                            // }

                        });
                    } else {
                        Three.SELECTED.traverse(function (child) {
                            if (child instanceof THREE.Mesh) {
                                var geometry = new THREE.EdgesGeometry(child.geometry);
                                var line = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: 0x000000 }));
                                child.add(line);
                                
                            }
                            if (child.material.length && child.material.length > 0) {
                                for (var j = 0, materialLength = child.material.length;
                                    j < materialLength;
                                    j++) {
                                    child.material[j].visible = true;
                                }
                            } else {
                                child.material.visible = true;
                            }
                        });
                    }
                    }
                    Three.Utils.set3DObjectMaterial(Three.SELECTED, Three.scene.getObjectByName("MainMesh").statusMaterials.length + 3);


                    break;
                case "None":
                    if (!Three.gridHelper.visible) {
                        Three.gridHelper.visible = !Three.gridHelper.visible;
                    }
                    this.isCastShadow = false;
                    Three.ModelLoader.ambientOcclusion = false;
                    if (this.isWireframe) {
                        this.isWireframe = false;
                        this.toggleWireframe();
                    }

                    if (Three.Gui.showHiddenLine) {
                        if (Three.fileType !== ".stl") {
                            Three.SELECTED.traverse(function (child) {
                                //if (child instanceof THREE.Group) {
                                    for (var i = 0; i < (child.children.length); i++) {
                                        if (child.children[i] instanceof THREE.Mesh) {
                                            var geometry = new THREE.EdgesGeometry(child.children[i].geometry);
                                            var line = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: 0x000000 }));
                                            line.position.set(child.children[i].position.x, child.children[i].position.y, child.children[i].position.z);
                                            line.rotation.set(child.children[i].rotation.x, child.children[i].rotation.y, child.children[i].rotation.z);
                                            line.scale.set(child.children[i].scale.x, child.children[i].scale.y, child.children[i].scale.z);
                                            line.up.set(child.children[i].up.x, child.children[i].up.y, child.children[i].up.z);
                                            if (child.children[i].geometry.type == "BufferGeometry") {
                                                child.children[i].visible = false;
                                            }
                                            child.add(line);
                                            
                                        } 
                                    }

                                //}
                            });
                        } else {
                            Three.SELECTED.traverse(function (child) {
                                if (child instanceof THREE.Mesh) {
                                   
                                    
                                    if (child.material.length && child.material.length > 0) {
                                        for (var j = 0, materialLength = child.material.length;
                                            j < materialLength;
                                            j++) {
                                            child.material[j].visible = false;
                                        }
                                    } else {
                                        child.material.visible = false;
                                    }
                                }
                            });
                        }
                    } else {
                        if (Three.fileType !== ".stl") {
                            Three.SELECTED.traverse(function (child) {
                                if (child instanceof THREE.Group) {
                                    for (var i = (child.children.length) - 1; i > 0; i--) {
                                        if (child.children[i] instanceof THREE.LineSegments) {
                                            if (child.children[i].geometry.type == "EdgesGeometry") {
                                                child.children[i].parent.remove(child.children[i]);
                                            }

                                        } else {
                                            child.children[i].visible = false;
                                        }
                                        
                                    }

                                } else {
                                    for (var i = (child.children.length) - 1; i > 0; i--) {
                                        if (child.children[i] instanceof THREE.LineSegments) {
                                            if (child.children[i].geometry.type == "EdgesGeometry") {
                                                child.children[i].parent.remove(child.children[i]);
                                            }

                                        } else {
                                            child.children[i].visible = false;
                                        }
                                        
                                    }
                                }
                            });

                            Three.Utils.set3DObjectMaterial(Three.SELECTED, 0);
                        } else {
                            Three.SELECTED.traverse(function (child) {
                                if (child instanceof THREE.Mesh) {
                                    if (child.material.length && child.material.length > 0) {
                                        for (var j = 0, materialLength = child.material.length;
                                            j < materialLength;
                                            j++) {
                                            child.material[j].visible = true;
                                        }
                                    } else {
                                        child.material.visible = true;
                                    }
                                }
                            });
                            Three.SELECTED.traverse(function (child) {
                                if (child instanceof THREE.Mesh) {
                                    for (var i = (child.children.length) - 1; i >= 0; i--) {
                                        if (child.children[i] instanceof THREE.LineSegments) {
                                            if (child.children[i].geometry.type == "EdgesGeometry") {
                                                child.children[i].parent.remove(child.children[i]);
                                            }
                                        }
                                        
                                    }

                                }
                            });
                        }
                    }

                    break;


            };



        },



        updateDirectionalLightForShadows: function (BSphere) {
            var b = new THREE.Vector3(BSphere.center.x, BSphere.center.y, BSphere.center.z);
            var a = new THREE.Vector3(Math.sqrt(3) * BSphere.radius, Math.sqrt(3) * BSphere.radius, Math.sqrt(3) * BSphere.radius);
            var newBSpherePosition = b.add((a));
            Three.Initialize.directLight.position.set(-newBSpherePosition.x, newBSpherePosition.y, newBSpherePosition.z);
            Three.Initialize.directLight.castShadow = true;
            Three.Initialize.directLight.shadow.camera.right = BSphere.radius;
            Three.Initialize.directLight.shadow.camera.left = -BSphere.radius;
            Three.Initialize.directLight.shadow.camera.top = BSphere.radius;
            Three.Initialize.directLight.shadow.camera.bottom = -BSphere.radius;
            Three.Initialize.directLight.shadow.mapSize.height = 2048;
            Three.Initialize.directLight.shadow.mapSize.width = 2048;
            var targetObject = new THREE.Object3D();
            targetObject.position.set(BSphere.center.x, BSphere.center.y, BSphere.center.z);
            Three.scene.add(targetObject);
            Three.Initialize.directLight.target = targetObject;
            var helper = new THREE.CameraHelper(Three.Initialize.directLight.shadow.camera);
            Three.scene.add(Three.Initialize.directLight);
            Three.render();
        },


        


    }

    //if (loadedModule !== "PRODUCT") {
        return Gui;
    //}

})();
