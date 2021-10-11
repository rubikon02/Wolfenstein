import { Vec3, degToRad } from './utils'
import m4 from './m4'
import Shape from './Shape'

export default class Cube extends Shape {
    readonly VERTICES = new Float32Array([
        // front    
        -0.5, -0.5, -0.5,
        -0.5, 0.5, -0.5,
        0.5, 0.5, -0.5,
        -0.5, -0.5, -0.5,
        0.5, 0.5, -0.5,
        0.5, -0.5, -0.5,

        // back    
        -0.5, -0.5, 0.5,
        0.5, 0.5, 0.5,
        -0.5, 0.5, 0.5,
        -0.5, -0.5, 0.5,
        0.5, -0.5, 0.5,
        0.5, 0.5, 0.5,

        // left    
        -0.5, -0.5, -0.5,
        -0.5, -0.5, 0.5,
        -0.5, 0.5, 0.5,
        -0.5, -0.5, -0.5,
        -0.5, 0.5, 0.5,
        -0.5, 0.5, -0.5,

        // right    
        0.5, -0.5, -0.5,
        0.5, 0.5, 0.5,
        0.5, -0.5, 0.5,
        0.5, -0.5, -0.5,
        0.5, 0.5, -0.5,
        0.5, 0.5, 0.5,

        // top    
        -0.5, 0.5, -0.5,
        0.5, 0.5, 0.5,
        0.5, 0.5, -0.5,
        -0.5, 0.5, 0.5,
        0.5, 0.5, 0.5,
        -0.5, 0.5, -0.5,

        // bottom    
        0.5, -0.5, -0.5,
        0.5, -0.5, 0.5,
        -0.5, -0.5, -0.5,
        -0.5, -0.5, -0.5,
        0.5, -0.5, 0.5,
        -0.5, -0.5, 0.5,
    ])

    readonly COLORS = new Uint8Array([
        200, 70, 0.520,
        200, 70, 0.520,
        200, 70, 0.520,
        200, 70, 0.520,
        200, 70, 0.520,
        200, 70, 0.520,

        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,

        70, 200, 20.50,
        70, 200, 20.50,
        70, 200, 20.50,
        70, 200, 20.50,
        70, 200, 20.50,
        70, 200, 20.50,

        200, 200, 70,
        200, 200, 70,
        200, 200, 70,
        200, 200, 70,
        200, 200, 70,
        200, 200, 70,

        20.50, 0.500, 70,
        20.50, 0.500, 70,
        20.50, 0.500, 70,
        20.50, 0.500, 70,
        20.50, 0.500, 70,
        20.50, 0.500, 70,

        20.50, 0.560, 70,
        20.50, 0.560, 70,
        20.50, 0.560, 70,
        20.50, 0.560, 70,
        20.50, 0.560, 70,
        20.50, 0.560, 70,
    ])

    constructor(gl: WebGLRenderingContext) {
        super(gl)
        this.transform.scale = Vec3.identity.multiply(50)
    }
}