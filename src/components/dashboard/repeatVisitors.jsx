import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Line } from 'react-chartjs-2'
import { connect } from 'react-redux'
import {
  Layout, Radio, Row, Col, message
} from 'antd'

const { Header, Content, Footer, } = Layout

import { getRepeatVisitorsHourlyToday } from '../../reducers/cisco'


class RepearVisitors extends Component {
  static propTypes = {
    repeatVisitorsHourlyToday: PropTypes.object,
    dashBoardType: PropTypes.string,
    getRepeatVisitorsHourlyToday: PropTypes.func,
  }

  componentDidMount() {
    this.props.getRepeatVisitorsHourlyToday().catch(err => {
      message.error(`An error occured while trying to fetch Repeat Visitors: ${err}`)
    })
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
    if (!this.props.repeatVisitorsHourlyToday) return []
    if (this.props.dashBoardType === '3days' && Object.keys(this.props.repeatVisitorsHourlyToday).length === 3)
    {
      // Return concat array for few dates
      return Object.values(this.props.repeatVisitorsHourlyToday).reduce((a, item) => a.concat(this.renderDaily(type, item)), [])
    }
    return this.renderDaily(type, this.props.repeatVisitorsHourlyToday)
  }

  render() {
    const data = {
      labels: this.renderChart(null),
      datasets: [{
        data: this.renderChart('DAILY'),
        label: 'DAILY',
        backgroundColor: [
          'rgba(53, 162, 235, 1)'
        ],
        borderColor: ['rgba(53, 162, 235, 0.4)'],
        fill: false
      },
      {
        data: this.renderChart('WEEKLY'),
        label: 'WEEKLY',
        backgroundColor: [
          'rgba(255, 99, 132, 1)'
        ],
        borderColor: ['rgba(255,99,132, 0.4)'],
        fill: false
      },
      {
        data: this.renderChart('OCCASIONAL'),
        backgroundColor: [
          'rgba(74, 191, 191, 1)'
        ],
        borderColor: ['rgba(74, 191, 191, 0.4)'],
        label: 'OCCASIONAL',
        fill: false
      },
      {
        data: this.renderChart('FIRST_TIME'),
        label: 'FIRST_TIME',
        backgroundColor: [
          'rgba(255, 206, 86, 1)'
        ],
        borderColor: ['rgba(255, 206, 86, 0.4)'],
        fill: false
      },
      {
        data: this.renderChart('YESTERDAY'),
        backgroundColor: [
          'rgba(101, 0, 251, 1)'
        ],
        borderColor: ['rgba(101, 0, 251, 0.4)'],

        label: 'YESTERDAY',
        fill: false
      }
      ]
    }
    return (
      <Content>
        <h2>Repeat Visitors</h2>
        <div className="chart-box">
          <Line data={data} width={100} height={40} />
        </div>
      </Content>
    )
  }
}

const repeatVisitorStateToProps = state => ({
  repeatVisitorsHourlyToday: state.cisco.repeatVisitorsHourlyToday,
  dashBoardType: state.cisco.dashBoardType
})

const repeatVisitorDispatchToProps = dispatch => ({
  getRepeatVisitorsHourlyToday: () => dispatch(getRepeatVisitorsHourlyToday('today')),
})

export default connect(repeatVisitorStateToProps, repeatVisitorDispatchToProps)(RepearVisitors)
