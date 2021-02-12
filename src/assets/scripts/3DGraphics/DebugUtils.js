/*
    DebugUtils
*/

var DebugUtils = (function () {

    function DebugUtils() {

    }

    DebugUtils.prototype = {

        constructor: DebugUtils,

        logCameraPosition: function logCameraPosition() {
            console.log("position: ", Three.camera.position);
        },

        moveCameraX: function (position) {
            position = typeof position !== "undefined" ? position : 10;
            console.log(Three.camera.position);
            Three.camera.position.x += position;
            console.log(Three.camera.position);
        },

        moveCameraY: function moveCameraY() {
            position = typeof position !== "undefined" ? position : 10;
            console.log(Three.camera.position);
            Three.camera.position.y += position;
            console.log(Three.camera.position);
        },

        moveCameraZ: function moveCameraZ() {
            position = typeof position !== "undefined" ? position : 10;
            console.log(Three.camera.position);
            Three.camera.position.z += position;
            console.log(Three.camera.position);
        },

        logMeshDimensions: function logMeshDimensions() {
            var mesh = Three.ModelLoader.getModel();
            var myBox = new THREE.Box3;
            myBox.setFromObject(mesh);
            console.log("mesh: ", myBox);
        },

        logNavDimensions: function logNavDimensions() {
            var mesh = getNav();
            var myBox = new THREE.Box3;
            myBox.setFromObject(mesh);
            console.log("nav: ", myBox);
        },

        translateModelZ: function logNavDimensions() {
            var mesh = Three.ModelLoader.getModel();
            mesh.translateZ(1);
        },

    }

    return DebugUtils;

})();

