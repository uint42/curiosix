import Interpreter from './language/interpreter/Interpreter'
import curiosix from '../main'
import MarsWalkCompiler from './language/compiler/marswalk/MarsWalkCompiler'
import CodeEditor from './gui/CodeEditor'

class ScriptingManager {
  interpreter?: Interpreter
  codeEditor: CodeEditor

  constructor() {
    this.codeEditor = new CodeEditor(this)
    this.codeEditor.setup()
  }

  update(estimatedTime: number) {
    if (this.interpreter) {
      this.interpreter.update(estimatedTime)
    }
  }

  start(sourceCode: string) {
    const compiler = new MarsWalkCompiler()
    const compilerResult = compiler.compile(sourceCode)
    if (compilerResult.executable) {
      curiosix.world.reset()
      this.interpreter = new Interpreter(compilerResult.program)
      this.interpreter.interpret()
      this.interpreter.isRunning = true
    } else {
      console.warn(compilerResult.errors)
    }
    this.codeEditor.actionMenu.started()
  }

  stop() {
    this.codeEditor.codeMirror
      .getDoc()
      .getAllMarks()
      .forEach(marker => marker.clear())
    this.codeEditor.codeMirror.setOption('readOnly', false)
    if (this.interpreter) this.interpreter.isRunning = false
    this.codeEditor.actionMenu.stoped()
  }
}

export default ScriptingManager
