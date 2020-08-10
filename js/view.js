/*global qs, qsa, $on, $parent, $delegate */

(function (window) {
	'use strict';

	/**
	     * View that abstracts away the browser's DOM completely.
		 * It has two simple entry points:
	     *
		 *   - bind(eventName, handler)
		 *     Takes a todo application event and registers the handler
		 *   - render(command, parameterObject)
		 *     Renders the given command with the options
		 * @constructor
		 * @param {Template} template The template instance
	     */
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

	/**
	 * Removes a todolist item of specific ID from the DOM 
	 * @param {number} id The ID of the specific todo
	 */
	View.prototype._removeItem = function (id) {
		var elem = qs('[data-id="' + id + '"]');

		if (elem) {
			this.$todoList.removeChild(elem);
		}
	};

	/**
	 * Hides the Clear Completed button when completedCount is zero and vice verca
	 * @param {number} completedCount The number of todos completed
	 * @param {boolean} visible 'true' | 'false' | whether 'clear completed' button should show or nor
	 */
	View.prototype._clearCompletedButton = function (completedCount, visible) {
		this.$clearCompleted.innerHTML = this.template.clearCompletedButton(completedCount);
		this.$clearCompleted.style.display = visible ? 'block' : 'none';
	};

	/**
	 * sets the Selected tab based on currentPage's value, whether 'active', 'completed'
	 * @param {string} currentPage 'active' | 'completed' | to set the filter accordingly
	 */
	View.prototype._setFilter = function (currentPage) {
		qs('.filters .selected').className = '';
		qs('.filters [href="#/' + currentPage + '"]').className = 'selected';
	};

	/**
	 * Sets the classname of selected/unselected list item based on its selection
	 * @param {number} id The ID of specific todo to get the DOM element
	 * @param {boolean} completed 'true' | 'false' | Completed status for a todo has been completed or not and applies class accordingly
	 */
	View.prototype._elementComplete = function (id, completed) {
		var listItem = qs('[data-id="' + id + '"]');

		if (!listItem) {
			return;
		}

		listItem.className = completed ? 'completed' : '';

		// In case it was toggled from an event and not by clicking the checkbox
		qs('input', listItem).checked = completed;
	};

	/**
	 * appends an input element in the listItem with ID that is passed as param, also sets value of input box using title passed in param
	 * @param {number} id The ID of specific todo to get the DOM element
	 * @param {string} title The title of specific todo to show it in the new input element for editing purpose
	 */
	View.prototype._editItem = function (id, title) {
		var listItem = qs('[data-id="' + id + '"]');

		if (!listItem) {
			return;
		}

		listItem.className = listItem.className + ' editing';

		var input = document.createElement('input');
		input.className = 'edit';

		listItem.appendChild(input);
		input.focus();
		input.value = title;
	};

	/**
	 * remove input element from listItem with ID from params, updates its class and update "label's" textContent of listItem
	 * @param {number} id The ID of specific todo to get the DOM element
	 * @param {string} title The title of specific todo to update it in the DOM LABEL element
	 */
	View.prototype._editItemDone = function (id, title) {
		var listItem = qs('[data-id="' + id + '"]');

		if (!listItem) {
			return;
		}

		var input = qs('input.edit', listItem);
		listItem.removeChild(input);

		listItem.className = listItem.className.replace('editing', '');

		qsa('label', listItem).forEach(function (label) {
			label.textContent = title;
		});
	};

	/**
	 * A Central rendering Method that holds the rendering logic based on the params which tell which rendering method to execute
	 * @param {string} viewCmd This holds the function name
	 * @param {number | object | Array | string} parameter This holds the parameters that are passed to execute the function passed in viewCmd
	 */
	View.prototype.render = function (viewCmd, parameter) {
		var self = this;
		var viewCommands = {
			showEntries: function () {
				self.$todoList.innerHTML = self.template.show(parameter);
			},
			removeItem: function () {
				self._removeItem(parameter);
			},
			updateElementCount: function () {
				self.$todoItemCounter.innerHTML = self.template.itemCounter(parameter);
			},
			clearCompletedButton: function () {
				self._clearCompletedButton(parameter.completed, parameter.visible);
			},
			contentBlockVisibility: function () {
				self.$main.style.display = self.$footer.style.display = parameter.visible ? 'block' : 'none';
			},
			toggleAll: function () {
				self.$toggleAll.checked = parameter.checked;
			},
			setFilter: function () {
				self._setFilter(parameter);
			},
			clearNewTodo: function () {
				self.$newTodo.value = '';
			},
			elementComplete: function () {
				self._elementComplete(parameter.id, parameter.completed);
			},
			editItem: function () {
				self._editItem(parameter.id, parameter.title);
			},
			editItemDone: function () {
				self._editItemDone(parameter.id, parameter.title);
			}
		};

		viewCommands[viewCmd]();
	};

	/**
	 * get the parent 'li' element to get ID of the li
	 * @param {HTMLLabelElement} element The "label" html element to get the "li"
	 * @returns {number} The ID of "li" which was found using "label" passed
	 */
	View.prototype._itemId = function (element) {
		var li = $parent(element, 'li');
		return parseInt(li.dataset.id, 10);
	};

	/**
	 * binds the todo-list DOM elements the "blur" listener and calls a callback which will get 
	 * "id" and "title" upon event triggering and call the controller's callback. Also, binds another
	 * "keypress" listener to check if pressed button is "Enter"
	 * @param {function} handler The callback function which handles the business logic
	 */
	View.prototype._bindItemEditDone = function (handler) {
		var self = this;
		$delegate(self.$todoList, 'li .edit', 'blur', function () {
			if (!this.dataset.iscanceled) {
				handler({
					id: self._itemId(this),
					title: this.value
				});
			}
		});

		$delegate(self.$todoList, 'li .edit', 'keypress', function (event) {
			if (event.keyCode === self.ENTER_KEY) {
				// Remove the cursor from the input when you hit enter just like if it
				// were a real form
				this.blur();
			}
		});
	};

	/**
	 * binds the todo-list DOM elements the "keyup" listener and calls a callback which will get called upon "keyup" of todolist
	 * @param {function} handler The callback function that handles the business logic
	 */
	View.prototype._bindItemEditCancel = function (handler) {
		var self = this;
		$delegate(self.$todoList, 'li .edit', 'keyup', function (event) {
			if (event.keyCode === self.ESCAPE_KEY) {
				this.dataset.iscanceled = true;
				this.blur();

				handler({id: self._itemId(this)});
			}
		});
	};

	/**
	 * Called by controller to bind todolist DOM elements with relavent controller's method
	 * @param {string} event The name of the event
	 * @param {function} handler The callback function that handles the business logic
	 */
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

		} else if (event === 'toggleAll') {
			$on(self.$toggleAll, 'click', function () {
				handler({completed: this.checked});
			});

		} else if (event === 'itemEdit') {
			$delegate(self.$todoList, 'li label', 'dblclick', function () {
				handler({id: self._itemId(this)});
			});

		} else if (event === 'itemRemove') {
			$delegate(self.$todoList, '.destroy', 'click', function () {
				handler({id: self._itemId(this)});
			});

		} else if (event === 'itemToggle') {
			$delegate(self.$todoList, '.toggle', 'click', function () {
				handler({
					id: self._itemId(this),
					completed: this.checked
				});
			});

		} else if (event === 'itemEditDone') {
			self._bindItemEditDone(handler);

		} else if (event === 'itemEditCancel') {
			self._bindItemEditCancel(handler);
		}
	};

	// Export to window
	window.app = window.app || {};
	window.app.View = View;
}(window));
