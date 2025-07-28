const path = require('path')
const { app, BrowserWindow, Menu } = require('electron')

const isDev = process.env.NODE_ENV !== 'production'

const isMac = process.platform === 'darwin'


/**
 * Creates and configures a new Electron BrowserWindow instance.
 * The window size and developer tools are conditionally set based on the environment.
 * Loads the application's main HTML file into the window.
 */
const createWindow = () => {
  const win = new BrowserWindow({
    width: isDev ? 1000 : 800,
    height: isDev ? 800 : 600
  })

  if (isDev) {
    win.webContents.openDevTools()
  }

  win.loadFile(path.join(__dirname, './renderer/index.html'))
}

/*
* Create the about window
*/
const createAboutWindow = () => {
  const aboutWin = new BrowserWindow({
    width: 300,
    height: 300,
    title: 'About Image Resizer',
    modal: true,
    parent: BrowserWindow.getFocusedWindow(),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  aboutWin.loadFile(path.join(__dirname, './renderer/about.html'))
}

/*
* Start the app
* This will create the main window and set up the menu
* It also handles the activation of the app on macOS
*/
app.whenReady().then(() => {
  createWindow()

  /*
  * Set up the application menu
  */
  const mainMenu = Menu.buildFromTemplate(menu)
  Menu.setApplicationMenu(mainMenu)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

/*
* Menu Template
*/
const menu = [
  ...(isMac ? [{
    label: app.name,
    submenu: [{
      label: 'About',
      click: createAboutWindow
    }]
  }] : []),
  {
    label: 'File',
    submenu: [
      {
        label: 'Quit',
        click: () => app.quit(),
        accelerator: 'CmdOrCtrl+Q'
      }
    ]
  },
  ...(!isMac ? [{
    label: 'Help',
    submenu: [{
      label: 'About',
      click: createAboutWindow
    }]
  }] : [])
]

app.on('window-all-closed', () => {
  if (!isMac) app.quit()
})