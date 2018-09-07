import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { HorizontalBar } from 'react-chartjs-2'
import { connect } from 'react-redux'
import {
  Layout, Radio, Row, Col
} from 'antd'

const { Header, Content, Footer, } = Layout

import { getKpiSummarToday } from '../../reducers/cisco'

class kpiSummarToday extends Component {
  static propTypes = {
    kpiSummarToday: PropTypes.object,
    getKpiSummarToday: PropTypes.func
  }

  componentDidMount() {
    this.props.getKpiSummarToday()
    console.log(Object.values(this.props.kpiSummarToday).slice(2, 5))
    console.log(Object.keys(this.props.kpiSummarToday).slice(2, 5))
  }

  render() {
    const data = {
      labels: Object.keys(this.props.kpiSummarToday.topManufacturers.manufacturerCounts).map(x => x.substring(0, 12)),
      datasets: [
        {
          label: 'Manufacturer',
          backgroundColor: 'rgba(255,99,132,0.2)',
          borderColor: 'rgba(255,99,132,1)',
          borderWidth: 2,
          hoverBackgroundColor: 'rgba(255,99,132,0.4)',
          hoverBorderColor: 'rgba(255,99,132,1)',
          data: Object.values(this.props.kpiSummarToday.topManufacturers.manufacturerCounts)
        },
      ]
    }
    return (
      <Col className="gutter-row" span={20}>
        <Content style={{ 'max-height': '60vh' }}>
          <h1>General</h1>
          <HorizontalBar data={data} width={100} height={40} />
        </Content>
      </Col>
    )
  }
}

const dashboardStateToProps = state => ({
  kpiSummarToday: state.cisco.kpiSummarToday,
})

const dashboardDispatchToProps = dispatch => ({
  getKpiSummarToday: () => dispatch(getKpiSummarToday()),
})

export default connect(dashboardStateToProps, dashboardDispatchToProps)(kpiSummarToday)
