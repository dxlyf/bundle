
import * as THREE from 'three'
import {WebGLRenderer,PerspectiveCamera,Scene,Vector2,Vector3} from 'three'
import {TrackballControls} from 'three/examples/jsm/controls/TrackballControls'
import {GLTFLoader,type GLTF} from 'three/examples/jsm/loaders/GLTFLoader'
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader'

import {Timer} from 'three/examples/jsm/misc/Timer'
import Stats from 'three/examples/jsm/libs/stats.module'
import GltfWorker from './gltf.worker?worker'
import {ViewportPathtracer} from './Pathtracer'
import { CachingGLTFLoader } from './gltf-instance/CachingGLTFLoader'
import { ModelViewerGLTFInstance } from './gltf-instance/ModelViewerGLTFInstance'

type Options={
    container?:HTMLDivElement,
    rendererParameters?:THREE.WebGLRendererParameters,
    dpr?:number,
    gltf?:{
        useGltfloaded2?:boolean
        useWorker?:boolean
        dracoendcordPath?:string
        path?:string
        resourcePath?:string
    }
}
type MouseEventTypeMap={
    objectDrag:{object:THREE.Intersection},
    objectDragend:{object:THREE.Intersection},
    dragstart:{},
    drag:{},
    dragend:{},
    objectLeave:{object:THREE.Intersection,intersections:THREE.Intersection[]},
    objectEnter:{object:THREE.Intersection,intersections:THREE.Intersection[]},
    pointerdown:{},
    pointermove:{},
    pointerup:{},
    select:{object:THREE.Intersection,intersections:THREE.Intersection[]}
}
type CamelToSnakeCase<S extends string> = S extends `${infer T}${infer U}` ?
  `${T extends Capitalize<T> ? "-" : ""}${Lowercase<T>}${CamelToSnakeCase<U>}` :
  S

type KeysToSnakeCase<T extends {[K:string]:any}>={
   [Key in keyof T as CamelToSnakeCase<string & Key>]:T[Key]
}
type MouseEventTypeMapCamel=KeysToSnakeCase<MouseEventTypeMap>

export class MouseHandler extends THREE.EventDispatcher<MouseEventTypeMapCamel>{
    coord=new Vector2()
    pointDown=new Vector2()
    point=new Vector2()
    pointUp=new Vector2()
    pointDelta=new Vector2()
    pointOffset=new Vector2()
    pointLast=new Vector2()
    doc:Document
    _rect?:DOMRect
    type:string=''
    event?:MouseEvent
    raycaster!:THREE.Raycaster
    intersections:THREE.Intersection[]=[]
    moving:boolean=false
    objects:THREE.Object3D[]=[]
    recursive:boolean=false
    enableRaycaster:boolean=true
    selected:THREE.Intersection|null=null
    hoverObject:THREE.Intersection|null=null
    mouseState:number=0
    constructor(private dom:HTMLElement,private stage:Stage){
        super()
        this.doc=this.dom.ownerDocument
        this.raycaster=new THREE.Raycaster()
        this.attachEvent()
    }
    get clientRect(){
         this._rect??=this.dom.getBoundingClientRect();
         return this._rect
    }

