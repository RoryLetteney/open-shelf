'use strict';

$(document).ready(() => {

  // SAVE STYLING FUNCTIONALITY
  $('.edit-form') ? $('.edit-form').hide() : '';
  $('.show-edit') ? $('.show-edit').click(function() {
    $(this).prev().show();
    $(this).hide();
  }) : '';
  $('.cancel') ? $('.cancel').click(function() {
    $(this).parent().hide();
    $(this).parent().next().show();
  }) : '';

  // NAV STYLING FUNCTIONALITY
  $('#nav-icon').click(() => $('#nav-list').toggle('show'));

  // EDIT FORM VALUES
  // $('.edit-select') ? $(this).val($(this.prev().val())) : '';
  location.href === 'http://localhost:3000/searches/show' ? $('.edit-input-bookshelf').val('') : '';
});
