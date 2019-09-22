import * as CodeMirror from 'codemirror'
import 'codemirror/addon/mode/simple'
import { unwatchFile } from 'fs'

export function defineMarsWalkMode() {
  CodeMirror['defineSimpleMode']('marswalk', {
    start: [
      //start of a multi-line comment "{"
      { regex: /\{/, token: 'comment', next: 'comment' },

      //"Anweisung"/custom instruction with name
      { regex: /(anweisung )([a-z$][\w$]*)/i, token: ['keyword', 'property'], indent: true },
      //"solange"/while instruction with condition
      { regex: /(solange )([a-z$][\w$]*)( tue)?/i, token: ['keyword', 'property', 'keyword'], indent: true },
      //"wenn"/if instruction with condition
      { regex: /(wenn )([a-z$][\w$]*)( (dann|sonst))?/i, token: ['keyword', 'property', 'keyword'], indent: true },
      //"wenn/sonst" / if/else keyword
      { regex: /dann|sonst/i, token: 'keyword' },

      //all types of instruction
      { regex: /(anweisung|programm|wenn|solange)/i, token: 'keyword', indent: true },
      //end of an instruction
      { regex: /(\*)(anweisung|programm|wenn|solange)/i, token: ['bracket', 'keyword'], dedent: true },

      //numbers (like 1, 2, 3, -4, 0, but no 1.1 or 4,5)
      { regex: /(\-)?\d{1,}/, token: 'number' },
      //brackets "(" and ")"
      { regex: /(\(|\))/, token: 'bracket' },
      //normal instruction (like "Schritt")
      { regex: /[a-z]{1,}/i, token: 'variable-2' }
    ],
    comment: [
      //ending of a multi-line comment "{"
      { regex: /.*?\}/, token: 'comment', next: 'start' },
      //content of a multi-line comment { "..." }
      { regex: /.*/, token: 'comment' }
    ],
    meta: {
      dontIndentStates: ['comment']
    }
  })
}
