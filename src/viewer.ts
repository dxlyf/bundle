import './index.css'
import '@google/model-viewer'

let models=["models/bim/GlFT/GlFT/all/AR-地下室.gltf","models/bim/GlFT/GlFT/all/MEP_B2.gltf","models/bim/GlFT/GlFT/all/MEP_B3.gltf","models/bim/GlFT/GlFT/AR-地下室/AR-地下室.gltf","models/bim/GlFT/GlFT/MEP-11F/MEP-11F.gltf","models/bim/GlFT/GlFT/MEP-13F~17F/MEP-13F~17F.gltf","models/bim/GlFT/GlFT/MEP-18F~20F/MEP-18F~20F.gltf","models/bim/GlFT/GlFT/MEP-21F/MEP-21F.gltf","models/bim/GlFT/GlFT/MEP-22F/MEP-22F.gltf","models/bim/GlFT/GlFT/MEP-24F~28F/MEP-24F~28F.gltf","models/bim/GlFT/GlFT/MEP-29F~31F/MEP-29F~31F.gltf","models/bim/GlFT/GlFT/MEP-32F/MEP-32F.gltf","models/bim/GlFT/GlFT/MEP-4F/MEP-4F.gltf","models/bim/GlFT/GlFT/MEP-5F/MEP-5F.gltf","models/bim/GlFT/GlFT/MEP-6F/MEP-6F.gltf","models/bim/GlFT/GlFT/MEP-7F/MEP-7F.gltf","models/bim/GlFT/GlFT/MEP-8F~10F/MEP-8F~10F.gltf","models/bim/GlFT/GlFT/MEP_B2/MEP_B2.gltf","models/bim/GlFT/GlFT/MEP_B3/MEP_B3.gltf","models/bim/GlFT/GlFT/MQ-1~22F（配合甲方VIP夹层）/MQ-1~22F（配合甲方VIP夹层）.gltf","models/bim/GlFT/GlFT/MQ-23~RF/MQ-23~RF.gltf","models/bim/GlFT/GlFT/ST-地下室-0825/ST-地下室-0825.gltf","models/bim/GlFT/GlFT/湾区产业投资大厦-配合甲方VIP夹层/湾区产业投资大厦-配合甲方VIP夹层.gltf"]

let base='http://localhost:4684/'

let frags=document.createDocumentFragment()
models.forEach((url)=>{

    const el=document.createElement('model-viewer')
    el.setAttribute('src',base+url)
    el.setAttribute('camera-controls','true')
    frags.appendChild(el)
    
})
document.body.appendChild(frags)