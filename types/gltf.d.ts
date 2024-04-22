
/**
 * glTF 资源的根对象。
 */
export type GlTF = GlTF1 & GlTF2;
export type GlTF1 = GlTFProperty;
/**
 * 包含原始二进制数据的缓冲区视图的类型化视图。
 */
export type Accessor = Accessor1 & Accessor2;
export type Accessor1 = GlTFChildOfRootProperty;
export type GlTFChildOfRootProperty = GlTFChildOfRootProperty1 & GlTFChildOfRootProperty2;
export type GlTFChildOfRootProperty1 = GlTFProperty;
export type GlTFId = number;
/**
 * 偏离其初始化值的访问器值的稀疏存储。
 */
export type AccessorSparse = AccessorSparse1 & AccessorSparse2;
export type AccessorSparse1 = GlTFProperty;
/**
 * 指向包含偏离访问器值的索引的缓冲区视图的对象。索引的数量等于“accessor.sparse.count”。指数**必须**严格上涨。
 */
export type AccessorSparseIndices = AccessorSparseIndices1 & AccessorSparseIndices2;
export type AccessorSparseIndices1 = GlTFProperty;
/**
 * 指向包含偏离访问器值的缓冲区视图的对象。元素的数量等于“accessor.sparse.count”乘以组件的数量。这些元素具有与基本访问器相同的组件类型。元素紧密堆积。数据**必须**遵循与基本访问器相同的规则进行对齐。
 */
export type AccessorSparseValues = AccessorSparseValues1 & AccessorSparseValues2;
export type AccessorSparseValues1 = GlTFProperty;
/**
 * 关键帧动画。
 */
export type Animation = Animation1 & Animation2;
export type Animation1 = GlTFChildOfRootProperty1;
/**
 * 动画通道将动画采样器与正在动画化的目标属性组合在一起。
 */
export type AnimationChannel = AnimationChannel1 & AnimationChannel2;
export type AnimationChannel1 = GlTFProperty;
/**
 * 动画属性的描述符。
 */
export type AnimationChannelTarget = AnimationChannelTarget1 & AnimationChannelTarget2;
export type AnimationChannelTarget1 = GlTFProperty;
/**
 * 动画采样器将时间戳与输出值序列相结合，并定义插值算法。
 */
export type AnimationSampler = AnimationSampler1 & AnimationSampler2;
export type AnimationSampler1 = GlTFProperty;
/**
 * 有关 glTF 资产的元数据。
 */
export type Asset = Asset1 & Asset2;
export type Asset1 = GlTFProperty;
/**
 * 缓冲区指向二进制几何体、动画或皮肤。
 */
export type Buffer = Buffer1 & Buffer2;
export type Buffer1 = GlTFChildOfRootProperty1;
/**
 * 缓冲区的视图，通常表示缓冲区的子集。
 */
export type BufferView = BufferView1 & BufferView2;
export type BufferView1 = GlTFChildOfRootProperty1;
/**
 * 相机的投影。节点**可以**引用相机来应用变换以将相机放置在场景中。
 */
export type Camera = Camera1 & Camera2;
export type Camera1 = GlTFChildOfRootProperty1;
/**
 * 包含用于创建正交投影矩阵的属性的正交相机。
 */
export type CameraOrthographic = CameraOrthographic1 & CameraOrthographic2;
export type CameraOrthographic1 = GlTFProperty;
/**
 * 包含用于创建透视投影矩阵的属性的透视相机。
 */
export type CameraPerspective = CameraPerspective1 & CameraPerspective2;
export type CameraPerspective1 = GlTFProperty;
/**
 * 用于创建纹理的图像数据。图像**可以**由 URI（或 IRI）或缓冲区视图索引引用。
 */
export type Image = Image1 & Image2 & Image3;
export type Image1 = GlTFChildOfRootProperty1;
export type Image3 =
  | {
      [k: string]: unknown;
    }
  | {
      [k: string]: unknown;
    };
export type Image4 = Image1 & Image3;
/**
 * 原始体的物质外观。
 */
