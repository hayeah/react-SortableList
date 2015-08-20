/// <reference path="./types.d.ts" />

import React from "react/addons";
import {TransitionSpring,Spring,utils as RMutils} from "react-motion";

import _ from "lodash";
import {pick} from "lodash";

const {reorderKeys} = RMutils;

const {update} = React.addons;

const QUOTES = require("./quotes");


let Item = React.createClass({
  componentDidMount() {
    const dom = this.refs.li.getDOMNode();
    const layout = pick(dom,"offsetWidth","offsetHeight");
    const {id,key,onLayout} = this.props;
    onLayout && onLayout(id,layout);
  },

  render() {
    const {children,style,onMouseDown} = this.props;

    return (
      <li className="noselect" onMouseDown={onMouseDown} style={style} ref="li">{children}</li>
    );
  },

});

let List = React.createClass({
  getInitialState() {
    const {items} = this.props;
    return {
      layouts: {},
      items,
      // The key of the current item we are moving.
      movingItemKey: null,
      movingY: null,
    };
  },

  componentWillReceiveProps(props) {
    const {items} = props;
    this.setState({items});
  },

  handleItemLayout(key,layout) {
    const {layouts} = this.state;
    this.setState(({layouts}) => {
      return {
        layouts: {
          ...layouts,
          [key]: layout,
        }
      };
    });
  },

  componentDidMount() {
    window.addEventListener("mousemove",this.handleMouseMove);
    window.addEventListener("mouseup",this.handleMouseUp);
  },

  handleMouseMove(e) {
    const {movingItemKey} = this.state;
    if(movingItemKey == null) {
      return;
    }

    let y = this.distanceFromListTop(e.pageY);

    // 1. search through items to find where to insert
    const {items,layouts} = this.state;

    let curHeight = 0;
    let marginBottom = 10;

    let rowKey;
    let keys = Object.keys(items);
    for(let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const layout = layouts[key];
      curHeight = curHeight + layout.offsetHeight + marginBottom;
      if(y < curHeight) {
        rowKey = key;
        break;
      }
    }
    // Cursor is outside the last item. Use the last item's key.
    if(rowKey == null) {
      rowKey = keys[keys.length-1];
    }

    this.setState({movingY: y});

    // 2. swap items if necessary
    if(rowKey !== movingItemKey) {
      this.setState({
        items: reorderKeys(this.state.items,keys => {
          let a, b;
          keys.forEach((key,i) => {
            // console.log("compare key",key,rowKey,movingItemKey,i);
            if(key == rowKey) {
              a = i
            }

            if(key == movingItemKey) {
              b = i
            }
          });

          const tmp = keys[a];
          keys[a] = keys[b];
          keys[b] = tmp;
          return keys;
        }),
      });

    }
  },

  distanceFromListTop(pageY) {
    const listDom = this.refs.list.getDOMNode();
    const y = pageY - listDom.offsetTop;
    return y;
  },

  handleMouseUp() {
    this.setState({
      movingItemKey: null,
      movingY: null,
    });
  },

  handleMousedownOnItem(key,{pageY}) {
    let y = this.distanceFromListTop(pageY);
    this.setState({
      movingItemKey: key,
      movingY: y,
    });
  },

  render() {

    const dataRenderer = this.props.children;
    if(typeof dataRenderer != 'function') {
      throw "must be a function"
    }

    const {items,movingItemKey,movingY} = this.state;

    // calculate positions using layout dimensions.
    let curHeight = 0;
    let marginBottom = 10;
    const children = Object.keys(items).map((key) => {
        const item = items[key];

        let layout = this.state.layouts[key];

        let style;
        if(layout) {
          style = {
            position: 'absolute',
            top: {val: curHeight},
            scale: {val: 1},
            opacity: 1,
          }

          curHeight = curHeight + layout.offsetHeight + marginBottom;
        } else {
          style = {
            position: 'absolute',
            top: {val: 0},
            scale: {val: 1},
            opacity: 1,
          }
        }

        const isSelected = movingItemKey === key;

        if(isSelected) {
          style = {
            ...style,
            scale: {val: 1.1},
            backgroundColor: '#33366A',
            top: {
              val: movingY - layout.offsetHeight/2,
              config: []
            },
          }
        }

        return (
          <Spring
            key={key}
            // defaultValue={{top: {val: 0}}}
            endValue={style}
            >
            {
              ({top,scale,backgroundColor}) => {
                let style = {
                  position: 'absolute',
                  top: 0,
                  backgroundColor: backgroundColor,
                  transform: `translate3d(0,${top.val}px,0) scale(${scale.val})`,
                  '-webkit-transform': `translate3d(0,${top.val}px,0) scale(${scale.val})`,
                  zIndex: isSelected ? 99 : 0,
                }
                return (
                  <Item id={key} key={key}
                    onMouseDown={this.handleMousedownOnItem.bind(this,key)}
                    onLayout={this.handleItemLayout}
                    style={style}>
                    {dataRenderer(item)}
                  </Item>
                );
              }
            }

          </Spring>
        )
    });

    const contentHeight = curHeight;

    // console.log(items,children);

    return (
      <ul className="sortable-list"
        ref="list"
        style={{height: contentHeight}}
        >
        {children}
      </ul>

    );
  }
});

const App = React.createClass({
  shuffle() {
    console.log("shuffle yo!");
    const {items} = this.state;

    this.setState({
      items: reorderKeys(items,keys => {
        var keys2= shuffle(keys);
        console.log(keys2);
        return keys
      }),
    });
  },

  getInitialState() {
    let items = {};

    QUOTES.slice(0,8).forEach((quote,i) => {
      // Javascript hash preserves insertion order except for "numeric" keys.
      // Add a random prefix to avoid that.
      items[`@${i}`] = quote;
    });

    return {
      items: items,
    }
  },

  render() {
    const {items} = this.state;
    // console.log(items);
    return (
      <div className="container">
        <h2>Sortable List</h2>
        <List items={items}>
          {item => <span>{item}</span>}
        </List>

        <h1 className="shuffle-button noselect" onClick={this.shuffle}>Shuffle</h1>
      </div>
    );
  },
});

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

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
  return (48 <= keyCode && keyCode <= 57) || (65 <= keyCode && keyCode <= 90);
}



React.render(<App/>, document.querySelector('#content'));