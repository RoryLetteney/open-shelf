'use strict';

$(document).ready(() => {
  $('.save-book') ? $('.save-book').hide() : '';
  $('.select-book') ? $('.select-book').click(function() {
    $(this).prev().show();
    $(this).hide();
  }) : '';
});
