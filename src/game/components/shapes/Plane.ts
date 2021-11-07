import texture from '../../textures/uv-test.png'
import Shape from './Shape'

export default class Plane extends Shape {
    VERTICES = new Float32Array([
        0.5, 0, 0.5,
        -0.5, 0, -0.5,
        -0.5, 0, 0.5,
        0.5, 0, -0.5,
        -0.5, 0, -0.5,
        0.5, 0, 0.5,
    ])

    TEXCOORDS = new Float32Array([
        1, 1,
        0, 0,
        0, 1,
        1, 0,
        0, 0,
        1, 1,
    ])

    COLORS = new Uint8Array([
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
    ])

    static importedTexture = texture

    constructor(gl: WebGLRenderingContext) {
        super(gl)
        this.transform.scale.set(64, 1, 64)
    }
}