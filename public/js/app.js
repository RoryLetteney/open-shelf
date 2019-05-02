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
  location.href === 'http://localhost:3000/searches/show' ? $('.edit-input-bookshelf').val('') : '';

  // DELETE FROM DATABASE
  $('#delete-button') ? $('#delete-button').prev().prev().attr('id', 'delete-form') : '';
});
