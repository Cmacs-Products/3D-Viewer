
/*
    Document / Container DocumentEventHandler
*/

var DocumentEventHandler = (function () {

    function DocumentEventHandler() {
        this.lasthiddenPart = [];
        this.isDragged = false;
        this.threeDtagObject;
        this.showAllElementsWithSubtype = false;
    }

    DocumentEventHandler.prototype = {

        constructor: DocumentEventHandler,

        onResizeContainer: function onResizeContainer(event) {
            Three.DocumentEventHandler.resizeContainer();
      },

      init: function () {
        Three.DocumentEventHandler.addDocumentEvents();

      },

        GetCamera: function () {
            return Three.camera;
          
            if (Three.camera.inOrthographicMode) {
                return Three.camera.cameraO;
            }
            if (Three.camera.inPerspectiveMode) {
                return Three.camera.cameraP;
            }
           
        },

        GetNavigationCamera: function () {
            return Three.navCam;
            if (Three.navCam.inOrthographicMode) {
                return Three.navCam.cameraO;
            }
            if (Three.navCam.inPerspectiveMode) {
                return Three.navCam.cameraP;
            }
      },

      addDocumentEvents: function () {

        var tapped = false;
        var isHeld = false;
        var isApple = false;
        var isAndroid = false;

        if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
          isApple = true;
        }
        if (/Android/i.test(navigator.userAgent)) {
          isAndroid = true;
        }
        if (!Three.isMobileTablet) {
          Three.renderer.domElement.addEventListener('mousemove',
            Three.DocumentEventHandler.onDocumentMouseMove,
            false);
          Three.renderer.domElement.addEventListener('mouseup',
            Three.DocumentEventHandler.onDocumentMouseUp,
            false);
          Three.renderer.domElement.addEventListener('dblclick',
            Three.DocumentEventHandler.onDocumentDblClick,
            false);
          Three.renderer.domElement.addEventListener('click', Three.DocumentEventHandler.onDocumentClick, false);
        } else {
          var hammer = new Hammer.Manager(Three.renderer.domElement);
          hammer.add(new Hammer.Tap({ event: "doubletap", taps: 2 }));
          hammer.add(new Hammer.Tap({ event: "singletap" }));
          hammer.add(new Hammer.Press({ event: "press" }));

          hammer.get('doubletap').recognizeWith('singletap');
          hammer.get('singletap').requireFailure('doubletap');

          // tap
          hammer.on("singletap", function (e) {
            console.log("HammerJS: You're tapping me!");
            Three.DocumentEventHandler.onDocumentClick(e);
            console.log(e);
          });

          // Dbl Tap
          hammer.on("doubletap", function (e) {
            console.log("HammerJS: You're double tapping me!");
            Three.DocumentEventHandler.onDocumentDblClick(e);
            console.log(e);
          });

          // Hold
          hammer.on("press", function (e) {
            console.log("HammerJS: You're pressing me!");
            Three.DocumentEventHandler.onDocumentClick(e);
            console.log(e);
          });
        }
        Three.renderer.domElement.addEventListener('contextmenu', Three.DocumentEventHandler.onDocumentClick, false);

      },

        resizeContainer: function () {

            Three.Initialize.SCREEN_HEIGHT = Three.container.clientHeight;
            Three.Initialize.SCREEN_WIDTH = Three.container.clientWidth;
            var ratioX = Three.renderer.getSize().width/Three.container.clientWidth;
            var ratioY = Three.renderer.getSize().height / Three.container.clientHeight;
            if (Three.renderer) {
                Three.renderer.setSize(Three.container.clientWidth, Three.container.clientHeight);
            }
            if (Three.camera) {
                Three.camera.aspect = Three.container.clientWidth / Three.container.clientHeight;
                if (Three.CameraUtils.cameraMode == "PERSPECTIVE") {
                    Three.camera.cameraP.aspect = Three.container.clientWidth / Three.container.clientHeight;
                    Three.camera.cameraP.updateProjectionMatrix();
                } else {
                    
                    //Three.camera.cameraO.projectionMatrix.scale(new THREE.Vector3(ratioX, ratioY, 1));
                    Three.camera.cameraO.left = Three.container.clientWidth / - 2;
                    Three.camera.cameraO.right = Three.container.clientWidth / 2;
                    Three.camera.cameraO.top = Three.container.clientHeight / 2;
                    Three.camera.cameraO.bottom = Three.container.clientHeight / - 2;
                    Three.camera.cameraO.updateProjectionMatrix();
                }
            }

            if (Three.scene) {
                if (Three.BackgroundRendering.gradientType == 'Radial') {
                    var texture = new THREE.Texture(Three.BackgroundRendering.generateRadialTexture(Three.BackgroundRendering.startColor, Three.BackgroundRendering.stopColor));
                }
                else if (Three.BackgroundRendering.gradientType == 'Linear') {
                    var texture = new THREE.Texture(Three.BackgroundRendering.generateTexture(Three.BackgroundRendering.startColor, Three.BackgroundRendering.stopColor));
                }
                texture.needsUpdate = true;
                Three.scene.background = texture;

            }
            //if (Three.scene) {
            //    if (Three.Gui.gradientType == 'Radial') {
            //        var texture = new THREE.Texture(Three.Gui.generateRadialTexture(Three.Gui.startColor, Three.Gui.stopColor));
            //    }
            //    else if (Three.Gui.gradientType == 'Linear') {
            //        var texture = new THREE.Texture(Three.Gui.generateTexture(Three.Gui.startColor, Three.Gui.stopColor));
            //    }
            //    texture.needsUpdate = true;
            //    Three.scene.background = texture;
         
            //}

        },
       
        onDocumentDblClick: function onDocumentDblClick(event) {
            //if (loadedModule == "DOCUMENT") {
            //if (Three.Utils.findSelected()) {
            //    Three.Utils.zoomToObject();
            //};
            //}
          
            var hasIntersected = false;
            var spriteIntersected = false;
            event.preventDefault();

            if (typeof (Three.scene.getObjectByName("MainMesh")) !== "undefined" && !(hasIntersected)) {

                var model = Three.ModelLoader.getModel();
                var modelType = model.type;
                Three.mouse.x = (Three.DocumentEventHandler.getMouseLocation_x(event) / Three.container.clientWidth) * 2 - 1;
                Three.mouse.y = -(Three.DocumentEventHandler.getMouseLocation_y(event) / Three.container.clientHeight) * 2 + 1;// + -TOOLBAR_HEIGHT


                Three.raycaster.setFromCamera(Three.mouse, Three.DocumentEventHandler.GetCamera());

                /*
                 * The following code is to determine which object's children to raycast, and what to do once intersected.
                 * Models of type Group, have children, whereas models of type Mesh, do not have children.
                 * If we have a model of type Group, raycast the model's children too see which child we're Clicking on.
                 * If it is a type mesh, raycast the scene's chidren and see if we clicked the mesh
                 */
                switch (modelType) {
                    case "Group":
                        intersects = Three.raycaster.intersectObjects(Three.scene.getObjectByName("MainMesh").children, true).filter(o => o.object.type !== "LineSegments" && o.object.visible);
                        break;
                    case "Mesh":
                        intersects = Three.raycaster.intersectObjects(Three.scene.children).filter(o => o.object.type !== "LineSegments" && o.object.visible);
                        break;
                    default:
                        break;
                }

                if (intersects.length > 0
                    && ((modelType === "Group")
                        || (modelType === "Mesh" && intersects[0].object.name === "MainMesh"))) {

                    //console.log(intersects[0].object);

                    if (Three.DocumentEventHandler.isDragged) {
                        Three.DocumentEventHandler.isDragged = false;
                        event.stopPropagation();
                        return;
                    }

                    // if (loadedModule != "EMS") {
                        /*
                         * If we're not in tagging mode, put the green selection object 
                         * Update the Info box with the selected mesh's info
                         */
                        // if (!Three.ThreeDTagUtils.isTagMode && !spriteIntersected) {

                        //     Three.SELECTED = Three.scene.getObjectById(intersects[0].object.id);
                        //     Three.Utils.select3DObject(intersects[0].object.id);

                        //     //Three.SELECTED = Three.scene.getObjectByName(intersects[0].object.name);
                        //     //Three.Utils.select3DObject(intersects[0].object.name);
                        // }

                        if (!Three.ThreeDTagUtils.isTagMode) {
                            Three.container.style.cursor = 'pointer';
                        }

                        /*
                         * On a right click, set Context Menu options if a 3D tag wasn't already clicked
                         */
                        // if (!spriteIntersected && (event.which === 3 || event.type === "contextmenu" || (event.type === "touchstart" && isApple) || event.type === "press")) {
                        //     event.preventDefault();
                        //     contextMenuObjectType = "MESH";
                        //     contextMenuObject = intersects[0].object;
                        // }

                        /*
                         * Create a new 3D tag if we're in tagging mode
                         */
                        if (Three.ThreeDTagUtils.isTagMode) {
                            Three.DocumentEventHandler.createNew3DTag_onClick(intersects);
                        }

                    // } else {
                        if (!Three.ThreeDTagUtils.isTagMode && !spriteIntersected) {
                            let eventType = 2; // enum for "DBLCLICK"
                            if (event.which === 3 || event.type === "contextmenu" || (event.type === "touchstart" && isApple) || event.type === "press"){
                                eventType = 3; // enum for "CONTEXT"
                            }
                            Three.DocumentEventHandler.handleSelection(intersects[0].object, eventType, event);
                        }
                        // var zoomSelect = false;
                        // if (event.which === 3 || event.type === "contextmenu" || (event.type === "touchstart" && isApple) || event.type === "press") {
                        //     contextMenuObject = intersects[0].object;
                        //     if (ThreeD_VL.current3DModelNode.Type.toUpperCase() === "IFCROOT") {
                        //         contextMenuObjectType = "ELEMENT";
                        //         zoomSelect = true;
                        //     } else {
                        //         contextMenuObjectType = "SUBSYSTEM";
                        //     }
                        // } else {
                        //     if (ThreeD_VL.current3DModelNode.Type.toUpperCase() === "IFCROOT") {
                        //         zoomSelect = true;
                        //     }
                        // }
                        // if (zoomSelect && !(event.which === 3 || event.type === "contextmenu" || (event.type === "touchstart" && isApple) || event.type === "press")) {
                        //     var object = intersects[0].object;
                        //     var tag = object.name;
                        //     if (typeof intersects[0].object.userData.name === 'undefined' && typeof intersects[0].object.parent.userData.name !== 'undefined') {
                        //         object = intersects[0].object.parent;
                        //         tag = object.name;
                        //     }
                        //     Three.SELECTED = object;
                        //     Three.Utils.select3DObject(object.id);
                        //     ThreeD_VL.selectEMSNode(tag);

                        //     //else {
                        //     //    // do again with parent
                        //     //    Three.SELECTED = intersects[0].object.parent;
                        //     //    ThreeD_VL.selectEMSNode(intersects[0].object.parent.name);
                        //     //    Three.Utils.select3DObject(intersects[0].object.parent.id);
                        //     //}
                        // }
                    // }
                }
            }

            // if (loadedModule == "DOCUMENT") {
        //     if (Three.Utils.findSelected()) {
        //        Three.Utils.zoomToObject();
        //   };
        
        //   window.parent.postMessage('onDocumentDblClick', true);
            //}
        },

        onDocumentDblTap: function onDocumentDblTap(event) {
            console.log("Touch: double tap!");
            //if (Three.scene.getObjectByName("myCube")) {
            intersects = Three.raycaster.intersectObjects(Three.scene.children).filter(o => o.object.type !== "LineSegments");
            hasIntersected = true;
            if (Three.INTERSECTED != intersects[0].object) {
                Three.INTERSECTED = intersects[0].object;
            }
            Three.Utils.zoomToObject(this.mesh);
            //};
        },

        onDocumentTap: function onDocumentTap(event) {
            console.log("Touch: Single tap!");
            Three.DocumentEventHandler.onDocumentClick(event);
        },

        onDocumentTapHold: function onDocumentTapHold(event) {
            console.log("Someone put me on hold!");
        },

        onDocumentMouseMove: function onDocumentMouseMove(event) {

            event.preventDefault();

            var hasIntersected = false;

            var isApple = false;
            var isAndroid = false;
            if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                isApple = true;
            }
            if (/Android/i.test(navigator.userAgent)) {
                isAndroid = true;
            }

            if (event.which === 3 || event.type === "contextmenu" || (event.type === "touchstart" && isApple) || event.type === "press" ) {
                Three.Utils.destroyContextMenu();
            }

            //-------------------
            // NAV CUBE
            //-------------------
            if (Three.navCubeLoaded && !Three.isMobileTablet) {
                //Three.navMouse.x = ((Three.isMobileTablet ? event.touches[0].clientX - $(event.target).offset().left: event.offsetX) / Three.Initialize.NAV_WIDTH) * 2 - 1;
                //Three.navMouse.y = -(((Three.isMobileTablet ? event.touches[0].clientY - $(event.target).offset().top : event.offsetY) - (Three.renderer.domElement.clientHeight - Three.Initialize.NAV_HEIGHT)) / Three.Initialize.NAV_HEIGHT) * 2 + 1;
                //Three.navcaster.setFromCamera(Three.navMouse, Three.navCam);

                //if (Three.navScene.getObjectByName("navHover")) {
                //    Three.navScene.remove(Three.navScene.getObjectByName("navHover"));
                //}

                //if (Three.NAV_SELECTED) { return; }

                //var model = Three.navScene.getObjectByName("NavigationCube");
                //var intersects = typeof model !== "undefined" ? Three.navcaster.intersectObjects(model.children) : null;
                //if (intersects != null && intersects.length > 0) {

                //    hasIntersected = true;

                //    if (Three.NAV_INTERSECTED != intersects[0].object) {
                //        Three.NAV_INTERSECTED = intersects[0].object;
                //    }

                //} else {
                //    Three.NAV_INTERSECTED = null;
                //}
                Three.DocumentEventHandler.processNavCube_onMouseMove(hasIntersected, event);
            }

            //-------------------
            // MAIN MESH
            //-------------------
            if (typeof (Three.scene.getObjectByName("MainMesh")) !== "undefined") {

                var model = Three.ModelLoader.getModel();
                var modelType = model.type;
                var intersects = null;

                Three.mouse.x = (Three.DocumentEventHandler.getMouseLocation_x(event) / Three.container.clientWidth) * 2 - 1;
                Three.mouse.y = -(Three.DocumentEventHandler.getMouseLocation_y(event) / Three.container.clientHeight) * 2 + 1;// + -TOOLBAR_HEIGHT
                Three.raycaster.setFromCamera(Three.mouse, Three.DocumentEventHandler.GetCamera());

                if (Three.SELECTED) {
                    return;
                }

                /*
                 * The following code is to determine which object's children to raycast, and what to do once intersected.
                 * Models of type Group, have children whereas models of type Mesh, do not have children.
                 * If we have a model of type Group, raycast the model's children too see which child we're hovering over.
                 * If it is a type mesh, raycast the scene's chidren and see if we're hovering over the mesh
                 */
                switch (modelType) {
                    case "Group":
                        intersects = Three.raycaster.intersectObjects(Three.scene.getObjectByName("MainMesh").children, true).filter(o => o.object.type !== "LineSegments");
                        break;
                    case "Mesh":
                        intersects = Three.raycaster.intersectObjects(Three.scene.children).filter(o => o.object.type !== "LineSegments");//.getObjectByName("MainMesh")
                        break;
                    default:
                        break;
                }

                if (intersects.length > 0 && ((modelType === "Group") || (modelType === "Mesh" && intersects[0].object.name === "MainMesh"))) {
                    hasIntersected = true;
                    if (Three.INTERSECTED != intersects[0].object) {
                        Three.INTERSECTED = intersects[0].object;
                    }
                }
                else {
                    Three.INTERSECTED = null;
                }

                /*
                 * The following code determins what kind of mouse pointer should be shown at any given time.
                 * If we are NOT in tagging mode, and the raycaster HAS intersected an object, show the POINTER.
                 * If we are NOT in tagging mode, and the raycaster HAS NOT intersected an object, show the DEFAULT.
                 * If we ARE in tagging mode, and the raycaster HAS NOT intersected an object, show the NOT ALLOWED.
                 * If we ARE in tagging mode, and the raycaster HAS intersected an object, show the CROSSHAIR.
                 */
                Three.DocumentEventHandler.setCursorStyle_onMouseMove(hasIntersected);
                
            }
            
            //-------------------
            // 3D TAG
            //-------------------
            if (!Three.ThreeDTagUtils.isTagMode) {
                Three.mouse.x = (Three.DocumentEventHandler.getMouseLocation_x(event) / Three.container.clientWidth) * 2 - 1;
                Three.mouse.y = -(Three.DocumentEventHandler.getMouseLocation_y(event) / Three.container.clientHeight) * 2 + 1;// + -TOOLBAR_HEIGHT
                Three.raycaster.setFromCamera(Three.mouse, Three.DocumentEventHandler.GetCamera());

                var spriteIntersects = Three.raycaster.intersectObjects(Three.ThreeDTagUtils.threeDTags).filter(o => o.object.type !== "LineSegments");
                if (spriteIntersects.length > 0) {
                    var sprite = spriteIntersects[0];
                    //console.log(sprite);
                    Three.container.style.cursor = 'pointer';
                }
            }
        },

      onDocumentClick: function onDocumentClick(event) {
            var isApple = false;
            var isAndroid=false;
            if (/iPhone|resize|iPod/i.test(navigator.userAgent)) {
                isApple = true;
            }
            if (/Android/i.test(navigator.userAgent)) {
                isAndroid = true;
            }

            var hasIntersected = false;
            event.preventDefault();
            //alert(event.type);
            //console.log("DEH: "+event.type);
            //if (event.type === "contextmenu" || event.type === "contextmenuKendo") event.stopPropagation();
            if (event.type === "touchcancel") return;

            Three.Utils.destroyContextMenu();
            //Three.ToolbarEventHandler.closeAllMenus();
            if (typeof Three.camera.tweenArray === "undefined") {
                /*
                 * Clean up the the scene 
                 */
                //if (loadedModule == "DOCUMENT") {
                //    Three.Utils.remove3DSelection("MainMesh",false);
                //    if (!Three.isMobileTablet) {
                //        if (Three.navScene.getObjectByName("myNavCube")) {
                //            Three.navScene.remove(Three.navScene.getObjectByName("myNavCube"));
                //        }
                //    }
                //}

                //-------------------
                // NAV CUBE
                //-------------------
                if (!Three.isMobileTablet && Three.navCubeLoaded) {
                    Three.DocumentEventHandler.processNavCube_onClick(hasIntersected, event);

                // }else {
                //     console.log("not found");
                }

                var intersected = null;
                var spriteIntersected = false;
                var contextMenuObjectType = "GENERIC";
                var contextMenuObject = null;
                //-------------------
                // 3D TAG
                //-------------------
                if (!Three.ThreeDTagUtils.isTagMode && !(hasIntersected)) {
                    var process3DTag_onClick_result = Three.DocumentEventHandler.process3DTag_onClick(
                        spriteIntersected
                        , contextMenuObjectType
                        , contextMenuObject
                        , hasIntersected
                        , event);

                    spriteIntersected = process3DTag_onClick_result.spriteIntersected;
                    contextMenuObjectType = process3DTag_onClick_result.contextMenuObjectType;
                    hasIntersected = process3DTag_onClick_result.hasIntersected;
                    contextMenuObject = process3DTag_onClick_result.contextMenuObject;

                   

                }

                //-------------------
                // MAIN MESH
                //-------------------
                if (typeof (Three.scene.getObjectByName("MainMesh")) !== "undefined" && !(hasIntersected)) {

                    var model = Three.ModelLoader.getModel();
                    var modelType = model.type;
                    Three.mouse.x = (Three.DocumentEventHandler.getMouseLocation_x(event) / Three.container.clientWidth) * 2 - 1;
                    Three.mouse.y = -(Three.DocumentEventHandler.getMouseLocation_y(event) / Three.container.clientHeight) * 2 + 1;// + -TOOLBAR_HEIGHT


                    Three.raycaster.setFromCamera(Three.mouse, Three.DocumentEventHandler.GetCamera());
                    
                    /*
                     * The following code is to determine which object's children to raycast, and what to do once intersected.
                     * Models of type Group, have children, whereas models of type Mesh, do not have children.
                     * If we have a model of type Group, raycast the model's children too see which child we're Clicking on.
                     * If it is a type mesh, raycast the scene's chidren and see if we clicked the mesh
                     */
                    switch (modelType) {
                    case "Group":
                            intersects = Three.raycaster.intersectObjects(Three.scene.getObjectByName("MainMesh").children, true).filter(o => o.object.type !== "LineSegments");
                        break;
                    case "Mesh":
                            intersects = Three.raycaster.intersectObjects(Three.scene.children).filter(o => o.object.type !== "LineSegments");
                        break;
                    default:
                        break;
                    }

                    if (intersects.length > 0
                        && ((modelType === "Group")
                        || (modelType === "Mesh" && intersects[0].object.name === "MainMesh"))) {

                        //console.log(intersects[0].object);

                        if (Three.DocumentEventHandler.isDragged) {
                            Three.DocumentEventHandler.isDragged = false;
                            event.stopPropagation();
                            return;
                        }

                        //if (loadedModule != "EMS") {
                        //    /*
                        //     * If we're not in tagging mode, put the green selection object 
                        //     * Update the Info box with the selected mesh's info
                        //     */
                        //    if (!Three.ThreeDTagUtils.isTagMode && !spriteIntersected) {

                        //        Three.SELECTED = Three.scene.getObjectById(intersects[0].object.id);
                        //        Three.Utils.select3DObject(intersects[0].object.id);

                        //        //Three.SELECTED = Three.scene.getObjectByName(intersects[0].object.name);
                        //        //Three.Utils.select3DObject(intersects[0].object.name);
                        //    }

                        //    if (!Three.ThreeDTagUtils.isTagMode) {
                        //        Three.container.style.cursor = 'pointer';
                        //    }

                        //    /*
                        //     * On a right click, set Context Menu options if a 3D tag wasn't already clicked
                        //     */
                        //    if (!spriteIntersected && (event.which === 3 || event.type === "contextmenu" || (event.type === "touchstart" && isApple) || event.type === "press" )) {
                        //        event.preventDefault();
                        //        contextMenuObjectType = "MESH";
                        //        contextMenuObject = intersects[0].object;
                        //    }

                        //    /*
                        //     * Create a new 3D tag if we're in tagging mode
                        //     */
                        //    if (Three.ThreeDTagUtils.isTagMode) {
                        //        Three.DocumentEventHandler.createNew3DTag_onClick(intersects);
                        //    }

                        //} else {
                            let eventType = 1; // enum for "CLICK"
                            if (event.which === 3 || event.type === "contextmenu" || (event.type === "touchstart" && isApple) || event.type === "press"){
                                eventType = 3; // enum for "CONTEXT"
                            }
                            Three.DocumentEventHandler.handleSelection(intersects[0].object, eventType, event)
                            // var zoomSelect = false
                            // if (event.which === 3 || event.type === "contextmenu" || (event.type === "touchstart" && isApple) || event.type === "press") {
                            //     contextMenuObject = intersects[0].object;
                            //     if (ThreeD_VL.current3DModelNode.Type.toUpperCase() === "IFCROOT") {
                            //         contextMenuObjectType = "ELEMENT";
                            //         zoomSelect = true;
                            //     } else {
                            //         contextMenuObjectType = "SUBSYSTEM";
                            //     }
                            // } else {
                            //     if (ThreeD_VL.current3DModelNode.Type.toUpperCase() === "IFCROOT") {
                            //         zoomSelect = true;
                            //     }
                            // }
                            // if (zoomSelect) {
                            //     var object = intersects[0].object;
                            //     var tag = object.name;
                            //     if (typeof intersects[0].object.userData.name === 'undefined' && typeof intersects[0].object.parent.userData.name !== 'undefined') {
                            //         object = intersects[0].object.parent;
                            //         tag = object.name;
                            //     }
                            //     if ((event.which === 3 || event.type === "contextmenu" || (event.type === "touchstart" && isApple) || event.type === "press")) {
                            //         Three.DocumentEventHandler.MENUSELECTED = object;
                            //         ContextMenu.mesh = object;
                            //         element = TreeView_L.getTreeItemDataByTag(tag);
                            //         if (element.length > 0 && element[0].SystemSubTypeId) {
                            //             ThreeD_VL.selectedNode.SystemSubTypeId = element[0].SystemSubTypeId;
                            //             ContextMenu.systemSubTypeId = element[0].SystemSubTypeId;
                            //         }
                            //     } else {
                            //         Three.SELECTED = object;
                            //         Three.Utils.select3DObject(object.id);
                            //         ThreeD_VL.selectEMSNode(tag);
                            //     }
                            //     //else {
                            //     //    // do again with parent
                            //     //    Three.SELECTED = intersects[0].object.parent;
                            //     //    ThreeD_VL.selectEMSNode(intersects[0].object.parent.name);
                            //     //    Three.Utils.select3DObject(intersects[0].object.parent.id);
                            //     //}
                            // }
                        //}
                    }
                }else{



                /*
                * Create the Context Menu for chosen object if right clicked
                */
                if (event.which === 3 || event.type === "contextmenu" || (event.type === "touchstart" && isApple) || event.type === "press" ) {
                    eventType = 3; // enum for "CONTEXT"
                    Three.DocumentEventHandler.threeDtagObject = contextMenuObject;

                    let object ={
                        name: "3DTag"
                    }
                    Three.DocumentEventHandler.handleSelectionForTags(object, eventType, event)
                }

            }
                //     event.preventDefault();

                //     //var emsNodeId = loadedModule === "EMS" ? ThreeD_VL.selectedNode.id : null;
                //     var emsNodeId = loadedModule === "EMS" ? ThreeD_VL.selectedNode.dataId : null;
                //     var systemSubTypeId = loadedModule === "EMS" ? ThreeD_VL.selectedNode.SystemSubTypeId : null;
                //     var projectId = loadedModule === "EMS" ? ThreeD_VL.ProjectId : null;
                //     var threeD_vl = loadedModule === "EMS" ? ThreeD_VL : null;
                //     var settings = {
                //         event: event,
                //         mesh: contextMenuObject,
                //         objectType: contextMenuObjectType,
                //         emsNodeId: emsNodeId,
                //         projectId: projectId,
                //         threeD_vl: threeD_vl,
                //         systemSubTypeId: systemSubTypeId
                //     }

                //     new ContextMenu(settings);

                //     if (loadedModule != "EMS") {
                //         spriteIntersected = true;
                //     }
                // }
            }
        },

        handleSelectionForTags: function handleSelectionForTags(object, eventType, event){
            eventModifierKeys={
                'CTRL': event.ctrlKey || false,
                'SHIFT': event.shiftKey || false,
                'ALT': event.altKey || false,
                'META': event.metaKey || false,
            }
            dataExchange.sendParentMessage(
                'clickEvent',
                {
                    'type':eventType, 
                    "object":object.name,
                    'keys': eventModifierKeys,
                    'coordinates':{
                        'x': this.getMouseLocation_x(event),
                        'y': this.getMouseLocation_y(event)
                    }
                });

        },

        handleSelection:function handleSelection(object, eventType, event){
            if (typeof object.userData.name === 'undefined' && typeof object.parent.userData.name !== 'undefined') {
                object = object.parent;
            }
            eventModifierKeys={
                'CTRL': event.ctrlKey || false,
                'SHIFT': event.shiftKey || false,
                'ALT': event.altKey || false,
                'META': event.metaKey || false,
            }
            dataExchange.sendParentMessage(
                'clickEvent',
                {
                    'type':eventType, 
                    "object":object.name,
                    'keys': eventModifierKeys,
                    'coordinates':{
                        'x': this.getMouseLocation_x(event),
                        'y': this.getMouseLocation_y(event)
                    }
                });

            //     if (ThreeD_VL.current3DModelNode.Type.toUpperCase() === "IFCROOT") {
            //         contextMenuObjectType = "ELEMENT";
            //         zoomSelect = true;
            //     } else {
            //         contextMenuObjectType = "SUBSYSTEM";
            //     }
            // } else {
            //     if (ThreeD_VL.current3DModelNode.Type.toUpperCase() === "IFCROOT") {
            //         zoomSelect = true;
            //     }
            // }
            // if (zoomSelect) {
            //     var object = intersects[0].object;
            //     var tag = object.name;
            //     if (typeof intersects[0].object.userData.name === 'undefined' && typeof intersects[0].object.parent.userData.name !== 'undefined') {
            //         object = intersects[0].object.parent;
            //         tag = object.name;
            //     }
            //     if (type=="CONTEXT") {
            //         Three.DocumentEventHandler.MENUSELECTED = object;
            //         ContextMenu.mesh = object;
            //         element = TreeView_L.getTreeItemDataByTag(tag);
            //         if (element.length > 0 && element[0].SystemSubTypeId) {
            //             ThreeD_VL.selectedNode.SystemSubTypeId = element[0].SystemSubTypeId;
            //             ContextMenu.systemSubTypeId = element[0].SystemSubTypeId;
            //         }
            //     } else {
            //         Three.SELECTED = object;
            //         Three.Utils.select3DObject(object.id);
            //         ThreeD_VL.selectEMSNode(tag);
            //     }
            // }
        },

        onDocumentRightClick: function onDocumentRightClick(event) {
            console.log(event);
        },
        
        onDocumentMouseUp: function onDocumentMouseUp(event) {

            event.preventDefault();

            if (!Three.ThreeDTagUtils.isTagMode) {
                Three.controls.enabled = true;
            }

            if (Three.INTERSECTED) { Three.SELECTED = null; }

            if (!Three.isMobileTablet) {
                if (Three.NAV_INTERSECTED) { Three.NAV_SELECTED = null; }
            }

            if (!Three.ThreeDTagUtils.isTagMode) {
                Three.container.style.cursor = 'auto';
            }            

        },

        processNavCube_onClick: function processNavCube_onClick(hasIntersected, event) {
            Three.navMouse.x = ((Three.isMobileTablet ? event.touches[0].clientX - $(event.target).offset().left : event.offsetX) / Three.Initialize.NAV_WIDTH) * 2 - 1;
            Three.navMouse.y = -(((Three.isMobileTablet ? event.touches[0].clientY - $(event.target).offset().top : event.offsetY) - (Three.renderer.domElement.clientHeight - Three.Initialize.NAV_HEIGHT)) / Three.Initialize.NAV_HEIGHT) * 2 + 1;
            var navMouseY = Three.navMouse.y - (2 * Three.Initialize.NAV_VOFFSET / Three.Initialize.NAV_HEIGHT);
            var vector = new THREE.Vector3(Three.navMouse.x, Three.navMouse.y, 0.5).unproject(Three.navCam);
            var navcaster = new THREE.Raycaster(Three.navCam.position,
                vector.sub(Three.navCam.position).normalize());
            intersects = navcaster.intersectObjects(Three.navScene.getObjectByName("NavigationCube").children).filter(o => o.object.type !== "LineSegments");

            if (intersects.length > 0) {

               // if (loadedModule != "DOCUMENT") {
                    if (Three.navScene.getObjectByName("myNavCube")) {
                        Three.navScene.remove(Three.navScene.getObjectByName("myNavCube"));
                    }
               // }

                var intersected = intersects[0].object;
                Three.NAV_SELECTED = intersected;
                hasIntersected = true;
                Three.ViewToggle.handleFaceSelection(intersected.name);
            }
        },

        processNavCube_onMouseMove: function (hasIntersected, event) {
            //Three.mouse.x = (Three.DocumentEventHandler.getMouseLocation_x(event) / Three.container.clientWidth) * 2 - 1;
            //Three.mouse.y = -(Three.DocumentEventHandler.getMouseLocation_y(event) / Three.container.clientHeight) * 2 + 1;// + -TOOLBAR_HEIGHT
            Three.navMouse.x = ((Three.isMobileTablet ? event.touches[0].clientX - $(event.target).offset().left : event.offsetX) / Three.Initialize.NAV_WIDTH) * 2 - 1;
            Three.navMouse.y = -(((Three.isMobileTablet ? event.touches[0].clientY - $(event.target).offset().top : event.offsetY) - (Three.renderer.domElement.clientHeight - Three.Initialize.NAV_HEIGHT)) / Three.Initialize.NAV_HEIGHT) * 2 + 1;
            Three.navcaster.setFromCamera(Three.navMouse, Three.DocumentEventHandler.GetNavigationCamera());

            if (Three.navScene.getObjectByName("navHover")) {
                Three.navScene.remove(Three.navScene.getObjectByName("navHover"));
            }

            if (Three.NAV_SELECTED) { return; }

            var model = Three.navScene.getObjectByName("NavigationCube");
            var intersects = typeof model !== "undefined" ? Three.navcaster.intersectObjects(model.children) : null;
            if (intersects != null && intersects.length > 0) {

                hasIntersected = true;

                if (Three.NAV_INTERSECTED != intersects[0].object) {
                    Three.NAV_INTERSECTED = intersects[0].object;
                }

            } else {
                Three.NAV_INTERSECTED = null;
            }
        },

        process3DTag_onClick: function process3DTag_onClick(
            spriteIntersected
            , contextMenuObjectType
            , contextMenuObject
            , hasIntersected
            , event) {
            //console.log(this);
            Three.mouse.x = (Three.DocumentEventHandler.getMouseLocation_x(event) / Three.container.clientWidth) * 2 - 1;
            Three.mouse.y = -(Three.DocumentEventHandler.getMouseLocation_y(event) / Three.container.clientHeight) * 2 + 1;// + -TOOLBAR_HEIGHT

            Three.raycaster.setFromCamera(Three.mouse, Three.DocumentEventHandler.GetCamera());

            var spriteIntersects = Three.raycaster.intersectObjects(Three.ThreeDTagUtils.threeDTags).filter(o => o.object.type !== "LineSegments");
            if (spriteIntersects.length > 0) {

                /* 
                 * If The user right clicked on a tag, set Context Menu options for the 3D tag
                 * Otherwise, open the 3D Tag document in a new window
                 */
                spriteIntersected = true;
                contextMenuObjectType = "TAG";
                contextMenuObject = spriteIntersects[0].object;
                hasIntersected = true;

                //var sprite = spriteIntersects[0];
                //console.log("sprite url: ", sprite.object.documentUrl);
                //window.open(sprite.object.documentUrl);
                //Three.container.style.cursor = 'pointer';
                return {
                    spriteIntersected: true,
                    contextMenuObjectType: "TAG",
                    contextMenuObject: spriteIntersects[0].object,
                    hasIntersected: true
                }
            }
            return {
                spriteIntersected : spriteIntersected,
                contextMenuObjectType : contextMenuObjectType,
                contextMenuObject : contextMenuObject,
                hasIntersected : hasIntersected
            }
        },

        createNewTagFrom2DCoords: function createNewTagFrom2DCoords(X,Y){
            Three.mouse.x = (X / Three.container.clientWidth) * 2 - 1;
            Three.mouse.y = -(Y/ Three.container.clientHeight) * 2 + 1;
            Three.mouse.z = 1;
            Three.raycaster.setFromCamera(Three.mouse, Three.DocumentEventHandler.GetCamera());
            switch (Three.ModelLoader.getModel().type) {
                case "Group":
                    intersects = Three.raycaster.intersectObjects(Three.scene.getObjectByName("MainMesh").children, true).filter(o => o.object.type !== "LineSegments" && o.object.visible);
                    break;
                case "Mesh":
                    intersects = Three.raycaster.intersectObjects(Three.scene.children).filter(o => o.object.type !== "LineSegments" && o.object.visible);
                    break;
                default:
                    break;
            }
            this.createNew3DTag_onClick(intersects);
        },

        createNew3DTag_onClick: function createNew3DTag_onClick(intersects) {
            var intersect = intersects[0];
            var object = intersect.object;
            var point = intersect.point;
            //var local = (object.worldToLocal(point));

            console.log("object: ", object);
            console.log("point: ", point);
            //console.log("local: ", local);

            var factor = 1;
            var settings = {
                position: {
                    x: point.x * factor,
                    y: point.y * factor,
                    z: point.z * factor
                }
            }
            new ThreeDTag(settings);
        },


        getMouseLocation_x: function getMouseLocation_x(event) {
            switch (event.type) {
                case "touchend":
                    if (event.changedTouches != null) {
                        return (Three.isMobileTablet ? event.changedTouches[0].clientX - $(event.target).offset().left : event.offsetX);
                    } else {
                        return (Three.isMobileTablet ? event.originalEvent.changedTouches[0].clientX - $(event.target).offset().left : event.offsetX);
                    }
                    break;
                case "contextmenu":
                    return (Three.isMobileTablet ? event.clientX - $(event.target).offset().left : event.offsetX);
                    break;
                case "touchstart":
                    if (event.changedTouches != null) {
                        console.log($(event.target).offset().left);
                        return (Three.isMobileTablet ? event.changedTouches[0].clientX - $(event.target).offset().left : event.offsetX);
                    } else {
                        console.log($(event.target).offset().left);
                        return (Three.isMobileTablet ? event.originalEvent.changedTouches[0].clientX - $(event.target).offset().left : event.offsetX);
                    }
                    break;
                case "singletap":
                    if (event.changedPointers != null) {
                        return (Three.isMobileTablet ? event.changedPointers[0].clientX - $(event.target).offset().left : event.offsetX);
                    }
                    return (Three.isMobileTablet ? event.pointers[0].clientX - $(event.target).offset().left : event.offsetX);
                    break;
                case "doubletap":
                    if (event.changedPointers != null) {
                        return (Three.isMobileTablet ? event.changedPointers[0].clientX - $(event.target).offset().left : event.offsetX);
                    }
                    return (Three.isMobileTablet ? event.pointers[0].clientX - $(event.target).offset().left : event.offsetX);
                    break;
                case "press":
                    return (Three.isMobileTablet ? event.pointers[0].clientX - $(event.target).offset().left : event.offsetX);
                    break;
                case "fakeClick":
                    return  event.offsetX;
                    break;
                default:
                    break;
            }
            return (Three.isMobileTablet ? event.originalEvent.touches[0].clientX - $(event.target).offset().left : event.offsetX);
        },
        getMouseLocation_y: function getMouseLocation_y(event) {
            switch (event.type) {
                case "touchend":
                    if (event.changedTouches != null) {
                        return (Three.isMobileTablet ? event.changedTouches[0].clientY - $(event.target).offset().top : event.offsetY);
                    } else {
                        return (Three.isMobileTablet ? event.originalEvent.changedTouches[0].clientY - $(event.target).offset().top : event.offsetY);
                    }
                    break;
                case "contextmenu":
                    return (Three.isMobileTablet ? event.clientY - $(event.target).offset().top : event.offsetY);
                    break;
                case "touchstart":
                    if (event.changedTouches != null) {
                        return (Three.isMobileTablet ? event.changedTouches[0].clientY - $(event.target).offset().top : event.offsetY);
                    } else {
                        return (Three.isMobileTablet ? event.originalEvent.changedTouches[0].clientY - $(event.target).offset().top : event.offsetY);
                    }
                    break;
                case "singletap":
                    if (event.changedPointers != null) {
                        return (Three.isMobileTablet ? event.changedPointers[0].clientY - $(event.target).offset().top : event.offsetY);
                    }
                    return (Three.isMobileTablet ? event.pointers[0].clientY - $(event.target).offset().top : event.offsetY);
                    break;
                case "doubletap":
                    if (event.changedPointers != null) {
                        return (Three.isMobileTablet ? event.changedPointers[0].clientY - $(event.target).offset().top : event.offsetY);
                    }
                    return (Three.isMobileTablet ? event.pointers[0].clientY - $(event.target).offset().top : event.offsetY);
                    break;
                case "press":
                    return (Three.isMobileTablet ? event.pointers[0].clientY - $(event.target).offset().top : event.offsetY);
                    break;
                case "fakeClick":
                    return event.offsetY;
                    break;
                default:
                    break;
            }
            return (Three.isMobileTablet ? event.originalEvent.touches[0].clientY - $(event.target).offset().top : event.offsetY);
        },

        setCursorStyle_onMouseMove: function setCursorStyle_onMouseMove(hasIntersected) {
            if (!Three.ThreeDTagUtils.isTagMode) {
                if (hasIntersected) {
                    Three.container.style.cursor = 'pointer';
                }
                else {
                    Three.container.style.cursor = 'auto';
                }
            } else {
                if (hasIntersected) {
                    Three.container.style.cursor = 'crosshair';
                } else {
                    Three.container.style.cursor = 'not-allowed';
                }
            }
        }

    }

    return DocumentEventHandler;

})();


