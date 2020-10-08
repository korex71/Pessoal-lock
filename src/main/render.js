$('.nav-item > a').on('click', function (e) {
  $('.active').removeClass('active')
  $(this).addClass('active')
  $($(this).attr('to')).addClass('active')
  $('.show').removeClass('show')
  $($(this).attr('to')).addClass('show')
  if($(this).attr('to') == '#tab1Id'){
    ipcR.send('accounts', {
      opt: 'listAccounts'
    })
  }else{
    console.log('Create account')
  }
})

ipcR.send('accounts', {
  opt: 'listAccounts'
})

ipcR.on('listAccounts', (event, args) => {
  $('#accounts-body').empty()
  args.forEach(list => {
    $('#accounts-body').append(`
    <tr>
      <td scope="row">${capitalize(list.platform)}</td>
      <td>${list.user}</td>
      <td>${list.email}</td>
      <td id='${list._id}' class='enc' onclick='showPass("${list._id}")'>👁</td>
      <td>
        <button class="btn btn-primary px-3 py-1" onclick='deleteAcc("${list._id}")'>Delete</button>
        <button class="btn btn-primary px-3 py-1" onclick='editAcc("${list._id}")'>Edit</button>
      </td>
    </tr>
  `)
  })
})

ipcR.on('reload', (event, args) => {
  ipcR.send('accounts', {
    opt: 'listAccounts'
  })
})

function editAcc(_id) {
  ipcR.send('editAccount', _id)
}

function deleteAcc(_id) {
  ipcR.send('accounts', {
    opt: 'delete',
    content: {
      _id
    }
  })
}

function capitalize(s) {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function showPass(_id) {
  if($('#'+_id).text() != '👁') return $('#'+_id).text('👁')
  ipcR.send('accounts', {
    opt: 'decPassword',
    content: {_id}
  })
}

ipcR.on('decPassword', (event, args) => {
  const {id, dec} = args
  $('#'+id).text(dec)
})

$('#search').on('input', function () {
  val = $(this).val()
  val = val.toLowerCase()
  ipcR.send('accounts', {
    opt: 'listAccount'
  })
  
  ipcR.on('listAccount', (event, args) => {
    $('#accounts-body').empty()
    args.forEach(list => {
      let plat = list.platform.toLowerCase()
      if(plat.startsWith(val)){
        $('#accounts-body').append(`
        <tr>
          <td scope="row">${capitalize(list.platform)}</td>
          <td>${list.user}</td>
          <td>${list.email}</td>
          <td id='${list._id}' class='enc' onclick='showPass("${list._id}")'>👁</td>
          <td>
            <button class="btn btn-primary px-3 py-1" onclick='deleteAcc("${list._id}")'>Delete</button>
            <button class="btn btn-primary px-3 py-1" onclick='editAcc("${list._id}")'>Edit</button>
          </td>
        </tr>
      `)
      }
    })
  })
})

$('#aboutModal').on('click', () => {
  console.log('about')
})

$('#sendInfo').on('click', () => {
  const platform = $('#form-platform').val()
  const user = $('#form-user').val()
  const email = $('#form-email').val()
  const password = $('#form-password').val()
  const textarea = $('#form-more').val()
  const info = {
    opt: 'newAccount',
    content: {
      platform,
      user,
      email,
      password,
      textarea
    }
  }
  ipcR.send('accounts', info)
})