export type Material = Material1 & Material2;
export type Material1 = GlTFChildOfRootProperty1;
/**
 * 一组参数值，用于根据基于物理的渲染 (PBR) 方法定义金属粗糙度材料模型。
 */
export type MaterialPBRMetallicRoughness = MaterialPBRMetallicRoughness1 & MaterialPBRMetallicRoughness2;
export type MaterialPBRMetallicRoughness1 = GlTFProperty;
/**
 * 参考纹理。
 */
export type TextureInfo = TextureInfo1 & TextureInfo2;
export type TextureInfo1 = GlTFProperty;
export type MaterialNormalTextureInfo = MaterialNormalTextureInfo1 & MaterialNormalTextureInfo2;
export type MaterialNormalTextureInfo1 = TextureInfo1;
export type MaterialOcclusionTextureInfo = MaterialOcclusionTextureInfo1 & MaterialOcclusionTextureInfo2;
export type MaterialOcclusionTextureInfo1 = TextureInfo1;
/**
 * 一组要渲染的图元。它的全局变换由引用它的节点定义。
 */
export type Mesh = Mesh1 & Mesh2;
export type Mesh1 = GlTFChildOfRootProperty1;
/**
 * 使用给定材质渲染的几何图形。
 */
export type MeshPrimitive = MeshPrimitive1 & MeshPrimitive2;
export type MeshPrimitive1 = GlTFProperty;

/**
 * 节点层次结构中的一个节点。当节点包含“skin”时，所有“mesh.primitives”**必须**包含“JOINTS_0”和“WEIGHTS_0”属性。节点**可以**具有“矩阵”或“平移”/“旋转”/“缩放”(TRS) 属性的任意组合。 TRS属性转换为矩阵并按“T *R *S”顺序后乘以组成变换矩阵；首先缩放应用于顶点，然后旋转，然后平移。如果没有提供，则变换就是恒等式。当节点作为动画目标时（由animation.channel.target引用），“matrix”**不能**存在。
*/
export type Node = Node1 & Node2;
export type Node1 = GlTFChildOfRootProperty1;
/**
 * 用于过滤和环绕模式的纹理采样器属性。
 */
export type Sampler = Sampler1 & Sampler2;
export type Sampler1 = GlTFChildOfRootProperty1;
/**
 * 场景的根节点。
 */
export type Scene = Scene1 & Scene2;
export type Scene1 = GlTFChildOfRootProperty1;
/**
 * 定义皮肤的关节和基质。
 */
export type Skin = Skin1 & Skin2;
export type Skin1 = GlTFChildOfRootProperty1;
/**
 * 纹理及其采样器。
 */
export type Texture = Texture1 & Texture2;
export type Texture1 = GlTFChildOfRootProperty1;

export interface GlTFProperty {
  extensions?: Extension;
  extras?: Extras;
  [k: string]: unknown;
}
/**
 * 具有特定于扩展的对象的 JSON 对象。
 */
export interface Extension {
  [k: string]: {
    [k: string]: unknown;
  };
}
/**
 * 特定于应用程序的数据。
 */
