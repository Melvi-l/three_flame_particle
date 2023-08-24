import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GUI } from 'lil-gui'
import flammeVertex from "./shaders/flamme/vertex.glsl"
import flammeFragment from "./shaders/flamme/fragment.glsl"

let camera, scene, renderer, controls, debug; // ThreeJS globals
let flammeParticle;
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
  camera.position.set(2, 2, 2)
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
}


function addTestLight() {
  const ambientLight = new THREE.AmbientLight(0xffeeee, 0.3)
  const directionalLight = new THREE.DirectionalLight()
  directionalLight.position.set(3, 4, 1)
  directionalLight.lookAt(0, 0, 0)
  scene.add(ambientLight, directionalLight)
}

function generateFlammeParticle(count, size, radius, height, speedFactor, innerColor, outerColor) {
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
    flammeParticlePosition[i * 3 + 0] = polarRadius * radius * Math.cos(polarAngle)
    flammeParticlePosition[i * 3 + 1] = (Math.random() - 0.5) * height
    flammeParticlePosition[i * 3 + 2] = polarRadius * radius * Math.sin(polarAngle)

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
    count: 1000,
    size: 100,
    flammeRadius: 0.5,
    flammeHeight: 2.5,
    speedFactor: 0.5,
    innerColor: new THREE.Color(0xf69d9d),
    outerColor: new THREE.Color(0xe0e316),
  }
  const regen = () => generateFlammeParticle(debugObject.count, debugObject.size, debugObject.flammeRadius, debugObject.flammeHeight, debugObject.speedFactor, debugObject.innerColor, debugObject.outerColor)
  regen()
  debug.add(debugObject, "count").min(100).max(3000).step(10).name("Particle count").onFinishChange(regen)
  debug.add(debugObject, "size").min(0).max(500).step(1).name("Particle size").onFinishChange(regen)
  debug.add(debugObject, "flammeRadius").min(0).max(4).step(0.01).onFinishChange(regen)
  debug.add(debugObject, "flammeHeight").min(0).max(8).step(0.01).onFinishChange(regen)
  debug.add(debugObject, "speedFactor").min(0).max(3).step(0.01).onFinishChange(regen)
  debug.addColor(debugObject, "innerColor").onFinishChange(regen)
  debug.addColor(debugObject, "outerColor").onFinishChange(regen)
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