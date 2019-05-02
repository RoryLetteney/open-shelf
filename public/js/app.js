'use strict';

$(document).ready(() => {

  // SAVE STYLING FUNCTIONALITY
  $('.save-book') ? $('.save-book').hide() : '';
  $('.select-book') ? $('.select-book').click(function() {
    $(this).prev().show();
    $(this).hide();
  }) : '';

  // NAV STYLING FUNCTIONALITY
  $('#nav-icon').click(() => $('#nav-list').toggle('show'));
});
