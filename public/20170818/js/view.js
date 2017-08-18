$(function() {
  marked.setOptions({ langPrefix: '' });

  if ($("#markdown").val() == "") {
    passworddialog();
  } else {
    markdownPrev('#markdown');
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
    dispLoading("展開中...");
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
        markdownPrev('#markdown');
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
    }).always(function() {
      removeLoading();
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
