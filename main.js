const path = require('path')
const os = require('os')
const fs = require('fs')
const resizeImg = require('resize-img')
const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron')

const isDev = process.env.NODE_ENV !== 'production'

const isMac = process.platform === 'darwin'

let window
let aboutWindow


/**
 * Creates and configures a new Electron BrowserWindow instance.
 * The window size and developer tools are conditionally set based on the environment.
 * Loads the application's main HTML file into the window.
 */
const createWindow = () => {
  window = new BrowserWindow({
    width: isDev ? 1000 : 800,
    height: isDev ? 800 : 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: true // Set to false for compatibility with older code
    }
  })

  if (isDev) {
    window.webContents.openDevTools()
  }

  window.loadFile(path.join(__dirname, './renderer/index.html'))
}

/*
* Create the about window
*/
const createAboutWindow = () => {
  aboutWindow = new BrowserWindow({
    width: 300,
    height: 300,
    title: 'About Image Resizer',
    modal: true,
    parent: BrowserWindow.getFocusedWindow(),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js'),
    }
  })

  aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'))
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

//respond to the ipcRenderer resize request
ipcMain.on('image:resize', (e, options) => {
  options.dest = path.join(os.homedir(), '\\Documents\\ImageResizer');
  resizeImage(options);

})

//resize the image

const resizeImage = async ({ imgPath, width, height, dest }) => {
  try {
    // Resize image
    const newPath = await resizeImg(fs.readFileSync(imgPath), {
      width: +width,
      height: +height,
    });

    // Get filename
    const filename = path.basename(imgPath);

    // Create destination folder if it doesn't exist
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }

    // Write the file to the destination folder
    fs.writeFileSync(path.join(dest, filename), newPath);

    // Send success to renderer
    window.webContents.send('image:done');

    // Open the folder in the file explorer
    shell.openPath(dest);
  } catch (err) {
    console.log(err);
  }
}

app.on('window-all-closed', () => {
  if (!isMac) app.quit()
})