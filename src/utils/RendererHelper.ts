import curiosix from '../main'
import { WebGLRenderer, PerspectiveCamera } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as Stats from 'stats.js'
import Swal from 'sweetalert2'

class RendererHelper {
  renderer: WebGLRenderer
  orbitControls: OrbitControls
  camera: PerspectiveCamera
  stats: Stats
  rendererContainer: HTMLDivElement

  setup() {
    this.stats = new Stats()
    this.stats.showPanel(0)
    this.stats.dom.id = 'stats'
    this.stats.dom.style.position = 'static'
    document.querySelector('.actions>.main').appendChild(this.stats.dom)

    this.renderer = new WebGLRenderer({
      antialias: true,
      alpha: true
    })

    this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000)

    this.camera.position.set(0, 2, -2)
    this.camera.lookAt(0, 0, 0)
    this.rendererContainer = document.getElementById('renderer_container') as HTMLDivElement

    this.onWindowResized()
    this.setupControls()

    if ('ontouchstart' in window) {
      Swal.fire({
        title: 'CuriosiX ist nicht für Mobilgeräte optimiert',
        text: 'Wenn CuriosiX trotzdem nutzen möchtest, klicke auf "OK"'
      })
    }

    this.renderer.domElement.classList.add('renderer')
    this.rendererContainer.appendChild(this.renderer.domElement)

    window.addEventListener('resize', _ => this.onWindowResized())
  }

  private setupControls() {
    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement)

    this.orbitControls.minPolarAngle = 0
    this.orbitControls.maxPolarAngle = (80 / 180) * Math.PI

    this.orbitControls.minDistance = 0.4
    this.orbitControls.maxDistance = 20

    this.orbitControls.enableZoom = true
    this.orbitControls.zoomSpeed = 1.0

    this.orbitControls.enableKeys = false

    this.orbitControls.enablePan = true
  }

  private onWindowResized() {
    const boundingRect = this.rendererContainer.getBoundingClientRect()
    console.log('[Render Helper] Resize', window.innerHeight, boundingRect.height)
    this.renderer.setSize(boundingRect.width, boundingRect.height)
    this.camera.aspect = boundingRect.width / boundingRect.height
    this.camera.updateProjectionMatrix()

    this.renderer.domElement.style.width = null
    this.renderer.domElement.style.height = null
  }

  render() {
    this.orbitControls.update()
    this.renderer.render(curiosix.scene, this.camera)
  }
}

export default RendererHelper
