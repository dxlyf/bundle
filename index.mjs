import esbuild from 'esbuild'
import path from 'node:path'
import fs from 'node:fs'
import { Transform } from 'node:stream'
//const a=require('./src/three/examples/jsm/libs/draco/gltf/draco_decoder')
// esbuild.build({
//     entryPoints:[{
//         'in':'./src/index.js',
//         'out':'crypto-js.esm'
//     }],
//     bundle:true,
//     format:"esm",
//     globalName:'cryptoJs',
//     outdir:'./dist'
// })

// const dir='E:/fanyonglong/assets/models/bim/GlFT/GlFT'

// const files=fs.readdirSync(dir)
// const models=[]
// files.forEach(file2=>{
//     const dirFilePath=path.join(dir,file2)
//     const stat=fs.statSync(dirFilePath)
//     if(stat.isDirectory()){
//         const files=fs.readdirSync(dirFilePath)
//         files.forEach(file=>{
//             const filePath=path.join(dirFilePath,file)
//             const stat=fs.statSync(filePath)
//             if(stat.isFile()){

//                 const fileExt=path.extname(filePath)
//                 const fileName=path.basename(filePath)
//                  if(fileExt.toLowerCase()=='.gltf'){
//                     models.push(`models/bim/GlFT/GlFT/${file2}/${file}`)
//                  }
//             }
//         })
//     }
// })

// // 普通数组转ArrayBuffer
// fs.writeFileSync(path.join(import.meta.dirname,'models.json'),JSON.stringify(models),{
//     flag:'w+'
// })

const file='E:/fanyonglong/projects/bundle/public/models/Duck/glTF/Duck0.bin'
const rs=fs.createReadStream(file,{
   // highWaterMark:100
})
const ws=fs.createWriteStream('E:/fanyonglong/projects/bundle/public/models/Duck/glTF/Duck0.txt',{encoding:'utf-8'})
rs.pipe(new Transform({

    transform(chunk,encoding,callback){
        const content=chunk.toString('utf-8')
        console.log('chunk',content.length)
        callback(null,content)
    }
})).pipe(ws)

ws.on('finish',()=>{
    console.log('写完')
})