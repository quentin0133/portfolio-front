import { ElementRef, Injectable, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import { fromEvent, Subject, takeUntil } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BgDarkModeHeroService implements OnDestroy {
  private canvas: HTMLCanvasElement | undefined;
  private renderer: THREE.WebGLRenderer | undefined;
  private scene: THREE.Scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera | undefined;
  private plane: THREE.Mesh | undefined;
  private planeWidth: number | undefined;
  private planeHeight: number | undefined;

  private resizeEvent = new Subject<void>();

  ngOnDestroy(): void {
    this.resizeEvent.next();
    this.resizeEvent.complete();

    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  private onWindowResize(): void {
    if (!this.camera || !this.renderer || !this.canvas) return;

    // Met à jour les dimensions du canvas
    const width = this.canvas.offsetWidth;
    const height = this.canvas.offsetHeight;

    // Ajuste la caméra
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    // Ajuste le renderer
    this.renderer.setSize(width, height);

    // Mets à jour la taille du plane
    this.updatePlaneSize();
  }

  initThreeJS(canvas: ElementRef<HTMLCanvasElement>): void {
    this.canvas = canvas.nativeElement;

    // Initialisation scène, caméra et rendu
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);

    fromEvent(window, 'resize')
      .pipe(takeUntil(this.resizeEvent)) // Nettoyage à la destruction
      .subscribe(() => this.onWindowResize());

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

    // Charger la texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('assets/space/bg-darkmode.png', (texture) =>
      this.createPlane(texture),
    );

    // Lancer l'animation
    this.animate();
  }

  private animate(): void {
    if (!this.renderer || !this.camera) return;

    const time = performance.now() * 0.001;

    if (this.plane) {
      const material = this.plane.material as THREE.ShaderMaterial;
      material.uniforms['uTime'].value = time;
    }

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.animate());
  }

  private createPlane(texture: THREE.Texture) {
    this.updatePlaneSize(texture);

    const geometry = new THREE.PlaneGeometry(this.planeWidth, this.planeHeight);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uTexture: { value: texture },
      },
      vertexShader: this.vertexShader(),
      fragmentShader: this.fragmentShader(),
    });

    this.plane = new THREE.Mesh(geometry, material);
    this.plane.position.set(0, 0, 0);
    this.scene.add(this.plane);
  }

  private updatePlaneSize(texture: any = undefined): void {
    if (!this.camera || !this.canvas) return;

    if (this.plane && !texture) {
      texture = (this.plane.material as THREE.ShaderMaterial).uniforms[
        'uTexture'
      ].value;
    }

    const textureWidth = texture.image.width;
    const textureHeight = texture.image.height;

    const width = this.canvas.offsetWidth;
    const height = this.canvas.offsetHeight;

    const textureAspect = textureWidth / textureHeight;
    const windowAspect = width / height;
    const cameraZ = this.camera.position.z;

    if (windowAspect > textureAspect) {
      this.planeWidth =
        2 *
        Math.tan(((this.camera.fov / 2) * Math.PI) / 180) *
        cameraZ *
        windowAspect;
      this.planeHeight = this.planeWidth / textureAspect;
    } else {
      this.planeHeight =
        2 * Math.tan(((this.camera.fov / 2) * Math.PI) / 180) * cameraZ;
      this.planeWidth = this.planeHeight * textureAspect;
    }

    if (this.plane) {
      this.plane.geometry.dispose();
      this.plane.geometry = new THREE.PlaneGeometry(
        this.planeWidth,
        this.planeHeight,
      );
    }
  }

  private vertexShader(): string {
    return `
    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform float uTime;
    uniform vec2 uResolution;

    void main() {
        vUv = uv;
        vec4 texColor = texture(uTexture, vUv);
        float uTime = uTime;
        vec2 uResolution = uResolution;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;
  }

  private fragmentShader(): string {
    return `
      uniform sampler2D uTexture;
      uniform float uTime;
      uniform vec2 uResolution;
      varying vec2 vUv;

      vec2 hash(vec2 p) {
          p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
          return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
      }

      float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);

          return mix(
              mix(dot(hash(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
                  dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
              mix(dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
                  dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
              u.y);
      }

      float height(in vec2 uv) {
          return texture(uTexture,uv).b * noise(uv + vec2(0.0, uTime * 0.2));
      }

      const vec2 NE = vec2(0.05,0.0);
      vec3 normal(in vec2 uv) {
          return normalize(vec3(height(uv+NE.xy)-height(uv-NE.xy), 0.0, height(uv+NE.yx) - height(uv-NE.yx)));
      }

      void main() {
          vec2 uv = vUv;

          vec2 centeredUv = vUv - vec2(0.72, 0.49);

          float dist = length(centeredUv);
          float angle = atan(centeredUv.y, centeredUv.x) + dist * 3.0;

          vec2 transformedUv = abs(sin(vec2(cos(angle + dist), dist + (uTime * 0.2))*5.0));

          transformedUv = transformedUv * 0.5 + 0.5;

          float h = height(transformedUv);
          vec3 norm = normal(transformedUv);

          // Calculer la distance entre l'UV transformé et la position de départ (vUv)
          float distanceToTransformed = length(uv - transformedUv);

          // Créer un dégradé doux avec smoothstep ou exponentielle
          float smoothFactor = smoothstep(0.25, 1.6, 1.0-dist); // Ajuster les valeurs pour un dégradé doux

          gl_FragColor = mix(vec4(0.0, 0.0, 0.0, 1.0),
                        mix(texture(uTexture, transformedUv),
                             texture(uTexture, norm.xz * 0.5 + 0.5), 0.3),
                        smoothFactor);
      }
  `;
  }
}
