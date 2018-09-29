import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Bar } from 'react-chartjs-2'
import { connect } from 'react-redux'
import {
  Layout, Radio, Row, Col, message
} from 'antd'

const { Header, Content, Footer, } = Layout

import { getPsserby, getConnected, getVisitors } from '../../reducers/cisco'


class Passerby extends Component {
  static propTypes = {
    connected: PropTypes.object,
    passerby: PropTypes.object,
    visitors: PropTypes.object,
    dashBoardType: PropTypes.string,
    getPsserby: PropTypes.func,
    getConnected: PropTypes.func,
    getVisitors: PropTypes.func
  }

  componentDidMount() {
    Promise.all([
      this.props.getPsserby(),
      this.props.getConnected(),
      this.props.getVisitors(),
    ]) 
    .catch(err => {
      message.error(`An error ocurred while trying to fetch passerby data ${err}`)
    })
  }

  renderDaily = (type, data) => {
    if (type) return Object.keys(data).map(index => {
      if (data[index]) return data[index]
      return 0
    })
    return Object.keys(data).map(hour => {
      if (/^\d+$/.test(hour)) return `${parseInt(hour) > 12 ? hour - 12 : hour} ${parseInt(hour) > 12 ? 'pm' : 'am'}`
      return hour
    })
  }

  renderChart = (type, data) => {
    if (!data) return []
    if (this.props.dashBoardType === '3days' && Object.keys(data).length === 3)
    {
      // Return concat array for few dates
      return Object.values(data).reduce((a, item) => a.concat(this.renderDaily(type, item)), [])
    }
    return this.renderDaily(type, data)
  }

  render() {
    const data = {
      labels: this.renderChart(null, this.props.passerby),
      datasets: [{
        data: this.renderChart('passerby', this.props.passerby),
        backgroundColor: 'rgba(255, 99, 132, 1)',
        borderColor: ['rgba(255,99,132, 0.4)'],
        fill: false,
        label: 'Passerby'
      },
      {
        data: this.renderChart('connected', this.props.connected),
        backgroundColor: 'rgba(74, 191, 191, 1)',
        borderColor: ['rgba(74, 191, 191, 0.4)'],
        fill: false,
        label: 'Connected'
      },
      {
        data: this.renderChart('connected', this.props.visitors),
        backgroundColor: 'rgba(53, 162, 235, 1)',
        borderColor: ['rgba(53, 162, 235, 0.4)'],
        fill: false,
        label: 'Visitors'
      }
      ]
    }
    return (
      <Content>
        <h2> Proximity</h2>
        <div className="chart-box">
          <Bar data={data} width={100} height={40} />
        </div>
      </Content>
    )
  }
}

const passerbyToProps = state => ({
  passerby: state.cisco.passerby,
  connected: state.cisco.connected,
  visitors: state.cisco.visitors,
  dashBoardType: state.cisco.dashBoardType
})

const passerbyToPropsDispatchToProps = dispatch => ({
  getPsserby: () => dispatch(getPsserby('today')),
  getConnected: () => dispatch(getConnected('today')),
  getVisitors: () => dispatch(getVisitors('today'))
})

export default connect(passerbyToProps, passerbyToPropsDispatchToProps)(Passerby)
