import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import { Switch } from 'react-router'
import { store, history } from './store'
import App from './containers/app'

import './index.css'

const target = document.querySelector('#index')

render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <div style={{ height: '100%' }}>
        <App />
      </div>
    </ConnectedRouter>
  </Provider>,
  target
)
