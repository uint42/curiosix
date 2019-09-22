import ActionMenu from './ActionMenu'

//Include codemirror specific css/js
import * as CodeMirror from 'codemirror'

import 'codemirror/theme/bespin.css'
import 'codemirror/lib/codemirror.css'

import 'codemirror/addon/lint/lint.css'
import 'codemirror/addon/lint/lint.js'

import 'codemirror/addon/edit/closebrackets.js'

import ScriptingManager from '../ScriptingManager'
import MarsWalkLinter from './editor/MarsWalkLinter'
import Executor from '../language/interpreter/Executor'
import { Instruction } from '../language/casl/Instruction'
import { defineMarsWalkMode } from './editor/MarsWalkMode'

class CodeEditor {
  actionMenu: ActionMenu = new ActionMenu(this)
  codeMirror: CodeMirror.Editor
  codeMirrorWrapperDiv: HTMLDivElement
  codeMirrorDiv: HTMLDivElement
  scriptingManager: ScriptingManager

  constructor(scriptingManager: ScriptingManager) {
    this.scriptingManager = scriptingManager
  }

  setup() {
    this.actionMenu.setup()
    this.setupCodeMirror()
  }

  private setupCodeMirror() {
    defineMarsWalkMode()
    this.codeMirrorWrapperDiv = document.getElementById('code_mirror') as HTMLDivElement

    this.codeMirror = CodeMirror(this.codeMirrorWrapperDiv, {
      theme: 'bespin',
      mode: 'marswalk',
      value: '',
      lineNumbers: true,
      lint: {
        getAnnotations: MarsWalkLinter,
        async: false
      },
      gutters: ['CodeMirror-lint-markers'],
      cursorBlinkRate: 500,
      readOnly: true
    })
    this.codeMirror.setOption('autoCloseBrackets', true)
    this.codeMirror.on('change', _ => this.scriptingManager.stop())

    this.codeMirrorDiv = document.querySelector('.CodeMirror') as HTMLDivElement

    window.addEventListener('resize', _ => this.onResize())
    this.onResize()
  }

  private onResize() {
    const height = this.codeMirrorWrapperDiv.getBoundingClientRect().height
    console.log('[Code Editor] Resize', window.innerHeight, height)
    this.codeMirrorDiv.style.height = `${height}px`
  }

  displayExecutor(executor: Executor<Instruction>) {
    this.codeMirror
      .getDoc()
      .getAllMarks()
      .forEach(marker => marker.clear())
    this.codeMirror.getDoc().markText(
      {
        line: executor.instruction.section.start.line - 1,
        ch: executor.instruction.section.start.character
      },
      {
        line: executor.instruction.section.end.line - 1,
        ch: executor.instruction.section.end.character
      },
      {
        className: 'current-instruction'
      }
    )
  }
}

export default CodeEditor
