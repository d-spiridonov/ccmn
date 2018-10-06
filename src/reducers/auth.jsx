import { createReducer, createAction } from 'redux-act'
import axios from 'axios'
import { resetStore } from './reset'

const _getEmailAddressLocalStorageKey = 'CCMN_last_email_address'
export const setLoadedUser = createAction('save user info')
export const setLoggedIn = createAction('set if user is logged in')
export const setEmailAddress = createAction('set current user email address')
export const saveToken = createAction('store access and refresh token')
export const saveUserMacAddress = createAction('save my mac address')

export const authInitialState = {
  isLoggedIn: false,
  userDevice: null,
}


export const logout = () => dispatch => {
  dispatch(setLoggedIn(false))
  dispatch(resetStore())
}

export default createReducer(
  {
    /**
     * @event setLoggedIn - change logged-in state
     * @property {boolean} isLoggedIn
     */
    [setLoggedIn]: (state, isLoggedIn) => ({
      ...state,
      isLoggedIn,
      isAuthenticating: false,
    }),

    /**
     * @event saveUserMacAddress - saves user's entered MAC address upon successful login
     */
    [saveUserMacAddress]: (state, userDevice) => ({
      ...state,
      userDevice,
    }),
  },
  authInitialState
)
