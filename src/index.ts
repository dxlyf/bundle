// import * as THREE from 'three'
import * as THREE from 'three'
import {WebGLRenderer,PerspectiveCamera,Scene,Mesh,MeshBasicMaterial,BoxGeometry,LoadingManager,AmbientLight,Cache,BufferGeometry,MeshStandardMaterial,Loader,FileLoader,Group} from 'three'
import {OrbitControls} from 'three/jsm/controls/OrbitControls'
import {GLTFLoader,type GLTF} from 'three/jsm/loaders/GLTFLoader'
import {DRACOLoader} from 'three/jsm/loaders/DRACOLoader'
import {Timer} from 'three//jsm/misc/Timer'
import Stats from 'three/jsm/libs/stats.module'
import {Stage,CameraTrackballControls,MouseHandler} from './renderer'

import './index.css'


//Cache.enabled=false
THREE.Cache.enabled=false // 关闭缓存

THREE.Mesh.DEFAULT_MATRIX_AUTO_UPDATE=false
THREE.Mesh.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=false



let models=["models/bim/GlFT/GlFT/all/AR-地下室.gltf","models/bim/GlFT/GlFT/all/MEP_B2.gltf","models/bim/GlFT/GlFT/all/MEP_B3.gltf","models/bim/GlFT/GlFT/AR-地下室/AR-地下室.gltf","models/bim/GlFT/GlFT/MEP-11F/MEP-11F.gltf","models/bim/GlFT/GlFT/MEP-13F~17F/MEP-13F~17F.gltf","models/bim/GlFT/GlFT/MEP-18F~20F/MEP-18F~20F.gltf","models/bim/GlFT/GlFT/MEP-21F/MEP-21F.gltf","models/bim/GlFT/GlFT/MEP-22F/MEP-22F.gltf","models/bim/GlFT/GlFT/MEP-24F~28F/MEP-24F~28F.gltf","models/bim/GlFT/GlFT/MEP-29F~31F/MEP-29F~31F.gltf","models/bim/GlFT/GlFT/MEP-32F/MEP-32F.gltf","models/bim/GlFT/GlFT/MEP-4F/MEP-4F.gltf","models/bim/GlFT/GlFT/MEP-5F/MEP-5F.gltf","models/bim/GlFT/GlFT/MEP-6F/MEP-6F.gltf","models/bim/GlFT/GlFT/MEP-7F/MEP-7F.gltf","models/bim/GlFT/GlFT/MEP-8F~10F/MEP-8F~10F.gltf","models/bim/GlFT/GlFT/MEP_B2/MEP_B2.gltf","models/bim/GlFT/GlFT/MEP_B3/MEP_B3.gltf","models/bim/GlFT/GlFT/MQ-1~22F（配合甲方VIP夹层）/MQ-1~22F（配合甲方VIP夹层）.gltf","models/bim/GlFT/GlFT/MQ-23~RF/MQ-23~RF.gltf","models/bim/GlFT/GlFT/ST-地下室-0825/ST-地下室-0825.gltf","models/bim/GlFT/GlFT/湾区产业投资大厦-配合甲方VIP夹层/湾区产业投资大厦-配合甲方VIP夹层.gltf"]

models=models.slice(0,1)
const stage=new Stage({
    gltf:{
        enabledTransform:true,
        enableKtx:false,
        useGltfloaded2:false,
        useWorker:false,
        path:'http://localhost:4684/',
        ktxTranscoderPath:"/three/libs/basic/",
        dracoendcordPath:'/three/libs/draco/gltf/'
    }
})
document.body.appendChild(stage.container)
stage.initialize()
stage.startAnimation()

const {renderer,scene,camera}=stage
camera.position.set(0,0,1000)
camera.lookAt(new THREE.Vector3())
camera.updateMatrixWorld()

const div=document.createElement('div')
div.style.cssText=`
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(0,0,0,0.98);
    transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
`
div.innerHTML=`<div style="color: #fff;">加载资源中...</div>`
document.body.appendChild(div)


if ( 'serviceWorker' in navigator ) {

    try {

        navigator.serviceWorker.register( 'sw.js' );

    } catch ( error ) {

    }

}

stage.LoadGLTFList(models,(url,loaded,total)=>{
    div.children[0].innerHTML=`已加载资源${Number((loaded/total*100).toFixed(2))}%`
}).then((gltfs)=>{
    document.body.removeChild(div)
    let objCount=0,objInfo:{[Key:string]:number}={};
    let defaultCamera:any
    let group=new THREE.Group()
    gltfs.forEach((gltf,i)=>{
        gltf.scene.traverse((obj)=>{
            objCount++
            if(!objInfo[obj.type]){
                objInfo[obj.type]=0
            }
            objInfo[obj.type]++
            group.add(gltf.scene)
            if(obj.type==='PerspectiveCamera'&&!defaultCamera){
                defaultCamera=obj

            }
        })
        
    })
    scene.add(group)
    

    stage.controls.control.viewObject(group)
    stage.update()
    console.log('objCount:',objCount,'objInfo:',objInfo)
})





