/// <reference path="./types.d.ts" />

"use strict";

var _extends = require("babel-runtime/helpers/extends")["default"];

var _defineProperty = require("babel-runtime/helpers/define-property")["default"];

var _Object$keys = require("babel-runtime/core-js/object/keys")["default"];

var _interopRequireDefault = require("babel-runtime/helpers/interop-require-default")["default"];

var _reactAddons = require("react/addons");

var _reactAddons2 = _interopRequireDefault(_reactAddons);

var _reactMotion = require("react-motion");

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var reorderKeys = _reactMotion.utils.reorderKeys;
var update = _reactAddons2["default"].addons.update;

var QUOTES = require("./quotes");

var Item = _reactAddons2["default"].createClass({
  displayName: "Item",

  componentDidMount: function componentDidMount() {
    var dom = this.refs.li.getDOMNode();
    var layout = (0, _lodash.pick)(dom, "offsetWidth", "offsetHeight");
    var _props = this.props;
    var id = _props.id;
    var key = _props.key;
    var onLayout = _props.onLayout;

    onLayout && onLayout(id, layout);
  },

  render: function render() {
    var _props2 = this.props;
    var children = _props2.children;
    var style = _props2.style;
    var onMouseDown = _props2.onMouseDown;

    return _reactAddons2["default"].createElement(
      "li",
      { className: "noselect", onMouseDown: onMouseDown, style: style, ref: "li" },
      children
    );
  }

});

var List = _reactAddons2["default"].createClass({
  displayName: "List",

  getInitialState: function getInitialState() {
    var items = this.props.items;

    return {
      layouts: {},
      items: items,
      // The key of the current item we are moving.
      movingItemKey: null,
      movingY: null
    };
  },

  componentWillReceiveProps: function componentWillReceiveProps(props) {
    var items = props.items;

    this.setState({ items: items });
  },

  handleItemLayout: function handleItemLayout(key, layout) {
    var layouts = this.state.layouts;

    this.setState(function (_ref) {
      var layouts = _ref.layouts;

      return {
        layouts: _extends({}, layouts, _defineProperty({}, key, layout))
      };
    });
  },

  componentDidMount: function componentDidMount() {
    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("mouseup", this.handleMouseUp);
  },

  handleMouseMove: function handleMouseMove(e) {
    var movingItemKey = this.state.movingItemKey;

    if (movingItemKey == null) {
      return;
    }

    var y = this.distanceFromListTop(e.pageY);

    // 1. search through items to find where to insert
    var _state = this.state;
    var items = _state.items;
    var layouts = _state.layouts;

    var curHeight = 0;
    var marginBottom = 10;

    var rowKey = undefined;
    var keys = _Object$keys(items);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var layout = layouts[key];
      curHeight = curHeight + layout.offsetHeight + marginBottom;
      if (y < curHeight) {
        rowKey = key;
        break;
      }
    }
    // Cursor is outside the last item. Use the last item's key.
    if (rowKey == null) {
      rowKey = keys[keys.length - 1];
    }

    this.setState({ movingY: y });

    // 2. swap items if necessary
    if (rowKey !== movingItemKey) {
      this.setState({
        items: reorderKeys(this.state.items, function (keys) {
          var a = undefined,
              b = undefined;
          keys.forEach(function (key, i) {
            // console.log("compare key",key,rowKey,movingItemKey,i);
            if (key == rowKey) {
              a = i;
            }

            if (key == movingItemKey) {
              b = i;
            }
          });

          var tmp = keys[a];
          keys[a] = keys[b];
          keys[b] = tmp;
          return keys;
        })
      });
    }
  },

  distanceFromListTop: function distanceFromListTop(pageY) {
    var listDom = this.refs.list.getDOMNode();
    var y = pageY - listDom.offsetTop;
    return y;
  },

  handleMouseUp: function handleMouseUp() {
    this.setState({
      movingItemKey: null,
      movingY: null
    });
  },

  handleMousedownOnItem: function handleMousedownOnItem(key, _ref2) {
    var pageY = _ref2.pageY;

    var y = this.distanceFromListTop(pageY);
    this.setState({
      movingItemKey: key,
      movingY: y
    });
  },

  render: function render() {
    var _this = this;

    var dataRenderer = this.props.children;
    if (typeof dataRenderer != 'function') {
      throw "must be a function";
    }

    var _state2 = this.state;
    var items = _state2.items;
    var movingItemKey = _state2.movingItemKey;
    var movingY = _state2.movingY;

    // calculate positions using layout dimensions.
    var curHeight = 0;
    var marginBottom = 10;
    var children = _Object$keys(items).map(function (key) {
      var item = items[key];

      var layout = _this.state.layouts[key];

      var style = undefined;
      if (layout) {
        style = {
          position: 'absolute',
          top: { val: curHeight },
          scale: { val: 1 },
          opacity: 1
        };

        curHeight = curHeight + layout.offsetHeight + marginBottom;
      } else {
        style = {
          position: 'absolute',
          top: { val: 0 },
          scale: { val: 1 },
          opacity: 1
        };
      }

      var isSelected = movingItemKey === key;

      if (isSelected) {
        style = _extends({}, style, {
          scale: { val: 1.1 },
          backgroundColor: '#33366A',
          top: {
            val: movingY - layout.offsetHeight / 2,
            config: []
          }
        });
      }

      return _reactAddons2["default"].createElement(
        _reactMotion.Spring,
        {
          key: key,
          // defaultValue={{top: {val: 0}}}
          endValue: style
        },
        function (_ref3) {
          var top = _ref3.top;
          var scale = _ref3.scale;
          var backgroundColor = _ref3.backgroundColor;

          var style = {
            position: 'absolute',
            top: 0,
            backgroundColor: backgroundColor,
            transform: "translate3d(0," + top.val + "px,0) scale(" + scale.val + ")",
            // < Safari 8
            '-webkit-transform': "translate3d(0," + top.val + "px,0) scale(" + scale.val + ")",
            zIndex: isSelected ? 99 : 0
          };
          return _reactAddons2["default"].createElement(
            Item,
            { id: key, key: key,
              onMouseDown: _this.handleMousedownOnItem.bind(_this, key),
              onLayout: _this.handleItemLayout,
              style: style },
            dataRenderer(item)
          );
        }
      );
    });

    var contentHeight = curHeight;

    // console.log(items,children);

    return _reactAddons2["default"].createElement(
      "ul",
      { className: "sortable-list",
        ref: "list",
        style: { height: contentHeight }
      },
      children
    );
  }
});

