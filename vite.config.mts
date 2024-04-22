import {defineConfig} from 'vite'
import path from 'node:path'

export default defineConfig(({mode})=>({
    resolve:{
        alias:{
            'babylonjs': mode === 'development' ? 'babylonjs/babylon.max' : 'babylonjs',

        }
    }
   
}))