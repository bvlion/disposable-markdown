function dispLoading(msg) {
  var dispMsg = "";

  if (msg != "") {
    dispMsg = "<div class='loadingMsg'>" + msg + "</div>";
  }
  if ($("#loading").size() == 0) {
    $("body").append("<div id='loading'><div id='loadingImage'>" + dispMsg + "</div></div>");
  }
}

function removeLoading() {
    $("#loading").remove();
}

function markdownPrev(id) {
  $('#result').html(marked(escapeHtml($(id).val())));
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
