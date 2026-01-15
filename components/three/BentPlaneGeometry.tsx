"use client";

import * as THREE from 'three';
import { extend } from '@react-three/fiber';

/**
 * BentPlaneGeometry - Creates a curved plane that bends around a radius
 * From Paul West @prisoner849 
 * https://discourse.threejs.org/t/simple-curved-plane/26647/10
 */
class BentPlaneGeometry extends THREE.PlaneGeometry {
  constructor(
    radius: number, 
    width: number, 
    height: number, 
    widthSegments: number = 20, 
    heightSegments: number = 20,
    flip: boolean = false  // Add flip parameter
  ) {
    super(width, height, widthSegments, heightSegments);
    
    const p = this.parameters;
    const hw = p.width * 0.5;
    
    const a = new THREE.Vector2(-hw, 0);
    const b = new THREE.Vector2(0, radius);
    const c = new THREE.Vector2(hw, 0);
    
    const ab = new THREE.Vector2().subVectors(a, b);
    const bc = new THREE.Vector2().subVectors(b, c);
    const ac = new THREE.Vector2().subVectors(a, c);
    
    const r = (ab.length() * bc.length() * ac.length()) / (2 * Math.abs(ab.cross(ac)));
    const center = new THREE.Vector2(0, radius - r);
    const baseV = new THREE.Vector2().subVectors(a, center);
    const baseAngle = baseV.angle() - Math.PI * 0.5;
    const arc = baseAngle * 2;
    
    const uv = this.attributes.uv;
    const pos = this.attributes.position;
    const mainV = new THREE.Vector2();
    
    if (!uv) {
      throw new Error('UV attributes are required for BentPlaneGeometry');
    }
    
    if (!pos) {
      throw new Error('Position attributes are required for BentPlaneGeometry');
    }
    
    const zMultiplier = flip ? 1 : -1;  // Control bend direction
    
    for (let i = 0; i < uv.count; i++) {
      const uvRatio = 1 - uv.getX(i);
      const y = pos.getY(i);
      mainV.copy(c).rotateAround(center, arc * uvRatio);
      pos.setXYZ(i, mainV.x, y, mainV.y * zMultiplier);
    }
    
    pos.needsUpdate = true;
    this.computeVertexNormals();
  }
}

/**
 * MeshSineMaterial - Material with animated sine wave displacement
 * Used for the banner ribbon effect
 * 
 * NOTE: We check if PI is already defined to avoid shader errors
 */
class MeshSineMaterial extends THREE.MeshBasicMaterial {
  time: { value: number };
  
  constructor(parameters: THREE.MeshBasicMaterialParameters = {}) {
    super(parameters);
    this.setValues(parameters);
    this.time = { value: 0 };
  }
  
  onBeforeCompile(shader: THREE.WebGLProgramParametersWithUniforms) {
    shader.uniforms.time = this.time;
    
    // Add time uniform WITHOUT redefining PI (Three.js already defines it)
    shader.vertexShader = `
      uniform float time;
      ${shader.vertexShader}
    `;
    
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `vec3 transformed = vec3(position.x, position.y + sin(time + uv.x * PI * 4.0) / 4.0, position.z);`
    );
  }
}

// Extend THREE namespace for JSX usage
extend({ BentPlaneGeometry, MeshSineMaterial });

// TypeScript declarations
declare global {
  namespace JSX {
    interface IntrinsicElements {
      bentPlaneGeometry: React.DetailedHTMLProps<
        React.HTMLAttributes<THREE.PlaneGeometry> & {
          args?: [number, number, number, number?, number?, boolean?];
        },
        THREE.PlaneGeometry
      >;
      meshSineMaterial: React.DetailedHTMLProps<
        React.HTMLAttributes<THREE.MeshBasicMaterial> & {
          map?: THREE.Texture;
          side?: THREE.Side;
          toneMapped?: boolean;
          transparent?: boolean;
          'map-anisotropy'?: number;
          'map-repeat'?: [number, number];
        },
        THREE.MeshBasicMaterial
      >;
    }
  }
}

export { BentPlaneGeometry, MeshSineMaterial };
