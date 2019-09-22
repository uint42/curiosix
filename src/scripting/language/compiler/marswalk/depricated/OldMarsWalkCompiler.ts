import { Compiler, Error, CompilerResult } from '../../Compiler'
import CASLProgram from '../../../casl/CASLProgram'
import NativeInvocationInstruction from '../../../casl/actions/NativeInvocationInstruction'
import FunctionDeclarationInstruction from '../../../casl/actions/FunctionDeclarationInstruction'
import { CodeSection } from '../../../casl/Instruction'

/**
 * This compiler is very old and depricated
 * @deprecated
 */
class OldMarsWalkCompiler extends Compiler {
  compile(code: string): CompilerResult {
    let errors: Error[] = []
    let nativeInvocations: NativeInvocationInstruction[] = []
    let currentLine = 0
    code.split('\n').forEach(line => {
      currentLine++
      if (line === '') return
      let currentSection: CodeSection = {
        start: {
          line: currentLine,
          character: 0
        },
        end: {
          line: currentLine,
          character: line.length
        }
      }
      if (line.match(/[A-z]{1,}/)) {
        switch (line.toLowerCase()) {
          case 'schritt': {
            nativeInvocations.push(new NativeInvocationInstruction(currentSection, 'moveForward', [1]))
            break
          }
          case 'linksdrehen': {
            nativeInvocations.push(new NativeInvocationInstruction(currentSection, 'rotate', [-90]))
            break
          }
          case 'rechtsdrehen': {
            nativeInvocations.push(new NativeInvocationInstruction(currentSection, 'rotate', [90]))
            break
          }
          default: {
            errors.push({
              message: 'Unknown command',
              section: currentSection
            })
          }
        }
      } else {
        errors.push({
          message: 'Invalid syntax',
          section: currentSection
        })
        return
      }
    })

    return {
      errors: errors,
      program: new CASLProgram(
        code,
        [
          new FunctionDeclarationInstruction(
            {
              start: {
                line: 0,
                character: 0
              },
              end: {
                line: 1,
                character: 0
              }
            },
            'main',
            nativeInvocations
          )
        ],
        0
      ),
      executable: errors.length === 1
    }
  }
}

export default OldMarsWalkCompiler
