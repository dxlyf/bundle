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



import {Camera as ThreeCamera, Event as ThreeEvent, Vector2, Vector3, WebGLRenderer} from 'three';

import {ModelScene} from './ModelScene.js';

export const blobCanvas = document.createElement('canvas');


export const $updateSize = Symbol('updateSize');
export const $intersectionObserver = Symbol('intersectionObserver');
export const $isElementInViewport = Symbol('isElementInViewport');
export const $announceModelVisibility = Symbol('announceModelVisibility');
export const $ariaLabel = Symbol('ariaLabel');
export const $altDefaulted = Symbol('altDefaulted');
export const $statusElement = Symbol('statusElement');
export const $updateStatus = Symbol('updateStatus');
export const $loadedTime = Symbol('loadedTime');
export const $updateSource = Symbol('updateSource');
export const $markLoaded = Symbol('markLoaded');
export const $container = Symbol('container');
export const $userInputElement = Symbol('input');
export const $canvas = Symbol('canvas');
export const $scene = Symbol('scene');
export const $needsRender = Symbol('needsRender');
export const $tick = Symbol('tick');
export const $onModelLoad = Symbol('onModelLoad');
export const $onResize = Symbol('onResize');
export const $renderer = Symbol('renderer');
export const $progressTracker = Symbol('progressTracker');
export const $getLoaded = Symbol('getLoaded');
export const $getModelIsVisible = Symbol('getModelIsVisible');
export const $shouldAttemptPreload = Symbol('shouldAttemptPreload');

export interface Vector3D {
  x: number
  y: number
  z: number
  toString(): string
}

export const toVector3D = (v: Vector3) => {
  return {
    x: v.x,
    y: v.y,
    z: v.z,
    toString() {
      return `${this.x}m ${this.y}m ${this.z}m`;
    }
  };
};

export interface Vector2D {
  u: number
  v: number
  toString(): string
}

export const toVector2D = (v: Vector2) => {
  return {
    u: v.x,
    v: v.y,
    toString() {
      return `${this.u} ${this.v}`;
    }
  };
};

interface ToBlobOptions {
  mimeType?: string, qualityArgument?: number, idealAspect?: boolean
}

export interface FramingInfo {
  framedRadius: number;
  fieldOfViewAspect: number;
}

export interface Camera {
  viewMatrix: Array<number>;
  projectionMatrix: Array<number>;
}

export interface EffectComposerInterface {
  setRenderer(renderer: WebGLRenderer): void;
  setMainScene(scene: ModelScene): void;
  setMainCamera(camera: ThreeCamera): void;
  setSize(width: number, height: number): void;
  beforeRender(time: DOMHighResTimeStamp, delta: DOMHighResTimeStamp): void;
  render(deltaTime?: DOMHighResTimeStamp): void;
}

export interface RendererInterface {
  load(progressCallback: (progress: number) => void): Promise<FramingInfo>;
  render(camera: Camera): void;
  resize(width: number, height: number): void;
}

