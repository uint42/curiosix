export abstract class Instruction {
  abstract type: InstructionType
  section: CodeSection

  constructor(section: CodeSection) {
    this.section = section
  }
}

export type CodeSection = {
  start: {
    line: number
    character: number
  }
  end: {
    line: number
    character: number
  }
}

export enum InstructionType {
  NATIVE_INVOCATION = 'NATIVE_INVOCATION',

  FUNCTION_DECLARATION = 'FUNCTION_DECLARATION',
  FUNCTION_INVOCATION = 'FUNCTION_INVOCATION',

  CONDITIONAL_STATEMENT = 'CONDITIONAL_STATEMENT',
  WHILE_LOOP = 'WHILE_LOOP'
}
