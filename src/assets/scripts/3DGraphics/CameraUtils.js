var CameraUtils = (function () {

    function CameraUtils() {
        this.SCREEN_WIDTH = null;
        this.SCREEN_HEIGHT = null;
        this.VIEW_ANGLE = 45;
        this.NEAR = 0.1;
        this.ORTHO_NEAR = -1000;
        this.FAR = 10000;
        this.MAIN_ASPECT = this.SCREEN_WIDTH / this.SCREEN_HEIGHT;
        this.cameraMode = "PERSPECTIVE";
    }
    
    CameraUtils.prototype = {
        constructor: CameraUtils,

        initCameras: function () {
            
            this.SCREEN_WIDTH = Three.container.clientWidth;
            this.SCREEN_HEIGHT = Three.container.clientHeight;

            var frustumSize = 1000;
            var aspect = this.MAIN_ASPECT;
            var cameraLight = new THREE.PointLight(0xffffff, 0.5);

            var width,
                height,
                fov,
                near,
                far,
                orthoNear,
                orthoFar

            var perspectiveCamera = new THREE.PerspectiveCamera(this.VIEW_ANGLE, this.MAIN_ASPECT, this.NEAR, this.FAR)
            var orthographicCamera = new THREE.OrthographicCamera(frustumSize * aspect / -2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / -2, -200, 200);
            var combinedCamera = new THREE.CombinedCamera(this.SCREEN_WIDTH / 2, this.SCREEN_HEIGHT / 2, this.VIEW_ANGLE, this.NEAR, this.FAR, this.ORTHO_NEAR, this.FAR);
            //var combinedCamera = new THREE.CombinedCamera(window.innerWidth / 2, window.innerHeight / 2, 45, 1, 1000, -500, 1000);
            
            Three.camera = combinedCamera;//
            //Three.camera.add(new THREE.PointLight(0xffffff, 0.5));
            Three.camera.position.set(5,5,5);
            Three.scene.add(Three.camera);
            Three.ControlUtils.intiControls();
        },

        toggleCamera: function () {
            switch (Three.camera.type) {
                case "PerspectiveCamera":
                    this.setOrthographicCamera();
                    break;
                case "OrthographicCamera":
                    this.setPerspectiveCamera();
                    break;
            }
        },

        setPerspectiveCamera: function () {    
            Three.camera.toPerspective();
            this.checkAndAddCameraLight();
            this.cameraMode = "PERSPECTIVE";
            ThreeDUtils.zoomScale = false;
            $('#ZoomButton').addClass("k-state-disabled");
            Three.DocumentEventHandler.resizeContainer();
        },

        setOrthographicCamera: function () {
            Three.camera.toOrthographic();
            this.checkAndAddCameraLight();
            this.cameraMode = "ORTHOGRAPHIC";
            ThreeDUtils.zoomScale = true;
            Three.Utils.switchToOrthoZoom();
            $('#ZoomButton').removeClass("k-state-disabled");
            $('#ZoomButton').addClass("k-state-enabled");
            Three.DocumentEventHandler.resizeContainer();
        },
        
        getCurrentCamera: function () {
            if (Three.camera.type === "Camera") {
                if (Three.camera.inPerspectiveMode) {
                    return Three.camera.cameraP;
                }
                else {
                    return Three.camera.cameraO;
                }
            }
            else {
                return Three.camera
            }
        },
        
        getCameraMode: function () {
            return this.cameraMode;
        },

        checkAndAddCameraLight: function () {
            if (Three.camera.children.length <= 0) {
                var cameraLight = new THREE.PointLight(0xffffff, 0.5);
                Three.camera.add(cameraLight);
            }
        },
    }

    return CameraUtils;

})(); 
