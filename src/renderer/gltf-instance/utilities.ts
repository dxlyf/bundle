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

import {GLTF, GLTFElement, GLTFElementMap} from './gltf-2.0.js';
import {EventDispatcher} from 'three';

import {HAS_WEBXR_DEVICE_API, HAS_WEBXR_HIT_TEST_API, IS_WEBXR_AR_CANDIDATE} from './constants.js';

/**
 * A VisitorCallback is used to access an element of a GLTF scene graph. The
 * callback receives a reference to the element, the element's index relative
 * to other elements of its type (as it would appear in the top-level element
 * array in the corresponding GLTF) and a hierarchy array that is the list of
 * ancestor elements (inclusive of the current element) that preceded the
 * currently accessed element in the GLTF scene graph hierarchy.
 */
export type VisitorCallback<T extends GLTFElement> =
    (element: T, index: number, hierarchy: GLTFElement[]) => void;

/**
 * There is a corresponding VisitorCallback type for every type of GLTFElement.
 */
export type VisitorCallbacks = {
  [T in keyof GLTFElementMap]?: VisitorCallback<GLTFElementMap[T]>;
}

/**
 * Supported options for configuring a GLTFTreeVisitor include:
 *  - allScenes: if true, all scenes (not just the active one) will be visited
 *  - sparse: if true, elements that have been visited once will not be visited
 *    again if and when they are encountered a second time in the scene graph
 *
 * Note that glTF defines a top-level field ("scene") that refers to the scene
 * that will be presented first ("at load time"). In the case of <model-viewer>,
 * there is no way to specify an alternative scene to display (although we plan
 * to add configuration for this). Consequently, the ability to traverse all
 * scenes is not likely to be used at this time. However, some cases will call
 * for visiting all nodes in a glTF regardless of whether they are a part of
 * the current scene. Eventually, <model-viewer> will support changing the
 * active scene, and the ability to traverse all scenes at once will become
 * handy.
 *
 * @see https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#scenes
 * @see https://github.com/google/model-viewer/issues/195
 */
export interface VisitOptions {
  allScenes?: boolean;
  sparse?: boolean;
}

interface VisitorTraversalState {
  hierarchy: GLTFElement[];
  visited: Set<GLTFElement>;
  sparse: boolean;
  gltf: GLTF;
}

const $callbacks = Symbol('callbacks');
const $visitMesh = Symbol('visitMesh');
const $visitElement = Symbol('visitElement');
const $visitNode = Symbol('visitNode');
const $visitScene = Symbol('visitScene');
const $visitMaterial = Symbol('visitMaterial');

/**
 * GLTFTreeVisitor implements a deterministic traversal order of a valid,
 * deserialized glTF 2.0 model. It supports selective element visitation via
 * callbacks configured based on element type. For example, to visit all
 * materials in all scenes in a glTF:
 *
 * ```javascript
 * const visitor = new GLTFTreeVisitor({
 *   material: (material, index, hierarchy) => {
 *     // material is a glTF 2.0 Material
 *     // index is the index of material in gltf.materials
 *     // hierarchy includes ancestors of material in the glTF
 *   }
 * });
 *
 * visitor.visit(someInMemoryGLTF, { allScenes: true });
 * ```
 *
 * The traversal order of the visitor is pre-order, depth-first.
 *
 * Note that the traversal order is not guaranteed to correspond to the
 * index of a given element in any way. Rather, traversal order is based
 * on the hierarchical order of the scene graph.
 */
export class GLTFTreeVisitor {
  private[$callbacks]: VisitorCallbacks;

  constructor(callbacks: VisitorCallbacks) {
    this[$callbacks] = callbacks;
  }

  /**
   * Visit a given in-memory glTF via the configured callbacks of this visitor.
   * Optionally, all scenes may be visited (as opposed to just the active one).
   * Sparse traversal can also be specified, in which case elements that
   * re-appear multiple times in the scene graph will only be visited once.
   */
  visit(gltf: GLTF, options: VisitOptions = {}): void {
    const allScenes = !!options.allScenes;
    const sparse = !!options.sparse;
    const scenes = allScenes ?
        gltf.scenes || [] :
        (gltf.scenes && gltf.scene != null) ? [gltf.scenes[gltf.scene]] : [];

    const state: VisitorTraversalState =
        {hierarchy: [], visited: new Set(), sparse, gltf};

    for (const scene of scenes) {
      this[$visitScene](gltf.scenes!.indexOf(scene), state);
    }
  }

