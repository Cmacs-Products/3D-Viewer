var CutPlane = (function () {

    function CutPlane() {
        this.intersects;
        this.listOfCenterPointsObject = {};
        this.listOfCenterPoints = [];
        this.finalOutputForSvg = {};
        this.finalArray = [];
        this.finalListPointsArray = [];
        this.listofEmsNodeId = [];
        this.EmsNodeIdList = [];
        this.EmsNodeIdObject = {};
        this.modelMesh;
        this.clonedMesh;
        this.Scene;
        this.storedChildrenData;

    }
    CutPlane.prototype = {
        constructor: CutPlane,

        /* i.  Put a cut-plane through all children individually (for selected target)
           ii. Put a cut-plane through target:
               If geometry of target exists put cutplane through bottom and center of boundingbox around the geometry
               Else put a plane through boundingbox around the target excluding child geometry
             */
        
        sectioningThePlane: function (selectedNodeId, Scene, childrenData) {
            this.listOfCenterPointsObject = {};
            this.Scene = Scene;
            this.storedChildrenData = childrenData;
            
            var counter = 0;
            var scenemesh;
            var materialLine = new THREE.LineBasicMaterial({ color: 0xffffff });
            var normalVector = new THREE.Vector3(0, 0, 1);
            normalVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), counter);
            normalVector.normalize();
            var planes;
            var script = document.createElement('script');
            script.src = "/Scripts/ThreeJS/modeJS/mode.js";
            document.getElementsByTagName('script')[0].parentNode.appendChild(script);
           
           // var dataItem = TreeView_L.getTreeItemDataById(selectedNodeId);
            //var meshTarget = Three.scene.getObjectByName(dataItem.Tag);
            var meshTarget = Scene.scene.getObjectByName(selectedNodeId.IfcTag);
            var centerPoint = new THREE.Vector3();
            var targetPoints = [];
            var threeDtags = [];
            var meshPoints = [];
            this.listOfCenterPoints = [];
            this.finalListPointsArray = [];
            var selectedMeshes = new THREE.Group();
            
            /** ii. Creating Cut Plane if geometry exists or doesn't*/

            var material1 = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide });
            var material = new THREE.MeshBasicMaterial({ color: 0xFFB6C1, side: THREE.DoubleSide });
            if (typeof meshTarget != "undefined") {
                var newGeometry = new THREE.Geometry().fromBufferGeometry(meshTarget.geometry);
                var mesTargetWithNewGeometry = new THREE.Mesh(newGeometry, meshTarget.material);
                mesTargetWithNewGeometry.geometry.applyMatrix(meshTarget.matrixWorld);
                var boundingBoxForTarget = new THREE.BoxHelper(mesTargetWithNewGeometry);
                meshTarget.geometry.computeBoundingBox();
                mesTargetWithNewGeometry.geometry.computeBoundingBox();
               
                centerPoint.x = (mesTargetWithNewGeometry.geometry.boundingBox.max.x + mesTargetWithNewGeometry.geometry.boundingBox.min.x) / 2;
                centerPoint.y = (mesTargetWithNewGeometry.geometry.boundingBox.max.y + mesTargetWithNewGeometry.geometry.boundingBox.min.y) / 2;
                centerPoint.z = (mesTargetWithNewGeometry.geometry.boundingBox.max.z + meshTarget.geometry.boundingBox.min.z) / 2;
               
                var geometry = new THREE.PlaneGeometry((2*boundingBoxForTarget.geometry.boundingSphere.radius),
                    (2*boundingBoxForTarget.geometry.boundingSphere.radius),
                    0);
                var planeTarget = new THREE.Mesh(geometry, material);
                planeTarget.rotation.x = THREE.Math.degToRad(-90);
                planeTarget.position.set(centerPoint.x, centerPoint.y, centerPoint.z);
                var bottomPlane = new THREE.Mesh(geometry, material);
                bottomPlane.rotation.x = THREE.Math.degToRad(-90);
                bottomPlane.position.set(centerPoint.x, mesTargetWithNewGeometry.geometry.boundingBox.min.y, centerPoint.z);

                /** Converting the PlaneGeometry to Plane normal and constants */
                var plane = new THREE.Plane();
                var normal = new THREE.Vector3();
                var point = new THREE.Vector3();
                normal.set(0, 0, 1).applyQuaternion(planeTarget.quaternion);
                point.copy(planeTarget.position);
                plane.setFromNormalAndCoplanarPoint(normal, point);
                /** End of code for conversion of PlaneGeometry to Plane normal and constants  */

                this.intersects = new MODE.planeIntersect(mesTargetWithNewGeometry.geometry, plane);
                this.listOfCenterPoints.push(this.intersects);
                this.listOfCenterPointsObject["EmsNodeId"] = null;
                this.listOfCenterPointsObject["points"] = this.intersects.shapes;
                this.listOfCenterPointsObject["color"] = 'Gray';
                this.listOfCenterPointsObject["fill"] = 'Gray';
                var newObject = $.extend(true, {}, this.listOfCenterPointsObject);
                this.finalListPointsArray.push(newObject);


            } else {
               
                //var childItems = dataItem.items;
               // var child = treeViewComponents.fetchChildren(dataItem.dataId);
               var child = childrenData;
               // var childItems = child.value;
                var childTags = [];
                var targetLevelChildCenter = new THREE.Vector3();

                //rein: I made some edits here to make sure the code continues if no children are found
                this.modelMesh = Scene.ModelLoader.getModel();
                this.clonedMesh = new THREE.Group();
                var that = this;
                Scene.Utils.traverseMesh(
                    this.modelMesh,
                    function (g) { },
                    function (mesh) {
                        let currentMaterial = material;
                        // var dataItem = TreeView_L.getTreeItemDataByTag(mesh.name);
                        // if (!dataItem) {
                        //     dataItem = TreeView_L.getTreeItemDataByTag(mesh.parent.name);
                        // }

                        // if (dataItem && dataItem.Type === "Element") {
                        //     currentMaterial = material1;
                        // }
                        var clMeshNewGeom = new THREE.Geometry().fromBufferGeometry(mesh.geometry);
                        var clonedMeshWithNewGeometry = new THREE.Mesh(clMeshNewGeom, currentMaterial);
                        clonedMeshWithNewGeometry.geometry.applyMatrix(mesh.matrixWorld);
                        clonedMeshWithNewGeometry.name = mesh.name;

                        //clone = mesh.clone();
                        //clone.applyMatrix(mesh.parent.matrixWorld);
                        that.clonedMesh.add(clonedMeshWithNewGeometry);
                    }
                );
                
                //this.clonedMesh = $.extend(true, {}, this.modelMesh);
                var minZ = 999999999;
                var avgZ = 0;

                var addTagsRecursively = function (nodes) {
                    if (nodes) {
                        for (var l = 0; l < nodes.length; l++) {
                            childTags.push(nodes[l].IfcTag)
                            addTagsRecursively(nodes[l].children);
                        };
                    }
                }

                if (typeof child !== "undefined") {
                    addTagsRecursively(child);
                    //for (var l = 0; l < childItems.length; l++) {
                    //   // var childId = TreeView_L.getTreeItemDataById(childItems[l].id);
                    //    //var childId = TreeView_L.getTreeItemDataById(childItems[l]);
                    //    var childId = TreeView_L.getTreeItemDataById(childItems[l].EMSNodeId);
                    //    var checkChilIdItems = treeViewComponents.fetchChildren(childId.dataId);
                    //    childTags.push(childId.IfcTag);
                    //    //childTags.push(childId.Tag);
                    //    if (typeof checkChilIdItems != "undefined" && typeof checkChilIdItems.value != "undefined" && checkChilIdItems.value.length > 0) {
                    //        for (var t = 0; t < checkChilIdItems.value.length; t++) {
                    //            //var id = TreeView_L.getTreeItemDataById(childId.items[t].id);
                    //            var id = TreeView_L.getTreeItemDataById(checkChilIdItems.value[t].EMSNodeId);
                    //            childTags.push(id.IfcTag);
                    //            var checkSecondLevelChildItems = treeViewComponents.fetchChildren(id.dataId);
                    //            if (typeof checkSecondLevelChildItems != "undefined" && typeof checkSecondLevelChildItems.value != "undefined" && checkSecondLevelChildItems.value.length > 0) {
                    //                for (var x = 0; x < checkSecondLevelChildItems.value.length; x++) {
                    //                        var childCheckId = TreeView_L.getTreeItemDataById(checkSecondLevelChildItems.value[x].EMSNodeId);
                    //                        childTags.push(childCheckId.IfcTag);
                    //                }
                    //            }
                    //        }
                    //    }
                    //    
                    //    //if (typeof childId.items != "undefined" && childId.items.length > 0) {
                    //    //    for (var t = 0; t < childId.items.length; t++) {
                    //    //        var id = TreeView_L.getTreeItemDataById(childId.items[t].id);
                    //    //        childTags.push(id.Tag);
                    //    //    }
                    //    //}
                    //   
                    //}
                    console.log(childTags);

                    var origChildTags = childTags.slice(0);
                    var reducedChildTags = {};
                    childTags = [];
                    var u = 0;

                    let mainMesh = Scene.scene.children.find(child => child.name === "MainMesh");
                    while (u < origChildTags.length) {
                        var childMesh1 = mainMesh.getObjectByName(origChildTags[u]);
                        if (typeof childMesh1 !== "undefined") {
                            Scene.Utils.traverseMesh(
                                childMesh1,
                                function (group) {
                                },
                                function (mesh) {
                                    selected = that.clonedMesh.children.find(child => child.name === mesh.name);
                                    selectedMeshes.add(selected);
                                    that.clonedMesh.remove(selected);
                                    reducedChildTags[mesh.name] = origChildTags[u];
                                }
                            );
                        } 
                        u++;
                    }
                    console.log(childTags);
                   
                    //for (var y = 0; y < childTags.length; y++) {
                    //    for (var x = this.clonedMesh.children.length-1; x >=0; x-=1) {
                    //        if (this.clonedMesh.children[x].name == childTags[y]) {
                                
                    //            this.clonedMesh.children.splice(x, 1);
                    //        }

                    //    }

                    //}
                    //console.log(this.modelMesh);
                    //console.log(this.clonedMesh);
                    
                    //Three.scene.remove(Three.scene.getObjectByName("MainMesh"));
                    //Three.scene.add(this.clonedMesh);

                    for (var geom = 0; geom < selectedMeshes.children.length; geom++) {
                        var childTagMesh = selectedMeshes.children[geom];
                        if (typeof childTagMesh != "undefined") {

                            //var boundingBoxForTargetChild = new THREE.BoxHelper(childTagMesh);
                            //Three.scene.add(boundingBoxForTargetChild);
                            childTagMesh.geometry.computeBoundingBox();
                            if (childTagMesh.geometry.boundingBox.min.y < minZ) {
                                minZ = childTagMesh.geometry.boundingBox.min.y;
                            }
                            avgZ = avgZ +
                            (
                                ((childTagMesh.geometry.boundingBox.min.y +
                                    childTagMesh.geometry.boundingBox.max.y) /
                                        2) /
                                selectedMeshes.children.length);

                            console.log(avgZ);
                        }
                        //else {
                        //    var itemsForLevel = TreeView_L.getTreeItemDataByTag(origChildTags[geom]);
                        //        var elementsForLevel = itemsForLevel[0].items;
                        //        if (typeof elementsForLevel != "undefined") {
                        //            if (elementsForLevel.length > 0) {

                        //                for (var k = 0; k < elementsForLevel.length; k++) {
                        //                    var items = TreeView_L.getTreeItemDataById(elementsForLevel[k].id);
                        //                    var levelChildMesh = Three.scene.getObjectByName(items.Tag);
                        //                    if (typeof levelChildMesh != "undefined") {

                        //                        var boundingBoxLevelChildMesh = new THREE.BoxHelper(levelChildMesh);
                        //                        levelChildMesh.geometry.computeBoundingBox();

                        //                        if (levelChildMesh.geometry.boundingBox.min.y < minZ) {
                        //                            minZ = levelChildMesh.geometry.boundingBox.min.y;
                        //                        }
                        //                        avgZ = avgZ +
                        //                            (((levelChildMesh.geometry.boundingBox.min.y +
                        //                                    levelChildMesh.geometry.boundingBox.max.y) /
                        //                                2) /
                        //                                elementsForLevel.length);

                        //                        console.log(avgZ);

                        //                    }

                        //                }

                        //            }
                        //        }
                        //    }
                       
                    }
                   

                }
                var BBhelper = new THREE.BoxHelper(this.clonedMesh);
                //Three.scene.add(BBhelper);
                BBhelper.geometry.computeBoundingBox();
                var avgX = (BBhelper.geometry.boundingBox.max.x + BBhelper.geometry.boundingBox.min.x) / 2;
                var avgY = (BBhelper.geometry.boundingBox.max.y + BBhelper.geometry.boundingBox.min.y) / 2;
                var geometry1 = new THREE.PlaneGeometry(
                    (2 * BBhelper.geometry.boundingSphere.radius),
                    (2 * BBhelper.geometry.boundingSphere.radius),
                    0);

                var material1 = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide });

                for (var clMesh = 0; clMesh < this.clonedMesh.children.length; clMesh++) {
                    //var clMeshNewGeom = new THREE.Geometry().fromBufferGeometry(this.clonedMesh.children[clMesh].geometry);
                    //var clonedMeshWithNewGeometry =
                    //    new THREE.Mesh(clMeshNewGeom, this.clonedMesh.children[clMesh].material);
                    //clonedMeshWithNewGeometry.geometry.applyMatrix(this.clonedMesh.children[clMesh].matrixWorld);
                    clonedMeshWithNewGeometry = this.clonedMesh.children[clMesh];
                    var planeLevel = new THREE.Mesh(geometry1, material1);
                    planeLevel.rotation.x = THREE.Math.degToRad(-90);
                    planeLevel.position.set(avgX, avgZ, avgZ);
                    //Three.scene.add(planeLevel);
                    //Converting the PlaneGeometry to Plane normal and constants
                    var plane = new THREE.Plane();
                    var normal = new THREE.Vector3();
                    var point = new THREE.Vector3();
                    normal.set(0, 0, 1).applyQuaternion(planeLevel.quaternion);
                    point.copy(planeLevel.position);
                    plane.setFromNormalAndCoplanarPoint(normal, point);
                   
                    ///** End of code for conversion of PlaneGeometry to Plane normal and constants  */
                    this.intersects = new MODE.planeIntersect(clonedMeshWithNewGeometry.geometry, plane);
                    this.listOfCenterPoints.push(this.intersects);
                    this.listOfCenterPointsObject["EmsNodeId"] = null;
                    this.listOfCenterPointsObject["points"] = this.intersects.shapes;
                    this.listOfCenterPointsObject["color"] = 'Gray';
                    this.listOfCenterPointsObject["fill"] = 'Gray';
                    var newObject = $.extend(true, {}, this.listOfCenterPointsObject);
                    this.finalListPointsArray.push(newObject);
                    // CutPlane.prototype.listOfCenterPointsObject["EmsNodeId"] = null;
                    // CutPlane.prototype.listOfCenterPointsObject["points"] = this.intersects.shapes;
                    // CutPlane.prototype.listOfCenterPointsObject["color"] = 'Gray';
                    // CutPlane.prototype.listOfCenterPointsObject["fill"] = 'Gray';
                    // var newObject = $.extend(true, {}, CutPlane.prototype.listOfCenterPointsObject);
                    // this.finalListPointsArray.push(newObject);
                }
              
            }
            /* i.  Cut Plane through all children */
            CutPlane.prototype.createCutPlaneForAllChildren(selectedNodeId, selectedMeshes, reducedChildTags);

            //CutPlaneSection.computeIntersectionPoints(this.listOfCenterPoints);
           CutPlane.prototype.computeIntersectionPoints(this.finalListPointsArray);
           dataExchange.sendParentMessage('finalArrayShapes', {'finalArray': this.finalArray});
        },

        createCutPlaneForAllChildren: function (selectedNodeId, selectedMeshes, childTags) {
            
            // var dataItem = TreeView_L.getTreeItemDataById(selectedNodeId);
            var dataItem = selectedNodeId;
            
           // this.dataItem = dataItem;
            //var mainMesh = Three.scene.getObjectByName(dataItem.Tag);
            var mainMesh = this.Scene.scene.getObjectByName(dataItem.IfcTag);
            //var getDataItems = treeViewComponents.fetchChildren(dataItem.dataId);
            ////var childElementsForLevel = dataItem.items;
            //var childElementsForLevel = getDataItems.value;
            var childCenterPoint = new THREE.Vector3();
            var counter = 0;
            var scenemesh;
            var materialLine = new THREE.LineBasicMaterial({ color: 0xffffff });
            var normalVector = new THREE.Vector3(0, 0, 1);
            normalVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), counter);
            normalVector.normalize();
            var threeDtags = [];
            var emsNodeItems = [];
            this.listOfCenterPoints = [];

            /* i. */
         
            //if (typeof childElementsForLevel != "undefined") {
            //for (var child = 0; child < childElementsForLevel.length; child++) {
            //   // var item = TreeView_L.getTreeItemDataById(childElementsForLevel[child].id);
            //    var item = TreeView_L.getTreeItemDataById(childElementsForLevel[child].EMSNodeId);
            //    //emsNodeItems.push(item);
            //    emsNodeItems.push(item.dataId);
            //    /*threeDtags.push(item.Tag)*/
            //    threeDtags.push(item.IfcTag);
            //    }
            //}
            
            var thickness = 1;
            var obj = {};
            var finalArray = [];
            var newMeshGeometry = new THREE.Geometry();

            for (var i = 0; i < selectedMeshes.children.length; i++) {
                //var geometryNew = new THREE.Geometry().fromBufferGeometry(selectedMeshes.children[i].geometry);
                //var meshWithNewGeometry = new THREE.Mesh(geometryNew, selectedMeshes.children[i].material);
                var meshWithNewGeometry = selectedMeshes.children[i];
                if (true) {
                //if (typeof meshTargetChild != "undefined") {
                //    var geometryNew = new THREE.Geometry().fromBufferGeometry(meshTargetChild.geometry);
                //    var meshWithNewGeometry = new THREE.Mesh(geometryNew, meshTargetChild.material);

                    //meshWithNewGeometry.geometry.applyMatrix(meshTargetChild.matrixWorld);
                    meshWithNewGeometry.geometry.computeBoundingSphere();

                    var boundingBoxTargetChild = new THREE.BoxHelper(meshWithNewGeometry);
                    
                    //meshTargetChild.geometry.computeBoundingBox();
                    meshWithNewGeometry.geometry.computeBoundingBox();

                    var targetChild = meshWithNewGeometry.geometry.boundingBox;
                    childCenterOriginal = meshWithNewGeometry.geometry.boundingBox.getCenter();
                    childCenterPoint = meshWithNewGeometry.geometry.boundingBox.getCenter();
                    //meshTargetChild.localToWorld(childCenterOriginal);

                    var geometry = new THREE.PlaneGeometry((2 * boundingBoxTargetChild.geometry.boundingSphere.radius),
                        (2 * boundingBoxTargetChild.geometry.boundingSphere.radius),
                        0);

                    var material = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
                    var planeTargetChild = new THREE.Mesh(geometry, material);
                    planeTargetChild.rotation.x = THREE.Math.degToRad(-90);

                    planeTargetChild.position.set(childCenterPoint.x, childCenterPoint.y, childCenterPoint.z);

                    /** Converting the PlaneGeometry to Plane normal and constants */
                    var plane = new THREE.Plane();
                    var normal = new THREE.Vector3();
                    var point = new THREE.Vector3();
                    normal.set(0, 0, 1).applyQuaternion(planeTargetChild.quaternion);
                    point.copy(planeTargetChild.position);
                    plane.setFromNormalAndCoplanarPoint(normal, point);
                    /** End of code for conversion of PlaneGeometry to Plane normal and constants  */

                    this.intersects = new MODE.planeIntersect(meshWithNewGeometry.geometry, plane);
                    this.listOfCenterPoints.push(this.intersects);

                    //treeViewComponents.getTreeItemDataById(childTags[meshWithNewGeometry.name]);
                    ExistingObject = this.finalListPointsArray.find(i => i.EmsNodeId && i.EmsNodeId.IfcTag === childTags[meshWithNewGeometry.name]);
                    if (!ExistingObject) {
                       // var nodeData = TreeView_L.getTreeItemDataByTag(childTags[meshWithNewGeometry.name]);
                       var nodeData = this.storedChildrenData.filter(x => x.IfcTag === childTags[meshWithNewGeometry.name]);

                        if (nodeData.length > 1) {
                            this.listOfCenterPointsObject["EmsNodeId"] = nodeData.find(d => d.IfcRootId === ThreeD_VL.currentIFCModelNode.dataId);
                        } else if (nodeData.length > 0) {
                            this.listOfCenterPointsObject["EmsNodeId"] = nodeData[0];
                        }
                    } else {
                        this.listOfCenterPointsObject["EmsNodeId"] = null;
                    }
                    this.listOfCenterPointsObject["points"] = this.intersects.shapes;
                    this.listOfCenterPointsObject["color"] = 'Black';
                    this.listOfCenterPointsObject["fill"] = 'Black';
                    var newObject = $.extend(true, {}, this.listOfCenterPointsObject);
                    this.finalListPointsArray.push(newObject);


                //} else {
                //    var childNodeForThreeDTags = TreeView_L.getTreeItemDataByTag(threeDtags[i]);
                //    var elements;
                //    //var elements = childNodeForThreeDTags[0].items;
                //    if (childNodeForThreeDTags.length > 0) {
                //        for (var w = 0; w < childNodeForThreeDTags.length; w++) {
                //           elements = treeViewComponents.fetchChildren(childNodeForThreeDTags[w].dataId);
                //        }
                //    }
                //    var childTagList = [];
                //    //var emsNodeItems = [];
                //    var childCenter = new THREE.Vector3();
                //    if (typeof elements.value != "undefined") {
                //    if (elements.value.length > 0) {
                //        for (var k = 0; k < elements.value.length; k++) {
                //            //var items = TreeView_L.getTreeItemDataById(elements[k].id);
                //            //var childMesh = Three.scene.getObjectByName(items.Tag);
                //            var items = TreeView_L.getTreeItemDataById(elements.value[k].EMSNodeId);
                //            var childMesh = Three.scene.getObjectByName(items.IfcTag);

                //            if (typeof childMesh != "undefined" && typeof childMesh.geometry != "undefined") {
                //                var geometryNew = new THREE.Geometry().fromBufferGeometry(childMesh.geometry);
                //                var childMeshWithNewGeometry = new THREE.Mesh(geometryNew, childMesh.material);
                //                childMeshWithNewGeometry.geometry.applyMatrix(childMesh.matrixWorld);
                //                var bb = new THREE.BoxHelper(childMeshWithNewGeometry);
                //               // Three.scene.add(bb);

                //                var geometry = new THREE.PlaneGeometry((2 * bb.geometry.boundingSphere.radius),
                //                    (2 * bb.geometry.boundingSphere.radius),
                //                    0);

                //                var material = new THREE.MeshBasicMaterial({ color: 0xFFB6C1, side: THREE.DoubleSide });
                //                var planeChild = new THREE.Mesh(geometry, material);
                //                planeChild.rotation.x = THREE.Math.degToRad(-90);

                //                planeChild.position.set(bb.geometry.boundingSphere.center.x,
                //                    bb.geometry.boundingSphere.center.y,
                //                    bb.geometry.boundingSphere.center.z);

                //                /** Converting the PlaneGeometry to Plane normal and constants */
                //                var plane = new THREE.Plane();
                //                var normal = new THREE.Vector3();
                //                var point = new THREE.Vector3();
                //                normal.set(0, 0, 1).applyQuaternion(planeChild.quaternion);
                //                point.copy(planeChild.position);
                //                plane.setFromNormalAndCoplanarPoint(normal, point);
                //                /** End of code for conversion of PlaneGeometry to Plane normal and constants  */

                //                this.intersects = new MODE.planeIntersect(childMeshWithNewGeometry.geometry, plane);
                //                this.listOfCenterPoints.push(this.intersects);
                //                this.listOfCenterPointsObject["EmsNodeId"] = items;
                //                this.listOfCenterPointsObject["points"] = this.intersects.shapes;
                //                this.listOfCenterPointsObject["color"] = 'Black';
                //                this.listOfCenterPointsObject["fill"] = 'Black';
                //                var newObject = $.extend(true, {}, this.listOfCenterPointsObject);
                //                this.finalListPointsArray.push(newObject);

                //            } else {
                //                //var items = TreeView_L.getTreeItemDataById(elements[k].id)
                //                var items = TreeView_L.getTreeItemDataById(elements.value[k].EMSNodeId)
                //                var childInsideGeometry = (treeViewComponents.fetchChildren(items.dataId)).value;
                //                var threeTagsInsideChild = [];
                //                //var emsNodeItems = [];
                //                if (typeof childInsideGeometry != "undefined") {
                //                    for (var m = 0; m < childInsideGeometry.length; m++) {
                //                        var itemInsideChild = TreeView_L.getTreeItemDataById(childInsideGeometry[m].EMSNodeId);
                //                        emsNodeItems.push(itemInsideChild.dataId);
                //                        threeTagsInsideChild.push(itemInsideChild.IfcTag);
                //                        //var itemInsideChild = TreeView_L.getTreeItemDataById(childInsideGeometry[m].id);
                //                        //emsNodeItems.push(itemInsideChild);
                //                        //threeTagsInsideChild.push(itemInsideChild.Tag);
                //                    }
                //                }

                //                for (var n = 0; n < threeTagsInsideChild.length; n++) {
                //                    var meshInside = Three.scene.getObjectByName(threeTagsInsideChild[n]);
                //                    if (typeof meshInside != "undefined" && typeof meshInside.geometry != "undefined") {
                //                        var newGeometry = new THREE.Geometry().fromBufferGeometry(meshInside.geometry);
                //                        var meshInsideWithNewGeometry =
                //                            new THREE.Mesh(newGeometry, meshInside.material);
                //                        meshInsideWithNewGeometry.geometry.applyMatrix(meshInside.matrixWorld);
                //                        var bbChild = new THREE.BoxHelper(meshInsideWithNewGeometry);
                //                        var geometry = new THREE.PlaneGeometry(
                //                            (2 * bbChild.geometry.boundingSphere.radius),
                //                            (2 * bbChild.geometry.boundingSphere.radius),
                //                            0);

                //                        var material =
                //                            new THREE.MeshBasicMaterial({ color: 0xFFB6C1, side: THREE.DoubleSide });
                //                        var planeMeshInside = new THREE.Mesh(geometry, material);
                //                        planeMeshInside.rotation.x = THREE.Math.degToRad(-90);
                //                        planeMeshInside.position.set(bbChild.geometry.boundingSphere.center.x,
                //                            bbChild.geometry.boundingSphere.center.y,
                //                            bbChild.geometry.boundingSphere.center.z);

                //                        /** Converting the PlaneGeometry to Plane normal and constants */
                //                        var plane = new THREE.Plane();
                //                        var normal = new THREE.Vector3();
                //                        var point = new THREE.Vector3();
                //                        normal.set(0, 0, 1).applyQuaternion(planeMeshInside.quaternion);
                //                        point.copy(planeMeshInside.position);
                //                        plane.setFromNormalAndCoplanarPoint(normal, point);
                //                        /** End of code for conversion of PlaneGeometry to Plane normal and constants  */

                //                        this.intersects =
                //                            new MODE.planeIntersect(meshInsideWithNewGeometry.geometry, plane);
                //                        this.listOfCenterPoints.push(this.intersects);


                //                        this.listOfCenterPointsObject["EmsNodeId"] = emsNodeItems[n];
                //                        this.listOfCenterPointsObject["points"] = this.intersects.shapes;
                //                        this.listOfCenterPointsObject["color"] = 'Black';
                //                        this.listOfCenterPointsObject["fill"] = 'Black';
                //                        var newObject = $.extend(true, {}, this.listOfCenterPointsObject);
                //                        this.finalListPointsArray.push(newObject);
                //                    } else {
                //                        var itemsInsideChild = TreeView_L.getTreeItemDataByTag(threeTagsInsideChild[n]);
                //                        var childInsideLevels = treeViewComponents.fetchChildren(itemsInsideChild[0].dataId)
                //                        //var childInsideLevels = itemsInsideChild[0].items;
                //                        var tagsForChildInsideLevels = [];
                //                        //var emsNodeItems = [];
                //                        if (typeof childInsideLevels.value != "undefined") {
                //                            if (childInsideLevels.value.length > 0) {
                //                                for (var x = 0; x < childInsideLevels.value.length; x++) {
                //                                    var childInLev = TreeView_L.getTreeItemDataById(childInsideLevels[x].EMSNodeId);
                //                                    emsNodeItems.push(childInLev.dataId);
                //                                    tagsForChildInsideLevels.push(childInLev.IfcTag);
                //                                }
                //                            }
                //                        }
                //                        for (var y = 0; y < tagsForChildInsideLevels.length; y++) {
                //                            var meshInLev = Three.scene.getObjectByName(tagsForChildInsideLevels[y]);
                //                            if (typeof meshInLev != "undefined") {
                //                                var newGeom =
                //                                    new THREE.Geometry().fromBufferGeometry(meshInLev.geometry);
                //                                var meshInLevWithNewGeometry =
                //                                    new THREE.Mesh(newGeom, meshInLev.material);
                //                                meshInLevWithNewGeometry.geometry.applyMatrix(meshInLev.matrixWorld);
                //                                var bbChildLev = new THREE.BoxHelper(meshInLevWithNewGeometry);
                //                                var geometry = new THREE.PlaneGeometry(
                //                                    (2 * bbChildLev.geometry.boundingSphere.radius),
                //                                    (2 * bbChildLev.geometry.boundingSphere.radius),
                //                                    0);

                //                                var material =
                //                                    new THREE.MeshBasicMaterial({
                //                                        color: 0xFFB6C1,
                //                                        side: THREE.DoubleSide
                //                                    });
                //                                var planeMeshLev = new THREE.Mesh(geometry, material);
                //                                planeMeshLev.rotation.x = THREE.Math.degToRad(-90);
                //                                planeMeshLev.position.set(bbChildLev.geometry.boundingSphere.center.x,
                //                                    bbChildLev.geometry.boundingSphere.center.y,
                //                                    bbChildLev.geometry.boundingSphere.center.z);

                //                                /** Converting the PlaneGeometry to Plane normal and constants */
                //                                var plane = new THREE.Plane();
                //                                var normal = new THREE.Vector3();
                //                                var point = new THREE.Vector3();
                //                                normal.set(0, 0, 1).applyQuaternion(planeMeshLev.quaternion);
                //                                point.copy(planeMeshLev.position);
                //                                plane.setFromNormalAndCoplanarPoint(normal, point);
                //                                /** End of code for conversion of PlaneGeometry to Plane normal and constants  */

                //                                this.intersects =
                //                                    new MODE.planeIntersect(meshInLevWithNewGeometry.geometry, plane);
                //                                this.listOfCenterPoints.push(this.intersects);

                //                                this.listOfCenterPointsObject["EmsNodeId"] = emsNodeItems[y];
                //                                this.listOfCenterPointsObject["points"] = this.intersects.shapes;
                                               
                //                                this.listOfCenterPointsObject["color"] = 'Black';
                //                                this.listOfCenterPointsObject["fill"] = 'Black';
                //                                var newObject = $.extend(true, {}, this.listOfCenterPointsObject);
                //                                this.finalListPointsArray.push(newObject);

                //                            }
                //                        }
                //                    }
                //                }
                //            }
                //        }
                //    }
                //}
            }
            }
            

        },

        computeIntersectionPoints: function (intersectionPoints) {
            var thickness = 1;
            this.finalArray = [];
            this.finalOutputForSvg = {};
            for (var i = 0; i < intersectionPoints.length; i++) {
                var items = intersectionPoints[i].points;
                this.finalOutputForSvg["emsNode"] = intersectionPoints[i].EmsNodeId;
                //this.finalOutputForSvg["color"] = intersectionPoints[i].color;
                //this.finalOutputForSvg["fill"] = intersectionPoints[i].fill;
                this.finalOutputForSvg["lines"] = [];

                for (var j = 0; j < items.length; j++) {
                    var curveItems = items[j].curves;
                    var pointsArray = {
                        color: intersectionPoints[i].color,
                        thickness : thickness,
                        points : []
                    };
                    for (var k = 0; k < curveItems.length; k++) {
                        if (k == 0) {
                            pointsArray.points.push(curveItems[k].v1);
                            pointsArray.points.push(curveItems[k].v2);
                            
                        }
                        else {
                            pointsArray.points.push(curveItems[k].v2);

                        }
                       

                    }
                    if (Math.abs(pointsArray.points[0].x - pointsArray.points[pointsArray.points.length - 1].x) + Math.abs(pointsArray.points[0].y - pointsArray.points[pointsArray.points.length - 1].y) < 0.000001) {
                        pointsArray.fill = pointsArray.color;
                    }
                    //var newPointArray = $.extend(true, {}, pointsArray);    
                    this.finalOutputForSvg["lines"].push(pointsArray);

                        
                            
                }
                
                var newObject = $.extend(true, {}, this.finalOutputForSvg);
                this.finalArray.push(newObject);
            }
            
            console.log(this.finalArray);
            //this.Scene..clickCutPlaneViewerButton();
        },
       
    }
    return CutPlane;
})();