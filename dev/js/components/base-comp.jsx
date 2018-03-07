import React from 'react';

export default class BaseComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // bind function to classes which will be extended from this base class
  // use this function to bind functions to be able to access 'this' parameter in them
  _bind(...funcs) {
    funcs.forEach((func) => {
      if (typeof func === 'string' && this[func] && this[func].bind) {
        this[func] = this[func].bind(this);
      }
    });
  }

  // generel refresh function
  // use attibute in options parameter or use original state object to set state easily
  refresh(options) {
    const stateKeys = Object.keys(this.state);
    const freshState = {};
    const opt = options || {};
    for (let i = 0; i < stateKeys.length; i += 1) {
      const key = stateKeys[i];
      if (Object.prototype.hasOwnProperty.call(opt, key)) {
        freshState[key] = opt[key];
      } else {
        freshState[key] = this.state[key];
      }
    }
    this.setState(freshState);
  }
}
