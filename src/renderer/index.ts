import * as THREE from "three";
import {
  WebGLRenderer,
  PerspectiveCamera,
  Scene,
  Vector2,
  Vector3,
} from "three";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader";
import { Timer } from "three/examples/jsm/misc/Timer";
import Stats from "three/examples/jsm/libs/stats.module";
import GltfWorker from "./gltf.worker?worker";
import { ViewportPathtracer } from "./Pathtracer";
import { CachingGLTFLoader } from "./gltf-instance/CachingGLTFLoader";
import { ModelViewerGLTFInstance } from "./gltf-instance/ModelViewerGLTFInstance";
import { WorkerPool } from "three/examples/jsm/utils/WorkerPool";
import * as tCore from "@gltf-transform/core";
import * as tFunctions from "@gltf-transform/functions";
import * as tExtensions from "@gltf-transform/extensions";
import * as meshoptimizer from "meshoptimizer";
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment'
// import * as sharp from 'sharp'
declare const DracoDecoderModule: any;
declare const DracoEncoderModule: any;
function backfaceCulling(options:any) {
    return (document:any) => {
        for (const material of document.getRoot().listMaterials()) {
            material.setDoubleSided(!options.cull);
        }
    };
}
class WebJSONIO extends tCore.PlatformIO {
  constructor(
    public onReadJSONData?: (
      uri: string,
      type: "view" | "text"
    ) => Promise<Uint8Array | string>
  ) {
    super();
      
  }
  async readURI(uri: string, type: "view"): Promise<Uint8Array>;
  async readURI(uri: string, type: "text"): Promise<string>;
  async readURI(
    uri: string,
    type: "view" | "text"
  ): Promise<Uint8Array | string> {
    return this.onReadJSONData!(uri, type);
  }
  resolve(base: string, path: string): string {
    return tCore.HTTPUtils.resolve(base, path);
  }
  dirname(uri: string): string {
    return tCore.HTTPUtils.dirname(uri);
  }
}
type Options = {
  container?: HTMLDivElement;
  rendererParameters?: THREE.WebGLRendererParameters;
  dpr?: number;
  gltf?: {
    enabledTransform?: boolean;
    enableDraco?: boolean;
    enableKtx?: boolean;
    useGltfloaded2?: boolean;
    useWorker?: boolean;
    dracoendcordPath?: string; // DRACOLoader
    ktxTranscoderPath?: string; //  KTX2Loader
    path?: string;
    resourcePath?: string;
  };
};
type MouseEventTypeMap = {
  objectDrag: { object: THREE.Intersection };
  objectDragend: { object: THREE.Intersection };
  dragstart: {};
  drag: {};
  dragend: {};
  objectLeave: {
    object: THREE.Intersection;
    intersections: THREE.Intersection[];
  };
  objectEnter: {
    object: THREE.Intersection;
    intersections: THREE.Intersection[];
  };
  pointerdown: {};
  pointermove: {};
  pointerup: {};
  select: { object: THREE.Intersection; intersections: THREE.Intersection[] };
};
type CamelToSnakeCase<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Capitalize<T> ? "-" : ""}${Lowercase<T>}${CamelToSnakeCase<U>}`
  : S;

type KeysToSnakeCase<T extends { [K: string]: any }> = {
  [Key in keyof T as CamelToSnakeCase<string & Key>]: T[Key];
};
type MouseEventTypeMapCamel = KeysToSnakeCase<MouseEventTypeMap>;

export class MouseHandler extends THREE.EventDispatcher<MouseEventTypeMapCamel> {
  coord = new Vector2();
  pointDown = new Vector2();
  point = new Vector2();
  pointUp = new Vector2();
  pointDelta = new Vector2();
  pointOffset = new Vector2();
  pointLast = new Vector2();
  doc: Document;
  _rect?: DOMRect;
  type: string = "";
  event?: MouseEvent;
  raycaster!: THREE.Raycaster;
  intersections: THREE.Intersection[] = [];
  moving: boolean = false;
  objects: THREE.Object3D[] = [];
  recursive: boolean = false;
  enableRaycaster: boolean = true;
  selected: THREE.Intersection | null = null;
  hoverObject: THREE.Intersection | null = null;
  mouseState: number = 0;
  constructor(private dom: HTMLElement, private stage: Stage) {
    super();
    this.doc = this.dom.ownerDocument;
    this.raycaster = new THREE.Raycaster();
    this.attachEvent();
  }
  get clientRect() {
    this._rect ??= this.dom.getBoundingClientRect();
    return this._rect;
  }

  setObjects(objects: THREE.Object3D[], recursive: boolean = false) {
    this.objects = objects;
    this.recursive = recursive;
  }
  rayObjects(
    objects: THREE.Object3D[],
    recursive: boolean = false,
    intersections = this.intersections
  ) {
    intersections.length = 0;
    this.raycaster.setFromCamera(this.coord, this.stage.camera);
    this.raycaster.intersectObjects(objects, recursive, this.intersections);
    return intersections;
  }
  rayObject(
    object: THREE.Object3D,
    recursive: boolean = false,
    intersections = this.intersections
  ) {
    intersections.length = 0;
    this.raycaster.setFromCamera(this.coord, this.stage.camera);
    this.raycaster.intersectObject(object, recursive, this.intersections);
    return intersections;
  }
  getMouse(e: MouseEvent, out: Vector2) {
    return out.set(
      e.clientX - this.clientRect.left,
      e.clientY - this.clientRect.top
    );
  }
  getClipCoord(point: Vector2, out: Vector2) {
    return out.set(
      (point.x / this.clientRect.width) * 2 - 1,
      (-point.y / this.clientRect.height) * 2 + 1
    );
  }
  handleMove = () => {
    this.moving = false;
    this.getMouse(this.event!, this.point);
    this.getClipCoord(this.point, this.coord);
    this.pointDelta.subVectors(this.point, this.pointLast);
    this.pointOffset.subVectors(this.point, this.pointDown);
    this.pointLast.copy(this.point);
    this.dispatchEvent({ type: "pointermove" });

    if (this.mouseState !== 0) {
      if (this.mouseState === 1) {
        this.mouseState = 2;
        this.dispatchEvent({ type: "dragstart" });
      } else {
        this.dispatchEvent({ type: "drag" });
      }
    }
    if (this.selected) {
      this.dispatchEvent({ type: "object-drag", object: this.selected });
    }
    if (this.enableRaycaster && !this.selected && this.objects.length > 0) {
      const intersections = this.rayObjects(this.objects, this.recursive);
      if (intersections.length > 0) {
        const current = intersections[0];
        if (current.object !== this.hoverObject?.object) {
          if (this.hoverObject?.object) {
            this.dispatchEvent({
              type: "object-leave",
              object: this.hoverObject,
              intersections: intersections.slice(),
            });
          }
          this.hoverObject = current;
          this.dispatchEvent({
            type: "object-enter",
            object: this.hoverObject,
            intersections: intersections.slice(),
          });
        }
      } else if (this.hoverObject) {
        this.dispatchEvent({
          type: "object-leave",
          object: this.hoverObject,
          intersections: [],
        });
        this.hoverObject = null;
      }
    }
  };
  handleEvent = (e: MouseEvent) => {
    const type = e.type;
    if (type === "contextmenu") {
      e.preventDefault();
      return;
    }
    this.type = type;
    this.event = e;

    if (type === "pointerdown") {
      this.mouseState = 1;
      this.getMouse(e, this.pointDown);
      this.getClipCoord(this.pointDown, this.coord);
      this.pointLast.copy(this.pointDown);
      this.dispatchEvent({ type: "pointerdown" });
      if (this.enableRaycaster && this.objects.length > 0) {
        const intersections = this.rayObjects(this.objects, this.recursive);
        if (this.hoverObject) {
          this.selected = this.hoverObject;
          this.dispatchEvent({
            type: "select",
            object: this.selected,
            intersections: intersections.slice(),
          });
        }
      }
    } else if (type === "pointermove") {
      if (this.moving) {
        return;
      }
      this.moving = true;
      requestAnimationFrame(this.handleMove);
    } else if (type === "pointerup") {
      this.getMouse(e, this.pointUp);
      this.dispatchEvent({ type: "pointerup" });
      if (this.mouseState !== 0) {
        this.mouseState = 0;
        this.dispatchEvent({ type: "dragend" });
      }
      if (this.selected) {
        this.dispatchEvent({ type: "object-dragend", object: this.selected });
        this.selected = null;
      }
    }
  };

  attachEvent() {
    this.dom.addEventListener("contextmenu", this, false);
    this.dom.addEventListener("pointerdown", this, false);
    this.doc.addEventListener("pointermove", this, false);
    this.doc.addEventListener("pointerup", this, false);
  }
  detachEvent() {
    this.dom.removeEventListener("contextmenu", this, false);
    this.dom.removeEventListener("pointerdown", this, false);
    this.doc.removeEventListener("pointermove", this, false);
  }
  dispose() {
    this.detachEvent();
  }
}

export abstract class CameraControl {
  abstract type: string;
  isActive: boolean = false;
  constructor(public stage: Stage) {}
  abstract initialize(): void;
  abstract enable(): void;
  abstract disabled(): void;
  abstract viewObject(obj: THREE.Object3D): void;
  update(): void {}
  dispose(): void {}
}
export class CameraTrackballControls extends CameraControl {
  type: string = "trackball";
  controls!: TrackballControls;
  constructor(stage: Stage) {
    super(stage);
    this.initialize();
  }
  initialize(): void {
    this.controls = new TrackballControls(
      this.stage.camera,
      this.stage.container
    );
    this.attachEvent();
  }
  attachEvent() {
    this.controls.addEventListener("change", this.handleChange);
  }
  detachEvent() {
    this.controls.removeEventListener("change", this.handleChange);
  }
  handleChange = () => {
    this.stage.update();
  };
  dispose() {
    this.detachEvent();
  }
  viewObject(obj: THREE.Object3D): void {
    const box3 = new THREE.Box3();
    box3.setFromObject(obj);
    const size = box3.getSize(new THREE.Vector3());
    const center = box3.getCenter(new THREE.Vector3());
    const stage = this.stage;
    this.controls.target = center;
    stage.camera.position.set(center.x, center.y, center.z + size.z + 100);
    stage.camera.lookAt(center);
    stage.camera.updateProjectionMatrix();
    stage.camera.updateMatrixWorld();
  }
  enable() {
    this.controls.enabled = true;
  }
  disabled() {
    this.controls.enabled = false;
  }
  update() {
    this.controls.update();
  }
}

type CameraControlManageMap<T extends CameraControl> = {
  [K in T["type"] as NoInfer<K>]: T;
};
export class CameraControlManage<ControlName extends string = "default"> {
  controlsMap: { [key in ControlName]: CameraControl } = {} as {
    [key in ControlName]: CameraControl;
  };
  controls: CameraControl[] = [];
  currentControlType: string = "";
  constructor(
    private stage: Stage,
    controls: (new (stage: Stage) => CameraControl)[] = []
  ) {
    this.stage.addEventListener("dispose", () => {
      this.dispose();
    });
    controls.forEach((control) => {
      this.registerControl(control);
    });
    this.stage.addEventListener("tick", () => {
      this.controls.forEach((control) => {
        control.update();
      });
    });
  }
  get control() {
    return this.controlsMap[this.currentControlType as ControlName];
  }
  enable() {
    this.controls.forEach((control) => {
      control.enable();
    });
  }
  disabled() {
    this.controls.forEach((control) => {
      control.disabled();
    });
  }
  registerControl(Control: new (stage: Stage) => CameraControl) {
    const control = new Control(this.stage);
    this.controlsMap[control.type as ControlName] = control;
    this.controls.push(control);
    this.currentControlType = control.type;
    return this;
  }
  dispose() {
    this.controls.forEach((control) => {
      control.dispose();
    });
  }
}

export class Stage extends THREE.EventDispatcher<{
  dispose: {};
  tick: { delta: number };
}> {
  container!: HTMLDivElement;
  renderer!: WebGLRenderer;
  camera!: PerspectiveCamera;
  scene!: Scene;
  timer!: Timer;
  stats?: Stats;
  delta: number = 0;
  renderNeedsUpdate: boolean = false;
  renderAutoUpdate: boolean = false;
  gltfLoader!: GLTFLoader;
  controls = new CameraControlManage<"trackball">(this);
  options: Options;
  pathTrack: any;
  workerPool!: WorkerPool;
  constructor(options: Options = {}) {
    super();
    this.options = { dpr: window.devicePixelRatio, ...options };
    this.container = options.container ?? document.createElement("div");
    this.container.style.cssText = `position:relative;width:100%;height:100%;`;
    this.workerPool = new WorkerPool(1);
    this.workerPool.setWorkerCreator(
      () => new GltfWorker({ name: "gltf-wroker" })
    );
  }
  get dpr() {
    return this.options.dpr;
  }
  get width() {
    return this.renderer.domElement.width;
  }
  get height() {
    return this.renderer.domElement.height;
  }

  initialize() {
    this.initTimer();
    this.initStats();
    this.initRenderer();
    this.initScene();
    this.initCamera();
    this.initLight();
    this.initControls();
    //初始化光线追踪
    this.initPathTrack();
    this.initLoader();
    this.initObserveResize();
  }
  initRenderer() {
    this.renderer = new WebGLRenderer({
      antialias: true,
      ...this.options.rendererParameters,
    });
    this.renderer.autoClear = false;
    this.renderer.shadowMap.enabled = false;
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.renderer.setClearColor(0xffffff);
    this.renderer.setPixelRatio(this.dpr!);
    this.container.appendChild(this.renderer.domElement);
  }
  initScene() {
    this.scene = new Scene();
    
//	const pmremGenerator = new THREE.PMREMGenerator( this.renderer );
   // pmremGenerator.compileEquirectangularShader();
   // this.scene.environment= pmremGenerator.fromScene( new RoomEnvironment(), 0.04 ).texture;
  }
  initCamera() {
    this.camera = new PerspectiveCamera(75, 1, 1, 10000);
  }
  initObserveResize() {
    const observe = new ResizeObserver(() => {
      this.handleResize();
    });
    observe.observe(this.container);
    this.handleResize();
  }
  initControls() {
    this.controls.registerControl(CameraTrackballControls);
  }
  initTimer() {
    this.timer = new Timer();
  }
  initStats() {
    this.stats = new Stats();
    document.body.appendChild(
      (this.stats as any)!.domElement as HTMLDivElement
    );
  }
  gltfLoader2!: CachingGLTFLoader;
  async initLoader() {
    this.gltfLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    const ktx2Loader = new KTX2Loader();
    const gltfOption = this.options.gltf;
    if (gltfOption?.enableDraco !== false) {
      this.gltfLoader.setDRACOLoader(dracoLoader);
    }
    if (gltfOption?.enableKtx !== false) {
      this.gltfLoader.setKTX2Loader(ktx2Loader);
    }
    if (gltfOption?.dracoendcordPath) {
      dracoLoader.setDecoderPath(gltfOption.dracoendcordPath);
    }
    if (gltfOption?.ktxTranscoderPath) {
      ktx2Loader.setTranscoderPath(gltfOption.ktxTranscoderPath);
    }
    if (gltfOption?.path) {
      this.gltfLoader.setPath(gltfOption.path);
    }
    if (gltfOption?.resourcePath) {
      this.gltfLoader.setResourcePath(gltfOption.resourcePath);
    }
    if (gltfOption?.enabledTransform === true) {
      const oldParse = this.gltfLoader.parse.bind(this.gltfLoader);
    
      let webio = new WebJSONIO();
      webio.registerExtensions([tExtensions.KHRDracoMeshCompression]);

      webio.registerDependencies({
        "draco3d.decoder": await DracoDecoderModule(),
        "draco3d.encoder": await DracoEncoderModule(),
      });
   
      this.gltfLoader.parse = async function (
        data: ArrayBuffer | string,
        path: string,
        onLoad: (gltf: GLTF) => void,
        onError?: (event: ErrorEvent) => void
      ) {
        // const rootPath=this.path,resourcePath=this.resourcePath
        let cacheData = {
          [path]: data,
        };
        webio.onReadJSONData=async (uri, type) => {
            const url=THREE.LoaderUtils.resolveURL(uri, path)
            if (!cacheData[url]) {
                return fetch(url).then(
                  (res) => {
                    if (type === "view") {
                      return res
                        .clone()
                        .arrayBuffer()
                        .then((buffer) => new Uint8Array(buffer));
                    } else {
                      return res.clone().text();
                    }
                  }
                );
              }
              return new Uint8Array(data as ArrayBuffer);
        }
        let document: tCore.Document;
        document = await webio.read(path);

        await meshoptimizer.MeshoptEncoder.ready;

        document.getRoot().listScenes().forEach(scene=>{
           // clearNodeParent(scene);
            scene.traverse(node=>{
                tFunctions.clearNodeParent(node);
            })
        })
        await document.transform(
              // 焊接
              tFunctions.weld({ tolerance: 0.0001, toleranceNormal: 0.5 }),
              // 减少网格
              /***
               * 基于网格优化器的简化算法，生成具有更少三角形和顶点的网格。简化是有损的，但该算法的目标是在给定参数的情况下尽可能保持视觉质量。
                该算法旨在达到目标“比率”，同时最小化误差。如果错误超过指定的“错误”阈值，算法将在达到目标比率之前退出。例子：
    
                ratio=0.0，error=0.0001：旨在最大程度地简化，误差限制为 0.01%。
                ratio=0.5，error=0.0001：目标是简化 50%，误差限制在 0.01%。
                ratio=0.5，error=1：目标是 50% 简化，不受误差约束。
                拓扑，特别是分裂顶点，也会限制简化器。为了获得最佳结果，请在简化之前应用焊接操作。
               */
              tFunctions.simplify({
                simplifier: meshoptimizer.MeshoptSimplifier,
                ratio: 0.0,
                error: 0.001,
              }),
              /**
               * 创建包含场景中标量材质属性的所有唯一值的调色板纹理 ，然后合并材质。对于具有许多纯色材质的场景（通常出现在 CAD、建筑或低多边形样式中），
               * 纹理调色板可以减少使用的材质数量，并显着增加适合连接操作的网格对象的数量。
                    已经包含纹理坐标 (UV) 的材质不符合纹理调色板优化的条件。目前，只有材质的基色、Alpha、发射因子、金属因子和粗糙度因子会转换为调色板纹理。
               */
             // tFunctions.palette({min:1}),
              //如果Scene未引用属性，则从文件中删除属性。通常有助于在其他操作后进行清理，例如允许分离节点并自动删除任何未使用的网格、材料或其他资源。
               tFunctions.prune(),
               tFunctions.resample(),
              // 压缩
               tFunctions.draco({}),
             // 展平场景图，将具有 网格、相机和其他附件的节点保留为场景的直接子级。骨骼及其后代保留在其原始节点结构中。针对节点或其父节点的动画将阻止该节点移动。
              tFunctions.flatten(),
              // 去prb,金属化
              // 优化网格 基元的参考位置
              tFunctions.reorder({ encoder: meshoptimizer.MeshoptEncoder }),
         
              //删除重复的Accessor、Mesh、Texture和Material 属性。部分基于 mattdesl 的要点。仅处理网格图元、变形目标和动画采样器中的访问器。
              tFunctions.dedup({ propertyTypes: [tCore.PropertyType.MESH] }), // 去重
     
              tFunctions.textureCompress({
                // encoder: sharp,
                  targetFormat: 'webp',
                  resize: [256, 256],
              }),
            //   tFunctions.textureResize({
                    
            //   }),
              backfaceCulling({cull: true}),
              tFunctions.metalRough(),   // 去prb,金属化
         // tFunctions.instance({min:200}), // 实例化
        );

        const glb = await webio.writeBinary(document);

        oldParse(glb.buffer, path, onLoad, onError);
      };
    }

    if (this.options.gltf?.useGltfloaded2) {
      // google viewer
      this.gltfLoader2 = new CachingGLTFLoader(ModelViewerGLTFInstance);

      if (this.options.gltf?.path) {
        this.gltfLoader2.gltfLoader.setPath(this.options.gltf.path);
      }
      if (this.options.gltf?.resourcePath) {
        this.gltfLoader2.gltfLoader.setResourcePath(
          this.options.gltf.resourcePath
        );
      }
      if (this.options.gltf?.dracoendcordPath) {
        CachingGLTFLoader.setDRACODecoderLocation(
          this.options.gltf.dracoendcordPath
        );
      }
    }
  }
  initLight() {
    const ambient = new THREE.HemisphereLight(0xffffff, 0x000000,2);
    this.scene.add(ambient);
  }
  initPathTrack() {
    this.pathTrack = ViewportPathtracer();
  }
  handleResize() {
    const rect = this.container.getBoundingClientRect();
    if (
      Math.abs(rect.width - this.width) >= 1 ||
      Math.abs(rect.height - this.height) >= 1
    ) {
      this.setSize(rect.width, rect.height);
    }
  }
  setSize(width: number, height: number) {
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }
  animationId = 0;
  startAnimation() {
    if (this.animationId) {
      return;
    }
    this.animationId = requestAnimationFrame(this.loop);
  }
  stopAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = 0;
    }
  }

  loop = () => {
    this.stats?.update();
    this.timer.update();
    this.delta = this.timer.getDelta();
    this.dispatchEvent({ type: "tick", delta: this.delta });

    if (this.renderAutoUpdate || this.renderNeedsUpdate) {
      this.render();
    }
    this.animationId = requestAnimationFrame(this.loop);
  };
  update() {
    this.renderNeedsUpdate = true;
  }
  render() {
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
  }
  async LoadGLTFList(
    urls: string[],
    onProgress?: (url: string, loaded: number, total: number) => void
  ) {
    if (this.options.gltf?.useWorker) {
      // return this.workerPool.postMessage({type:'load',urls,gltfOptions:this.options.gltf}).then(()=>{

      // })
      return new Promise((resolve, reject) => {
        const worker = new GltfWorker();

        worker.addEventListener("message", (e: any) => {
          if (e.data.type === "progress") {
            onProgress?.(e.data.url, e.data.loaded, e.data.total);
          } else if (e.data.type === "complete") {
            console.log("完成");
            let objLoader = new THREE.ObjectLoader();
            let sceneData = e.data.scene;

            let scene = objLoader.parse(sceneData);
            worker.terminate();
            resolve(scene.children.map((d) => ({ scene: d })));
          } else if (e.data.type === "error") {
            worker.terminate();
            reject(e.data);
          }
        });
        worker.postMessage({
          type: "load",
          urls,
          gltfOptions: this.options.gltf,
        });
      });
    } else {
      if (this.options.gltf?.useGltfloaded2) {
        this.gltfLoader2.gltfLoader.manager = new THREE.LoadingManager(
          undefined,
          onProgress,
          undefined
        );
      } else {
        this.gltfLoader.manager = new THREE.LoadingManager(
          undefined,
          onProgress,
          undefined
        );
      }
      return Promise.all(urls.map((url) => this.loadGLTF(url)));
    }
  }
  async loadGLTF(url: string, onProgress?: (event: ProgressEvent) => void) {
    if (this.options.gltf?.useGltfloaded2) {
      return this.gltfLoader2.load(url, null);
    }
    return this.gltfLoader.loadAsync(url, onProgress);
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
}
