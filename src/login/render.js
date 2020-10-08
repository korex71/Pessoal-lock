let lock = false;

$('#user').text(user);
// txtPwd btn-login

ipcR.send('firstUse');
ipcR.on('firstUse', (event, first) => {
  if(first){
    $('#mtb').text('Digite sua senha de primeiro uso');
  }else{
    $('#mtb').text('Digite sua senha');
  };
});

$('#txtPwd').on('keypress', (e) => {
  if(e.keyCode === 13) {
    if(lock === false){
      ipcR.send('login', $('#txtPwd').val()); 
      lock = true;
      $('#content-load').html(`
        <div class="spinner-border text-primary" role="status">
          <span class="sr-only">Loading...</span>
        </div>
      `)
    };
  };
});

$('#btn-login').on('click', () => {
  if(lock === false){
    ipcR.send('login', $('#txtPwd').val());
    lock = true;
    $('#content-load').html(`
      <div class="spinner-border text-primary" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    `)
  };
});

ipcR.on('login', (event, args) => {
  lock = false;
  if(args.match){
    $('#content-load').html(`
      <p style='font-size:2em;color:green'>&#10004</p>
    `);
  }else{
    $('#content-load').html(`
      <p style='font-size:2em;color:red'>&times</p>
    `);
  }
});