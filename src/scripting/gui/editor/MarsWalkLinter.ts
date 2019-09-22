import MarsWalkCompiler from '../../language/compiler/marswalk/MarsWalkCompiler'

import * as CodeMirror from 'codemirror'
import 'codemirror/addon/lint/lint.css'
import 'codemirror/addon/lint/lint.js'
import curiosix from '../../../main'

export default (text: string) => {
  //Bad practice
  if (curiosix && curiosix.fileManager && text !== '') curiosix.fileManager.scriptFileTypeManager.updateCurrent(text)
  const compiler = new MarsWalkCompiler()
  const result = compiler.compile(text)

  return result.errors.map(error => {
    return {
      from: {
        line: error.section.start.line - 1,
        ch: error.section.start.character
      },
      to: {
        line: error.section.end.line - 1,
        ch: error.section.end.character
      },
      message: error.message,
      severity: error.level || 'error'
    }
  })
}
