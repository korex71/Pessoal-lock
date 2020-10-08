const bcrypt = require('bcrypt');
const saltRounds = 15;
const path = require('path');
const fs = require('fs');

const login = async (event, password, createWindow, loginWindow, keyPath) => {
    const hash = fs.readFileSync(keyPath, 'binary')
    const match = bcrypt.compareSync(password, toString(hash));
    if(match){
      event.reply('login', {match: true});
      loginWindow.hide();
      createWindow();
    }else{
      event.reply('login', {match: false});
    };
};

const hashKey = (event, password, app) => {
  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(password, salt); console.log(hash);
  const bin = toBinary(hash);
  fs.writeFileSync('key.plock', bin, 'binary');
  app.relaunch()
  app.quit()
};

function toBinary(text) {
  var length = text.length,
      output = [];
  for (var i = 0;i < length; i++) {
    var bin = text[i].charCodeAt().toString(2);
    output.push(Array(8-bin.length+1).join("0") + bin);
  };
  return output.join(" ");
};

function toString(bin) {
  let outputStr = bin.split(' ')
  .map(x => String.fromCharCode(parseInt(x, 2)))
  .join('')
  return outputStr;
};

module.exports = {login, hashKey, toString, toBinary}