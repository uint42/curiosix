import Dexie from 'dexie'
import FileTypeManager from './FileTypeManager'

class FileManager extends Dexie {
  scriptFileTypeManager: FileTypeManager
  worldFileTypeManager: FileTypeManager

  constructor() {
    super('CuriosiX-Files')
    this.version(1).stores({
      scripts: 'name,data',
      worlds: 'name,data'
    })
  }

  async start() {
    await this.open()
    this.scriptFileTypeManager = new FileTypeManager('script', this)
    this.worldFileTypeManager = new FileTypeManager('world', this)
  }
}

export default FileManager
