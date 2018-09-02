import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  Button, Radio, Input, AutoComplete, Spin, Card, Slider, Switch
} from 'antd'
import { getAllMaps, getAllClients, getSelectedMac } from '../../reducers/cisco'
import './map.css'

const Search = Input.Search

class FloorMap extends Component {
  static propTypes = {
    getAllMaps: PropTypes.func.isRequired,
    floorMaps: PropTypes.array,
    activeMacAddresses: PropTypes.array.isRequired,
    getAllClients: PropTypes.func.isRequired,
    getSelectedMac: PropTypes.func.isRequired,
  }

  state = {
    selectedMac: null,
    macAddress: null,
    posX: 0,
    posY: 0,
    showMacCoordinates: false,
    currentFloor: null,
    currentFloorNumber: 1,
  }

  requestNewClients = () => {
    this.props.getAllClients()
  }

  componentDidMount() {
    if (!this.state.currentFloor) this.props.getAllMaps()
    this.requestNewClients()
    this.requestNewClientsInterval = setInterval(this.requestNewClients, 30000)
  }

  // load the 1st floor image when the image are loaded for the first time
  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.floorMaps) {
      const currentFloor = nextProps.floorMaps.find(floorMap => floorMap.floor == prevState.currentFloorNumber)
      return { currentFloor }
    }
    return null
  }

  componentWillUnmount() {
    clearInterval(this.requestNewClientsInterval)
  }

  handleFloorChange = e => {
    this.setState({
      currentFloorNumber: e.target.value,
      currentFloor: this.getFloorByFloorNumber(e.target.value)
    })
  }

  getMacFloor = mac => {
    const floorString = mac.mapInfo.mapHierarchyString
    if (floorString.includes('1st_floor')) return 1
    if (floorString.includes('2nd_floor')) return 2
    return 3
  }

  hangleMacSelect = macAddress => {
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

  getCircleStyle = () => ({
    width: 15,
    height: 15,
    borderRadius: 25,
    position: 'absolute',
    background: 'red',
    left: this.state.posX,
    top: this.state.posY
  })

  getFloorByFloorNumber = floorNumber => {
    let currentFloor
    if (this.props.floorMaps) {
      currentFloor = this.props.floorMaps.find(floorMap => floorMap.floor == floorNumber)
    }
    return currentFloor || null
  }

  render() {
    const {
      currentFloor, selectedMac, macAddress, showMacCoordinates, currentFloorNumber
    } = this.state
    const { activeMacAddresses, floorMaps } = this.props

    const mapHeight = currentFloor ? currentFloor.height : 0
    const mapWidth = currentFloor ? currentFloor.width : 0

    return (
      <div>
        <div style={{ width: 232, flexDirection: 'column' }}>
          <Radio.Group style={{ display: 'flex', flexDirection: 'row' }} value={currentFloorNumber} onChange={this.handleFloorChange}>
            <Radio.Button value={1}>Floor 1</Radio.Button>
            <Radio.Button value={2}>Floor 2</Radio.Button>
            <Radio.Button value={3}>Floor 3</Radio.Button>
          </Radio.Group>
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <AutoComplete
              dataSource={activeMacAddresses}
              value={macAddress}
              onChange={this.handleMacChange}
              onSelect={this.hangleMacSelect}
              placeholder="Enter mac address to search"
              filterOption
            />
            <Button style={{ width: '100%' }} onClick={this.clearMacAddress}>Clear</Button>
          </div>
          <Slider defaultValue={30} />
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
                {showMacCoordinates && <div style={this.getCircleStyle()} />}
              </div>
            ) : <Spin size="large" />}
            <img style={{ height: mapHeight }} src={currentFloor ? currentFloor.src : null} />
          </div>
          <MacData selectedMac={selectedMac} />
        </div>
      </div>
    )
  }
}

const MacData = ({ selectedMac }) => (
  <Card title="Client" style={{ width: 300 }}>
    <div>
      <p className="BlueHeader">MAC Address:</p>
      <p>{selectedMac && selectedMac.macAddress}</p>
      <p className="BlueHeader">IP Address:</p>
      <p>{selectedMac && selectedMac.ipAddress ? selectedMac.ipAddress[0] : null}</p>
      <p className="BlueHeader">Last seen:</p>
      <p>{selectedMac && selectedMac.statistics.lastLocatedTime}</p>
      <p className="BlueHeader">Manufacturer:</p>
      <p>{selectedMac && selectedMac.manufacturer}</p>
      <p className="BlueHeader">Connected AP:</p>
      <p>{selectedMac && selectedMac.statistics.maxDetectedRssi.apMacAddress}</p>
      <p className="BlueHeader">Connected AP Name:</p>
      <p className="BlueHeader">SSID:</p>
      <p>{selectedMac && selectedMac.ssId}</p>
    </div>
  </Card>)

MacData.propTypes = {
  selectedMac: PropTypes.object,
}


const mapStateToProps = state => ({
  floorMaps: state.cisco.floorImages,
  activeMacAddresses: state.cisco.activeMacAddresses,
})

const mapDispatchToProps = dispatch => ({
  getAllMaps: () => dispatch(getAllMaps()),
  getAllClients: () => dispatch(getAllClients()),
  getSelectedMac: macAddress => dispatch(getSelectedMac(macAddress))
})

export default connect(mapStateToProps, mapDispatchToProps)(FloorMap)
