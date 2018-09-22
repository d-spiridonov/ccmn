import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  Button, Radio, Input, AutoComplete, Spin, Card, Slider, Switch, Checkbox, Popover, Icon, Tooltip, DatePicker, notification
} from 'antd'
import moment from 'moment'
import {
  getAllMaps, getAllClients, getSelectedMac, getConnectedDevicesFromCurrentFloor, getClientsHistory
} from '../../reducers/cisco'
import './map.css'
import HeatMapControls from './heatMapControls'

const Search = Input.Search

// refresh interval for doing a request to get all clients/interval to update active clients on the floor
const refreshInterval = 10000

class FloorMap extends Component {
  static propTypes = {
    getAllMaps: PropTypes.func.isRequired,
    floorMaps: PropTypes.array,
    activeMacAddresses: PropTypes.array.isRequired,
    getAllClients: PropTypes.func.isRequired,
    getSelectedMac: PropTypes.func.isRequired,
    getConnectedDevicesFromCurrentFloor: PropTypes.func.isRequired,
    getClientsHistory: PropTypes.func.isRequired,
  }

  state = {
    selectedMac: null,
    macAddress: null,
    posX: 0,
    posY: 0,
    showMacCoordinates: false,
    currentFloor: null,
    currentFloorNumber: 1,
    connectedDevicesToShow: 5,
    connectedDevicesFromCurrentFloor: null,
    showConnectedDevicesFromCurrentFloor: false,
    currentTime: moment(),
    showHeatMap: false,
    loadingClientHistory: false,
    heatMap: null,
    heatMapFromDate: moment().startOf('day'),
    heatMapToDate: moment().endOf('day'),
    newActiveDevices: [],
    floorMaps: [],
    showDeviceNotifications: true,
  }

  requestNewClients = () => {
    this.props.getAllClients()
  }

