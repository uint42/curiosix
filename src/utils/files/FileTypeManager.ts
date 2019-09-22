import FileManager from './FileManager'
import Dexie from 'dexie'
import FileSelector from './FileSelector'
import ScriptFileSelector from './selector/ScriptFileSelector'
import WorldFileSelector from './selector/WorldFileSelector'

class FileTypeManager {
  fileManager: FileManager
  type: 'script' | 'world'
  table: Dexie.Table<IFile, string>
  fileSelector: FileSelector

  constructor(type: 'script' | 'world', fileManagerInstance: FileManager) {
    this.type = type
    this.fileManager = fileManagerInstance

    this.table = this.fileManager.table(type + 's')

    if (type === 'script') {
      this.fileSelector = new ScriptFileSelector(this)
    } else {
      this.fileSelector = new WorldFileSelector(this)
    }
    this.fileSelector.setup()
  }

  async exists(fileName: string) {
    return (
      (await this.table
        .where('name')
        .equalsIgnoreCase(fileName.trim())
        .toArray()).length > 0
    )
  }

  async get(fileName: string) {
    return await this.table.get(fileName.trim())
  }

  async new(fileName: string, data: any) {
    if (await this.exists(fileName)) throw new Error('File already exists')

    await this.table.put({
      name: fileName.trim(),
      data: data
    })
    return await this.table.get(fileName)
  }

  async update(fileName: string, data: any) {
    if (!this.exists(fileName)) {
      this.new(fileName, data)
    } else {
      await this.table.update(fileName.trim(), { data: data })
    }
  }

  async delete(fileName: string) {
    await this.table.delete(fileName.trim())
  }

  async all() {
    return await this.table.toArray()
  }

  async rename(oldFileName: string, newFileName: string) {
    const data = (await this.get(oldFileName)).data
    await this.delete(oldFileName)
    if (await this.exists(newFileName)) {
      throw new Error('File with new name already exists')
    }

    return await this.new(newFileName, data)
  }

  async updateCurrent(newData: any) {
    if (!this.fileSelector.currentFileName) {
      console.warn('Failed to update current file')
      return
    }
    await this.update(this.fileSelector.currentFileName, newData)
  }
}

export type IFile = {
  name: string
  data: any
}

export default FileTypeManager
