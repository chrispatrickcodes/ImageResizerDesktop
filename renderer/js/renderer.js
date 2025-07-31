const form = document.querySelector('#img-form')
const img = document.querySelector('#img')
const outputPath = document.querySelector('#output-path')
const filename = document.querySelector('#filename')
const heightInput = document.querySelector('#height')
const widthInput = document.querySelector('#width')

const loadImage = (e) => {
  const file = e.target.files[0]

  if (!isFileImage(file)) {
    alertError('Please select a valid image file (gif, jpeg, png)')
    return
  }

  // Get OG dimensions
  const image = new Image()
  image.src = URL.createObjectURL(file)
  image.onload = () => {
    heightInput.value = image.height
    widthInput.value = image.width
  }

  form.style.display = 'block'
  filename.innerText = file.name
  outputPath.innerText = path.join(os.homedir(), 'ImageResizer', file.name)
}

//send image data to main process
const resizeImage = (e) => {
  e.preventDefault()

  const height = heightInput.value
  const width = widthInput.value
  const file = img.files[0]
  const imgPath = webUtils.getPathForFile(file)

  if (!file) {
    alertError('Please select an image')
    return
  }

  if (height === '' || width === '' || isNaN(height) || isNaN(width)) {
    alertError('Please enter valid dimensions')
    return
  }

  //Send data to main using ipcRenderer
  ipcRenderer.send('image:resize', {
    imgPath,
    width,
    height
  })
}

//Make sure the file is an image
const isFileImage = (file) => {
  const acceptedTypes = ['image/gif', 'image/jpeg', 'image/png']
  return file && acceptedTypes.includes(file['type'])
}

// When done, show message
ipcRenderer.on('image:done', () =>
  alertSuccess(`Image resized to ${heightInput.value} x ${widthInput.value}`)
);

//alert an error
const alertError = (message) => {
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: 'red',
      color: 'white',
      textAlign: 'center'
    }
  })
}
// alert a success
const alertSuccess = (message) => {
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: 'green',
      color: 'white',
      textAlign: 'center'
    }
  })
}

img.addEventListener('change', loadImage)
form.addEventListener('submit', resizeImage)