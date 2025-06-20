import { ElementRef, Injectable, NgZone } from '@angular/core';
import {
  AnimationMixer,
  Clock,
  Mesh,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  TextureLoader,
  Vector2,
  WebGLRenderer,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';

@Injectable({ providedIn: 'root' })
export class BgLightContactService {
  private canvas!: HTMLCanvasElement;
  private renderer!: WebGLRenderer;
  private composer!: EffectComposer;
  private scene: Scene = new Scene();
  private camera!: PerspectiveCamera;
  private mixer!: AnimationMixer;
  private readonly clock = new Clock();
  private pmremGenerator!: PMREMGenerator;

  bokehPass?: BokehPass;

  private frameId: number | null = null;

  public constructor(private readonly ngZone: NgZone) {}

  public cleanUp(): void {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }

    this.scene.traverse((object) => {
      let mesh = object as Mesh;
      if (mesh.isMesh) {
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((material) => material.dispose());
          } else {
            mesh.material.dispose();
          }
        }
      }
    });

    this.scene.clear();

    if (this.composer) {
      this.composer.dispose();
    }

    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.domElement.width = 1;
      this.renderer.domElement.height = 1;
    }
  }

  private onWindowResize(): void {
    const width = this.canvas.offsetWidth;
    const height = this.canvas.offsetHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
  }

  async initThreeJS(canvas: ElementRef<HTMLCanvasElement>): Promise<void> {
    this.canvas = canvas.nativeElement;

    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      depth: true,
    });

    this.renderer.autoClear = false;
    this.renderer.setClearColor(0x000000);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.canvas.offsetWidth, this.canvas.offsetHeight);

    this.composer = new EffectComposer(this.renderer);
    this.composer.setSize(this.canvas.offsetWidth, this.canvas.offsetHeight);

    this.pmremGenerator = new PMREMGenerator(this.renderer);
    this.pmremGenerator.compileEquirectangularShader();

    this.scene = new Scene();

    new TextureLoader()
      .loadAsync('assets/time/hourglass/autumn-field-background.webp')
      .then((text) => (this.scene.background = text));

    new EXRLoader()
      .loadAsync('assets/time/hourglass/table_mountain_2_puresky_1k.exr')
      .then((hdrTexture) => {
        this.scene.environment =
          this.pmremGenerator.fromEquirectangular(hdrTexture).texture;

        hdrTexture.dispose();
      });

    const gltf = await new GLTFLoader().loadAsync(
      'assets/time/hourglass/model_hourglass_3D.glb',
    );

    const sceneGltf = gltf.scene;
    this.scene.rotation.set(1.626, 0, 1.25);
    this.scene.add(sceneGltf);

    const camera = gltf.cameras?.[0];

    if (camera) {
      sceneGltf.remove(this.camera);
      this.camera = camera as PerspectiveCamera;
      this.camera.aspect = this.canvas.offsetWidth / this.canvas.offsetHeight;
      this.camera.updateProjectionMatrix();
      sceneGltf.add(this.camera);
    } else {
      console.error('No camera found in glTF export');
    }

    const renderPass = new RenderPass(this.scene, this.camera);

    this.bokehPass = new BokehPass(this.scene, this.camera, {
      focus: 6.5,
      aperture: 0.008,
      maxblur: 0.02,
      aspect: this.canvas.offsetWidth / this.canvas.offsetHeight,
    });

    const bloomPass = new UnrealBloomPass(
      new Vector2(this.canvas.offsetWidth, this.canvas.offsetHeight),
      0.3, // strength
      1,
      0.85,
    );

    this.composer.addPass(renderPass);
    this.composer.addPass(this.bokehPass);
    this.composer.addPass(bloomPass);

    // Animation
    this.mixer = new AnimationMixer(sceneGltf);
    gltf.animations.forEach((clip) => {
      this.mixer.clipAction(clip).play();
    });
  }

  public animate(): void {
    // We have to run this outside angular zones,
    // because it could trigger heavy changeDetection cycles.
    this.ngZone.runOutsideAngular(() => {
      if (document.readyState !== 'loading') {
        this.render();
      } else {
        window.addEventListener('DOMContentLoaded', () => {
          this.render();
        });
      }

      window.addEventListener('resize', () => {
        this.onWindowResize();
      });
    });
  }

  public render(): void {
    this.frameId = requestAnimationFrame(() => {
      this.render();
    });

    const delta = this.clock.getDelta();
    if (this.mixer) this.mixer.update(delta);

    // if (this.bokehPass) {
    //   console.log(this.bokehPass.materialBokeh.uniforms['focus'].value);
    //   this.bokehPass.materialBokeh.uniforms['focus'].value = Math.abs(Math.sin(this.clock.elapsedTime)) * 10;
    // }

    this.composer.render();
  }
}
