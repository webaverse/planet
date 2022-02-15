/*
this file implements post processing.
*/

import * as THREE from 'three';
import {Pass} from 'three/examples/jsm/postprocessing/Pass.js';
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {AdaptiveToneMappingPass} from 'three/examples/jsm/postprocessing/AdaptiveToneMappingPass.js';
// import {BloomPass} from 'three/examples/jsm/postprocessing/BloomPass.js';
// import {AfterimagePass} from 'three/examples/jsm/postprocessing/AfterimagePass.js';
import {BokehPass} from './BokehPass.js';
import {SSAOPass} from './SSAOPass.js';
import {RenderPass} from './RenderPass.js';
import {DepthPass} from './DepthPass.js';
import {
  getRenderer,
  getComposer,
  rootScene,
  postSceneOrthographic,
  postScenePerspective,
  camera,
  orthographicCamera,
} from './renderer.js';
// import {rigManager} from './rig.js';
import {world} from './world.js';
import cameraManager from './camera-manager.js';
import {WebaverseRenderPass} from './webaverse-render-pass.js';
import metaversefileApi from 'metaversefile';
// import {parseQuery} from './util.js';

// const hqDefault = parseQuery(window.location.search)['hq'] === '1';

// const localVector = new THREE.Vector3();
const localVector2D = new THREE.Vector2();

/* const testSpec = {
  "background": {
    "color": [0, 0, 0]
  },
  "fog": {
    "fogType": "exp",
    "args": [[255, 255, 255], 0.01]
  },
  "ssao": {
    "kernelRadius": 16,
    "minDistance": 0.005,
    "maxDistance": 0.1
  },
  "dof": {
    "focus": 3.0,
    "aperture": 0.00002,
    "maxblur": 0.005
  },
  "hdr": {
    "adaptive": true,
    "resolution": 256,
    "adaptionRate": 100,
    "maxLuminance": 10,
    "minLuminance": 0,
    "middleGrey": 3
  },
  "bloom": {
    "strength": 0.2,
    "radius": 0.5,
    "threshold": 0.8
  }
}; */

