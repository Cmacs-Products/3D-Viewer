var initThreeD = function () {

    Three = {
        namespace: "Three",

        // Mainly used for EMS. 
        // Camera and Animation only start when a 3D model is clicked
        initialized:  false,

        // Main Scene Properties
        container: document.getElementById('ThreeJS'),
        scene: null,
        camera: null,
        renderer: null,
        gridHelper: null,
        controls: null,
        transformControls: null,
        Gui: null,
        keyboard: new THREEx.KeyboardState(),
        clock: new THREE.Clock(),
        raycaster: new THREE.Raycaster(),
        mouse: new THREE.Vector2(),
        mouseIsOnDiv:true,
        INTERSECTED: null,
        SELECTED: null,
        selectedKeep: null,
        cameraLookAtSkipRotation: false,

        // Nav Cube Properties
        NavigationCube: null,
        navScene: null,
        navCube: null,
        navCam: null,
        navRenderer: null,
        navControls: null,
        navCubeLoaded: null,
        navMouse: new THREE.Vector2(),
        navcaster: new THREE.Raycaster(),
        NAV_INTERSECTED: null,
        NAV_SELECTED: null,

        // Render Loop Functions
        animate: Three.animate,
        update: Three.update,
        render: Three.render,

        // loadedModule: loadedModule,

        // The extension of the file without the '.' (e.g. ifc instead of .ifc) - used in Gui.js
        fileType: null,

        // The info box on the top left corner
        info: null,

        // Used to determine if an image should be exported from canvas
        getImageData: false,

        // Check if the user is on mobile device
        agent: null,
        isMobileTablet: null,
        screenWidth: null,
                
        // Used to determine if the view should be reset when switching between sectioning tool and regular viewer
        hasPanned: false,
        
        // This is the alien loading gif
        loadingOverlayName: "3d-document-overlay"
    };

    Sectioning = {
        namespace: "Sectioning",
        scene: null,
        camera: null,
        renderer: null,
        controls: null,
        throttledRender: function () { },
        _render: function () { },
        onWindowResize: function () { },
        hasPanned: false,
        isCapping: false,
        sectioningHasLoaded: false,
        sectioning: null,
        sectioningLimits: null,
        rendering: false,
        navObject: null,
        navCube: null,
        navScene: null,
        navRenderer: null,
        navCam: null,
        navControls: null,
        navcaster: new THREE.Raycaster(),
        navMouse: new THREE.Vector2(),
        NAV_INTERSECTED: null,
        NAV_SELECTED: null
    };

    // Three.ThreeDToolbar = new ThreeDToolbar();
 
    Three.BackgroundRendering = new BackgroundRendering();
    Three.ControlUtils = new ControlUtils();
    Three.CameraUtils = new CameraUtils();
    Three.ThreeDTagUtils = new ThreeDTagUtils();
    //Three.ToolbarEventHandler = new ThreeDToolbarEventHandler();
    Three.Utils = new ThreeDUtils();
    
    Three.ModelLoader = new ModelLoader();
    Three.ViewToggle = new ViewToggle();
  Three.DocumentEventHandler = new DocumentEventHandler();
  
  Three.Initialize = new Initialize();
  Three.Gui = new Gui();
    Three.SectioningToolUtils = new SectioningToolUtils();
    

    Three.agent = window.navigator.userAgent;
    Three.isMobileTablet = Three.agent.match(/iPad|Android|Mobile|Tablet|Phone/);
    Three.screenWidth = document.documentElement.clientWidth;

    // // In EMS, this ensure that events intended only for 3DViewer, 
    // // only happen if the user is in the 3DViewer div
    // if (loadedModule === "EMS") {
    //     Three.mouseIsOnDiv = false;
    //     document.getElementById("ThreeJS").addEventListener("mouseenter", function () { Three.mouseIsOnDiv = true; });
    //     document.getElementById("ThreeJS").addEventListener("mouseout", function () { Three.mouseIsOnDiv = false; });
    // }

    var countGif = 0;
    var processId;
    // if (Three.loadedModule === "DOCUMENT") {

    //     // Used for creating and saving 
    //     AnnotationApplication.CRUDController = new CRUDController();

    //     Loading_OL = new LoadingOverlayLogic("#Sectioning");
    //     processId = Loading_OL.startGenericLoadingScreenWithDelay(Three.loadingOverlayName, 0, VIEW_RESOURCES.Resource.ConvertDocumentMsg);
    // }
    // try {
         Three.Initialize.initViewer();
         //Three.NavigationCube = new NavigationCube();
    //     if (loadedModule === "DOCUMENT") {
    //         //Three.fileType = extension.replace(".", "")
    //         Three.ModelLoader.initModel(DocumentExternalId, DocumentVersionExternalId, extension, processId);
    //     } else {
    //         Three.fileType = "ifc";
    //     }
    //     Three.ModelLoader.readyForModel();
    // } catch (e) {
    //     console.log("Failed to initialize Viewer", e);
    // }

    // if (loadedModule === "DOCUMENT") {
        Three.animate();
    // }
};
initThreeD();
//function loopModel() {
//    var model = Three.ModelLoader.getModel();
//    var child;
//    for (var i in model.children) {
//        var current = model.children[i];
//        for (var j in current.children) {
//            var child = current.children[j];
//            console.log(child);
//        }
//    }
//    //for (var j = 0; j < model.children[0].length; j++) {
//    //    var child = model.children[i][j];
//    //    console.log(child);
//    //}
//}
