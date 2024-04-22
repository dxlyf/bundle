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


import {Vector3} from 'three';

import  { $scene, Vector3D} from '../model-viewer-base.js';
import {degreesToRadians, normalizeUnit} from '../styles/conversions.js';
import {EvaluatedStyle, Intrinsics, SphericalIntrinsics, StyleEvaluator, Vector3Intrinsics} from '../styles/evaluators.js';
import {IdentNode, NumberNode, numberNode, parseExpressions} from '../styles/parsers.js';
import {DECAY_MILLISECONDS} from '../three-components/Damper.js';
import {ChangeSource, PointerChangeEvent, SmoothControls} from '../SmoothControls.js';
import {Constructor} from '../utilities.js';
import {Path, timeline, TimingFunction} from '../utilities/animation.js';



// NOTE(cdata): The following "animation" timing functions are deliberately
// being used in favor of CSS animations. In Safari 12.1 and 13, CSS animations
// would cause the interaction prompt to glitch unexpectedly
// @see https://github.com/google/model-viewer/issues/839
const PROMPT_ANIMATION_TIME = 5000;

// For timing purposes, a "frame" is a timing agnostic relative unit of time
// and a "value" is a target value for the Frame.
const wiggle = timeline({
  initialValue: 0,
  keyframes: [
    {frames: 5, value: -1},
    {frames: 1, value: -1},
    {frames: 8, value: 1},
    {frames: 1, value: 1},
    {frames: 5, value: 0},
    {frames: 18, value: 0}
  ]
});

const fade = timeline({
  initialValue: 0,
  keyframes: [
    {frames: 1, value: 1},
    {frames: 5, value: 1},
    {frames: 1, value: 0},
    {frames: 6, value: 0}
  ]
});

export const DEFAULT_FOV_DEG = 30;
export const DEFAULT_MIN_FOV_DEG = 12;

export const DEFAULT_CAMERA_ORBIT = '0deg 75deg 105%';
const DEFAULT_CAMERA_TARGET = 'auto auto auto';
const DEFAULT_FIELD_OF_VIEW = 'auto';

const MINIMUM_RADIUS_RATIO = 2.2;

const AZIMUTHAL_QUADRANT_LABELS = ['front', 'right', 'back', 'left'];
const POLAR_TRIENT_LABELS = ['upper-', '', 'lower-'];

export const DEFAULT_INTERACTION_PROMPT_THRESHOLD = 3000;
export const INTERACTION_PROMPT = '. Use mouse, touch or arrow keys to move.';

export interface CameraChangeDetails {
  source: ChangeSource;
}

export interface SphericalPosition {
  theta: number;  // equator angle around the y (up) axis.
  phi: number;    // polar angle from the y (up) axis.
  radius: number;
  toString(): string;
}

export interface Finger {
  x: Path;
  y: Path;
}

export interface A11yTranslationsInterface {
  left: string;
  right: string;
  front: string;
  back: string;
  'upper-left': string;
  'upper-right': string;
  'upper-front': string;
  'upper-back': string;
  'lower-left': string;
  'lower-right': string;
  'lower-front': string;
  'lower-back': string;
  'interaction-prompt': string;
}

export type InteractionPromptStrategy = 'auto'|'none';
export type InteractionPromptStyle = 'basic'|'wiggle';
export type TouchAction = 'pan-y'|'pan-x'|'none';

export const InteractionPromptStrategy:
    {[index: string]: InteractionPromptStrategy} = {
      AUTO: 'auto',
      NONE: 'none'
    };

export const InteractionPromptStyle:
    {[index: string]: InteractionPromptStyle} = {
      BASIC: 'basic',
      WIGGLE: 'wiggle'
    };

export const TouchAction: {[index: string]: TouchAction} = {
  PAN_Y: 'pan-y',
  PAN_X: 'pan-x',
  NONE: 'none'
};

export const fieldOfViewIntrinsics = () => {
  return {
    basis:
        [degreesToRadians(numberNode(DEFAULT_FOV_DEG, 'deg')) as
         NumberNode<'rad'>],
    keywords: {auto: [null]}
  };
};

const minFieldOfViewIntrinsics = () => {
  return {
    basis:
        [degreesToRadians(numberNode(DEFAULT_MIN_FOV_DEG, 'deg')) as
         NumberNode<'rad'>],
    keywords: {auto: [null]}
  };
};

export const cameraOrbitIntrinsics = (() => {
  const defaultTerms =
      parseExpressions(DEFAULT_CAMERA_ORBIT)[0]
          .terms as [NumberNode<'rad'>, NumberNode<'rad'>, IdentNode];

  const theta = normalizeUnit(defaultTerms[0]) as NumberNode<'rad'>;
  const phi = normalizeUnit(defaultTerms[1]) as NumberNode<'rad'>;

  return (element: ModelViewerElementBase) => {
    const radius = element[$scene].idealCameraDistance();

    return {
      basis: [theta, phi, numberNode(radius, 'm')],
      keywords: {auto: [null, null, numberNode(105, '%')]}
    };
  };
})();

