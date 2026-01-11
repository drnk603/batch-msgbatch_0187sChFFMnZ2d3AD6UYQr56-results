(function () {
  var toggle = document.querySelector('.cl-header__nav-toggle');
  var nav = document.querySelector('.cl-header__nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', function () {
    var isOpen = nav.classList.toggle('cl-header__nav--open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
})();