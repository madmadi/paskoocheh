import {
  WebGLRenderer,
  ACESFilmicToneMapping,
  sRGBEncoding,
  Vector3,
  Raycaster,
  PCFSoftShadowMap,
} from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import setupScene from './scene';
import './main.scss';

let renderer;
let scene;
let camera;
let render;
let controls;
let raycaster;

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;
let walk = true;

let prevTime = performance.now();
const velocity = new Vector3();
const direction = new Vector3();

function onKeyDown(event) {
  walk = !event.shiftKey;
  switch (event.code) {
    case 'ArrowUp':
    case 'KeyW':
      moveForward = true;
      break;

    case 'ArrowLeft':
    case 'KeyA':
      moveLeft = true;
      break;

    case 'ArrowDown':
    case 'KeyS':
      moveBackward = true;
      break;

    case 'ArrowRight':
    case 'KeyD':
      moveRight = true;
      break;

    case 'Space':
      if (canJump === true) velocity.y += 350;
      canJump = false;
      break;
    default:
      break;
  }
}

function onKeyUp(event) {
  walk = !event.shiftKey;
  switch (event.code) {
    case 'ArrowUp':
    case 'KeyW':
      moveForward = false;
      break;
    case 'ArrowLeft':
    case 'KeyA':
      moveLeft = false;
      break;
    case 'ArrowDown':
    case 'KeyS':
      moveBackward = false;
      break;
    case 'ArrowRight':
    case 'KeyD':
      moveRight = false;
      break;
    default:
      break;
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  render();
}

function init() {
  const container = document.querySelector('#mapContainer');

  renderer = new WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.outputEncoding = sRGBEncoding;
  renderer.shadowMap.enabled = true;
  // to antialias the shadow
  renderer.shadowMapType = PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  ({ scene, camera, render } = setupScene({ renderer }));

  controls = new PointerLockControls(camera, document.body);
  scene.add(controls.getObject());

  const instructions = document.getElementById('instructions');

  controls.addEventListener('lock', () => {
    instructions.style.display = 'none';
  });

  controls.addEventListener('unlock', () => {
    instructions.style.display = '';
  });
  instructions.addEventListener('click', () => {
    controls.lock();
  });

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  raycaster = new Raycaster(new Vector3(), new Vector3(0, -1, 0), 0, 10);

  window.addEventListener('resize', onWindowResize, false);
}

function animate() {
  requestAnimationFrame(animate);

  const time = performance.now();

  if (controls.isLocked === true) {
    raycaster.ray.origin.copy(controls.getObject().position);
    raycaster.ray.origin.y -= 10;

    const intersections = raycaster.intersectObjects(scene);

    const onObject = intersections.length > 0;

    const delta = (time - prevTime) / 1000;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize(); // this ensures consistent movements in all directions

    if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta * (walk ? 1 : 4);
    if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta * (walk ? 1 : 4);

    if (onObject === true) {
      velocity.y = Math.max(0, velocity.y);
      canJump = true;
    }

    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);

    controls.getObject().position.y += (velocity.y * delta); // new behavior

    if (controls.getObject().position.y < 10) {
      velocity.y = 0;
      controls.getObject().position.y = 10;
      canJump = true;
    }
  }

  prevTime = time;

  render();
}

init();
animate();
