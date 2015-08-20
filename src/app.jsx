/// <reference path="./types.d.ts" />

import React from "react/addons";
import {TransitionSpring,Spring,utils as RMutils} from "react-motion";

import _ from "lodash";
import {pick} from "lodash";

const {reorderKeys} = RMutils;

const {update} = React.addons;


// https://www.mashape.com/webknox/jokes
const QUOTES = require("./quotes");


let Item = React.createClass({
  componentDidMount() {
    const dom = this.refs.li.getDOMNode();
    const layout = pick(dom,"offsetWidth","offsetHeight");
    const {id,key,onLayout} = this.props;
    onLayout && onLayout(id,layout);
  },

  render() {
    const {children,style} = this.props;

    return (
      <li style={style} ref="li">{children}</li>
    );
  },

});

let List = React.createClass({
  // getInitialState() {
  //   const {children} = this.props;
  //   let promises = {};
  //   let resolvers = {};

  //   children.forEach((child,id) => {
  //     promises[id] = new Promise(resolve => {
  //       resolvers[id] = resolve;
  //     });
  //   });

  //   return {
  //     layout: {
  //       promises,
  //       resolvers,
  //     },
  //   };
  // },

  // componentDidMount() {
  //   (async () => {
  //     const {promises} = this.state.layout;
  //     let results = {};
  //     (await* _.values(promises)).forEach(({id,layout}) => {
  //       results[id] = layout;
  //     });

  //     this.setState({layout: {...this.state.layout,results}});
  //     this.onLayoutComplete();
  //   })();
  // },

  // onLayoutComplete() {
  //   const {results} = this.state.layout;
  //   console.log("onLayoutComplete");
  //   console.log(results);
  // },

  // handleItemLayout(id,layout) {
  //   const {resolvers} = this.state.layout;
  //   resolvers[id]({id,layout});
  //   // console.log(id,layout);
  // },

  // calculateLayout() {
  //   const {results} = this.state.layout;
  //   if(resolve == null) {
  //     return;
  //   }
  // }

  getInitialState() {
    return {
      layouts: {},
    };
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

    // this.setState({layouts: {

    // }});
  },

  componentDidMount() {
    console.log("list mounted");
  },

  render() {
    // const {jokes} = this.state;
    // const {}
    // const {results} = this.state.layout;

    // let contentHeight;
    // if(results) {
    //   contentHeight = _.values(results).reduce((acc,layout) => acc + layout.offsetHeight + 10,0)
    // }

    const dataRenderer = this.props.children;
    if(typeof dataRenderer != 'function') {
      throw "must be a function"
    }

    const items = this.props.items;
    let curHeight = 0;
    let marginBottom = 10;
    const children = Object.keys(items).map((_key) => {
        const item = items[_key];
        const key = `#${_key}`;

        let layout = this.state.layouts[key];

        let style;
        if(layout) {
          style = {
            position: 'absolute',
            top: curHeight,
            opacity: 1,
          }

          curHeight = curHeight + layout.offsetHeight + marginBottom;
        } else {
          style = {
            position: 'absolute',
            top: 0,
            opacity: 1,
          }
        }

        return (
          <Spring
            key={key}
            // defaultValue={{top: {val: 0}}}
            endValue={{top: {val: style.top}}}
            >
            {
              ({top}) => {
                let style = {
                  position: 'absolute',
                  top: 0,
                  transform: `translate3d(0,${top.val}px,0)`,
                }
                return (
                  <Item id={key} key={key}
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
        style={{height: contentHeight}}
        >
        {children}
      </ul>

    );
  }
});

const App = React.createClass({
  shuffle() {
    const {items} = this.state;

    this.setState({
      items: reorderKeys(items,keys => shuffle(keys)),
    });
  },

  getInitialState() {
    let items = {};

    QUOTES.slice(0,8).forEach((quote,i) => {
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
        <h1 className="shuffle-button noselect" onClick={this.shuffle}>Shuffle</h1>
        <List items={items}>
          {item => <span>{item}</span>}
        </List>
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