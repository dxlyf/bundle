
import fs from 'node:fs'
import ts from 'typescript'
import path from 'node:path'

function typeDefToJson(file,outFile){
    // 读取TypeScript声明文件
const typeScriptContent = fs.readFileSync(file, 'utf8');

// TypeScript编译选项
const options = {
    target: ts.ScriptTarget.ES2015,
    module: ts.ModuleKind.CommonJS,
    strict: true
};

// 解析TypeScript内容
const sourceFile = ts.createSourceFile(file, typeScriptContent, options.target, true);

// 用于存储转换后的JSON结构
let jsonStructure = {};

/**
 * @param {ts.Node} node
 * @Param {ts.Node} parent
 */
const convertType=(node,parent)=>{
        
        if(ts.isStringLiteral(node)){
            return node.text
        }else if(ts.isNumericLiteral(node)){
            return node.text
        }else if(ts.isBigIntLiteral(node)){
            return node.text
        }else if(ts.isTypeAliasDeclaration(node)){

            return convertType(node.type,node)
        }else if(ts.isUnionTypeNode(node)){
            
            return convertType(node.type,node)
        }
        else if(ts.isInterfaceDeclaration(node)){
            const result=parent.data
            node.members.forEach((el,i)=>{
                result[el.name.escapedText]=convertType(el,node)
            })
            return result
        }else if(ts.isArrayTypeNode(node)){
            const list=[]
            node.forEachChild((el)=>{
                list.push(convertType(el,node))
            })
            return list;
        }
}

// 遍历源文件中的声明空间
/**
 * @params {ts.Node} node
 */
sourceFile.forEachChild((node) => {
    // if (ts.isExportDeclaration(node) || ts.isExportSpecifier(node)) {
    //     return; // 忽略导出声明
    // }
    if (ts.isInterfaceDeclaration(node)&&node.name.escapedText=='GlTF2') {
        /**@type {ts.InterfaceDeclaration} */
        const inode=node
        const name = node.name.escapedText.toString();
        
        convertType(node,{data:jsonStructure});
    }
});

// 将JSON结构转换为字符串
const jsonString = JSON.stringify(jsonStructure, null, 2);

// 写入JSON文件
fs.writeFileSync(outFile, jsonString, 'utf8');
}
typeDefToJson(path.join(import.meta.dirname,'types/gltf.d.ts'),path.join(import.meta.dirname,'types/gltf-2.0.json'))