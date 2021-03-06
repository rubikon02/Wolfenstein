import FieldData from '../../common/FieldData';
import { degToRad, Vec3 } from './utils';
import Wall from './shapes/level/Wall'
import Enemy from './shapes/level/Enemy'
import Cuboid from './shapes/level/Cuboid';
import Door from './shapes/level/Door';
import Plane from './shapes/level/Plane';
import Shape from './shapes/level/Shape';
import Interactable from './shapes/level/Interactable';

import Pickup from './shapes/level/pickups/Pickup';
import Ammo from './shapes/level/pickups/Ammo'

import Config from './Config'
import { TextureProgram } from './programs/TextureProgram';
import { ColorProgram } from './programs/ColorProgram';
import { Program } from './programs/Program';
import DogFood from './shapes/level/pickups/DogFood';
import Food from './shapes/level/pickups/Food';
import HealthPack from './shapes/level/pickups/HealthPack';
import Machinegun from './shapes/level/pickups/Machinegun';

import Decoration from './shapes/level/decorations/Decoration';
import DecorationMap from '../../common/DecorationMap'
import NotCollidingFieldValues from '../../common/NotCollidingFieldValues';
import GoldenCross from './shapes/level/pickups/GoldenCross';
import GoldenCup from './shapes/level/pickups/GoldenCup';
import GoldenBox from './shapes/level/pickups/GoldenBox';
import GoldenCrown from './shapes/level/pickups/GoldenCrown';
import PowerUp from './shapes/level/pickups/PowerUp';
import Pathfinder from './Pathfinder';
import Lever from './shapes/level/Lever';
import WallSecretDoor from './shapes/level/WallSecretDoor';
import UI from './shapes/ui/UI';
import PointItem from './shapes/level/pickups/PointItem';


export default class Level {
    width: number
    height: number
    center: Vec3
    playerPosition: Vec3
    enemies: Enemy[] = []
    walls: Wall[] = []
    secretWalls: WallSecretDoor[] = []
    doors: Door[] = []
    shapes: Shape[] = []
    floor: Plane
    ceiling: Plane
    exits: Lever[]
    collidingCuboids: Cuboid[] = []
    interactables: Interactable[] = []
    textureProgram: TextureProgram
    colorProgram: ColorProgram
    pickups: Pickup[] = []
    decorations: Decoration[] = []

    private readonly gl: WebGLRenderingContext
    private fields: FieldData[]
    gridFields: FieldData[]

    constructor(gl: WebGLRenderingContext, textureProgram: TextureProgram, colorProgram: ColorProgram) {
        this.gl = gl
        this.textureProgram = textureProgram
        this.colorProgram = colorProgram
    }

    load(level: number, callback?: () => void) {
        this.loadLevel(level, () => {
            this.createObjects()
            Pathfinder.instance.prepareLevel(this)
            callback?.()
        })
    }

    spawnLoot(enemy: Enemy) {
        if (enemy.loot) {
            this.pickups.push(enemy.loot)
            enemy.loot.transform.position = enemy.transform.position.clone()
            // enemy.loot.transform.position.x += 30
            // enemy.loot.transform.position.z += 30
            enemy.loot.setInitialState()
        }
    }

    get verticesCount() {
        return this.shapes.map(el => el.verticesCount).reduce((a, b) => a + b)
    }

    private loadLevel(number: number, callback?: () => void) {
        import(`../levels/${number}.json`)
            .then(({ default: level }) => {
                this.width = level.width
                this.height = level.height
                this.center = new Vec3(this.width * Config.gridSize / 2, 0, this.height * Config.gridSize / 2)
                this.fields = JSON.parse(JSON.stringify(level.fields))
                this.checkWallsDirections()
                this.changeWallsNeighboursTextures()
                this.applyGridSize()
                this.gridFields = JSON.parse(JSON.stringify(level.fields))
                callback?.()
            });
    }

    private checkWallsDirections() {
        for (let door of this.fields.filter(f => f.value == 'door' || f.value == "exitDoor" || (f.value.toLowerCase().includes('secret') && f.value.toLowerCase().includes('wall')))) {
            const horizontalNeighbours = this.fields
                .filter(f => f.y == door.y && (f.x == door.x + 1 || f.x == door.x - 1))
                .filter(f => f.value.toLowerCase().includes('wall'))
            const verticalNeighbours = this.fields
                .filter(f => f.x == door.x && (f.y == door.y + 1 || f.y == door.y - 1))
                .filter(f => f.value.toLowerCase().includes('wall'))
            if (horizontalNeighbours.length == 2 && verticalNeighbours.length == 0) {
                door.rotation = 0
            } else if (horizontalNeighbours.length == 0 && verticalNeighbours.length == 2) {
                door.rotation = 270
            }
        }
    }

