'use strict';

//?query=&title-or-author=title

$(document).ready(
  $('#searches-form').submit(e => {
    $.post('/searches');
  })
);
