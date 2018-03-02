import BaseComp from './base-comp.jsx';
import { RestBaseModel } from 'rest-in-model';
import { Form, Row, Col, Input, Button, Icon, Select, Checkbox, DatePicker } from 'antd';
import 'antd/dist/antd.css';
import moment from 'moment';
const FormItem = Form.Item;

const searchFormItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
}

export default class CrudComponent extends BaseComp {
  constructor(props) {
    super(props);

    const pageAttributeName = props.pageAttribute || '_page';
    const pageLimitAttributeName = props.pageLimitAttribute || '_limit';
    this.state = {
      modelClass: undefined,
      showSearchFields: false,
      searchFields: props.searchFields || [],
      searchListDatas: {},
      searchCriterias: {
        [pageAttributeName]: 1,
        [pageLimitAttributeName]: 10
      },
      pageAttributeName,
      pageLimitAttributeName
    }

    // bind functions to access 'this' parameter in them.
    this._bind('handleSearchInputChange', 'handleSearch', 'handleSearchReset');

    if (this.modelVerification(props.model)) {
      // check if any searchField exists, if so we can show search form
      if (this.state.searchFields.length > 0) {
        this.state.showSearchFields = true;

        // TODO: handle initial select/tree values etc.
        this.state.searchFields.map((searchField, i) => {
          const searchFieldName = searchField.name || searchField;
          const fieldConfig = this.state.modelConfig.fields[searchFieldName];
          fieldConfig.searchInput = fieldConfig.searchInput || {};

          if (fieldConfig.searchInput.type === 'select') {
            if (fieldConfig.searchInput.dataSource) {
              // load data async
            } else {
              this.state.searchListDatas[searchFieldName] = fieldConfig.searchInput.data || [];
            }
          }
          if (fieldConfig.searchInput.defaultValue !== undefined) {
            this.state.searchCriterias[searchFieldName] = fieldConfig.searchInput.defaultValue;
          }
        });
      }
    }
  }

  // verify that is model extends from RestBaseModel 
  // assign modelClass attribte of state
  modelVerification(model) {
    if (model && model.constructor === RestBaseModel.constructor) {
      this.state.modelClass = model;
      this.state.modelConfig = this.state.modelClass[`${this.state.modelClass.name}_config`];
      return true;
    }
  }

  handleSearchInputChange(e, fieldConfig, searchFieldName) {
    var self = this;
    if (fieldConfig.searchInput.type === 'select') {
      self.state.searchCriterias[searchFieldName] = e;
    } else if (fieldConfig.searchInput.type === 'checkbox') {
      self.state.searchCriterias[searchFieldName] = e.target.checked;
    } else if (fieldConfig.searchInput.type === 'date') {
      if (e instanceof moment) {
        self.state.searchCriterias[searchFieldName] = e.format(fieldConfig.searchInput.format);
      } else { self.state.searchCriterias[searchFieldName] = null; }
    } else {
      self.state.searchCriterias[searchFieldName] = e.target.value;
    }
  }

  handleSearch(e) {
    var self = this;
    self.state.modelClass.all({ queryParams: self.state.searchCriterias }).then(({ resultList, response }) => {
      console.log(resultList, response);
    });
    console.log(self.state.searchCriterias);
  }

  handleSearchReset(e) {
    var self = this;
    self.state.searchCriterias = {
      [self.state.pageAttributeName]: 1,
      // keep page limit parameter
      [self.state.pageLimitAttributeName]: self.state.searchCriterias[self.state.pageLimitAttributeName]
    };
    self.state.searchFields.map((searchField, i) => {
      const searchFieldName = searchField.name || searchField;
      const fieldConfig = self.state.modelConfig.fields[searchFieldName];

      if (fieldConfig.searchInput.defaultValue !== undefined) {
        this.state.searchCriterias[searchFieldName] = fieldConfig.searchInput.defaultValue;
      }
      if (self[`searchFieldCompRef_${searchFieldName}`]) {
        ReactDOM.findDOMNode(self[`searchFieldCompRef_${searchFieldName}`]).value = '';
      }
    });
    self.refresh();
    self.handleSearch();
  }

  render() {
    const self = this;
    return (<div>
      {this.state.showSearchFields ? <div>
        {self.props.searchTitle ? <div className="crud-comp-search-title"> {self.props.searchTitle} </div> : null}
        <div className="crud-comp-search-panel">
          <Form>
            <Row gutter={10}>
              {self.state.searchFields.map((searchField, i) => {
                const searchFieldName = searchField.name || searchField;
                const fieldConfig = self.state.modelConfig.fields[searchFieldName];
                return fieldConfig ? (
                  <Col span={8}
                    key={`search-field-${i}`}>
                    <Form.Item
                      className="search-panel-form-item"
                      {...searchFormItemLayout}
                      label={fieldConfig.title || searchFieldName}>

                      { // if there is render method passed to component display it else display auto-generated input
                        searchField.render && searchField.render.call ? searchField.render.call(self, self.state.searchCriterias) :
                          fieldConfig.searchInput.type === 'select' ?
                            // render select search input
                            <Select
                              value={self.state.searchCriterias[searchFieldName]}
                              allowClear={true}
                              onChange={(e) => { self.handleSearchInputChange(e, fieldConfig, searchFieldName); self.refresh(); }}
                              placeholder={fieldConfig.placeholder} >
                              {self.state.searchListDatas[searchFieldName].map((data, j) => {
                                return <Select.Option
                                  key={`search-select-field-${i}-${j}`}
                                  value={data[fieldConfig.searchInput.optionValueField || data.title || data]}>
                                  {data[fieldConfig.searchInput.optionTitleField || data.title || data]}
                                </Select.Option>;
                              })}
                            </Select> :
                            fieldConfig.searchInput.type === 'checkbox' ?
                              // render checkbox search input
                              <Checkbox
                                checked={self.state.searchCriterias[searchFieldName]}
                                style={{ top: '13px' }}
                                onChange={(e) => { self.handleSearchInputChange(e, fieldConfig, searchFieldName); self.refresh(); }} /> :
                              fieldConfig.searchInput.type === 'date' ?
                                <DatePicker
                                  value={self.state.searchCriterias[searchFieldName] ?
                                    moment(self.state.searchCriterias[searchFieldName]) :
                                    undefined}
                                  onChange={(e) => { self.handleSearchInputChange(e, fieldConfig, searchFieldName); self.refresh(); }}
                                  format={fieldConfig.searchInput.format}
                                  showTime={fieldConfig.searchInput.showTime}
                                  style={{ width: '100%' }} /> :
                                // render input search input
                                <Input
                                  ref={(searchFieldCompRef) => { self[`searchFieldCompRef_${searchFieldName}`] = searchFieldCompRef; }}
                                  onChange={(e) => self.handleSearchInputChange(e, fieldConfig, searchFieldName)}
                                  type={fieldConfig.searchInput.type || 'text'}
                                  placeholder={fieldConfig.placeholder} />
                      }
                    </Form.Item>
                  </Col>
                ) : null;
              })}
            </Row>
            <Row>
              <Col offset={16} span={8} className="crud-comp-search-buttons">
                <Button type="primary" onClick={self.handleSearch}><Icon type="search" /> Search</Button>
                <Button className="mr10" onClick={self.handleSearchReset}><Icon type="reload" /> Reset</Button>
              </Col>
            </Row>
          </Form>
        </div>
      </div> : null}
    </div>);
  }
};