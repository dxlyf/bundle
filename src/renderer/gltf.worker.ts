import {GLTFLoader,type GLTF} from 'three/examples/jsm/loaders/GLTFLoader'
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader'
import {LoadingManager} from 'three/src/loaders/LoadingManager'
import {Scene} from 'three/src/scenes/Scene'
import { min } from 'three/examples/jsm/nodes/Nodes';

const gltfLoader = new GLTFLoader(new LoadingManager(()=>{},(url,loaded,total)=>{
    self.postMessage({type:'progress',url,loaded,total})
}));
const dracoLoader = new DRACOLoader();

gltfLoader.setDRACOLoader(dracoLoader);

self.onmessage = function(e) {
   if(e.data.type==='load'){
       const options=e.data.gltfOptions
       const urls=e.data.urls as string[]

       if(options?.dracoendcordPath){
        dracoLoader.setDecoderPath(options.dracoendcordPath)
      }
      if(options?.path){
        gltfLoader.setPath(options.path)
      }
      if(options?.resourcePath){
        gltfLoader.setResourcePath(options.resourcePath)
      }
      
       Promise.all(urls.map((url:string)=>gltfLoader.loadAsync(url))).then((result)=>{
            const scene=new Scene()
      
            result.forEach(d=>{
              scene.add(d.scene)
            })
            let sceneData=scene.toJSON()
            sceneData.animations??=[]
            sceneData.images=sceneData.images.map((image:any)=>{
              if(typeof image==='string'){
                  return image
              }
              if(image.url===undefined){
                  return {
                      data:'',
                      ...image,
                      url:''
                  }
              }
              return image
            })
            self.postMessage({type:'complete',scene:sceneData}) 
       }).catch((e)=>{
           self.postMessage({type:'error',error:e+''})
       })
   }
};

self.postMessage('哈哈工')