import { ElementRef, Injectable, NgZone } from '@angular/core';
import {
  Color,
  Material,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Texture,
  TextureLoader,
  Vector2,
  WebGLRenderer,
} from 'three';

@Injectable({ providedIn: 'root' })
export class BgDarkHeroService {
  private canvas: HTMLCanvasElement | undefined;
  private renderer!: WebGLRenderer | undefined;
  private scene: Scene = new Scene();
  private camera: PerspectiveCamera | undefined;
  private plane: Mesh | undefined;
  private planeWidth: number | undefined;
  private planeHeight: number | undefined;

  private frameId: number | null = null;

  public constructor(private ngZone: NgZone) {}

  public cleanUp(): void {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }

    if (this.plane) {
      if (this.plane.geometry) {
        this.plane.geometry.dispose();
      }
      if (this.plane.material) {
        (this.plane.material as Material).dispose();
      }
    }

    if (this.scene) {
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
    }

    if (this.renderer) {
      this.renderer.dispose();
    }

    this.canvas = undefined;
    this.camera = undefined;
    this.plane = undefined;
  }

  private onWindowResize(): void {
    if (!this.camera || !this.renderer || !this.canvas) return;

    const width = this.canvas.offsetWidth;
    const height = this.canvas.offsetHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);

    this.updatePlaneSize();

    if (this.plane) {
      const material = this.plane.material as ShaderMaterial;
      material.uniforms['uDisplacement'].value = this.getBlackHolePos();
    }
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

    // Charger la texture
    const textureLoader = new TextureLoader();
    textureLoader.load(
      'assets/space/black-hole/texture-effect-black-hole.webp',
      (texture) => {
        texture.flipY = false;
        this.createPlane(texture);
      },
      undefined, // optional: onProgress
      (err) => console.error('Texture loading failed:', err),
    );
  }

  private getBlackHolePos(): Vector2 {
    const containerElement = document.getElementById('hero-container');
    const imageElement = document.getElementById('black-hole');

    if (
      !this.canvas ||
      !this.camera ||
      !this.planeWidth ||
      !this.planeHeight ||
      !containerElement ||
      !imageElement
    )
      return new Vector2(0, 0);

    const containerRect = containerElement.getBoundingClientRect();
    const imageRect = imageElement.getBoundingClientRect();

    const canvasWidth = this.canvas.offsetWidth;
    const canvasHeight = this.canvas.offsetHeight;

    const canvasAspect = canvasWidth / canvasHeight;
    const textureAspect = this.planeWidth / this.planeHeight;

    let relativeX = imageRect.left - containerRect.left + imageRect.width / 2;
    let relativeY =
      window.innerHeight -
      imageRect.top -
      (window.innerHeight - containerRect.bottom) -
      imageRect.height / 2;

    if (canvasAspect <= textureAspect) {
      const widthDiff = canvasHeight * textureAspect - canvasWidth;
      const offsetFactor = (relativeX - canvasWidth / 2) / (2 * canvasWidth);
      relativeX -= widthDiff * offsetFactor;
    }

    return new Vector2(relativeX / canvasWidth, relativeY / canvasHeight);
  }

  private createPlane(texture: Texture) {
    this.updatePlaneSize(texture);

    const geometry = new PlaneGeometry(this.planeWidth, this.planeHeight);
    const material = new ShaderMaterial({
      uniforms: {
        u_time: { value: 0 },
        uDisplacement: { value: this.getBlackHolePos() },
        uTexture: { value: texture },
      },
      vertexShader: this.vertexShader(),
      fragmentShader: this.fragmentShader(),
    });

    this.plane = new Mesh(geometry, material);
    this.plane.position.set(0, 0, 0);
    this.scene.add(this.plane);
  }

  private updatePlaneSize(texture: Texture | undefined = undefined): void {
    if (!this.camera || !this.canvas) return;

    if (this.plane) {
      if (!texture) {
        texture = (this.plane.material as ShaderMaterial).uniforms['uTexture']
          .value;
      }

      (this.plane.material as ShaderMaterial).uniforms['uDisplacement'].value =
        new Vector2(0, 0);
    }

    if (!texture) return;

    const textureWidth = texture.image.width;
    const textureHeight = texture.image.height;

    const canvasWidth = this.canvas.offsetWidth;
    const canvasHeight = this.canvas.offsetHeight;

    const textureAspect = textureWidth / textureHeight;
    const canvasAspect = canvasWidth / canvasHeight;
    const cameraZ = this.camera.position.z;

    if (canvasAspect > textureAspect) {
      this.planeWidth =
        2 *
        Math.tan(((this.camera.fov / 2) * Math.PI) / 180) *
        cameraZ *
        canvasAspect;
      this.planeHeight = this.planeWidth / textureAspect;
    } else {
      this.planeHeight =
        2 * Math.tan(((this.camera.fov / 2) * Math.PI) / 180) * cameraZ;
      this.planeWidth = this.planeHeight * textureAspect;
    }

    if (this.plane) {
      this.plane.geometry.dispose();
      this.plane.geometry = new PlaneGeometry(
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
      const material = this.plane.material as ShaderMaterial;
      material.uniforms['u_time'].value = time;
    }

    this.renderer.render(this.scene, this.camera);
  }

  private vertexShader(): string {
    return `
    varying vec2 vUv;
    uniform vec2 uDisplacement;
    uniform sampler2D uTexture;
    uniform float u_time;
    uniform vec2 uResolution;

    void main() {
        vUv = uv;
        vec4 texColor = texture(uTexture, vUv);
        float u_time = u_time;
        vec2 uResolution = uResolution;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `;
  }

  private fragmentShader(): string {
    return `
      uniform sampler2D uTexture;
      uniform float u_time;
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
          return texture(uTexture,uv).b * noise(uv + vec2(0.0, u_time * 0.2));
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

          vec2 transformedUv = abs(sin(vec2(cos(angle + dist), dist + (u_time * 0.2))*5.0));

          transformedUv = transformedUv * 0.5 + 0.5;

          float h = height(transformedUv);
          vec3 norm = normal(transformedUv);

          float distanceToTransformed = length(uv - transformedUv);

          float smoothFactor = smoothstep(0.25, 1.6, 1.0-dist); // Adjust values for a smoother gradient

          gl_FragColor = mix(vec4(0.0, 0.0, 0.0, 1.0),
                        mix(texture(uTexture, transformedUv),
                             texture(uTexture, norm.xz * 0.5 + 0.5), 0.3),
                        smoothFactor);
      }
  `;
  }
}
