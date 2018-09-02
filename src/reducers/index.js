import { combineReducers } from 'redux'
import auth, { authInitialState } from './auth'
import cisco, { ciscoInitialState } from './cisco'

const appReducer = combineReducers({ auth, cisco })

const initialState = appReducer({
  auth: authInitialState,
  cisco: ciscoInitialState,
})

const rootReducer = (state, action) => {
  switch (action.type) {
    case 'RESET':
      // clear state and log out
      return appReducer({ ...state, ...initialState }, action)
  }
  return appReducer(state, action)
}

export default rootReducer
