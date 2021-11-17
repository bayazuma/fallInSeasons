import * as THREE from 'three'
import { Particle } from './Particle';
import { Compute } from './Compute';
import { Utils } from './lib/Utils';

const SIZE = 26

// 手前を少くするランダム
const customRandom = (min, max, threshold) => {
  let r = Utils.random(min, max)
  if (r > threshold) {
    r = Utils.random(min, max)
  }
  if (r > threshold) {
    r = Utils.random(min, max)
  }
  if (r > threshold) {
    r = Utils.random(min, max)
  }
  return r
}

class Particles {
  compute: Compute
  particle: Particle
  containerW=0
  containerH=0
  constructor(renderer) {
    // compute
    this.compute = new Compute(renderer)
    // disp
    this.particle = new Particle(SIZE, SIZE)
    this.particle.create()
  }

  initTexture() {
    const initializeVelTex = this.createVelTexture(SIZE,SIZE)
    this.compute.initVel(initializeVelTex)
    this.compute.render('vel', false)

    const initializePosTex = this.createPosTexture(SIZE,SIZE)
    this.compute.initPos(initializePosTex)
    this.compute.render('pos', false)
  }

  createVelTexture(w, h) {    
    const size = w * h;
    const unit = 4
    const data = new Float32Array( size*unit );
    
    for ( let i = 0; i < data.length; i += unit ) {
      const x = 0
      const y = Utils.random(1, 5)
      const z = 0
      const w = customRandom(16, 110, 50) // mass and size

      data[ i ] = x;
      data[ i + 1 ] = y;
      data[ i + 2 ] = z;
      data[ i + 3 ] = w
    }
    const texture = new THREE.DataTexture( data, w, h, THREE.RGBAFormat, THREE.FloatType)    
    texture.needsUpdate = true
    return texture
  }

  createPosTexture(w, h) {
    const size = w * h;
    const unit = 4
    const data = new Float32Array( size*unit );

    for ( let i = 0; i < data.length; i += unit) {
      const x = Utils.random(-this.containerW/2, this.containerW/2) 
      const y = Utils.random(-this.containerH/2, this.containerH/2)
      const z = Utils.random(-100, 100)
      data[ i ] = x
      data[ i + 1 ] = y
      data[ i + 2 ] = z
      data[ i + 3 ] = 0 // reset flag
    }
    const texture = new THREE.DataTexture( data, w, h, THREE.RGBAFormat, THREE.FloatType)
    texture.needsUpdate = true

    return texture
  }

  onUpdate(time:number) {    
    // vel
    this.compute.updateVel(time)
    this.compute.render('vel')
    // pos
    this.compute.updatePos(time)
    this.compute.render('pos')
    // debug
    this.compute.updateDebug(time)
    // disp
    this.particle.onUpdate(
      time,
      this.compute.getTexture('pos'),
      this.compute.getTexture('vel')
    )
  }

  onResize(width, height) {
    this.compute.onResize(width, height)
    this.particle.onResize(width, height)
    this.containerW = width
    this.containerH = height

    this.initTexture()
  }
};

export { Particles }