    private changeWallsNeighboursTextures() {
        for (let door of this.fields.filter(f => f.value == 'door' || f.value == 'exitDoor')) {
            for (let direction of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
                const neighbour = this.fields.find(f => {
                    return f.x == door.x + direction[0] && f.y == door.y + direction[1]
                })
                if (neighbour) {
                    neighbour.wallDirection = direction
                }
            }
        }
    }

    private applyGridSize() {
        for (let field of this.fields) {
            field.x = (field.x * Config.gridSize) + Config.gridSize / 2
            field.y = (field.y * Config.gridSize) + Config.gridSize / 2
        }
    }

    private createObjects() {
        const playerPositionData = this.fields.find(f => f.value == 'player')
        this.playerPosition = new Vec3(playerPositionData.x, 0, playerPositionData.y)

        this.walls = this.getLevelObjectsList('wall', Wall) as Wall[]
        this.enemies = this.getLevelObjectsList('enemy', Enemy) as Enemy[]
        this.doors = this.getLevelObjectsList('door', Door) as Door[]
        const ammos = this.getLevelObjectsList('ammo', Ammo) as Ammo[]
        const dogFoods = this.getLevelObjectsList('dogFood', DogFood) as DogFood[]
        const foods = this.getLevelObjectsList('food', Food) as Food[]
        const healthPacks = this.getLevelObjectsList('health', HealthPack) as HealthPack[]
        const powerUps = this.getLevelObjectsList('powerUp', PowerUp) as PowerUp[]
        const machineguns = this.getLevelObjectsList('machinegun', Machinegun) as Machinegun[]
        const goldenCrosses = this.getLevelObjectsList('goldCross', GoldenCross) as GoldenCross[]
        const goldenCups = this.getLevelObjectsList('goldCup', GoldenCup) as GoldenCup[]
        const goldenBoxes = this.getLevelObjectsList('goldBox', GoldenBox) as GoldenBox[]
        const goldenCrowns = this.getLevelObjectsList('goldCrown', GoldenCrown) as GoldenCrown[]

        this.exits = []
        this.exits.push(...this.getLevelObjectsList('exitLever', Lever) as Lever[])
        this.exits.push(...this.getLevelObjectsList('secretExitLever', Lever) as Lever[])

        this.decorations = []
        for (let decorationName of DecorationMap.keys()) {
            this.decorations.push(...this.getLevelObjectsList(decorationName, Decoration) as Decoration[])
        }
        this.decorations.filter(d => !NotCollidingFieldValues.includes(d.type)).forEach(d => d.createBB())

        this.secretWalls = this.walls.filter(w => w instanceof WallSecretDoor).map(w => w as WallSecretDoor)
        this.walls = this.walls.filter(w => !(w instanceof WallSecretDoor))
        this.collidingCuboids = []
        this.collidingCuboids.push(...this.walls)
        this.collidingCuboids.push(...this.secretWalls)
        this.collidingCuboids.push(...this.doors)
        this.collidingCuboids.push(...this.exits)
        this.interactables = []
        this.interactables.push(...this.doors)
        this.interactables.push(...this.secretWalls)
        this.interactables.push(...this.exits)
        this.pickups = []
        this.pickups.push(...ammos)
        this.pickups.push(...dogFoods)
        this.pickups.push(...foods)
        this.pickups.push(...healthPacks)
        this.pickups.push(...powerUps)
        this.pickups.push(...machineguns)
        this.pickups.push(...goldenCrosses)
        this.pickups.push(...goldenCups)
        this.pickups.push(...goldenBoxes)
        this.pickups.push(...goldenCrowns)

        // this.doors[0].transform.position.x += 45

        this.floor = new Plane(this.gl, this.colorProgram)
        this.floor.setColor("#707070")
        this.floor.transform.position = this.center.clone()
        this.floor.transform.position.y = -Config.gridSize / 2
        this.floor.transform.scale.set(this.width * Config.gridSize, 1, this.height * Config.gridSize)

        this.ceiling = new Plane(this.gl, this.colorProgram)
        this.ceiling.setColor("#383838")
        this.ceiling.transform.position = this.center.clone()
        this.ceiling.transform.position.y = Config.gridSize / 2
        this.ceiling.transform.scale.set(this.width * Config.gridSize, 1, this.height * Config.gridSize)
        this.ceiling.transform.rotation.z = degToRad(180)

        // {
        //     const health = new DogFood(this.gl, this.textureProgram)
        //     health.transform.position.x = 1888
        //     health.transform.position.z = 1344
        //     health.setInitialState()
        //     this.pickups.push(health)
        // }
        // {
        //     const health = new Food(this.gl, this.textureProgram)
        //     health.transform.position.x = 1888 - Config.gridSize * 1
        //     health.transform.position.z = 1344
        //     health.setInitialState()
        //     this.pickups.push(health)
        // }
        // {
        //     const health = new HealthPack(this.gl, this.textureProgram)
        //     health.transform.position.x = 1888 - Config.gridSize * 2
        //     health.transform.position.z = 1344
        //     health.setInitialState()
        //     this.pickups.push(health)
        // }

        UI.instance.enemiesCount = this.enemies.length
        UI.instance.secretsCount = this.secretWalls.length
        UI.instance.treasuresCount = this.pickups.filter(p => p instanceof PointItem).length

        this.shapes = [
            ...this.walls,
            ...this.secretWalls,
            ...this.enemies,
            ...this.doors,
            ...this.pickups,
            ...this.decorations,
            ...this.exits,
            this.floor,
            this.ceiling,
        ]
    }

