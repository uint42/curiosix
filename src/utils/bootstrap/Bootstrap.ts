import ModelLoader from './ModelLoader'
import ImageLoader from './ImageLoader'

class Bootstrap {
  loadingDescriptionDiv: HTMLDivElement
  loadingProgressDiv: HTMLDivElement

  imageLoader: ImageLoader
  modelLoader: ModelLoader

  constructor() {
    this.loadingDescriptionDiv = document.getElementById('loading_description') as HTMLDivElement
    this.loadingProgressDiv = document.getElementById('loading_progress') as HTMLDivElement

    this.modelLoader = new ModelLoader(this)
    this.imageLoader = new ImageLoader(this)
  }

  async boot() {
    this.debugWarning()
    this.imageLoader.loadImages()
    await this.modelLoader.loadModels()
  }

  private debugWarning() {
    const webpackEnv: { buildInfo: { version: string; os: string; date: string }; development: boolean } = require('../WebpackEnv')
    if (webpackEnv.development) {
      console.log('%cWARNING! » %cDEVELOPMENT VERSION', 'font-size: 30px; color: white; background-color: red; padding: 4px;', 'font-size: 30px; color: white; background-color: grey; padding: 4px;')
      console.log("Don't use for production")
      console.log(webpackEnv)
    }
  }

  updateProgress(progress: number) {
    this.loadingProgressDiv.style.width = `${progress * 100}%`
  }

  updateDescription(description: string) {
    this.loadingDescriptionDiv.innerText = description
    this.updateProgress(0)
  }

  removeLoadingAnimation() {
    const loadingElement = document.getElementById('loading')
    loadingElement.style.opacity = '0'
    loadingElement.style.pointerEvents = 'none'
    setTimeout(() => loadingElement.remove(), 200)
  }
}

export default Bootstrap
