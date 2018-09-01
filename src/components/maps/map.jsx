import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  Button, Radio, Input, AutoComplete,
} from 'antd'
import { getAllMaps, getAllClients, getSelectedMac } from '../../reducers/cisco'

const Search = Input.Search

class FloorMap extends Component {
  static propTypes = {
    getAllMaps: PropTypes.func.isRequired,
    floorMaps: PropTypes.array.isRequired,
    activeMacAddresses: PropTypes.array.isRequired,
    getAllClients: PropTypes.func.isRequired,
    getSelectedMac: PropTypes.func.isRequired,
  }

  state = {
    currentFloor: 1,
    selectedMac: null,
    macAddress: null,
    posX: 1765,
    posY: 480.44,
    showMacCoordinates: true,
  }

  requestNewClients = () => {
    this.props.getAllClients()
  }

  componentDidMount() {
    if (!this.props.floorMaps) this.props.getAllMaps()
    this.requestNewClients()
    this.requestNewClientsInterval = setInterval(this.requestNewClients, 30000)
  }

  componentWillUnmount() {
    clearInterval(this.requestNewClientsInterval)
  }

  handleFloorChange = e => {
    this.setState({
      currentFloor: e.target.value
    })
  }

  getMacFloor = mac => {
    const floorString = mac.mapInfo.mapHierarchyString
    if (floorString.includes('1st_floor')) return 1
    if (floorString.includes('2nd_floor')) return 2
    return 0
  }

  hangleMacSelect = macAddress => {
    const selectedMac = this.props.getSelectedMac(macAddress)
    console.log(selectedMac)
    if (!selectedMac) return
    const floorString = selectedMac.mapInfo.mapHierarchyString
    const currentFloor = this.getMacFloor(selectedMac)
    this.drawCoordinates(selectedMac.mapCoordinate.x, selectedMac.mapCoordinate.y)
    this.setState({
      selectedMac,
      currentFloor,
      macAddress,
      showMacCoordinates: true,
    })
  }

  drawCoordinates(x, y) {
    console.log(x, y)
    this.setState({
      posX: x,
      posY: y,
    })
  }

  clearMacAddress = () => {
    this.setState({
      macAddress: null,
      showMacCoordinates: false,
    })
  }

  handleMacChange = event => {
    this.setState({
      macAddress: event
    })
  }

  getCircleCoordinates = () => ({
    width: 25,
    height: 25,
    borderRadius: 25,
    position: 'absolute',
    background: 'red',
    left: this.state.posX,
    top: this.state.posY
  })

  render() {
    const {
      currentFloor, selectedMac, macAddress, showMacCoordinates
    } = this.state

    const { activeMacAddresses, floorMaps } = this.props
    return (
      <div>
        <Radio.Group style={{ display: 'flex', flexDirection: 'row' }} value={currentFloor} onChange={this.handleFloorChange}>
          <Radio.Button value={1}>Floor 1</Radio.Button>
          <Radio.Button value={2}>Floor 2</Radio.Button>
          <Radio.Button value={0}>Floor 3</Radio.Button>
        </Radio.Group>
        <div style={{ display: 'flex', flexDirection: 'column', width: 200 }}>
          <AutoComplete
            dataSource={activeMacAddresses}
            value={macAddress}
            onChange={this.handleMacChange}
            onSelect={this.hangleMacSelect}
            placeholder="Enter mac address to search"
            filterOption
          />
          <Button onClick={this.clearMacAddress}>Clear</Button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {floorMaps && (
          <div
            style={{
              position: 'absolute', zIndex: 99, width: floorMaps[currentFloor].width, height: floorMaps[currentFloor].height
            }}
            id="canvas"
          >
            {showMacCoordinates && <div style={this.getCircleCoordinates()} />}
          </div>
          )}
          <img style={{ height: floorMaps[currentFloor].height }} src={(this.props.floorMaps || {})[currentFloor] ? floorMaps[currentFloor].src : null} />
        </div>
      </div>
    )
  }
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
