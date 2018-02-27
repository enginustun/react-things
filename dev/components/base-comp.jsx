export default class BaseComponent extends React.Component {
  constructor(props) {
    super(props);

    this._bind = this._bind.bind(this);
    this._bind('refresh');
  }

  // bind function to classes which will be extended from this base class
  // use this function to bind functions to be able to access 'this' parameter in them
  _bind() {
    for (let i = 0; i < arguments.length; i++) {
      const func = arguments[i];
      if (typeof func === 'string' && this[func] && this[func].bind) {
        this[func] = this[func].bind(this);
      }
    }
  }

  // generel refresh function
  // use attibute in options parameter or use original state object to set state easily
  refresh(options) {
    const stateKeys = Object.keys(this.state);
    const refreshObject = {};
    const opt = options || {};
    for (const key of stateKeys) {
      if (opt[key]) {
        refreshObject[key] = opt[key];
      } else {
        refreshObject[key] = this.state[key];
      }
    }
    this.setState(refreshObject);
  }
};