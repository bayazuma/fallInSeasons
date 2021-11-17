import * as THREE from 'three'
import commonVert from '../shaders/common.vert';
import commonFrag from '../shaders/common.frag';

class SwapBuffer {
  renderer: THREE.WebGLRenderer
  camera: THREE.OrthographicCamera
  scene: THREE.Scene 
  buffers: THREE.WebGLRenderTarget[]
  mesh: THREE.Mesh
  geometry: THREE.BufferGeometry
  material: THREE.RawShaderMaterial

  constructor(renderer) {    
    this.renderer = renderer;
    this.scene = new THREE.Scene();    
    this.buffers = [
      new THREE.WebGLRenderTarget(1,1,{
        format: THREE.RGBAFormat,
        type: ((/(iPad|iPhone|iPod)/g.test(navigator.userAgent)) ? THREE.HalfFloatType : THREE.FloatType),
        magFilter: THREE.NearestFilter,
        minFilter: THREE.NearestFilter,
        wrapS: THREE.ClampToEdgeWrapping,
        wrapT: THREE.ClampToEdgeWrapping,
        stencilBuffer: false,
        depthBuffer: false,
        generateMipmaps: false,
      })
    ];
    this.buffers[1] = this.buffers[0].clone();
    // this.buffers[0].texture.flipY = false;
    // this.buffers[1].texture.flipY = false;

    const left = -1
    const right = 1
    const top = 1
    const bottom = -1
    const near = 0
    const far = 1
    this.camera = new THREE.OrthographicCamera(
      left,right,top,bottom,near,far
    )
    this.geometry = new THREE.PlaneBufferGeometry(2, 2);    
    this.material = new THREE.RawShaderMaterial({
      vertexShader: commonVert,
      fragmentShader: commonFrag,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uResolution: {value: new THREE.Vector2()},
      }
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh)
  }

  swap() {    
    const temp = this.buffers[0];
    this.buffers[0] = this.buffers[1];
    this.buffers[1] = temp;
  }

  getTexture() {
    return this.getBuffer().texture;
  }

  getBuffer() {
    return this.buffers[0];
  }

  render() {
    this.renderer.setRenderTarget(this.getBuffer())
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(null)
  }

  setMaterial(material) {    
    this.mesh.material = material;
    this.mesh.material.needsUpdate = true;
  }

  resize(width, height) {
    this.buffers[0].setSize(width, height);
    this.buffers[1].setSize(width, height);
    this.material.uniforms.uResolution.value.set(width, height)
  }

};

export { SwapBuffer }