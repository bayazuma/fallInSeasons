import "regenerator-runtime/runtime";
import * as THREE from 'three'
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import {Particles} from './Particles'
import { Utils } from './lib/Utils';

import gsap from 'gsap'

const MAX_FPS = 30

class Main {
  container: HTMLElement
  width: number
  height: number
  scene: THREE.Scene
  renderer: THREE.WebGLRenderer
  camera: THREE.PerspectiveCamera
  orbitControls: OrbitControls
  particles: Particles

  elapsedTime = 0
  oldTime = 0
  isPlaying = false

  axesHelper?: THREE.AxesHelper
  gridHelper?: THREE.GridHelper

  constructor(options) {
    this.container = options.dom
    this.width = this.container.offsetWidth
    this.height = this.container.offsetHeight
    this.scene = new THREE.Scene()

    const fov = 50
    const distance = Utils.calcCameraDistance(this.height, fov)
    this.camera = new THREE.PerspectiveCamera(
      fov,
      this.width/this.height,
      0.1,
      5000
    )
    this.camera.position.set(0, 0, distance)
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
    })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(this.width, this.height)
    this.renderer.setClearColor(0x000000, 0)
    this.container.appendChild(this.renderer.domElement)
    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement)

    this.addObjects()
    this.resize()
    this.eventAttach()
    // this.play()
  }

  eventAttach() {
    window.addEventListener('resize', this.resize.bind(this))
  }

  addObjects() {
    this.particles = new Particles(this.renderer)
    this.scene.add(this.particles.particle.group)
    // debug用
    // this.scene.add(this.particles.compute.debug.mesh)

    this.axesHelper = new THREE.AxesHelper(1);
    this.axesHelper.visible = false
    this.scene.add(this.axesHelper);
    this.gridHelper = new THREE.GridHelper(1, 10);
    this.gridHelper.visible = false
    this.scene.add(this.gridHelper);
  }

  play() {
    if (!this.isPlaying) {
      this.oldTime = performance.now()
      this.isPlaying = true
      this.render()
    }
  }

  pause() {
    this.isPlaying = false
  }

  render() {
    if(!this.isPlaying) return

    setTimeout(() => {
      window.requestAnimationFrame(this.render.bind(this))
    }, 1000 / MAX_FPS)

    this.update()

    this.renderer.render(this.scene, this.camera)
  }

  update() {
    const newTime = performance.now()
    const diff = (newTime - this.oldTime) / 1000
    this.oldTime = newTime
    this.elapsedTime += diff

    this.particles.onUpdate(this.elapsedTime)
    this.orbitControls.update()
  }

  resize() {    
    this.width = this.container.offsetWidth
    this.height = this.container.offsetHeight

    this.renderer.setSize(this.width, this.height)
    const distance = Utils.calcCameraDistance(this.height, this.camera.fov)
    this.camera.aspect = this.width / this.height
    this.camera.position.z = distance
    this.camera.updateProjectionMatrix() 

    this.particles.onResize(this.width, this.height)
  
    const w = this.width
    if (this.axesHelper) {
      this.axesHelper.scale.set(w,w,w)
    }
    if (this.gridHelper) {
      this.gridHelper.scale.set(w,w,w)
    }
  }
}

/**
 * --------------------------------------
 * main
 * -------------------------------------- 
 */
const main = new Main({
  dom: document.getElementById('container')
})
main.play()

/**
 * --------------------------------------
 * event
 * -------------------------------------- 
 */
const controls = document.querySelectorAll('.btn')
controls.forEach(element => {
  element.addEventListener('click', (e:PointerEvent) => {
    const btn = e.currentTarget as HTMLElement
    actions[btn.dataset.id]()
  })
});

/**
 * --------------------------------------
 * animation
 * -------------------------------------- 
 */
