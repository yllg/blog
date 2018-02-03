(function(window) {
  "use strict";

  /**
   * StackFx: The parent class.
   */
  function StackFx(el) {
    this.DOM = {};
    this.DOM.el = el;
    this.DOM.stack = this.DOM.el.querySelector(".stack");
    this.DOM.stackItems = [].slice.call(this.DOM.stack.children);
    this.totalItems = this.DOM.stackItems.length;
    this.DOM.img = this.DOM.stack.querySelector(".stack__figure > .stack__img");
    this.DOM.caption = this.DOM.el.querySelector(".grid__item-caption");
    this.DOM.title = this.DOM.caption.querySelector(".grid__item-title");
  }

  StackFx.prototype._removeAnimeTargets = function() {
    anime.remove(this.DOM.stackItems);
    anime.remove(this.DOM.img);
    anime.remove(this.DOM.title);
  };

  /************************************************************************
   * PolarisFx.
   ************************************************************************/
  function PolarisFx(el) {
    StackFx.call(this, el);
    this._initEvents();
  }

  PolarisFx.prototype = Object.create(StackFx.prototype);
  PolarisFx.prototype.constructor = PolarisFx;

  PolarisFx.prototype._initEvents = function() {
    var self = this;
    this._mouseenterFn = function() {
      self._removeAnimeTargets();
      self._in();
    };
    this._mouseleaveFn = function() {
      self._removeAnimeTargets();
      self._out();
    };
    this.DOM.stack.addEventListener("mouseenter", this._mouseenterFn);
    this.DOM.stack.addEventListener("mouseleave", this._mouseleaveFn);
  };

  PolarisFx.prototype._in = function() {
    var self = this;

    this.DOM.stackItems.map(function(e, i) {
      e.style.opacity = i !== self.totalItems - 1 ? 0.2 * i + 0.2 : 1;
    });

    anime({
      targets: this.DOM.stackItems,
      duration: 1000,
      easing: "easeOutElastic",
      translateZ: function(target, index) {
        return index * 10;
      },
      delay: function(target, index, cnt) {
        return (cnt - index - 1) * 20;
      }
    });

    anime({
      targets: this.DOM.img,
      duration: 500,
      easing: "easeOutExpo",
      scale: 0.7
    });

    anime({
      targets: this.DOM.title,
      duration: 1000,
      easing: "easeOutElastic",
      translateZ: 30
    });
  };

  PolarisFx.prototype._out = function() {
    var self = this;

    anime({
      targets: this.DOM.stackItems,
      duration: 1000,
      easing: "easeOutExpo",
      translateZ: 0,
      opacity: function(target, index, cnt) {
        return index !== cnt - 1 ? 0 : 1;
      }
    });

    anime({
      targets: this.DOM.img,
      duration: 1000,
      easing: "easeOutExpo",
      scale: 1
    });

    anime({
      targets: this.DOM.title,
      duration: 500,
      delay: 100,
      easing: "easeOutExpo",
      translateZ: 0
    });
  };

  window.PolarisFx = PolarisFx;

  /************************************************************************
   * AlphardFx.
   ************************************************************************/
  function AlphardFx(el) {
    StackFx.call(this, el);
    this._initEvents();
  }

  AlphardFx.prototype = Object.create(StackFx.prototype);
  AlphardFx.prototype.constructor = AlphardFx;

  AlphardFx.prototype._initEvents = function() {
    var self = this;
    this._mouseenterFn = function() {
      self._removeAnimeTargets();
      self._in();
    };
    this._mouseleaveFn = function() {
      self._removeAnimeTargets();
      self._out();
    };
    this.DOM.stack.addEventListener("mouseenter", this._mouseenterFn);
    this.DOM.stack.addEventListener("mouseleave", this._mouseleaveFn);
  };

  AlphardFx.prototype._in = function() {
    var self = this;

    this.DOM.stackItems.map(function(e, i) {
      e.style.opacity = i !== self.totalItems - 1 ? 0.2 * i + 0.2 : 1;
    });

    anime({
      targets: this.DOM.stackItems,
      opacity: {
        value: function(target, index, cnt) {
          return index !== cnt - 1 ? [0, 0.2 * index + 0.2] : 1;
        },
        duration: 1,
        easing: "linear",
        delay: function(target, index, cnt) {
          return (cnt - index - 1) * 30 + 250;
        }
      },
      rotate: [
        {
          value: 12,
          duration: 250,
          easing: "easeOutQuad"
        },
        {
          value: function(target, index) {
            return -1 * index * 3 - 3;
          },
          duration: 1000,
          easing: "easeOutExpo"
        }
      ],
      delay: function(target, index, cnt) {
        return (cnt - index - 1) * 30;
      }
    });

    anime({
      targets: this.DOM.img,
      rotate: [
        {
          value: [0, 12],
          duration: 250,
          easing: "easeOutQuad"
        },
        {
          value: [12, 0],
          duration: 1200,
          delay: 50,
          easing: "easeOutExpo"
        }
      ]
    });
  };

  AlphardFx.prototype._out = function() {
    var self = this;

    anime({
      targets: this.DOM.stackItems,
      duration: 500,
      easing: "easeOutExpo",
      rotate: 0,
      opacity: function(target, index, cnt) {
        return index !== cnt - 1 ? 0 : 1;
      }
    });

    anime({
      targets: this.DOM.img,
      duration: 1000,
      easing: "easeOutExpo",
      rotate: 1
    });
  };

  window.AlphardFx = AlphardFx;

  /************************************************************************
   * AltairFx.
   ************************************************************************/
  function AltairFx(el) {
    StackFx.call(this, el);
    this._initEvents();
  }

  AltairFx.prototype = Object.create(StackFx.prototype);
  AltairFx.prototype.constructor = AltairFx;

  AltairFx.prototype._initEvents = function() {
    var self = this;
    this._mouseenterFn = function() {
      self._removeAnimeTargets();
      self._in();
    };
    this._mouseleaveFn = function() {
      self._removeAnimeTargets();
      self._out();
    };
    this.DOM.stack.addEventListener("mouseenter", this._mouseenterFn);
    this.DOM.stack.addEventListener("mouseleave", this._mouseleaveFn);
  };

  AltairFx.prototype._in = function() {
    var self = this;

    this.DOM.stackItems.map(function(e, i) {
      e.style.opacity = i !== self.totalItems - 1 ? 0.2 * i + 0.2 : 1;
    });

    anime({
      targets: this.DOM.stackItems,
      duration: 1000,
      easing: "easeOutElastic",
      translateZ: function(target, index, cnt) {
        return index * 3;
      },
      rotateX: function(target, index, cnt) {
        return -1 * index * 4;
      },
      delay: function(target, index, cnt) {
        return (cnt - index - 1) * 30;
      }
    });

    anime({
      targets: this.DOM.img,
      duration: 500,
      easing: "easeOutExpo",
      scale: 0.7
    });

    anime({
      targets: this.DOM.title,
      duration: 1000,
      easing: "easeOutElastic",
      translateY: 20
    });
  };

  AltairFx.prototype._out = function() {
    var self = this;

    anime({
      targets: this.DOM.stackItems,
      duration: 500,
      easing: "easeOutExpo",
      opacity: function(target, index, cnt) {
        return index !== cnt - 1 ? 0 : 1;
      },
      translateZ: 0,
      rotateX: 0
    });

    anime({
      targets: this.DOM.img,
      duration: 500,
      easing: "easeOutExpo",
      scale: 1
    });
  };

  window.AltairFx = AltairFx;

  /************************************************************************
   * CanopusFx.
   ************************************************************************/
  function CanopusFx(el) {
    StackFx.call(this, el);
    this._initEvents();
  }

  CanopusFx.prototype = Object.create(StackFx.prototype);
  CanopusFx.prototype.constructor = CanopusFx;

  CanopusFx.prototype._initEvents = function() {
    var self = this;
    this._mouseenterFn = function() {
      self._removeAnimeTargets();
      self._in();
    };
    this._mouseleaveFn = function() {
      self._removeAnimeTargets();
      self._out();
    };
    this.DOM.stack.addEventListener("mouseenter", this._mouseenterFn);
    this.DOM.stack.addEventListener("mouseleave", this._mouseleaveFn);
  };

  CanopusFx.prototype._in = function() {
    var self = this;

    this.DOM.stackItems.map(function(e, i) {
      e.style.opacity = i !== self.totalItems - 1 ? 0 : 1;
    });

    var self = this;
    anime({
      targets: this.DOM.stackItems,
      translateZ: {
        value: function(target, index, cnt) {
          return -1 * (cnt - index - 1) * 20;
        },
        duration: 800,
        easing: "easeOutExpo",
        delay: function(target, index, cnt) {
          return (cnt - index - 1) * 70 + 200;
        }
      },
      translateY: [
        {
          value: function(target, index) {
            return -1 * index * 20 - 30;
          },
          duration: 800,
          delay: function(target, index, cnt) {
            return (cnt - index - 1) * 70 + 200;
          },
          elasticity: 500
        }
      ],
      scaleY: [
        {
          value: function(target, index, cnt) {
            return index === cnt - 1 ? 0.6 : 1;
          },
          duration: 200,
          easing: "easeOutExpo"
        },
        {
          value: 0.8,
          duration: 800,
          elasticity: 450
        }
      ],
      scaleX: [
        {
          value: function(target, index, cnt) {
            return index === cnt - 1 ? 1.1 : 1;
          },
          duration: 200,
          easing: "easeOutExpo"
        },
        {
          value: 0.8,
          duration: 800,
          elasticity: 300
        }
      ],
      opacity: {
        value: function(target, index, cnt) {
          return index === cnt - 1 ? 1 : [0, 0.2 * index + 0.2];
        },
        duration: 200,
        easing: "linear",
        delay: function(target, index, cnt) {
          return (cnt - index - 1) * 70 + 200;
        }
      }
    });

    anime({
      targets: this.DOM.img,
      scale: [
        {
          value: 1.8,
          duration: 200,
          easing: "easeOutExpo"
        },
        {
          value: 0.7,
          duration: 1100,
          easing: "easeOutExpo"
        }
      ]
    });
  };

  CanopusFx.prototype._out = function() {
    var self = this;

    anime({
      targets: this.DOM.stackItems,
      duration: 500,
      easing: "easeOutExpo",
      translateZ: 0,
      translateY: 0,
      scaleY: 1,
      scaleX: 1,
      opacity: function(target, index, cnt) {
        return index !== cnt - 1 ? 0 : 1;
      }
    });

    anime({
      targets: this.DOM.img,
      duration: 500,
      easing: "easeOutExpo",
      scale: 1
    });
  };

  window.CanopusFx = CanopusFx;
})(window);
