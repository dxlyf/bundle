import {GLTFLoader,type GLTF} from 'cthree/jsm/loaders/GLTFLoader'
import {DRACOLoader} from 'cthree/jsm/loaders/DRACOLoader'


const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('path_to_draco_decoder');

gltfLoader.setDRACOLoader(dracoLoader);

self.onmessage = function(e) {
  if (e.data.work_type === 'start') {
    gltfLoader.load(
      'path_to_gltf_model.gltf',
      (gltf) => {
        // 将gltf数据转换为可以发送到主线程的格式
        const dataToSend = /* ...转换逻辑... */;
        self.postMessage({ work_type: "parseModel", data: dataToSend });
      },
      (progress) => {
        // 可以在这里处理加载进度
      },
      (error) => {
        self.postMessage({ msg: "加载出错" });
      }
    );
  }
};

// 主线程代码
const myWorker = new Worker(new URL("worker_script.js", import.meta.url));

myWorker.onmessage = function(e) {
  if (e.data.work_type === "parseModel") {
    // 使用THREE对象重新构建模型
    const mesh = /* ...根据接收到的数据创建模型... */;
    scene.add(mesh);
  }
};

myWorker.postMessage({ work_type: "start" });