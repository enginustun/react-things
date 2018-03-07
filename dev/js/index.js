import '../css/react-things.scss';

const components = {};

Object.defineProperty(components, 'BaseComponent', {
  configurable: false,
  enumerable: true,
  get: () => require('./components/base-comp.jsx').default, // eslint-disable-line global-require
  set: undefined,
});

Object.defineProperty(components, 'CRUDComponent', {
  configurable: false,
  enumerable: true,
  get: () => require('./components/crud-comp.jsx').default, // eslint-disable-line global-require
  set: undefined,
});

module.exports = components;
