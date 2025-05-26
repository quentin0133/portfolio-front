import { ElementRef, Injectable, NgZone } from '@angular/core';
import * as THREE from 'three';

@Injectable({ providedIn: 'root' })
export class BgDarkContactService {
  private canvas!: HTMLCanvasElement;
  private renderer!: THREE.WebGLRenderer;
  private scene: THREE.Scene = new THREE.Scene();
  private camera!: THREE.PerspectiveCamera;
  private plane!: THREE.Mesh;

  private frameId: number | null = null;

  public constructor(private ngZone: NgZone) {}

  public cleanUp(): void {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }

    if (this.renderer?.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }

    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
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

  async initThreeJS(canvas: ElementRef<HTMLCanvasElement>): Promise<void> {
    this.canvas = canvas.nativeElement;

    // Initialisation scène, caméra et rendu
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    this.camera = new THREE.PerspectiveCamera(
      75,
      this.canvas.offsetWidth / this.canvas.offsetHeight,
      0.1,
      1000,
    );
    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(this.canvas.offsetWidth, this.canvas.offsetHeight);
    this.canvas.appendChild(this.renderer.domElement);

    const geometry = new THREE.PlaneGeometry(16, 16);
    let rand = Math.random() * 1000;
    const material = new THREE.ShaderMaterial({
      vertexShader: this.vertexShader(),
      fragmentShader: this.fragmentShader(),
      uniforms: {
        u_time: { value: 0.0 },
        u_seed: { value: rand }
      }
    });

    this.plane = new THREE.Mesh(geometry, material);
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

    const material = this.plane.material as THREE.ShaderMaterial;
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

      // Fonction bruit améliorée
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

      // Fonction de bruit fluide
      float fbm(vec2 p) {
          float value = 0.0;
          float amplitude = 0.55;
          float frequency = 1.0;

          for (int i = 0; i < 5; i++) {
              value += amplitude * noise(p * frequency);
              frequency *= 2.0;
              amplitude *= 0.5;
          }
          return value;
      }

      // Génération d'un champ de flux pour donner du mouvement
      vec2 flow(vec2 p) {
          float angle = fbm(p * 1.5 + u_time * 0.2) * 6.28;
          return vec2(cos(angle), sin(angle));
      }

      void main() {
          vec2 uv = vUv * mix(10.0, 20.0, u_seed / 1000.0);

          // Appliquer le champ de flux pour un mouvement naturel
          uv += flow(uv) * 0.1;
          uv.x += sin(u_time * 0.1) * 0.2;
          uv.y += cos(u_time * 0.15) * 0.1;

          float nebula = fbm(vec2(uv.x + u_time * 0.05, uv.y));

          // Définition des seuils d'alpha (thresholds)
          float alpha = nebula;

          // Définition des couleurs pour chaque palier
          vec3 black = vec3(0.03, 0.03, 0.03);
          vec3 dark_purple = vec3(0.1, 0.05, 0.19);
          vec3 magenta = vec3(0.32, 0.16, 0.52);
          vec3 blue = vec3(0.08, 0.08, 0.27);
          vec3 light_magenta = vec3(0.6, 0.18, 0.52);
          vec3 pink = vec3(0.9, 0.2, 0.6);
          vec3 light_pink = vec3(1.0, 0.2, 0.9);
          vec3 white = vec3(1.0, 1.0, 1.0);

          // Interpolation fluide entre les couleurs
          vec3 color;
          vec3 color1;
          vec3 color2;
          float min = -1.0;
          float max;

          if (alpha <= 0.15) {
              alpha -= 0.5;
              color = black;
          }
          else if (alpha <= 0.4) {
              min = 0.15;
              max = 0.4;
              color1 = black;
              color2 = dark_purple;
          }
          else if (alpha <= 0.45) {
              min = 0.4;
              max = 0.45;
              color1 = dark_purple;
              color2 = blue;
          }
          else if (alpha <= 0.65) {
              min = 0.45;
              max = 0.65;
              color1 = blue;
              color2 = magenta;
          }
          else if (alpha <= 0.8) {
              min = 0.65;
              max = 0.8;
              color1 = magenta;
              color2 = light_magenta;
          }
          else if (alpha <= 0.9) {
              min = 0.8;
              max = 0.9;
              color1 = light_magenta;
              color2 = light_pink;
          }
          else if (alpha <= 0.95) {
              min = 0.9;
              max = 0.95;
              color1 = light_pink;
              color2 = white;
          }
          else {
              color = white;
          }

          if (min != -1.0) {
              float t = smoothstep(min, max, alpha);
              color = mix(color1, color2, t);
          }

          gl_FragColor = vec4(color, alpha + 0.5);
      }
    `;
  }
}