  componentDidMount() {
    if (!this.state.currentFloor) this.props.getAllMaps()
    this.requestNewClients()
    this.requestNewClientsInterval = setInterval(this.requestNewClients, refreshInterval)
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.showDeviceNotifications && this.state.newActiveDevices.length && this.state.newActiveDevices !== prevState.newActiveDevices) {
      this.newDeviceNotification(this.state.newActiveDevices)
    }
  }

  getFloorName = floor => {
    switch (floor) {
      case 1:
        return '1st'
      case 2:
        return '2nd'
      case 3:
        return '3rd'
    }
  }

  newDeviceNotification = newActiveDevices => {
    newActiveDevices.forEach(device => {
      const manufacturer = device.manufacturer ? device.manufacturer : 'unknown'
      const floor = this.getFloorName(this.getMacFloor(device))
      const btn = (
        <Button type="primary" size="small" onClick={() => this.handleMacSelect(device.macAddress)}>
          Show device
        </Button>
      )
      notification.open({
        message: 'New Device Connected',
        description: `Device: ${device.macAddress}, Manufacturer: ${manufacturer}, has coonnected on the ${floor} floor`,
        icon: manufacturer == 'Apple' ? <Icon type="apple" theme="outlined" /> : <Icon type="wifi" theme="outlined" />,
        btn,
      })
    })
  };

  // load the 1st floor image when the image are loaded for the first time
  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.floorMaps.length && nextProps.floorMaps !== prevState.floorMaps) {
      let currentFloor
      if (!prevState.currentFloor) {
        currentFloor = nextProps.floorMaps.find(floorMap => floorMap.floor == prevState.currentFloorNumber)
        return { floorMaps: nextProps.floorMaps, currentFloor }
      }
    }
    else if (nextProps.newActiveDevices != prevState.newActiveDevices) {
      return { newActiveDevices: nextProps.newActiveDevices }
    }
  }

  componentWillUnmount() {
    clearInterval(this.requestNewClientsInterval)
  }

  handleFloorChange = e => {
    let connectedDevicesFromCurrentFloor
    if (this.state.showConnectedDevicesFromCurrentFloor) {
      connectedDevicesFromCurrentFloor = this.props.getConnectedDevicesFromCurrentFloor({ floor: this.state.currentFloorNumber, numberOfConnected: this.state.connectedDevicesToShow, getAll: false })
    }
    this.setState({
      connectedDevicesFromCurrentFloor,
      currentFloorNumber: e.target.value,
      currentFloor: this.getFloorByFloorNumber(e.target.value),
      heatMap: null,
      showHeatMap: false,
    })
  }

  getMacFloor = mac => {
    const floorString = mac.mapInfo.mapHierarchyString
    if (floorString.includes('1st_floor')) return 1
    if (floorString.includes('2nd_floor')) return 2
    return 3
  }

  handleMacSelect = macAddress => {
    const selectedMac = this.props.getSelectedMac(macAddress)
    if (!selectedMac) return
    const floorString = selectedMac.mapInfo.mapHierarchyString
    const currentFloorNumber = this.getMacFloor(selectedMac)
    this.handleFloorChange({ target: { value: currentFloorNumber } })
    this.drawCoordinates(selectedMac.mapCoordinate.x - 5, selectedMac.mapCoordinate.y - 5) // subtracting -5 to point a more precise position
    this.setState({
      selectedMac,
      macAddress,
      showMacCoordinates: true,
    })
  }

  drawCoordinates(x, y) {
    this.setState({
      posX: x,
      posY: y,
    })
  }

  clearMacAddress = () => {
    this.setState({
      macAddress: null,
      showMacCoordinates: false,
      selectedMac: null,
    })
  }

  handleMacChange = event => {
    this.setState({
      macAddress: event
    })
  }

  getCircleStyle = (color, x, y) => {
    switch (color) {
      case 'red':
        return {
          width: 15,
          height: 15,
          borderRadius: 25,
          position: 'absolute',
          background: 'red',
          borderStyle: 'solid',
          borderWidth: 'thin',
          opacity: 0.9,
          left: x,
          top: y,
        }
      case 'green':
        return {
          width: 15,
          height: 15,
          borderRadius: 25,
          opacity: 0.7,
          position: 'absolute',
          background: 'green',
          borderStyle: 'solid',
          borderWidth: 'thin',
          left: x,
          top: y,
        }
      case 'pink':
        return {
          width: 15,
          height: 15,
          borderRadius: 25,
          opacity: 0.2,
          position: 'absolute',
          background: 'pink',
          borderStyle: 'solid',
          borderWidth: 'thin',
          left: x,
          top: y,
        }
    }
  }

  getFloorByFloorNumber = floorNumber => {
    let currentFloor
    if (this.props.floorMaps) {
      currentFloor = this.props.floorMaps.find(floorMap => floorMap.floor == floorNumber)
    }
    return currentFloor || null
  }

  getConnectedDevicesFromCurrentFloor = () => {
    const connectedDevicesFromCurrentFloor = this.props.getConnectedDevicesFromCurrentFloor({ floor: this.state.currentFloorNumber, numberOfConnected: this.state.connectedDevicesToShow, getAll: false })
    this.setState(prevState => ({
      connectedDevicesFromCurrentFloor: connectedDevicesFromCurrentFloor || prevState.connectedDevicesFromCurrentFloor,
    }))
  }

  handleCountConnectedCheckboxClick = () => {
    let connectedDevicesFromCurrentFloor
    if (!this.state.showConnectedDevicesFromCurrentFloor) {
      // set interval for getting new devices every 30 seconds
      this.getConnectedDevicesFromCurrentFloor()
      this.connectedDevicesInterval = setInterval(this.getConnectedDevicesFromCurrentFloor, refreshInterval)
    } else {
      clearInterval(this.connectedDevicesInterval)
    }
    this.setState(prevState => ({
      showConnectedDevicesFromCurrentFloor: !prevState.showConnectedDevicesFromCurrentFloor,
    }))
  }

  handleConnectedDevicesSliderChange = connectedDevicesToShow => {
    let connectedDevicesFromCurrentFloor
    if (this.state.showConnectedDevicesFromCurrentFloor) {
      connectedDevicesFromCurrentFloor = this.props.getConnectedDevicesFromCurrentFloor({ floor: this.state.currentFloorNumber, numberOfConnected: connectedDevicesToShow, getAll: false })
    }
    this.setState(prevState => ({
      connectedDevicesToShow,
      connectedDevicesFromCurrentFloor: connectedDevicesFromCurrentFloor || prevState.connectedDevicesFromCurrentFloor
    }))
  }

  content = macAddress => {
    const selectedMac = this.props.getSelectedMac(macAddress)
    return (
      <MacData selectedMac={selectedMac} currentTime={this.state.currentTime} />
    )
  }

  getMaxNumberOfDevicesOnCurrentFloor = () => {
    let maxNumberOfDevicesOnCurrentFloor
    if (this.state.currentFloorNumber) maxNumberOfDevicesOnCurrentFloor = this.props.getConnectedDevicesFromCurrentFloor({ floor: this.state.currentFloorNumber, numberOfConnected: 0, getAll: true }).length
    return maxNumberOfDevicesOnCurrentFloor || 0
  }

  handleHeatMapCheckboxClick = () => {
    if (!this.state.showHeatMap) {
      const fromDate = this.state.heatMapFromDate.valueOf()
      const toDate = this.state.heatMapToDate.valueOf()
      this.setState({
        loadingClientHistory: true,
        showHeatMap: true,
      })
      this.props.getClientsHistory({ fromDate, toDate, floor: this.state.currentFloorNumber }).then(res => {
        this.setState({
          heatMap: res,
          loadingClientHistory: false,
        })
      })
    } else {
      this.setState({
        showHeatMap: false,
        heatMap: null
      })
    }
  }

  handleStartDateChange = heatMapFromDate => {
    this.setState({
      heatMapFromDate
    })
  }

  handleEndDateChange = heatMapToDate => {
    this.setState({
      heatMapToDate
    })
  }

  handleDeviceNotifications = event => {
    this.setState({
      showDeviceNotifications: event
    })
  }

  render() {
    const {
      currentFloor, selectedMac, macAddress, showMacCoordinates, currentFloorNumber,
      connectedDevicesFromCurrentFloor, showConnectedDevicesFromCurrentFloor, currentTime,
      heatMapFromDate, heatMapToDate, heatMap, showHeatMap, loadingClientHistory, showDeviceNotifications
    } = this.state
    const { activeMacAddresses, floorMaps } = this.props

    const mapHeight = currentFloor ? currentFloor.height : 0
    const mapWidth = currentFloor ? currentFloor.width : 0
    const macAddresses = activeMacAddresses ? activeMacAddresses.map(macAddress => macAddress.macAddress) : []

    return ( // TODO: refactor to smaller components
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <div style={{ width: 250, flexDirection: 'column' }}>
            <Radio.Group style={{ display: 'flex', flexDirection: 'row' }} value={currentFloorNumber} onChange={this.handleFloorChange}>
              <Radio.Button className="radioButton" value={1}>Floor 1</Radio.Button>
              <Radio.Button className="radioButton" value={2}>Floor 2</Radio.Button>
              <Radio.Button className="radioButton" value={3}>Floor 3</Radio.Button>
            </Radio.Group>
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <AutoComplete
                dataSource={macAddresses}
                value={macAddress}
                onChange={this.handleMacChange}
                onSelect={this.handleMacSelect}
                placeholder="Enter mac address to search"
                filterOption
              />
              <Button style={{ width: '100%' }} onClick={this.clearMacAddress}>Clear</Button>
            </div>
          </div>
          <ShowDeviceNotifications showDeviceNotifications={showDeviceNotifications} handleDeviceNotifications={this.handleDeviceNotifications} />
          <CountConnected
            handleCheckboxClick={this.handleCountConnectedCheckboxClick}
            handleSliderChange={this.handleConnectedDevicesSliderChange}
            max={this.getMaxNumberOfDevicesOnCurrentFloor()}
            showDeviceNotifications={showDeviceNotifications}
            handleDeviceNotifications={this.handleDeviceNotifications}
          />
          <HeatMapControls
            checked={showHeatMap}
            handleCheckboxClick={this.handleHeatMapCheckboxClick}
            handleStartDateChange={this.handleStartDateChange}
            handleEndDateChange={this.handleEndDateChange}
            startDate={heatMapFromDate}
            endDate={heatMapToDate}
            isLoading={loadingClientHistory}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginRight: 50 }}>
            {currentFloor ? (
              <div
                style={{
                  position: 'absolute', zIndex: 99, width: mapWidth, height: mapHeight
                }}
                id="canvas"
              >
                {showMacCoordinates
                  && (
                  <Popover id={selectedMac.macAddress} content={this.content(selectedMac.macAddress)} title="Device" trigger="hover">
                    <div style={this.getCircleStyle('red', this.state.posX, this.state.posY)} />
                  </Popover>
                  )}
                {showConnectedDevicesFromCurrentFloor && connectedDevicesFromCurrentFloor
                && connectedDevicesFromCurrentFloor.map(device => (
                  <Popover id={device.macAddress} content={this.content(device.macAddress)} title="Device" trigger="hover">
                    <div key={device.macAddress} id={device.macAddress} style={this.getCircleStyle('green', device.mapCoordinate.x, device.mapCoordinate.y)} />
                  </Popover>
                ))}
                {heatMap && heatMap.map((device, index) => (
                  <div key={device.macAddress + device.changedOn} id={device.macAddress} style={this.getCircleStyle('pink', device.mapCoordinate.x, device.mapCoordinate.y)} />
                ))}
              </div>
            ) : <Spin size="large" />}
            <img style={{ height: mapHeight }} src={currentFloor ? currentFloor.src : null} />
          </div>
          <Card title="Client" style={{ width: 300 }}>
            <MacData selectedMac={selectedMac} currentTime={currentTime} />
          </Card>
        </div>
      </div>
    )
  }
}

