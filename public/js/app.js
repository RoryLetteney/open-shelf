'use strict';

$(document).ready(() => {

  // SAVE STYLING FUNCTIONALITY
  $('.edit-form') ? $('.edit-form').hide() : '';
  $('.select-book') ? $('.select-book').click(function() {
    $(this).prev().show();
    $(this).hide();
  }) : '';
  $('.cancel') ? $('.cancel').click(function() {
    $(this).parent().hide();
    $(this).parent().next().show();
  }) : '';

  // NAV STYLING FUNCTIONALITY
  $('#nav-icon').click(() => $('#nav-list').toggle('show'));
});
