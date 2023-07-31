/*
 * Copyright 2016 Inspireso and/or its affiliates.
 * Licensed under the MIT License.
 */

'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const Handlebars = require('handlebars/dist/cjs/handlebars');
const Bloodhound = require('typeahead.js/dist/bloodhound');
const $ = require('jquery');
require('typeahead.js');
require('./Typeahead.css');

const isFunction = function (func) {
  if ($.isFunction(func)) {
    return func;
  } else if ($.isFunction(window[func])) {
    return window[func];
  } else {
    return null;
  }
};

const config = {
  options: {
    minLength: 1,//输入的最小字符数开始联想查询
    hint: true
  },
  dataset: {
    //支持静态地址，即把url地址直接写死在js中，不依赖于元素中的data-source属性
    fnsource: function (source, params) {
      source = source.replace('//', '/');

      return new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        remote: {
          url: source,
          prepare: function (query, setting) {
            return {
              url: setting.url,
              type: "POST",
              data: {
                "query": query,
                "params": params
              }
            };
          }
          , transform: function (resp) {
            let json = $.isArray(resp) ? resp : $.parseJSON(resp);
            return json.tbody || json;
          }
        }
      });
    },

    fnselect: function (ev, item) {
      let json = $.isPlainObject(item) ? item : $.parseJSON(item);

      let setters = $(ev.target).data("setter");
      let keyVals = setters ? setters.split(',') : '';
      if (keyVals) {
        $.each(keyVals, function (index, element) {
          let keyVal = element.split(':');
          if (keyVal.length == 2) {
            let $element = $(keyVal[0]);
            let val = keyVal[1];
            if ($element && $element.length > 0) {
              if ($element.data('ttTypeahead')) $element.typeahead('val', item[val]);
              else $element.val(item[val]);
            }
          }
        });
      }

      let updater = $(ev.target).data("updater");
      if (updater) {
        let fn = isFunction(updater);
        if (fn) {
          fn.call(this, json);
        }
      }

      return json.name;
    },

    fnchange: function (ev, val) {
      if (!val) {
        let setters = $(ev.target).data("setter");
        let keyVals = setters ? setters.split(',') : '';
        if (keyVals) {
          $.each(keyVals, function (index, element) {
            let keyVal = element.split(':');
            if (keyVal.length === 2) {
              let key = keyVal[0];
              $(key).val('');
            }
          });
        }
      }
    },
    fncleaner: function (ev) {
      return function (ev) {
        let keyCode = ev.keyCode;
        if (keyCode === 8 && $(this).attr('clean')) {
          let clean = "input." + $(this).attr('clean');
          $(clean).each(function () {
            $(this).val('');
          });
        }
      }
    }
  }

};

class Typeahead extends React.Component {
  static propTypes = {
    defaultValue: PropTypes.any
    , className: PropTypes.string
    , placeholder: PropTypes.string
    , onKeyUp: PropTypes.func
    , onSelect: PropTypes.func
    , onChange: PropTypes.func
  };

  componentDidMount() {
    let $input = $(this.refs.typeahead);
    let options = this.props.options || config.options;
    let dataset = this.props.dataset || config.dataset;

    $input.typeahead(options, dataset);
    $input.on('typeahead:select', this.handleSelect.bind(this));
    $input.on('typeahead:change', this.handleChange.bind(this));
    $input.on('typeahead:keyup', this.handleKeyUp.bind(this));

  }

  componentWillUnmount() {
    let $input = $(this.refs.typeahead);

    $input.off('typeahead:select', this.handleSelect.bind(this));
    $input.off('typeahead:change', this.handleChange.bind(this));
    $input.off('typeahead:keyup', this.handleKeyUp.bind(this));
    $input.typeahead('destroy');
  }

  render() {
    let attrs = $.extend({className: "form-control"}, this.props);
    return (
      <input ref="typeahead"
             {...attrs}/>
    );
  }

  handleKeyUp(e) {
    if (this.props.onKeyUp) {
      this.props.onKeyUp(e);
    } else {
      config.dataset.fncleaner(e)
    }
  }

  handleSelect(e, item) {
    if (this.props.onSelect) {
      this.props.onSelect(item);
    } else {
      config.dataset.fnselect(e, item);
    }
  }

  handleChange(e, item) {
    if (this.props.onChange) {
      this.props.onChange(item);
    } else {
      config.dataset.fnchange(e, item);
    }
  }
}

module.exports = {
  Typeahead: Typeahead,

  user: function (options) {
    let opts = config.options;
    let dataset = {
      name: 'user',
      displayKey: 'name',
      source: config.dataset.fnsource('/api/user/typeahead'),
      templates: {
        notFound: ['<div class="row empty-message">',
          '没有找到匹配的会员...', '</div>'].join('\n'),
        header: ['<div class="row header">',
          '<span class="col-md-3">名字</span>',
          '<span class="col-md-3">昵称</span>',
          '<span class="col-md-3">手机</span>',
          '<span class="col-md-3">剩余课时</span>',
          '</div>']
          .join('\n'),
        suggestion: Handlebars.compile(['<div class="row">',
          '<span class="col-md-3">{{name}}</span>',
          '<span class="col-md-3">{{niceName}}</span>',
          '<span class="col-md-3">{{tel1}}</span>',
          '<span class="col-md-3">{{lessons}}</span>',
          '</div>'].join('\n'))
      }
    };

    return (
      <Typeahead options={opts}
                 dataset={dataset}
                 {...options}
      />
    );
  },

  lesson: function (options) {
    let opts = config.options;
    let dataset = {
      name: "lesson",
      displayKey: 'name',
      source: config.dataset.fnsource('/api/product/typeahead'),
      templates: {
        notFound: ['<div class="row empty-message">',
          '没有找到匹配的项...', '</div>'].join('\n'),
        header: ['<div class="row header">',
          '<span class="col-md-4">名称</span>',
          '<span class="col-md-4">地点</span>',
          '<span class="col-md-4">时段</span>',
          '</div>']
          .join('\n'),
        suggestion: Handlebars.compile(['<div class="row">',
          '<span class="col-md-4">{{name}}</span>',
          '<span class="col-md-4">{{address}}</span>',
          '<span class="col-md-4">{{description}}</span>',
          '</div>'].join('\n'))
      }
    };

    return (
      <Typeahead options={opts}
                 dataset={dataset}
                 {...options}
      />
    );
  }
};

