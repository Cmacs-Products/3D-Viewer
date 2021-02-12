
var ViewToggle = (function () {

    function ViewToggle() {
        // Distance the Three.camera should be from the nav cube When user clicks on a face, edge or corner
        this.viewDistanceFace = 9;
        //this.viewDistanceEdge = 6;
        //this.viewDistanceCorner = 5;
    }
    
    ViewToggle.prototype = {

        constructor: ViewToggle,

        setTopView: function setTopView() {
            Three.Utils.zoomToObject({
                theta: 0,
                phi: 0
            });
        },

        setBottomView: function setBottomView() { Three.Utils.zoomToObject({ theta: 0, phi: Math.PI }) },

        setLeftView: function setLeftView() { Three.Utils.zoomToObject({ theta: -Math.PI / 2, phi: Math.PI / 2 }) },

        setRightView: function setRightView() { Three.Utils.zoomToObject({ theta: Math.PI / 2, phi: Math.PI / 2 }) },

        setFrontView: function setFrontView() { Three.Utils.zoomToObject({ theta: 0, phi: Math.PI / 2 }) },

        setBackView: function setBackView() { Three.Utils.zoomToObject({ theta: Math.PI, phi: Math.PI / 2}) },

        setTopRightFrontView: function setTopRightFrontView() { Three.Utils.zoomToObject({ theta: Math.PI / 4, phi: Math.PI / 4 }) },

        setBackLeftBottomView: function setBackLeftBottomView() { Three.Utils.zoomToObject({ theta: - Math.PI * 3 / 4, phi:  Math.PI * 3 / 4 }) },

        setRightBackBottomView: function setRightBackBottomView() { Three.Utils.zoomToObject({ theta: Math.PI *3 / 4, phi: Math.PI * 3 / 4 }) },

        setTopBackLeftView: function setTopBackLeftView() { Three.Utils.zoomToObject({ theta: -Math.PI * 3 / 4, phi: Math.PI / 4 }) },

        setLeftFrontBottomView: function setLeftFrontBottomView() { Three.Utils.zoomToObject({ theta: - Math.PI / 4, phi: Math.PI * 3 / 4 }) },

        setTopRightBackView: function setTopRightBackView() { Three.Utils.zoomToObject({ theta: Math.PI * 3 / 4, phi: Math.PI / 4 }) },

        setTopLeftFrontView: function setTopLeftFrontView() { Three.Utils.zoomToObject({ theta: - Math.PI / 4, phi: Math.PI / 4 }) },

        setFrontRightBottomView: function setFrontRightBottomView() { Three.Utils.zoomToObject({ theta: Math.PI / 4, phi: Math.PI * 3 / 4 }) },

        setFrontRightView: function setFrontRightView() { Three.Utils.zoomToObject({ theta: Math.PI / 4, phi: Math.PI / 2 }) },

        setRightBackView: function setRightBackView() { Three.Utils.zoomToObject({ theta: Math.PI * 3 / 4, phi: Math.PI / 2 }) },

        setBackLeftView: function setBackLeftView() { Three.Utils.zoomToObject({ theta: -Math.PI * 3 / 4, phi: Math.PI / 2 }) },

        setLeftFrontView: function setLeftFrontView() { Three.Utils.zoomToObject({ theta: -Math.PI / 4, phi: Math.PI / 2 }) },

        setTopRightView: function setTopRightView() { Three.Utils.zoomToObject({ theta: Math.PI / 2, phi: Math.PI / 4 }) },

        setTopBackView: function setTopBackView() { Three.Utils.zoomToObject({ theta: Math.PI, phi: Math.PI / 4 }) },

        setTopLeftView: function setTopLeftView() { Three.Utils.zoomToObject({ theta: - Math.PI / 2, phi: Math.PI / 4 }) },

        setTopFrontView: function setTopFrontView() { Three.Utils.zoomToObject({ theta: 0, phi: Math.PI / 4 }) },

        setFrontBottomView: function setFrontBottomView() { Three.Utils.zoomToObject({ theta: 0, phi: Math.PI * 3 / 4 }) },

        setRightBottomView: function setRightBottomView() { Three.Utils.zoomToObject({ theta: Math.PI / 2, phi: Math.PI * 3 / 4 }) },

        setBackBottomView: function setBackBottomView() { Three.Utils.zoomToObject({ theta: Math.PI , phi: Math.PI * 3 / 4 }) },

        setLeftBottomView: function setLeftBottomView() { Three.Utils.zoomToObject({ theta: - Math.PI / 2, phi: Math.PI * 3 / 4 }) },
        
        handleFaceSelection: function (faceSelected) {
            //if (Three.CameraUtils.cameraMode === "PERSPECTIVE") {
            if (true) {
                switch (faceSelected) {
                    case "polySurface47":
                        Three.ViewToggle.setFrontView();
                        break;
                    case "polySurface52":
                        Three.ViewToggle.setLeftView();
                        break;
                    case "polySurface35":
                        Three.ViewToggle.setTopView();
                        break;
                    case "polySurface41":
                        Three.ViewToggle.setRightView();
                        break;
                    case "polySurface65":
                        Three.ViewToggle.setBottomView();
                        break;
                    case "polySurface58":
                        Three.ViewToggle.setBackView();
                        break;
                    case "polySurface27":
                        Three.ViewToggle.setTopRightFrontView();
                        break;
                    case "polySurface30":
                        Three.ViewToggle.setBackLeftBottomView();
                        break;
                    case "polySurface31":
                        Three.ViewToggle.setRightBackBottomView();
                        break;
                    case "polySurface28":
                        Three.ViewToggle.setTopBackLeftView();
                        break;
                    case "polySurface24":
                        Three.ViewToggle.setLeftFrontBottomView();
                        break;
                    case "polySurface29":
                        Three.ViewToggle.setTopRightBackView();
                        break;
                    case "polySurface26":
                        Three.ViewToggle.setTopLeftFrontView();
                        break;
                    case "polySurface25":
                        Three.ViewToggle.setFrontRightBottomView();
                        break;
                    case "polySurface14":
                        Three.ViewToggle.setFrontRightView();
                        break;
                    case "polySurface16":
                        Three.ViewToggle.setRightBackView();
                        break;
                    case "polySurface15":
                        Three.ViewToggle.setBackLeftView();
                        break;
                    case "polySurface13":
                        Three.ViewToggle.setLeftFrontView();
                        break;
                    case "polySurface11":
                        Three.ViewToggle.setTopRightView();
                        break;
                    case "polySurface5":
                        Three.ViewToggle.setTopBackView();
                        break;
                    case "polySurface10":
                        Three.ViewToggle.setTopLeftView();
                        break;
                    case "polySurface4":
                        Three.ViewToggle.setTopFrontView();
                        break;
                    case "polySurface3":
                        Three.ViewToggle.setFrontBottomView();
                        break;
                    case "polySurface9":
                        Three.ViewToggle.setRightBottomView();
                        break;
                    case "polySurface6":
                        Three.ViewToggle.setBackBottomView();
                        break;
                    case "polySurface8":
                        Three.ViewToggle.setLeftBottomView();
                        break;
                }
            }
            else {
                switch (faceSelected) {
                    case "polySurface47":
                        //Three.ViewToggle.setFrontView();
                        Three.ViewToggle.setBackView();
                        break;
                    case "polySurface52":
                        Three.ViewToggle.setRightView();
                        //Three.ViewToggle.setLeftView();
                        break;
                    case "polySurface35":
                        Three.ViewToggle.setBottomView();
                        //Three.ViewToggle.setTopView();
                        break;
                    case "polySurface41":
                        Three.ViewToggle.setLeftView();
                        //Three.ViewToggle.setRightView();
                        break;
                    case "polySurface65":
                        Three.ViewToggle.setTopView();
                        //Three.ViewToggle.setBottomView();
                        break;
                    case "polySurface58":
                        Three.ViewToggle.setFrontView();
                        //Three.ViewToggle.setBackView();
                        break;
                    case "polySurface27":
                        Three.ViewToggle.setBackLeftBottomView();
                        //Three.ViewToggle.setTopRightFrontView();
                        break;
                    case "polySurface30":
                        Three.ViewToggle.setTopRightFrontView();
                        //Three.ViewToggle.setBackLeftBottomView();
                        break;
                    case "polySurface31":
                        Three.ViewToggle.setTopLeftFrontView();
                        //Three.ViewToggle.setRightBackBottomView();
                        break;
                    // Top Back Left
                    case "polySurface28":
                        Three.ViewToggle.setFrontRightBottomView();
                        //Three.ViewToggle.setTopBackLeftView();
                        break;
                    // Left Front bottom
                    case "polySurface24":
                        Three.ViewToggle.setTopRightBackView();
                        //Three.ViewToggle.setLeftFrontBottomView();
                        break;
                    // Top Right Back
                    case "polySurface29":
                        Three.ViewToggle.setLeftFrontBottomView();
                        //Three.ViewToggle.setTopRightBackView();
                        break;
                    case "polySurface26":
                        Three.ViewToggle.setRightBackBottomView();
                        //Three.ViewToggle.setTopLeftFrontView();
                        break;
                    case "polySurface25":
                        Three.ViewToggle.setTopBackLeftView();
                        //Three.ViewToggle.setFrontRightBottomView();
                        break;
                    case "polySurface14":
                        Three.ViewToggle.setBackLeftView();
                        //Three.ViewToggle.setFrontRightView();
                        break;
                    case "polySurface16":
                        Three.ViewToggle.setLeftFrontView();
                        //Three.ViewToggle.setRightBackView();
                        break;
                    case "polySurface15":
                        Three.ViewToggle.setFrontRightView();
                        //Three.ViewToggle.setBackLeftView();
                        break;
                    case "polySurface13":
                        Three.ViewToggle.setRightBackView();
                        //Three.ViewToggle.setLeftFrontView();
                        break;
                    case "polySurface11":
                        Three.ViewToggle.setLeftBottomView();
                        //Three.ViewToggle.setTopRightView();
                        break;
                    case "polySurface5":
                        Three.ViewToggle.setFrontBottomView();
                        //Three.ViewToggle.setTopBackView();
                        break;
                    case "polySurface10":
                        Three.ViewToggle.setRightBottomView();
                        //Three.ViewToggle.setTopLeftView();
                        break;
                    case "polySurface4":
                        Three.ViewToggle.setBackBottomView();
                        //Three.ViewToggle.setTopFrontView();
                        break;
                    case "polySurface3":
                        Three.ViewToggle.setTopBackView();
                        //Three.ViewToggle.setFrontBottomView();
                        break;
                    case "polySurface9":
                        Three.ViewToggle.setTopLeftView();
                        //Three.ViewToggle.setRightBottomView();
                        break;
                    case "polySurface6":
                        Three.ViewToggle.setTopFrontView();
                        //Three.ViewToggle.setBackBottomView();
                        break;
                    case "polySurface8":
                        Three.ViewToggle.setTopRightView();
                        //Three.ViewToggle.setLeftBottomView();
                        break;
                }
            }
        },

        toggleFullScreen: function toggleFullScreen() {
            console.trace();
            //var e = new Event('keypress');
            //e.which = 122; // Character F11 equivalent.
            //e.altKey = false;
            //e.ctrlKey = false;
            //e.shiftKey = false;
            //e.metaKey = false;
            //e.bubbles = true;
            //document.dispatchEvent(e);

            //if ( document.fullscreenElement ||
            //    document.webkitFullscreenElement ||
            //    document.mozFullScreenElement ||
            //    document.msFullscreenElement) {

            //    console.log(true);

            //} else {
            //    console.log(false);
            //}

            //if (!document.fullscreenElement) {
            //    document.documentElement.requestFullscreen();
            //} else {
            //    if (document.exitFullscreen) {
            //        document.exitFullscreen();
            //    }
            //}
        },

    }

    return ViewToggle;

})();

