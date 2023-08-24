import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GUI } from 'lil-gui'
import flammeVertex from "./shaders/flamme/vertex.glsl"
import flammeFragment from "./shaders/flamme/fragment.glsl"
import smokeVertex from "./shaders/smoke/vertex.glsl"
import smokeFragment from "./shaders/smoke/fragment.glsl"

let camera, scene, renderer, controls, debug; // ThreeJS globals
let flammeParticle, smokeParticle;
let sizes;

init()

function init() {
  // Debug
  debug = new GUI()

  // Canvas
  const canvas = document.querySelector('canvas#web-gl')

  // Scene
  scene = new THREE.Scene()

  // Sizes
  sizes = {
    width: window.innerWidth,
    height: window.innerHeight
  }

  // Camera
  camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
  camera.position.set(15, 2, 15)
  scene.add(camera)

  // Controls
  controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true

  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas: canvas
  })
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setAnimationLoop(animation)

  scene.add(new THREE.AxesHelper(1))

  addTestLight()
  addFlamme()
  addSmoke()
}


function addTestLight() {
  const ambientLight = new THREE.AmbientLight(0xffeeee, 0.3)
  const directionalLight = new THREE.DirectionalLight()
  directionalLight.position.set(3, 4, 1)
  directionalLight.lookAt(0, 0, 0)
  scene.add(ambientLight, directionalLight)
}

function generateFlammeParticle(position, count, size, radius, height, speedFactor, innerColor, outerColor) {
  if (flammeParticle) {
    flammeParticle.geometry.dispose()
    flammeParticle.material.dispose()
    scene.remove(flammeParticle)
  }
  const flammeParticleGeometry = new THREE.BufferGeometry()
  const flammeParticlePosition = new Float32Array(count * 3)
  const flammeParticleScale = new Float32Array(count)
  for (let i = 0; i < count; ++i) {
    // Polar coordinate
    const polarRadius = Math.random()
    const polarAngle = Math.random() * 2 * Math.PI
    flammeParticlePosition[i * 3 + 0] = position.x + polarRadius * radius * Math.cos(polarAngle)
    flammeParticlePosition[i * 3 + 1] = position.y + Math.random() * height
    flammeParticlePosition[i * 3 + 2] = position.z + polarRadius * radius * Math.sin(polarAngle)

    flammeParticleScale[i] = Math.random()
  }
  flammeParticleGeometry.setAttribute("position", new THREE.Float32BufferAttribute(flammeParticlePosition, 3))
  flammeParticleGeometry.setAttribute("a_scale", new THREE.Float32BufferAttribute(flammeParticleScale, 1))

  // Material
  const flammeParticleMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: flammeVertex,
    fragmentShader: flammeFragment,
    uniforms: {
      u_position: {value: position},
      u_radius: { value: radius },
      u_height: { value: height },
      u_size: { value: size },
      u_time: { value: 0 },
      u_speedFactor: { value: speedFactor },
      u_innerColor: { value: innerColor },
      u_outerColor: { value: outerColor },
    },
  })

  // Point
  flammeParticle = new THREE.Points(flammeParticleGeometry, flammeParticleMaterial)
  scene.add(flammeParticle)
}

function addFlamme() {
  const debugObject = {
    position: new THREE.Vector3(),
    count: 1100,
    size: 130,
    flammeRadius: 0.6,
    flammeHeight: 2.5,
    speedFactor: 0.5,
    innerColor: new THREE.Color(0xFFF2A0),
    outerColor: new THREE.Color(0xD60808),
  }
  const regen = () => generateFlammeParticle(debugObject.position, debugObject.count, debugObject.size, debugObject.flammeRadius, debugObject.flammeHeight, debugObject.speedFactor, debugObject.innerColor, debugObject.outerColor)
  regen()
  const folder = debug.addFolder("flamme")
  folder.add(debugObject, "count").min(100).max(3000).step(10).name("Particle count").onFinishChange(regen)
  folder.add(debugObject, "size").min(0).max(500).step(1).name("Particle size").onFinishChange(regen)
  folder.add(debugObject, "flammeRadius").min(0).max(4).step(0.01).onFinishChange(regen)
  folder.add(debugObject, "flammeHeight").min(0).max(8).step(0.01).onFinishChange(regen)
  folder.add(debugObject, "speedFactor").min(0).max(3).step(0.01).onFinishChange(regen)
  folder.addColor(debugObject, "innerColor").onFinishChange(regen)
  folder.addColor(debugObject, "outerColor").onFinishChange(regen)
}

