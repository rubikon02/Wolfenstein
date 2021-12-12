import { degToRad, m4, Vec2, Vec3 } from '../../utils'
import Plane from '../level/Plane'
import { Weapon, weaponType } from './Weapon'
import texture from '../../../textures/weapons.png'
import Config from '../../Config'
import Input from '../../Input'
import { Program } from '../../programs/Program'
import UI from './UI'
import knife from "../../../sounds/Knife.wav"
import pistol from "../../../sounds/Pistol.wav"
import machinegun from "../../../sounds/Machine Gun.wav"
import chaingun from "../../../sounds/Gatling Gun.wav"


export default class Weapons extends Plane {
    importedTexture = texture

    // availableTypes: weaponType[] = ['knife', 'pistol']
    availableTypes: weaponType[] = ['knife', 'pistol', 'machinegun', 'chaingun']

    private weapons: Weapon[] = []
    private texturesCount = new Vec2(8, 4)
    private currentTextureNumber: number

    private timeSinceLastUpdate = 0

    constructor(gl: WebGLRenderingContext, program: Program) {
        super(gl, program)
        this.transform.position.z = -2
        this.transform.rotation.x = degToRad(90)
        this.transform.scale = Vec3.one.multiply(1)
        this.transform.position.y = -0.66
        this.setInitialState()

        this.weapons.push(new Weapon("knife", 2.4, 40, [0, 1, 2, 3, 4], [], 3, knife))
        this.weapons[0].range = Config.gridSize * 0.75
        this.weapons.push(new Weapon("pistol", 2.4, 70, [8, 9, 10, 11, 12], [], 10, pistol))
        this.weapons.push(new Weapon("machinegun", 6, 70, [16, 17], [18, 19], 19, machinegun))
        this.weapons.push(new Weapon("chaingun", 12, 70, [24, 25], [26, 27], 26, chaingun))

        this.setTexture(this.currentWeapon.initTextures[0])
    }

    get textureSize() {
        return this.texturesCount.map(v => 1 / v)
    }

    get currentWeapon() {
        return this.weapons.find(weapon => weapon.type == UI.instance.weapon)
    }

    update(deltaTime: number) {
        this.timeSinceLastUpdate += deltaTime

        if (0 < Input.instance.lastNumber && Input.instance.lastNumber <= this.weapons.length) {
            for (let i = 0; i < this.weapons.length; i++) {
                if (Input.instance.lastNumber == i + 1) {
                    if (this.availableTypes.includes(this.weapons[i].type)) {
                        UI.instance.weapon = this.weapons[i].type
                    }
                }
            }
        }

        this.setShooting(Input.instance.shooting && UI.instance.ammo > 0)
        if (Input.instance.shot && (UI.instance.ammo > 0 || this.currentWeapon.type == 'knife')) {
            this.shoot()
            Input.instance.justShot = true
        }

        if (this.currentWeapon.justShot) {
            this.decreaseAmmo()
            this.currentWeapon.audio.play()
        }

        const frameTime = 1 / (this.currentWeapon.fireRate * this.currentWeapon.framesCount)

        this.currentWeapon.justShot = false

        if (this.timeSinceLastUpdate >= frameTime) {
            this.timeSinceLastUpdate = 0
            this.setTexture(this.currentWeapon.getNextTexture())
        }

        this.updateBuffers()
    }

    private decreaseAmmo() {
        if (this.currentWeapon.type != 'knife') {
            if (UI.instance.ammo > 0) {
                UI.instance.ammo--
            }
        }
    }

    private shoot() {
        if (!this.currentWeapon.isAutomatic) {
            this.currentWeapon.willShoot = true
        }
    }

    private setShooting(shooting: boolean) {
        if (this.currentWeapon.isAutomatic) {
            this.currentWeapon.shooting = shooting
        }
    }

    private setTexture(textureNumber: number) {
        if (textureNumber == this.currentTextureNumber) return
        this.currentTextureNumber = textureNumber
        const currentVerticesVec2Array = Vec2.arrayToVec2Array(this.initialTexcoords)
        const texturePos = new Vec2(textureNumber % this.texturesCount.x, Math.floor(textureNumber / this.texturesCount.x)).multiplyByVector(this.textureSize)
        const newVerticesVec2Array = currentVerticesVec2Array.map(vec2 => vec2.multiplyByVector(this.textureSize).add(texturePos))
        this.TEXCOORDS = new Float32Array(Vec2.vec2ArrayToArray(newVerticesVec2Array))
    }
}