import * as THREE from 'three'
import { Utils } from './lib/Utils'

import fragment from './shaders/Particle.frag'
import vertex from './shaders/Particle.vert'
import mapleAlbedo from '../img/mapleTex.png'
import flowerAlbedo from '../img/flowerTex.png'
import snowAlbedo from '../img/snowTex.png'
import dropAlbedo from '../img/dropTex.png'

class Particle {
  name: string
  group: THREE.Object3D
  geometry: THREE.BufferGeometry
  material: THREE.RawShaderMaterial
  textures: {
    maple: THREE.Texture
    flower: THREE.Texture
    snow: THREE.Texture
    drop: THREE.Texture
  }
  uniforms: { [uniform: string]: THREE.IUniform }
  mesh: THREE.Mesh

  sizeX: number
  sizeY: number
  amount: number
  constructor(sizeX, sizeY) { 
    this.name = 'Particle'
    this.group = new THREE.Object3D()
    this.group.name = this.name + 'Group'

    this.sizeX = sizeX
    this.sizeY = sizeY
    this.amount = sizeX * sizeY

    this.textures = {
      maple: new THREE.TextureLoader().load(mapleAlbedo),
      flower: new THREE.TextureLoader().load(flowerAlbedo),
      snow: new THREE.TextureLoader().load(snowAlbedo),
      drop: new THREE.TextureLoader().load(dropAlbedo),
    }
  }

  create(): void {
    this.vertex()
    this.status()
    this.program()
    this.group.add(this.mesh);
  }

  vertex(): void {
    const w = 1
    const h = 1
    const halfW = w*0.5
    const halfH = h*0.5

    let vertices = []   // 頂点
    let uvs = []        // UV座標
    let indices = []    // インデックス
    let references = [] // 参照
    let randoms = []    // ランダム値

    for (let i = 0; i < this.amount; i++) {
      vertices = [
        ...vertices,
        -halfW, halfH,0, // 左上
         halfW, halfH,0, // 右上
        -halfW,-halfH,0, // 左下
         halfW,-halfH,0, // 右下
      ]

      const stepX = 1/3
      const stepY = 1
      const colIndex = Utils.randomInt(0,2)
      const rowIndex = 0
      uvs = [
        ...uvs,
        stepX*colIndex      ,stepY*rowIndex,       // 左上
        stepX*colIndex+stepX,stepY*rowIndex,       // 右上
        stepX*colIndex      ,stepY*rowIndex+stepY, // 左下
        stepX*colIndex+stepX,stepY*rowIndex+stepY  // 右下
      ]

      var indexOffset = i * 4;
      indices = [
        ...indices,
        0+indexOffset, 2+indexOffset, 1+indexOffset, // 左上->左下->右上
        2+indexOffset, 3+indexOffset ,1+indexOffset  // 左下->右下->右上
      ]

      const random3D = Utils.randomSphere()
      randoms = [
        ...randoms,
        ...random3D,
        ...random3D,
        ...random3D,
        ...random3D,
      ]
    }

    const offsetX = 1/this.sizeX*0.5
    const offsetY = 1/this.sizeY*0.5

    for (let x = 0; x < this.sizeX; x++) {
      for (let y = 0; y < this.sizeY; y++) {
        references = [
          ...references,
          x/this.sizeX+offsetX, y/this.sizeY+offsetY,
          x/this.sizeX+offsetX, y/this.sizeY+offsetY,
          x/this.sizeX+offsetX, y/this.sizeY+offsetY,
          x/this.sizeX+offsetX, y/this.sizeY+offsetY,
        ];
      }
    }
    
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
    this.geometry.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(uvs), 2));
    this.geometry.setAttribute('reference',new THREE.BufferAttribute(new Float32Array(references), 2));
    this.geometry.setAttribute('random', new THREE.BufferAttribute(new Float32Array(randoms), 3));
    this.geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1));
  }

  status(): void {
    this.uniforms = {
      uTexPos: { value: null },
      uTexVel: { value: null },
      uTime: { value: 0 },
      uTexAlbedo: { value: this.textures.maple},
      uHue: { value: 11},
      uSat: { value: 2.4},
      uResolution: { value: new THREE.Vector2(this.sizeX,this.sizeY)},
      uRotateIntensity: { value: new THREE.Vector3(0,0,0)},
      uWaveAmp: { value: 0.0},
      uWaveFreq: { value: 0.0},
      uOpacity: { value: 0.0},
    }

    this.material = new THREE.RawShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: this.uniforms,
      transparent: true,
      side: THREE.DoubleSide,
      // wireframe: true,
    });
  }

  program(): void {
    this.mesh = new THREE.Mesh(this.geometry, this.material)
  }

  changeTexture(name) {
    const tex = this.textures[name]
    this.uniforms.uTexAlbedo.value = tex
  }

  onUpdate(time, TexPos, TexVel) {
    this.uniforms.uTime.value = time
    this.uniforms.uTexPos.value = TexPos
    this.uniforms.uTexVel.value = TexVel
  }

  onResize(w:number, h:number) {
    this.uniforms.uResolution.value = new THREE.Vector2(w, h)
  }
}

export {Particle}
