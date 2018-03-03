# react-things

RestBaseModel's CRUD component and reusable React components.

## Prerequisites

This project uses **rest-in-model** library to generate Component.

`npm install rest-in-model`

## Installing

TODO: It will be published on npm when its first release is ready.

## Features

* Search Panel
* List Panel with server-side pagination and sorting support
* Add/Update Forms with client-side/server-side validation support
* Built-in add/update/delete/view actions
* Custom action support
* Custom field render support for Search Panel, List Panel and Forms

---

### Search Panel

First, we need to define model fields to generate Search Panel automatically.

```javascript
Post.setConfig('fields', {
  id: {},
  userId: {
    title: 'User',
    placeholder: 'Please select an User',
    searchInput: {
      type: 'select',
      data: [{ title: 'Engin', value: 1 }, { title: 'Şeyma', value: 2 }],
      optionTitleField: 'title',
      optionValueField: 'value'
    }
  },
  title: {
    title: 'Title',
    placeholder: 'Please enter a title'
  },
  body: {
    title: 'Content',
    placeholder: 'Please enter a content'
  },
  releaseDate: {
    title: 'Release Date',
    searchInput: {
      type: 'date',
      showTime: { format: 'HH:mm' },
      format: 'YYYY-MM-DD HH:mm'
    }
  },
  approved: {
    title: 'Is Approved',
    searchInput: {
      type: 'checkbox',
      defaultValue: false
    }
  }
});
```

Then we only need to specify which fields we want to show in Search Panel through `searchFields` attribute.

```javascript
<CRUDComponent
    model={Post}
    searchTitle="Search Criterias"
    searchFields={[
      'title',
      'body',
      'userId',
      'releaseDate',
      'approved'
    ]}
  />
```

The result will be as follow:

![Alt text](images/search-panel.png?raw=true "CRUDComponent Search Panel")

---

### List Panel

`tableColumns` property should be defined to show fields in table for model which is specified in model property.

```javascript
<CRUDComponent 
      model={Post}
      searchTitle=...
      searchFields=...

      // table columns will be generated based on this property
      tableColumns={[
        // column name can be only string
        'id',
        // also extra properties can be specified
        {
          name: 'title',
          // for ex: activate sorting feature for this field
          sorter: true
        },
        {
          name: 'userId',
          // custom render is available for all fields
          render: (userId) => {
            var userName = userId == 1 ? 'Engin Üstün' : userId;
            return userName;
          }
        }
      ]}


      // PAGINATION SPECIFIC BELOW
      // name which will represent current page in query parameters
      // optional, default: '_page'
      pageAttribute="_page"

      // name which will represent visible number of records per page in query parameters
      // optional, default: '_limit'
      pageLimitAttribute="_limit"

      // available page size options
      // optional, default: ['10', '25', '50']
      pageSizeOptions={['10', '25', '50']}

      // where the total count of records is taken from, header or response
      // optional, default: 'response'
      totalCountFrom="header"

      // what is the total count's field name
      // optional, default: 'count'
      totalCountField="x-total-count"


      // SORT SPECIFIC BELOW
      // name which will represent sort field's name in query parameters
      // optional, default: '_sort'
      sortAttributeName="_sort"

      // name which will represent order in query parameters
      // optional, default: '_order'
      sortOrderAttributeName="_order"

      // it can be 'single' or 'separate'
      // single: "https://x.com/posts?_sort=(+|-)title -> [+ means asc] [- means desc] [(+|-) means + or -]
      // separate: https://x.com/posts?_sort=title&order=asc
      // optional, default: 'separate'
      sortQueryType="separate"

      // what will the sort order text be in query parameters
      // optional, default: { ascend: 'asc', descend: 'desc' }
      sortOrderText={{ ascend: 'asc', descend: 'desc' }}


      // TABLE STYLE BELOW
      // optional, default: true
      tableBordered={true}

      // it specifies size of table
      // optional, default: 'small', choises: ['small', 'middle', 'default']
      tableSize="small"
      />
```

The result will be as follow:

![Alt text](images/list-panel.png?raw=true "CRUDComponent List Panel")