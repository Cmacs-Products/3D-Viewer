/*
    Render Loop
*/
Three.animate = function(time) {
    requestAnimationFrame(Three.animate);
    Three.render();
    Three.update(time);

    if (!Three.initialized) {
        Three.initialized = true;
    }

}

Three.update = function(time) {

    var delta = Three.clock.getDelta();

    if (Three.mouseIsOnDiv == true) {
        if (Three.keyboard.pressed("t")) {
            mesh = Three.ModelLoader.getModel();
            if (mesh !== undefined) {
                Three.ViewToggle.setTopView();
            }
        } else if (Three.keyboard.pressed("l")) {
            mesh = Three.ModelLoader.getModel();
            if (mesh !== undefined) {
                Three.ViewToggle.setLeftView();
            }
        } else if (Three.keyboard.pressed("f")) {
            mesh = Three.ModelLoader.getModel();
            if (mesh !== undefined) {
                Three.ViewToggle.setFrontView();
            }
        } else if (Three.keyboard.pressed("a")) {
            mesh = Three.ModelLoader.getModel();
            if (mesh !== undefined) {
                Three.ViewToggle.setAngleView();
            }
        } else if (Three.keyboard.pressed("r")) {
            mesh = Three.ModelLoader.getModel();
            if (mesh !== undefined) {
                Three.ViewToggle.setRightView();
            }
        } else if (Three.keyboard.pressed("b")) {
            mesh = Three.ModelLoader.getModel();
            if (mesh !== undefined) {
                Three.ViewToggle.setBottomView();
            }
        } else if (Three.keyboard.pressed("v")) {
            mesh = Three.ModelLoader.getModel();
            if (mesh !== undefined) {
                Three.ViewToggle.setBackView();
            }
        } else if (Three.keyboard.pressed("m")) {
            Three.ViewToggle.toggleFullScreen();
        } else if (Three.keyboard.pressed("escape")) {
            if (Three.DocumentEventHandler.showAllElementsWithSubtype) {
                ThreeD_VL.removeHighlight();
            } else {
                Three.Utils.remove3DSelection();
            }
        }
    }

    if (typeof Three.GuiControls !== "undefined" && Three.GuiControls !== null) {
        var mesh = Three.ModelLoader.getModel();
        Three.GuiControls.scale.x = mesh.scale.x;
        Three.GuiControls.scale.y = mesh.scale.y;
        Three.GuiControls.scale.z = mesh.scale.z;

        Three.GuiControls.position.x = mesh.position.x;
        Three.GuiControls.position.y = mesh.position.y;
        Three.GuiControls.position.z = mesh.position.z;

        Three.GuiControls.rotation.x = mesh.rotation.x;
        Three.GuiControls.rotation.y = mesh.rotation.y;
        Three.GuiControls.rotation.z = mesh.rotation.z;
    }
    
    TWEEN.update(time);

    if (Three.controls.enabled){
        Three.controls.update();




        // update navCam
        if (Three.navCam) {

            try {
                var camera = Three.CameraUtils.getCurrentCamera();

                Three.navCam.SphereCoors.setFromVector3((Three.camera.position.clone()).sub(Three.controls.target));
                Three.navCam.SphereCoors.radius = Three.ViewToggle.viewDistanceFace;
                Three.navCam.position.setFromSpherical(Three.navCam.SphereCoors);
                Three.navCam.lookAt(new THREE.Vector3(0, 0, 0));
            }
            catch (e) {
                console.log("Could not set nav cam.", e);
            }
            //Three.navCam.SphereCoors.setFromVector3((Three.camera.position.clone()).sub(Three.controls.target))
            //Three.navCam.SphereCoors.radius = Three.ViewToggle.viewDistanceFace
            //Three.navCam.position.setFromSpherical(Three.navCam.SphereCoors)
            //Three.navCam.lookAt(new THREE.Vector3(0, 0, 0))
        }
    }
}

Three.render = function () {

    if (!Sectioning.isCapping && Three.renderer != null) {
        Three.renderer.clear();
        Three.renderer.setViewport(0, 0, Three.container.clientWidth, Three.container.clientHeight);
        if (Three.container.clientWidth > 0 && Three.container.clientHeight > 0) {
        if (Three.ModelLoader.ambientOcclusion) {
            Three.ModelLoader.effectComposer.render();

        } else {
            
            Three.renderer.render(Three.scene, Three.camera);
            }
        }
    }
                
    if (Three.navCubeLoaded && !Three.isMobileTablet && !Sectioning.isCapping) {
        Three.navRenderer.clearDepth();
        Three.navRenderer.setViewport(0, Three.Initialize.NAV_VOFFSET, Three.Initialize.NAV_WIDTH, Three.Initialize.NAV_HEIGHT);
        //Three.navRenderer.domElement.style.border = "1px solid red";
        Three.navRenderer.render(Three.navScene, Three.navCam);
    }

    if (Three.getImageData === true) {
        var imgData = Sectioning.isCapping ? Sectioning.renderer.domElement.toDataURL() : Three.renderer.domElement.toDataURL();
        Three.Utils.exportCanvas(imgData);
        Three.getImageData = false;

        if (Three.ThreeDTagUtils.isTagMode) {
            Three.ThreeDTagUtils.showAllTags();
            //Three.ToolbarEventHandler.showTransformControls();
            Three.ThreeDTagUtils.disableTagMode();
        }
    }
}