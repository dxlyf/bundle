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
import {Vector3} from 'three';

import  {$altDefaulted, $announceModelVisibility, $getModelIsVisible, $isElementInViewport, $progressTracker, $scene, $shouldAttemptPreload, $updateSource, $userInputElement, toVector3D, Vector3D} from '../model-viewer-base.js';
import {$loader, CachingGLTFLoader} from '../CachingGLTFLoader.js';
import {Renderer} from '../Renderer.js';
import {Constructor, throttle} from '../utilities.js';

export type RevealAttributeValue = 'auto'|'manual';
export type LoadingAttributeValue = 'auto'|'lazy'|'eager';

export const PROGRESS_BAR_UPDATE_THRESHOLD = 100;

const DEFAULT_DRACO_DECODER_LOCATION =
    'https://www.gstatic.com/draco/versioned/decoders/1.5.6/';

const DEFAULT_KTX2_TRANSCODER_LOCATION =
    'https://www.gstatic.com/basis-universal/versioned/2021-04-15-ba1c3e4/';

const DEFAULT_LOTTIE_LOADER_LOCATION =
    'https://cdn.jsdelivr.net/npm/three@0.149.0/examples/jsm/loaders/LottieLoader.js';

const RevealStrategy: {[index: string]: RevealAttributeValue} = {
  AUTO: 'auto',
  MANUAL: 'manual'
};

const LoadingStrategy: {[index: string]: LoadingAttributeValue} = {
  AUTO: 'auto',
  LAZY: 'lazy',
  EAGER: 'eager'
};

export const $defaultProgressBarElement = Symbol('defaultProgressBarElement');

export const $posterContainerElement = Symbol('posterContainerElement');
export const $defaultPosterElement = Symbol('defaultPosterElement');

const $shouldDismissPoster = Symbol('shouldDismissPoster');
const $hidePoster = Symbol('hidePoster');
const $modelIsRevealed = Symbol('modelIsRevealed');
const $updateProgressBar = Symbol('updateProgressBar');

const $ariaLabelCallToAction = Symbol('ariaLabelCallToAction');

const $onProgress = Symbol('onProgress');

export declare interface LoadingInterface {
  poster: string|null;
  reveal: RevealAttributeValue;
  loading: LoadingAttributeValue;
  readonly loaded: boolean;
  readonly modelIsVisible: boolean;
  dismissPoster(): void;
  showPoster(): void;
  getDimensions(): Vector3D;
  getBoundingBoxCenter(): Vector3D;
}

export declare interface LoadingStaticInterface {
  dracoDecoderLocation: string;
  ktx2TranscoderLocation: string;
  meshoptDecoderLocation: string;
  lottieLoaderLocation: string;
  mapURLs(callback: (url: string) => string): void;
}

export interface ModelViewerGlobalConfig {
  dracoDecoderLocation?: string;
  ktx2TranscoderLocation?: string;
  meshoptDecoderLocation?: string;
  lottieLoaderLocation?: string;
  powerPreference?: string;
}
