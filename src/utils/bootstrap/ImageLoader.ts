import Bootstrap from './Bootstrap'
import { t } from '../i18n'

class ImageLoader {
  private bootstrap: Bootstrap

  constructor(bootstrapInstance: Bootstrap) {
    this.bootstrap = bootstrapInstance
  }

  loadImages() {
    this.bootstrap.updateDescription(t('bootstrap.load_images'))
    for (let i = 0; i < IMAGES.length; i++) {
      const image = IMAGES[i]
      image()
      this.bootstrap.updateProgress((i + 1) / IMAGES.length)
    }
  }
}

const IMAGES = [
  () => {
    const linkElement = document.createElement('link')
    linkElement.rel = 'iconshortcut icon'
    linkElement.href = require('../../../assets/images/favicon.png')
    document.head.appendChild(linkElement)
  },
  () => ((document.getElementById('entity_select_wall') as HTMLImageElement).src = require('../../../assets/images/entity_selector/wall.svg')),
  () => ((document.getElementById('entity_select_marker') as HTMLImageElement).src = require('../../../assets/images/entity_selector/marker.svg')),
  () => ((document.getElementById('entity_select_rover') as HTMLImageElement).src = require('../../../assets/images/entity_selector/rover.svg')),
  () => ((document.getElementById('entity_select_brick') as HTMLImageElement).src = require('../../../assets/images/entity_selector/brick.svg')),
  () => ((document.getElementById('logo') as HTMLImageElement).src = require('../../../assets/images/logo.svg'))
]

export default ImageLoader
