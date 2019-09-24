import { Parser, ParserResult } from '../Parser'
import { Instruction, CodeSection } from '../../../../casl/Instruction'
import { Line } from '../../../Compiler'
import NativeInvocationInstruction from '../../../../casl/actions/NativeInvocationInstruction'
import FunctionInvocationInstruction from '../../../../casl/actions/FunctionInvocationInstruction'
import SectionParser from '../SectionParser'
import WhileParser from './WhileParser'
import WhenParser from './WhenParser'
import { match, matchTrimmed } from '../../../../../../utils/RegexUtils'
import { EntityColor, getColorByName } from '../../../../../../entity/utils/EntityColor'

class RegularParser extends Parser {
  instructions: Instruction[] = []
  currentParser: SectionParser
  functionCallLines: Line[] = []

  parseLine(line: Line): boolean {
    console.log('[Parser] Parsing line using regular parser')
    if (this.currentParser !== undefined) {
      console.log('[Parser] Parsing line using different section parser')
      if (!this.currentParser.parseLine(line)) {
        const result = this.currentParser.getResult()
        this.errors = this.errors.concat(result.errors)
        this.instructions.push(result.results as Instruction)
        this.currentParser = undefined
      }
      return true
    } else {
      if (WhileParser.isWhileLoop(line.line)) {
        console.log('[Parser] Line indicated start of a while loop')
        this.currentParser = new WhileParser(this.compilerInstance)
        this.currentParser.parseLine(line)
        return true
      } else if (WhenParser.isWhen(line.line)) {
        console.log('[Parser] Line indicated start of an if statement')
        this.currentParser = new WhenParser(this.compilerInstance)
        this.currentParser.parseLine(line)
        return true
      }
    }

    this.functionCallLines.push(line)

    return true
  }

  parseFunctionCall(line: Line): boolean {
    const functionIndex = this.compilerInstance.functionNames.indexOf(line.trimmedLine)

    if (functionIndex > -1) {
      console.log('[Parser] Line calls another user defined function')
      this.instructions.push(new FunctionInvocationInstruction(line.trimmedSection, this.compilerInstance.functionNames[functionIndex]))
      return true
    }

    if (matchTrimmed(line.trimmedLine, /\S{1,}\(\S*\)/)) {
      console.log('[Parser] Function call has argument')
      const splitted = line.trimmedLine.split('(')
      if (splitted.length !== 2) {
        this.errors.push({
          message: 'Internal error, please open an issue on GitHub',
          section: line.trimmedSection
        })
        return true
      }
      const commandName = splitted[0]
      const argument = splitted[1].substring(0, splitted[1].length - 1)
      const argumentSection: CodeSection = {
        start: {
          line: line.trimmedSection.start.line,
          character: line.trimmedSection.start.character + commandName.length
        },
        end: line.trimmedSection.end
      }
      console.log('[Parser] Extracted argument:', argument)
      if (NATIVE_METHODS_WITH_ARG[commandName] !== undefined) {
        const buildInstruction = NATIVE_METHODS_WITH_ARG[commandName]
        const result = buildInstruction(argument)
        if (result.error) {
          this.errors.push({
            section: argumentSection,
            message: result.errorMessage
          })
        } else {
          this.instructions.push(new NativeInvocationInstruction(line.trimmedSection, result.name, result.arguments))
        }
      } else {
        if (NATIVE_METHODS_NO_ARG[commandName] !== undefined) {
          this.errors.push({
            message: `Die Anweisung "${commandName.charAt(0).toUpperCase() + commandName.substring(1).toLowerCase()}" akzeptiert keine Argumente`,
            section: argumentSection
          })
        } else {
          this.errors.push({
            message: 'Unbekannte Anweisung/Funktion',
            section: line.trimmedSection
          })
        }
      }
    } else {
      console.log('[Parser] Function call has no arguments')
      const nativeMethod = NATIVE_METHODS_NO_ARG[line.trimmedLine]
      if (nativeMethod !== undefined) {
        this.instructions.push(new NativeInvocationInstruction(line.trimmedSection, nativeMethod.name, nativeMethod.arguments))
      } else {
        console.log('[Parser] Unknown function')
        this.errors.push({
          message: 'Unbekannte Anweisung/Funktion',
          section: line.trimmedSection
        })
      }
    }

    return true
  }

