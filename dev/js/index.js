import "../css/react-things.scss";
const components = {};

const warnReadonly = () => { console.warn('You cannot set readonly property.'); }

Object.defineProperty(components, 'BaseComponent', {
  configurable: false,
  enumerable: true,
  get: () => { return require("./components/base-comp.jsx").default; },
  set: warnReadonly
});

Object.defineProperty(components, 'CRUDComponent', {
  configurable: false,
  enumerable: true,
  get: () => { return require("./components/crud-comp.jsx").default; },
  set: warnReadonly
});

module.exports = components;