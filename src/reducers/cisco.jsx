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
export const saveNewActiveDevices = createAction('save new active devices')

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
  newActiveDevices: [],
  dwell: null,
  passerby: null,
  visitors: null,
  repeatVisitorsHourlyTodayTmp: null,
  kpiSummarToday: null,
  dashboardCurrent: 'today',
  dashboardListInput: ['today', 'yesterday', '3days'],
  dashBoardType: 'today'
}

export const getNumberOfOnlineUsers = () => dispatch => new Promise((resolve, reject) => {
  apiClientCMX('/api/location/v2/clients/count/')
    .then(res => {
      if (res.data.count) dispatch(saveOnlineUsers(res.data.count))
      resolve(res)
    }).catch((err) => { reject(err) })
})

// this function should be invoked in header
export const getAesUId = () => dispatch => new Promise((resolve, reject) => {
  apiClientPresence.get('/api/config/v1/sites')
    .then(res => {
      if (res.data[0]) dispatch(saveAesUId(res.data[0].aesUId))
      resolve()
    })
    .catch((err) => {
      reject(err)
    })
})

const requestCountOfVisitorsToday = () => (dispatch, getState) => new Promise((resolve, reject) => {
  const aesUId = getState().cisco.aesUId
  apiClientPresence('/api/presence/v1/connected/count/today', {
    params: {
      siteId: aesUId
    }
  })
    .then(res => {
      if (res.data) dispatch(saveTotalVisitorsToday(res.data))
      resolve()
    }).catch((err) => {
      reject(err)
    })
})

export const getCountOfVisitorsToday = () => (dispatch, getState) => new Promise((resolve, reject) => {
  if (!getState.ciscoaesUId) {
    dispatch(getAesUId()).then(() => {
      dispatch(requestCountOfVisitorsToday()).catch(err => {
        reject(err)
      })
    })
  } else {
    dispatch(requestCountOfVisitorsToday())
      .resolve(() => {
        resolve()
      })
      .catch(err => {
        reject(err)
      })
  }
})

export const getSelectedMac = macAddressToFind => (dispatch, getState) => {
  const macAddressesList = getState().cisco.activeClients
  const result = macAddressesList.find(macAddress => macAddress.macAddress == macAddressToFind)
  return result || null
}

// pass an object and an path array to look for the particular key
const getNestedObject = (nestedObj, pathArr) => pathArr.reduce((obj, key) => (obj && obj[key] !== 'undefined') ? obj[key] : undefined, nestedObj)

const requestMaps = floorList => dispatch => new Promise((resolve, reject) => {
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
          hierarchyName: (floor || {}).hierarchyName,
          width: ((floor || {}).dimension || {}).width,
          // yes, we take length as a height, stupid CISCO API
          height: ((floor || {}).dimension || {}).length,
        })
      })
      .resolve(() => {
        resolve()
      })
      .catch(err => {
        reject(err)
      })
  })
  dispatch(saveFloorImages(imageSrcs))
})

export const getAllMaps = () => dispatch => new Promise((resolve, reject) => {
  apiClientCMX.get(
    '/api/config/v1/maps',
  )
    .then(response => {
      const floorList = getNestedObject(response.data, ['campuses', 2, 'buildingList', 0, 'floorList'])
      const filteredFloorList = floorList.filter(floor => floor.image && floor.image.imageName)
      dispatch(requestMaps(filteredFloorList))
        .catch(err => {
          reject(err)
        })
    })
    .resolve(() => {
      resolve()
    })
    .catch(err => {
      reject(err)
    })
})

// filter out new devices
const getNewDevices = newActiveDevices => (dispatch, getState) => {
  const oldActiveDevices = getState().cisco.activeMacAddresses.map(macAddress => macAddress.macAddress)
  const newDevices = newActiveDevices.filter(newDevice => !oldActiveDevices.includes(newDevice.macAddress))
  dispatch(saveNewActiveDevices(newDevices))
}

export const getAllClients = () => dispatch => new Promise((resolve, reject) => {
  apiClientCMX.get('/api/location/v2/clients/')
    .then(response => {
      dispatch(saveActiveClients(response.data))
      const activeMacAddresses = response.data
      dispatch(getNewDevices(activeMacAddresses))
      dispatch(saveActiveMacAddresses(activeMacAddresses))
      resolve()
    })
    .catch(err => {
      reject(err)
    })
})


export const getRepeatVisitorsHourlyToday = (startDate, endDate) => (dispatch, getState) => new Promise((resolve, reject) => {
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
      resolve()
    })
    .catch(error => {
      reject(error)
    })
})


export const getDwell = (startDate, endDate) => (dispatch, getState) => new Promise((resolve, reject) => {
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
      resolve()
    })
    .catch(error => {
      reject(error)
    })
})

export const getPsserby = (startDate, endDate) => (dispatch, getState) => new Promise((resolve, reject) => {
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
      resolve()
    })
    .catch(error => {
      reject(error)
    })
})

export const getConnected = (startDate, endDate) => (dispatch, getState) => new Promise((resolve, reject) => {
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
      resolve()
    })
    .catch(error => {
      reject(error)
    })
})

export const getVisitors = (startDate, endDate) => (dispatch, getState) => new Promise((resolve, reject) => {
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
      resolve()
    })
    .catch(error => {
      reject(error)
    })
})

export const getKpiSummarToday = () => (dispatch, getState) => new Promise((resolve, reject) => {
  const aesUId = getState().cisco.aesUId

  apiClientPresence.get('/api/presence/v1/kpisummary/today', {
    params: {
      siteId: aesUId,
    }
  })
    .then(response => {
      dispatch(saveKpiSummarToday(response.data))
      resolve()
    })
    .catch(error => {
      reject(err)
    })
})

const isMacFloorSelected = (floor, deviceFloor) => {
  if ((deviceFloor.includes('1st_floor') && floor == 1) || (deviceFloor.includes('2nd_floor')
&& floor == 2) || (deviceFloor.includes('3rd_floor') && floor == 3)) return true
  return false
}

export const getConnectedDevicesFromCurrentFloor = ({ floor, numberOfConnected, getAll }) => (dispatch, getState) => {
  const activeClients = getState().cisco.activeClients
  // slice the array up to number of elements in the array and then filter them according to the floor chosen
  let returned = 0
  const devicesOnCurrentFloor = activeClients.filter(client => {
    if ((returned < numberOfConnected || getAll) && isMacFloorSelected(floor, client.mapInfo.mapHierarchyString)) {
      returned++
      return client
    }
    return false
  })
  return devicesOnCurrentFloor
}

// I'll not store this data in redux as it's used only by the maps component
export const getClientsHistory = ({
  fromDate, toDate, floor
}) => dispatch => new Promise((resolve, reject) => {
  let devices = []
  apiClientCMX.get(`/api/location/v1/history/clients?locatedAfterTime=${fromDate}&locatedBeforeTime=${toDate}`).then(res => {
    devices = res.data
    const devicesFilteredByFloor = devices.filter(device => isMacFloorSelected(floor, device.mapInfo.mapHierarchyString.toLowerCase()))
    resolve(devicesFilteredByFloor)
  })
    .catch(err => {
      reject(err)
    })
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
    }),
    [saveNewActiveDevices]: (state, newActiveDevices) => ({
      ...state,
      newActiveDevices,
    })
  },
  ciscoInitialState
)
