$(function() {
  marked.setOptions({ langPrefix: '' });
  $('#editor').keyup(function() { markdownPrev('#editor'); });
  $('#md_title').keyup(function() { $("#title").text($('#md_title').val()); });

  if ($("#hash").val() != "") {
    passworddialog();
  } else {
    markdownPrev('#editor');
  }

  $("#delete").click(function() {
    swal({
      title: '削除確認',
      html: "<b>「" + $("#title").text() + "」</b>を削除します。<br>よろしいですか？（元には戻せません。）",
      type: 'warning',
      showCancelButton: true,
    }).then(function (result) {
      dispLoading("処理中...");
      $.ajax({
        url: '/delete/' + $("#hash").val(),
        type:'PUT',
        dataType: 'json',
        timeout:10000,
      }).done(function(data, statusText, jqXHR) {
        if (data.error === "") {
          swal({
            title: '削除が完了しました！',
            text: "トップへ戻ります。",
            type: 'success'
          }).then(function() { location.href = "/" }, function(dismiss) { location.href = "/" });
        } else {
          swal({
            title: 'エラーが発生しました。',
            text: data.error,
            type: 'error'
          })
        }
      }).fail(function(jqXHR, statusText, errorThrown) {
        swal({
          title: 'エラーが発生しました。',
          text: 'お手数ですが、再度お試しください。',
          type: 'error'
        })
      }).always(function() {
        removeLoading();
      });
    }).catch(swal.noop);
  });

  $("#regist").click(function() {
    if ($('#md_title').val() == "") {
        swal('タイトルを入力してください。', '', 'error')
        return false;
    }
    if ($('#editor').val() == "") {
        swal('Markdownを入力してください。', '', 'error')
        return false;
    }
    if ($('#edit_pass').val() == "") {
        swal('削除・更新用パスワードを入力してください。', '', 'error')
        return false;
    }

    dispLoading("処理中...");
    $.ajax({
      url: '/regist',
      type:'POST',
      dataType: 'json',
      data : {
        title : $('#md_title').val(),
        markdown : $('#editor').val(),
        edit_pass : $('#edit_pass').val(),
        view_pass : $('#view_pass').val(),
        hash : $('#hash').val()
      },
      timeout:10000,
    }).done(function(data, statusText, jqXHR) {
      if (data.message != "") {
        swal({
          title: '登録が完了しました。',
          html: data.message,
          type: 'success'
        }).then(function() { location.href = "/view/" + data.hash }, function(dismiss) { location.href = "/view/" + data.hash });
      } else {
        swal(
          '登録でエラーが発生しました。',
          'お手数ですが、再度お試しください。',
          'error'
        );
      }
    }).fail(function(jqXHR, statusText, errorThrown) {
      swal({
        title: '登録でエラーが発生しました。',
        text: 'お手数ですが、再度お試しください。',
        type: 'error'
      });
    }).always(function() {
      removeLoading();
    });
  });
})

function passworddialog() {
  swal({
    title: '削除・更新用パスワードを入力して下さい。',
    input: 'password',
    showCancelButton: true,
    inputValidator: function (value) {
      return new Promise(function (resolve, reject) {
        if (value) {
          resolve()
        } else {
          reject('削除・更新用パスワードは必須入力です。')
        }
      })
    }
  }).then(function (result) {
    dispLoading("処理中...");
    $.ajax({
      url: '/editauth/' + $("#hash").val(),
      type:'GET',
      dataType: 'json',
      data : {pass : result},
      timeout:10000,
    }).done(function(data, statusText, jqXHR) {
      if (data.error === undefined) {
        $("#editor").val(data.markdown);
        $("#edit_pass").val(result);
        $("#view_pass").val(data.edit_pass);
        $('#md_title').val($("#title").text());
        markdownPrev('#editor');
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
          location.href = "/edit";
      } else {
        swal({
          title: '認証されていません。',
          text: '再度入力して下さい。',
          type: 'error'
        }).then(function() { passworddialog(); }, function(dismiss) { passworddialog(); });
      }
  });
}
