type Theme = 'light' | 'dark'

class ThemeChanger {
  private static _theme: Theme

  static setup() {
    this.theme = (localStorage.getItem('theme') as Theme) || 'dark'
  }

  public static set theme(v: Theme) {
    this._theme = v
    localStorage.setItem('theme', v)
    if (this._theme === 'light') {
      document.body.classList.add('light')
    } else {
      document.body.classList.remove('light')
    }
  }

  public static toggle() {
    if (this.theme === 'dark') {
      this.theme = 'light'
    } else {
      this.theme = 'dark'
    }
  }

  public static get theme(): Theme {
    return this._theme
  }
}

export default ThemeChanger
