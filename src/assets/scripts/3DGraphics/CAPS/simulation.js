(function () {

    CAPS.Simulation = function (settings) {

        // Main Scene
        this.scene = undefined;

        // Scene which contains the capping cube
        this.capsScene = undefined;

        // Contains clone of the backside of model
        this.backStencil = undefined;

        // Contains clone of the frontside of the model
        this.frontStencil = undefined;

        // Standard ThreeJS objects
        this.camera = undefined;
        this.renderer = undefined;
        this.controls = undefined;
        this.transformControls = undefined;

        // Check box to determine if it should be capped or clipped
        this.showCaps = true;

        //this.model = null;
        this.modelCenter = null;
        //this.init(url);

    };

    CAPS.Simulation.prototype = {

        constructor: CAPS.Simulation,

        init: function (settings) {

            var self = this;
            
            // Get the div that will hold the renderer
            var container = document.getElementById('Sectioning');

            // Clone current camera and point it at center of scene
            if (Three.CameraUtils.getCameraMode() == "ORTHOGRAPHIC") {
                this.camera = Three.camera.cameraO.clone();
            } else {
                this.camera = Three.camera.cameraP.clone();
            }
            
            // Set camera position
            this.camera.position.set(Three.camera.position.x, Three.camera.position.y, Three.camera.position.z);
            
            // Initialize all the scenes           
            this.scene =  new THREE.Scene();
            this.capsScene = new THREE.Scene();
            this.backStencil = new THREE.Scene();
            this.frontStencil = new THREE.Scene();

            // Name scenes
            this.capsScene.name = "Cap Scene"
            this.backStencil.name = "Back Stencil Scene"
            this.frontStencil.name = "Front Stencil Scene"

            // Add grid only if Three.scene has grid
            if (Three.Utils.isGridVisible()) {
                var gridHelper = new THREE.GridHelper(60, 60);
                gridHelper.name = "Grid";
                this.scene.add(gridHelper);
            }
                        
            // This generates the the capping cube
            this.selection = new CAPS.Selection(
                settings.low,
                settings.high
            );

            this.capsScene.add(this.selection.boxMesh);
            this.scene.add(this.selection.touchMeshes);
            this.scene.add(this.selection.displayMeshes);
            
            // Create renderer
            // NOTE: Rendering is similar to how we render do our rendering
            this.renderer = new THREE.WebGLRenderer({
                antialias: true,
                preserveDrawingBuffer: true
            });

            // Configure renderer
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setClearColor(Three.Gui.backgroundColor);
            this.renderer.autoClear = false;
            //this.renderer.domElement.style.border = "1px solid green";
            
            Sectioning.renderer = this.renderer;
            Sectioning.scene = this.scene;
            Sectioning.camera = this.camera;
            Sectioning.capsScene = this.capsScene;
            Sectioning.backStencil = this.backStencil;
            Sectioning.frontStencil = this.frontStencil;
            Sectioning.sectioningHasLoaded = true;

            container.appendChild(this.renderer.domElement);

            // This (seemingly) deffers the rendering to achieve a certain frame rate while dragging the capping box.
            var throttledRender = CAPS.SCHEDULE.deferringThrottle(this._render, this, 20);//40);
            this.throttledRender = throttledRender;
            Sectioning._render = this._render;
            Sectioning.throttledRender = this.throttledRender;

            // This handles the actual selection and dragging of the capping cube
            // must come before OrbitControls, so it can cancel them
            CAPS.picking(this);
            
            // Create the controls and use throttlesRender when the contols update
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement, Sectioning);      
            this.controls.addEventListener('change', throttledRender);
            Sectioning.controls = this.controls;

            // Update the camera and renderer when the window is resized
            Sectioning.onWindowResize = this.onWindowResize;
            window.addEventListener('resize', this.onWindowResize, false);

            // Set flags and events for showCaps input
            var showCapsInput = document.getElementById('showCaps');
            this.showCaps = true; //showCapsInput.checked;
            var onShowCaps = function () {
                self.showCaps = showCapsInput.checked;
                throttledRender();
            };

            console.log("selection: ", this.selection);

            // Start rendering
            throttledRender();
        },

        initScene: function (collada) {

            var isMainMesh = false;
            var materialColor;

            //Sectioning.model = collada;

            var setMaterial = function (node, material) {
                node.material = material;
                if (node.children) {
                    for (var i = 0; i < node.children.length; i++) {
                        setMaterial(node.children[i], material);
                    }
                }
            };

            // Apply materials
            var setMaterial2 = function (node) {
                if (node.name === "2AQ17MYED3a9tNi1kCYTti") {
                    console.log(node);
                    var test = "";
                }

                if (node.material && node.material.length && node.material.length > 0) {

                    node.material = CAPS.MATERIAL.sheet2(node.material[0].color);

                }
                else if (node.material && node.material.color) {

                    node.material = CAPS.MATERIAL.sheet2(node.material.color);

                }
                else if (node.children) {
                    for (var i = 0; i < node.children.length; i++) {
                        var child = node.children[i];
                        //console.log(child.material.length);
                        setMaterial2(child);
                    }
                }
            }

            // This is the back sideclone (red)
            var back = collada.clone();
            back.name = "BackStencil";
            setMaterial(back, CAPS.MATERIAL.backStencil);
            back.updateMatrix();           
            this.backStencil.add(back);

            // This is the front side clone (red)
            var front = collada.clone();
            front.name = "FrontStencil";
            setMaterial(front, CAPS.MATERIAL.frontStencil);
            front.updateMatrix();
            this.frontStencil.add(front);

            // And this is the main mesh (blue) you see on parts that arent clipped
            setMaterial2(collada);
            //setMaterial(collada, CAPS.MATERIAL.sheet);

            this.selection.setUniforms();
            collada.name = "MainModel";
            collada.updateMatrix();
            this.scene.add(collada);
            
            // Have the controls orbit around the model instead of the center of the scene
            var colladaBoxHelper = new THREE.BoxHelper(collada);

            // Compute bounding sphere if not already computed
            if (!colladaBoxHelper.geometry.boundingSphere) {
                colladaBoxHelper.geometry.computeBoundingSphere();
            }

            // Get the center of the model
            var colladaBoundingSphere = colladaBoxHelper.geometry.boundingSphere;
            var colladaCentroid = colladaBoundingSphere.center.clone();
            colladaCenter = colladaCentroid.clone();
            this.modelCenter = colladaCenter;

            // Make controls orbit around model center
            this.controls.target.set(colladaCenter.x, colladaCenter.y, colladaCenter.z);

            // Make camera look at model center
            this.camera.lookAt(colladaCenter);

            // Move plane to model center
            Sectioning.plane.position.set(colladaCenter.x, colladaCenter.y, colladaCenter.z);
            //Sectioning.plane.lookAt(new THREE.Vector3());

            this.throttledRender();
            
            var debug = false;
            if (debug) { this.debug(); }
            
        },

        debug: function () {
            console.log(this.scene);
            console.log(this.capsScene);
            console.log(this.backStencil);
            console.log(this.frontStencil);

            window.scene = this.scene;
            window.scene = this.capsScene;
            window.scene = this.backStencil;
            window.scene = this.frontStencil;
        },

        // The render function used depracated methods that don't exist in the newer ThreeJS version
        // so those were added back in from the older version
        _render: function () {

            this.renderer.clear();

            var gl = this.renderer.context;

            //this.renderer.clearDepth();
            //this.renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
            //this.renderer.render(this.scene, this.camera);

            this.renderer.state.setStencilTest(true);

            //this.renderer.clearDepth();
            this.renderer.state.setStencilFunc(gl.ALWAYS, 1, 0xff);
            this.renderer.state.setStencilOp(gl.KEEP, gl.KEEP, gl.INCR);
            //this.renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
            this.renderer.render(this.backStencil, this.camera);

            //this.renderer.clearDepth();
            this.renderer.state.setStencilFunc(gl.ALWAYS, 1, 0xff);
            this.renderer.state.setStencilOp(gl.KEEP, gl.KEEP, gl.DECR);
            //this.renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
            this.renderer.render(this.frontStencil, this.camera);

            //this.renderer.clearDepth();
            this.renderer.state.setStencilFunc(gl.EQUAL, 1, 0xff);
            this.renderer.state.setStencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
            //this.renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
            this.renderer.render(this.capsScene, this.camera);

            this.renderer.state.setStencilTest(false);

            this.renderer.render(this.scene, this.camera);
        },

        dispatchWindowResizeEvent: function () {
            var event = new Event("resize");
            window.dispatchEvent(event, Sectioning.onWindowResize, false);
        },

        onWindowResize: function () {
            console.log("resized!");
            Sectioning.camera.aspect = window.innerWidth / window.innerHeight;
            Sectioning.camera.updateProjectionMatrix();
            Sectioning.renderer.setSize(window.innerWidth, window.innerHeight);
            Sectioning.throttledRender();
        },

        attachCapsTransformControls: function () {
            this.transformControls0 = new THREE.TransformControls(this.camera, this.renderer.domElement);
            this.transformControls0.addEventListener('change', this._render());
            this.transformControls0.attach(this.selection.boxMesh);
            this.capsScene.add(this.transformControls0);
        },

        attachLastTransformControls: function () {
            this.transformControls1 = new THREE.TransformControls(this.camera, this.renderer.domElement);
            this.transformControls2 = new THREE.TransformControls(this.camera, this.renderer.domElement);
            this.transformControls3 = new THREE.TransformControls(this.camera, this.renderer.domElement);
            this.transformControls1.addEventListener('change', this._render());
            this.transformControls2.addEventListener('change', this._render());
            this.transformControls3.addEventListener('change', this._render());
            this.transformControls1.attach(collada);
            this.transformControls2.attach(back);
            this.transformControls3.attach(front);
            this.scene.add(this.transformControls1);
            this.backStencil.add(this.transformControls2);
            this.frontStencil.add(this.transformControls3);
        }

    };


})();

