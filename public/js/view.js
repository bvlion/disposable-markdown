$(function() {
  marked.setOptions({ langPrefix: '' });

  if ($("#markdown").val() == "") {
    passworddialog();
  } else {
    markdownPrev();
  }
});

function passworddialog() {
  swal({
    title: '閲覧用パスワードを入力して下さい。',
    input: 'password',
    showCancelButton: true,
    inputValidator: function (value) {
      return new Promise(function (resolve, reject) {
        if (value) {
          resolve()
        } else {
          reject('閲覧用パスワードは必須入力です。')
        }
      })
    }
  }).then(function (result) {
    $.ajax({
      url: '/viewauth/' + $("#hash").val(),
      type:'GET',
      dataType: 'json',
      data : {pass : result},
      timeout:10000,
    }).done(function(data, statusText, jqXHR) {
      if (data.error === undefined) {
        $("#markdown").val(data.markdown);
        $("#title").text(data.title);
        markdownPrev();
      } else {
        swal({
          title: data.error,
          type: 'error'
        }).then(function() { passworddialog(); }, function(dismiss) { passworddialog(); });
      }
    }).fail(function(jqXHR, statusText, errorThrown) {
      swal({
        title: '認証でエラーが発生しました。',
        text: 'お手数ですが、再度お試しください。',
        type: 'error'
      }).then(function() { passworddialog(); }, function(dismiss) { passworddialog(); });
    });
  }, function (dismiss) {
      if (dismiss === 'cancel') {
          location.href = "/";
      } else {
        swal({
          title: '認証されていません。',
          text: '再度入力して下さい。',
          type: 'error'
        }).then(function() { passworddialog(); }, function(dismiss) { passworddialog(); });
      }
  });
}

function markdownPrev() {
  $('#result').html(marked(escapeHtml($('#markdown').val())));
  $('pre code').each(function(i, block) {
    $(block).html(unEcapeHtml($(block).html()))
    hljs.highlightBlock(block);
  });
}

function escapeHtml(str) {
  if (str === null || str === undefined) {
    return "";
  }
  return str.replace(/\&/g, "&amp;").replace(/\</g, "&lt;").replace(/\>/g, "&gt;").replace(/\'/g, "&#x27;").replace(/\"/g, "&quot;");
}


function unEcapeHtml(str) {
  if (str === null || str === undefined) {
    return "";
  }
  return str.replace(/\&lt\;/g, "<").replace(/\&gt\;/g, ">").replace(/\&quot\;/g, '"').replace(/\&\#x27\;/g, "'").replace(/\&amp\;/g, "&");
}