  private[$visitElement]<T extends GLTFElement>(
      index: number, elementList: T[]|undefined, state: VisitorTraversalState,
      visit?: VisitorCallback<T>, traverse?: (element: T) => void) {
    if (elementList == null) {
      return;
    }

    const element = elementList[index];
    const {sparse, hierarchy, visited} = state;

    if (element == null) {
      return;
    }

    if (sparse && visited.has(element)) {
      return;
    }

    visited.add(element);
    hierarchy.push(element);

    if (visit != null) {
      visit(element, index, hierarchy);
    }

    if (traverse != null) {
      traverse(element);
    }

    hierarchy.pop();
  }

  private[$visitScene](index: number, state: VisitorTraversalState) {
    const {gltf} = state;
    const {scene: visit} = this[$callbacks];

    this[$visitElement](index, gltf.scenes, state, visit, (scene) => {
      // A scene is not required to have a list of nodes
      if (scene.nodes == null) {
        return;
      }

      for (const nodeIndex of scene.nodes) {
        this[$visitNode](nodeIndex, state);
      }
    });
  }

  private[$visitNode](index: number, state: VisitorTraversalState) {
    const {gltf} = state;
    const {node: visit} = this[$callbacks];
    this[$visitElement](index, gltf.nodes, state, visit, (node) => {
      if (node.mesh != null) {
        this[$visitMesh](node.mesh, state);
      }

      if (node.children != null) {
        for (const childNodeIndex of node.children) {
          this[$visitNode](childNodeIndex, state);
        }
      }
    });
  }

  private[$visitMesh](index: number, state: VisitorTraversalState) {
    const {gltf} = state;
    const {mesh: visit} = this[$callbacks];

    this[$visitElement](index, gltf.meshes, state, visit, (mesh) => {
      for (const primitive of mesh.primitives) {
        if (primitive.material != null) {
          this[$visitMaterial](primitive.material, state);
        }
      }
    });
  }

  private[$visitMaterial](index: number, state: VisitorTraversalState) {
    const {gltf} = state;
    const {material: visit} = this[$callbacks];
    this[$visitElement](index, gltf.materials, state, visit);
  }
}



export type Constructor<T = object, U = object> = {
  new (...args: any[]): T,
  prototype: T
}&U;

export const deserializeUrl = (url: string|null): string|null =>
    (!!url && url !== 'null') ? toFullUrl(url) : null;


export const assertIsArCandidate = () => {
  if (IS_WEBXR_AR_CANDIDATE) {
    return;
  }

  const missingApis = [];

  if (!HAS_WEBXR_DEVICE_API) {
    missingApis.push('WebXR Device API');
  }

  if (!HAS_WEBXR_HIT_TEST_API) {
    missingApis.push('WebXR Hit Test API');
  }

  throw new Error(
      `The following APIs are required for AR, but are missing in this browser: ${
          missingApis.join(', ')}`);
};


/**
 * Converts a partial URL string to a fully qualified URL string.
 *
 * @param {String} url
 * @return {String}
 */
export const toFullUrl = (partialUrl: string): string => {
  const url = new URL(partialUrl, window.location.toString());
  return url.toString();
};


/**
 * Returns a throttled version of a given function that is only invoked at most
 * once within a given threshold of time in milliseconds.
 *
 * The throttled version of the function has a "flush" property that resets the
 * threshold for cases when immediate invocation is desired.
 */
export const throttle = (fn: (...args: Array<any>) => any, ms: number) => {
  let timer: number|null = null;

  const throttled = (...args: Array<any>) => {
    if (timer != null) {
      return;
    }

    fn(...args);

    timer = self.setTimeout(() => timer = null, ms);
  };

  throttled.flush = () => {
    if (timer != null) {
      self.clearTimeout(timer);
      timer = null;
    }
  };

  return throttled;
};

export const debounce = (fn: (...args: Array<any>) => any, ms: number) => {
  let timer: number|null = null;

  return (...args: Array<any>) => {
    if (timer != null) {
      self.clearTimeout(timer);
    }

    timer = self.setTimeout(() => {
      timer = null;
      fn(...args);
    }, ms);
  };
};


/**
 * @param {Number} edge
 * @param {Number} value
 * @return {Number} 0 if value is less than edge, otherwise 1
 */