    setObjects(objects:THREE.Object3D[],recursive:boolean=false){
        this.objects=objects
        this.recursive=recursive
    }
    rayObjects(objects:THREE.Object3D[],recursive:boolean=false,intersections=this.intersections){
        intersections.length=0
        this.raycaster.setFromCamera(this.coord,this.stage.camera)
        this.raycaster.intersectObjects(objects,recursive,this.intersections)
        return intersections
    }
    rayObject(object:THREE.Object3D,recursive:boolean=false,intersections=this.intersections){
        intersections.length=0
        this.raycaster.setFromCamera(this.coord,this.stage.camera)
        this.raycaster.intersectObject(object,recursive,this.intersections)
        return intersections
    }
    getMouse(e:MouseEvent,out:Vector2){
        return out.set(e.clientX-this.clientRect.left,e.clientY-this.clientRect.top)
    }
    getClipCoord(point:Vector2,out:Vector2){
        return out.set(point.x/this.clientRect.width*2-1,-point.y/this.clientRect.height*2+1)
    }
    handleMove=()=>{
        this.moving=false
        this.getMouse(this.event!,this.point)
        this.getClipCoord(this.point,this.coord)
        this.pointDelta.subVectors(this.point,this.pointLast)
        this.pointOffset.subVectors(this.point,this.pointDown)
        this.pointLast.copy(this.point)
        this.dispatchEvent({type:'pointermove'})

        if(this.mouseState!==0){
            if(this.mouseState===1){
                this.mouseState=2
                this.dispatchEvent({type:'dragstart'})
            }else{
                this.dispatchEvent({type:'drag'})
            }
        }
        if(this.selected){
            this.dispatchEvent({type:'object-drag',object:this.selected})
        }
        if(this.enableRaycaster&&!this.selected&&this.objects.length>0){
            const intersections=this.rayObjects(this.objects,this.recursive)
            if(intersections.length>0){
                const current=intersections[0]
                if(current.object!==this.hoverObject?.object){
                    if(this.hoverObject?.object){
                        this.dispatchEvent({type:'object-leave',object:this.hoverObject,intersections:intersections.slice()})
                    }
                    this.hoverObject=current
                    this.dispatchEvent({type:'object-enter',object:this.hoverObject,intersections:intersections.slice()})
                }
            }else if(this.hoverObject){
                this.dispatchEvent({type:'object-leave',object:this.hoverObject,intersections:[]})
                this.hoverObject=null
            }
        }
    }
    handleEvent=(e:MouseEvent)=>{
        const type=e.type
        if(type==='contextmenu'){
            e.preventDefault()
            return
        }
        this.type=type
        this.event=e;

        if(type==='pointerdown'){
            this.mouseState=1
            this.getMouse(e,this.pointDown)
            this.getClipCoord(this.pointDown,this.coord)
            this.pointLast.copy(this.pointDown)
            this.dispatchEvent({type:'pointerdown'})
            if(this.enableRaycaster&&this.objects.length>0){
                const intersections=this.rayObjects(this.objects,this.recursive)
                if(this.hoverObject){
                    this.selected=this.hoverObject
                    this.dispatchEvent({type:'select',object:this.selected,intersections:intersections.slice()})
                }
            }

        }else if(type==='pointermove'){
            if(this.moving){
                return
            }
            this.moving=true
            requestAnimationFrame(this.handleMove)

        }else if(type==='pointerup'){
            this.getMouse(e,this.pointUp)
            this.dispatchEvent({type:'pointerup'})
            if(this.mouseState!==0){
                this.mouseState=0
                this.dispatchEvent({type:'dragend'})
            }
            if(this.selected){
                this.dispatchEvent({type:'object-dragend',object:this.selected})
                this.selected=null
            }
        }
    
    }

    attachEvent(){
        this.dom.addEventListener('contextmenu',this,false)
        this.dom.addEventListener('pointerdown',this,false)
        this.doc.addEventListener('pointermove',this,false)
        this.doc.addEventListener('pointerup',this,false)
    }
    detachEvent(){
        this.dom.removeEventListener('contextmenu',this,false)
        this.dom.removeEventListener('pointerdown',this,false)
        this.doc.removeEventListener('pointermove',this,false)
        
    }
    dispose(){
        this.detachEvent()
    }
}


export abstract class CameraControl{
    abstract type:string
    isActive:boolean=false
    constructor(public stage:Stage){
    }
    abstract initialize():void
    abstract enable():void
    abstract disabled():void
    abstract viewObject(obj:THREE.Object3D):void
    update():void{}
    dispose():void{}
}
export class CameraTrackballControls extends  CameraControl{
    type: string='trackball'
    controls!:TrackballControls
    constructor(stage:Stage){
        super(stage)
        this.initialize()
    }
    initialize(): void {    
        this.controls=new TrackballControls(this.stage.camera,this.stage.container)
        this.attachEvent()
    }
    attachEvent(){
        this.controls.addEventListener('change',this.handleChange)
    }
    detachEvent(){
        this.controls.removeEventListener('change',this.handleChange)
    }
    handleChange=()=>{
        this.stage.update()
    }
    dispose(){
        this.detachEvent()
    }
    viewObject(obj: THREE.Object3D): void {
        const box3=new THREE.Box3()
        box3.setFromObject(obj)
        const size=box3.getSize(new THREE.Vector3())
        const center=box3.getCenter(new THREE.Vector3())
        const stage=this.stage
        this.controls.target=center
        stage.camera.position.set(center.x,center.y,center.z+size.z+100)
        stage.camera.lookAt(center)
        stage.camera.updateProjectionMatrix()
        stage.camera.updateMatrixWorld()
    }
    enable(){
        this.controls.enabled=true
    }
    disabled(){
        this.controls.enabled=false
    }
    update(){
        this.controls.update()
    }

}



