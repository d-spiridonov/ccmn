import { createReducer, createAction } from 'redux-act'
import axios from 'axios'

export const saveOnlineUsers = createAction('save online users')
export const saveAesUId = createAction('save aesUId')
export const saveTotalVisitorsToday = createAction('save total visitors today')

const url_cmx = 'https://cisco-cmx.unit.ua'
const username_cmx = 'RO'
const password_cmx = 'just4reading'
const url_presence = 'https://cisco-presence.unit.ua'
const username_presence = 'RO'
const password_presence = 'Passw0rd'
const aesUId = ''

const apiClientCMX = axios.create()
apiClientCMX.defaults.baseURL = url_cmx
apiClientCMX.defaults.headers.common['Authorization'] = `Basic ${btoa(`${username_cmx}:${password_cmx}`)}` // eslint-disable-line dot-notation
apiClientCMX.defaults.json = true


// const apiClientPresence = axios.create()
// apiClientPresence.defaults.baseURL = 'https://cisco-presence.unit.ua'
// apiClientPresence.defaults.headers.common['Authorization'] = `Basic ${btoa(`${username_presence}:${password_presence}`)}` // eslint-disable-line dot-notation
// apiClientCMX.defaults.json = true

export const ciscoInitialState = {
  onlineUsers: 0,
  aesUId: null,
  visitorsToday: 0,
}

export const getNumberOfOnlineUsers = () => dispatch => apiClientCMX('/api/location/v2/clients/count/')
  .then(res => {
    if (res.data.count) dispatch(saveOnlineUsers(res.data.count))
  }).catch((err) => { console.warn(err) })

// this function should be invoked in header
export const getAesUId = () => dispatch => new Promise((resolve, reject) => {
  apiClientPresence('/api/config/v1/sites')
    .then(res => {
      if (res.data.aesUId) dispatch(saveAesUId(res.data.aesUId))
      resolve(res)
    }).catch((err) => {
      console.warn(err)
      reject(err)
    })
})

const requestCountOfVisitorsToday = () => (dispatch, getState) => apiClientPresence('/api/presence/v1/connected/count/today', {
  params: {
    siteId: getState().aesUId
  }
})
  .then(res => {
    if (res.data) dispatch(saveTotalVisitorsToday(res.data))
  }).catch((err) => { console.warn(err) })

export const getCountOfVisitorsToday = () => (dispatch, getState) => {
  if (!getState.aesUId) {
    getAesUId().then(() => {
      requestCountOfVisitorsToday()
    })
  } else {
    requestCountOfVisitorsToday()
  }
}

export default createReducer(
  {
    [saveOnlineUsers]: (state, onlineUsers) => ({
      ...state,
      onlineUsers,
    }),
    [saveAesUId]: (state, aesUId) => ({
      ...state,
      aesUId,
    }),
    [saveTotalVisitorsToday]: (state, visitorsToday) => ({
      ...state,
      visitorsToday
    })
  },
  ciscoInitialState
)
