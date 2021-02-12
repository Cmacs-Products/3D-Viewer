
var Initialize = (function () {

    function Initialize() {
        this.SCREEN_WIDTH = Three.container.clientWidth;
        this.SCREEN_HEIGHT = Three.container.clientHeight;
        this.VIEW_ANGLE = 45;
        this.NEAR = 0.1;
        this.FAR = 20000;
        this.pixelRatio = window.devicePixelRatio;
        this.MAIN_ASPECT = this.SCREEN_WIDTH / this.SCREEN_HEIGHT;

        this.NAV_WIDTH = 200;
        this.NAV_HEIGHT = 200;
        this.NAV_VOFFSET = 0;

        this.NAV_ASPECT = 1;
        this.directLight;

        
    }
    
    Initialize.prototype = {

        constructor: Initialize,
        
        initViewer: function initViewer() {

            // initilize the scene

            Three.scene = new THREE.Scene();

            // if (loadedModule == "DOCUMENT") {
               Three.CameraUtils.initCameras();
            // }
            //Three.camera = new THREE.PerspectiveCamera(this.VIEW_ANGLE, this.MAIN_ASPECT, this.NEAR, this.FAR)

            Three.renderer = new THREE.WebGLRenderer({ antialias: true });//CanvasRenderer();
            

            Three.scene.name = "3DViewer Main Scene";
 
            //let directLight = new THREE.DirectionalLight(0xffffff, 0.8);
            this.directLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
            this.directLight.position.set(4500, 9000, 9000);
            Three.scene.add(this.directLight);
            this.secondDirectLight = new THREE.DirectionalLight(0xFFFFFF, 0.6);
            this.secondDirectLight.position.set(-4500, 0, -9000);
            Three.scene.add(this.secondDirectLight); 
            this.thirdDirectLight = new THREE.DirectionalLight(0xFFFFFF, 0.2);
            this.thirdDirectLight.position.set(0, 11000, 0);
            Three.scene.add(this.thirdDirectLight); 
            Three.scene.add(new THREE.AmbientLight(0xFFFFFF, 0.3));

            //  Set renderer property
            Three.renderer.setSize(this.SCREEN_WIDTH, this.SCREEN_HEIGHT);
            Three.renderer.shadowMap.enabled = true;
            Three.renderer.shadowMapSoft = true;
            //Three.renderer.shadowMapBias = 0.0039;
            Three.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            Three.renderer.localClippingEnabled = true;
            Three.renderer.autoClear = false;
            Three.renderer.gammaInput = true;
            Three.renderer.gammaOutput = true;
            Three.renderer.getDrawingBufferSize = function () {
                return {
                    width: Three.container.clientWidth * 1,
                    height: Three.container.clientHeight * 1
                };
            };
            Three.gridHelper = new THREE.GridHelper(60, 60);
            Three.gridHelper.name = "Grid";
           // Three.gridHelper.receiveShadow = true;
            Three.scene.add(Three.gridHelper);

            var BBhelper = new THREE.BoxHelper(Three.scene.getObjectByName("MainMesh"));
            if (!BBhelper.geometry.boundingSphere) {
                BBhelper.geometry.computeBoundingSphere();
            }
            var BSphere = BBhelper.geometry.boundingSphere;

            Three.container.appendChild(Three.renderer.domElement);
            //Three.renderer.domElement.style.border = "1px solid red";

            Three.DocumentEventHandler.onResizeContainer();
                        
            
        },

        //getDrawingBufferSize : function () {

            
        //    var width = this.SCREEN_WIDTH * this.pixelRatio;
        //    var height = this.SCREEN_HEIGHT * this.pixelRatio;
            

        //},


        initInfoBox: function initInfoBox() {
            Three.info = document.createElement('div');

            Three.info.setAttribute("id", "myID");
            Three.info.style.position = 'absolute';
            // if (loadedModule == "DOCUMENT") {
                Three.info.style.top = '90px';
            // }
            // else {
            //     Three.info.style.top = '10px';
            // }
            Three.info.style.left = '10px';
            Three.info.style.fontSize = '24px';
            Three.info.style.width = '100%';
            Three.info.style.textAlign = 'left';
            Three.info.style.color = "crimson";
            Three.container.appendChild(Three.info);
            Three.info.innerHTML = "CAST Viewer ";
        },
        
    }

    return Initialize;

})();