export class CameraControlManage<ControlName extends string='default'>{
    controlsMap:{[key in ControlName]:CameraControl}={} as {[key in ControlName]:CameraControl}
    controls:CameraControl[]=[]
    currentControlType:string=''
    constructor(private stage:Stage,controls:(new (stage:Stage)=>CameraControl)[]=[]){
        this.stage.addEventListener('dispose',()=>{
            this.dispose()
        })
        controls.forEach(control=>{
            this.registerControl(control)
        })
        this.stage.addEventListener('tick',()=>{
            this.controls.forEach(control=>{
                control.update()
            })
        })
    }
    get control(){
        return this.controlsMap[this.currentControlType as ControlName]
    }
    enable(){
        this.controls.forEach(control=>{
            control.enable()
        })
    }
    disabled(){
        this.controls.forEach(control=>{
            control.disabled()
        })
    }
    registerControl(Control:new (stage:Stage)=>CameraControl){
        const control=new Control(this.stage)
        this.controlsMap[control.type as ControlName]=control
        this.controls.push(control)
        this.currentControlType=control.type
        return this;
    }
    dispose(){
        this.controls.forEach(control=>{
            control.dispose()
        })
    }
}

export class Stage extends THREE.EventDispatcher<{dispose:{},tick:{delta:number}}>{
    container!:HTMLDivElement
    renderer!:WebGLRenderer
    camera!:PerspectiveCamera
    scene!:Scene
    timer!:Timer
    stats?:Stats
    delta:number=0
    renderNeedsUpdate:boolean=false
    renderAutoUpdate:boolean=false
    gltfLoader!:GLTFLoader
    controls=new CameraControlManage<'trackball'>(this)
    options:Options
    pathTrack:any
    constructor(options:Options={}){
        super()
        this.options={dpr:window.devicePixelRatio,...options}
        this.container=options.container??document.createElement('div')
        this.container.style.cssText=`position:relative;width:100%;height:100%;`
        
    }
    get dpr(){
        return this.options.dpr
    }
    get width(){
        return this.renderer.domElement.width
    }
    get height(){
        return this.renderer.domElement.height
    }

