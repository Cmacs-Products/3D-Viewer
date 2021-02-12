var SectioningToolUtils = (function () {

    function SectioningToolUtils() {

    }

    SectioningToolUtils.prototype = {
        constructor: SectioningToolUtils,

        loadSectioningTool: function () {
            
            Sectioning.isCapping = true;

            Three.ViewToggle.setTopView();
            
            //Three.ToolbarEventHandler.hideTranslateTools();
            //Three.ThreeDToolbar.closeGui();
            //Three.ToolbarEventHandler.hideSceneManipulationIcons();
            
            var mesh = Three.ModelLoader.getModel().clone();

            // Get the max and min dimensions to dynamically generate the sectioning cube
            var box = new THREE.Box3;
            box = box.setFromObject(mesh);
            console.log(box);
            var settings = {
                low: box.min,
                high: box.max
            };

            // Store the max and min dimensions of the model so that the 
            // sectioning tool knows when it expand or collapse anymore
            // We need to do it this way because JavaScript is pass by value and will overwrite values
            var box2 = new THREE.Box3;
            box2 = box2.setFromObject(mesh);
            Sectioning.sectioningLimits = {
                low: box2.min,
                high: box2.max
            };            

            Sectioning.sectioning = new CAPS.Simulation();
            Sectioning.sectioning.init(settings);
            Sectioning.sectioning.initScene(mesh);
            Sectioning.sectioningHasLoaded = true;
            
            $("#ThreeJS").hide();
            $("#Sectioning").show()
        },

        killSectioningTool: function () {
            
            Sectioning.isCapping = false;
            
            //Three.ViewToggle.setTopView();

            //Three.ThreeDToolbar.openGui();
            //Three.ToolbarEventHandler.showTranslateTools();
            //Three.ToolbarEventHandler.showSceneManipulationIcons();

            $("#ThreeJS").show();
            $("#Sectioning").empty();
            $("#Sectioning").hide();
        },

        copyAndUpdate: function copyAndUpdate() {
            //console.log(Sectioning.isCapping);

            if (!Sectioning.isCapping) {
                var camPos = Sectioning.camera.position;
                var navPos = Sectioning.navCam.position;
                var meshPos = Sectioning.scene.getObjectByName("MainModel").position;

                Three.camera.position.set(camPos.x, camPos.y, camPos.z);
                Three.camera.lookAt(new THREE.Vector3(0, 0, 0));

                Three.navCam.position.set(navPos.x, navPos.y, navPos.z);
                Three.navCam.lookAt(new THREE.Vector3(0, 0, 0));

                Three.ModelLoader.getModel().position.set(meshPos.x, meshPos.y, meshPos.z);

                Three.render();
            }
        },
    }

    return SectioningToolUtils;

})();