export interface Extras {
  [k: string]: unknown;
}
export interface GlTF2 {
  /**
   * 此资产中使用的 glTF 扩展的名称。
   *
   * @minItems 1
   */
  extensionsUsed?: [string, ...string[]];
  /**
   * 正确加载此资源所需的 glTF 扩展名。
   *
   * @minItems 1
   */
  extensionsRequired?: [string, ...string[]];
  /**
   * 访问器数组。
   *
   * @minItems 1
   */
  accessors?: [Accessor, ...Accessor1[]];
  /**
   * 一系列关键帧动画。
   *
   * @minItems 1
   */
  animations?: [Animation, ...Animation1[]];
  /**
   * 有关 glTF 资产的元数据。
   */
  asset: Asset;
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
export interface GlTFChildOfRootProperty2 {
  /**
   * 该对象的用户定义名称。
   */
  name?: string;
  [k: string]: unknown;
}
export interface Accessor2 {
  /**
   * bufferView 的索引。
   */
  bufferView?: GlTFId;
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
  /**
   * 该访问器中每个组件的最大值。
   *
   * @minItems 1
   * @最大项目 16
   */
  max?:
    | [number]
    | [number, number]
    | [number, number, number]
    | [number, number, number, number]
    | [number, number, number, number, number]
    | [number, number, number, number, number, number]
    | [number, number, number, number, number, number, number]
    | [number, number, number, number, number, number, number, number]
    | [number, number, number, number, number, number, number, number, number]
    | [number, number, number, number, number, number, number, number, number, number]
    | [number, number, number, number, number, number, number, number, number, number, number]
    | [number, number, number, number, number, number, number, number, number, number, number, number]
    | [number, number, number, number, number, number, number, number, number, number, number, number, number]
    | [number, number, number, number, number, number, number, number, number, number, number, number, number, number]
    | [
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number
      ]
    | [
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number
      ];
  /**
   * 该访问器中每个组件的最小值。
   *
   * @minItems 1
   * @最大项目 16
   */
  min?:
    | [number]
    | [number, number]
    | [number, number, number]
    | [number, number, number, number]
    | [number, number, number, number, number]
    | [number, number, number, number, number, number]
    | [number, number, number, number, number, number, number]
    | [number, number, number, number, number, number, number, number]
    | [number, number, number, number, number, number, number, number, number]
    | [number, number, number, number, number, number, number, number, number, number]
    | [number, number, number, number, number, number, number, number, number, number, number]
    | [number, number, number, number, number, number, number, number, number, number, number, number]
    | [number, number, number, number, number, number, number, number, number, number, number, number, number]
    | [number, number, number, number, number, number, number, number, number, number, number, number, number, number]
    | [
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number
      ]
    | [
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number
      ];
  /**
   * 稀疏存储偏离其初始化值的元素。
   */
  sparse?: AccessorSparse;
  name?: unknown;
  extensions?: unknown;
  extras?: unknown;
  [k: string]: unknown;
}
export interface AccessorSparse2 {
  /**
   * 稀疏数组中存储的偏离访问器值的数量。
   */
  count: number;
  /**
   * 指向包含偏离访问器值的索引的缓冲区视图的对象。索引的数量等于“count”。指数**必须**严格上涨。
   */
  indices: AccessorSparseIndices;
  /**
   * 指向包含偏离访问器值的缓冲区视图的对象。
   */
  values: AccessorSparseValues;
  extensions?: unknown;
  extras?: unknown;
  [k: string]: unknown;
}
export interface AccessorSparseIndices2 {
  /**
   * 具有稀疏索引的缓冲区视图的索引。引用的缓冲区视图**不能**定义其“target”或“byteStride”属性。缓冲区视图和可选的“byteOffset”**必须**与“componentType”字节长度对齐。
   */
  bufferView: GlTFId;
  /**
   * 相对于缓冲区视图开头的偏移量（以字节为单位）。
   */
  byteOffset?: number;
  /**
   * 索引数据类型。
   */
  componentType: 5121 | 5123 | 5125 | number;
  extensions?: unknown;
  extras?: unknown;
  [k: string]: unknown;
}
export interface AccessorSparseValues2 {
  /**
   * 具有稀疏值的 bufferView 的索引。引用的缓冲区视图**不能**定义其“target”或“byteStride”属性。
   */
  bufferView: GlTFId;
  /**
   * 相对于 bufferView 开头的偏移量（以字节为单位）。
   */
  byteOffset?: number;
  extensions?: unknown;
  extras?: unknown;
  [k: string]: unknown;
}
export interface Animation2 {
  /**
   * 一系列动画频道。动画通道将动画采样器与正在动画化的目标属性组合在一起。同一动画的不同通道**不得**具有相同的目标。
   *
   * @minItems 1
   */
  channels: [AnimationChannel, ...AnimationChannel1[]];
  /**
   * 一系列动画采样器。动画采样器将时间戳与输出值序列相结合，并定义插值算法。
   *
   * @minItems 1
   */
  samplers: [AnimationSampler, ...AnimationSampler1[]];
  name?: unknown;
  extensions?: unknown;
  extras?: unknown;
  [k: string]: unknown;
}
export interface AnimationChannel2 {
  /**
   * 此动画中采样器的索引用于计算目标的值。
   */
  sampler: GlTFId;
  /**
   * 动画属性的描述符。
   */
  target: AnimationChannelTarget;
  extensions?: unknown;
  extras?: unknown;
  [k: string]: unknown;
}
export interface AnimationChannelTarget2 {
  /**
   * 要设置动画的节点的索引。当未定义时，动画对象**可以**由扩展定义。
   */
  node?: GlTFId;
  /**
   * 要设置动画的节点的 TRS 属性的名称，或其实例化的变形目标的“权重”。对于“translation”属性，采样器提供的值是沿 X、Y 和 Z 轴的平移。对于“rotation”属性，值是顺序为 (x, y, z, w) 的四元数，其中 w 是标量。对于“scale”属性，这些值是沿 X、Y 和 Z 轴的缩放因子。
   */
  path: "translation" | "rotation" | "scale" | "weights" | string;
  extensions?: unknown;
  extras?: unknown;
  [k: string]: unknown;
}
export interface AnimationSampler2 {
  /**
   * 包含关键帧时间戳的访问器的索引。
   */
  input: GlTFId;
  /**
   * 插值算法。
   */
  interpolation?: "LINEAR" | "STEP" | "CUBICSPLINE" | string;
  /**
   * 访问器的索引，包含关键帧输出值。
   */
  output: GlTFId;
  extensions?: unknown;
  extras?: unknown;
  [k: string]: unknown;
}
export interface Asset2 {
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
}
export interface Buffer2 {
  /**
   * 缓冲区的 URI（或 IRI）。
   */
  uri?: string;
  /**
   * 缓冲区的长度（以字节为单位）。
   */
  byteLength: number;
  name?: unknown;
  extensions?: unknown;
  extras?: unknown;
  [k: string]: unknown;
}
export interface BufferView2 {
  /**
   * 缓冲区的索引。
   */
  buffer: GlTFId;
  /**
   * 缓冲区中的偏移量（以字节为单位）。
   */
  byteOffset?: number;
  /**
   * bufferView 的长度（以字节为单位）。
   */
  byteLength: number;
  /**
   * 步幅，以字节为单位。
   */
  byteStride?: number;
  /**
   * 表示与此缓冲区视图一起使用的预期 GPU 缓冲区类型的提示。
   */
  target?: 34962 | 34963 | number;
  name?: unknown;
  extensions?: unknown;
  extras?: unknown;
  [k: string]: unknown;
}
export interface Camera2 {
  /**
   * 包含用于创建正交投影矩阵的属性的正交相机。当定义“perspective”时，**不得**定义该属性。
   */
  orthographic?: CameraOrthographic;
  /**
   * 包含用于创建透视投影矩阵的属性的透视相机。当定义“orthographic”时，**不得**定义该属性。
   */
  perspective?: CameraPerspective;
  /**
   * 指定相机是否使用透视投影或正交投影。
   */
  type: "perspective" | "orthographic" | string;
  name?: unknown;
  extensions?: unknown;
  extras?: unknown;
  [k: string]: unknown;
}
export interface CameraOrthographic2 {
  /**
   * 视图的浮点水平放大倍率。该值**不能**等于零。该值**不应**为负数。
   */
  xmag: number;
  /**
   * 视图的浮点垂直放大率。该值**不能**等于零。该值**不应**为负数。
   */
  ymag: number;
  /**
   * 到远裁剪平面的浮点距离。该值**不能**等于零。 `zfar` **必须**大于`znear`。
   */
  zfar: number;
  /**
   * 到近裁剪平面的浮点距离。
   */
  znear: number;
  extensions?: unknown;
  extras?: unknown;
  [k: string]: unknown;
}
export interface CameraPerspective2 {
  /**
   * 视野的浮点纵横比。
   */
  aspectRatio?: number;
  /**
   * 以弧度为单位的浮点垂直视野。该值**应该**小于 π。
   */
  yfov: number;
  /**
   * 到远裁剪平面的浮点距离。
   */
  zfar?: number;
  /**
   * 到近裁剪平面的浮点距离。
   */
  znear: number;
  extensions?: unknown;
  extras?: unknown;
  [k: string]: unknown;
}
export interface Image2 {
  /**
   * 图像的 URI（或 IRI）。
   */
  uri?: string;
  /**
   * 图像的媒体类型。该字段**必须**在定义 `bufferView` 时定义。
   */
  mimeType?: "image/jpeg" | "image/png" | string;
  /**
   * 包含图像的 bufferView 的索引。当定义“uri”时，**不得**定义该字段。
   */
  bufferView?: GlTFId;
  name?: unknown;
  extensions?: unknown;
  extras?: unknown;
  [k: string]: unknown;
}
export interface Material2 {
  name?: unknown;
  extensions?: unknown;
  extras?: unknown;
  /**
   * 一组参数值，用于根据基于物理的渲染 (PBR) 方法定义金属粗糙度材料模型。如果未定义，则“pbrMetallicRoughness”的所有默认值**必须**适用。
   */
  pbrMetallicRoughness?: MaterialPBRMetallicRoughness;
  /**
   * 切线空间法线纹理。
   */
  normalTexture?: MaterialNormalTextureInfo;
  /**
   * 遮挡纹理。
   */
  occlusionTexture?: MaterialOcclusionTextureInfo;
  /**
   * 发射纹理。
   */
  emissiveTexture?: TextureInfo1;
  /**
   * 材料发射颜色的因素。
   *
   * @minItems 3
   * @最大项目 3
   */
  emissiveFactor?: [number, number, number];
  /**
   * 材质的 Alpha 渲染模式。
   */
  alphaMode?: "OPAQUE" | "MASK" | "BLEND" | string;
  /**
   * 材料的 alpha 截止值。
   */
  alphaCutoff?: number;
  /**
   * 指定材质是否为双面。
   */
  doubleSided?: boolean;
  [k: string]: unknown;
}
export interface MaterialPBRMetallicRoughness2 {
  /**
   * 材料基色的因素。
   *
   * @minItems 4
   * @最大项目 4
   */
  baseColorFactor?: [number, number, number, number];
  /**
   * 底色纹理。
   */
  baseColorTexture?: TextureInfo;
  /**
   * 材料金属性的因素。
   */
  metallicFactor?: number;
  /**
   * 材料粗糙度的因素。
   */
  roughnessFactor?: number;
  /**
   * 金属粗糙度纹理。
   */
  metallicRoughnessTexture?: TextureInfo1;
  extensions?: unknown;
  extras?: unknown;
  [k: string]: unknown;
}
export interface TextureInfo2 {
  /**
   * 纹理的索引。
   */
  index: GlTFId;
  /**
   * 用于纹理坐标映射的纹理的 TEXCOORD 属性的集合索引。
   */
  texCoord?: number;
  extensions?: unknown;
  extras?: unknown;
  [k: string]: unknown;
}
export interface MaterialNormalTextureInfo2 {
  index?: unknown;
  texCoord?: unknown;
  /**
   * 应用于法线纹理的每个法线向量的标量参数。
   */
  scale?: number;
  extensions?: unknown;
  extras?: unknown;
  [k: string]: unknown;
}
export interface MaterialOcclusionTextureInfo2 {
  index?: unknown;
  texCoord?: unknown;
  /**
   * 控制所应用的遮挡量的标量乘数。
   */
  strength?: number;
  extensions?: unknown;
  extras?: unknown;
  [k: string]: unknown;
}
export interface Mesh2 {
  /**
   * 基元数组，每个基元定义要渲染的几何图形。
   *
   * @minItems 1
   */
  primitives: [MeshPrimitive, ...MeshPrimitive1[]];
  /**
   * 应用于变形目标的权重数组。数组元素的数量**必须**与变形目标的数量匹配。
   *
   * @minItems 1
   */
  weights?: [number, ...number[]];
  name?: unknown;
  extensions?: unknown;
  extras?: unknown;
  [k: string]: unknown;
}
export interface MeshPrimitive2 {
  /**
   * 一个普通的 JSON 对象，其中每个键对应于一个网格属性语义，每个值都是包含属性数据的访问器的索引。
   */
  attributes: {
    [k: string]: GlTFId;
  };
  /**
   * 包含顶点索引的访问器的索引。
   */
  indices?: GlTFId;
  /**
   * 渲染时应用于此图元的材质索引。
   */
  material?: GlTFId;
  /**
   * 要渲染的图元的拓扑类型。
   */
  mode?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | number;
  /**
   * 一系列变形目标。
   *
   * @minItems 1
   */
  targets?: [
    {
      [k: string]: GlTFId;
    },
    ...{
      [k: string]: GlTFId;
    }[]
  ];
  extensions?: unknown;
  extras?: unknown;
  [k: string]: unknown;
}
export interface Node2 {
  /**
   * 该节点引用的相机的索引。
   */
  camera?: GlTFId;
  /**
   * 该节点的子节点的索引。
   *
   * @minItems 1
   */
  children?: [GlTFId, ...GlTFId[]];
  /**
   * 该节点引用的皮肤的索引。
   */
  skin?: GlTFId;
  /**
   * 以列优先顺序存储的浮点 4x4 变换矩阵。
   *
   * @minItems 16
   * @最大项目 16
   */
  matrix?: [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number
  ];
  /**
   * 该节点中网格的索引。
   */
  mesh?: GlTFId;
  /**
   * 节点的单位四元数旋转顺序为 (x, y, z, w)，其中 w 是标量。
   *
   * @minItems 4
   * @最大项目 4
   */
  rotation?: [number, number, number, number];
  /**
   * 节点的非均匀缩放，以沿 x、y 和 z 轴的缩放因子给出。
   *
   * @minItems 3
   * @最大项目 3
   */
  scale?: [number, number, number];
  /**
   * 节点沿 x、y 和 z 轴的平移。
   *
   * @minItems 3
   * @最大项目 3
   */
  translation?: [number, number, number];
  /**
   * 实例化变形目标的权重。数组元素的数量**必须**与引用网格的变形目标的数量匹配。定义后，`mesh` **也必须**被定义。
   *
   * @minItems 1
   */
  weights?: [number, ...number[]];
  name?: unknown;
  extensions?: unknown;
  extras?: unknown;
  [k: string]: unknown;
}
export interface Sampler2 {
  /**
   * 放大滤镜。
   */
  magFilter?: 9728 | 9729 | number;
  /**
   * 缩小过滤器。
   */
  minFilter?: 9728 | 9729 | 9984 | 9985 | 9986 | 9987 | number;
  /**
   * S（U）缠绕模式。
   */
  wrapS?: 33071 | 33648 | 10497 | number;
  /**
   * T(V) 缠绕模式。
   */
  wrapT?: 33071 | 33648 | 10497 | number;
  name?: unknown;
  extensions?: unknown;
  extras?: unknown;
  [k: string]: unknown;
}
export interface Scene2 {
  /**
   * 每个根节点的索引。
   *
   * @minItems 1
   */
  nodes?: [GlTFId, ...GlTFId[]];
  name?: unknown;
  extensions?: unknown;
  extras?: unknown;
  [k: string]: unknown;
}
export interface Skin2 {
  /**
   * 包含浮点 4x4 逆绑定矩阵的访问器的索引。
   */
  inverseBindMatrices?: GlTFId;
  /**
   * 用作骨架根的节点的索引。
   */
  skeleton?: GlTFId;
  /**
   * 骨骼节点的索引，用作该皮肤中的关节。
   *
   * @minItems 1
   */
  joints: [GlTFId, ...GlTFId[]];
  name?: unknown;
  extensions?: unknown;
  extras?: unknown;
  [k: string]: unknown;
}
export interface Texture2 {
  /**
   * 该纹理使用的采样器的索引。当未定义时，**应该**使用具有重复包装和自动过滤功能的采样器。
   */
  sampler?: GlTFId;
  /**
   * 该纹理使用的图像的索引。当未定义时，扩展或其他机制**应该**提供备用纹理源，否则行为未定义。
   */
  source?: GlTFId;
  name?: unknown;
  extensions?: unknown;
  extras?: unknown;
  [k: string]: unknown;
}