const minCameraOrbitIntrinsics = (element: ModelViewerElementBase&
                                  ControlsInterface) => {
  const radius = MINIMUM_RADIUS_RATIO * element[$scene].boundingSphere.radius;

  return {
    basis: [
      numberNode(-Infinity, 'rad'),
      numberNode(Math.PI / 8, 'rad'),
      numberNode(radius, 'm')
    ],
    keywords: {auto: [null, null, null]}
  };
};

const maxCameraOrbitIntrinsics = (element: ModelViewerElementBase) => {
  const orbitIntrinsics = cameraOrbitIntrinsics(element);
  const evaluator = new StyleEvaluator([], orbitIntrinsics);
  const defaultRadius = evaluator.evaluate()[2];

  return {
    basis: [
      numberNode(Infinity, 'rad'),
      numberNode(Math.PI - Math.PI / 8, 'rad'),
      numberNode(defaultRadius, 'm')
    ],
    keywords: {auto: [null, null, null]}
  };
};

export const cameraTargetIntrinsics = (element: ModelViewerElementBase) => {
  const center = element[$scene].boundingBox.getCenter(new Vector3());

  return {
    basis: [
      numberNode(center.x, 'm'),
      numberNode(center.y, 'm'),
      numberNode(center.z, 'm')
    ],
    keywords: {auto: [null, null, null]}
  };
};

const HALF_PI = Math.PI / 2.0;
const THIRD_PI = Math.PI / 3.0;
const QUARTER_PI = HALF_PI / 2.0;
const TAU = 2.0 * Math.PI;

export const $controls = Symbol('controls');
export const $panElement = Symbol('panElement');
export const $promptElement = Symbol('promptElement');
export const $promptAnimatedContainer = Symbol('promptAnimatedContainer');
export const $fingerAnimatedContainers = Symbol('fingerAnimatedContainers');

const $deferInteractionPrompt = Symbol('deferInteractionPrompt');
const $updateAria = Symbol('updateAria');
const $a11y = Symbol('a11y');
const $updateA11y = Symbol('updateA11y');
const $updateCameraForRadius = Symbol('updateCameraForRadius');

const $cancelPrompts = Symbol('cancelPrompts');
const $onChange = Symbol('onChange');
const $onPointerChange = Symbol('onPointerChange');

const $waitingToPromptUser = Symbol('waitingToPromptUser');
const $userHasInteracted = Symbol('userHasInteracted');
const $promptElementVisibleTime = Symbol('promptElementVisibleTime');
const $lastPromptOffset = Symbol('lastPromptOffset');
const $cancellationSource = Symbol('cancellationSource');

const $lastSpherical = Symbol('lastSpherical');
const $jumpCamera = Symbol('jumpCamera');
const $initialized = Symbol('initialized');
const $maintainThetaPhi = Symbol('maintainThetaPhi');

const $syncCameraOrbit = Symbol('syncCameraOrbit');
const $syncFieldOfView = Symbol('syncFieldOfView');
const $syncCameraTarget = Symbol('syncCameraTarget');

const $syncMinCameraOrbit = Symbol('syncMinCameraOrbit');
const $syncMaxCameraOrbit = Symbol('syncMaxCameraOrbit');
const $syncMinFieldOfView = Symbol('syncMinFieldOfView');
const $syncMaxFieldOfView = Symbol('syncMaxFieldOfView');

export declare interface ControlsInterface {
  cameraControls: boolean;
  cameraOrbit: string;
  cameraTarget: string;
  fieldOfView: string;
  minCameraOrbit: string;
  maxCameraOrbit: string;
  minFieldOfView: string;
  maxFieldOfView: string;
  interactionPrompt: InteractionPromptStrategy;
  interactionPromptStyle: InteractionPromptStyle;
  interactionPromptThreshold: number;
  orbitSensitivity: number;
  zoomSensitivity: number;
  panSensitivity: number;
  touchAction: TouchAction;
  interpolationDecay: number;
  disableZoom: boolean;
  disablePan: boolean;
  disableTap: boolean;
  a11y: A11yTranslationsInterface | string | null;
  getCameraOrbit(): SphericalPosition;
  getCameraTarget(): Vector3D;
  getFieldOfView(): number;
  getMinimumFieldOfView(): number;
  getMaximumFieldOfView(): number;
  getIdealAspect(): number;
  jumpCameraToGoal(): void;
  updateFraming(): Promise<void>;
  resetInteractionPrompt(): void;
  zoom(keyPresses: number): void;
  interact(duration: number, finger0: Finger, finger1?: Finger): void;
  inputSensitivity: number;
}

