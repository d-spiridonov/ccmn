import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Bar } from 'react-chartjs-2'
import { connect } from 'react-redux'
import {
  Layout, Radio, Row, Col
} from 'antd'

const { Header, Content, Footer, } = Layout

import { getDwell } from '../../reducers/cisco'


class Dwell extends Component {
  static propTypes = {
    dwell: PropTypes.object,
    dashBoardType: PropTypes.string,
    getDwell: PropTypes.func,
  }

  componentDidMount() {
    this.props.getDwell()
  }

  renderDaily = (type, data) => {
    if (type) return Object.keys(data).map(index => {
      if (data[index]) return data[index][type]
      return 0
    })
    return Object.keys(data).map(hour => {
      if (/^\d+$/.test(hour)) return `${parseInt(hour) > 12 ? hour - 12 : hour} ${parseInt(hour) > 12 ? 'pm' : 'am'}`
      return hour
    })
  }

  renderChart = type => {
    if (!this.props.dwell) return []
    if (this.props.dashBoardType === '3days' && Object.keys(this.props.dwell).length === 3)
    {
      // Return concat array for few dates
      return Object.values(this.props.dwell).reduce((a, item) => a.concat(this.renderDaily(type, item)), [])
    }
    return this.renderDaily(type, this.props.dwell)
  }

  render() {
    const data = {
      labels: this.renderChart(null),
      datasets: [{
        data: this.renderChart('FIVE_TO_THIRTY_MINUTES'),
        label: 'FIVE_TO_THIRTY_MINUTES',
        backgroundColor: 'rgba(53, 162, 235, 1)',
        borderColor: ['rgba(53, 162, 235, 0.4)'],
        fill: false
      },
      {
        data: this.renderChart('THIRTY_TO_SIXTY_MINUTES'),
        label: 'THIRTY_TO_SIXTY_MINUTES',
        backgroundColor: 'rgba(255, 99, 132, 1)',
        borderColor: ['rgba(255,99,132, 0.4)'],
        fill: false
      },
      {
        data: this.renderChart('ONE_TO_FIVE_HOURS'),
        backgroundColor: 'rgba(74, 191, 191, 1)',
        borderColor: ['rgba(74, 191, 191, 0.4)'],
        label: 'ONE_TO_FIVE_HOURS',
        fill: false
      },
      {
        data: this.renderChart('FIVE_TO_EIGHT_HOURS'),
        label: 'FIVE_TO_EIGHT_HOURS',
        backgroundColor: 'rgba(255, 206, 86, 1)',
        borderColor: ['rgba(255, 206, 86, 0.4)'],
        fill: false
      },
      {
        data: this.renderChart('EIGHT_PLUS_HOURS'),
        backgroundColor: 'rgba(101, 0, 251, 1)',
        borderColor: ['rgba(101, 0, 251, 0.4)'],

        label: 'EIGHT_PLUS_HOURS',
        fill: false
      }
      ]
    }
    return (
      <Content>
        <h2> Dwell Time</h2>
        <div className="chart-box">
          <Bar data={data} width={100} height={40} />
        </div>
      </Content>
    )
  }
}

const dwellToProps = state => ({
  dwell: state.cisco.dwell,
  dashBoardType: state.cisco.dashBoardType
})

const dwellToPropsDispatchToProps = dispatch => ({
  getDwell: () => dispatch(getDwell('today')),
})

export default connect(dwellToProps, dwellToPropsDispatchToProps)(Dwell)
