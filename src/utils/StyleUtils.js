const jquery = require('jquery');

module.exports = {
  addClass: function (selector, classes) {
    jquery(selector).addClass(classes);
  },
  removeClass: function (selector, classes) {
    jquery(selector).removeClass(classes);
  },
};