function generateSmokeParticle(position, count, size, radius, height, speedFactor, windForce, windWaveFactor, windWavePeriod) {
  if (smokeParticle) {
    smokeParticle.geometry.dispose()
    smokeParticle.material.dispose()
    scene.remove(smokeParticle)
  }
  const smokeParticleGeometry = new THREE.BufferGeometry()
  const smokeParticlePosition = new Float32Array(count * 3)
  const smokeParticleScale = new Float32Array(count)
  for (let i = 0; i < count; ++i) {
    // Polar coordinate
    const polarRadius = Math.random()
    const polarAngle = Math.random() * 2 * Math.PI
    smokeParticlePosition[i * 3 + 0] = position.x + polarRadius * radius * Math.cos(polarAngle)
    smokeParticlePosition[i * 3 + 1] = position.y + Math.random() * height
    smokeParticlePosition[i * 3 + 2] = position.z + polarRadius * radius * Math.sin(polarAngle)

    smokeParticleScale[i] = Math.random()
  }
  smokeParticleGeometry.setAttribute("position", new THREE.Float32BufferAttribute(smokeParticlePosition, 3))
  smokeParticleGeometry.setAttribute("a_scale", new THREE.Float32BufferAttribute(smokeParticleScale, 1))

  // Material
  const smokeParticleMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    vertexShader: smokeVertex,
    fragmentShader: smokeFragment,
    uniforms: {
      u_position: {value: position},
      u_radius: { value: radius },
      u_height: { value: height },
      u_size: { value: size },
      u_time: { value: 0 },
      u_speedFactor: { value: speedFactor },
      u_windForce: {value: windForce },
      u_windWaveFactor: {value: windWaveFactor },
      u_windWavePeriod: {value: windWavePeriod },
    },
  })

  // Point
  smokeParticle = new THREE.Points(smokeParticleGeometry, smokeParticleMaterial)
  scene.add(smokeParticle)
}

function addSmoke() {
  const debugObject = {
    position: new THREE.Vector3(0,1.5,0),
    count: 1100,
    size: 130,
    smokeRadius: 0.6,
    smokeHeight: 5,
    speedFactor: 0.5,
    windForce: new THREE.Vector3(4,0,0),
    windWaveFactor: 5,
    windWavePeriod: 5
  }
  const regen = () => generateSmokeParticle(debugObject.position, debugObject.count, debugObject.size, debugObject.smokeRadius, debugObject.smokeHeight, debugObject.speedFactor, debugObject.windForce, debugObject.windWaveFactor, debugObject.windWavePeriod)
  regen()
  const folder = debug.addFolder("smoke")
  folder.add(debugObject, "count").min(100).max(3000).step(10).name("Particle count").onFinishChange(regen)
  folder.add(debugObject, "size").min(0).max(500).step(1).name("Particle size").onFinishChange(regen)
  folder.add(debugObject, "smokeRadius").min(0).max(4).step(0.01).onFinishChange(regen)
  folder.add(debugObject, "smokeHeight").min(0).max(8).step(0.01).onFinishChange(regen)
  folder.add(debugObject, "speedFactor").min(0).max(3).step(0.01).onFinishChange(regen)
  folder.add(debugObject.windForce, "x").min(-10).max(10).step(0.01).name("windX").onFinishChange(regen)
  folder.add(debugObject.windForce, "y").min(-10).max(10).step(0.01).name("windY").onFinishChange(regen)
  folder.add(debugObject.windForce, "z").min(-10).max(10).step(0.01).name("windZ").onFinishChange(regen)
  folder.add(debugObject, "windWaveFactor").min(0).max(20).step(0.01).onFinishChange(regen)
  folder.add(debugObject, "windWavePeriod").min(0).max(20).step(0.01).onFinishChange(regen)
}

// Animate
const clock = new THREE.Clock()

function animation() {
  const elapsedTimeSecond = clock.getElapsedTime()

  // Update controls
  if (controls) {
    controls.update()
  }

  // Update particle
  if (flammeParticle) {
    flammeParticle.material.uniforms.u_time.value = elapsedTimeSecond
  }
  if (smokeParticle) {
    smokeParticle.material.uniforms.u_time.value = elapsedTimeSecond
  }
  // Render
  renderer.render(scene, camera)
}


// Resize handler
window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})