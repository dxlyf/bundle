
export interface GlTF2 {
  /**
   * 此资产中使用的 glTF 扩展的名称。
   *
   * @minItems 1
   */
  extensionsUsed?:string[];
  /**
   * 正确加载此资源所需的 glTF 扩展名。
   *
   * @minItems 1
   */
  extensionsRequired?:string[];
  /**
   * 访问器数组。
   *
   * @minItems 1
   */
  accessors?:{
        /**
         * bufferView 的索引。
         */
        bufferView?: number;
        /**
         * 相对于缓冲区视图开头的偏移量（以字节为单位）。
         */
        byteOffset?: number;
        /**
         * 访问器组件的数据类型。
         */
        componentType: 5120 | 5121 | 5122 | 5123 | 5125 | 5126 | number;
        /**
         * 指定整数数据值在使用前是否进行标准化。
         */
        normalized?: boolean;
        /**
         * 该访问器引用的元素数量。
         */
        count: number;
        /**
         * 指定访问器的元素是标量、向量还是矩阵。
         */
        type: "SCALAR" | "VEC2" | "VEC3" | "VEC4" | "MAT2" | "MAT3" | "MAT4" | string;
  }[];
  /**
   * 一系列关键帧动画。
   *
   * @minItems 1
   */
  animations?: {
        /**
     * 一系列动画频道。动画通道将动画采样器与正在动画化的目标属性组合在一起。同一动画的不同通道**不得**具有相同的目标。
     *
     * @minItems 1
     */
    channels: {
         /**
         * 此动画中采样器的索引用于计算目标的值。
         */
        sampler: number;
        /**
         * 动画属性的描述符。
         */
        target: {
             /**
             * 要设置动画的节点的索引。当未定义时，动画对象**可以**由扩展定义。
             */
            node?: number;
            /**
             * 要设置动画的节点的 TRS 属性的名称，或其实例化的变形目标的“权重”。对于“translation”属性，采样器提供的值是沿 X、Y 和 Z 轴的平移。对于“rotation”属性，值是顺序为 (x, y, z, w) 的四元数，其中 w 是标量。对于“scale”属性，这些值是沿 X、Y 和 Z 轴的缩放因子。
             */
            path: "translation" | "rotation" | "scale" | "weights" | string;
            extensions?: unknown;
            extras?: unknown;
            [k: string]: unknown;
        };
        extensions?: unknown;
        extras?: unknown;
        [k: string]: unknown;
    }[];
    /**
     * 一系列动画采样器。动画采样器将时间戳与输出值序列相结合，并定义插值算法。
     *
     * @minItems 1
     */
    samplers: {
          /**
         * 包含关键帧时间戳的访问器的索引。
         */
        input: number;
        /**
         * 插值算法。
         */
        interpolation?: "LINEAR" | "STEP" | "CUBICSPLINE" | string;
        /**
         * 访问器的索引，包含关键帧输出值。
         */
        output: number;
        extensions?: unknown;
        extras?: unknown;
        [k: string]: unknown;
    }[];
    name?: unknown;
    extensions?: unknown;
    extras?: unknown;
    [k: string]: unknown;
  }[];
  /**
   * 有关 glTF 资产的元数据。
   */
  asset: {
      /**
     * 适合显示以表彰内容创建者的版权消息。
     */
    copyright?: string;
    /**
     * 生成此 glTF 模型的工具。对于调试很有用。
     */
    generator?: string;
    /**
     * 该资源所针对的 glTF 版本，格式为“<major>.<minor>”。
     */
    version: string;
    /**
     * 此资产所针对的最低 glTF 版本，格式为“<major>.<minor>”。该属性**不得**大于资产版本。
     */
    minVersion?: string;
    extensions?: unknown;
    extras?: unknown;
    [k: string]: unknown;
  };
  /**
   * 缓冲区数组。
   *
   * @minItems 1
   */
  buffers?: [Buffer, ...Buffer1[]];
  /**
   * bufferView 数组。
   *
   * @minItems 1
   */
  bufferViews?: [BufferView, ...BufferView1[]];
  /**
   * 一系列相机。
   *
   * @minItems 1
   */
  cameras?: [Camera, ...Camera1[]];
  /**
   * 图像数组。
   *
   * @minItems 1
   */
  images?: [Image, ...Image4[]];
  /**
   * 一系列材料。
   *
   * @minItems 1
   */
  materials?: [Material, ...Material1[]];
  /**
   * 网格阵列。
   *
   * @minItems 1
   */
  meshes?: [Mesh, ...Mesh1[]];
  /**
   * 节点数组。
   *
   * @minItems 1
   */
  nodes?: [Node, ...Node1[]];
  /**
   * 采样器阵列。
   *
   * @minItems 1
   */
  samplers?: [Sampler, ...Sampler1[]];
  /**
   * 默认场景的索引。
   */
  scene?: GlTFId;
  /**
   * 一系列场景。
   *
   * @minItems 1
   */
  scenes?: [Scene, ...Scene1[]];
  /**
   * 一系列的皮肤。
   *
   * @minItems 1
   */
  skins?: [Skin, ...Skin1[]];
  /**
   * 一系列纹理。
   *
   * @minItems 1
   */
  textures?: [Texture, ...Texture1[]];
  extensions?: unknown;
  extras?: unknown;
  [k: string]: unknown;
}
