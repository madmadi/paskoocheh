import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  ACESFilmicToneMapping,
  sRGBEncoding,
  PMREMGenerator,
  Color,
  GridHelper,
} from 'three';
import './main.scss';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module';

const MODELS_PATH = '/public/models/';

let camera;
let scene;
let renderer;

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
  camera.position.set(-500, 1000, 100);

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

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.addEventListener('change', render);
  controls.minDistance = 400;
  controls.maxDistance = 1000;
  controls.target.set(10, 90, -16);
  controls.update();

  window.addEventListener('resize', onWindowResize, false);
}

init();
render();
