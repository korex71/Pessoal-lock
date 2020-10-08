const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = require('electron-is-dev');
const Datastore = require('nedb'),
 db = new Datastore({ filename: 'list.pdb', autoload: true });
const {login, hashKey} = require('./db/ops');
const {decrypt, encrypt} = require('./crypto');

let appPath;
let keyPath;

if(isDev){
  appPath = __dirname;
  keyPath = path.resolve(__dirname, '..', 'key.plock');
}else{
  appPath = path.resolve(__dirname, '..', '..', '..');
  keyPath = path.resolve(appPath, 'key.plock');
};

const MasterExists = fs.existsSync(keyPath);

let mainWindow;
let loginWindow;
let editWindow;

ipcMain.on('accounts', async (event, args) => {
  const {opt} = args;
  console.log('*** Option: ', opt);
  if(opt == 'newAccount'){
    let schema = args.content;
    schema.platform = schema.platform.toLowerCase();
    schema.password = encrypt(schema.password, keyPath);
    db.insert(schema, function (err, inserted) {
      console.log(inserted);
    });
  }else if(opt == 'listAccounts'){
    db.find({}, function (err, docs) {
      event.reply('listAccounts', docs);
    });
  }else if(opt == 'listAccount'){
    db.find({}, function (err, docs) {
      event.reply('listAccount', docs);
    });
  }else if(opt == 'decPassword'){
    const _id = args.content._id;
    db.findOne({_id}, function (err, doc) {
      const dec = decrypt(doc.password, keyPath);
      event.reply('decPassword', {
        id: _id,
        dec
      });
    })
  }else if(opt == 'delete'){
    const _id = args.content._id;
    db.remove({_id}, function (err, removed) {
      event.reply('reload', true);
    });
  };
});

ipcMain.on('login', (event, pass) => {
  if(MasterExists)
    login(event, pass, createMain, loginWindow, keyPath);
  else
    hashKey(event, pass, app);
});

ipcMain.on('firstUse', (event) => {
  if(MasterExists)
    event.reply('firstUse', false);
  else
    event.reply('firstUse', true);
});

ipcMain.on('editAccount', (event, _id) => {
  db.findOne({_id}, function (err, doc) {
    createEdit(doc);
  });
});

ipcMain.on('edit', (event, info) => {
  info.password = encrypt(info.password, keyPath);
  db.update({_id: info._id}, info, {}, (err, updatedNumber) => {
      if(updatedNumber > 0){
        db.find({}, function (err, docs) {
          if(docs.length != 0){
            mainWindow.webContents.send('listAccounts', docs);
          };
        });
      };
  });
});

const createMain = () => {
  mainWindow = new BrowserWindow({
    title: 'Pessoal lock app',
    width: 800,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    center: true,
    webPreferences: {
      preload: path.resolve(__dirname, 'main', 'preload.js'),
    }
  });
  if(isDev) {
    mainWindow.webContents.openDevTools();
  }else{
    mainWindow.removeMenu();
  };
  mainWindow.loadFile(path.resolve(__dirname, 'main', 'index.html'));
};

const createLogin = () => {
  loginWindow = new BrowserWindow({
    title: 'Login',
    width: 500,
    height: 400,
    center: true,
    maximizable: false,
    resizable: false,
    webPreferences: {
      preload: path.resolve(__dirname, 'login', 'preload.js')
    }
  });
  loginWindow.removeMenu();
  loginWindow.loadFile(path.resolve(__dirname, 'login', 'index.html'));
};

const createEdit = (info) => {
  editWindow = new BrowserWindow({
    title: 'Editar',
    width: 800,
    height: 600,
    center: true,
    webPreferences: {
      nodeIntegration: true
    }
  });
  if(!isDev) editWindow.removeMenu();
  editWindow.loadFile(path.resolve(__dirname, 'edit', 'index.html'));
  editWindow.webContents.on('did-finish-load', () => {
    info.password = decrypt(info.password, keyPath);
    editWindow.webContents.send('data', info);
  });
};

app.on('ready', () => createLogin());