const env = main.particles.compute.shaders
const envVelUni = env.vel.uniforms
const envPosUni = env.pos.uniforms
const particle = main.particles.particle
const particleUni = particle.material.uniforms
const animParam = {
  duration: 0.6,
  ease: 'power3.easeIn'
}
const actions = {
  maple: () => {
    main.particles.particle.changeTexture('maple')
    gsap.to('body', {
      background: '#220b00',
      ...animParam,
    })

    gsap.to(envVelUni.uForce.value, {
      x: 9.2,
      y: -10,
      z: 0,
      ...animParam,
    })
    gsap.to(envPosUni.uVelIntensity, {
      value: 1,
      ...animParam,
    })
    gsap.to(particleUni.uHue, {
      value: 3,
      ...animParam,
    })
    gsap.to(particleUni.uSat, {
      value: 2.6,
      ...animParam,
    })
    gsap.to(particleUni.uOpacity, {
      value: 1.0,
      ...animParam,
    })
    // gsap.to(particleUni.uRotateIntensity.value, {
    //   x: 0.47,
    //   y: 0.36,
    //   z: 0.4,
    //   ...animParam,
    // })
    particleUni.uRotateIntensity.value.set(0.47,0.36,0.4)
    particleUni.uWaveAmp.value = 1.5
    particleUni.uWaveFreq.value = 0.15
    gsap.to(particle.group.rotation, {
      z: 0,
      ...animParam,
    })
  },
  flower: () => {
    main.particles.particle.changeTexture('flower')
    gsap.to('body', {
      background: '#9f5b8e',
      ...animParam,
    })

    gsap.to(envVelUni.uForce.value, {
      x: -2.6,
      y: -4.4,
      z: 0,
      ...animParam,
    })
    gsap.to(envPosUni.uVelIntensity, {
      value: 0.9,
      ...animParam,
    })
    gsap.to(particleUni.uHue, {
      value: 3,
      ...animParam,
    })
    gsap.to(particleUni.uSat, {
      value: 5.2,
      ...animParam,
    })
    gsap.to(particleUni.uOpacity, {
      value: 1.0,
      ...animParam,
    })

    // gsap.to(particleUni.uRotateIntensity.value, {
    //   x: 0.42,
    //   y: 0.52,
    //   z: 0.5,
    //   ...animParam,
    // })

    particleUni.uRotateIntensity.value.set(0.58,0.71,0.52)
    particleUni.uWaveAmp.value = 0
    particleUni.uWaveFreq.value = 0
    gsap.to(particle.group.rotation, {
      z: 0,
      ...animParam,
    })
  },
  snow: () => {
    main.particles.particle.changeTexture('snow')
    gsap.to('body', {
      background: '#000000',
      ...animParam,
    })

    gsap.to(envVelUni.uForce.value, {
      x: 0,
      y: -1.7,
      z: 0,
      ...animParam,
    })
    gsap.to(envPosUni.uVelIntensity, {
      value: 0.42,
      ...animParam,
    })
    gsap.to(particleUni.uHue, {
      value: 1,
      ...animParam,
    })
    gsap.to(particleUni.uSat, {
      value: 1,
      ...animParam,
    })
    gsap.to(particleUni.uOpacity, {
      value: 1.0,
      ...animParam,
    })
    particleUni.uRotateIntensity.value.set(0,0,0.4)
    particleUni.uWaveAmp.value = 2
    particleUni.uWaveFreq.value = 0.2
    gsap.to(particle.group.rotation, {
      z: 0,
      ...animParam,
    })
  },
  drop: () => {
    main.particles.particle.changeTexture('drop')
    gsap.to('body', {
      background: '#1c2c32',
      ...animParam,
    })

    gsap.to(envVelUni.uForce.value, {
      x: 0,
      y: -200,
      z: 0,
      ...animParam,
    })
    gsap.to(envPosUni.uVelIntensity, {
      value: 1,
      ...animParam,
    })
    gsap.to(particleUni.uHue, {
      value: 1,
      ...animParam,
    })
    gsap.to(particleUni.uSat, {
      value: 1,
      ...animParam,
    })
    gsap.to(particleUni.uOpacity, {
      value: 1.0,
      ...animParam,
    })

    particleUni.uRotateIntensity.value.set(0,0,0)
    particleUni.uWaveAmp.value = 0
    particleUni.uWaveFreq.value = 0
    gsap.to(particle.group.rotation, {
      z: 0,
      ...animParam,
    })
  },
}

// orbitControl limit
main.orbitControls.minDistance = 480
main.orbitControls.maxDistance = 700
main.orbitControls.minPolarAngle = 1.3; // 上の(下を向く)調整
main.orbitControls.maxPolarAngle = Math.PI-1.5; // 下の(上を向く)調整
main.orbitControls.minAzimuthAngle = - Math.PI/16;
main.orbitControls.maxAzimuthAngle = Math.PI/16;
// main.orbitControls.enableDamping = true
// main.orbitControls.dampingFactor = 0.008
// main.orbitControls.autoRotate = true
// main.orbitControls.autoRotateSpeed = 2.8

/**
 * --------------------------------------
 * debug
 * -------------------------------------- 
 */
const gui = new GUI();
gui.add(main, 'play')
gui.add(main, 'pause')
gui.add(envVelUni.uForce.value, 'y', -10, 1, 0.1).name('Gravity').listen()
gui.add(envVelUni.uForce.value, 'x', -10, 10, 0.1).name('WindX').listen()
gui.add(envVelUni.uForce.value, 'z', -1, 1, 0.1).name('WindZ').listen()
gui.add(envPosUni.uVelIntensity, 'value', 0, 1, 0.01).name('uVelIntensity').listen()
gui.add(particleUni.uHue, 'value', 0, 360, 1).name('uHue').listen()
gui.add(particleUni.uSat, 'value', 0, 10, 0.1).name('uSat').listen()
gui.add(particleUni.uRotateIntensity.value, 'x', 0, 2, 0.01).name('uRotateIntensityX').listen()
gui.add(particleUni.uRotateIntensity.value, 'y', 0, 2, 0.01).name('uRotateIntensityY').listen()
gui.add(particleUni.uRotateIntensity.value, 'z', 0, 2, 0.01).name('uRotateIntensityZ').listen()
gui.add(particleUni.uWaveAmp, 'value', 0, 2, 0.01).name('uWaveAmp').listen()
gui.add(particleUni.uWaveFreq, 'value', 0, 1, 0.01).name('uWaveFreq').listen()
gui.add(particle.group.position, 'x', 0, 1000, 1).listen()
gui.add(particle.group.rotation, 'z', -Math.PI*2, Math.PI*2, 0.01).listen()
gui.add(actions, 'maple')
gui.add(actions, 'flower')
gui.add(actions, 'snow')
gui.add(actions, 'drop')
gui.add(main.orbitControls, 'autoRotate')
gui.add(main.axesHelper, 'visible').name('axes visible')
gui.add(main.gridHelper, 'visible').name('grid visible')
// 非表示
gui.__proto__.constructor.toggleHide()

