/// <reference path="./types.d.ts" />

import React from "react";
import {TransitionSpring,Spring,utils as RMutils} from "react-motion";

const {reorderKeys} = RMutils;

const {update} = React.addons;

let Demo = React.createClass({
  getInitialState() {
    return {
    };
  },

  componentDidMount() {
  },

  render() {
    const {letters} = this.state;

    return (
      <h1>Hello React</h1>
    );
  }
});

function isAlphaNumeric(keyCode) {
  return (48 <= keyCode && keyCode <= 57) || (65 <= keyCode && keyCode <= 90);
}

const app = (
  <div className="container">
    <Demo/>
  </div>
);

React.render(app, document.querySelector('#content'));