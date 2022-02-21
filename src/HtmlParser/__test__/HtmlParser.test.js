import React from 'react';
import ReactDOM from 'react-dom';
import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';

import HtmlParser from '../HtmlParser';

afterEach(cleanup);

it('should render HtmlParser withour crash', () => {
  const div = document.createElement("div");
  ReactDOM.render(<HtmlParser />, div)
})

it('should match snapshot', () => {
  const { asFragment }= render(<HtmlParser />);
  expect(asFragment()).toMatchSnapshot();
})

it('should show error if input is not valid HTML string', () => {
  render(<HtmlParser />)
  const textArea = screen.getByTestId('input')
  expect(textArea).toBeInTheDocument()

  // fireEvent.change(textArea, {target: { value: 'apple' }})
  userEvent.type(textArea, 'apple')

  fireEvent.click(screen.getByRole('button'))

  const err = screen.getByTestId('errTxt')
  // expect(textArea.innerHTML).toMatch('apple')
  expect(err.innerHTML).toMatch('Please provide valid HTML')
})

it('should show error if input is empty', () => {
  render(<HtmlParser />)
  fireEvent.click(screen.getByRole('button'))
  const err = screen.getByTestId('errTxt')
  expect(err.innerHTML).toMatch('Please provide valid HTML')
})

it('should show name and content values parsed from HTML if valid HTML is provided', () => {
  render(<HtmlParser />)
  userEvent.type(screen.getByTestId('input'), `<meta property="a11y:certifiedBy">Dewey, Checkett and Howe</meta>`)
  fireEvent.click(screen.getByRole('button'))
  const name = screen.getByTestId('meta_name')
  expect(name.innerHTML).toMatch('certifiedBy')
})


