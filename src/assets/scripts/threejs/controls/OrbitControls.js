/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 */

// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
//
//    Orbit - left mouse / touch: one finger move
//    Zoom - middle mouse, or mousewheel / touch: two finger spread or squish
//    Pan - right mouse, or arrow keys / touch: three finger swipe

THREE.OrbitControls = function (object, domElement, namespace) {

    // This is the Scene
    this.object = object;

    // this is the camera
    this.domElement = (domElement !== undefined) ? domElement : document;

    // Set to false to disable this control
    this.enabled = true;

    // "target" sets the location of focus, where the object orbits around
    this.target = new THREE.Vector3();

    // How far you can dolly in and out ( PerspectiveCamera only )
    this.minDistance = 0;
    this.maxDistance = Infinity;

    // How far you can zoom in and out ( OrthographicCamera only )
    this.minZoom = 0;
    this.maxZoom = Infinity;

    // How far you can orbit vertically, upper and lower limits.
    // Range is 0 to Math.PI radians.
    this.minPolarAngle = 0; // radians
    this.maxPolarAngle = Math.PI; // radians

    // How far you can orbit horizontally, upper and lower limits.
    // If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
    this.minAzimuthAngle = - Infinity; // radians
    this.maxAzimuthAngle = Infinity; // radians

    // Set to true to enable damping (inertia)
    // If damping is enabled, you must call controls.update() in your animation loop
    this.enableDamping = false;
    this.dampingFactor = 0.25;

    // This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
    // Set to false to disable zooming
    this.enableZoom = true;
    this.zoomSpeed = 1.0;

    // Set to false to disable rotating
    this.enableRotate = true;
    this.rotateSpeed = 1.0;

    // Set to false to disable panning
    this.enablePan = true;
    this.panSpeed = 1.0;
    this.screenSpacePanning = false;
    this.keyPanSpeed = 7.0;	// pixels moved per arrow key push

    // Set to true to automatically rotate around the target
    // If auto-rotate is enabled, you must call controls.update() in your animation loop
    this.autoRotate = false;
    this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

    // Set to false to disable use of the keys
    this.enableKeys = true;

    // The four arrow keys
    this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

    // Mouse buttons
    this.mouseButtons = { ORBIT: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.RIGHT };

    // for reset
    this.target0 = this.target.clone();
    this.position0 = this.object.position.clone();
    this.zoom0 = this.object.zoom;

    //
    // public methods
    //

    this.getPolarAngle = function () {

        return spherical.phi;

    };

    this.getAzimuthalAngle = function () {

        return spherical.theta;

    };

    //Shawn
    // Use ths method to reset the controls when using the nav cube
    this.reset = function () {

        scope.target.copy(scope.target0);
        scope.object.position.copy(scope.position0);
        scope.object.zoom = scope.zoom0;

        scope.object.updateProjectionMatrix();
        scope.dispatchEvent(changeEvent);

        scope.update();

        state = STATE.NONE;

    };

    // shawn
    // this method is exposed, but perhaps it would be better if we can make it private...
    this.update = function (navigated) {
        //console.trace();
        var offset = new THREE.Vector3();

        // so camera.up is the orbit axis
        var quat = new THREE.Quaternion().setFromUnitVectors(object.up, new THREE.Vector3(0, 1, 0));
        var quatInverse = quat.clone().inverse();

        var lastPosition = new THREE.Vector3();
        var lastQuaternion = new THREE.Quaternion();

        return function update(navigated) {

            var position = scope.object.position;

            offset.copy(position).sub(scope.target);

            // rotate offset to "y-axis-is-up" space
            offset.applyQuaternion(quat);

            // angle from z-axis around y-axis
            spherical.setFromVector3(offset);

            if (scope.autoRotate && state === STATE.NONE) {

                rotateLeft(getAutoRotationAngle());

            }

            spherical.theta += sphericalDelta.theta;
            spherical.phi += sphericalDelta.phi;

            // restrict theta to be between desired limits
            spherical.theta = Math.max(scope.minAzimuthAngle, Math.min(scope.maxAzimuthAngle, spherical.theta));

            // restrict phi to be between desired limits
            spherical.phi = Math.max(scope.minPolarAngle, Math.min(scope.maxPolarAngle, spherical.phi));

            spherical.makeSafe();


            spherical.radius *= scale;

            // restrict radius to be between desired limits
            spherical.radius = Math.max(scope.minDistance, Math.min(scope.maxDistance, spherical.radius));

            // move target to panned location
            scope.target.add(panOffset);

            offset.setFromSpherical(spherical);

            // rotate offset back to "camera-up-vector-is-up" space
            offset.applyQuaternion(quatInverse);

            ////shawn
            //if (!navigated) {
            //    //offset = position;
            //    position.copy(scope.target).add(offset);
            //} else {
            //    var test = false;
            //}

            position.copy(scope.target).add(offset);
            scope.object.lookAt(scope.target);

            if (scope.enableDamping === true) {

                sphericalDelta.theta *= (1 - scope.dampingFactor);
                sphericalDelta.phi *= (1 - scope.dampingFactor);

            } else {

                sphericalDelta.set(0, 0, 0);

            }

            scale = 1;
            panOffset.set(0, 0, 0);

            // update condition is:
            // min(camera displacement, camera rotation in radians)^2 > EPS
            // using small-angle approximation cos(x/2) = 1 - x^2 / 8

            if (zoomChanged ||
                lastPosition.distanceToSquared(scope.object.position) > EPS ||
                8 * (1 - lastQuaternion.dot(scope.object.quaternion)) > EPS) {

                scope.dispatchEvent(changeEvent);

                lastPosition.copy(scope.object.position);
                lastQuaternion.copy(scope.object.quaternion);
                zoomChanged = false;

                return true;

            }

            return false;

        };

    }();

    this.dispose = function () {

        scope.domElement.removeEventListener('contextmenu', onContextMenu, false);
        scope.domElement.removeEventListener('mousedown', onMouseDown, false);
        scope.domElement.removeEventListener('wheel', onMouseWheel, false);

        scope.domElement.removeEventListener('touchstart', onTouchStart, false);
        scope.domElement.removeEventListener('touchend', onTouchEnd, false);
        scope.domElement.removeEventListener('touchmove', onTouchMove, false);
        scope.domElement.removeEventListener('keydown', onKeyDown, false);

        document.removeEventListener('mousemove', onMouseMove, false);
        document.removeEventListener('mouseup', onMouseUp, false);

        //window.removeEventListener('keydown', onKeyDown, false);

        //scope.dispatchEvent( { type: 'dispose' } ); // should this be added here?

    };

    //
    // internals
    //

    var scope = this;

    var changeEvent = { type: 'change' };
    var startEvent = { type: 'start' };
    var endEvent = { type: 'end' };

    //var STATE = { NONE: - 1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_DOLLY: 4, TOUCH_PAN: 5 };
    var STATE = { NONE: - 1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_DOLLY_PAN: 4 };

    var state = STATE.NONE;

    var EPS = 0.000001;

    // current position in spherical coordinates
    var spherical = new THREE.Spherical();
    var sphericalDelta = new THREE.Spherical();

    var scale = 1;
    var panOffset = new THREE.Vector3();
    var zoomChanged = false;

    var rotateStart = new THREE.Vector2();
    var rotateEnd = new THREE.Vector2();
    var rotateDelta = new THREE.Vector2();

    var panStart = new THREE.Vector2();
    var panEnd = new THREE.Vector2();
    var panDelta = new THREE.Vector2();

    var dollyStart = new THREE.Vector2();
    var dollyEnd = new THREE.Vector2();
    var dollyDelta = new THREE.Vector2();

    function getAutoRotationAngle() {

        return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

    }

    function getZoomScale() {

        return Math.pow(0.95, scope.zoomSpeed);

    }

    function rotateLeft(angle) {

        sphericalDelta.theta -= angle;

    }

    function rotateUp(angle) {

        sphericalDelta.phi -= angle;

    }

    // shawn - pan shawnpan
    var panLeft = function () {

        var v = new THREE.Vector3();

        return function panLeft(distance, objectMatrix) {

            v.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
            v.multiplyScalar(- distance);

            panOffset.add(v);

        };

    }();

    var panUp = function () {

        var v = new THREE.Vector3();

        return function panUp(distance, objectMatrix) {

            v.setFromMatrixColumn(objectMatrix, 1); // get Y column of objectMatrix
            //v.crossVectors(scope.object.up, v);
            //if (scope.screenSpacePanning === true) {

            //    v.setFromMatrixColumn(objectMatrix, 1);

            //} else {

            //    v.setFromMatrixColumn(objectMatrix, 0);
            //    v.crossVectors(scope.object.up, v);

            //}
            v.multiplyScalar(distance);

            panOffset.add(v);

        };

    }();

    // shawn - pan shawnpan
    // deltaX and deltaY are in pixels; right and down are positive
    this.pan = function () {

        var offset = new THREE.Vector3();

        return function pan(deltaX, deltaY) {

            var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

            var camera = null;

            if (scope.object.type === "Camera") {
                if (scope.object.inPerspectiveMode) {
                    camera = scope.object.cameraP;
                }
                else {
                    camera = scope.object.cameraO;
                }
            }
            else {
                camera = scope.object
            }

            if (camera instanceof THREE.PerspectiveCamera) {
                //if (scope.object.isPerspectiveCamera) {

                var position = scope.object.position;
                offset.copy(position).sub(scope.target);
                var targetDistance = offset.length();

                // half of the fov is center to top of screen
                targetDistance *= Math.tan((scope.object.fov / 2) * Math.PI / 180.0);

                // we use only clientHeight here so aspect ratio does not distort speed
                //panLeft(2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix);
                //panUp(2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix);

                var distance = targetDistance;
                var panX = 2 * deltaX * distance / element.clientHeight;
                var panY = 2 * deltaY * distance / element.clientHeight;
                var matrix = scope.object.matrix;

                if (typeof namespace !== "undefined" && namespace !== null) { // && namespace.namespace === "Three") {
                    namespace.hasPanned = true;
                }

                // we actually don't use screenWidth, since perspective camera is fixed to screen height
                panLeft(panX, matrix);
                panUp(panY, matrix);

            } else if (camera instanceof THREE.OrthographicCamera) {
                // else if (scope.object.isOrthographicCamera) {

                // orthographic
                //panLeft(deltaX * (scope.object.right - scope.object.left) / scope.object.zoom / element.clientWidth, scope.object.matrix);
                //panUp(deltaY * (scope.object.top - scope.object.bottom) / scope.object.zoom / element.clientHeight, scope.object.matrix);
                panLeft(deltaX * (camera.right - camera.left) / camera.zoom / element.clientWidth, scope.object.matrix);
                panUp(deltaY * (camera.top - camera.bottom) / camera.zoom / element.clientHeight, scope.object.matrix);

            } else {

                // camera neither orthographic nor perspective
                console.warn('WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.');
                scope.enablePan = false;

            }

        };
        
    }();

    this.dollyIn = function(dollyScale) {
        var camera = null;

        if (scope.object.type === "Camera") {
            if (scope.object.inPerspectiveMode) {
                camera = scope.object.cameraP;
            }
            else {
                camera = scope.object.cameraO;
            }
        }
        else {
            camera = scope.object
        }

        if (camera instanceof THREE.PerspectiveCamera) {
            scale /= dollyScale;
        }
        else if (camera instanceof THREE.OrthographicCamera) {
            camera.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, camera.zoom * dollyScale));
            camera.updateProjectionMatrix();
            zoomChanged = true;
        }
        else {
            console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
            scope.enableZoom = false;
        }

       
    }

    this.dollyOut = function(dollyScale) {
        var camera = null;

        if (scope.object.type === "Camera") {
            if (scope.object.inPerspectiveMode) {
                camera = scope.object.cameraP;
            }
            else {
                camera = scope.object.cameraO;
            }
        }
        else {
            camera = scope.object
        }

        if (camera instanceof THREE.PerspectiveCamera) {
            //camera.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, camera.zoom * dollyScale));
            //camera.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, camera.zoom / dollyScale));
            
            //camera.zoom = Math.max(scope.minDistance, Math.min(scope.maxDistance, camera.zoom / dollyScale))
           // camera.zoom = Math.min(scope.minZoom, Math.max(scope.maxZoom, camera.zoom / dollyScale));
           //camera.zoom = Math.min(scope.minZoom, Math.max(scope.maxZoom, camera.zoom / dollyScale));
            scale *= dollyScale;
            camera.updateProjectionMatrix();
            zoomChanged = true;
            //camera.zoom = scale;
            //camera.updateProjectionMatrix();
        } else if (camera instanceof THREE.OrthographicCamera) {
            camera.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, camera.zoom / dollyScale));
            camera.updateProjectionMatrix();
            zoomChanged = true;
        } else {
            console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
            scope.enableZoom = false;
        }
        

    }

    //
    // event callbacks - update the object state
    //

    function handleMouseDownRotate(event) {

        //console.log( 'handleMouseDownRotate' );

        rotateStart.set(event.clientX, event.clientY);

    }

    function handleMouseDownDolly(event) {

        //console.log( 'handleMouseDownDolly' );

        dollyStart.set(event.clientX, event.clientY);

    }

    function handleMouseDownPan(event) {

        //console.log( 'handleMouseDownPan' );

        panStart.set(event.clientX, event.clientY);

    }

    this.handleMouseMoveRotate = function (event, idx) {

        handleMouseMoveRotate(event, idx);

        //console.log( 'handleMouseMoveRotate' );

    }

    // Shawn
    // Event handler for rotating scene with moouse
    var count = 0;

    function handleMouseMoveRotate(event, idx) {

        rotateEnd.set(event.clientX, event.clientY);
        rotateDelta.subVectors(rotateEnd, rotateStart);

        var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

        // rotating across whole screen goes 360 degrees around
        rotateLeft(2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed);

        // rotating up and down along whole screen attempts to go 360, but limited to 180
        rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed);

        rotateStart.copy(rotateEnd);

        scope.update();

        if (event.movementX != 0 || event.movementY != 0){
            Three.DocumentEventHandler.isDragged = true;
        }
    }

    function handleMouseMoveDolly(event) {

        //console.log( 'handleMouseMoveDolly' );

        dollyEnd.set(event.clientX, event.clientY);

        dollyDelta.subVectors(dollyEnd, dollyStart);

        if (dollyDelta.y > 0) {

            scope.dollyIn(getZoomScale());

        } else if (dollyDelta.y < 0) {

            scope.dollyOut(getZoomScale());

        }

        dollyStart.copy(dollyEnd);

        scope.update();

    }

    function handleMouseMovePan(event) {

        //console.log( 'handleMouseMovePan' );

        panEnd.set(event.clientX, event.clientY);

        panDelta.subVectors(panEnd, panStart);

        scope.pan(panDelta.x, panDelta.y);

        panStart.copy(panEnd);

        scope.update();

    }

    function handleMouseUp(event) {
        count = 0;
        // console.log( 'handleMouseUp' );

    }

    function handleMouseWheel(event) {

        // console.log( 'handleMouseWheel' );

        if (event.deltaY < 0) {

            scope.dollyOut(getZoomScale());

        } else if (event.deltaY > 0) {

            scope.dollyIn(getZoomScale());

        }

        scope.update();

    }

    function handleKeyDown(event) {

        //console.log( 'handleKeyDown' );

        switch (event.keyCode) {

            case scope.keys.UP:
                scope.pan(0, scope.keyPanSpeed);
                scope.update();
                break;

            case scope.keys.BOTTOM:
                scope.pan(0, - scope.keyPanSpeed);
                scope.update();
                break;

            case scope.keys.LEFT:
                scope.pan(scope.keyPanSpeed, 0);
                scope.update();
                break;

            case scope.keys.RIGHT:
                scope.pan(- scope.keyPanSpeed, 0);
                scope.update();
                break;

        }

    }

    function handleTouchStartRotate(event) {

        //console.log( 'handleTouchStartRotate' );

        rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);

    }

    function handleTouchStartDollyPan(event) {
        if (scope.enableZoom || scope.enablePan) {

            var dx = event.touches[0].pageX - event.touches[1].pageX;
            var dy = event.touches[0].pageY - event.touches[1].pageY;
            var distance = Math.sqrt(dx * dx + dy * dy);
            dollyStart.set(0, distance);

            var x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
            var y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);
            panStart.set(x, y);

        } 

    }
    

    function handleTouchMoveRotate(event) {

        //console.log( 'handleTouchMoveRotate' );

        rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
        rotateDelta.subVectors(rotateEnd, rotateStart);

        var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

        // rotating across whole screen goes 360 degrees around
        //rotateLeft(2 * Math.PI * rotateDelta.x / element.clientHeight);
        rotateLeft(2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed);

        // rotating up and down along whole screen attempts to go 360, but limited to 180
        //rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight);
        rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed);

        rotateStart.copy(rotateEnd);

        scope.update();

    }

    function handleTouchMoveDollyPan(event) {
       
        if (scope.enableZoom || scope.enablePan) {

            var dx = event.touches[0].pageX - event.touches[1].pageX;
            var dy = event.touches[0].pageY - event.touches[1].pageY;

            var distance = Math.sqrt(dx * dx + dy * dy);

            dollyEnd.set(0, distance);

            dollyDelta.set(0, Math.pow(dollyEnd.y / dollyStart.y, scope.zoomSpeed));

            scope.dollyIn(dollyDelta.y);

            dollyStart.copy(dollyEnd);
            var x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
            var y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);

            panEnd.set(x, y);
            //panDelta.subVectors(panEnd, panStart);

            panDelta.subVectors(panEnd, panStart).multiplyScalar(scope.panSpeed);

            scope.pan(panDelta.x, panDelta.y);

            panStart.copy(panEnd);


        }
        scope.update();

    }

   
    function handleTouchEnd(event) {

        //console.log( 'handleTouchEnd' );

    }

   

    function onMouseDown(event) {

        if (scope.enabled === false) return;

        event.preventDefault();

        if (event.button === scope.mouseButtons.ORBIT) {

            if (scope.enableRotate === false) return;
            Three.cameraLookAtSkipRotation = false;
            handleMouseDownRotate(event);

            state = STATE.ROTATE;

        } else if (event.button === scope.mouseButtons.ZOOM) {

            if (scope.enableZoom === false) return;
            Three.cameraLookAtSkipRotation = false;
            handleMouseDownDolly(event);

            state = STATE.DOLLY;

        } else if (event.button === scope.mouseButtons.PAN) {

            if (scope.enablePan === false) return;
            Three.cameraLookAtSkipRotation = false;
            handleMouseDownPan(event);

            state = STATE.PAN;

        }

        if (state !== STATE.NONE) {

            document.addEventListener('mousemove', onMouseMove, false);
            document.addEventListener('mouseup', onMouseUp, false);

            scope.dispatchEvent(startEvent);

        }

    }

    function onMouseMove(event) {

        if (scope.enabled === false) return;

        event.preventDefault();

        if (state === STATE.ROTATE) {

            if (scope.enableRotate === false) return;

            handleMouseMoveRotate(event);

        } else if (state === STATE.DOLLY) {

            if (scope.enableZoom === false) return;

            handleMouseMoveDolly(event);

        } else if (state === STATE.PAN) {

            if (scope.enablePan === false) return;

            handleMouseMovePan(event);

        }

    }

    function onMouseUp(event) {

        if (scope.enabled === false) return;

        handleMouseUp(event);

        document.removeEventListener('mousemove', onMouseMove, false);
        document.removeEventListener('mouseup', onMouseUp, false);

        scope.dispatchEvent(endEvent);

        state = STATE.NONE;

    }

    function onMouseWheel(event) {

        if (scope.enabled === false || scope.enableZoom === false || (state !== STATE.NONE && state !== STATE.ROTATE)) return;
        Three.cameraLookAtSkipRotation = false;
        event.preventDefault();
        event.stopPropagation();

        handleMouseWheel(event);

        scope.dispatchEvent(startEvent); // not sure why these are here...
        scope.dispatchEvent(endEvent);

    }

    //var fakeEvent = {
    //    preventDefault: function () { },
    //    stopPropagation: function () { },
    //    deltaY: 1,
    //    deltaX: 1,
    //}
    //Three.controls.onMouseWheel(fakeEvent);
    this.onMouseWheel = onMouseWheel;

    function onKeyDown(event) {

        if (scope.enabled === false || scope.enableKeys === false || scope.enablePan === false) return;

        //event.preventDefault();
        Three.cameraLookAtSkipRotation = false;
        handleKeyDown(event);

    }

    function onTouchStart(event) {

        if (scope.enabled === false) return;

        event.preventDefault();

        switch (event.touches.length) {

            case 1:	// one-fingered touch: rotate

                if (scope.enableRotate === false) return;
                Three.cameraLookAtSkipRotation = false;
                handleTouchStartRotate(event);

                state = STATE.TOUCH_ROTATE;

                break;

            case 2: //two fingered touch:dolly-pan
                if (scope.enableZoom === false && scope.enablePan === false) return;
                handleTouchStartDollyPan(event);
                state = STATE.TOUCH_DOLLY_PAN;
                break;

            //case 2:	// two-fingered touch: dolly

            //	if ( scope.enableZoom === false ) return;
            //	Three.cameraLookAtSkipRotation = false;
            //	handleTouchStartDolly( event );

            //	state = STATE.TOUCH_DOLLY;

            //	break;

            //case 3: // three-fingered touch: pan

            //	if ( scope.enablePan === false ) return;
            //	Three.cameraLookAtSkipRotation = false;
            //	handleTouchStartPan( event );

            //	state = STATE.TOUCH_PAN;

            //	break;

            default:

                state = STATE.NONE;

        }

        if (state !== STATE.NONE) {

            scope.dispatchEvent(startEvent);

        }

    }

    function onTouchMove(event) {

        if (scope.enabled === false) return;

        event.preventDefault();
        event.stopPropagation();

        switch (event.touches.length) {

            case 1: // one-fingered touch: rotate

                if (scope.enableRotate === false) return;
                if (state !== STATE.TOUCH_ROTATE) return; // is this needed?...

                handleTouchMoveRotate(event);

                break;

            case 2: //two-fingered touch: dolly-pan
                if (scope.enableZoom === false && scope.enablePan === false) return;
                if (state !== STATE.TOUCH_DOLLY_PAN) return;
                handleTouchMoveDollyPan(event);
                break;

            //case 2: // two-fingered touch: dolly

            //	if ( scope.enableZoom === false ) return;
            //	if ( state !== STATE.TOUCH_DOLLY ) return; // is this needed?...

            //	handleTouchMoveDolly( event );

            //	break;

            //case 3: // three-fingered touch: pan

            //	if ( scope.enablePan === false ) return;
            //	if ( state !== STATE.TOUCH_PAN ) return; // is this needed?...

            //	handleTouchMovePan( event );

            //	break;

            default:

                state = STATE.NONE;

        }

    }

    function onTouchEnd(event) {

        if (scope.enabled === false) return;

        handleTouchEnd(event);

        scope.dispatchEvent(endEvent);

        state = STATE.NONE;

    }

    function onContextMenu(event) {

        event.preventDefault();

    }

    //

    scope.domElement.addEventListener('contextmenu', onContextMenu, false);

    scope.domElement.addEventListener('mousedown', onMouseDown, false);
    scope.domElement.addEventListener('wheel', onMouseWheel, false);

    scope.domElement.addEventListener('touchstart', onTouchStart, false);
    scope.domElement.addEventListener('touchend', onTouchEnd, false);
    scope.domElement.addEventListener('touchmove', onTouchMove, false);
    scope.domElement.addEventListener('keydown', onKeyDown, false);

    //window.addEventListener('keydown', onKeyDown, false);

    // force an update at start

    this.update();

};

