import {
  Scene,
  PerspectiveCamera,
  Color,
  DirectionalLight,
  HemisphereLight,
  HemisphereLightHelper,
} from 'three';
import Mousetrap from 'mousetrap';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass';
import { VignetteShader } from 'three/examples/jsm/shaders/VignetteShader';

const MODELS_PATH = './public/models/';
const MODEL = 'Farhang.glb';

let camera;
let scene;
let composer;
let glitchPass;

export default function setupScene({ renderer }) {
  composer = new EffectComposer(renderer);

  camera = new PerspectiveCamera(-1000, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.set(200, 10, 1500);

  scene = new Scene();
  scene.background = new Color(0xf0e8e1);

  const shaderVignette = VignetteShader;
  const effectVignette = new ShaderPass(shaderVignette);
  const effectFilm = new FilmPass(0.35, 0.025, 648, false);

  const renderPass = new RenderPass(scene, camera);
  glitchPass = new GlitchPass();
  glitchPass.enabled = false;
  glitchPass.goWild = true;

  composer.addPass(renderPass);
  composer.addPass(effectFilm);
  composer.addPass(effectVignette);
  composer.addPass(glitchPass);

  const hemiLight = new HemisphereLight(0xffffff, 0xffffff, 0.6);
  hemiLight.color.setHSL(30 / 360, 0.2, 0.61);
  hemiLight.position.set(0, 2000, 0);
  scene.add(hemiLight);

  const hemiLightHelper = new HemisphereLightHelper(hemiLight, 10);
  scene.add(hemiLightHelper);

  const dirLight = new DirectionalLight(0xffffff, 1.75, 2000);
  dirLight.color.setHSL(30 / 360, 1, 0.95);
  dirLight.position.set(-2000, 2000, 0);
  scene.add(dirLight);

  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;

  const d = 1500;

  dirLight.shadow.camera.left = -d;
  dirLight.shadow.camera.right = d;
  dirLight.shadow.camera.top = d;
  dirLight.shadow.camera.bottom = -d;

  dirLight.shadow.camera.far = 4500;
  dirLight.shadow.bias = 0.00001;

  const loadingPercentElm = document.querySelector('#loadingPercent');
  const starterElm = document.querySelector('#starter');
  const loaderElm = document.querySelector('#loader');

  starterElm.style.display = 'none';

  const loader = new GLTFLoader().setPath(MODELS_PATH);
  loader.setMeshoptDecoder(MeshoptDecoder);
  loader.load(MODEL, (gltf) => {
    // eslint-disable-next-line no-param-reassign
    gltf.scene.position.y = -80;
    gltf.scene.traverse((node) => {
      if (node.isMesh) {
        // eslint-disable-next-line no-param-reassign
        node.castShadow = true;
        // eslint-disable-next-line no-param-reassign
        node.receiveShadow = true;
      }
    });

    starterElm.style.display = '';
    loaderElm.style.display = 'none';

    scene.add(gltf.scene);
  }, (xhr) => {
    const percentage = xhr.loaded / xhr.total;
    loadingPercentElm.style.transform = `scaleX(${percentage})`;
  });

  Mousetrap.bind('g', () => { glitchPass.enabled = true; }, 'keydown');
  Mousetrap.bind('g', () => { glitchPass.enabled = false; }, 'keyup');

  return {
    scene,
    camera,
    render() {
      composer.render();
    },
    destroy() {
      Mousetrap.unbind('g');
    },
  };
}
