import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

let camera, scene, renderer, controls; // ThreeJS globals
let sizes;

init()

function init() {
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
  camera.position.set(2,2,2)
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

  addTestLight()
  addTestObject()
}

function addTestObject() {
  scene.add(new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial({ color: 0xff0000 })))
}

function addTestLight() {
  const ambientLight = new THREE.AmbientLight(0xffeeee, 0.3)
  const spotlight = new THREE.DirectionalLight()
  // const spotlight = new THREE.SpotLight()
  spotlight.position.set(3, 4, 1)
  spotlight.lookAt(0, 0, 0)
  scene.add(ambientLight, spotlight)
}

// Animate
const clock = new THREE.Clock()

function animation() {
  const elapsedTime = clock.getElapsedTime()

  // Update controls
  if (controls) {
    controls.update()
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