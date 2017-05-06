$(function() {
  $("#inquiry").click(function() {
    swal({
      title: 'お問い合わせ',
      html: 'お問い合わせ内容をご入力ください。<input id="mail" class="swal2-input" placeholder="返信用メールアドレス" type="email"><textarea id="comment" class="swal2-textarea" placeholder="お問い合わせ内容"></textarea>',
      showCancelButton: true,
      confirmButtonText: '登録',
      showLoaderOnConfirm: true,
      preConfirm: function () {
        return new Promise(function (resolve, reject) {
          if ($("#mail").val() === "") {
            reject('返信先をご入力ください。')
            $("#mail").addClass("swal2-inputerror");
          } else if ($("#comment").val() === "") {
            reject('お問い合わせ内容をご入力ください。')
            $("#comment").addClass("swal2-inputerror");
          } else {
            $.ajax({
              type: "POST",
              dataType: "json",
              cache: false,
              url: "/inquiry_post",
              data: {mail: $("#mail").val(), comment: $("#comment").val()}
            }).done(function(data, statusText, jqXHR) {
              if (data.error != null) {
                reject(data.error)
              } else {
                resolve('以下の内容でお問い合わせを受け付けました。<br><br>返信先：'+ $("#mail").val() + '<br>' + $("#comment").val().replace(/\r?\n/g, '<br>'))
              }
            }).fail(function(jqXHR, statusText, errorThrown) {
              reject("送信に失敗しました。申し訳ございませんが、再度お試しください。");
            });
          }
        })
      },
      allowOutsideClick: false
    }).then(function (value) {
      swal({
        type: 'success',
        title: 'ありがとうございました。',
        html: value
      })
    }).catch(swal.noop)
  });
});
