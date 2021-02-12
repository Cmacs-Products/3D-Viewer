var NavigationCube = (function () {

    function NavigationCube() {
        this.SCREEN_WIDTH = Three.container.clientWidth;
        this.SCREEN_HEIGHT = Three.container.clientHeight;
        this.VIEW_ANGLE = 45;
        this.NEAR = 0.1;
        this.FAR = 20000;
        this.MAIN_ASPECT = this.SCREEN_WIDTH / this.SCREEN_HEIGHT;
        this.perspectiveCamera = null;
        this.orthographicCamera = null;
        this.namespace = "";
        this.NAV_ASPECT = Three.Initialize.NAV_WIDTH / Three.Initialize.NAV_HEIGHT;
    }

    NavigationCube.prototype = {

        constructor: NavigationCube,

        create: function (namespace) {
            this.namespace = namespace;
            namespace.navScene = new THREE.Scene();//Three.scene;//

            var mtlLoader = new THREE.MTLLoader();
            var url = "/ClientApp/src/assets/images/3DViewer/block_names_09_in.mtl";
            mtlLoader.load(url, function (materials) {
                var objLoader = new THREE.OBJLoader();
                materials.preload();
                objLoader.setMaterials(materials);
                var url = "/ClientApp/src/assets/images/3DViewer/block_names_09_in.obj";
                objLoader.load(url, function (mesh) {
                    namespace.navCube = mesh;
                    namespace.navCube.name = "NavigationCube";
                    namespace.navScene.add(namespace.navCube);
                });
            });

            var frustumSize = 1000;
            var aspect = this.NAV_ASPECT;

            // Camera
            this.perspectiveCamera = new THREE.PerspectiveCamera(this.VIEW_ANGLE, this.NAV_ASPECT, this.NEAR, this.FAR)
            this.orthographicCamera = new THREE.OrthographicCamera(frustumSize * aspect / -2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / -2, -200, 200);

            namespace.navCam = new THREE.CombinedCamera(Three.Initialize.NAV_WIDTH, Three.Initialize.NAV_HEIGHT, 45, 1, 1000, -500, 1000);
            //namespace.navCam = this.perspectiveCamera;

            this.perspectiveCamera.name = "Nav Cube Perspective Camera";
            this.orthographicCamera.name = "Nav Cube Orthographic Camera";
            
            //namespace.navScene.add(this.perspectiveCamera);
            //namespace.navScene.add(this.orthographicCamera);

            if (namespace.namespace === "Sectioning") {
                var position = Three.navCam.position;
                namespace.navCam.position.set(position.x, position.y, position.z);
            } else {
                namespace.navCam.position.set(7, 7, 7);
            }

            //namespace.navCam.position.set(7, 7, 7);
            namespace.navCam.lookAt(namespace.navScene.position);
            namespace.navCam.name = "NavigationCamera";

            //if (namespace === "Sectioning") {
            //    var position = Three.camera.position;
            //    namespace.navCam.position.set(position.x, position.y, position.z);
            //} else {
            //    namespace.navCam.position.set(7, 7, 7);
            //}

            //Three.navScene.add(Three.navCam);

            // Lights
            var ambientLight = new THREE.AmbientLight(0xebebeb);
            var directLight = new THREE.DirectionalLight(0xebebeb, 1.0);
            ambientLight.name = "NavAmbientLight";
            directLight.name = "NavDirectLight";
            namespace.navScene.add(ambientLight);
            namespace.navScene.add(directLight);

            // Renderer
            namespace.navRenderer = namespace.renderer;

            // Controls
            //namespace.navControls = new THREE.OrbitControls(namespace.navCam, namespace.renderer.domElement);//, true
            //namespace.navControls.enablePan = false;
            //namespace.navControls.enableZoom = false;
            //namespace.navControls.enableRotate = true;
            // RvdV: I think we should be able to remove navcontrols and read the main controls and set the navCam at each iteration
            // As an intermediate to the navCam position and orientation, and the Three.controls, we'll store the Spherical coordinates
            namespace.navCam.SphereCoors = new THREE.Spherical

        },

        setPerspectiveCamera: function () {
            this.namespace.navCam = this.perspectiveCamera;
            this.namespace.navCam.SphereCoors = new THREE.Spherical
            this.namespace.navCam.position.set(7, 7, 7);
        },

        setOrthographicCamera: function () {
            this.namespace.navCam = this.orthographicCamera;
            this.namespace.navCam.SphereCoors = new THREE.Spherical
            this.namespace.navCam.position.set(1, 1, 1);
            //this.namespace.navCam.zoom =  
            this.namespace.navCam.lookAt(this.namespace.navScene.position);
        },

    }

    // if (loadedModule !== "EMS") {
    return NavigationCube;
    // }
})();