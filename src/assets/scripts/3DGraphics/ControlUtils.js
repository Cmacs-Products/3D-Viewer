var ControlUtils = (function () {
    function ControlUtils() { }
    
    ControlUtils.prototype = {
        constructor: ControlUtils,

        intiControls: function () {
            //Three.controls = new THREE.OrbitControls(Three.camera, document.getElementById('ThreeJS').childNodes[0], Three);
            Three.controls = new THREE.OrbitControls(Three.camera, document.getElementById('ThreeJS'), Three);
        },

        initTransformControls: function () {
            Three.transformControls = new THREE.TransformControls(Three.camera, Three.renderer.domElement);
            Three.scene.add(Three.transformControls);
        },

        hideTransformControls: function () {
            Three.transformControls.visible = false;
            Three.transformControls.detach(Three.ModelLoader.getModel());
        },

        showTransformControls: function () {            
            Three.transformControls.visible = true;
            Three.transformControls.attach(Three.ModelLoader.getModel());
        },
    }

    return ControlUtils;

})();