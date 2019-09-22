import { CodeSection, Instruction } from '../../../../casl/Instruction'
import { Error } from '../../../Compiler'
import NativeInvocationInstruction from '../../../../casl/actions/NativeInvocationInstruction'

export class RegularParser {
  lines: LineOld[]
  errors: Error[] = []
  instructions: Instruction[] = []

  constructor(lines: LineOld[]) {
    this.lines = lines
  }

  parse() {
    this.lines.forEach(line => {
      const result = this.parseNativeMethod(line)
      if (result instanceof Instruction) {
        this.instructions.push(result)
      } else {
        this.errors.push(result)
      }
    })
  }

  private parseNativeMethod(line: LineOld): Instruction | Error {
    if (line.lineText.split(' ').length !== 1) {
      return {
        message: 'Unzulässige Syntax',
        section: line.section
      }
    }

    switch (line.lineText.toLowerCase()) {
      case 'schritt': {
        return new NativeInvocationInstruction(line.section, 'moveForward', [1])
      }
      case 'linksdrehen': {
        return new NativeInvocationInstruction(line.section, 'rotate', [-90])
      }
      case 'rechtsdrehen': {
        return new NativeInvocationInstruction(line.section, 'rotate', [90])
      }
      default: {
        return {
          message: 'Unbekannte Anweisung',
          section: line.section
        }
      }
    }
  }
}

/**
 * @deprecated
 */
export type LineOld = {
  lineText: string
  section: CodeSection
}
