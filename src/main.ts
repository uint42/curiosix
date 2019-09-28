import './main.css'

import { Scene, AmbientLight } from 'three'
import World from './world/World'
import ScriptingManager from './scripting/ScriptingManager'
import RendererHelper from './utils/RendererHelper'
import Bootstrap from './utils/bootstrap/Bootstrap'
import FileManager from './utils/files/FileManager'
import ThemeChanger from './utils/ThemeChanger'
import { initI18n, t } from './utils/i18n'

/**
 * Main class of CuriosiX
 * You should be able to access all required data using this class
 */
class CuriosiX {
  scene: Scene
  rendererHelper: RendererHelper
  world: World
  scriptingManager: ScriptingManager
  fileManager: FileManager
  bootstrap: Bootstrap

  private lastAnimation: number = 0

  constructor() {
    this.scene = new Scene()
    this.rendererHelper = new RendererHelper()
    this.scriptingManager = new ScriptingManager()
    this.bootstrap = new Bootstrap()
    this.fileManager = new FileManager()
  }

  async start() {
    await initI18n()
    ThemeChanger.setup()
    await this.bootstrap.boot()

    this.bootstrap.updateDescription(t('bootstrap.init_renderer'))
    this.rendererHelper.setup()

    this.bootstrap.updateDescription(t('bootstrap.connect_indexdb'))
    await this.fileManager.start()

    this.addAmbientLight()
    requestAnimationFrame(this.animate)
    this.bootstrap.removeLoadingAnimation()
  }

  private animate(time) {
    curiosix.rendererHelper.stats.begin()

    let estimatedTime = time - curiosix.lastAnimation
    curiosix.lastAnimation = time

    if (curiosix.world) curiosix.world.animate(estimatedTime)

    curiosix.scriptingManager.update(estimatedTime)

    curiosix.rendererHelper.render()

    curiosix.rendererHelper.stats.end()

    requestAnimationFrame(curiosix.animate)
  }

  private addAmbientLight() {
    const ambientLight = new AmbientLight(0xffffff, 0.8)
    this.scene.add(ambientLight)
  }
}

const curiosix = new CuriosiX()
export default curiosix
curiosix.start()
