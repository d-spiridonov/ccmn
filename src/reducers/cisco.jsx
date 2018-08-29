import { createReducer, createAction } from 'redux-act'
import axios from 'axios'

export const saveOnlineUsers = createAction('save online users')
export const saveAesUId = createAction('save aesUId')
export const saveTotalVisitorsToday = createAction('save total visitors today')
export const saveFloorImages = createAction('save floor image')
export const saveActiveClients = createAction('save active clients')
export const saveActiveMacAddresses = createAction('save active mac addresses')

const url_cmx = 'https://cisco-cmx.unit.ua'
const username_cmx = 'RO'
const password_cmx = 'just4reading'
const url_presence = 'https://cisco-presence.unit.ua'
const username_presence = 'RO'
const password_presence = 'Passw0rd'
const aesUId = ''

// different instances of apiClients
const apiClientCMX = axios.create({
  baseURL: url_cmx,
  headers: { Authorization: `Basic ${btoa(`${username_cmx}:${password_cmx}`)}` },
  json: true
})

const apiClientPresence = axios.create({
  baseURL: url_presence,
  headers: { Authorization: `Basic ${btoa(`${username_presence}:${password_presence}`)}` },
  json: true
})

export const ciscoInitialState = {
  onlineUsers: 0,
  aesUId: null,
  visitorsToday: 0,
  floorImage: null,
  activeClients: [],
  activeMacAddresses: [],
}

export const getNumberOfOnlineUsers = () => dispatch => apiClientCMX('/api/location/v2/clients/count/')
  .then(res => {
    if (res.data.count) dispatch(saveOnlineUsers(res.data.count))
  }).catch((err) => { console.warn(err) })

// this function should be invoked in header
export const getAesUId = () => dispatch => new Promise((resolve, reject) => {
  apiClientPresence.get('/api/config/v1/sites')
    .then(res => {
      if (res.data[0]) dispatch(saveAesUId(res.data[0].aesUId))
      resolve()
    }).catch((err) => {
      console.warn(err)
      reject(err)
    })
})

const requestCountOfVisitorsToday = () => (dispatch, getState) => {
  const aesUId = getState().cisco.aesUId
  apiClientPresence('/api/presence/v1/connected/count/today', {
    params: {
      siteId: aesUId
    }
  })
    .then(res => {
      if (res.data) dispatch(saveTotalVisitorsToday(res.data))
    }).catch((err) => { console.warn(err) })
}

export const getCountOfVisitorsToday = () => (dispatch, getState) => {
  if (!getState.ciscoaesUId) {
    dispatch(getAesUId()).then(() => {
      dispatch(requestCountOfVisitorsToday())
    })
  } else {
    dispatch(requestCountOfVisitorsToday())
  }
}

export const getSelectedMac = macAddressToFind => (dispatch, getState) => {
  const macAddressesList = getState().cisco.activeClients
  const result = macAddressesList.find(macAddress => macAddress.macAddress == macAddressToFind)
  return result || null
}

// pass an object and an path array to look for the particular key
const getNestedObject = (nestedObj, pathArr) => pathArr.reduce((obj, key) => (obj && obj[key] !== 'undefined') ? obj[key] : undefined, nestedObj)

const requestMaps = floorList => dispatch => {
  let imageSrcs = []
  floorList.forEach(floor => {
    apiClientCMX.get(`/api/config/v1/maps/imagesource/${floor.image.imageName}`,
      { responseType: 'arraybuffer' })
      .then(response => {
        const base64 = btoa(
          new Uint8Array(response.data).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            '',
          ),
        )
        imageSrcs.push({ src: `data:;base64,${base64}`, floor: floor.floorNumber })
      })
  })
  dispatch(saveFloorImages(imageSrcs))
}

export const getAllMaps = () => dispatch => apiClientCMX.get(
  '/api/config/v1/maps',
)
  .then(response => {
    const floorList = getNestedObject(response.data, ['campuses', 2, 'buildingList', 0, 'floorList'])
    const filteredFloorList = floorList.filter(floor => floor.image && floor.image.imageName)
    dispatch(requestMaps(filteredFloorList))
  })

export const getAllClients = () => dispatch => apiClientCMX.get('/api/location/v2/clients/')
  .then(response => {
    dispatch(saveActiveClients(response.data))
    const activeMacAddresses = response.data.map(macAddress => macAddress.macAddress)
    dispatch(saveActiveMacAddresses(activeMacAddresses))
  })

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
    }),
    [saveFloorImages]: (state, floorImages) => ({
      ...state,
      floorImages
    }),
    [saveActiveClients]: (state, activeClients) => ({
      ...state,
      activeClients
    }),
    [saveActiveMacAddresses]: (state, activeMacAddresses) => ({
      ...state,
      activeMacAddresses,
    })
  },
  ciscoInitialState
)
