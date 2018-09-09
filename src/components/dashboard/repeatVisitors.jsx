import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Line } from 'react-chartjs-2'
import { connect } from 'react-redux'
import {
  Layout, Radio, Row, Col
} from 'antd'

const { Header, Content, Footer, } = Layout

import { getRepeatVisitorsHourlyToday } from '../../reducers/cisco'


class RepearVisitors extends Component {
  static propTypes = {
    repeatVisitorsHourlyToday: PropTypes.object,
    getRepeatVisitorsHourlyToday: PropTypes.func
  }

  componentDidMount() {
    this.props.getRepeatVisitorsHourlyToday()
  }

  renderChart = type => {
    if (type) return Object.keys(this.props.repeatVisitorsHourlyToday).map(index => this.props.repeatVisitorsHourlyToday[index][type])
    return Object.keys(this.props.repeatVisitorsHourlyToday).map(hour => {
      let label = `${parseInt(hour) > 12 ? hour - 12 : hour} ${parseInt(hour) > 12 ? 'pm' : 'am'}`
      return label
    })
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
      <Col className="gutter-row" span={20}>
        <h1>Repeat Visitors</h1>
        <Content>
          <h2>Repeat Visitors</h2>
          <div className="chart-box">
            <Line data={data} width={100} height={40} />
          </div>
        </Content>
        <Content>
          <h2>Repeat Visitors</h2>
          <div className="chart-box">
            <Line data={data} width={100} height={40} />
          </div>
        </Content>
      </Col>
    )
  }
}

const dashboardStateToProps = state => ({
  repeatVisitorsHourlyToday: state.cisco.repeatVisitorsHourlyToday,
})

const dashboardDispatchToProps = dispatch => ({
  getRepeatVisitorsHourlyToday: () => dispatch(getRepeatVisitorsHourlyToday()),
})

export default connect(dashboardStateToProps, dashboardDispatchToProps)(RepearVisitors)
