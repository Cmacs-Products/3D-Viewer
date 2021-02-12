
var ThreeDUtils = (function () {

    function ThreeDUtils() {
        this.panStart = new THREE.Vector2();
        this.panEnd = new THREE.Vector2();
        this.panDelta = new THREE.Vector2();

        this.dollyStart = new THREE.Vector2();
        this.dollyEnd = new THREE.Vector2();
        this.dollyDelta = new THREE.Vector2();
        this.zoomSpeed = 1.0;
      this.panSpeed = 1.0;



      this.mousedown = false;
      this.mousemove = false;
      this.touchdown = false;
      this.touchmove = false;
      this.last_mousex = 0;
      this.last_mousey = 0;
      this.last_touchx = 0;
      this.last_touchy = 0;
      this.mousex = 0;
      this.mousey = 0;
      this.touchx = 0;
      this.touchy = 0;
      this.panPosition = {
        dx: 0,
        dy: 0
      };
      this.zoomPosition = {
        dx: 0,
        dy: 0,
        dz: 0

      };
      this.scaleMultiplier;
      this.zoomScale = true;
      this.zoomActive = true;
    }

    ThreeDUtils.prototype = {

        constructor: ThreeDUtils,

        isGridVisible: function () {
            var grid = Three.scene.getObjectByName("Grid");
            return grid.visible;
        },

        hideGrid: function hideGrid(hideGrid) {
            var grid = Three.scene.getObjectByName("Grid");
            grid.visible = false;
        },

        showGrid: function showGrid(hideGrid) {
            var grid = Three.scene.getObjectByName("Grid");
            grid.visible = true;
        },

        vectorPrint: function vectorPrint(v) {

            alert(" vx = " + v[0] + " vy = " + v[1] + " vz = " + v[2])
        },
               

        getNav: function getNav() {
            return Three.navScene.getObjectByName("NavigationCube");
        },

        triggerCanvasExport: function () {
            Three.getImageData = true;
        },

        exportCanvas: function exportCanvas(imgData) {
            var that = this;
            if (Three.ThreeDTagUtils.isTagMode) {
                Three.ThreeDTagUtils.dataUrltoFile(imgData, 'ModelExport.png', 'image/png');
            } else {
                var a = document.createElement("a");
                a.href = imgData;
                a.download = "ModelExport.png";
                a.target = '_parent';
                (document.body || document.documentElement).appendChild(a);
                a.click();
                a.parentNode.removeChild(a);
            }
                 
            Three.ThreeDTagUtils.isTagMode = false;         
        },

        setUpOrientationZ: function setUpOrientationZ() {
            var mesh = Three.ModelLoader.getModel();
            mesh.rotation.set(-Math.PI / 2, 0, 0);
        },

        setUpOrientationY: function setUpOrientationY() {
            var mesh = Three.ModelLoader.getModel();
            mesh.rotation.set((Math.PI / 2) / 90, 0, 0);
      },


      onMouseDown: function (e) {
        if (Three.Utils.zoomActive) {
          var canvas = document.getElementById('ThreeJS');
          var offsetx = $(canvas).offset().left;
          var offsety = $(canvas).offset().top;
          Three.Utils.last_mousex = parseInt(e.clientX - offsetx);
          Three.Utils.last_mousey = parseInt(e.clientY - offsety);
          Three.Utils.mousedown = true;
        }

      },

      onMouseUp: function (e) {
        Three.Utils.mousedown = false;
        document.getElementById('transparentDiv').remove();
        Three.controls.enabled = true;
        if (Three.Utils.mousemove) {
          Three.Utils.panZoomToRectangle(Three.Utils.last_mousex,
            Three.Utils.last_mousey,
            Three.Utils.mousex,
            Three.Utils.mousey);
          Three.Utils.mousemove = false;

        }
        if (Three.Utils.zoomActive) {
          $('#ZoomButton').click();
        }

      },

      onMouseMove: function (e) {
        var canvas = document.getElementById('ThreeJS').childNodes[1];
        var $ctx = $('#ThreeJS').children()[1];
        var x = $ctx.getContext('2d');
        var offsetx = $(canvas).offset().left;
        var offsety = $(canvas).offset().top;
        Three.Utils.mousex = parseInt(e.clientX - offsetx);
        Three.Utils.mousey = parseInt(e.clientY - offsety);

        if (Three.Utils.mousedown) {
          x.clearRect(0, 0, canvas.width, canvas.height); //clear canvas
          x.beginPath();
          var width = Three.Utils.mousex - Three.Utils.last_mousex;
          var height = Three.Utils.mousey - Three.Utils.last_mousey;
          x.setLineDash([5]);
          x.rect(Three.Utils.last_mousex, Three.Utils.last_mousey, width, height);
          x.strokeStyle = 'black';
          x.lineWidth = 2;
          x.stroke();
          Three.Utils.mousemove = true;

        }


      },
      onTouchStart: function (e) {
        var canvas = document.getElementById('ThreeJS');
        var offsetx = $(canvas).offset().left;
        var offsety = $(canvas).offset().top;
        Three.Utils.last_touchx = parseInt(e.originalEvent.touches[0].clientX - offsetx);
        Three.Utils.last_touchy = parseInt(e.originalEvent.touches[0].clientY - offsety);
        Three.Utils.touchdown = true;

      },
      onTouchEnd: function (e) {
        Three.Utils.touchdown = false;
        document.getElementById('transparentDiv').remove();
        Three.controls.enabled = true;
        if (Three.Utils.touchmove) {
          Three.Utils.panZoomToRectangle(Three.Utils.last_touchx,
            Three.Utils.last_touchy,
            Three.Utils.touchx,
            Three.Utils.touchy);
          Three.Utils.touchmove = false;
        }
        if (Three.Utils.zoomActive) {
          $('#ZoomButton').click();
        }
      },
      onTouchMove: function (e) {
        var canvas = document.getElementById('ThreeJS').childNodes[1];
        var $ctx = $('#ThreeJS').children()[1];
        var x = $ctx.getContext('2d');
        var offsetx = $(canvas).offset().left;
        var offsety = $(canvas).offset().top;
        Three.Utils.touchx = parseInt(e.originalEvent.touches[0].clientX - offsetx);
        Three.Utils.touchy = parseInt(e.originalEvent.touches[0].clientY - offsety);

        if (Three.Utils.touchdown) {
          x.clearRect(0, 0, canvas.width, canvas.height); //clear canvas
          x.beginPath();
          var width = Three.Utils.touchx - Three.Utils.last_touchx;
          var height = Three.Utils.touchy - Three.Utils.last_touchy;
          x.rect(Three.Utils.last_touchx, Three.Utils.last_touchy, width, height);
          x.strokeStyle = 'black';
          x.lineWidth = 2;
          x.stroke();
          Three.Utils.touchmove = true;
        }

      },

      boxZoom: function (e) {
        var canvas = document.getElementById('ThreeJS');
        var transparentDiv = document.createElement('canvas');
        transparentDiv.id = "transparentDiv";
        transparentDiv.height = Three.container.clientHeight;
        transparentDiv.width = Three.container.clientWidth;
        var width = Three.container.clientWidth;
        var height = Three.container.clientHeight;

        document.getElementById('ThreeJS').appendChild(transparentDiv);
        var el = document.getElementById('transparentDiv');
        document.getElementById('transparentDiv').setAttribute("style",
          "width:" +
          width +
          "px; margin-left:-" +
          width +
          "px; height:" +
          height +
          "px;margin-top: 0; z-index:2");
        el.style.position = 'absolute';

        Three.controls.enabled = false;
        $("#transparentDiv").on("mousedown",
          function (e) {
            Three.Utils.onMouseDown(e);
            $("#transparentDiv").on("mousemove", Three.Utils.onMouseMove);
          });
        //$("#transparentDiv").on("mousedown", that.onMouseDown);
        //$("#transparentDiv").on("mousemove", that.onMouseMove);
        $("#transparentDiv").on("mouseup", Three.Utils.onMouseUp);
        $("#transparentDiv").on("touchstart", Three.Utils.onTouchStart);
        $("#transparentDiv").on("touchmove", Three.Utils.onTouchMove);
        $("#transparentDiv").on("touchend", Three.Utils.onTouchEnd);

      },

      stopBoxZoom: function () {
        Three.Utils.mousedown = false;
        Three.Utils.mousemove = false;

      },

      setBackgroundTexture: function (e) {
        if (e == 'radial') {
          var texture = new THREE.Texture(Three.BackgroundRendering.generateRadialTexture(Three.BackgroundRendering.startColor, Three.BackgroundRendering.stopColor));
        }
        else if (e == 'linear') {
          var texture = new THREE.Texture(Three.BackgroundRendering.generateTexture(Three.BackgroundRendering.startColor, Three.BackgroundRendering.stopColor));
        }
        texture.needsUpdate = true;
        Three.scene.background = texture;
      },

        destroyMesh: function destroyMesh(id) {
            if (typeof (id) !== "undefined") {
                Three.scene.remove(Three.scene.getObjectById(id))
            } else {
                existingMesh = Three.scene.getObjectByName("MainMesh");
                if (typeof (existingMesh) !== "undefined") {
                    Three.scene.remove(existingMesh)
                }
            }
            Three.Utils.remove3DSelection();
            remainingMesh=Three.scene.getObjectByName("MainMesh");

            // if (loadedModule == "EMS" && (typeof (remainingMesh) === "undefined")) { //hide the EMS viewer
            //     //$('#CASTViewer').addClass("hidden");
            //     //$("#3DView").addClass("hidden")
            // }
        },
        
        remove3DSelection: function (objectName, forceVisible)
        {
            if (typeof forceVisible === "undefined") {
                forceVisible = true;
            }

            Three.SELECTED = "";
            if (Three.Gui && Three.Gui.ghostMode) {
                Three.Utils.reset3DObjectMaterial(objectName, 0);
            } else {
                Three.Utils.reset3DObjectMaterial(objectName, 2, forceVisible);
            }
        },

        select3DObjects: function select3DObjects(objectNames){
            Three.Utils.remove3DSelection("MainMesh",false);
            let selected = this.getObjectsFromNames(objectNames);

            if (selected.length<1 || Three.Gui.isCastShadow == true || Three.Gui.hiddenLine) {
                return;
            }
            
            if (Three.Gui.ghostMode) {
                selected.forEach(obj=>Three.Utils.set3DObjectMaterial(obj, 0));
            } 
            else {
                selected.forEach(obj=>Three.Utils.set3DObjectMaterial(obj, 2));
            }
        },

        select3DObject: function select3DObject(objectName) {
            Three.Utils.remove3DSelection("MainMesh",false);
            Three.SELECTED = Three.scene.getObjectById(objectName);

            if (typeof (Three.SELECTED) === "undefined") {
                Three.SELECTED = Three.scene.getObjectByName(objectName);
            }

            if (typeof (Three.SELECTED) === "undefined") {
                return;
            }
            Three.selectedKeep = Three.SELECTED;
            if (loadedModule == "PRODUCT" || Three.Gui.isCastShadow == true || Three.Gui.hiddenLine) {
                return;
            }
            
            if (Three.Gui.ghostMode) {
                //Three.Utils.set3DObjectMaterial(Three.ModelLoader.getModel(), 1);
                Three.Utils.set3DObjectMaterial(Three.SELECTED, 0);
            } 
            else {
                Three.Utils.set3DObjectMaterial(Three.SELECTED, 2);
            }
            //if (loadedModule == "DOCUMENT") {
            //    Three.Utils.set3DObjectMaterial
            //}
            
        },

        set3DObjectMaterial: function(object, materialSet, setVisible) {
            if (Three.DocumentEventHandler.showAllElementsWithSubtype) { return; }
            var setVisible = setVisible;
            if (typeof setVisible === "undefined") {
                setVisible = true;
            }

            var materialSet = materialSet;

            Three.Utils.traverseMesh(
                object,
                function (group) {
                    Three.Utils.setGroupMaterial(group, materialSet, setVisible);
                },
                function (mesh) {
                    Three.Utils.setMeshMaterial(mesh, materialSet, setVisible);
                }
            );
        },

        setGroupMaterial: function (group, materialSet, setVisible) {
            group.oldMaterialSet = group.materialSet;
            group.materialSet = materialSet;
            if (setVisible) {
                group.visible = true;
            }
        },

        setMeshMaterial: function (mesh, materialSet, setVisible) {
            var multiMaterial = mesh.material;
            if (mesh.dummyMaterial) {
                multiMaterial = mesh.dummyMaterial.materials;
            }

            var chosenMaterial = multiMaterial[materialSet];
            if (!chosenMaterial) {
                chosenMaterial = mesh.material;
            }

            var opacity = chosenMaterial.opacity;

            if (Three.Gui.isCastShadow) {
                if(Three.ModelLoader.envMap){
                chosenMaterial.envMap = Three.ModelLoader.envMap.texture;
                chosenMaterial.envMapIntensity = 2;
                chosenMaterial.needsUpdate = true;
                }else{
                    Three.ModelLoader.loadNewTextureHdr(function(){
                        chosenMaterial.envMap = Three.ModelLoader.envMap.texture;
                        chosenMaterial.envMapIntensity = 2;
                        chosenMaterial.needsUpdate = true;

                    });
                }

            } else {
                chosenMaterial.envMap = null;
                chosenMaterial.envMapIntensity = 1;

            }

            if (opacity == 1) {
                mesh.castShadow = Three.Gui.isCastShadow;
                mesh.receiveShadow = Three.Gui.isCastShadow;
            }

            mesh.oldMaterialSet = mesh.materialSet;
            mesh.materialSet = materialSet;
            if (setVisible) {
                mesh.visible = true;
            }

           

            if (mesh.geometry && mesh.geometry.groups && mesh.geometry.groups.length > 0 && mesh.geometry.groupSets) {
                mesh.geometry.groups = mesh.geometry.groupSets[mesh.materialSet];
            } else {
                mesh.material = chosenMaterial;
            }
        

        },

        reset3DObjectMaterial: function (objectName, RemoveMaterialSet, forceVisible) {
            if (Three.DocumentEventHandler.showAllElementsWithSubtype) { return; }
            //if (loadedModule == "EMS") {
            let currentMesh = Three.scene.getObjectByName(objectName);
            if (currentMesh) {
                Three.Utils.traverseMesh(
                    currentMesh,
                    function (group) {
                       if (group.materialSet == RemoveMaterialSet) {
                            if (Three.Gui.ghostMode) {
                                group.materialSet = (typeof group.oldMaterialSet === "undefined") ? 1 : group.oldMaterialSet;
                            } else {
                                group.materialSet = (typeof group.oldMaterialSet === "undefined") ? 0 : group.oldMaterialSet;
                            }
                            
                        }
                        if (forceVisible) { group.visible = true;}
                    },
                    function (mesh) {
                       if (mesh.materialSet == RemoveMaterialSet) {
                            if (Three.Gui.ghostMode) {
                                mesh.materialSet = (typeof mesh.oldMaterialSet === "undefined") ? 1 : mesh.oldMaterialSet;
                            } else {
                                mesh.materialSet = (typeof mesh.oldMaterialSet === "undefined") ? 0 : mesh.oldMaterialSet;
                            }
                            if (mesh.geometry.groups && mesh.geometry.groups.length > 0 && mesh.geometry.groupSets) {
                                mesh.geometry.groups = mesh.geometry.groupSets[mesh.materialSet];
                            } else {
                                mesh.material = mesh.dummyMaterial.materials[mesh.materialSet];
                            }
                        }
                        if (forceVisible) { mesh.visible = true; }
                    }
                );
            }

        },


        resetObjectMaterial: function (objectName, RemoveMaterialSet, forceVisible) {
            if (Three.DocumentEventHandler.showAllElementsWithSubtype) { return; }
            //if (loadedModule == "EMS") {
            let currentMesh = Three.scene.getObjectByName(objectName);
            if (currentMesh) {
                Three.Utils.traverseMesh(
                    currentMesh,
                    function (group) {
                      // if (group.materialSet == RemoveMaterialSet) {
                            if (Three.Gui.ghostMode) {
                                group.materialSet = (typeof group.oldMaterialSet === "undefined") ? 1 : group.oldMaterialSet;
                            } else {
                                group.materialSet = (typeof group.oldMaterialSet === "undefined") ? 0 : group.oldMaterialSet;
                            }
                            
                       // }
                        if (forceVisible) { group.visible = true;}
                    },
                    function (mesh) {
                      // if (mesh.materialSet == RemoveMaterialSet) {
                            if (Three.Gui.ghostMode) {
                                mesh.materialSet = (typeof mesh.oldMaterialSet === "undefined") ? 1 : mesh.oldMaterialSet;
                            } else {
                                mesh.materialSet = (typeof mesh.oldMaterialSet === "undefined") ? 0 : mesh.oldMaterialSet;
                            }
                            if (mesh.geometry.groups && mesh.geometry.groups.length > 0 && mesh.geometry.groupSets) {
                                mesh.geometry.groups = mesh.geometry.groupSets[mesh.materialSet];
                            } else {
                                mesh.material = mesh.dummyMaterial.materials[mesh.materialSet];
                            }
                        //}
                        if (forceVisible) { mesh.visible = true; }
                    }
                );
            }

        },

        findSelected: function () {
            //Three.SELECTED = "";
           
                //Three.Utils.traverseMesh(Three.scene.getObjectByName("MainMesh"),
                //    function (group) {
                //        if (Three.Gui.ghostMode) {
                //            if (Three.SELECTED === "" && group.materialSet == 0) {
                //                Three.SELECTED = group;
                //            }
                //        }
                //        else {
                //            if (Three.SELECTED === "" && group.materialSet == 2) {
                //                Three.SELECTED = group;
                //            }
                //        }
                //    },
                //    function (mesh) {
                //        if (Three.Gui.ghostMode) {
                //            if (Three.SELECTED === "" && mesh.materialSet == 0) {
                //                Three.SELECTED = mesh;
                //            }
                //        } 
                //        else {
                //            if (Three.SELECTED === "" && mesh.materialSet == 2) {
                //                Three.SELECTED = mesh;
                //            }
                //        }
                //    }
                //);
                if (Three.SELECTED !== "") { return Three.SELECTED; }
                return;
        },

        panZoomToRectangle: function (x1, y1, x2, y2) {
            if (Three.CameraUtils.cameraMode === "PERSPECTIVE") {
                var camera = Three.DocumentEventHandler.GetCamera();
                var newAttitude = Three.Utils.FindBoxContent(x1, y1, x2, y2, Three.scene.getObjectByName("MainMesh"));
                camera.position.set(newAttitude[0].x, newAttitude[0].y, newAttitude[0].z);
                Three.controls.target.set(newAttitude[1].x, newAttitude[1].y, newAttitude[1].z);
                camera.updateProjectionMatrix();
            } else {
                var dx = x2 - x1; //width of the rectangular box
                var dy = y2 - y1; //height of the reactangular box
                var widthx = dx / Three.container.clientWidth;
                var heighty = dy / Three.container.clientHeight;
                Three.controls.dollyOut(Math.max(widthx, heighty));
                var x = 0.5 * (x2 + x1);
                var y = 0.5 * (y2 + y1);
                var xWidth = 0.5 * (Three.container.clientWidth);
                var yHeight = 0.5 * (Three.container.clientHeight);
                var xDifference = (xWidth - x) / Math.max(widthx, heighty);
                var yDifference = (yHeight - y) / Math.max(widthx, heighty);
                Three.controls.pan(xDifference, yDifference);
                Three.controls.update();
            }
        },


        removeExisting3DTween: function () {
            if (Three.camera.SecundaryTweenMovement) {
                Three.camera.SecundaryTweenMovement.stop();
                delete Three.camera.SecundaryTweenMovement
            }
            if (Three.camera.TweenMovement) {
                Three.camera.TweenMovement.stop();
                delete Three.camera.TweenMovement;
            }
            delete Three.camera.SphereCoors;
        },

        switchToOrthoZoom: function () {
            var defaultCube = new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 1)); // having a non-centered model generates a nicer view
            this.selected = Three.Utils.findSelected() || Three.scene.getObjectByName("MainMesh") || defaultCube;

            var BBhelper = new THREE.BoxHelper(this.selected);
            if (!BBhelper.geometry.boundingSphere) {
                BBhelper.geometry.computeBoundingSphere();
            }
            var BSphere = BBhelper.geometry.boundingSphere;

            Three.camera.cameraO.zoom = (Math.min(Three.renderer.getSize().width, Three.renderer.getSize().height) / BSphere.radius) / (Three.DocumentEventHandler.GetCamera().position.distanceTo(BSphere.center) / BSphere.radius);
            Three.camera.updateProjectionMatrix();
        },

        getObjectsFromNames(names){
            let selected = [];
            if (Array.isArray(names)){ // array with names
                names.forEach(name =>
                    {
                        let object = Three.scene.getObjectByName(name);
                        if (object){
                            selected.push(object);
                        }
                    });
            }
            return selected;
        },

        zoomToObject: function (params) { // params: {selectedName(s), target, duration, theta, phi}

            //------------------------------------------------------------
            //
            // "Zoom & Rotate Tween"
            // By RvdV
            // 
            // To put a selected object into focus, even though it may be 
            // on the other side of the showing 3D model, we need to both 
            // zoom and rotate. 
            //
            // To maintain the spatial awareness of the user, this should 
            // happen in a smooth motion (or tween). 
            //
            //------------------------------------------------------------

            // read the input or use default
            // if (loadedModule == "PRODUCT" || Three.Gui.isCastShadow == true) {
            //     return;
            // }
            this.params = params || {};
            //console.log(params)
            this.duration = this.params.duration || 1000; // (ms)
            var defaultCube = new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 1)); // having a non-centered model generates a nicer view
            
            // handle a list of objects
            var selected = new THREE.Group();
            if (this.params.selectedName && Array.isArray(this.params.selectedName) ){ // array with names
                let objects = this.getObjectsFromNames(this.params.selectedName);
                if(objects.length == 0) { // no objects at all
                    selected = (Three.scene.getObjectByName("MainMesh") || defaultCube);
                } else {
                    for (let i=0; i<objects.length; i++){
                        let clone = objects[i].clone();
                        clone.applyMatrix(objects[i].parent.matrixWorld);
                        selected.add(clone);
                    }
                    // selected = objects.forEach(obj=>selected.add(obj.clone()));
                }
            } else { // not an array
                selected = Three.scene.getObjectByName(this.params.selectedName) || Three.Utils.findSelected() || Three.scene.getObjectByName("MainMesh") || defaultCube;
            }

            // Now let's start off with arranging some objects in our favor:

            var BBhelper = new THREE.BoxHelper(selected);
            if (!BBhelper.geometry.boundingSphere) {
                BBhelper.geometry.computeBoundingSphere();
            }
            var BSphere = BBhelper.geometry.boundingSphere;
            var selectedCentroid = BSphere.center.clone();

            // set the center of the view (Three.controls.target)
            this.FinalTarget = this.params.target || selectedCentroid.clone()

            // set the view direction 
            if (((typeof (this.params.phi) !== "undefined") && (typeof (this.params.theta) !== "undefined"))) {
                if (this.params.phi <= 0.000001) {
                    var normVector = (new THREE.Vector3).setFromSpherical(new THREE.Spherical(1, 0.000001, this.params.theta));
                }
                else if (this.params.phi >= (Math.PI - 0.000001)) {
                    var normVector = (new THREE.Vector3).setFromSpherical(new THREE.Spherical(1, (Math.PI - 0.000001), this.params.theta));
                }
                else {
                    var normVector = (new THREE.Vector3).setFromSpherical(new THREE.Spherical(1, this.params.phi, this.params.theta));
                }
            } else {
                var normVector = BSphere.center.clone() // set phi to 0
                normVector.y = 0;
                if (normVector.x == 0 && normVector.z == 0) // if the vector is (0,0,0), look from the front
                {
                    normVector.z = 1;
                }
                normVector.normalize();
            }

            if (Three.CameraUtils.cameraMode !== "PERSPECTIVE") {
                normVector = new THREE.Vector3(-normVector.x, -normVector.y, -normVector.z);
                Three.DocumentEventHandler.GetCamera().near = 0.1;
            }

            var aspect = Three.DocumentEventHandler.GetCamera().aspect;
            if (aspect == "NaN") {
                aspect = 1;
            }

            // to calculate the new camera position
            // the follwoing equation calculate the distance between the 
            // selected object and the camera:
            //  ~ Three.camera.near: is added near the end to make sure the 
            //    selected object is not too close to the camera to render
            //  ~ BSphere.radius * (1 / Math.sin(...angle...)): is the 
            //    distance needed to fit the bounding sphere, which is the
            //    hypothenuse of a right triangle (hence the (1/sin)), where:
            //    - the angle is half the view angle (Three.camera.fov/2)
            //    - the hypothenuse is the line between camera and BSphere.center
            //    - the right angle is at the point where the BSphere surface 
            //      is tangent with the view (projection) (, and the normal at
            //      that point goes through BSphere.center)
            //    - the BSphere.radius is the opposite side, connecting the point
            //      of the right angle on the BSphere surface with its center
            //  ~ Math.max(1,(1/Three.camera.aspect)): in case the view width is 
            //    smaller than its height (as Three.camera.fov is the vertical 
            //    view angle)
            if (Three.CameraUtils.cameraMode !== "PERSPECTIVE") {

                var centroidCameraDelta = normVector.multiplyScalar(-(BSphere.radius * (1 / Math.sin(Three.DocumentEventHandler.GetCamera().fov / 2 * (Math.PI) / 180)) * Math.max(1, (1 / aspect)) + Three.DocumentEventHandler.GetCamera().near));
                var newCameraPosition = selectedCentroid.clone().add(centroidCameraDelta);
                Three.camera.cameraO.zoom = Math.min(Three.renderer.getSize().width, Three.renderer.getSize().height) * newCameraPosition.distanceTo(BSphere.center) / (BSphere.radius * BSphere.radius);
                Three.camera.updateProjectionMatrix();
            } else {
                var centroidCameraDelta = normVector.multiplyScalar(
                    BSphere.radius *
                    (1 / Math.sin(Three.DocumentEventHandler.GetCamera().fov / 2 * (Math.PI) / 180)) *
                    Math.max(1, (1 / aspect)) +
                    Three.DocumentEventHandler.GetCamera().near);
                var newCameraPosition = selectedCentroid.clone().add(centroidCameraDelta);
               
            }
            //console.log(selectedCentroid)
            //console.log(centroidCameraDelta)
            //console.log(this.FinalTarget)
            //console.log(newCameraPosition)
            //tempCam.position.set(newCameraPosition.x, newCameraPosition.y, newCameraPosition.z)

            // calculate current and future spherical angles
           
            var CurrentSphCoor = (new THREE.Spherical).setFromVector3(Three.DocumentEventHandler.GetCamera().position);
            var TargetSphCoor = (new THREE.Spherical).setFromVector3(newCameraPosition);
            
            // some corrections to ensure a smooth tween
            TargetSphCoor.makeSafe()


            // if theta and phi were given as input, substitute here
            //TargetSphCoor.theta = this.params.theta || TargetSphCoor.theta;
            //TargetSphCoor.phi = this.params.phi || TargetSphCoor.phi;
            // and the difference in theta to figure out the direction of rotation
            var DeltaTheta = (TargetSphCoor.theta - CurrentSphCoor.theta );
            while (Math.abs(DeltaTheta) > Math.PI) // if true we need to adjust for the shortest route
            {
                if (TargetSphCoor.theta > CurrentSphCoor.theta) {
                    TargetSphCoor.theta = TargetSphCoor.theta - 2*Math.PI;
                    DeltaTheta = (TargetSphCoor.theta - CurrentSphCoor.theta)
                } else {
                    TargetSphCoor.theta = TargetSphCoor.theta + 2*Math.PI;
                    DeltaTheta = (TargetSphCoor.theta - CurrentSphCoor.theta)
                }
            }

            // check if a parameter exists. if so, a tween process already exists and we'll need to stop it first
            if (Three.camera.SphereCoors) {
                Three.Utils.removeExisting3DTween();
                //return;
            }
            // Set the same additional paremeters on the camera to guid the transition
            Three.camera.SphereCoors = CurrentSphCoor.clone()

            var TargetCamCrtCoor = (new THREE.Vector3).setFromSpherical(TargetSphCoor);


                Three.controls.enabled = false;

            // Tween for poles
            if (((typeof (this.params.phi) !== "undefined") && (typeof (this.params.theta) !== "undefined")) && this.params.phi <= 0.000001 || this.params.phi >= (Math.PI - 0.000001)) {
               
                Three.camera.tweenArray = {
                    targetX: Three.controls.target.x,
                    targetY: Three.controls.target.y,
                    targetZ: Three.controls.target.z,
                    cameraX: Three.DocumentEventHandler.GetCamera().position.x,
                    cameraY: Three.DocumentEventHandler.GetCamera().position.y,
                    cameraZ: Three.DocumentEventHandler.GetCamera().position.z
                }
               
                Three.camera.SecundaryTweenMovement = new TWEEN.Tween(Three.camera.tweenArray)
                     .to({
                         targetX: this.FinalTarget.x, 
                         targetY: this.FinalTarget.y, 
                         targetZ: this.FinalTarget.z, 
                         cameraX: TargetCamCrtCoor.x,
                         cameraY: TargetCamCrtCoor.y,
                         cameraZ: TargetCamCrtCoor.z
                     }, this.duration)
                     .easing(TWEEN.Easing.Cubic.InOut)
                     .onUpdate(function () {
                         Three.DocumentEventHandler.GetCamera().position.set(Three.camera.tweenArray.cameraX, Three.camera.tweenArray.cameraY, Three.camera.tweenArray.cameraZ);
                        var target = new THREE.Vector3(Three.camera.tweenArray.targetX, Three.camera.tweenArray.targetY, Three.camera.tweenArray.targetZ)
                        Three.DocumentEventHandler.GetCamera().lookAt(target);
                        if (Three.navCam != null) {
                            Three.navCam.SphereCoors.setFromVector3((Three.DocumentEventHandler.GetCamera().position.clone()).sub(target));
                            Three.navCam.SphereCoors.radius = Three.ViewToggle.viewDistanceFace;
                            Three.navCam.position.setFromSpherical(Three.navCam.SphereCoors);
                            Three.navCam.lookAt(new THREE.Vector3(0, 0, 0));
                        }
                        
                     })
                     .onComplete(function () {
                         Three.controls.enabled = true;
                         Three.controls.target.set(Three.camera.tweenArray.targetX, Three.camera.tweenArray.targetY, Three.camera.tweenArray.targetZ);
                         delete Three.camera.SphereCoors; // cleanup
                         delete Three.camera.tweenArray; // cleanup
                     })
                    .start();
            }
            else {

                // Tween otherwise, redone to move everything in one tween, which hopefully provides a smoother movement. it requires the renderloop to be adjusted (looking for TweenMovement)
                
                    Three.camera.tweenArray = {
                        targetX: Three.controls.target.x + 0.0000001,
                        targetY: Three.controls.target.y + 0.0000001,
                        targetZ: Three.controls.target.z + 0.0000001,
                        cameraPhi: Three.camera.SphereCoors.phi,
                        cameraTheta: Three.camera.SphereCoors.theta,
                        cameraRadius: Three.camera.SphereCoors.radius
                    }
                Three.camera.TweenMovement = new TWEEN.Tween(Three.camera.tweenArray)
                    .easing(TWEEN.Easing.Cubic.InOut)
                    .to({
                        targetX: this.FinalTarget.x,
                        targetY: this.FinalTarget.y,
                        targetZ: this.FinalTarget.z,
                        cameraPhi: TargetSphCoor.phi,
                        cameraTheta: TargetSphCoor.theta,
                        cameraRadius: TargetSphCoor.radius
                        }
                        , this.duration
                    )
                    .onUpdate(function () {
                        Three.DocumentEventHandler.GetCamera().position.setFromSpherical(new THREE.Spherical(Three.camera.tweenArray.cameraRadius, Three.camera.tweenArray.cameraPhi, Three.camera.tweenArray.cameraTheta));
                        var target = new THREE.Vector3(Three.camera.tweenArray.targetX,
                            Three.camera.tweenArray.targetY,
                            Three.camera.tweenArray.targetZ);
                        Three.DocumentEventHandler.GetCamera().lookAt(target);
                        if (Three.loadedModule === "DOCUMENT" && Three.navCam != null) {
                            Three.navCam.SphereCoors.setFromVector3((Three.DocumentEventHandler.GetCamera().position.clone()).sub(target));
                            Three.navCam.SphereCoors.radius = Three.ViewToggle.viewDistanceFace;
                            Three.navCam.position.setFromSpherical(Three.navCam.SphereCoors);
                            Three.navCam.lookAt(new THREE.Vector3(0, 0, 0));
                        }
                    })
                    .onComplete(function () {
                        Three.controls.enabled = true;
                        Three.controls.target.set(Three.camera.tweenArray.targetX, Three.camera.tweenArray.targetY, Three.camera.tweenArray.targetZ);
                        delete Three.camera.SphereCoors; // 
                        delete Three.camera.tweenArray; // cleanup
                    })
                    .start();

                }

        },

        centerObject: function centerObject(object) {

            if (Three.transformControls) {
                //Three.ThreeDToolbar.showTransformControls = false;
                Three.ControlUtils.hideTransformControls();
            }
            object.position.set(0, 0, 0);

            var center = Three.Utils.getObjectCenter(object);

            object.position.set(0, 0, 0);
            object.position.x -= center.x;
            object.position.y -= center.y;
            object.position.z -= center.z;
            // if (Three.Gui && Three.Gui.upOrientation == "z" || loadedModule == "PRODUCT") {
            //     object.translateZ(Math.abs(center.y)); //center.y);//
            // } else if (loadedModule == "EMS") {
            //     if (ThreeD_VL.current3DModelNode.Type === "SystemSubType") {
            //         object.translateY(center.y);
            //         object.scale.set(0.001, 0.001, 0.001);
            //     } else {
            //         object.translateY(center.y); //center.y);//  
            //     }
            // }
            // else{
                 object.translateY(center.y); //center.y);//  
            // }
            // if (loadedModule == "DOCUMENT") {
            //     Three.Gui.positionXSlider.value(object.position.x);
            //     Three.Gui.positionYSlider.value(object.position.y);
            //     Three.Gui.positionZSlider.value(object.position.z);
            // }

        },

        // this method does a number of raycasts within the provided coordinates, and returns the new camera position and direction
        FindBoxContent: function findBoxContent(x1, y1, x2, y2, target) {

            var cam = Three.DocumentEventHandler.GetCamera();
         
            var factorX = Three.container.clientWidth / 2;
            var factorY = Three.container.clientHeight / 2;
            var noPoints = 10; // typically 10, ends up doing (10 + 1 + 10) * (10 + 1 + 10) = 441 raycasts
            var spacingRatio = 1.2; //we want more points near the edges, so we'll do more raycasts there
            if (target.type === 'Group') {
                target = target.children;
            } else {
                target = [target];
            }

            // Maximum zoom distance
            var distMin = 10000;

            //Three.mouse.x = (Three.DocumentEventHandler.getMouseLocation_x(event) / Three.container.clientWidth) * 2 - 1;
            //Three.mouse.y = -(Three.DocumentEventHandler.getMouseLocation_y(event) / Three.container.clientHeight) * 2 + 1;// + -TOOLBAR_HEIGHT
            var getRayDirection = function (i, j) { // i,j are typically event.offsetX and event.offsetY, respectively (integers >0), but 
                var coor = new THREE.Vector2(-1 + (i / factorX), 1 - (j / factorY));
                Three.raycaster.setFromCamera(coor, cam);
                return Three.raycaster.ray.clone();
            };

            // first we'll get the extremes of the box in terms of world coordinates
            // then get right end of the box
            var rightRay = getRayDirection((x1 + x2) / 2, y2);

            // then get bottom of the box
            var bottomRay = getRayDirection(x2, (y1 + y2) / 2);

            // then get center of the box
            var centerRay = getRayDirection((x1 + x2) / 2, (y1 + y2) / 2);

            // use the differences in these rays to find out the incremental spacing

            var halfWidth = (rightRay.direction.clone().normalize().sub(centerRay.direction.normalize()));
            var halfHeight = (bottomRay.direction.clone().normalize().sub(centerRay.direction.normalize()));
            var totalSpacing = (1 - Math.pow(spacingRatio, noPoints + 1)) / (1 - spacingRatio);
            var dx = halfWidth.clone().divideScalar(totalSpacing);
            var dy = halfHeight.clone().divideScalar(totalSpacing);
            var newTarget = null;

            var setRayCaster = function (direction) { // whe know where the camera is, but were are we raycasting to?
                Three.raycaster.set(centerRay.origin, direction);
            };

            var updateProjectionExtremes = function (distX, distY, point) {
                var projection = centerRay.closestPointToPoint(point);

                //assuming 90 deg camera angle (45 effectively)
                var sideDistanceMultiplier =1;
                if (!distX.equals(new THREE.Vector3(0, 0, 0))) {
                    sideDistanceMultiplier = Math.max(halfWidth.length() / distX.length(), sideDistanceMultiplier);
                    console.log(halfWidth.length() + " " + distX.length());
                }
                if (!distY.equals(new THREE.Vector3(0, 0, 0))) {
                    sideDistanceMultiplier = Math.max(halfHeight.length() / distY.length(), sideDistanceMultiplier);
                    //console.log(halfHeight.length() + " " + distY.length());
                }
                
                var dist = centerRay.origin.distanceTo(projection) - projection.distanceTo(point) * Math.sqrt(sideDistanceMultiplier);
                if (dist < distMin) {
                    distMin = dist;
                }
            };

            var evaluatePoint = function evaluatePoint(distX, distY, direction) {
                setRayCaster(direction);
                //console.log(direction);
                var firstIntersect = Three.raycaster.intersectObjects(target, true)[0];
                if (firstIntersect) {
                    updateProjectionExtremes(distX, distY, firstIntersect.point);
                    if (newTarget === null) {
                        newTarget = firstIntersect.point;
                    }
                }
            };

            var iterateVertically = function (distX, distY, dir) {
                if (distY.equals(new THREE.Vector3(0, 0, 0))) {
                    evaluatePoint(distX, distY, dir.clone());
                } else {
                    evaluatePoint(distX, distY, dir.clone().add(distY));
                    evaluatePoint(distX, distY, dir.clone().sub(distY));
                }
            };

            var iterateHorizontally = function (distX, distY, dir) {
                if (distX.equals(new THREE.Vector3(0, 0, 0))) {
                    iterateVertically(distX, distY, dir.clone());
                } else {
                    iterateVertically(distX, distY, dir.clone().add(distX));
                    iterateVertically(distX, distY, dir.clone().sub(distX));
                }
            };

            var distX;
            var distY;
            distX = new THREE.Vector3(0, 0, 0);
            for (var i = 0; i <= noPoints; i++) {
                distX.add(dx.clone().multiplyScalar(Math.pow(spacingRatio, i)));
                distY = new THREE.Vector3(0, 0, 0);
                for (var j = 0; j <= noPoints; j++) {
                    distY.add(dy.clone().multiplyScalar(Math.pow(spacingRatio, j)));
                    iterateHorizontally(distX, distY, centerRay.direction.clone().normalize());
                }
            }

            if (distMin === 10000) {
                return [centerRay.origin, centerRay.origin.clone().add(centerRay.direction.normalize())];
            }

            var newPos = centerRay.origin.clone().add(centerRay.direction.normalize().clone().multiplyScalar(distMin - cam.near));

            if (newTarget === null) {
                newTarget = newPos.clone().add(centerRay.direction.normalize().multiplyScalar(10));
            }
            return [newPos, newTarget];
        },

        getObjectCenter: function getObjectCenter(object) {
            var myBox = new THREE.Box3;
            myBox.setFromObject(object);
            var center = myBox.getCenter();

            //var geometry = new THREE.SphereGeometry(5, 32, 32);
            //var material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            //var sphere = new THREE.Mesh(geometry, material);
            //sphere.name = "red";
            //sphere.position.set(myBox.min.x, myBox.min.y, myBox.min.z);
            //Three.scene.add(sphere)

            //geometry = new THREE.SphereGeometry(5, 32, 32);
            //material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
            //sphere = new THREE.Mesh(geometry, material);
            //sphere.name = "green";
            //sphere.position.set(myBox.max.x, myBox.max.y, myBox.max.z);
            //Three.scene.add(sphere)

            //geometry = new THREE.SphereGeometry(5, 32, 32);
            //material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
            //sphere = new THREE.Mesh(geometry, material);
            //sphere.name = "blue";
            //sphere.position.set(myBox.max.x - myBox.min.x, myBox.max.y - myBox.min.y, myBox.max.z - myBox.min.z);
            //Three.scene.add(sphere)

            //geometry = new THREE.SphereGeometry(5, 32, 32);
            //material = new THREE.MeshBasicMaterial({ color: 0x000000 });
            //sphere = new THREE.Mesh(geometry, material);
            //sphere.name = "black";
            //sphere.position.set(myBox.min.x - myBox.max.x, myBox.min.y - myBox.max.y, myBox.min.z - myBox.max.z);
            //Three.scene.add(sphere)

            //geometry = new THREE.SphereGeometry(5, 32, 32);
            //material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
            //sphere = new THREE.Mesh(geometry, material);
            //sphere.name = "yellow";
            //sphere.position.set(myBox.min.x + myBox.max.x, myBox.min.y + myBox.max.y, myBox.min.z + myBox.max.z);
            //Three.scene.add(sphere)

            return {
                x: parseFloat(center.x.toString().replace("e-", "")),
                y: parseFloat(center.y.toString().replace("e-", "")),
                z: parseFloat(center.z.toString().replace("e-", ""))
            }
        },

        destroyContextMenu: function () {
            var contextMenu = $("#context-menu").data("kendoContextMenu");
            if (contextMenu != null) {
                console.log("destory");
                contextMenu.destroy();
            }
        },

        getBoundingBox: function getBoundingBox(object) {
            var myBox = new THREE.Box3;
            myBox.setFromObject(object);
            

            return {
                x: parseFloat(myBox.x.toString().replace("e-", "")),
                y: parseFloat(myBox.y.toString().replace("e-", "")),
                z: parseFloat(myBox.z.toString().replace("e-", ""))
            }
        },

        removeObjectFromScene: function (scene, object) {
            scene.remove(object);
        },

        traverseMesh: function (mesh, groupCallbacks, meshCallbacks) {
            // will traverse the mesh (as it has groups, etc.). 
            // input will be two Callbacks, one for the groups it encounters, one for the meshes
            // each of the callbacks in the lists will be ran on the respective objects in the hierarchy (group or mesh)

            var mesh = mesh;
            var groupCallbacks = groupCallbacks;
            var meshCallbacks = meshCallbacks;

            if (typeof mesh === "undefined") {
                return mesh;
            }

            if (mesh.type == "Group") { // dowsn't conaint much but children, although hypothetically the name could be interesting
                groupCallbacks(mesh);
                mesh.children.forEach(function (childMesh) {

                    childMesh = Three.Utils.traverseMesh(childMesh, groupCallbacks, meshCallbacks);

                });
                return mesh;
            } else if (mesh.type == "Mesh") { // the fun part
                meshCallbacks(mesh);
                return mesh;
            } else {
                meshCallbacks(mesh);
                return mesh;
            }
        },

        getStatusMaterialSet: function (status) {
            switch (status) {
                case "OnHold":
                    return 8;
                case "InProgress":
                    return 7;
                case "Completed":
                    return 6;
                case "Assigned":
                    return 5;
                case "UnAssigned":
                    return 4;
                default:
                    return 0;
            }
        },

    }

    return ThreeDUtils;

})();

/*
    Utils
*/
