import texture from '../../../../textures/objects.png'
import Config from '../../../Config'
import { Program } from '../../../programs/Program'
import { degToRad, Vec2, Vec3 } from '../../../utils'
import Plane from '../Plane'

export default abstract class Decoration extends Plane {
    importedTexture = texture

    private firstTextureSet = false
    protected abstract textureNumber: number

    onCreation() {
        this.transform.scale = Vec3.one.multiply(Config.gridSize)
        this.transform.rotation.x = degToRad(90)
        this.setTexture(this.textureNumber)
    }

    lookAtCamera(cameraY: number) {
        this.transform.rotation.y = -cameraY
    }

    private texturesInLine = 8

    get textureSize() {
        return 1 / this.texturesInLine
    }

    setTexture(textureNumber: number) {
        if (textureNumber == this.textureNumber && this.firstTextureSet) return
        this.textureNumber = textureNumber
        let verticesVec2Array = Vec2.arrayToVec2Array(this.initialTexcoords)
        const texturePos = new Vec2(textureNumber % this.texturesInLine, Math.floor(textureNumber / this.texturesInLine)).multiply(this.textureSize)
        verticesVec2Array = verticesVec2Array.map(vertex => vertex.multiply(this.textureSize).add(texturePos))
        this.TEXCOORDS = new Float32Array(Vec2.vec2ArrayToArray(verticesVec2Array))
        if (!this.firstTextureSet) {
            this.firstTextureSet = true
            this.updateBuffers()
        }
    }
}