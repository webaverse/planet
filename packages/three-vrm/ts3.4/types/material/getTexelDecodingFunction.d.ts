import * as THREE from 'three';
export declare const getEncodingComponents: (encoding: THREE.TextureEncoding) => [
    string,
    string
];
export declare const getTexelDecodingFunction: (functionName: string, encoding: THREE.TextureEncoding) => string;
