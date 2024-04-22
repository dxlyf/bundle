/* @license
 * Copyright 2019 Google LLC. All Rights Reserved.
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
import {ACESFilmicToneMapping, AgXToneMapping, NeutralToneMapping, Texture} from 'three';

import  {$needsRender, $progressTracker, $renderer, $scene, $shouldAttemptPreload} from '../model-viewer-base.js';
import {clamp, Constructor, deserializeUrl} from '../utilities.js';

export const BASE_OPACITY = 0.5;
const DEFAULT_SHADOW_INTENSITY = 0.0;
const DEFAULT_SHADOW_SOFTNESS = 1.0;
const DEFAULT_EXPOSURE = 1.0;

export type ToneMappingValue = 'auto'|'aces'|'agx'|'commerce'|'neutral';

export const $currentEnvironmentMap = Symbol('currentEnvironmentMap');
export const $currentBackground = Symbol('currentBackground');
export const $updateEnvironment = Symbol('updateEnvironment');
const $cancelEnvironmentUpdate = Symbol('cancelEnvironmentUpdate');

export declare interface EnvironmentInterface {
  environmentImage: string|null;
  skyboxImage: string|null;
  skyboxHeight: string;
  shadowIntensity: number;
  shadowSoftness: number;
  exposure: number;
  hasBakedShadow(): boolean;
}
