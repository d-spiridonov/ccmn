import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { DatePicker, Switch, Spin } from 'antd'
import moment from 'moment'

const styles = {
  pinkCircle: {
    width: 15,
    height: 15,
    borderRadius: 25,
    background: 'pink',
  }
}

class HeatMap extends Component {
    static propTypes = {
      handleStartDateChange: PropTypes.func.isRequired,
      handleEndDateChange: PropTypes.func.isRequired,
      handleCheckboxClick: PropTypes.func.isRequired,
      checked: PropTypes.bool.isRequired,
      isLoading: PropTypes.bool.isRequired,
    }

    state = {
      startValue: moment().startOf('day'),
      endValue: moment().endOf('day'),
      endOpen: false,
    }

    static getDerivedStateFromProps(nextProps, prevState) {
      if (nextProps.startDate && nextProps.startDate !== prevState.startValue) {
        return {
          startValue: nextProps.startDate,
          endValue: nextProps.endDate || prevState.endDate
        }
      }
      if (nextProps.endDate && nextProps.endDate !== prevState.endValue) {
        return {
          endValue: nextProps.endDate,
          startValue: nextProps.startDate || prevState.startDate
        }
      }
      return null
    }

    disabledStartDate = (startValue) => {
      const endValue = this.state.endValue
      if (!startValue || !endValue) {
        return false
      }
      return startValue.valueOf() > endValue.valueOf()
    }

      disabledEndDate = (endValue) => {
        const startValue = this.state.startValue
        if (!endValue || !startValue) {
          return false
        }
        return endValue.valueOf() <= startValue.valueOf()
      }

      handleStartOpenChange = (open) => {
        if (!open) {
          this.setState({ endOpen: true })
        }
      }

      handleEndOpenChange = (open) => {
        this.setState({ endOpen: open })
      }

      onChange = (field, value) => {
        this.setState({
          [field]: value,
        })
      }

      onStartChange = (value) => {
        if (this.props.handleStartDateChange) this.props.handleStartDateChange(value)
        this.onChange('startValue', value)
      }

      onEndChange = (value) => {
        if (this.props.handleEndDateChange) this.props.handleEndDateChange(value)
        this.onChange('endValue', value)
      }

      handleStartDateChange = () => {
        if (this.props.handleStartDateChange) this.props.handleStartDateChange(this.state.startValue)
      }

      handleEndDateChange = () => {
        if (this.props.handleEndDateChange) this.props.handleEndDateChange(this.state.endValue)
      }

      render() {
        const {
          handleCheckboxClick, handleStartDateChange, handleEndDateChange, checked, isLoading
        } = this.props
        const { startValue, endValue, endOpen } = this.state
        return (
          <div style={{ width: 250, marginTop: 20 }}>
            <div style={{
              display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 10, justifyContent: 'space-between'
            }}
            >
              <Switch size="small" checked={checked} onChange={handleCheckboxClick} />
              <span>Show Activity</span> {isLoading ? <Spin /> : <div style={styles.pinkCircle} />}
            </div>
            <div>
              <div style={{ marginBottom: 10, textAlign: 'center' }}>Please select time-frame</div>
              <DatePicker
                style={{ width: '100%' }}
                disabledDate={this.disabledStartDate}
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                value={startValue}
                placeholder="Start"
                onChange={this.onStartChange}
                onOk={this.handleStartDateChange}
                onOpenChange={this.handleStartOpenChange}
              />
              <DatePicker
                style={{ width: '100%' }}
                disabledDate={this.disabledEndDate}
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                value={endValue}
                placeholder="End"
                onChange={this.onEndChange}
                onOk={this.handleEndDateChange}
                open={endOpen}
                onOpenChange={this.handleEndOpenChange}
              />
            </div>
          </div>
        )
      }
}

export default HeatMap
