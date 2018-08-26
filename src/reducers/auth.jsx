import { createReducer, createAction } from 'redux-act'
import axios from 'axios'
import { resetStore } from './reset'

const _getEmailAddressLocalStorageKey = 'CCMN_last_email_address'
export const setLoadedUser = createAction('save user info')
export const setLoggedIn = createAction('set if user is logged in')
export const setEmailAddress = createAction('set current user email address')
export const saveToken = createAction('store access and refresh token')
export const clearToken = createAction('remove all authentication information')

export const authInitialState = {
  isLoggedIn: false,
  username: '',
  me: {},
  token: {},
}

export const signup = params => dispatch => axios
  .post('/auth/register/', {
    first_name: params.firstName,
    last_name: params.lastName,
    username: params.username,
    password: params.password,
    email: params.email,
    profile: {
      text: params.website,
    },
  })
  .then(res => {
    if (res.data.success !== true && res.data.message) {
      throw new Error(res)
    }
    const user = dispatch(handleSuccessfulLogin(res.data, params.email))
    if (!user) {
      console.error('Got invalid signup response', res.data)
      throw new Error(res)
    }
    return user
  })

export const performLogin = params => axios.post('/auth/login', params).then(res => console.log(res))

export const handleSuccessfulLogin = (userRes, email) => dispatch => {
  if (!userRes.user || !userRes.token) {
    console.error(
      'got invalid user response passed to handleSuccessfulLogin',
      userRes
    )
    return
  }
  // response shape
  const { user, token } = userRes
  dispatch(setEmailAddress(email)) // save it
  dispatch(saveToken(token)) // save it
  dispatch(loadedUser(user))
  return user
}

/**
 * Logout
 */

export const logout = () => dispatch => {
  dispatch(setLoggedIn(false))
  dispatch(clearToken())
  dispatch(resetStore())
}

/**
 * Private method, call when we've received a user response from the API.
 * This fetches additional info that we should load whenever logging in etc.
 * @param {Object} user - user response
 */
function loadedUser(user) {
  return dispatch => {
    // FIXME: convert to single event
    dispatch(setLoadedUser(user))
    dispatch(setLoggedIn(true))
  }
}

export function _getAuthStorageKey(emailAddress) {
  // get key for local storage containing tokens for current account
  const slug = _slugify(emailAddress)
  if (!slug) return 'UNKNOWN'
  return `CCMN_${slug}_${process.env.ENV_NAME}`
}

function _getEmailAddress() {
  const emailAddress = window.localStorage.getItem(
    _getEmailAddressLocalStorageKey()
  )
  return emailAddress
}

function _slugify(string) {
  if (string === undefined) return undefined
  // remove special characters from string
  // https://gist.github.com/mathewbyrne/1280286
  return string
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // remove non-word [a-z0-9_], non-whitespace, non-hyphen characters
    .replace(/[\s_-]+/g, '-') // swap any length of whitespace, underscore, hyphen characters with a single -
    .replace(/^-+|-+$/g, '') // remove leading, trailing -
}

/**
 * @event setEmailAddress - save last-used email address to localstorage
 * @property {string} emailAddress
 */
export default createReducer(
  {
    [setEmailAddress]: (state, emailAddress) => {
      if (!emailAddress) console.warn('saving empty email address')
      // save it
      window.localStorage.setItem(_getEmailAddressLocalStorageKey, emailAddress)
      return { ...state, emailAddress }
    },

    /**
     * @event setLoadedUser - got user info from server
     * @property {object} me - user info response
     */
    [setLoadedUser]: (state, me) => ({
      ...state,
      me,
      username: me.username,
      id: me.id,
      firstLoadComplete: true,
    }),
    /**
     * @event saveToken - store JWT auth tokens to localStorage
     * @property {{ access_token: string, access_token_expiration: string, refresh_token: string}} token
     */

    [saveToken]: (state, token) => {
      if (!state.emailAddress) {
        console.error(
          'attempting to save token without email address - rejected'
        )
        return state
      }

      // save it for later
      window.localStorage.setItem(
        _getAuthStorageKey(state.emailAddress),
        JSON.stringify(token)
      )

      // let other components (i.e. angular-land) know that a new token was saved to storage
      // this.mb.postMessage(MB_AUTH_TOKEN_UPDATED)

      return { ...state, token }
    },

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
     * @event clearToken - wipe tokens, and all data in store
     */
    [clearToken]: state => {
      if (!state.emailAddress) {
        console.error(
          'attempting to clear token without email address - rejected'
        )
        return state
      }
      window.localStorage.setItem(_getAuthStorageKey(state.emailAddress), null)
      return {
        ...state,
        access_token: null,
        access_token_expiration: null,
        refresh_token: null,
        me: {},
        isLoggedIn: false,
      }
    },
  },
  authInitialState
)
