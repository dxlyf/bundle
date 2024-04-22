/* @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {property} from 'lit/decorators.js';
import {CanvasTexture, RepeatWrapping, SRGBColorSpace, Texture, VideoTexture} from 'three';
import {GLTFExporter, GLTFExporterOptions} from 'three/examples/jsm/exporters/GLTFExporter.js';

import {$needsRender, $onModelLoad, $progressTracker, $renderer, $scene} from '../model-viewer-base.js';
import {GLTF} from '../gltf-defaulted.js';
import {ModelViewerGLTFInstance} from '../ModelViewerGLTFInstance.js';
import GLTFExporterMaterialsVariantsExtension from '../VariantMaterialExporterPlugin.js';
import {Constructor} from '../utilities.js';

import {Image, PBRMetallicRoughness, Sampler, TextureInfo} from '../scene-graph/api.js';
import {Material} from '../scene-graph/material.js';
import {$availableVariants, $materialFromPoint, $prepareVariantsForExport, $switchVariant, Model} from '../scene-graph/model.js';
import {Texture as ModelViewerTexture} from '../scene-graph/texture.js';



export const $currentGLTF = Symbol('currentGLTF');
export const $originalGltfJson = Symbol('originalGltfJson');
export const $model = Symbol('model');
const $getOnUpdateMethod = Symbol('getOnUpdateMethod');
const $buildTexture = Symbol('buildTexture');

interface SceneExportOptions {
  binary?: boolean, trs?: boolean, onlyVisible?: boolean,
      maxTextureSize?: number, includeCustomExtensions?: boolean,
      forceIndices?: boolean
}

export interface SceneGraphInterface {
  readonly model?: Model;
  variantName: string|null;
  readonly availableVariants: string[];
  orientation: string;
  scale: string;
  readonly originalGltfJson: GLTF|null;
  exportScene(options?: SceneExportOptions): Promise<Blob>;
  createTexture(uri: string, type?: string): Promise<ModelViewerTexture|null>;
  createLottieTexture(uri: string, quality?: number):
      Promise<ModelViewerTexture|null>;
  createVideoTexture(uri: string): ModelViewerTexture;
  createCanvasTexture(): ModelViewerTexture;
  /**
   * Intersects a ray with the scene and returns a list of materials who's
   * objects were intersected.
   * @param pixelX X coordinate of the mouse.
   * @param pixelY Y coordinate of the mouse.
   * @returns a material, if no intersection is made then null is returned.
   */
  materialFromPoint(pixelX: number, pixelY: number): Material|null;
}

