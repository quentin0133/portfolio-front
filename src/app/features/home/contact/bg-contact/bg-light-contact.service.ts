import { ElementRef, Injectable, NgZone } from '@angular/core';
import * as THREE from 'three';
import {
  AnimationMixer,
  PerspectiveCamera,
  PMREMGenerator,
  TextureLoader,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer.js";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass.js";
import {UnrealBloomPass} from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

@Injectable({ providedIn: 'root' })
export class BgLightContactService {
  private canvas!: HTMLCanvasElement;
  private readonly renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
  private composer!: EffectComposer;
  private scene: THREE.Scene = new THREE.Scene();
  private camera!: THREE.PerspectiveCamera;
  private mixer!: AnimationMixer;
  private readonly clock = new THREE.Clock();
  private readonly pmremGenerator: PMREMGenerator;

  private frameId: number | null = null;

  public constructor(private readonly ngZone: NgZone) {
    this.pmremGenerator = new PMREMGenerator(this.renderer);
    this.pmremGenerator.compileEquirectangularShader();
  }

  public cleanUp(): void {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }

    if (this.renderer?.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }

    this.scene.clear();

    if (this.composer) {
      this.composer.dispose();
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

    this.scene = new THREE.Scene();
    new TextureLoader()
      .loadAsync('assets/time/hourglass/autumn-field-background.png')
      .then((text) => (this.scene.background = text));

    this.composer = new EffectComposer(this.renderer);
    this.renderer.setSize(this.canvas.offsetWidth, this.canvas.offsetHeight);
    this.composer.setSize(this.canvas.offsetWidth, this.canvas.offsetHeight);
    this.canvas.appendChild(this.renderer.domElement);

    new EXRLoader()
      .loadAsync('assets/time/hourglass/table_mountain_2_puresky_1k.exr')
      .then((hdrTexture) => {
        this.scene.environment =
          this.pmremGenerator.fromEquirectangular(hdrTexture).texture;

        hdrTexture.dispose();
      });

    new GLTFLoader()
      .loadAsync('assets/time/hourglass/model_hourglass_3D.glb')
      .then((gltf) => {
        const scene = gltf.scene;
        this.scene.rotation.set(1.626, 0, 1.25);
        this.scene.add(scene);

        const camera = gltf.cameras?.[0];

        if (camera) {
          scene.remove(this.camera);
          this.camera = camera as PerspectiveCamera;
          //this.camera.setFocalLength(this.focalLengthToFov(50, 36));
          scene.add(this.camera);

          this.composer.addPass(new RenderPass(this.scene, this.camera));

          const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(
              this.canvas.offsetWidth,
              this.canvas.offsetHeight,
            ),
            0.35, // strength
            1, // radius
            0.85, // threshold
          );
          this.composer.addPass(bloomPass);
        } else {
          console.error('Pas de caméra trouvée dans l’export glTF');
        }

        // Animation
        this.mixer = new THREE.AnimationMixer(scene);
        gltf.animations.forEach((clip) => {
          this.mixer.clipAction(clip).play();
        });
      });
  }

  private focalLengthToFov(focalLength: number, sensorSize: number) {
    return 2 * Math.atan(sensorSize / (2 * focalLength)) * (180 / Math.PI);
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

    this.composer.render();
  }
}