var App = _reactAddons2["default"].createClass({
  displayName: "App",

  shuffle: (function (_shuffle) {
    function shuffle() {
      return _shuffle.apply(this, arguments);
    }

    shuffle.toString = function () {
      return _shuffle.toString();
    };

    return shuffle;
  })(function () {
    console.log("shuffle yo!");
    var items = this.state.items;

    this.setState({
      items: reorderKeys(items, function (keys) {
        var keys2 = shuffle(keys);
        console.log(keys2);
        return keys;
      })
    });
  }),

  getInitialState: function getInitialState() {
    var items = {};

    QUOTES.slice(0, 8).forEach(function (quote, i) {
      // Javascript hash preserves insertion order except for "numeric" keys.
      // Add a random prefix to avoid that.
      items["@" + i] = quote;
    });

    return {
      items: items
    };
  },

  render: function render() {
    var items = this.state.items;

    // console.log(items);
    return _reactAddons2["default"].createElement(
      "div",
      { className: "container" },
      _reactAddons2["default"].createElement(
        "h1",
        null,
        "React Motion Sortable List"
      ),
      _reactAddons2["default"].createElement(
        List,
        { items: items },
        function (item) {
          return _reactAddons2["default"].createElement(
            "span",
            null,
            item
          );
        }
      ),
      _reactAddons2["default"].createElement(
        "h1",
        { className: "shuffle-button noselect", onClick: this.shuffle },
        "Shuffle"
      ),
      _reactAddons2["default"].createElement(
        "h3",
        { className: "colophon" },
        "made with ",
        _reactAddons2["default"].createElement(
          "a",
          { href: "https://github.com/chenglou/react-motion" },
          "react motion."
        ),
        _reactAddons2["default"].createElement(
          "a",
          { href: "https://github.com/hayeah/react-motion-SortableList" },
          "source."
        ),
        "by ",
        _reactAddons2["default"].createElement(
          "a",
          { href: "https://twitter.com/hayeah" },
          "@hayeah"
        )
      )
    );
  }
});

function shuffle(array) {
  var currentIndex = array.length,
      temporaryValue,
      randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function isAlphaNumeric(keyCode) {
  return 48 <= keyCode && keyCode <= 57 || 65 <= keyCode && keyCode <= 90;
}

_reactAddons2["default"].render(_reactAddons2["default"].createElement(App, null), document.querySelector('#content'));