export const step = (edge: number, value: number): number => {
  return value < edge ? 0 : 1;
};


/**
 * @param {Number} value
 * @param {Number} lowerLimit
 * @param {Number} upperLimit
 * @return {Number} value clamped within lowerLimit..upperLimit
 */
export const clamp =
    (value: number, lowerLimit: number, upperLimit: number): number =>
        Math.max(lowerLimit, Math.min(upperLimit, value));


// The DPR we use for a "capped" scenario (see resolveDpr below):
export const CAPPED_DEVICE_PIXEL_RATIO = 1;


/**
 * This helper analyzes the layout of the current page to decide if we should
 * use the natural device pixel ratio, or a capped value.
 *
 * We cap DPR if there is no meta viewport (suggesting that user is not
 * consciously specifying how to scale the viewport relative to the device
 * screen size).
 *
 * The rationale is that this condition typically leads to a pathological
 * outcome on mobile devices. When the window dimensions are scaled up on a
 * device with a high DPR, we create a canvas that is much larger than
 * appropriate to accommodate for the pixel density if we naively use the
 * reported DPR.
 *
 * This value needs to be measured in real time, as device pixel ratio can
 * change over time (e.g., when a user zooms the page). Also, in some cases
 * (such as Firefox on Android), the window's innerWidth is initially reported
 * as the same as the screen's availWidth but changes later.
 *
 * A user who specifies a meta viewport, thereby consciously creating scaling
 * conditions where <model-viewer> is slow, will be encouraged to live their
 * best life.
 */
export const resolveDpr: () => number = (() => {
  // If true, implies that the user is conscious of the viewport scaling
  // relative to the device screen size.
  const HAS_META_VIEWPORT_TAG = (() => {
    // Search result pages sometimes do not include a meta viewport tag even
    // though they are certainly modern and work properly with devicePixelRatio.
    if (document.documentElement.getAttribute('itemtype')
            ?.includes('schema.org/SearchResultsPage')) {
      return true;
    }

    if (window.self !== window.top) {
      // iframes can't detect the meta viewport tag, so assume the top-level
      // page has one.
      return true;
    }

    const metas = document.head != null ?
        Array.from(document.head.querySelectorAll('meta')) :
        [];

    for (const meta of metas) {
      if (meta.name === 'viewport') {
        return true;
      }
    }

    return false;
  })();

  if (!HAS_META_VIEWPORT_TAG) {
    console.warn(
        'No <meta name="viewport"> detected; <model-viewer> will cap pixel density at 1.');
  }

  return () => HAS_META_VIEWPORT_TAG ? window.devicePixelRatio :
                                       CAPPED_DEVICE_PIXEL_RATIO;
})();


/**
 * Debug mode is enabled when one of the two following conditions is true:
 *
 *  1. A 'model-viewer-debug-mode' query parameter is present in the current
 *     search string
 *  2. There is a global object ModelViewerElement with a debugMode property set
 *     to true
 */
export const isDebugMode = (() => {
  const debugQueryParameterName = 'model-viewer-debug-mode';
  const debugQueryParameter = new RegExp(`[?&]${debugQueryParameterName}(&|$)`);

  return () => ((self as any).ModelViewerElement &&
                (self as any).ModelViewerElement.debugMode) ||
      (self.location && self.location.search &&
       self.location.search.match(debugQueryParameter));
})();


/**
 * Three.js EventDispatcher and DOM EventTarget use different event patterns,
 * so AnyEvent covers the shape of both event types.
 */
export type AnyEvent = Event|CustomEvent<any>|{[index: string]: string};

export type PredicateFunction<T = void> = (value: T) => boolean;

export const timePasses = (ms: number = 0): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, ms));

/**
 * @param {EventTarget|EventDispatcher} target
 * @param {string} eventName
 * @param {?Function} predicate
 */
export const waitForEvent = <T extends AnyEvent = Event>(
    target: EventTarget|EventDispatcher,
    eventName: string,
    predicate: PredicateFunction<T>|null = null): Promise<T> =>
    new Promise(resolve => {
      function handler(event: AnyEvent) {
        if (!predicate || predicate(event as T)) {
          resolve(event as T);
          target.removeEventListener(eventName, handler as any);
        }
      }
      target.addEventListener(eventName, handler as any);
    });