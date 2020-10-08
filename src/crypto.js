const crypto = require('crypto'),
    algorithm = 'aes-256-ctr';
const fs = require('fs');
const {toString} = require('./db/ops');
const path = require('path');

function encrypt(text, keyPath){
    const bin = fs.readFileSync(keyPath, 'binary');
    const password = toString(bin)
    console.log(password)
    var cipher = crypto.createCipher(algorithm, password);
    var crypted = cipher.update(text,'utf8','hex')
    crypted += cipher.final('hex');
    return crypted;
}
 
function decrypt(text, keyPath){
    const bin = fs.readFileSync(keyPath, 'binary');
    const password = toString(bin);
    console.log(password)
    var decipher = crypto.createDecipher(algorithm, password);
    var dec = decipher.update(text,'hex','utf8');
    dec += decipher.final('utf8');
    return dec;
}

module.exports = {encrypt, decrypt}