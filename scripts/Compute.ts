import * as THREE from 'three'
import {SwapBuffer} from './lib/SwapBuffer';

import commonVert from './shaders/common.vert';
import velFrag from './shaders/ComputeVel.frag';
import posFrag from './shaders/ComputePos.frag';
import debugFrag from './shaders/ComputeDebug.frag';

class Compute {
  renderer: THREE.WebGLRenderer
  swapBuffers: {
    pos: SwapBuffer
    vel: SwapBuffer
  }
  shaders: {
    pos: THREE.RawShaderMaterial
    vel: THREE.RawShaderMaterial
  }
  debug: {
    geometry: THREE.PlaneBufferGeometry
    material: THREE.RawShaderMaterial
    mesh: THREE.Mesh
  }

  constructor(renderer) {    
    this.renderer = renderer;
    this.swapBuffers = {
      pos: new SwapBuffer(this.renderer),
      vel: new SwapBuffer(this.renderer)
    }
    this.shaders = {
      pos: new THREE.RawShaderMaterial({
        name: 'pos',
        vertexShader: commonVert,
        fragmentShader: posFrag,
        uniforms: {
          uResolution: {value: new THREE.Vector2()},
          uTime: {value: null},
          uTexPos: {value: null},
          uTexVel: {value: null},
          uVelIntensity: {value: 1},
        }
      }),
      vel: new THREE.RawShaderMaterial({
        name: 'vel',
        vertexShader: commonVert,
        fragmentShader: velFrag,
        uniforms: {
          uResolution: {value: new THREE.Vector2()},
          uTime: {value: null},
          uTexInit: {value: null}, // 初期状態に戻す用
          uTexPos: {value: null},
          uTexVel: {value: null},
          uMouse: {value: new THREE.Vector2()},
          uForce:  {value: new THREE.Vector3()},
        }
      }),
    }

    const geometry= new THREE.PlaneBufferGeometry(1, 1)
    const material= new THREE.RawShaderMaterial({
      name: 'result',
      vertexShader: commonVert,
      fragmentShader: debugFrag,
      // wireframe: true,
      uniforms: {
        uResolution: {value: new THREE.Vector2()},
        uTime: {value: null},
        uTexPos: {value: null},
        uTexVel: {value: null},
      }
    })
    const mesh = new THREE.Mesh(geometry, material)
    this.debug = {geometry,material,mesh}
  }

  initVel(velTex) {
    this.shaders.vel.uniforms.uTexInit.value = velTex
    this.shaders.vel.uniforms.uTexVel.value = velTex
    this.shaders.vel.uniforms.uTexPos.value = velTex
  }

  initPos(posTex) {
    this.shaders.pos.uniforms.uTexVel.value = posTex
    this.shaders.pos.uniforms.uTexPos.value = posTex
  }

  setTexture(targetName, uniformName, value) {
    this.shaders[targetName].uniforms[uniformName].value = value
  }

  updateVel(time:number) {
    this.shaders.vel.uniforms.uTexVel.value = this.swapBuffers.vel.getTexture()
    this.shaders.vel.uniforms.uTexPos.value = this.swapBuffers.pos.getTexture()
    this.shaders.vel.uniforms.uTime.value = time
  }
  updatePos(time:number) {
    this.shaders.pos.uniforms.uTexVel.value = this.swapBuffers.vel.getTexture()
    this.shaders.pos.uniforms.uTexPos.value = this.swapBuffers.pos.getTexture()
    this.shaders.pos.uniforms.uTime.value = time
  }
  updateDebug(time:number) {
    this.debug.material.uniforms.uTexVel.value = this.swapBuffers.vel.getTexture()
    this.debug.material.uniforms.uTexPos.value = this.swapBuffers.pos.getTexture()
    this.debug.material.uniforms.uTime.value = time
  }

  render(name, doSwap=true) {
    const b = this.swapBuffers[name]
    b.setMaterial(this.shaders[name])
    if (doSwap) {
      b.swap()
    }
    b.render()
  }

  getTexture(name) {
    return this.swapBuffers[name].getTexture()
  }

  onResize(width, height) {
    for (const key in this.swapBuffers) {
      if (Object.prototype.hasOwnProperty.call(this.swapBuffers, key)) {
        const swapBuffer = this.swapBuffers[key];
        swapBuffer.resize(width, height)
      }
    }

    for (const key in this.shaders) {
      if (Object.prototype.hasOwnProperty.call(this.shaders, key)) {
        const shader = this.shaders[key];        
        shader.uniforms.uResolution.value.set(width, height)
      }
    }

    this.debug.material.uniforms.uResolution.value.set(width, height)
    this.debug.mesh.scale.set(width/2, height/2, 1)
  }
};

export { Compute }
