import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import App from '../App';
import mockSearchVideo from '../__mocks__/mockSearchVideo';
import * as api from '../api/service'

jest.mock('react-router-dom', () => {
  const moduloOriginal = jest.requireActual('react-router-dom');
  return {
    ...moduloOriginal,
    BrowserRouter: ({ children }) => (<div>{children}</div>),
  };
})

jest.mock('../api/service');
api.searchVideos.mockImplementation(
  () => Promise.resolve(mockSearchVideo)
);

function renderWithRouter(ui, routeConfigs = {}) {
  const route = routeConfigs.route || '/';
  const history = routeConfigs.history || createMemoryHistory({ initialEntries: [route] });
  return {
    ...render(<Router history={history}>{ui}</Router>),
    history,
  };
}

describe('Header', () => {
  it('Show All Links', () => {
    const { container } = renderWithRouter(<App />)
    const links = container.querySelectorAll('a')
    expect(links.length).toBe(1)
    expect(links[0].href).toMatch('/results')
  })

  it('Search redirects to search page', async () => {
    const { getByRole, getByPlaceholderText, history } = renderWithRouter(<App />);
    expect(history.location.pathname).toBe('/')

    const searchText = 'bugs';
    fireEvent.change(getByPlaceholderText(/search/i), { target: { value: searchText } })
    fireEvent.click(getByRole('link'))

    await waitFor(() => expect(api.searchVideos).toHaveBeenCalled());
    expect(history.location.pathname).toBe(`/results/${searchText}`);

  });
})
