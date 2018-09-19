import moment from 'moment'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Line } from 'react-chartjs-2'
import { connect } from 'react-redux'
import {
  Layout, Radio, Row, Col, Select, DatePicker, Tooltip
} from 'antd'
import RepearVisitors from './dashboard/repeatVisitors'
import Dwell from './dashboard/dwell'
import Passerby from './dashboard/passerby'
import KpiSummarToday from './dashboard/kpiSummery'

const { RangePicker } = DatePicker
const { Header, Content, Footer, } = Layout
const Option = Select.Option
import {
  getRepeatVisitorsHourlyToday, getDwell, getPsserby, getConnected, getVisitors
} from '../reducers/cisco'


class Dashboard extends Component {
  static propTypes = {
    dashboardListInput: PropTypes.array,
    getRepeatVisitorsHourlyToday: PropTypes.func,
    getPsserby: PropTypes.func,
    getConnected: PropTypes.func,
    getVisitors: PropTypes.func,
    getDwell: PropTypes.func,
  }

  state = {
    isDisibleSelect: false
  }

  disibleSelect = bool => {
    this.setState({
      isDisibleSelect: bool
    })
  }

  // Cant select days after today
  disabledDate = (current) => current > moment().endOf('day')

  // Checker fo inpud dates
  dateCheakerRepeat = (dateStart, dateEnd, dateString) => {
    if (dateEnd.diff(dateStart, 'days') === 0) {
      this.props.getDwell('today')
      this.props.getRepeatVisitorsHourlyToday('today')
      this.props.getPsserby('today')
      this.props.getConnected('today')
      this.props.getVisitors('today')
    }
    else {
      this.props.getDwell(dateString[0], dateString[1])
      this.props.getPsserby(dateString[0], dateString[1])
      this.props.getConnected(dateString[0], dateString[1])
      this.props.getVisitors(dateString[0], dateString[1])
      this.props.getRepeatVisitorsHourlyToday(dateString[0], dateString[1])
    }
  }

  changeDateSelect = (date) => {
    this.props.getRepeatVisitorsHourlyToday(date)
    this.props.getDwell(date)
    this.props.getPsserby(date)
    this.props.getConnected(date)
    this.props.getVisitors(date)
  }
  // For Date Picker

  changeDate = (date, dateString) => {
    if (dateString[0]) {
      this.dateCheakerRepeat(date[0], date[1], dateString)
      // this.dateCheakerDewell(date[0], date[1], dateString)
      this.disibleSelect(true)
    }
    else {
      this.disibleSelect(false)
    }
  }

  render() {
    const { dashboardListInput } = this.props
    const { isDisibleSelect } = this.state
    const ttSelectText = isDisibleSelect ? 'Please clear date picker' : 'Please select type'
    const optionItems = dashboardListInput ? dashboardListInput.map((option) => <Option value={option} key={option}>{option}</Option>) : []

    return (
      <div className="dashboard-container">
        <Row type="flex" justify="space-around" align="middle" gutter={24}>
          <Col className="gutter-row" span={14}>
            <Radio.Group style={{ display: 'flex', flexDirection: 'row' }}>
              <Radio.Button value={1}>General</Radio.Button>
              <Radio.Button value={2}>TODAY</Radio.Button>
            </Radio.Group>
          </Col>
          <Col className="gutter-row" span={6}>
            <RangePicker disabledDate={this.disabledDate} onChange={this.changeDate} />
          </Col>
          <Col className="gutter-row" span={4}>
            <Tooltip placement="top" title={ttSelectText}>
              <Select defaultValue={dashboardListInput[0]} style={{ width: '100%' }} onChange={this.changeDateSelect} disabled={isDisibleSelect}>
                {optionItems}
              </Select>
            </Tooltip>
          </Col>
        </Row>
        <Row type="flex" justify="space-around" align="middle" gutter={24}>
          <Col className="gutter-row" span={20}>
            <h1>General Information</h1>
            <Passerby />
            <RepearVisitors />
            <Dwell />
          </Col>
        </Row>
      </div>
    )
  }
}
const dashboardStateToProps = state => ({
  dashboardListInput: state.cisco.dashboardListInput,
})

const dashboardDispatchToProps = dispatch => ({
  getRepeatVisitorsHourlyToday: (startDate, endDate) => dispatch(getRepeatVisitorsHourlyToday(startDate, endDate)),
  getDwell: (startDate, endDate) => dispatch(getDwell(startDate, endDate)),
  getPsserby: (startDate, endDate) => dispatch(getPsserby(startDate, endDate)),
  getConnected: (startDate, endDate) => dispatch(getConnected(startDate, endDate)),
  getVisitors: (startDate, endDate) => dispatch(getVisitors(startDate, endDate))
})

export default connect(dashboardStateToProps, dashboardDispatchToProps)(Dashboard)
