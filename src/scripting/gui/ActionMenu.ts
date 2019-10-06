import curiosix from '../../main'
import Interpreter from '../language/interpreter/Interpreter'
import CodeEditor from './CodeEditor'
import Swal from 'sweetalert2'
import ThemeChanger from '../../utils/ThemeChanger'
import { t } from '../../utils/i18n'

class ActionMenu {
  private allowResume: boolean = false
  private codeEditor: CodeEditor
  private pauseResumeButton: HTMLButtonElement

  constructor(codeEditor: CodeEditor) {
    this.codeEditor = codeEditor
    this.pauseResumeButton = document.getElementById('pause_resume') as HTMLButtonElement
  }

  setup() {
    this.setupActions()
  }

  private setupActions() {
    document.getElementById('restart').onclick = _ => {
      if (!curiosix.world || !curiosix.world.rover || !curiosix.fileManager.scriptFileTypeManager.fileSelector.currentFileName) {
        Swal.fire({
          title: t('scripting.execution_not_possible.title'),
          text: t('scripting.execution_not_possible.text'),
          type: 'error'
        })
        return
      }
      curiosix.scriptingManager.start(this.codeEditor.codeMirror.getValue())
    }

    document.getElementById('about').onclick = _ => {
      const webpackEnv = require('../../utils/WebpackEnv')
      Swal.fire({
        title: t('about.title'),
        html: `
          <img src="${require('../../../assets/images/logo.svg')}" height="100px"><br>
          <div>${t('about.version')}: <b>${webpackEnv.buildInfo.version}</b> (${webpackEnv.development ? t('about.version_type.development') : t('about.version_type.production')})</div>
          <div>${t('about.build_info')}: <b>${webpackEnv.buildInfo.os}</b></div>
          <div>${t('about.build_date')}: <b>${webpackEnv.buildInfo.date}</b></div>
          <br>
          <div>&copy; Johannes Bauer 2019</div>
          <br>
          <button id="osl" class="btn">${t('about.open_source_licences')}</button>
        `,
        onOpen: _ => {
          document.getElementById('osl').onclick = _ => {
            Swal.fire({
              title: t('about.open_source_licences'),
              html: `
              <div>three.js (by mrdoob and other three.js authors): <a href="https://raw.githubusercontent.com/mrdoob/three.js/dev/LICENSE">MIT</a></div>
              <div>codemirror (by Marijn Haverbeke and others): <a href="https://raw.githubusercontent.com/codemirror/CodeMirror/master/LICENSE">MIT</a></div>
              <div>dexie.js (by dfahlander and others): <a href="https://raw.githubusercontent.com/dfahlander/Dexie.js/master/LICENSE">Apache License 2.0</a></div>
              <div>queue-typescript (by Mike Sutherland): <a href="https://raw.githubusercontent.com/sfkiwi/queue-typescript/master/LICENSE">MIT</a></div>
              <div>stats.js (by mrdoob and other stats.js authors): <a href="https://raw.githubusercontent.com/mrdoob/stats.js/master/LICENSE">MIT</a></div>
              <div>sweetalert2 (by Tristan Edwards & Limon Monte and others): <a href="https://raw.githubusercontent.com/sweetalert2/sweetalert2/master/LICENSE">MIT</a></div>
              <br>
              <div>Roboto Font (by Christian Robertson / Google): <a href="https://www.apache.org/licenses/LICENSE-2.0">Apache License 2.0</a></div>
              <div>Material Icons (by Google): <a href="https://raw.githubusercontent.com/google/material-design-icons/master/LICENSE">Apache License 2.0</a></div>
              `,
              width: '50%'
            })
          }
        },
        width: '50%'
      })
    }

    document.getElementById('change_color').onclick = _ => ThemeChanger.toggle()

    this.pauseResumeButton.onclick = _ => {
      if (!curiosix.scriptingManager.interpreter) return
      if (curiosix.scriptingManager.interpreter.isRunning) {
        curiosix.scriptingManager.interpreter.isRunning = false
        this.allowResume = true
        this.pauseResumeButton.innerText = 'play_arrow'
      } else if (this.allowResume) {
        curiosix.scriptingManager.interpreter.isRunning = true
        this.allowResume = false
        this.pauseResumeButton.innerText = 'pause'
      }
    }

    const executionTimeSlider = document.getElementById('execution_time') as HTMLInputElement
    executionTimeSlider.value = Interpreter.EXECUTION_TIME_PER_INSTRUCTION.toString()
    executionTimeSlider.oninput = _ => {
      Interpreter.updateExecutionTime(executionTimeSlider.valueAsNumber)
    }
  }

  started() {
    this.pauseResumeButton.classList.remove('actions-button-disabled')
    this.pauseResumeButton.innerText = 'pause'
  }

  stoped() {
    this.pauseResumeButton.classList.add('actions-button-disabled')
    this.pauseResumeButton.innerText = 'pause'
  }
}

export default ActionMenu
