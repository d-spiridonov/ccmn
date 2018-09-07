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
      let label = `${hour} ${parseInt(hour) >= 12 ? 'pm' : 'am'}`
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
          'rgba(255, 99, 132, 0.2)'
        ],
        fill: false
      },
      {
        data: this.renderChart('WEEKLY'),
        label: 'WEEKLY',
        fill: false
      },
      {
        data: this.renderChart('OCCASIONAL'),
        label: 'OCCASIONAL',
        fill: false
      },
      {
        data: this.renderChart('FIRST_TIME'),
        label: 'FIRST_TIME',
        fill: false
      },
      {
        data: this.renderChart('YESTERDAY'),
        label: 'YESTERDAY',
        fill: false
      }
      ]
    }
    const options = {
      color: [
        'red', // color for data at index 0
        'blue', // color for data at index 1
        'green', // color for data at index 2
        'black', // color for data at index 3
        // ...
      ],
      chartArea: {
        backgroundColor: 'rgba(251, 85, 85, 0.4)'
      }
    }
    return (
      <Col className="gutter-row" span={20}>
        <h1>Repeat Visitors</h1>
        <Content>
          <h2>Hourly Repeat Visitors</h2>
          <Line data={data} options={options} />
        </Content>
        <Content>
          <h2>Hourly Repeat Visitors</h2>
          <Line data={data} options={options} />
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
