var CSM = function(opts) {
  this.el = opts.el;
  this.$el = $(this.el);

  this.initial = opts.initial;
  this.current = this.initial;
  this.tentative = null;

  this.isReadyToTransition = true;
  this.currentAnimatedElementsCount = 0;
  this.animatedElementsTallyMap = {};

  this.events = opts.events;

  this.initialize();
};

CSM.prototype.initialize = function() {
  this.registerEvents();

  this.registerAnimationHandlers();
};

CSM.prototype.registerEvents = function() {
  var currentEvent = null;

  for (var i = 0; i < this.events.length; i++) {
    currentEvent = this.events[i];

    this.animatedElementsTallyMap[currentEvent.name] = 0;

    this.createEventMethod(currentEvent.name, currentEvent.from, currentEvent.to);
  }
};

CSM.prototype.createEventMethod = function(eventName, fromState, toState) {
  var that = this;

  if (CSM.prototype.hasOwnProperty(eventName)) {
    console.warn('event has already been defined:', eventName);
  }
  else {
    CSM.prototype[eventName] = function() {
      if (that.current === fromState) {
        that.beginTransition(eventName, fromState, toState);
      }
      else {
        console.error('current state:', that.current, 'does not match fromState:', fromState);
      }
    };
  }
};

CSM.prototype.registerAnimationHandlers = function() {
  var currentEvent = null;
  var currentAnimatedElementsMap = null;

  // TODO: this whole thing is pretty gross, huh
  for (var i = 0; i < this.events.length; i++) {
    currentEvent = this.events[i];
    currentAnimatedElementsMap = currentEvent.map;

    if (currentAnimatedElementsMap) {
      for (var prop in currentAnimatedElementsMap) {
        if (currentAnimatedElementsMap.hasOwnProperty(prop)) {
          if (prop.charAt(0) === '#') {
            this.handleSingleAnimatedElement(currentEvent.name, prop, currentAnimatedElementsMap[prop]);
          }
          else {
            this.handleMultipleAnimatedElements(currentEvent.name, prop, currentAnimatedElementsMap[prop]);
          }
        }
      }
    }
  }
};

// http://stackoverflow.com/a/14197707
CSM.prototype.getAnimationName = function(evt) {
  if (evt.animationName != undefined) return evt.animationName;
  if (evt.originalEvent.animationName != undefined) return evt.originalEvent.animationName;
  else return undefined;
}

CSM.prototype.handleSingleAnimatedElement = function(eventName, element, animationInfo) {
  var that = this;
  // TODO: abstract this into reusable format
  var animationInfoArr = animationInfo.split(' ');
  var animationClass = animationInfoArr.shift();
  var animationNames = animationInfoArr;

  this.animatedElementsTallyMap[eventName]++;

  // TODO: add browser prefixes for animation end event
  $(element).on('animationend', function(evt) {
    var $el = $(this);

    for (var i = 0; i < animationNames.length; i++) {
      if (that.getAnimationName(evt) === animationNames[i]) {
        $el.removeClass(animationClass.substring(1));

        that.trackTransition(eventName);
      }
    }
  });
};

CSM.prototype.handleMultipleAnimatedElements = function(eventName, element, animationInfo) {
  var that = this;
  var animationInfoArr = animationInfo.split(' ');
  var animationClass = animationInfoArr.shift();
  var animationNames = animationInfoArr;

  $(element).each(function() {
    that.animatedElementsTallyMap[eventName]++;

    $(this).on('animationend', function(evt) {
      var $el = $(this);

      for (var i = 0; i < animationNames.length; i++) {
        if (that.getAnimationName(evt) === animationNames[i]) {
          $el.removeClass(animationClass.substring(1));

          that.trackTransition(eventName);
        }
      }
    });
  });
};

CSM.prototype.beginTransition = function(eventName, fromState, toState) {
  var animatedElementsMap = this.retrieveAnimatedElementsMap(eventName);

  if (this.isReadyToTransition) {
    this.currentAnimatedElementsCount = 0;
    this.isReadyToTransition = false;
    this.tentative = toState;

    this.updateRootModifierClass(fromState, toState);

    // TODO: also add check to see if browser supports css animations
    if (animatedElementsMap) {
      this.addAnimationClasses(animatedElementsMap);
    }
    else {
      this.forceTransition();
    }
  }
};

CSM.prototype.trackTransition = function(eventName) {
  this.currentAnimatedElementsCount++;

  console.log(this.currentAnimatedElementsCount);

  if (this.currentAnimatedElementsCount === this.animatedElementsTallyMap[eventName]) {
    console.log('ALL ANIMATIONS COMPLETE!');

    this.isReadyToTransition = true;
    this.current = this.tentative;
    this.tentative = null;
  }
};

CSM.prototype.forceTransition = function() {
  console.warn('transition forced because no animations exist for state!');

  this.isReadyToTransition = true;
  this.current = this.tentative;
  this.tentative = null;
};

CSM.prototype.updateRootModifierClass = function(fromState, toState) {
  if (fromState !== 'default') {
    this.$el.removeClass(fromState);
  }

  if (toState !== 'default') {
    this.$el.addClass(toState);
  }
};

CSM.prototype.addAnimationClasses = function(animatedElementsMap) {
  var animationInfoArr = null;
  var animationClass = null;

  for (var prop in animatedElementsMap) {
    animationInfoArr = animatedElementsMap[prop].split(' ');
    animationClass = animationInfoArr.shift();

    if (animatedElementsMap.hasOwnProperty(prop)) {
      if (prop.charAt(0) === '#') {
        $(prop).addClass(animationClass.substring(1));
      }
      else {
        $(prop).each(function() {
          $(this).addClass(animationClass.substring(1));
        });
      }
    }
  }
};

CSM.prototype.retrieveAnimatedElementsMap = function(eventName) {
  var currentEvent = null;

  for (var i = 0; i < this.events.length; i++) {
    currentEvent = this.events[i];

    if (currentEvent.name === eventName) {
      return currentEvent.map;
    }
    else {
      return null;
    }
  }
};
