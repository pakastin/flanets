/*!
 * wheellistener
 * @version 1.0.1
 * @author Alexander O'Mara
 * @copyright Copyright (c) 2015 Alexander O'Mara
 * @license MPL 2.0 <http://mozilla.org/MPL/2.0/>
 */
/* global window, define, module */
(function(root, factory) {'use strict';
	if (typeof define === 'function' && define.amd) {
		define(factory);
	}
	else if (typeof exports === 'object') {
		module.exports = factory();
	}
	else {
		root.wheellistener = factory();
	}
})(typeof window !== 'undefined' ? window : this, function() {'use strict';
	var undef;
	var internalPrefix = '___wheeleventshim___';
	var internalSIP = internalPrefix + 'stopImmediatePropagation';
	var eventModalCache;
	var counterUID = 0;
	var dict = {};
	var windowListIE = [];
	var currentEventShim;
	var currentEventShimmed;
	var modifierKeyMap = {
		Alt: 'altKey',
		Control: 'ctrlKey',
		Meta: 'metaKey',
		Shift: 'shiftKey'
	};
	// Property and default pairs, with defaults where safe.
	var eventProps = {
		// WheelEvent
		deltaMode: 1,
		deltaX: null, // Partial.
		deltaY: null,
		deltaZ: null, // Partial.
		// MouseEvent
		altKey: null,
		button: 0, // Always 0.
		buttons: null, // Partial.
		clientX: null,
		clientY: null,
		ctrlKey: null,
		metaKey: null,
		offsetX: null, // Partial.
		offsetY: null, // Partial.
		relatedTarget: null, // Always null.
		screenX: null,
		screenY: null,
		shiftKey: null,
		which: 1, // Non-standard, moderns browser always use 1.
		// UIEvent
		detail: 0, // Always 0 in modern browsers, contains delta in older browsers.
		pageX: null,
		pageY: null,
		view: null,
		// Event
		bubbles: true, // Always true.
		cancelable: true,
		currentTarget: null,
		defaultPrevented: false, // Initially false.
		eventPhase: null,
		target: null,
		timeStamp: null,
		type: 'wheel'
	};
	// Copy all the event properties into an array for speed, as these event fire very rapidly.
	var eventPropsList = [];
	for (var p in eventProps) {
		if (eventProps.hasOwnProperty(p)) {
			eventPropsList.push(p);
		}
	}
	var eventPropsListLength = eventPropsList.length;

	// Return the unique id for the DOM element or the object string for document or window.
	function ieDOMUID(elem) {
		return elem.uniqueNumber || '' + elem;
	}

	// Get the window object from an element, parentWindow supports old IE 6-8.
	function getElementWindow(elem) {
		// Get the document from the element, or perhaps the element is the document.
		var doc = elem.ownerDocument || elem;
		// Get the window from the document,
		return doc.defaultView || doc.parentWindow || (doc.document ? doc : null);
	}

	// Lazy event model detection with caching (highly unlikely to change).
	function getEventModal(win) {
		if (!eventModalCache) {
			var doc = win.document;
			var dummyElement = doc.createElement('p');
			var eventToBind =
				'onwheel' in dummyElement ? 'wheel' : // Standard.
				'onmousewheel' in dummyElement ? 'mousewheel' : // Pre-standard.
				'DOMMouseScroll' // Old Firefox, nothing bad will happen if unavailable.
			;
			// Browsers can support wheel events without having onwheel, IE does.
			var imp = doc.implementation;
			if (
				imp &&
				eventToBind !== 'wheel' &&
				imp.hasFeature &&
				imp.hasFeature('Events.wheel', '3.0') &&
				!imp.hasFeature('Events.' + internalPrefix, '3.0') // Make sure browser does not lie.
			) {
				eventToBind = 'wheel';
			}
			eventModalCache = {
				eventListener: !!win.addEventListener,
				eventToBind: eventToBind,
				shim: eventToBind !== 'wheel'
			};
		}
		return eventModalCache;
	}

	// Wrapper for indexOF with fallbask for old browsers.
	function index(arr, ser, off) {
		if (arr.indexOf) {
			return arr.indexOf(ser, off || 0);
		}
		for (var i = off || 0, il = arr.length; i < il; ++i) {
			if (arr[i] === ser) {
				return i;
			}
		}
		return -1;
	}

	/**
	 * Constructor for the polyfilled event object.
	 *
	 * @param {Event} e The event object to be wrapped.
	 */
	function WheelEventShim(e) {
		// Save the original event.
		this.originalEvent = e;
		// Initial copy.
		for (var i = eventPropsListLength; i--;) {
			var p = eventPropsList[i];
			this[p] = p in e ? e[p] : eventProps[p];
		}
		// Normalize properties.
		this.type = 'wheel';
		this.button = 0;
		this.detail = 0;
		this.which = 1;
		// Create deltas from the event, as best as we can.
		var axis;
		if (e.type === 'mousewheel') {
			this.deltaY = -1 / 40 * e.wheelDelta;
			// WebKit also support wheelDeltaX.
			if ('wheelDeltaX' in e) {
				this.deltaX = -1 / 40 * e.wheelDeltaX;
			}
		}
		else if (e.axis && (axis = [0, 'X', 'Y', 'Z'][e.axis])) {
			// Old Mozilla event provides axis property, theoretically Z is supported.
			this.deltaX = this.deltaY = this.deltaZ = 0;
			this['delta' + axis] = e.detail;
		}
		else {
			this.deltaY = e.detail;
		}
		// Adjust the delta mode for this event only.
		if (e.type === 'MozMousePixelScroll') {
			this.deltaMode = 0;
		}
		// In old WebKit target can be text nodes, traverse upwards to find lowest element.
		var target = e.target;
		if (target && target.nodeType === 3) {
			while ((target = target.parentNode || target.parentElement)) {
				if (target.nodeType !== 3) {
					// The event dispatcher mush also fix the eventPhase.
					this.target = target;
					break;
				}
			}
		}
	}
	// Methods for the wrapper.
	WheelEventShim.prototype.getModifierState = function(keyArg) {
		var originalEvent = this.originalEvent;
		if (originalEvent.getModifierState) {
			return originalEvent.getModifierState.apply(originalEvent, arguments);
		}
		// Emulate part of the functionality from the key states exposed in the event.
		var prop = modifierKeyMap[keyArg];
		return prop ? !!originalEvent[prop] : false;
	};
	WheelEventShim.prototype.preventDefault = function() {
		var originalEvent = this.originalEvent;
		if (originalEvent.preventDefault) {
			originalEvent.preventDefault();
		}
		else {
			originalEvent.returnValue = false;
		}
		this.defaultPrevented = true;
	};
	WheelEventShim.prototype.stopPropagation = function() {
		var originalEvent = this.originalEvent;
		if (originalEvent.stopPropagation) {
			originalEvent.stopPropagation();
		}
		else {
			originalEvent.cancelBubble = true;
		}
	};
	WheelEventShim.prototype.stopImmediatePropagation = function() {
		var originalEvent = this.originalEvent;
		if (originalEvent.stopImmediatePropagation) {
			originalEvent.stopImmediatePropagation();
		}
		else {
			// The internal property will stop the other callbacks.
			this.stopPropagation();
		}
		// Alert the shim not to continue the loop.
		this[internalSIP] = true;
	};
	// Create the prototype properties, init to null.
	for (var i = eventPropsListLength; i--;) {
		WheelEventShim.prototype[eventPropsList[i]] = null;
	}

	// Trigger the events in the list on the element with the provided shimmed event object.
	function triggerEvents(elem, events, eventShimmed) {
		// Set a flag to null instead of remove handlers.
		events.triggering = true;
		var ev;
		var i = -1;
		// Cache length for speed and most importantly to preventing added events from firing.
		var il = events.length;
		// Trigger the event callbacks.
		while (++i < il) {
			// Skip over nulled callbacks.
			if ((ev = events[i]) !== null) {
				// Check for stopImmediatePropagation flag.
				if (eventShimmed[internalSIP]) {
					delete eventShimmed[internalSIP];
					break;
				}
				ev.call(elem, eventShimmed);
			}
		}
		// Check again in case the last one set the flag.
		if (eventShimmed[internalSIP]) {
			delete eventShimmed[internalSIP];
		}
		// Reset flag.
		events.triggering = false;
		// Clean up any nulled out callbacks.
		i = 0;
		while ((i = index(events, null, i)) > -1) {
			events.splice(i, 1);
		}
	}

	// Wrapper to trigger event with the event wrapper.
	function eventShim(elem, e, useCapture) {
		// jshint validthis:true
		var eventShimmed;
		// If still same event object, use the same shimmed object.
		if (e === currentEventShim) {
			eventShimmed = currentEventShimmed;
			// Update the dynamic properties.
			eventShimmed.currentTarget = eventShimmed.originalEvent.currentTarget;
			eventShimmed.eventPhase = eventShimmed.originalEvent.eventPhase;
		}
		else {
			// Create a new shimmed event object and update the cache variables.
			currentEventShim = e;
			eventShimmed = currentEventShimmed = new WheelEventShim(e);
		}
		// Old WebKit allows target to be a text node, meaning it gets eventPhase 2.
		if (elem === eventShimmed.target) {
			eventShimmed.eventPhase = 2;
		}
		var hashID = elem[internalPrefix] + '-' + (useCapture ? 1 : 0);
		var events = dict[hashID];
		triggerEvents(elem, events, eventShimmed);
		// Set properties to their post-fire state.
		eventShimmed.currentTarget = null;
		eventShimmed.eventPhase = 0;
		// If the events are all gone, cleanup the event handlers.
		if (!events.length) {
			cleanupEvents(elem, useCapture);
		}
	}

	// Wrapper for events without capture phase.
	function eventShim0(e) {
		// jshint validthis:true
		eventShim(this, e, false);
	}

	// Wrapper for events with capture phase.
	function eventShim1(e) {
		// jshint validthis:true
		eventShim(this, e, true);
	}

	// Event callback for old IE to trigger events.
	function eventShimIE() {
		// jshint validthis:true
		// In IE, this will be the window of the element, but always the root frame element.
		var win = this;
		var e = win.event;
		// If there is no event object, the event is in a frame.
		if (!e) {
			// Loop over the stored window objects, only way to find which one.
			for (var wi = windowListIE.length; wi--;) {
				win = windowListIE[wi];
				if ((e = win.event)) {
					break;
				}
			}
			// If not found, do not continue.
			if (!e) {
				return;
			}
		}
		var doc = win.document;
		var docElem = doc.documentElement;
		var winID = win[internalPrefix];
		var target = e.srcElement;
		// Create a new shimmed event object and update the cache variables.
		var eventShimmed = new WheelEventShim(e);
		// Set properties not available in the event object.
		eventShimmed.target = target;
		eventShimmed.view = win;
		eventShimmed.timeStamp = (new Date()).getTime();
		eventShimmed.pageX = e.clientX + docElem.scrollLeft;
		eventShimmed.pageY = e.clientY + docElem.scrollTop;
		// If undefined, then make it false.
		eventShimmed.metaKey = !!e.metaKey;
		// Recurse up the tree, storing each element for looping both ways.
		var elem = target;
		var tree = [];
		do {
			tree.push(elem);
		} while ((elem = elem.parentElement));
		tree.push(doc, win);
		var treeLength = tree.length;
		// Loop over event phases.
		for (var p = -1; ++p < 2 && !e.cancelBubble;) {
			// Event phase 2 is handled below.
			var eventPhase = p === 0 ? 1 : 3;
			// Recurse down, then up, by reversing each time.
			tree.reverse();
			for (var i = -1; ++i < treeLength && !e.cancelBubble;) {
				elem = tree[i];
				// Create a unique identifier for the element and capture phase.
				var hashID = winID + '-' + ieDOMUID(elem) + '-' + (!p ? 1 : 0);
				// Get the event list for this ID if it exists.
				var events;
				if ((events = dict[hashID])) {
					// Set the dynamic properties.
					eventShimmed.currentTarget = elem;
					eventShimmed.eventPhase = elem === target ? 2 : eventPhase;
					// Trigger events.
					triggerEvents(elem, events, eventShimmed);
					// Set properties to their post-fire state.
					eventShimmed.currentTarget = null;
					eventShimmed.eventPhase = 0;
					// If the events are all gone, cleanup the event handlers.
					if (!events.length) {
						cleanupEventsIE(elem, !p);
					}
				}
			}
		}
	}

	// Cleanup internal variables, and if the last callback for the window, the counter, eventlistener, and window unique ID.
	function cleanupEventsIE(elem, useCapture) {
		var win = getElementWindow(elem);
		var winID = win[internalPrefix];
		var eventToBind = getEventModal(win).eventToBind;
		var hashID = winID + '-' + ieDOMUID(elem) + '-' + (useCapture ? 1 : 0);
		// Delete the entry from the dictionary.
		delete dict[hashID];
		// If this window has no other events attached, clear the event listener, counter, and internal ID.
		if (!dict[winID]) {
			// Remove this window form the list that will fire events.
			var i = 0;
			while ((i = index(windowListIE, win, i)) > -1) {
				windowListIE.splice(i, 1);
			}
			win.document.detachEvent('on' + eventToBind, eventShimIE);
			delete dict[winID];
			// Cannot delete window properties in old IE for whatever reason.
			win[internalPrefix] = undef;
		}
	}

	/**
	 * Add a wheel listener to an element.
	 *
	 * @param {Element}  elem       The DOM element to attach to.
	 * @param {Function} callback   The callback function.
	 * @param {Boolean}  useCapture Capture phase switch.
	 */
	function cleanupEvents(elem, useCapture) {
		var win = getElementWindow(elem);
		var eventToBind = getEventModal(win).eventToBind;
		// Delete the entry from the dicitonary.
		delete dict[elem[internalPrefix] + '-' + (useCapture ? 1 : 0)];
		// Remove the event listeners.
		elem.removeEventListener(eventToBind, useCapture ? eventShim1 : eventShim0, useCapture);
		// If old Firefox event, remove other old Firefox event.
		if (eventToBind === 'DOMMouseScroll') {
			elem.removeEventListener('MozMousePixelScroll', useCapture ? eventShim1 : eventShim0, useCapture);
		}
		// Check the other phase, if it has no events, remove id from the element.
		if (!dict[elem[internalPrefix] + '-' + (useCapture ? 0 : 1)]) {
			delete elem[internalPrefix];
		}
	}

	/**
	 * Add a wheel listener to an element.
	 *
	 * @param {Element}  elem       The DOM element to attach to.
	 * @param {Function} callback   The callback function.
	 * @param {Boolean}  useCapture Capture phase switch.
	 */
	function addWheelListener(elem, callback, useCapture) {
		var win = getElementWindow(elem);
		var eventModel = getEventModal(win);
		var eventToBind = eventModel.eventToBind;
		var events;
		var hashID;
		useCapture = !!useCapture;
		// IE <= 8.
		if (!eventModel.eventListener) {
			// Get unique ID for the window and the events that are attached, or initialize if not.
			var winID;
			if (!(winID = win[internalPrefix])) {
				winID = win[internalPrefix] = ++counterUID;
				// Store this window, to access event object if a frame.
				windowListIE.push(win);
				// window does not recieve the event, must attach to document.
				win.document.attachEvent('on' + eventToBind, eventShimIE);
			}
			// Create a unique identifier for the element and capture phase.
			hashID = winID + '-' + ieDOMUID(elem) + '-' + (useCapture ? 1 : 0);
			// Get the event list for this ID, or create it and attach event listener.
			events = dict[hashID] || (dict[hashID] = []);
			// Add the event to the list if not in the list.
			if (index(events, callback) < 0) {
				events.push(callback);
				// Keep track of how many listeners are on this window, allowing event listener to be detached when 0.
				dict[winID] = (dict[winID] || 0) + 1;
			}
		}
		// Pre-standards.
		else if (eventModel.shim) {
			// Get a unique ID of the element to create a unique identifier for the element and capture phase.
			hashID = (elem[internalPrefix] || (elem[internalPrefix] = ++counterUID)) + '-' + (useCapture ? 1 : 0);
			// Get the event list for this ID, or create it and attach event listener.
			if (!(events = dict[hashID])) {
				events = dict[hashID] = [];
				// Add the event listeners.
				elem.addEventListener(eventToBind, useCapture ? eventShim1 : eventShim0, useCapture);
				// If old Firefox event, add other old Firefox event.
				if (eventToBind === 'DOMMouseScroll') {
					elem.addEventListener('MozMousePixelScroll', useCapture ? eventShim1 : eventShim0, useCapture);
				}
			}
			// Add the event to the list if not in the list.
			if (index(events, callback) < 0) {
				events.push(callback);
			}
		}
		// Standards.
		else {
			elem.addEventListener(eventToBind, callback, useCapture);
		}
	}

	// removeEventListener wrapper.
	function removeWheelListener(elem, callback, useCapture) {
		var win = getElementWindow(elem);
		var eventModel = getEventModal(win);
		var eventToBind = eventModel.eventToBind;
		var events;
		var hashID;
		var i;
		useCapture = !!useCapture;
		// IE <= 8.
		if (!eventModel.eventListener) {
			var winID;
			if ((winID = win[internalPrefix])) {
				// Create a unique identifier for the element and capture phase.
				hashID = winID + '-' + ieDOMUID(elem) + '-' + (useCapture ? 1 : 0);
				// Get the event list for this ID, if any.
				if ((events = dict[hashID]) && (i = index(events, callback)) > -1) {
					// Decrement the callback count.
					--dict[winID];
					// Null if triggering, remove if not.
					if (events.triggering) {
						events[i] = null;
					}
					else {
						events.splice(i, 1);
						// If the events are all gone, cleanup the event handlers.
						if (!events.length) {
							cleanupEventsIE(elem, useCapture);
						}
					}
				}
			}
		}
		// Pre-standards.
		else if (eventModel.shim) {
			// Get a unique ID of the element to create a unique identifier for the element and capture phase.
			if ((hashID = elem[internalPrefix])) {
				hashID += '-' + (useCapture ? 1 : 0);
				if ((events = dict[hashID]) && (i = index(events, callback)) > -1) {
					// Null if triggering, remove if not.
					if (events.triggering) {
						events[i] = null;
					}
					else {
						events.splice(i, 1);
						// If the events are all gone, cleanup the event handlers.
						if (!events.length) {
							cleanupEvents(elem, useCapture);
						}
					}
				}
			}
		}
		// Standards.
		else {
			elem.removeEventListener(eventToBind, callback, useCapture);
		}
	}

	return {
		WheelEventShim: WheelEventShim,
		add: addWheelListener,
		remove: removeWheelListener
	};
});