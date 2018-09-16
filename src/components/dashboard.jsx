import moment from 'moment'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Line } from 'react-chartjs-2'
import { connect } from 'react-redux'
import {
  Layout, Radio, Row, Col, Select, DatePicker, Tooltip
} from 'antd'
import RepearVisitors from './dashboard/repeatVisitors'
import KpiSummarToday from './dashboard/kpiSummery'

const { RangePicker } = DatePicker
const { Header, Content, Footer, } = Layout
const Option = Select.Option
import { getRepeatVisitorsHourlyToday } from '../reducers/cisco'


class Dashboard extends Component {
  static propTypes = {
    dashboardListInput: PropTypes.array,
    getRepeatVisitorsHourlyToday: PropTypes.func
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
  dateCheaker = (dateStart, dateEnd, dateString) => {
    if (dateEnd.diff(dateStart, 'days') === 0) return this.props.getRepeatVisitorsHourlyToday('today')
    return this.props.getRepeatVisitorsHourlyToday(dateString[0], dateString[1])
  }

  // For Select
  changeDateSelect = (date, dateString) => this.props.getRepeatVisitorsHourlyToday(date)

  // For Date Picker

  changeDate = (date, dateString) => {
    if (dateString[0]) {
      this.dateCheaker(date[0], date[1], dateString)
      this.disibleSelect(true)
    }
    else this.disibleSelect(false)
  }

  render() {
    const { dashboardListInput } = this.props
    const { isDisibleSelect } = this.state
    const ttSelectText = isDisibleSelect ? 'Please, clear date picker' : 'Please, select type'
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
            <RepearVisitors />
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
})

export default connect(dashboardStateToProps, dashboardDispatchToProps)(Dashboard)
