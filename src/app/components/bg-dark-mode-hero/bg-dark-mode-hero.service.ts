import { ElementRef, Injectable, NgZone } from '@angular/core';
import * as THREE from 'three';

@Injectable({ providedIn: 'root' })
export class BgDarkModeHeroService {
  private canvas: HTMLCanvasElement | undefined;
  private renderer: THREE.WebGLRenderer | undefined;
  private scene: THREE.Scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera | undefined;
  private plane: THREE.Mesh | undefined;
  private planeWidth: number | undefined;
  private planeHeight: number | undefined;

  private frameId: number | null = null;

  public constructor(private ngZone: NgZone) {}

  public cleanUp(): void {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }

    if (this.renderer?.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }

    if (this.plane) {
      if (this.plane.geometry) {
        this.plane.geometry.dispose();
      }
      if (this.plane.material) {
        (this.plane.material as THREE.Material).dispose();
      }
    }

    if (this.scene) {
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
    }

    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = undefined;
    }

    this.canvas = undefined;
    this.camera = undefined;
    this.plane = undefined;
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

    if (this.plane) {
      const material = this.plane.material as THREE.ShaderMaterial;
      material.uniforms['uDisplacement'].value = this.getBlackHolePos();
    }
  }

  initThreeJS(canvas: ElementRef<HTMLCanvasElement>): void {
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

    // Charger la texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      'assets/space/bg-darkmode.png',
      (texture) => this.createPlane(texture),
      undefined, // optional: onProgress
      (err) => console.error('Texture loading failed:', err),
    );
  }

  private getBlackHolePos(): THREE.Vector2 {
    const containerElement = document.getElementById('hero-container');
    const imageElement = document.getElementById('black-hole');

    if (!this.canvas || !containerElement || !imageElement)
      return new THREE.Vector2(0, 0);

    const containerRect = containerElement.getBoundingClientRect();
    const imageRect = imageElement.getBoundingClientRect();

    // Récupérer les tailles du canvas
    const canvasWidth = this.canvas.offsetWidth;
    const canvasHeight = this.canvas.offsetHeight;

    // Calculer la position de l'image par rapport au conteneur
    const relativeX = imageRect.left - containerRect.left + imageRect.width / 2; // Centrer l'image
    const relativeY = imageRect.top - containerRect.top + imageRect.height / 2; // Centrer l'image

    // Normaliser les coordonnées en fonction de la taille du canvas
    return new THREE.Vector2(
      relativeX / canvasWidth, // Normaliser X de 0 à 1
      relativeY / canvasHeight, // Normaliser Y de 0 à 1
    );
  }

  private createPlane(texture: THREE.Texture) {
    this.updatePlaneSize(texture);

    const geometry = new THREE.PlaneGeometry(this.planeWidth, this.planeHeight);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uDisplacement: { value: this.getBlackHolePos() },
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

    if (this.plane) {
      if (!texture) {
        texture = (this.plane.material as THREE.ShaderMaterial).uniforms[
          'uTexture'
        ].value;
      }

      (this.plane.material as THREE.ShaderMaterial).uniforms[
        'uDisplacement'
      ].value = new THREE.Vector2(0, 0);
    }

    if (!texture) return;

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
    if (!this.renderer || !this.camera) return;

    this.frameId = requestAnimationFrame(() => {
      this.render();
    });

    if (this.plane) {
      const time = performance.now() * 0.001;
      const material = this.plane.material as THREE.ShaderMaterial;
      material.uniforms['uTime'].value = time;
    }

    this.renderer.render(this.scene, this.camera);
  }

  private vertexShader(): string {
    return `
    varying vec2 vUv;
    uniform vec2 uDisplacement;
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
      uniform vec2 uDisplacement;
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

          vec2 centeredUv = vUv - uDisplacement;

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
