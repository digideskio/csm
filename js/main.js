var mastheadCsm = new CSM({
  el: '#h-js-masthead',
  // TODO: make this pull from DOM?
  initial: 'default',
  events: [
    {
      name: 'collapse',
      from: 'default',
      to: 'h-is-partially-scrolled',
      map: {
        '#h-js-masthead': '.h-a-slide-up-first-half h-a-masthead__slide-up-first-half--mobile h-a-masthead__slide-up-first-half--desktop',
        '.h-js-masthead__nav-link': '.h-a-grow h-a-masthead__nav-link__grow--mobile'
      }
    },
    {
      name: 'disappear',
      from: 'h-is-partially-scrolled',
      to: 'h-is-wholly-scrolled'
    },
    {
      name: 'reappear',
      from: 'h-is-wholly-scrolled',
      to: 'h-is-partially-scrolled'
    },
    {
      name: 'reset',
      from: 'h-is-partially-scrolled',
      to: 'default'
    }
  ]
});

console.log(mastheadCsm);

$('#h-js-toggle-collapse').on('click', function() {
  mastheadCsm.collapse();
});

$('#h-js-toggle-disappear').on('click', function() {
  mastheadCsm.disappear();
});

$('#h-js-toggle-reappear').on('click', function() {
  mastheadCsm.reappear();
});

$('#h-js-toggle-reset').on('click', function() {
  mastheadCsm.reset();
});