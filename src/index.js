const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');

if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  const mainMenu = Menu.buildFromTemplate([]);
  Menu.setApplicationMenu(mainMenu);
  const mainWindow = new BrowserWindow({
    width: 880,
    height: 880,
    resizable: false,
    frame: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.webContents.openDevTools();
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});


// File handling 
const usersFilePath = 'users.json';
if (!fs.existsSync(usersFilePath)) {
  fs.writeFileSync(usersFilePath, '[]', 'utf-8');
}

//  ipcHandling
const users = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));

ipcMain.handle('login', async (event, data) => {
  const user = users.find(u => u.username === data.username || u.email === data.email);
  if (data.username == '' || data.password == '' || data.email == '') {
    return { msg: 'Fill all the fields.', userData: null, status: 'warning' };
  }
  if (user && bcrypt.compareSync(data.password, user.passwordHash)) {
    console.log('Login successful', user);
    let d = { msg: 'Login successful', userData: user, status: 'success' }
    return d;
  } else {
    console.log('Invalid username or password');
    let d = { msg: 'Invalid username or password', userData: '', status: 'danger' };
    return d;
  }
});

const isStrongPassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

ipcMain.handle('signup', (event, data) => {
  try {
    const users = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
    if (data.username == '' || data.password == '' || data.email == '') {
      return { msg: 'Fill all the fields.', userData: null, status: 'warning' };
    }
    if (data.password.length < 8) {
      return { msg: 'Password length i not enough. Please use a longer password.', userData: null, status: 'warning' };
    }
    if (!isStrongPassword(data.password)) {
      return { msg: 'Weak password. Please use a stronger password.', userData: null, status: 'warning' };
    }
    if (!isValidEmail(data.email)) {
      return { msg: 'Invalid email address.', userData: null, status: 'warning' };
    }
    if (users.some(u => u.username === data.username)) {
      return { msg: 'Username already taken', userData: null, status: 'danger' };
    }
    if (users.some(e => e.email === data.email)) {
      return { msg: 'Email already taken', userData: null, status: 'danger' };
    }

    const saltRounds = 10;
    const passwordHash = bcrypt.hashSync(data.password, saltRounds);
    const newUser = {
      username: data.username,
      email: data.email,
      passwordHash: passwordHash,
    };

    users.push(newUser);
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
    console.log('New user:', newUser);

    return { msg: 'User registered successfully', userData: newUser, status: 'success' };
  } catch (error) {
    console.error('Error registering user:', error);
    return { msg: 'Error registering user', userData: null, status: 'danger' };
  }
});




ipcMain.handle('send-otp', async (event, data) => {
  let userEmail = data.email;
  console.log(data);

  if (userEmail === undefined || userEmail === '') {
    return { msg: 'Please enter your email.', userData: null, status: 'warning' };
  }
  if (!isValidEmail(userEmail)) {
    return { msg: 'Invalid email address.', userData: null, status: 'warning' };
  }

  const otp = randomstring.generate({
    length: 6,
    charset: 'numeric'
  });

  console.log(otp);

  // Configure nodemailer with your email service provider settings
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'newan2003test@gmail.com',
      pass: 'wloi ncbk unjb vvob'
    }
  });

  // Email content with OTP
  const mailOptions = {
    from: 'newan2003test@gmail.com',
    to: `${userEmail}`,
    subject: 'OTP for Verification',
    text: `Your OTP is: ${otp}. Use this code to verify your account.`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    let d = { "info": info, "otp": otp };
    console.log('Email sent:', info);
    return { msg: 'Please check your email.', userData: d, status: 'success' };
  } catch (error) {
    console.error('Error sending email:', error);
    return { msg: 'Error sending email.', userData: null, status: 'danger' };
  }
});

const captchaFilePath = 'captcha.json';
if (!fs.existsSync(captchaFilePath)) {
  fs.writeFileSync(captchaFilePath, '[]', 'utf-8');
}

//  ipcHandling
const captchas = JSON.parse(fs.readFileSync(captchaFilePath, 'utf-8'));
// console.log(captchas);
ipcMain.handle('get-captcha-list', async () => {
  try {
    return { msg: 'CAPTCHA list.', userData: captchas, status: 'warning' };
    // return await captchas;
  } catch (error) {
    captchas = [];
    console.error('Error reading CAPTCHA file during initialization:', error);
    return { msg: 'Error reading CAPTCHA.', userData: [], status: 'danger' };
  }
});

ipcMain.handle('validate-captcha', async (event, data) => {
  try {

    // console.log('Received data:', data);

    // const { filePath, value } = data.captcha;
    // console.log('Captcha filePath:', filePath);
    // console.log('Captcha value:', value);
    // console.log('User value:', data.response);

    // const correctCaptcha = captchas.find(c => c.filePath === filePath || c.value === value);
    // console.log('Correct Captcha:', correctCaptcha);

    // if (!correctCaptcha) {
    //   // throw new Error(`Captcha not found for filePath: ${filePath}`);
    //   return { msg: 'Captcha not found for filePath.', userData: `Captcha not found for filePath: ${filePath}`, status: 'warning' };
    // }

    // const success = data.response === correctCaptcha.value;
    // console.log('Success:', success);
    // if(success === true) {
    //   return { msg: 'CAPTCHA success.', userData: success, status: 'success' };
    // }
    // else {
    //   return { msg: 'CAPTCHA failed.', userData: failed, status: 'danger' };
    // }

    let captcha = data.captcha.value;
    let userVal = data.response;

    console.log(captcha);
    console.log(userVal);

    if(userVal === undefined || userVal === null || userVal === '') {
      return { msg: 'Please enter your CAPTCHA.', userData: null, status: 'warning' };
    }
    if(captcha === userVal) {
      return { msg: 'CAPTCHA success.', userData: true, status: 'success' };
    }

    if(captcha !== userVal) {
      return { msg: 'Invalid CAPTCHA.', userData: null, status: 'danger' };
    }

  } catch (error) {
    console.error('Error validating CAPTCHA:', error.message);
    return { msg: 'Error validating CAPTCHA.', userData: null, status: 'danger' };
  }
});

