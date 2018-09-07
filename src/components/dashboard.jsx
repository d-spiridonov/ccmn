import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Line } from 'react-chartjs-2'
import { connect } from 'react-redux'
import {
  Layout, Radio, Row, Col
} from 'antd'
import RepearVisitors from './dashboard/repeatVisitors'
import KpiSummarToday from './dashboard/kpiSummery'

const { Header, Content, Footer, } = Layout

import { getRepeatVisitorsHourlyToday } from '../reducers/cisco'


class Dashboard extends Component {
  static propTypes = {

  }

  componentDidMount() {

  }

  render() {
    return (
      <div>
        <Radio.Group style={{ display: 'flex', flexDirection: 'row' }}>
          <Radio.Button value={1}>Repeat Visitors</Radio.Button>
          <Radio.Button value={2}>TODAY</Radio.Button>
          <Radio.Button value={3}>Floor 3</Radio.Button>
        </Radio.Group>
        <Row type="flex" justify="space-around" align="middle" gutter={24}>
          <Col className="gutter-row" span={2}>Prev</Col>
          <KpiSummarToday />
          <Col className="gutter-row" span={2}>Next</Col>
        </Row>
      </div>
    )
  }
}

export default (Dashboard)
