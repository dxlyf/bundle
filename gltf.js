const { compile, compileFromFile }=require('json-schema-to-typescript')
const {series,src,dest} =require('gulp')
const concat =require('gulp-concat')
const {Transform,Writable}=require('stream')
const { join } = require('path')
const fs=require('fs')
const path=require('path')


compileFromFile(path.join(__dirname,'./gltf/specification/1.0/schema/glTF.schema.json'),{
  cwd:'../../../gltf/specification/1.0/schema/',


})
  .then(ts => fs.writeFileSync(path.join(__dirname,'./dist/gltf-1.0.d.ts'), ts)).then(()=>{
    console.log('完成')
  })