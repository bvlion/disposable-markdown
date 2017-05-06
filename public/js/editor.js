$(function() {
  marked.setOptions({ langPrefix: '' });
  $('#editor').keyup(function() { markdownPrev(); });
  $('#md_title').keyup(function() { $("#title").text($('#md_title').val()); });

  if ($("#hash").val() != "") {
    passworddialog();
  } else {
    markdownPrev();
  }

  $("#delete").click(function() {
    swal({
      title: '削除確認',
      html: "<b>「" + $("#title").text() + "」</b>を削除します。<br>よろしいですか？（元には戻せません。）",
      type: 'warning',
      showCancelButton: true,
    }).then(function (result) {
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

function markdownPrev() {
  $('#result').html(marked(escapeHtml($('#editor').val())));
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
