import { ElementRef, Injectable, NgZone } from '@angular/core';
import {
  Color,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from 'three';

@Injectable({ providedIn: 'root' })
export class BgDarkAboutMeService {
  private canvas!: HTMLCanvasElement;
  private renderer!: WebGLRenderer;
  private scene: Scene = new Scene();
  private camera!: PerspectiveCamera;
  private plane!: Mesh;

  private frameId: number | null = null;

  public constructor(private ngZone: NgZone) {}

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

    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  private onWindowResize(): void {
    const width = this.canvas.offsetWidth;
    const height = this.canvas.offsetHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  initThreeJS(canvas: ElementRef<HTMLCanvasElement>): void {
    this.canvas = canvas.nativeElement;

    this.scene = new Scene();
    this.scene.background = new Color(0x000000);

    this.camera = new PerspectiveCamera(
      75,
      this.canvas.offsetWidth / this.canvas.offsetHeight,
      0.1,
      1000,
    );
    this.camera.position.z = 5;

    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
    });
    this.renderer.setSize(this.canvas.offsetWidth, this.canvas.offsetHeight);

    const geometry = new PlaneGeometry(16, 16);
    let rand = Math.random() * 1000;
    const material = new ShaderMaterial({
      vertexShader: this.vertexShader(),
      fragmentShader: this.fragmentShader(),
      uniforms: {
        u_time: { value: 0.0 },
        u_seed: { value: rand },
      },
    });

    this.plane = new Mesh(geometry, material);
    this.scene.add(this.plane);
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

    const material = this.plane.material as ShaderMaterial;
    material.uniforms['u_time'].value = performance.now() * 0.001;

    this.renderer.render(this.scene, this.camera);
  }

  private vertexShader(): string {
    return `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
  }

  private fragmentShader(): string {
    return `
      precision mediump float;
      varying vec2 vUv;
      uniform float u_time;
      uniform float u_seed;

      // Enhanced noise function
      float hash(vec2 p) {
          return fract(sin(dot(p + u_seed, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);

          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));

          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }

      // Fluid noise function
      float fbm(vec2 p) {
          float value = 0.0;
          float amplitude = 0.9;
          float frequency = 0.4;

          for (int i = 0; i < 8; i++) {
              value += amplitude * noise(p * frequency);
              frequency *= 2.0;
              amplitude *= 0.5;
          }
          return value;
      }

      // Generating a flow field to give movement
      vec2 flow(vec2 p) {
          float angle = fbm(p * 1.5 + u_time * 0.2) * 6.28;
          return vec2(cos(angle), sin(angle));
      }

      void main() {
          vec2 uv = vUv * mix(10.0, 20.0, u_seed / 1000.0);

          // Apply the flow field for natural movement
          uv += flow(uv) * 0.3;
          uv.x += sin(u_time * 0.2) * 0.8;
          uv.y += cos(u_time * 0.05) * 0.1;

          float blackCloud = fbm(vec2(uv.x + u_time * 0.05, uv.y));

          // threshHolds
          float alpha = blackCloud;

          vec3 color = vec3(0.03, 0.03, 0.03);

          gl_FragColor = vec4(color, alpha - 0.25);
      }
    `;
  }
}
