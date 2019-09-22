import CASLProgram from '../casl/CASLProgram'
import { Queue } from 'queue-typescript'
import { Instruction, InstructionType } from '../casl/Instruction'
import FunctionDeclarationInstruction from '../casl/actions/FunctionDeclarationInstruction'
import Executor from './Executor'
import FunctionInvocationInstruction from '../casl/actions/FunctionInvocationInstruction'
import FunctionInvocationExecutor from './executer/FunctionInvocationExecutor'
import NativeInvocationInstruction from '../casl/actions/NativeInvocationInstruction'
import { NativeInvocationExecutor } from './executer/NativeInvocationExecutor'
import curiosix from '../../../main'
import WhileLoopExectutor from './executer/WhileLoopExecutor'
import WhileLoopInstruction from '../casl/actions/WhileLoopInstruction'
import ConditionalStatementExecutor from './executer/ConditionalStatementExecutor'
import ConditionalStatementInstruction from '../casl/actions/ConditionalStatementInstruction'
import Swal from 'sweetalert2'

class Interpreter {
  isRunning: Boolean = false

  static EXECUTION_TIME_PER_INSTRUCTION: number = 500 /* ms */
  static updateExecutionTime(newSpeed: number) {
    if (curiosix.scriptingManager.interpreter) {
      curiosix.scriptingManager.interpreter.currentExecutionTime *= +newSpeed / Interpreter.EXECUTION_TIME_PER_INSTRUCTION
    }
    Interpreter.EXECUTION_TIME_PER_INSTRUCTION = newSpeed
  }

  currentExecutionTime: number
  currentExecutor?: Executor<any>

  program: CASLProgram
  executionQueue: Queue<Instruction> = new Queue()
  functions: Map<String, FunctionDeclarationInstruction> = new Map<String, FunctionDeclarationInstruction>()

  constructor(program: CASLProgram) {
    this.program = program
  }

  interpret() {
    this.currentExecutionTime = Interpreter.EXECUTION_TIME_PER_INSTRUCTION
    this.program.functions.forEach(f => {
      this.functions.set(f.functionName.toLowerCase(), f)
    })
    this.executionQueue.append(
      new FunctionInvocationInstruction({ start: { line: -1, character: 0 }, end: { line: -1, character: 0 } }, this.program.functions[this.program.mainFunction].functionName.toLowerCase())
    )
  }

  update(estimatedTime) {
    if (!this.isRunning) return

    if (this.currentExecutionTime >= (this.currentExecutor ? this.currentExecutor.executionTime : Interpreter.EXECUTION_TIME_PER_INSTRUCTION)) {
      if (this.currentExecutor) {
        this.currentExecutor.finalise()
        this.executionQueue.removeHead()
      }

      if (this.executionQueue.length <= 0) {
        curiosix.scriptingManager.stop()
        return
      }

      let instruction: Instruction = this.executionQueue.head
      if (instruction.type === InstructionType.FUNCTION_INVOCATION) {
        this.currentExecutor = new FunctionInvocationExecutor(instruction as FunctionInvocationInstruction)
      } else if (instruction.type === InstructionType.NATIVE_INVOCATION) {
        this.currentExecutor = new NativeInvocationExecutor(instruction as NativeInvocationInstruction)
      } else if (instruction.type === InstructionType.WHILE_LOOP) {
        this.currentExecutor = new WhileLoopExectutor(instruction as WhileLoopInstruction<any>)
      } else if (instruction.type === InstructionType.CONDITIONAL_STATEMENT) {
        this.currentExecutor = new ConditionalStatementExecutor(instruction as ConditionalStatementInstruction<any>)
      } else {
        curiosix.scriptingManager.stop()
        Swal.fire('Interpreter Error', `Can\'t find executor for ${instruction.type}`, 'error')
      }

      let error = this.currentExecutor.init()

      if (error) {
        curiosix.scriptingManager.stop()
        Swal.fire('Interpreter Error', `Error: ${error}`, 'error')
      }
      curiosix.scriptingManager.codeEditor.displayExecutor(this.currentExecutor)

      this.currentExecutionTime = 0
    }

    const progress = this.currentExecutionTime / this.currentExecutor.executionTime
    const estimatedProgress = estimatedTime / this.currentExecutor.executionTime

    try {
      if (this.currentExecutor) this.currentExecutor.execute(progress, estimatedProgress)
    } catch (e) {
      curiosix.scriptingManager.stop()
      Swal.fire({
        title: 'Ausführungsfehler',
        text: e.toString()
      })
    }

    this.currentExecutionTime += estimatedTime
  }

  error(message: string) {}
}

export default Interpreter
