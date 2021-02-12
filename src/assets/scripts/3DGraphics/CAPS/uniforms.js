var UniformManager = function () {
    this.uniforms = [];
};

UniformManager.prototype = {

    constructor: UniformManager,

    get: function (color) {
        var u = {
            color: { type: "c", value: new THREE.Color(color) },//
            clippingLow: { type: "v3", value: new THREE.Vector3(0, 0, 0) },
            clippingHigh: { type: "v3", value: new THREE.Vector3(0, 0, 0) }
        };
        this.uniforms.push(u);
        return u;
    },

    update: function (limitLow, limitHigh) {
        this.uniforms.forEach(function (u) {
            u.clippingLow.value.copy(limitLow);
            u.clippingHigh.value.copy(limitHigh);
        });
    }

};

CAPS.UNIFORMS = {
    clipping: new UniformManager(),
    caps: {
        color: { type: "c", value: new THREE.Color(0xf83610) }//
    }
};

//CAPS.UNIFORMS = {
//    // shawn - shis is where the color of the main object gets set
//    clipping: {
//        color: { type: "c", value: new THREE.Color(0x999999) },//0x3d9ecb//0x555555
//        clippingLow: { type: "v3", value: new THREE.Vector3(0, 0, 0) },
//        clippingHigh: { type: "v3", value: new THREE.Vector3(0, 0, 0) }
//    },
//     //shawn - shis is where the color of the caps gets set
//    caps: {
//        color: { type: "c", value: new THREE.Color(0xf83610) }//
//    }
//};

