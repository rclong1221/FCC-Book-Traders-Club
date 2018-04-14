$('#lio').on('click', function(e) {
  if (window.location.pathname !== "/redirect") {
    var d = new Date();
    d.setTime(d.getTime() + (7*24*60*60*1000));
    document.cookie = "last_location=" + document.URL + "; expires=" + d.toUTCString() + "; path=/redirect";
  }
});

$(document).ready(function() {
  var x = document.cookie;
  x = x.slice(14);
  if (window.location.pathname === "/redirect") window.location.replace(x);
})
