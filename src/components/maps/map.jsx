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
    if (!selectedMac) return
    const floorString = selectedMac.mapInfo.mapHierarchyString
    const currentFloor = this.getMacFloor(selectedMac)
    this.drawCoordinates(selectedMac.mapCoordinate.x * 0.8, selectedMac.mapCoordinate.y * 0.8)
    console.log(macAddress)
    this.setState({
      selectedMac,
      currentFloor,
      macAddress,
    })
  }

  clearCanvas = () => {
    var canvas = document.getElementById('canvas')
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  drawCoordinates(x, y) {
    this.clearCanvas()
    var pointSize = 10 // Change according to the size of the point.
    var ctx = document.getElementById('canvas').getContext('2d')


    ctx.fillStyle = '#ff2626' // Red color

    ctx.beginPath() // Start path
    ctx.arc(x, y, pointSize, 0, Math.PI * 2, true) // Draw a point using the arc function of the canvas with a point structure.
    ctx.fill() // Close the path and fill.
  }

  clearMacAddress = () => {
    this.clearCanvas()
    this.setState({
      macAddress: null
    })
  }

  handleMacChange = event => {
    this.setState({
      macAddress: event
    })
  }

  render() {
    const {
      currentFloor, selectedMac, macAddress
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
          {floorMaps && <canvas style={{ position: 'absolute', zIndex: 99 }} id="canvas" width={floorMaps[currentFloor].width * 0.8} height={floorMaps[currentFloor].height * 0.8} />}
          <img style={{ height: 900.8 }} src={(this.props.floorMaps || {})[currentFloor] ? floorMaps[currentFloor].src : null} />
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