THREE.OrbitControls.prototype = Object.create(THREE.EventDispatcher.prototype);
THREE.OrbitControls.prototype.constructor = THREE.OrbitControls;

Object.defineProperties(THREE.OrbitControls.prototype, {

    center: {

        get: function () {

            console.warn('THREE.OrbitControls: .center has been renamed to .target');
            return this.target;

        }

    },

    // backward compatibility

    noZoom: {

        get: function () {

            console.warn('THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.');
            return !this.enableZoom;

        },

        set: function (value) {

            console.warn('THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.');
            this.enableZoom = !value;

        }

    },

    noRotate: {

        get: function () {

            console.warn('THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead.');
            return !this.enableRotate;

        },

        set: function (value) {

            console.warn('THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead.');
            this.enableRotate = !value;

        }

    },

    noPan: {

        get: function () {

            console.warn('THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead.');
            return !this.enablePan;

        },

        set: function (value) {

            console.warn('THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead.');
            this.enablePan = !value;

        }

    },

    noKeys: {

        get: function () {

            console.warn('THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.');
            return !this.enableKeys;

        },

        set: function (value) {

            console.warn('THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.');
            this.enableKeys = !value;

        }

    },

    staticMoving: {

        get: function () {

            console.warn('THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.');
            return !this.enableDamping;

        },

        set: function (value) {

            console.warn('THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.');
            this.enableDamping = !value;

        }

    },

    dynamicDampingFactor: {

        get: function () {

            console.warn('THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.');
            return this.dampingFactor;

        },

        set: function (value) {

            console.warn('THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.');
            this.dampingFactor = value;

        }

    }

});