    private getLevelObjectsList<T extends Shape>(value: string, SpecificShape: new (gl: WebGLRenderingContext, program: Program, type?: string) => T) {
        const objects: Shape[] = []
        for (let field of this.fields.filter(f => f.value.toLowerCase().includes(value.toLowerCase()))) {
            let shape
            if (field.value.toLowerCase().includes('wall')) {
                if (field.value.toLowerCase().includes('wallsecret')) {
                    shape = new WallSecretDoor(this.gl, this.textureProgram, field.value)
                } else {
                    shape = new Wall(this.gl, this.textureProgram, field.value)
                }
            } else if (field.value.toLowerCase().includes("walking")) {
                if (field.value == 'enemyZWalking') {
                    shape = new Enemy(this.gl, this.textureProgram, 'z')
                } else if (field.value == 'enemyXWalking') {
                    shape = new Enemy(this.gl, this.textureProgram, 'x')
                }
            } else if (field.value.toLowerCase().includes("door")) {
                if (field.value == 'exitDoor') {
                    shape = new Door(this.gl, this.textureProgram, field.value)
                } else {
                    shape = new Door(this.gl, this.textureProgram)
                }
            } else if (field.value.toLowerCase().includes("enemy")) {
                for (let dir of ['up', 'down', 'left', 'right']) {
                    if (field.value.toLowerCase().includes(dir)) {
                        shape = new Enemy(this.gl, this.textureProgram, dir)
                    }
                }
            } else {
                shape = new SpecificShape(this.gl, this.textureProgram)
            }
            shape.transform.position.x = field.x
            shape.transform.position.z = field.y
            if (field.rotation) {
                shape.transform.rotation.y = degToRad(field.rotation)
            }
            if (field.value.toLowerCase().includes('wall')) {
                if (field.value.toLowerCase().includes('wallsecret')) {
                    (shape as WallSecretDoor).dirToCalculate = true
                }
            }
            shape.setInitialState()
            if (field.wallDirection && shape instanceof Wall) {
                const dir = new Vec3(field.wallDirection[0], 0, field.wallDirection[1])
                if (dir.equals(Vec3.backward)) {
                    shape.setTexture(shape.nearDoorDarkTexture, 0)
                }
                if (dir.equals(Vec3.forward)) {
                    shape.setTexture(shape.nearDoorDarkTexture, 1)
                }
                if (dir.equals(Vec3.left)) {
                    shape.setTexture(shape.nearDoorLightTexture, 3)
                }
                if (dir.equals(Vec3.right)) {
                    shape.setTexture(shape.nearDoorLightTexture, 2)
                }
            } else if (shape instanceof Decoration) {
                shape.type = value
                shape.setTexture(shape.textureNumber)
            }
            objects.push(shape)
        }
        return objects
    }
}