    initialize(){

         this.initTimer()
         this.initStats()
         this.initRenderer()
         this.initScene()
         this.initCamera()
         this.initLight()
         this.initControls()
         //初始化光线追踪
         this.initPathTrack()
         this.initLoader()
         this.initObserveResize()
    }
    initRenderer(){
        this.renderer=new WebGLRenderer({antialias:true,...this.options.rendererParameters})
        this.renderer.autoClear=false
        this.renderer.shadowMap.enabled=false
        this.renderer.toneMapping=THREE.NoToneMapping
        this.renderer.setClearColor(0xffffff)
        this.renderer.setPixelRatio(this.dpr!)
        this.container.appendChild(this.renderer.domElement)
    }
    initScene(){
        this.scene=new Scene()
    }
    initCamera(){
        this.camera=new PerspectiveCamera(75,1,1,10000)
    }
    initObserveResize(){
        const observe=new ResizeObserver(()=>{
            this.handleResize()
        })
        observe.observe(this.container)
        this.handleResize()
    }
    initControls(){
        this.controls.registerControl(CameraTrackballControls)
    }
    initTimer(){
        this.timer=new Timer()
    }
    initStats(){
        this.stats=new Stats()
        document.body.appendChild((this.stats as any)!.domElement as HTMLDivElement)
    }
    gltfLoader2!:CachingGLTFLoader
    initLoader(){
        this.gltfLoader=new GLTFLoader()
        const dracoLoader=new DRACOLoader()
        if(this.options.gltf?.dracoendcordPath){
            dracoLoader.setDecoderPath(this.options.gltf.dracoendcordPath)
        }
        if(this.options.gltf?.path){
            this.gltfLoader.setPath(this.options.gltf.path)
        }
        if(this.options.gltf?.resourcePath){
            this.gltfLoader.setResourcePath(this.options.gltf.resourcePath)
        }
        this.gltfLoader.setDRACOLoader(dracoLoader)

        // google viewer
        this.gltfLoader2=new CachingGLTFLoader(ModelViewerGLTFInstance)

        
        if(this.options.gltf?.path){
            this.gltfLoader2.gltfLoader.setPath(this.options.gltf.path)
        }
        if(this.options.gltf?.resourcePath){
            this.gltfLoader2.gltfLoader.setResourcePath(this.options.gltf.resourcePath)
        }
        if(this.options.gltf?.dracoendcordPath){
            CachingGLTFLoader.setDRACODecoderLocation(this.options.gltf.dracoendcordPath)
        }
   
    }
    initLight(){
        const ambient=new THREE.HemisphereLight(0xffffff,0xffffff)
        this.scene.add(ambient)
    }
    initPathTrack(){
        this.pathTrack=ViewportPathtracer()
    }
    handleResize(){
        const rect=this.container.getBoundingClientRect()
        if(Math.abs(rect.width-this.width)>=1||Math.abs(rect.height-this.height)>=1){
            this.setSize(rect.width,rect.height)
        }
    }
    setSize(width:number,height:number){

        this.renderer.setSize(width,height)
        this.camera.aspect=width/height
        this.camera.updateProjectionMatrix()
    }
    animationId=0
    startAnimation(){
        if(this.animationId){
            return
        }
       this.animationId= requestAnimationFrame(this.loop)
    }
    stopAnimation(){
        if(this.animationId){
            cancelAnimationFrame(this.animationId)
            this.animationId=0
        }
    }
   
    loop=()=>{
        this.stats?.update()
        this.timer.update()
        this.delta=this.timer.getDelta()
        this.dispatchEvent({type:'tick',delta:this.delta})
        
        if(this.renderAutoUpdate||this.renderNeedsUpdate){
            this.render()
        }
        this.animationId=requestAnimationFrame(this.loop)
    }
    update(){
        this.renderNeedsUpdate=true;
    }
    render(){
        this.renderer.clear()
        this.renderer.render(this.scene,this.camera)
    }
    async LoadGLTFList(urls:string[],onProgress?:(url: string, loaded: number, total: number) => void){
        if(this.options.gltf?.useWorker){
            return new Promise((resolve,reject)=>{
                const worker=  new GltfWorker()
                worker.addEventListener('message',(e:any)=>{
                     if(e.data.type==='progress'){
                        onProgress?.(e.data.url,e.data.loaded,e.data.total);
                     }else if(e.data.type==='complete'){
                            console.log('完成')
                            let objLoader=new THREE.ObjectLoader()
                            let sceneData=e.data.scene
                 
                            let scene=objLoader.parse(sceneData)
                            resolve(scene.children.map(d=>({scene:d})))
                        }else if(e.data.type==='error'){
                            reject(e.data)
                        }
                })
                worker.postMessage({type:'load',urls,gltfOptions:this.options.gltf})
      

            })
        }else{
            if(this.options.gltf?.useGltfloaded2){
                this.gltfLoader2.gltfLoader.manager=new THREE.LoadingManager(undefined,onProgress,undefined)
            
            }else{
                this.gltfLoader.manager=new THREE.LoadingManager(undefined,onProgress,undefined)
            
            }
             return Promise.all(urls.map(url=>this.loadGLTF(url)))
        }
    }
    async loadGLTF(url:string,onProgress?:(event: ProgressEvent) => void){
        if(this.options.gltf?.useGltfloaded2){
            return this.gltfLoader2.load(url,null)
        }
        return this.gltfLoader.loadAsync(url,onProgress)
    }
    dispose(){
        this.dispatchEvent({type:'dispose'})
    }
}


