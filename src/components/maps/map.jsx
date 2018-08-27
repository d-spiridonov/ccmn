import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Button, Radio, Input } from 'antd'
import { getAllMaps } from '../../reducers/cisco'

const Search = Input.Search
class FloorMap extends Component {
  static propTypes = {
    getAllMaps: PropTypes.func.isRequired,
    floorMaps: PropTypes.array.isRequired,
  }

  state = {
    currentFloor: 1
  }

  componentDidMount() {
    this.props.getAllMaps()
  }

  handleFloorChange = e => {
    this.setState({
      currentFloor: e.target.value
    })
  }

  render() {
    const { currentFloor } = this.state
    return (
      <div>
        <Radio.Group style={{ display: 'flex', flexDirection: 'row' }} value={currentFloor} onChange={this.handleFloorChange}>
          <Radio.Button value={1}>Floor 1</Radio.Button>
          <Radio.Button value={2}>Floor 2</Radio.Button>
          <Radio.Button value={0}>Floor 3</Radio.Button>
        </Radio.Group>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Search
            placeholder="Enter MAC address"
            // onSearch={value => console.log(value)}
            style={{ width: 200 }}
          />
          <Search
            placeholder="Enter x-login"
            // onSearch={value => console.log(value)}
            style={{ width: 200 }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <img style={{ height: 600 }} src={this.props.floorMaps[currentFloor] ? this.props.floorMaps[currentFloor].src : null} />
        </div>
      </div>
    )
  }
}


const mapStateToProps = state => ({
  floorMaps: state.cisco.floorImage,
})

const mapDispatchToProps = dispatch => ({
  getAllMaps: () => dispatch(getAllMaps())
})

export default connect(mapStateToProps, mapDispatchToProps)(FloorMap)
