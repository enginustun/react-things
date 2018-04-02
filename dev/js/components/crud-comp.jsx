/* eslint no-param-reassign: ["error", { "props": false }] */
/* eslint no-underscore-dangle: ["error", { "allow": ["_bind"] }] */
/* eslint new-cap: ["error", { "newIsCap": false }] */
import React from 'react';
import moment from 'moment';
import { RestBaseModel } from 'rest-in-model';
import { Form, Row, Col, Input, Button, Icon, Select, Checkbox, DatePicker, Table, Divider, Popconfirm, Modal, message } from 'antd';
import BaseComp from './base-comp.jsx';
import helper from '../common/helper';

const { TextArea } = Input;
// const FormItem = Form.Item;

const searchFormItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const addUpdateFormItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const availableActionKeys = ['update', 'view', 'delete'];
const actionIconTypes = {
  update: 'edit',
  view: 'search',
  delete: 'delete',
};

const hasProperty = (obj, propName) => Object.getOwnPropertyNames(obj).indexOf(propName) > -1;

export default class CrudComponent extends BaseComp {
  constructor(props) {
    super(props);
    /**
     * props: {
     *  model: instance of RestBaseModel,
     *  sortAttributeName: string,
     *  sortOrderAttributeName: string,
     *  sortQueryType: string,
     *  sortOrderAscText: string,
     *  sortOrderDescText: string,
     *  pageAttribute: string,
     *  pageLimitAttribute: string,
     *  pageSizeOptions: [],
     *  searchFields: [],
     *  searchTitle: string,
     *  tableColumns: [],
     *  tableBordered: boolean,
     *  tableSize: string,
     *  totalCountFrom: string,
     *  totalCountField: string,
     *  addUpdateFields: [],
     *  actionsTitle: string,
     *  actions: {},
     *  customActions: {},
     *  customTopActions: {}
     * }
     */

    const pageAttributeName = props.pageAttribute || '_page';
    const pageLimitAttributeName = props.pageLimitAttribute || '_limit';
    const sortAttributeName = props.sortAttributeName || '_sort';
    const sortOrderAttributeName = props.sortOrderAttributeName || '_order';
    this.state = {
      modelClass: undefined,

      // search
      showSearchFields: false,
      searchFields: props.searchFields || [],
      searchListDatas: {},
      searchCriterias: {
        [pageAttributeName]: 1,
        [pageLimitAttributeName]: 10,
      },

      addUpdateFields: props.addUpdateFields || [],
      addUpdateModel: undefined,
      modalState: { visible: false, type: undefined },

      // sort
      sortAttributeName,
      sortOrderAttributeName,
      sortOrderAscText: props.sortOrderText && props.sortOrderText.ascend ?
        props.sortOrderText.ascend : props.sortOrderAscText || 'asc',
      sortOrderDescText: props.sortOrderText && props.sortOrderText.descend ?
        props.sortOrderText.descend : props.sortOrderDescText || 'desc',
      sortQueryType: props.sortQueryType || 'separate',
      sorter: {},

      // pagination
      pageAttributeName,
      pageLimitAttributeName,
      totalCountFrom: props.totalCountFrom || 'response',
      totalCountField: props.totalCountField || 'count',
      tablePagination: {
        current: 1,
        pageSize: 10,
        pageSizeOptions: ['10', '25', '50'],
        total: 0,
      },

      tableLoading: false,
      tableData: [],
      tableColumns: [],

      actions: props.actions || {},
      customActions: props.customActions || {},
      customTopActions: props.customTopActions || {},
    };

    if (hasProperty(props, 'pageSizeOptions')) {
      this.state.tablePagination.pageSizeOptions = props.pageSizeOptions;
    }
    if (this.state.tablePagination.pageSizeOptions) {
      this.state.tablePagination.showSizeChanger = true;
      if (!Array.isArray(this.state.tablePagination.pageSizeOptions)) {
        this.state.tablePagination.pageSizeOptions = ['10', '25', '50'];
      }
    } else {
      this.state.tablePagination.pageSizeOptions = [];
    }

    // bind functions to access 'this' parameter in them.
    this._bind(
      'handleSearchInputChange',
      'handleSearch',
      'handleSearchReset',
      'handleTableChange',
      'handleAddUpdateInputChange',
      'handleUpdate',
      'handleView',
      'handleAddUpdateModalCancel',
      'handleAddUpdateModalSave',
      'handleDelete' // eslint-disable-line comma-dangle
    );

    if (this.modelVerification(props.model)) {
      // check if any searchField exists, if so we can show search form
      if (this.state.searchFields.length > 0) {
        this.state.showSearchFields = true;

        // TODO: handle initial select/tree values etc.
        this.state.searchFields.forEach((searchField) => {
          const searchFieldName = searchField.name || searchField;
          const fieldConfig = this.state.modelConfig.fields[searchFieldName] || {};
          fieldConfig.searchInput = fieldConfig.searchInput || searchField || {};

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

        // TODO: handle addUpdateFields and its initial select/tree values
      }

      if (Array.isArray(props.tableColumns)) {
        for (let i = 0; i < props.tableColumns.length; i += 1) {
          const column = props.tableColumns[i];
          const columnName = column.name || column;
          const fieldConfig = this.state.modelConfig.fields[columnName] || {};
          const columnInfo = {
            title: fieldConfig.title || columnName,
            dataIndex: columnName,
            render: column.render,
            sorter: column.sorter || false,
          };
          this.state.tableColumns.push(columnInfo);
        }
        const customActionKeys = Object.keys(this.state.customActions);
        const actionsRender = (text, record) => {
          const actionKeys = Object.keys(this.state.actions).filter(key =>
            key !== 'add' || availableActionKeys.indexOf(key) > -1);
          return <div>
            {actionKeys.map((actionKey, i) =>
              this.generateActionButton(record, actionKey, i, actionKeys.length))}
          </div>;
        };
        if (customActionKeys.length > 0 || this.state.actions.update ||
          this.state.actions.view || this.state.actions.delete) {
          const columnInfo = {
            title: props.actionsTitle || 'Actions',
            dataIndex: 'actions',
            render: actionsRender,
          };
          this.state.tableColumns.push(columnInfo);
        }
      }
    }
  }

  generateActionButton(record, key, index, total) {
    if (key === 'delete') {
      return <Popconfirm key={`actions-${index}`}
        onConfirm={() => {
          this[`handle${helper.strings.capitalizeFirstLetter(key)}`].call(this, record);
        }}
        title={this.state.actions[key].confirmText || 'Are you sure want to delete this record?'}
        okText={this.state.actions[key].okText || 'Yes'}
        cancelText={this.state.actions[key].cancelText || 'No'}>
        <a>
          <Icon style={{ marginRight: '5px' }}
            type={actionIconTypes[key]} />
          {this.state.actions[key].title || key}
        </a>
        {index < total - 1 ? <Divider type="veritcal" /> : null}
      </Popconfirm>;
    }
    return <span key={`actions-${index}`}>
      <a onClick={() => {
        this[`handle${helper.strings.capitalizeFirstLetter(key)}`].call(this, record);
      }}>
        <Icon style={{ marginRight: '5px' }}
          type={actionIconTypes[key]} />
        {this.state.actions[key].title || key}
      </a>
      {index < total - 1 ? <Divider type="veritcal" /> : null}
    </span>;
  }

  // verify that is model extends from RestBaseModel
  // assign modelClass attribte of state
  modelVerification(model) {
    if (model && model.constructor === RestBaseModel.constructor) {
      this.state.modelClass = model;
      this.state.modelConfig = this.state.modelClass[`${this.state.modelClass.name}_config`];
      this.state.addUpdateModel = new this.state.modelClass();
      return true;
    }
    return false;
  }

  handleUpdate(record) {
    const self = this;
    self.state.addUpdateModel = record;
    self.state.modalState.type = 'update';
    self.state.modalState.visible = true;
    self.refresh();
  }

  handleView(record) {
    const self = this;
    self.state.addUpdateModel = record;
    self.state.modalState.type = 'view';
    self.state.modalState.visible = true;
    self.refresh();
  }

  handleDelete(record) {
    const self = this;
    record.delete()
      .then(() => {
        message.success('The record has been successfully deleted.');
        self.handleSearch();
      })
      .catch((err) => {
        message.error('An error occured while saving record.');
        console.error(err);
      });
  }

  handleSearchInputChange(e, fieldConfig, searchFieldName) {
    const self = this;

    // handle search inputs' change events by type
    if (fieldConfig.searchInput.type === 'select') {
      self.state.searchCriterias[searchFieldName] = e;
    } else if (fieldConfig.searchInput.type === 'checkbox') {
      self.state.searchCriterias[searchFieldName] = e.target.checked;
    } else if (fieldConfig.searchInput.type === 'date') {
      if (e instanceof moment) {
        self.state.searchCriterias[searchFieldName] = e.format(fieldConfig.searchInput.format);
      } else { self.state.searchCriterias[searchFieldName] = null; }
    } else if (e.target.value) {
      self.state.searchCriterias[searchFieldName] = e.target.value;
    } else {
      delete self.state.searchCriterias[searchFieldName];
    }
  }

  getSearchCriteriasMap() {
    const self = this;
    const searchCriteriaKeys = Object.keys(self.state.searchCriterias);
    const criterias = {};

    searchCriteriaKeys.forEach((criteriaKey) => {
      criterias[(self.state.modelConfig.fields[criteriaKey] ?
        self.state.modelConfig.fields[criteriaKey].map : undefined) || criteriaKey] =
        self.state.searchCriterias[criteriaKey];
    });

    return criterias;
  }

  handleSearch() {
    const self = this;
    self.state.tableLoading = true;
    self.refresh();

    // get page and page_limit values from tablePagination object of state
    self.state.searchCriterias[self.state.pageAttributeName] = self.state.tablePagination.current;
    self.state.searchCriterias[self.state.pageLimitAttributeName] =
      self.state.tablePagination.pageSize;

    // send request with current searchCriterias to fill state.tableData with records in response
    self.state.modelClass.all({
      resultList: self.state.tableData,
      queryParams: self.getSearchCriteriasMap(),
    }).then(({ response, request }) => {
      self.state.tableLoading = false;

      // decide resource and get total record count from header or data
      if (self.state.totalCountFrom === 'header') {
        self.state.tablePagination.total = +request.getResponseHeader(self.state.totalCountField);
      } else if (self.state.totalCountFrom === 'response') {
        self.state.tablePagination.total = +response(self.state.totalCountField);
      }
      self.refresh();
    }).catch(() => {
      self.state.tableLoading = false;
      self.refresh();
    });
  }

  handleSearchReset() {
    const self = this;

    // reset curren page to 1
    self.state.tablePagination.current = 1;

    self.state.searchCriterias = {
      [self.state.pageAttributeName]: 1,
      // keep page limit parameter
      [self.state.pageLimitAttributeName]: self.state.tablePagination.pageSize,
    };

    self.state.searchFields.forEach((searchField) => {
      const searchFieldName = searchField.name || searchField;
      const fieldConfig = self.state.modelConfig.fields[searchFieldName] || {};
      fieldConfig.searchInput = fieldConfig.searchInput || searchField || {};

      // reset search fields' values
      if (fieldConfig.searchInput.defaultValue !== undefined) {
        this.state.searchCriterias[searchFieldName] = fieldConfig.searchInput.defaultValue;
      }
      if (self[`searchFieldCompRef_${searchFieldName}`]) {
        const { input } = self[`searchFieldCompRef_${searchFieldName}`];
        if (input) {
          input.value = '';
        }
      }
    });
    self.handleSearch();
  }

  handleTableChange(pagination, filters, sorter) {
    this.state.tablePagination.current = pagination.current;
    this.state.tablePagination.pageSize = pagination.pageSize;
    this.state.searchCriterias[this.state.pageAttributeName] = pagination.current;
    this.state.searchCriterias[this.state.pageLimitAttributeName] = pagination.pageSize;

    if (sorter.field && sorter.order) {
      this.state.sorter = sorter;
      if (this.state.sortQueryType === 'separate') {
        this.state.searchCriterias[this.state.sortAttributeName] = sorter.field;
        this.state.searchCriterias[this.state.sortOrderAttributeName] =
          sorter.order === 'ascend' ? this.state.sortOrderAscText : this.state.sortOrderDescText;
      } else if (this.state.sortQueryType === 'single') {
        this.state.searchCriterias[this.state.sortAttributeName] =
          `${sorter.order === 'ascend' ? '+' : '-'}${sorter.field}`;
      }
    }
    this.handleSearch();
  }

  componentDidMount() { this.handleSearch(); }

  isModalType(type) {
    return this.state.modalState.type === type;
  }

  renderSearchInput(fieldConfig, searchFieldName, searchField) {
    const self = this;
    fieldConfig.searchInput = fieldConfig.searchInput || searchField || {};
    const placeholder = searchField.placeholder || fieldConfig.searchInput.placeholder ||
      fieldConfig.placeholder;
    switch (fieldConfig.searchInput.type) {
      // render select search input
      case 'select':
        return <Select
          value={self.state.searchCriterias[searchFieldName]}
          allowClear={true}
          onChange={(e) => {
            self.handleSearchInputChange(e, fieldConfig, searchFieldName);
            self.refresh();
          }}
          placeholder={placeholder} >
          {self.state.searchListDatas[searchFieldName].map((data, j) => <Select.Option
            key={data[fieldConfig.searchInput.optionKeyField || 'id'] || data || `search-select-field-${j}`}
            value={data[fieldConfig.searchInput.optionValueField || 'value' || data]}>
            {data[fieldConfig.searchInput.optionTitleField || 'title' || data]}
          </Select.Option>)}
        </Select>;
      // render checkbox search input
      case 'checkbox':
        return <Checkbox
          checked={self.state.searchCriterias[searchFieldName]}
          style={{ top: '13px' }}
          onChange={(e) => {
            self.handleSearchInputChange(e, fieldConfig, searchFieldName);
            self.refresh();
          }} />;
      // render date search input
      case 'date':
        return <DatePicker
          value={self.state.searchCriterias[searchFieldName] ?
            moment(self.state.searchCriterias[searchFieldName]) :
            undefined}
          onChange={(e) => {
            self.handleSearchInputChange(e, fieldConfig, searchFieldName);
            self.refresh();
          }}
          format={fieldConfig.searchInput.format}
          showTime={fieldConfig.searchInput.showTime}
          style={{ width: '100%' }} />;
      // render text search input as default
      default:
        return <Input
          ref={(searchFieldCompRef) => { self[`searchFieldCompRef_${searchFieldName}`] = searchFieldCompRef; }}
          onChange={e => self.handleSearchInputChange(e, fieldConfig, searchFieldName)}
          type={fieldConfig.searchInput.type || 'text'}
          placeholder={placeholder}
          onKeyUp={(e) => {
            if (e.nativeEvent.keyCode === 13) {
              self.handleSearch();
            }
          }} />;
    }
  }

  renderAddUpdateInput(fieldConfig, fieldName, field) {
    const self = this;
    let resultField;
    fieldConfig.addUpdateInput = fieldConfig.addUpdateInput || field || {};
    const placeholder = field.placeholder || fieldConfig.addUpdateInput.placeholder ||
      fieldConfig.placeholder;
    if (self.isModalType('view')) {
      if (field.viewRender && field.viewRender.call) {
        resultField = field.viewRender.call(self, self.state.addUpdateModel);
      } else {
        resultField = self.state.addUpdateModel[fieldName];
      }
    } else {
      switch (fieldConfig.addUpdateInput.type) {
        case 'select':
          resultField = <Select name={fieldName}
            defaultValue={self.state.addUpdateModel[fieldName]}
            onChange={(value) => {
              self.handleAddUpdateInputChange({ target: { value } }, fieldConfig, fieldName);
            }}
            placeholder={placeholder}>
            {fieldConfig.addUpdateInput.data.map((data, i) => <Select.Option
              key={data[fieldConfig.addUpdateInput.optionKeyField] || i}
              value={data[fieldConfig.addUpdateInput.optionValueField || 'value' || data]}>
              {data[fieldConfig.addUpdateInput.optionTitleField || 'title' || data]}
            </Select.Option>)}
          </Select>;
          break;
        case 'textarea':
          resultField = <TextArea name={fieldName}
            defaultValue={self.state.addUpdateModel[fieldName]}
            onChange={(e) => { self.handleAddUpdateInputChange(e, fieldConfig, fieldName); }}
            placeholder={placeholder} />;
          break;
        case 'checkbox':
          resultField = <Checkbox name={fieldName}
            value={!self.state.addUpdateModel[fieldName]}
            style={{ top: '13px' }}
            onChange={(e) => { self.handleAddUpdateInputChange(e, fieldConfig, fieldName); }}
            placeholder={placeholder} />;
          break;
        default:
          resultField = <Input name={fieldName}
            defaultValue={self.state.addUpdateModel[fieldName]}
            onChange={(e) => { self.handleAddUpdateInputChange(e, fieldConfig, fieldName); }}
            type="text"
            placeholder={placeholder} />;
          break;
      }
    }
    return <div style={{ paddingLeft: '10px' }}>{resultField}</div>;
  }

  handleAddUpdateInputChange(e, fieldConfig, fieldName) {
    const self = this;
    switch (fieldConfig.addUpdateInput.type) {
      case 'checkbox':
        self.state.addUpdateModel[fieldName] = e.target.checked;
        break;
      case 'number':
        self.state.addUpdateModel[fieldName] = +e.target.value;
        break;
      default:
        self.state.addUpdateModel[fieldName] = e.target.value;
        break;
    }
  }

  handleAddUpdateModalCancel() {
    this.state.modalState.visible = false;
    this.refresh();
  }

  handleAddUpdateModalSave() {
    const self = this;
    self.state.addUpdateModel
      .save()
      .then(() => {
        if (self.isModalType('add')) {
          self.state.addUpdateModel = new this.state.modelClass();
          message.success('New record has been successfully added.');
        } else {
          message.success('The record has been successfully updated.');
        }
        self.handleAddUpdateModalCancel();
        self.handleSearch();
      })
      .catch((err) => {
        message.error('An error occured while saving record.');
        console.error(err);
      });
  }

  getAddUpdateModalTitle() {
    return helper.getMatchedWord(this.state.modalState.type, ['add', 'update', 'view'], ['Add Record', 'Update Record', 'View Record']);
  }

  render() {
    const self = this;

    // to find and show sort field's direction
    self.state.tableColumns.forEach((column) => {
      column.sortOrder = self.state.searchCriterias[self.state.sortAttributeName] ===
        column.dataIndex && self.state.sorter.order;
    });

    return (<div>
      {/* Search panel */}
      {
        this.state.showSearchFields ?
          <div>
            {self.props.searchTitle ? <div className="crud-comp-search-title"> {self.props.searchTitle} </div> : null}
            <div className="crud-comp-search-panel">
              <Form>
                <Row gutter={10}>
                  {self.state.searchFields.map((searchField, i) => {
                    const searchFieldName = searchField.name || searchField;
                    const fieldConfig = self.state.modelConfig.fields[searchFieldName] || {};
                    return fieldConfig ? (
                      <Col span={8}
                        key={`search-field-${i}`}>
                        <Form.Item
                          className="search-panel-form-item"
                          {...searchFormItemLayout}
                          label={fieldConfig.title || searchField.title || searchFieldName}>

                          { // if there is render method passed to component display it
                            // else display auto-generated input
                            searchField.render && searchField.render.call ?
                              searchField.render.call(self, self.state.searchCriterias) :
                              self.renderSearchInput(fieldConfig, searchFieldName, searchField)
                          }
                        </Form.Item>
                      </Col>
                    ) : null;
                  })}
                </Row>
                <Row>
                  <Col offset={16} span={8} className="crud-comp-search-buttons">
                    <Button type="primary"
                      onClick={() => {
                        self.state.tablePagination.current = 1;
                        self.handleSearch();
                      }}><Icon type="search" /> Search</Button>
                    <Button className="mr10" onClick={self.handleSearchReset}><Icon type="reload" /> Reset</Button>
                  </Col>
                </Row>
              </Form>
            </div>
          </div> : null
      }
      {/* List panel */}
      <div className="crud-comp-list-panel">
        {
          self.state.actions.add ?
            <div className="crud-comp-top-actions">
              <a href="#"
                onClick={() => {
                  self.state.addUpdateModel = new this.state.modelClass();
                  self.state.modalState.type = 'add';
                  self.state.modalState.visible = true;
                  self.refresh();
                }}>
                <Icon type="plus" />
                {self.state.actions.add.title || 'Add Record'}
              </a>
            </div> : null
        }
        <Table rowKey={record => record.id}
          loading={self.state.tableLoading}
          pagination={self.state.tablePagination}
          dataSource={self.state.tableData}
          columns={self.state.tableColumns}
          onChange={self.handleTableChange}
          bordered={self.props.tableBordered === undefined ? true : self.props.tableBordered}
          size={self.props.tableSize || 'small'} />
      </div>

      {/* Add/Update/View Form */}
      <Modal title={self.getAddUpdateModalTitle()}
        visible={self.state.modalState.visible}
        footer={!self.isModalType('view') ? [
          <Button key="cancel-button"
            onClick={self.handleAddUpdateModalCancel}>Cancel</Button>,
          <Button key="add-update-button"
            type="primary"
            onClick={self.handleAddUpdateModalSave}>Save</Button>,
        ] : null}
        onCancel={self.handleAddUpdateModalCancel}>
        <Form key={self.state.addUpdateModel.id}>
          {self.state.addUpdateFields.map((field, i) => {
            const fieldName = field.name || field;
            const fieldConfig = self.state.modelConfig.fields[fieldName] || {};
            const exclude = Array.isArray(field.exclude) &&
              field.exclude.indexOf(self.state.modalState.type) > -1;
            return !exclude ? <Form.Item key={i}
              {...addUpdateFormItemLayout}
              label={fieldConfig.title || fieldName}>
              {
                field.render && field.render.call ?
                  field.render.call(self, self.state.addUpdateModel) :
                  self.renderAddUpdateInput(fieldConfig, fieldName, field)
              }
            </Form.Item> : null;
          })}
        </Form>
      </Modal>
    </div>);
  }
}
