
## Todo List Application

#### How to run the application

1. Open Command prompt
2. cd into the directory of the project
3. run the following command:
   `npm install`
4. Open index.html using your browser

### User Guide

* Upon running index.html, you will see the following page

    ![A test image](../guidepics/1.png)

* To add a new task, type the name of the task and press ENTER, as shown below

  ![alt text](../guidepics/2.png)

* After pressing ENTER, it will show as

  ![alt text](../guidepics/2a.png)

* To mark a task as Completed, you can click on the checkbox on each task item, as highlighted below

  ![alt text](../guidepics/3.png)

  ![alt text](../guidepics/4a.png)

* All the Completed tasks can be seen in the separate "Completed" tab / filter

  ![alt text](../guidepics/4b.png)

* You can check all the "Active" tasks in the Active tab. "All" tab will contain both active and completed tasks

  ![alt text](../guidepics/5.png)

* On the bottom left you can see the number of tasks which are active. Also, there's a button on bottom right to clear the tasks which are completed

  ![alt text](../guidepics/6.png)

* To mark all the tasks as "Completed" or "Active" again, you can click this button

  ![alt text](../guidepics/7.png)

* If you want to edit a task, "double click" on a task and the task will be opened in the edit mode for you to edit it. Pressing ENTER will save the update and ESC will not save it and get out of edit mode

  ![alt text](../guidepics/8.png)

* If you want to delete a task, hover the mouse over to the desired task and click on the red cross button to delete it

  ![alt text](../guidepics/9.png)

----------------------------------

# About the Code

### MVC:
The codebase is in MVC (Model - View - Controller) structure. This practice got recognised because of it's separation of concerns patterns. This coding practice is widely used by multiple frameworks and technologies, ASP.NET MVC, angular to be few named among those.

It works the way that View, Model and controller and disconnected and they are communicating with each other.

#### View:
View is what the user sees. It's job is to communicate with the Controller to pass and receive the data to and from the controller. View gets the data from the controller and displays it onto the UI and similarly, it gets user's interactions with the view and pass them onto the controller.

#### Controller:
Controller is the brain of the application. It takes data from the view and after processing, it saves the data using the model. It passes the required info to the view and gets the data persisted using model

#### Model:
Model has the job of data persistance. Controller asks the Model to perform database jobs. It can be used to retreive or save data in the database.

## How the code is working in the Todo-list application:

* Upon the application load, `Todo` class is initialized and it's job is to load `Store`, `Model`, `Template`, `View` and `Controller` with the necessory properties.

```js
function Todo(name) {
    this.storage = new app.Store(name);
    this.model = new app.Model(this.storage);
    this.template = new app.Template();
    this.view = new app.View(this.template);
    this.controller = new app.Controller(this.model, this.view);
}
```

* `Model` has `Store` object to perform DB operations, `View` has `Template` object to perform generic rendering changes. `Controller` has both `View` and `Model` objects because it communicates with both `View` and `Model`.

model.js:

```js
function Model(storage) {
    this.storage = storage;
}

...
```

view.cs

```js
...
function View(template) {
    this.template = template;

    this.ENTER_KEY = 13;
    this.ESCAPE_KEY = 27;

    this.$todoList = qs('.todo-list');
    this.$todoItemCounter = qs('.todo-count');
    this.$clearCompleted = qs('.clear-completed');
    this.$main = qs('.main');
    this.$footer = qs('.footer');
    this.$toggleAll = qs('.toggle-all');
    this.$newTodo = qs('.new-todo');
}
...
```

* On load, `Controller` uses `View`'s bind function to bind the UI  with it's own methods as `callbacks` so that `View` is connected to the `Controller` upon user `events`.

controller.js:

```js
function Controller(model, view) {
    var self = this;
    self.model = model;
    self.view = view;

    self.view.bind('newTodo', function (title) {
        self.addItem(title);
    });

    self.view.bind('itemEdit', function (item) {
        self.editItem(item.id);
    });

...
}
```

view.js

```js
...

View.prototype.bind = function (event, handler) {
    var self = this;
    if (event === 'newTodo') {
        $on(self.$newTodo, 'change', function () {
            handler(self.$newTodo.value);
        });

    } else if (event === 'removeCompleted') {
        $on(self.$clearCompleted, 'click', function () {
            handler();
        });
};
...
```

* `Controller` uses `View`'s `render()` method to update / render the view with the latest changes made by `Controller` using `Model`.

controller.js

```js
...

Controller.prototype.addItem = function (title) {
    var self = this;

    if (title.trim() === '') {
        return;
    }

    self.model.create(title, function () {
        self.view.render('clearNewTodo'); // NOTE HERE
        self._filter(true);
    });
};

    ...
```

view.js

```js
...

View.prototype.render = function (viewCmd, parameter) { // viewCmd = "clearNewTodo" here
    var self = this;
    var viewCommands = {
        showEntries: function () {
            self.$todoList.innerHTML = self.template.show(parameter);
        },
        clearNewTodo: function () {
            self.$newTodo.value = '';
        }

        ...
    };

    viewCommands[viewCmd]();
};

...
```

* `View` saves `Template`s object as its properties. `Template` has a central common code that holds generic methods to perform UI operations like adding `eventlisteners`, rendering todo item etc

* Overall functionality goes like:
  1. User does something on the UI
  2. As on load, controller has binded its methods as callbacks to the View's elements using Template, request comes to the scope of controller.
  3. `Controller` executes its method when the request reaches it using user interaction on the `View`. This method is responsible for communication with Model to store the data / retrieve the data from the database
  4. Model has a property of store object. Model uses this object to database changes to have central and reusable code.

---------------------------------

# How to run the Tests
