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

![Alt text](images/search-panel.png?raw=true "Title")