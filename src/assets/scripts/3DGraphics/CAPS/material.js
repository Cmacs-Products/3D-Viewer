CAPS.MATERIAL = {

    sheet2: function (color) {
        return new THREE.ShaderMaterial({
            uniforms: CAPS.UNIFORMS.clipping.get(color),
            vertexShader: CAPS.SHADER.vertexClipping,
            fragmentShader: CAPS.SHADER.fragmentClipping
        });
    },

    sheet: new THREE.ShaderMaterial({
        uniforms: CAPS.UNIFORMS.clipping,
        vertexShader: CAPS.SHADER.vertexClipping,
        fragmentShader: CAPS.SHADER.fragmentClipping,
        side: THREE.DoubleSide
    }),

    cap: new THREE.ShaderMaterial({
        uniforms: CAPS.UNIFORMS.caps,
        vertexShader: CAPS.SHADER.vertex,
        fragmentShader: CAPS.SHADER.fragment,
        //side: THREE.DoubleSide
    }),
    
    backStencil: new THREE.ShaderMaterial({
        uniforms: CAPS.UNIFORMS.clipping.get(0x000000),
        vertexShader: CAPS.SHADER.vertexClipping,
        fragmentShader: CAPS.SHADER.fragmentClippingFront,
        colorWrite: false,
        depthWrite: false,
        side: THREE.BackSide
    }),
    frontStencil: new THREE.ShaderMaterial({
        uniforms: CAPS.UNIFORMS.clipping.get(0x000000),
        vertexShader: CAPS.SHADER.vertexClipping,
        fragmentShader: CAPS.SHADER.fragmentClippingFront,
        colorWrite: false,
        depthWrite: false,
    }),

    //backStencil: new THREE.ShaderMaterial({
    //    uniforms: CAPS.UNIFORMS.clipping,
    //    vertexShader: CAPS.SHADER.vertexClipping,
    //    fragmentShader: CAPS.SHADER.fragmentClippingFront,
    //    colorWrite: false,
    //    depthWrite: false,
    //    side: THREE.BackSide
    //    //side: THREE.DoubleSide
    //}),
    //frontStencil: new THREE.ShaderMaterial({
    //    uniforms: CAPS.UNIFORMS.clipping,
    //    vertexShader: CAPS.SHADER.vertexClipping,
    //    fragmentShader: CAPS.SHADER.fragmentClippingFront,
    //    colorWrite: false,
    //    depthWrite: false,
    //    //side: THREE.DoubleSide
    //}),

    // shawn - capping box/edges color get set here

    // Color of the capping box face
    BoxBackFace: new THREE.MeshBasicMaterial({ color: 0xEBEBEB, transparent: true }), //0xEEDDCC

    // Color of the capping box edges
    BoxWireframe: new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 }), //

    // Color of capping box edges when hovering over a capping box face
    BoxWireActive: new THREE.LineBasicMaterial({ color: 0Xff0000, linewidth: 4 }), //0xf83610

    Invisible: new THREE.ShaderMaterial({
        vertexShader: CAPS.SHADER.invisibleVertexShader,
        fragmentShader: CAPS.SHADER.invisibleFragmentShader
    }),

    // use this material to show the invisible dragging plane for debugging:
    //Invisible: new THREE.MeshBasicMaterial({ color: 0x000000, linewidth: 1, wireframe: true })

};

