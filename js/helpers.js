/*global NodeList */
(function (window) {
	'use strict';

	
	/**
	 * Generic QuerySelector using selector passed as string to make a generic reusable function from scope or document object
	 *  
	 * @param {string} selector String to select the element, it can be using ID selection or using Class selection etc
	 * @param {HTMLElement | undefined} scope The element which will be the scope to perform selection
	 * @returns {HTMLElement} returns the desired element
	 */
	window.qs = function (selector, scope) {
		return (scope || document).querySelector(selector);
	};

	/**
	 * Generic QuerySelectorAll using selector passed as string to make a generic reusable function from scope or document object
	 * 
	 * @param {string} selector String to select the element, it can be using ID selection or using Class selection etc
	 * @param {HTMLElement | undefined} scope The element which will be the scope to perform selection
	 * @returns {HTMLElement} returns the desired element(s)
	 */
	window.qsa = function (selector, scope) {
		return (scope || document).querySelectorAll(selector);
	};

	/**
	 * Adds an event listener based on the params passed
	 * 
	 * @param {HTMLElement} target The HTML element on which the event listener is being binded to
	 * @param {string} type The type of event listener, e.g blur
	 * @param {function} callback The callback function which triggers when that event is fired
	 * @param {string} useCapture boolean to tell whether to "capture" or "bubble". 'true' will trigger event at beginning and 'false' will trigger at the end
	 */
	window.$on = function (target, type, callback, useCapture) {
		target.addEventListener(type, callback, !!useCapture);
	};

	/**
	 * Attach a handler to event for all elements that match the selector, now or in the future, based on a root element
	 * 
	 * @param {HTMLElement} target Elements upon whom the handler binded
	 * @param {string} selector String to select the element, it can be using ID selection or using Class selection etc
	 * @param {string} type type of the event, e.g "blur"
	 * @param {function} handler callback function which is executed to execute business logic when binded function "dispatchEvent" triggers
	 */
	window.$delegate = function (target, selector, type, handler) {
		function dispatchEvent(event) {
			var targetElement = event.target;
			var potentialElements = window.qsa(selector, target);
			var hasMatch = Array.prototype.indexOf.call(potentialElements, targetElement) >= 0;

			if (hasMatch) {
				handler.call(targetElement, event);
			}
		}

		// https://developer.mozilla.org/en-US/docs/Web/Events/blur
		var useCapture = type === 'blur' || type === 'focus';

		window.$on(target, type, dispatchEvent, useCapture);
	};

	/**
	 * Find the element's parent with the given tag name
	 * 
	 * @param {HTMLElement} element The HTML ELement is passed, e.g a "li" element
	 * @param {string} tagName The required element, e.g a "ul"
	 * @returns {HTMLElement} The required parent element as per "tagName" param of "element"
	 */
	window.$parent = function (element, tagName) {
		if (!element.parentNode) {
			return;
		}
		if (element.parentNode.tagName.toLowerCase() === tagName.toLowerCase()) {
			return element.parentNode;
		}
		return window.$parent(element.parentNode, tagName);
	};

	// Allow for looping on nodes by chaining:
	// qsa('.foo').forEach(function () {})
	NodeList.prototype.forEach = Array.prototype.forEach;
})(window);
