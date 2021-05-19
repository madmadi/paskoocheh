import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  ACESFilmicToneMapping,
  sRGBEncoding,
  PMREMGenerator,
  Color,
  GridHelper,
  Vector3,
  Raycaster,
  Vector2
} from 'three';
import './main.scss';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module';

const MODELS_PATH = '/public/models/';

let camera;
let scene;
let renderer;
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
      if (canJump === true) velocity.y += (walk ? 350 : 700);
      canJump = false;
      break;
    default:
      break;
  }
}

function onKeyUp(event) {
  walk = false;
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



function render() {
  renderer.render(scene, camera);
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
  container.appendChild(renderer.domElement);

  camera = new PerspectiveCamera(-1000, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.set(-250, 10, 500);

  const environment = new RoomEnvironment();
  const pmremGenerator = new PMREMGenerator(renderer);

  scene = new Scene();
  scene.background = new Color(0xbbbbbb);
  scene.environment = pmremGenerator.fromScene(environment).texture;

  const grid = new GridHelper(500, 10, 0xffffff, 0xffffff);
  grid.material.opacity = 0.5;
  grid.material.depthWrite = false;
  grid.material.transparent = true;
  scene.add(grid);

  const loader = new GLTFLoader().setPath(MODELS_PATH);
  loader.setMeshoptDecoder(MeshoptDecoder);
  loader.load('Farhang.glb', (gltf) => {
    // eslint-disable-next-line no-param-reassign
    gltf.scene.position.y = 0;

    scene.add(gltf.scene);

    render();
  });

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
const mouse = new Vector2();
function animate() {
  requestAnimationFrame(animate);

  const time = performance.now();

  if (controls.isLocked === true) {
    raycaster.ray.origin.copy(controls.getObject().position);
    raycaster.ray.origin.y -= 10;

    raycaster.setFromCamera(mouse, camera);
    const intersections = raycaster.intersectObjects(scene.children, true);

    const delta = (time - prevTime) / 1000;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize(); // this ensures consistent movements in all directions

    if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta * (walk ? 1 : 4);
    if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta * (walk ? 1 : 4);

    controls.moveRight(-velocity.x * delta);
    if (!intersections.length) controls.moveForward(-velocity.z * delta);

    controls.getObject().position.y += (velocity.y * delta); // new behavior

    if (controls.getObject().position.y < 10) {
      velocity.y = 0;
      controls.getObject().position.y = 10;
      canJump = true;
    }
  }

  prevTime = time;

  renderer.render(scene, camera);
}

init();
animate();
