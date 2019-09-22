import CASLProgram from '../casl/CASLProgram'
import { CodeSection } from '../casl/Instruction'

export abstract class Compiler {
  abstract compile(code: string): CompilerResult
}

export type Error = {
  section: CodeSection
  message: string
  level?: 'error' | 'warning' | 'fatal'
}

export type Line = {
  line: string
  trimmedLine: string
  section: CodeSection
  trimmedSection: CodeSection
}

export type CompilerResult = {
  errors: Error[]
  program: CASLProgram
  executable: boolean
}
