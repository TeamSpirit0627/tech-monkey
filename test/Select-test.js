'use strict';
/* global describe, it, beforeEach */

var helper = require('../testHelpers/jsdomHelper');
helper();

var sinon = require('sinon');
var unexpected = require('unexpected');
var unexpectedDom = require('unexpected-dom');
var unexpectedSinon = require('unexpected-sinon');
var expect = unexpected
	.clone()
	.installPlugin(unexpectedDom)
	.installPlugin(unexpectedSinon);

var React = require('react/addons');
var TestUtils = React.addons.TestUtils;

var Select = require('../src/Select');

// The displayed text of the currently selected item, when items collapsed
var DISPLAYED_SELECTION_SELECTOR = '.Select-placeholder';
var FORM_VALUE = '.Select > input';

class PropsWrapper extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = props || {};
	}
	
	setPropsForChild(props) {
		this.setState(props);
	}
	
	getChild() {
		return this.refs.child;
	}
	
	render() {
		var Component = this.props.childComponent;
		return (<Component {...this.state} ref="child" />);
	}
}

describe('Select', function() {
	var options, instance, onChange;
	var searchInputNode;

	function pressEnterToAccept() {
		TestUtils.Simulate.keyDown(searchInputNode, { keyCode: 13, key: 'Enter' });
	}
	
	function pressTabToAccept() {
		TestUtils.Simulate.keyDown(searchInputNode, { keyCode: 9, key: 'Tab' });
	}
	
	function pressEscape() {
		TestUtils.Simulate.keyDown(searchInputNode, { keyCode: 27, key: 'Escape' });
	}

	function typeSearchText(text) {
		TestUtils.Simulate.change(searchInputNode, { target: { value: text } });
	}

	function getSelectControl(instance) {
		return React.findDOMNode(instance).querySelector('.Select-control');
	}
	
	describe('with simple options', function () {

		beforeEach(function () {

			options = [
				{ value: 'one', label: 'One' },
				{ value: 'two', label: 'Two' },
				{ value: 'three', label: 'Three' }
			];
			
			onChange = sinon.spy();

			// Render an instance of the component
			instance = TestUtils.renderIntoDocument(
				<Select
					name="form-field-name"
					value="one"
					options={options}
					onChange={onChange}
					searchable={true}
					/>
			);
			
			// Focus on the input, such that mouse events are accepted
			searchInputNode = instance.getInputNode().getDOMNode().querySelector('input');
			TestUtils.Simulate.focus(searchInputNode);

		});
		

		it('should assign the given name', function () {
			var selectInputElement = TestUtils.scryRenderedDOMComponentsWithTag(instance, 'input')[0];
			expect(React.findDOMNode(selectInputElement).name, 'to equal', 'form-field-name');
		});
		
		it('should show the options on mouse click', function () {
			TestUtils.Simulate.mouseDown(React.findDOMNode(instance).querySelector('.Select-control'));
			var node = React.findDOMNode(instance);
			expect(node, 'queried for', '.Select-option', 'to have length', 3);
		});
		
		it('should display the labels on mouse click', function () {
			TestUtils.Simulate.mouseDown(React.findDOMNode(instance).querySelector('.Select-control'));
			var node = React.findDOMNode(instance);
			expect(node, 'queried for', '.Select-option:nth-child(1)', 'to have items satisfying', 'to have text', 'One');
			expect(node, 'queried for', '.Select-option:nth-child(2)', 'to have items satisfying', 'to have text', 'Two');
			expect(node, 'queried for', '.Select-option:nth-child(3)', 'to have items satisfying', 'to have text', 'Three');
		});
		
		it('should filter after entering some text', function () {
			
			typeSearchText('T');
			var node = React.findDOMNode(instance);
			expect(node, 'queried for', '.Select-option:nth-child(1)', 'to have items satisfying', 'to have text', 'Two');
			expect(node, 'queried for', '.Select-option:nth-child(2)', 'to have items satisfying', 'to have text', 'Three');
			expect(node, 'queried for', '.Select-option', 'to have length', 2);
		});
		
		it('should filter case insensitively', function () {

			typeSearchText('t');
			var node = React.findDOMNode(instance);
			expect(node, 'queried for', '.Select-option:nth-child(1)', 'to have items satisfying', 'to have text', 'Two');
			expect(node, 'queried for', '.Select-option:nth-child(2)', 'to have items satisfying', 'to have text', 'Three');
			expect(node, 'queried for', '.Select-option', 'to have length', 2);
		});
		
		it('should filter using "contains"', function () {
			
			// Search 'h', should only show 'Three'
			typeSearchText('h');
			var node = React.findDOMNode(instance);
			expect(node, 'queried for', '.Select-option:nth-child(1)', 'to have items satisfying', 'to have text', 'Three');
			expect(node, 'queried for', '.Select-option', 'to have length', 1);
		});
		
		it('should accept when enter is pressed', function () {

			// Search 'h', should only show 'Three'
			typeSearchText('h');
			pressEnterToAccept();
			expect(onChange, 'was called with', 'three');
		});
		
		it('should accept when tab is pressed', function () {

			// Search 'h', should only show 'Three'
			typeSearchText('h');
			pressTabToAccept();
			expect(onChange, 'was called with', 'three');
		});
		
		describe('pressing escape', function () {
			beforeEach(function () {
				typeSearchText('h');
				pressTabToAccept();
				expect(onChange, 'was called with', 'three');
				onChange.reset();
				pressEscape();
			});
			
			it('should call onChange with a empty value', function () {
				
				// TODO: Shouldn't this be null, really?
				expect(onChange, 'was called with', '');
			});
			
			it('should clear the display', function () {
				
				expect(React.findDOMNode(instance).querySelector(DISPLAYED_SELECTION_SELECTOR),
					'to have text', 'Select...');
			});
		});
		
		it('should focus the first value on mouse click', function () {

			TestUtils.Simulate.mouseDown(React.findDOMNode(instance).querySelector('.Select-control'));
			expect(React.findDOMNode(instance), 'queried for', '.Select-option.is-focused',
				'to have items satisfying',
				'to have text', 'One');
		});
		
		it('should move the focused value to the second value when down pressed', function () {

			var selectControl = getSelectControl(instance);
			TestUtils.Simulate.mouseDown(selectControl);
			TestUtils.Simulate.keyDown(selectControl, { keyCode: 40, key: 'ArrowDown' });
			expect(React.findDOMNode(instance), 'queried for', '.Select-option.is-focused',
				'to have items satisfying',
				'to have text', 'Two');
		});
		
		it('should move the focused value to the second value when down pressed', function () {

			var selectControl = getSelectControl(instance);
			TestUtils.Simulate.mouseDown(selectControl);
			TestUtils.Simulate.keyDown(selectControl, { keyCode: 40, key: 'ArrowDown' });
			TestUtils.Simulate.keyDown(selectControl, { keyCode: 40, key: 'ArrowDown' });
			expect(React.findDOMNode(instance), 'queried for', '.Select-option.is-focused',
				'to have items satisfying',
				'to have text', 'Three');
		});
		
		it('should loop round to top item when down is pressed on the last item', function () {

			var selectControl = getSelectControl(instance);
			TestUtils.Simulate.mouseDown(selectControl);
			TestUtils.Simulate.keyDown(selectControl, { keyCode: 40, key: 'ArrowDown' });
			TestUtils.Simulate.keyDown(selectControl, { keyCode: 40, key: 'ArrowDown' });
			TestUtils.Simulate.keyDown(selectControl, { keyCode: 40, key: 'ArrowDown' });
			expect(React.findDOMNode(instance), 'queried for', '.Select-option.is-focused',
				'to have items satisfying',
				'to have text', 'One');
		});
		
		
		it('should loop round to bottom item when up is pressed on the first item', function () {

			var selectControl = getSelectControl(instance);
			TestUtils.Simulate.mouseDown(selectControl);
			TestUtils.Simulate.keyDown(selectControl, { keyCode: 38, key: 'ArrowUp' });
			expect(React.findDOMNode(instance), 'queried for', '.Select-option.is-focused',
				'to have items satisfying',
				'to have text', 'Three');
		});
		
		it('should clear the selection on escape', function () {
			
			var selectControl = getSelectControl(instance);
			TestUtils.Simulate.mouseDown(selectControl);
			TestUtils.Simulate.keyDown(selectControl, { keyCode: 27, key: 'Escape' });
			expect(React.findDOMNode(instance).querySelectorAll('.Select-option'),
				'to have length', 0);
			
		});
		
		it('should open the options on arrow down with the top option focused, when the options are closed', function () {

			var selectControl = getSelectControl(instance);
			var domNode = React.findDOMNode(instance);
			TestUtils.Simulate.keyDown(selectControl, { keyCode: 38, key: 'ArrowDown' });
			expect(domNode, 'queried for', '.Select-option.is-focused',
				'to have items satisfying',
				'to have text', 'One');
		});
		
		it('should open the options on arrow up with the top option focused, when the options are closed', function () {

			var selectControl = getSelectControl(instance);
			var domNode = React.findDOMNode(instance);
			TestUtils.Simulate.keyDown(selectControl, { keyCode: 40, key: 'ArrowDown' });
			expect(domNode, 'queried for', '.Select-option.is-focused',
				'to have items satisfying',
				'to have text', 'One');
		});
		
		
		describe('after mouseEnter and leave of an option', function () {
			
			beforeEach(function () {

				// Show the options
				var selectControl = getSelectControl(instance);
				TestUtils.Simulate.keyDown(selectControl, { keyCode: 40, key: 'ArrowDown' });
				
				var optionTwo = React.findDOMNode(instance).querySelectorAll('.Select-option')[1];
				TestUtils.SimulateNative.mouseOver(optionTwo);
				TestUtils.SimulateNative.mouseOut(optionTwo);
			});
			
			it('should have no focused options', function () {
				
				var domNode = React.findDOMNode(instance);
				expect(domNode.querySelectorAll('.Select-option.is-focused'), 'to have length', 0);
			});
			
			it('should focus top option after down arrow pressed', function () {

				var selectControl = getSelectControl(instance);
				TestUtils.Simulate.keyDown(selectControl, { keyCode: 40, key: 'ArrowDown' });
				var domNode = React.findDOMNode(instance);
				expect(domNode, 'queried for', '.Select-option.is-focused',
					'to have items satisfying',
					'to have text', 'One');
				
			});
			
			it('should focus last option after up arrow pressed', function () {

				var selectControl = getSelectControl(instance);
				TestUtils.Simulate.keyDown(selectControl, { keyCode: 38, key: 'ArrowUp' });
				var domNode = React.findDOMNode(instance);
				expect(domNode, 'queried for', '.Select-option.is-focused',
					'to have items satisfying',
					'to have text', 'Three');
			});
			
		});
		
	});

	describe('with options and value', function () {
		
		var wrapper;

		beforeEach(function () {

			options = [
				{ value: 'one', label: 'One' },
				{ value: 'two', label: 'Two' },
				{ value: 'three', label: 'Three' }
			];

			onChange = sinon.spy();

			// Render an instance of the component
			wrapper = TestUtils.renderIntoDocument(
				<PropsWrapper
					childComponent={Select}
					name="form-field-name"
					value="one"
					options={options}
					onChange={onChange}
					searchable={true}
				/>
			);

			// Focus on the input, such that mouse events are accepted
			instance = wrapper.getChild();
			searchInputNode = instance.getInputNode().getDOMNode().querySelector('input');
			TestUtils.Simulate.focus(searchInputNode);
		});
		
		it('starts with the given value', function () {
			
			var node = React.findDOMNode(instance);
			expect(node, 'queried for', DISPLAYED_SELECTION_SELECTOR,
				'to have items satisfying', 'to have text', 'One');
		});
		
		
		
		it('supports setting the value via prop', function () {
			
			wrapper.setPropsForChild({
				value: 'three'
			});
			
			expect(React.findDOMNode(instance), 'queried for', DISPLAYED_SELECTION_SELECTOR,
				'to have items satisfying', 'to have text', 'Three');
		});
		
		it('sets the value of the hidden form node', function () {
			
			wrapper.setPropsForChild({
				value: 'three'
			});
			
			expect(React.findDOMNode(wrapper).querySelector(FORM_VALUE).value, 'to equal', 'three' );
		});
		
		it('display the raw value if the option is not available', function () {
			
			wrapper.setPropsForChild({
				value: 'something new'
			});
			
			expect(React.findDOMNode(instance), 'queried for', DISPLAYED_SELECTION_SELECTOR,
				'to have items satisfying', 'to have text', 'something new');
		});

		it('updates the display text if the option appears later', function () {

			wrapper.setPropsForChild({
				value: 'new'
			});

			wrapper.setPropsForChild({
				options: [
					{ value: 'one', label: 'One' },
					{ value: 'two', labal: 'Two' },
					{ value: 'new', label: 'New item in the options' },
					{ value: 'three', label: 'Three' }
				]
			});

			expect(React.findDOMNode(instance), 'queried for', DISPLAYED_SELECTION_SELECTOR,
				'to have items satisfying', 'to have text', 'New item in the options');

		});
	});
});
