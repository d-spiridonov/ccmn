import React, { Component } from 'react'
import { Route, Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { Line } from 'react-chartjs-2'
import { connect } from 'react-redux'
import { Layout, Menu, Breadcrumb } from 'antd'

const { Header, Content, Footer } = Layout

import { getRepeatVisitorsHourlyToday } from '../reducers/cisco'


class Dashboard extends Component {
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
    return (
      <div>
        <Content>
          <Line data={data} />
        </Content>
      </div>
    )
  }
}

const dashboardStateToProps = state => ({
  repeatVisitorsHourlyToday: state.cisco.repeatVisitorsHourlyToday,
})

const dashboardDispatchToProps = dispatch => ({
  getRepeatVisitorsHourlyToday: () => dispatch(getRepeatVisitorsHourlyToday()),
})

export default connect(dashboardStateToProps, dashboardDispatchToProps)(Dashboard)
