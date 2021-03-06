import Config from './Config'
import UI from './shapes/ui/UI'
import { Vec3 } from './utils'

export default class Input {
    static instance = new this

    direction = Vec3.zero
    rotation = 0

    sprinting = false
    shooting = false
    shot = false
    justShot = true

    interacting = false
    justInteracted = false

    noclip = false

    renderWalls = true
    justChangedRenderWalls = false

    lastNumber: number = null

    private pressedKeys: string[] = []

    constructor() {
        this.addKeyUpListener()
        this.addKeyDownListener()
        this.addAdditionalListeners()
    }

    get inputsBlocked() {
        // return !UI.instance.health || UI.instance.showingMenu
        return UI.instance.state != "game"
    }

    update() {
        this.direction = Vec3.zero

        this.rotation = 0

        this.shooting = false

        this.shot = false

        this.interacting = false

        this.noclip = false

        this.sprinting = false

        this.lastNumber = null

        // console.log(this.inputsBlocked)
        if (!this.inputsBlocked) {
            if ((this.isPressed('ArrowUp') || this.isPressed('KeyW')) && !this.isPressed('KeyS') && !this.isPressed('ArrowDown')) this.direction.z = 1
            if ((this.isPressed('ArrowDown') || this.isPressed('KeyS')) && !this.isPressed('KeyW') && !this.isPressed('ArrowUp')) this.direction.z = -1
            // if (this.isPressed('KeyA') && !this.isPressed('KeyD')) this.direction.x = 1
            // if (this.isPressed('KeyD') && !this.isPressed('KeyA')) this.direction.x = -1
            this.direction = this.direction.normalize

            if ((this.isPressed('KeyA') || this.isPressed('ArrowLeft')) && !this.isPressed('ArrowRight') && !this.isPressed('KeyD')) this.rotation = -1
            if ((this.isPressed('KeyD') || this.isPressed('ArrowRight')) && !this.isPressed('ArrowLeft') && !this.isPressed('KeyA')) this.rotation = 1

            if (this.isPressed('Space')) this.shooting = true

            if (this.isPressed('Space')) {
                if (!this.justShot) {
                    this.shot = true
                }
            } else {
                this.justShot = false
            }

            if (this.isPressed('KeyE')) {
                if (!this.justInteracted) {
                    this.interacting = true
                }
            } else {
                this.justInteracted = false
            }

            if (Config.debug) {
                if (this.isPressed('KeyC')) {
                    this.noclip = true
                }
                if (this.isPressed('ShiftLeft')) {
                    this.sprinting = true
                }
            }

            if (this.isPressed('Digit0')) this.lastNumber = 0
            if (this.isPressed('Digit1')) this.lastNumber = 1
            if (this.isPressed('Digit2')) this.lastNumber = 2
            if (this.isPressed('Digit3')) this.lastNumber = 3
            if (this.isPressed('Digit4')) this.lastNumber = 4
            if (this.isPressed('Digit5')) this.lastNumber = 5
            if (this.isPressed('Digit6')) this.lastNumber = 6
            if (this.isPressed('Digit7')) this.lastNumber = 7
            if (this.isPressed('Digit8')) this.lastNumber = 8
            if (this.isPressed('Digit9')) this.lastNumber = 9
        }
    }

    private isPressed(key: string) {
        return this.pressedKeys.includes(key)
    }

    private addKeyUpListener() {
        addEventListener('keyup', e => {
            if (this.pressedKeys.includes(e.code)) {
                this.pressedKeys = this.pressedKeys.filter(key => key != e.code)
            }
        })
    }

    private addKeyDownListener() {
        addEventListener('keydown', e => {
            if (!this.pressedKeys.includes(e.code)) {
                this.pressedKeys.push(e.code)
            }
        })
    }

    private addAdditionalListeners() {
        addEventListener('keydown', e => {
            if (e.code == "Minus") {
                Config.uiScale -= 0.1
            } else if (e.code == "Equal") {
                Config.uiScale += 0.1
            } else if (e.code == "Backspace") {
                Config.uiScale = 1
            } else if (e.code == "KeyV" && Config.debug) {
                this.renderWalls = !this.renderWalls
            } else if (e.code == 'Space' || e.code == "Enter") {
                if (UI.instance.state == "startScreen") {
                    UI.instance.state = "menu"
                    UI.instance.audioSplash.pause()
                    UI.instance.audioMenu.play()
                } else if (UI.instance.state == "menu") {
                    if (UI.instance.menu.option == 0) {
                        UI.instance.menu.audioSelect.play()
                        UI.instance.audioLevel.play()
                        UI.instance.audioMenu.pause()
                        UI.instance.state = "loading"
                        // UI.instance.state = "game"
                    } else if (UI.instance.menu.option == 8) {
                        UI.instance.menu.audioSelect.play()
                        UI.instance.audioMenu.pause()
                        UI.instance.audioSplash.play()
                        UI.instance.state = "startScreen"
                    }
                }
            } else if (e.code == "Escape") {
                if (UI.instance.state == "menu") {
                    UI.instance.menu.audioBack.play()
                    UI.instance.audioMenu.pause()
                    UI.instance.audioSplash.play()
                    UI.instance.state = "startScreen"
                }
            }
        })
    }
}