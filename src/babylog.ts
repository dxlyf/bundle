// 导入 Babylon.js 库
import * as BABYLON from "babylonjs";
import   "babylonjs-loaders";
import type {GLTFFileLoader} from 'babylonjs-loaders'
import './index.css'
// 创建 Babylon.js 引擎
const canvas = document.createElement("canvas") as HTMLCanvasElement;
canvas.className='canvas-autosize'
document.body.appendChild(canvas)
const engine = new BABYLON.Engine(canvas,true,{},true);

// 创建场景
const scene = new BABYLON.Scene(engine);
 

 // 创建相机
 var camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, new BABYLON.Vector3(0, 0, 0), scene);

 camera.attachControl(canvas, true);


// scene.createDefaultCameraOrLight(true,true,true)
// scene.createDefaultEnvironment()
const light=new BABYLON.HemisphericLight('b',new BABYLON.Vector3(0,1,0),scene)

let modelNames = [
    "models/bim/GlFT/GlFT/all/AR-地下室.gltf",
    "models/bim/GlFT/GlFT/all/MEP_B2.gltf",
    "models/bim/GlFT/GlFT/all/MEP_B3.gltf",
    "models/bim/GlFT/GlFT/AR-地下室/AR-地下室.gltf",
    "models/bim/GlFT/GlFT/MEP-11F/MEP-11F.gltf",
    "models/bim/GlFT/GlFT/MEP-13F~17F/MEP-13F~17F.gltf",
    "models/bim/GlFT/GlFT/MEP-18F~20F/MEP-18F~20F.gltf",
    "models/bim/GlFT/GlFT/MEP-21F/MEP-21F.gltf",
    "models/bim/GlFT/GlFT/MEP-22F/MEP-22F.gltf",
    "models/bim/GlFT/GlFT/MEP-24F~28F/MEP-24F~28F.gltf",
    "models/bim/GlFT/GlFT/MEP-29F~31F/MEP-29F~31F.gltf",
    "models/bim/GlFT/GlFT/MEP-32F/MEP-32F.gltf",
    "models/bim/GlFT/GlFT/MEP-4F/MEP-4F.gltf",
    "models/bim/GlFT/GlFT/MEP-5F/MEP-5F.gltf",
    "models/bim/GlFT/GlFT/MEP-6F/MEP-6F.gltf",
    "models/bim/GlFT/GlFT/MEP-7F/MEP-7F.gltf",
    "models/bim/GlFT/GlFT/MEP-8F~10F/MEP-8F~10F.gltf",
    "models/bim/GlFT/GlFT/MEP_B2/MEP_B2.gltf",
    "models/bim/GlFT/GlFT/MEP_B3/MEP_B3.gltf",
    "models/bim/GlFT/GlFT/MQ-1~22F（配合甲方VIP夹层）/MQ-1~22F（配合甲方VIP夹层）.gltf",
    "models/bim/GlFT/GlFT/MQ-23~RF/MQ-23~RF.gltf",
    "models/bim/GlFT/GlFT/ST-地下室-0825/ST-地下室-0825.gltf",
    "models/bim/GlFT/GlFT/湾区产业投资大厦-配合甲方VIP夹层/湾区产业投资大厦-配合甲方VIP夹层.gltf",
  ];
  modelNames=modelNames.slice(0,1)

const modelRootPath = "http://localhost:4684/";

// 异步加载多个 glTF 文件
async function loadGltfModels() {
 
    BABYLON.DracoCompression.Configuration = {
        decoder: {
          wasmUrl: "/three/libs/draco/gltf/draco_wasm_wrapper.js",
          wasmBinaryUrl:"/three/libs/draco/gltf/draco_decoder.wasm",
          fallbackUrl: "/three/libs/draco/gltf/draco_decoder.js",
        },
      };
   
     BABYLON.SceneLoader.OnPluginActivatedObservable.addOnce(function (loader) {
        if (loader.name === "gltf") {
        }
    });

  // 异步加载每个文件
   const loadModel=async (file:string)=>{
      const fileUrl=modelRootPath+file
      const rootUrl=fileUrl.substring(0,fileUrl.lastIndexOf('/')+1)
      const fileName=fileUrl.substring(fileUrl.lastIndexOf('/')+1)
      BABYLON.SceneLoader.LoadAssetContainerAsync(rootUrl, fileName).then(function (container) {
          const meshes = container.meshes;
          const materials = container.materials;
          
          //...
          debugger
          // Adds all elements to the scene
          container.addAllToScene();
        // const mesh=container.createRootMesh()
    
      });
   }
   await Promise.all(modelNames.map(url=>loadModel(url)))
 
  setTimeout(()=>{
    render()
  },1000)

}

// // 渲染场景
// engine.runRenderLoop(() => {
//     scene.render();
// });
const render = () => {
  scene.render();
};

// 处理窗口大小变化
window.addEventListener("resize", () => {
  engine.resize();
  render();
});
var cameraMoving = 0;

// 监听相机移动开始和结束事件
camera.onAfterCheckInputsObservable.add(function () {
     if( cameraMoving ===0){
        cameraMoving = 1;
     }
});


// 在每帧渲染前的回调函数中检查相机是否移动，若移动则手动触发场景渲染
scene.onBeforeRenderObservable.add(function () {
    if (cameraMoving===1) {
        cameraMoving=2
        requestAnimationFrame(()=>{
            cameraMoving=0
            scene.render();
       })
    }
});
engine.runRenderLoop(()=>{

})
//loadAssets()
loadGltfModels()
