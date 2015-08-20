/// <reference path="./types.d.ts" />

import React from "react/addons";
import {TransitionSpring,Spring,utils as RMutils} from "react-motion";

import _ from "lodash";
import {pick} from "lodash";

const {reorderKeys} = RMutils;

const {update} = React.addons;


// https://www.mashape.com/webknox/jokes
const jokes = [
  {
    "title": "",
    "joke": "When Chuck Norris was denied a Bacon McMuffin at McDonalds because it was 10:35, he roundhouse kicked the store so hard it became a KFC.",
    "category": "Chuck Norris",
    "rating": 0.9
  },
  {
    "title": "",
    "joke": "Chuck Norris once roundhouse kicked someone so hard that his foot broke the speed of light, went back in time, and killed Amelia Earhart while she was flying over the Pacific Ocean.",
    "category": "Chuck Norris",
    "rating": 0.87
  },
  {
    "title": "",
    "joke": "Every night at 8:00, a truck pulls up to Chuck Norris’ house. In the truck are a bunch of orphans. For the next half-hour, Chuck Norris practices roundhouse kicks on the orphans while “It’s a Hard Knock Life” plays in the background. At the end of the session, the orphans say “Thank you, Mr. Norris.” in perfect unison, then march into the truck in silence.",
    "category": "Chuck Norris",
    "rating": 0.8
  },
  {
    "title": "",
    "joke": "Scientists used to believe that diamond was the world's hardest substance. But then they met Chuck Norris, who gave them a roundhouse kick to the face so hard, and with so much heat and pressure, that the scientists turned into artificial Chuck Norris.",
    "category": "Chuck Norris",
    "rating": 0.75
  }
];


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

    jokes.forEach(({joke},i) => {
      items[`@${i}`] = joke;
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
        <h1 className="shuffle-button" onClick={this.shuffle}>Shuffle</h1>
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