function makeDepthPass({ssao, hdr}) {
  const renderer = getRenderer();
  const size = renderer.getSize(localVector2D)
    .multiplyScalar(renderer.getPixelRatio());

  const depthPass = new DepthPass(rootScene, camera, {width: size.x, height: size.y});
  depthPass.needsSwap = false;
  // depthPass.enabled = hqDefault;
  return depthPass;
}
function makeSsaoRenderPass({
  kernelSize = 8,
  kernelRadius = 16,
  minDistance = 0.005,
  maxDistance = 0.1,
}, depthPass) {
  const renderer = getRenderer();
  const size = renderer.getSize(localVector2D)
    .multiplyScalar(renderer.getPixelRatio());

  const ssaoRenderPass = new SSAOPass(rootScene, camera, size.x, size.y, depthPass);
  ssaoRenderPass.kernelSize = kernelSize;
  ssaoRenderPass.kernelRadius = kernelRadius;
  ssaoRenderPass.minDistance = minDistance;
  ssaoRenderPass.maxDistance = maxDistance;
  // ssaoRenderPass.output = SSAOPass.OUTPUT.SSAO;
  return ssaoRenderPass;
}
function makeDofPass({
  focus = 3.0,
  aperture = 0.00002,
  maxblur = 0.005,
}, depthPass) {
  const renderer = getRenderer();
  const size = renderer.getSize(localVector2D)
    .multiplyScalar(renderer.getPixelRatio());

  const bokehPass = new BokehPass(rootScene, camera, {
    focus,
    aperture,
    maxblur,
    width: size.x,
    height: size.y,
  }, depthPass);
  bokehPass.needsSwap = true;
  // bokehPass.enabled = hqDefault;
  return bokehPass;
}
function makeHdrPass({
  adaptive = true,
  resolution = 256,
  adaptionRate = 100,
  maxLuminance = 10,
  minLuminance = 0,
  middleGrey = 3,
}) {
  const adaptToneMappingPass = new AdaptiveToneMappingPass(adaptive, resolution);
  // adaptToneMappingPass.needsSwap = true;
  adaptToneMappingPass.setAdaptionRate(adaptionRate);
  adaptToneMappingPass.setMaxLuminance(maxLuminance);
  adaptToneMappingPass.setMinLuminance(minLuminance);
  adaptToneMappingPass.setMiddleGrey(middleGrey);
  // adaptToneMappingPass.enabled = hqDefault;
  // adaptToneMappingPass.copyUniforms["opacity"].value = 0.5;
  return adaptToneMappingPass;
}
function makeBloomPass({
  strength = 0.2,
  radius = 0.5,
  threshold = 0.8,
}) {
  const renderer = getRenderer();
  const size = renderer.getSize(localVector2D)
    .multiplyScalar(renderer.getPixelRatio());
  const resolution = size;

  const unrealBloomPass = new UnrealBloomPass(resolution, strength, radius, threshold);
  // unrealBloomPass.threshold = params.bloomThreshold;
  // unrealBloomPass.strength = params.bloomStrength;
  // unrealBloomPass.radius = params.bloomRadius;
  // unrealBloomPass.copyUniforms['opacity'].value = 0.5;
  // unrealBloomPass.enabled = hqDefault;
  return unrealBloomPass;
}
function makeEncodingPass() {
  const encodingPass = new ShaderPass({
    uniforms: {
      tDiffuse: {
        value: null,
      },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      varying vec2 vUv;
      void main() {
        vec4 c = texture2D(tDiffuse, vUv);
        c = LinearTosRGB(c);
        // c = sRGBToLinear(c);
        // c.rgb = pow2(c.rgb, 0.8);
        // c.a = 1.;
        gl_FragColor = c;
      }
    `,
  });
  // encodingPass.enabled = false;
  return encodingPass;
}

const webaverseRenderPass = new WebaverseRenderPass();
const _isDecapitated = () => (/^(?:camera|firstperson)$/.test(cameraManager.getMode()) || !!getRenderer().xr.getSession());
webaverseRenderPass.onBeforeRender = () => {
  // ensure lights attached
  // scene.add(world.lights);
  
  // decapitate avatar if needed
  const localPlayer = metaversefileApi.useLocalPlayer();
  if (localPlayer.avatar) {
    // scene.add(localPlayer.avatar.model);
    
    const decapitated = _isDecapitated();
    if (decapitated) {
      localPlayer.avatar.decapitate();
    } else {
      localPlayer.avatar.undecapitate();
    }
  }
};
webaverseRenderPass.onAfterRender = () => {
  // undecapitate
  const localPlayer = metaversefileApi.useLocalPlayer();
  if (localPlayer.avatar) {
    const decapitated = _isDecapitated();
    if (decapitated) {
      localPlayer.avatar.undecapitate();
    }
  }
};
const encodingPass = makeEncodingPass();

class PostProcessing extends EventTarget {
  constructor() {
    super();
  }
  bindCanvas() {
    /* const renderer = getRenderer();
    const size = renderer.getSize(new THREE.Vector2())
      .multiplyScalar(renderer.getPixelRatio()); */
    
    this.setPasses(null);
  
    /* document.addEventListener('keydown', e => { // XXX move to io manager
      if (e.key === 'h') {
        webaverseRenderPass.internalRenderPass = webaverseRenderPass.internalRenderPass ? null : ssaoRenderPass;
      } else if (e.key === 'j') {
        bokehPass.enabled = !bokehPass.enabled;
      } else if (e.key === 'k') {
        adaptToneMappingPass.enabled = !adaptToneMappingPass.enabled;
      } else if (e.key === 'l') {
        unrealBloomPass.enabled = !unrealBloomPass.enabled;
      }
    }); */
  }
  setPasses(rendersettings) {
    const composer = getComposer();
    const oldPasses = composer.passes.slice();
    for (let i = oldPasses.length - 1; i >= 0; i--) {
      const oldPass = oldPasses[i];
      composer.removePass(oldPass);
    }
    
    composer.addPass(webaverseRenderPass);
    
    if (rendersettings) {
      const {ssao, dof, hdr, bloom, postPostProcessScene} = rendersettings;
      
      if (ssao || dof) {
        const depthPass = makeDepthPass({ssao, dof});
        webaverseRenderPass.internalDepthPass = depthPass;
      }
      if (ssao) {
        const ssaoRenderPass = makeSsaoRenderPass(ssao, webaverseRenderPass.internalDepthPass);
        webaverseRenderPass.internalRenderPass = ssaoRenderPass;
      }
      if (dof) {
        const dofPass = makeDofPass(dof, webaverseRenderPass.internalDepthPass);
        composer.addPass(dofPass);
      }
      if (hdr) {
        const hdrPass = makeHdrPass(hdr);
        composer.addPass(hdrPass);
      }
      if (bloom) {
        const bloomPass = makeBloomPass(bloom);
        composer.addPass(bloomPass);
      }
      if (postPostProcessScene) {
        const {postPerspectiveScene, postOrthographicScene} = postPostProcessScene;
        if(postPerspectiveScene) {
          const postRenderPass = new RenderPass(postScenePerspective, camera);
          composer.addPass(postRenderPass);
        }
        if(postOrthographicScene) {
          const postRenderPass = new RenderPass(postSceneOrthographic, orthographicCamera);
          composer.addPass(postRenderPass);
        }
      }
    }
    
    composer.addPass(encodingPass);

    this.dispatchEvent(new MessageEvent('update'));
  }
}
const postProcessing = new PostProcessing();
export default postProcessing;