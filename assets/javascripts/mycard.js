// Generated by CoffeeScript 1.4.0
(function() {

  $(document).ready(function() {
    $('#slider').cycle({
      fx: 'fade',
      timeout: 7200,
      random: 1
    });
    return $.get('http://my-card.in/mycard/download.url', function(data) {
      if (data.match(/mycard-(.*)-win32\.7z/)) {
        return $('#download_version').html(v[1]);
      } else {
        return $('#download_version').html('读取失败');
      }
    });
  });

}).call(this);