  getResult(): ParserResult {
    this.functionCallLines.forEach(line => this.parseFunctionCall(line))
    return {
      errors: this.errors,
      results: this.instructions
    }
  }
}

const NATIVE_METHODS_NO_ARG = {
  schritt: {
    name: 'moveForward',
    arguments: [1]
  },
  rechtsdrehen: {
    name: 'rotate',
    arguments: [90]
  },
  linksdrehen: {
    name: 'rotate',
    arguments: [-90]
  },
  ton: {
    name: 'playSound',
    arguments: []
  },
  beenden: {
    name: 'stop',
    arguments: []
  },
  schnell: {
    name: 'speed',
    arguments: [0_100]
  },
  langsam: {
    name: 'speed',
    arguments: [1_000]
  },
  markesetzen: {
    name: 'marker',
    arguments: ['place', EntityColor.YELLOW]
  },
  markelöschen: {
    name: 'marker',
    arguments: ['delete', undefined]
  },
  hinlegen: {
    name: 'brick',
    arguments: ['place', 1, EntityColor.RED]
  },
  aufheben: {
    name: 'brick',
    arguments: ['delete', 1, undefined]
  }
}

const NATIVE_METHODS_WITH_ARG = {
  schritt: function(argument: string) {
    if (!match(argument, /-?[0-9]{1,}/)) {
      return {
        error: true,
        errorMessage: 'Die Distanz muss eine Zahl sein'
      }
    }

    const distance = +argument

    if (distance <= 0) {
      return {
        error: true,
        errorMessage: 'Die Distanz muss größer als 0 sein'
      }
    }

    return {
      error: false,
      name: 'moveForward',
      arguments: [distance]
    }
  },
  warten: function(argument: string) {
    if (!match(argument, /-?[0-9]{1,}/)) {
      return {
        error: true,
        errorMessage: 'Die Zeit muss eine Zahl sein'
      }
    }

    const time = +argument //in ms

    if (time <= 0) {
      return {
        error: true,
        errorMessage: 'Die Zeit muss größer als 0 sein'
      }
    }

    return {
      error: false,
      name: 'wait',
      arguments: [time]
    }
  },
  markesetzen: function(argument: string) {
    let color: EntityColor
    try {
      color = getColorByName(argument)
    } catch (e) {
      return {
        error: true,
        errorMessage: 'Die Farbe muss entweder Rot, Gelb, Blau, Grün oder Schwarz sein'
      }
    }
    return {
      error: false,
      name: 'marker',
      arguments: ['place', color]
    }
  },
  hinlegen: function(argument: string) {
    let amount = 1
    let color = EntityColor.RED

    if (match(argument, /-?[0-9]{1,}/)) {
      amount = +argument
      if (amount < 1) {
        return {
          error: true,
          errorMessage: 'Die Anzahl von Ziegeln muss größer als 0 sein'
        }
      }
    } else {
      try {
        color = getColorByName(argument)
      } catch (e) {
        return {
          error: true,
          errorMessage: 'Argument muss entweder die Farbe des Ziegels oder die Anzahl der Ziegel sein'
        }
      }
    }

    return {
      error: false,
      name: 'brick',
      arguments: ['place', amount, color]
    }
  },
  aufheben: function(argument: string) {
    if (!match(argument, /-?[0-9]{1,}/)) {
      return {
        error: true,
        errorMessage: 'Die Anzahl von Ziegeln muss eine Zahl sein'
      }
    }

    const amount = +argument
    if (amount < 1) {
      return {
        error: true,
        errorMessage: 'Die Anzahl von Ziegeln muss größer als 0 sein'
      }
    }

    return {
      error: false,
      name: 'brick',
      arguments: ['delete', amount, undefined]
    }
  }
}

export default RegularParser
