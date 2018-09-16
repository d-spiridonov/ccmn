import { createReducer, createAction, disbatch } from 'redux-act'
import axios from 'axios'

export const saveOnlineUsers = createAction('save online users')
export const saveAesUId = createAction('save aesUId')
export const saveTotalVisitorsToday = createAction('save total visitors today')
export const saveFloorImages = createAction('save floor image')
export const saveActiveClients = createAction('save active clients')
export const saveActiveMacAddresses = createAction('save active mac addresses')
export const saveSelectedMenuItem = createAction('save selected menu item')
export const saveRepeatVisitorsHourlyToday = createAction('save repeat hourly visitors today')
export const saveDwell = createAction('save dwell')
export const savePasserby = createAction('save passerby')
export const saveConnected = createAction('save connected')
export const saveVisitors = createAction('save visitors')

export const saveKpiSummarToday = createAction('save kpi summary today')
export const saveDashBoardType = createAction('save dash board type')

const url_cmx = 'https://cisco-cmx.unit.ua'
const username_cmx = 'RO'
const password_cmx = 'just4reading'
const url_presence = 'https://cisco-presence.unit.ua'
const username_presence = 'RO'
const password_presence = 'Passw0rd'
const aesUId = ''

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

// different instances of apiClients
const apiClientCMX = axios.create({
  baseURL: url_cmx,
  headers: { Authorization: `Basic ${btoa(`${username_cmx}:${password_cmx}`)}` },
  json: true,
  rejectUnauthorized: false,
  ignoreHTTPErrors: true,
})

const apiClientPresence = axios.create({
  baseURL: url_presence,
  headers: { Authorization: `Basic ${btoa(`${username_presence}:${password_presence}`)}` },
  json: true,
  rejectUnauthorized: false,
  ignoreHTTPErrors: true,
})

export const ciscoInitialState = {
  selectedMenuItem: 'dashboard',
  onlineUsers: 0,
  aesUId: null,
  visitorsToday: 0,
  floorImages: null,
  activeClients: [],
  activeMacAddresses: [],
  repeatVisitorsHourlyToday: null,
  dwell: null,
  passerby: null,
  visitors: null,
  repeatVisitorsHourlyTodayTmp: null,
  kpiSummarToday: null,
  dashboardCurrent: 'today',
  dashboardListInput: ['today', 'yesterday', '3days'],
  dashBoardType: 'today'
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
        imageSrcs.push({
          src: `data:;base64,${base64}`,
          floor: (floor || {}).floorNumber,
          width: ((floor || {}).dimension || {}).width,
          // yes, we take length as a height, stupid CISCO API
          height: ((floor || {}).dimension || {}).length,
        })
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

export const getRepeatVisitorsHourlyToday = (startDate, endDate) => (dispatch, getState) => {
  const aesUId = getState().cisco.aesUId
  let endPoint = `/api/presence/v1/repeatvisitors/hourly/${startDate}`
  let params = { params: { siteId: aesUId } }
  if (endDate) {
    endPoint = '/api/presence/v1/repeatvisitors/daily'
    params = { params: { siteId: aesUId, startDate, endDate } }
  }
  dispatch(saveDashBoardType(startDate))
  apiClientPresence.get(endPoint, params)
    .then(response => {
      dispatch(saveRepeatVisitorsHourlyToday(response.data))
    })
    .catch(error => {
    })
}

export const getDwell = (startDate, endDate) => (dispatch, getState) => {
  const aesUId = getState().cisco.aesUId
  let endPoint = `/api/presence/v1/dwell/hourly/${startDate}`
  let params = { params: { siteId: aesUId } }
  if (endDate) {
    endPoint = '/api/presence/v1/dwell/daily'
    params = { params: { siteId: aesUId, startDate, endDate } }
  }
  dispatch(saveDashBoardType(startDate))
  apiClientPresence.get(endPoint, params)
    .then(response => {
      dispatch(saveDwell(response.data))
    })
    .catch(error => {
    })
}

export const getPsserby = (startDate, endDate) => (dispatch, getState) => {
  const aesUId = getState().cisco.aesUId
  let endPoint = `/api/presence/v1/passerby/hourly/${startDate}`
  let params = { params: { siteId: aesUId } }
  if (endDate) {
    endPoint = '/api/presence/v1/passerby/daily'
    params = { params: { siteId: aesUId, startDate, endDate } }
  }
  dispatch(saveDashBoardType(startDate))
  apiClientPresence.get(endPoint, params)
    .then(response => {
      dispatch(savePasserby(response.data))
    })
    .catch(error => {
    })
}

export const getConnected = (startDate, endDate) => (dispatch, getState) => {
  const aesUId = getState().cisco.aesUId
  let endPoint = `/api/presence/v1/connected/hourly/${startDate}`
  let params = { params: { siteId: aesUId } }
  if (endDate) {
    endPoint = '/api/presence/v1/connected/daily'
    params = { params: { siteId: aesUId, startDate, endDate } }
  }
  dispatch(saveDashBoardType(startDate))
  apiClientPresence.get(endPoint, params)
    .then(response => {
      dispatch(saveConnected(response.data))
    })
    .catch(error => {
    })
}

export const getVisitors = (startDate, endDate) => (dispatch, getState) => {
  const aesUId = getState().cisco.aesUId
  let endPoint = `/api/presence/v1/visitor/hourly/${startDate}`
  let params = { params: { siteId: aesUId } }
  if (endDate) {
    endPoint = '/api/presence/v1/visitor/daily'
    params = { params: { siteId: aesUId, startDate, endDate } }
  }
  dispatch(saveDashBoardType(startDate))
  apiClientPresence.get(endPoint, params)
    .then(response => {
      dispatch(saveVisitors(response.data))
    })
    .catch(error => {
    })
}

export const getKpiSummarToday = () => (dispatch, getState) => {
  const aesUId = getState().cisco.aesUId

  apiClientPresence.get('/api/presence/v1/kpisummary/today', {
    params: {
      siteId: aesUId,
    }
  })
    .then(response => {
      dispatch(saveKpiSummarToday(response.data))
    })
    .catch(error => {
    })
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
    }),
    [saveSelectedMenuItem]: (state, selectedMenuItem) => ({
      ...state,
      selectedMenuItem,
    }),
    [saveRepeatVisitorsHourlyToday]: (state, repeatVisitorsHourlyToday) => ({
      ...state,
      repeatVisitorsHourlyToday,
    }),
    [saveDwell]: (state, dwell) => ({
      ...state,
      dwell,
    }),
    [savePasserby]: (state, passerby) => ({
      ...state,
      passerby,
    }),
    [saveConnected]: (state, connected) => ({
      ...state,
      connected,
    }),
    [saveVisitors]: (state, visitors) => ({
      ...state,
      visitors,
    }),
    [saveKpiSummarToday]: (state, kpiSummarToday) => ({
      ...state,
      kpiSummarToday,
    }),
    [saveDashBoardType]: (state, dashBoardType) => ({
      ...state,
      dashBoardType,
    })
  },
  ciscoInitialState
)