const ShowDeviceNotifications = ({ showDeviceNotifications, handleDeviceNotifications }) => (
  <div id="deviceNotificationsWrapper">
    <Switch checked={showDeviceNotifications} onChange={handleDeviceNotifications} />
    <div>Show device notifications</div>
  </div>
)

ShowDeviceNotifications.propTypes = {
  showDeviceNotifications: PropTypes.bool.isRequired,
  handleDeviceNotifications: PropTypes.func.isRequired,
}

const CountConnected = ({
  handleCheckboxClick, handleSliderChange, max
}) => (
  <div style={{ width: 250, marginTop: 50 }}>
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
      <Checkbox onClick={handleCheckboxClick} />
      <span>Show Connected Devices</span> <div id="greenCircle" />
    </div>
    <Slider defaultValue={5} max={max} min={1} onChange={handleSliderChange} />
    <div style={{ width: '100%', justifyContent: 'space-between', display: 'flex' }}>
      <span>
    1
      </span>
      <span>
        Devices
      </span>
      <span>
        {max}
      </span>
    </div>
  </div>
)

CountConnected.propTypes = {
  handleCheckboxClick: PropTypes.func.isRequired,
  handleSliderChange: PropTypes.func.isRequired,
  max: PropTypes.number.isRequired,
}

