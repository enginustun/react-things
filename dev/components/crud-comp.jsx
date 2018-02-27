import BaseComp from './base-comp.jsx';

export default class CrudComponent extends BaseComp {
  constructor(props) {
    super(props);

    this.state = {
      title: 'Hello React!'
    }

    // bind functions to access 'this' parameter in them.
    this._bind('handleClick');
  }

  handleClick() {
    this.state.title = 'Hello Again!';
    this.refresh();
  }

  render() {
    return <div
      onClick={this.handleClick}
    >{this.state.title}</div>;
  }

};