const MacData = ({ selectedMac, currentTime }) => {
  let lastSeen
  if (selectedMac) lastSeen = moment(selectedMac.statistics.lastLocatedTime).from(currentTime)
  return (
    <div>
      <p className="BlueHeader">MAC Address:</p>
      <p>{selectedMac && selectedMac.macAddress}</p>
      <p className="BlueHeader">Status:</p>
      <Tooltip title="Indicates connected to the network as Associated and the APMacAddress is the AP which it is connected. Probing to find a valid AP to connect and the APMacAddress is the AP which has strongest reception. and Unknown for inactive client devices and clients with unknown IP addresses. Note, that CMX aggregates information from the wireless network, and therefore refer to the values defined in the AP or WLC.">
        <p>{selectedMac && <span>{selectedMac.dot11Status} <Icon type="info-circle" theme="outlined" /></span>}</p>
      </Tooltip>
      <p className="BlueHeader">IP Address:</p>
      <p>{selectedMac && selectedMac.ipAddress ? selectedMac.ipAddress[0] : null}</p>
      <p className="BlueHeader">Last seen:</p>
      <p>{selectedMac && lastSeen}</p>
      <p className="BlueHeader">Manufacturer:</p>
      <p>{selectedMac && selectedMac.manufacturer}</p>
      <p className="BlueHeader">Connected AP:</p>
      <p>{selectedMac && selectedMac.statistics.maxDetectedRssi.apMacAddress}</p>
      <p className="BlueHeader">SSID:</p>
      <p>{selectedMac && selectedMac.ssId}</p>
    </div>)
}

MacData.propTypes = {
  selectedMac: PropTypes.object,
  currentTime: PropTypes.object.isRequired,
}


const mapStateToProps = state => ({
  floorMaps: state.cisco.floorImages,
  activeMacAddresses: state.cisco.activeMacAddresses,
  newActiveDevices: state.cisco.newActiveDevices,
})

const mapDispatchToProps = dispatch => ({
  getClientsHistory: ({ fromDate, toDate, floor }) => dispatch(getClientsHistory({ fromDate, toDate, floor })),
  getAllMaps: () => dispatch(getAllMaps()),
  getAllClients: () => dispatch(getAllClients()),
  getConnectedDevicesFromCurrentFloor: ({ floor, numberOfConnected, getAll }) => dispatch(getConnectedDevicesFromCurrentFloor({ floor, numberOfConnected, getAll })),
  getSelectedMac: macAddress => dispatch(getSelectedMac(macAddress))
})

export default connect(mapStateToProps, mapDispatchToProps)(FloorMap)
