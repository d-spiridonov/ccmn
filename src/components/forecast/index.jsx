import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import moment from 'moment'
import { getDailyStatsForForecasting } from '../../reducers/cisco'

const timeseries = require('timeseries-analysis')

const startDate = moment().subtract(57, 'days').format('YYYY-MM-DD')
const endDate = moment().subtract(1, 'days').format('YYYY-MM-DD')

class Forecast extends Component {
  static propTypes = {
    getDailyStatsForForecasting: PropTypes.func.isRequired,
    dailyForecastingStats: PropTypes.object.isRequired,
  }

  componentDidMount() {
    this.props.getDailyStatsForForecasting({ startDate, endDate })
      .then(() => {
        this.runForecast()
      })
  }

  runForecast = () => {
    const forecast = {}
    for (let day = 0; day < 7; day++) {
      let currentDayArray = []
      Object.keys(this.props.dailyForecastingStats).forEach((key, index) => {
        const momentDay = moment(key)
        if (momentDay.weekday() === day) currentDayArray.push(this.props.dailyForecastingStats[key])
      })
      forecast.day = this.getForecastedDay(currentDayArray)
    }
  }

  getForecastedDay = currentDayArray => {
    console.log(currentDayArray)
    let t = new timeseries.main(currentDayArray)
    console.log(t)
    let bestSettings = t.regression_forecast_optimize()
    console.log(bestSettings)
    t.sliding_regression_forecast({
      sample: bestSettings.sample,
      degree: bestSettings.degree,
      method: bestSettings.method,
    })
    console.log(t)
    return t
  }

  render() {
    return (
      <div />
    )
  }
}

const mapStateToProps = state => ({
  dailyForecastingStats: state.cisco.dailyForecastingStats
})

const mapDispatchToProps = dispatch => ({
  getDailyStatsForForecasting: ({ startDate, endDate }) => dispatch(getDailyStatsForForecasting({ startDate, endDate }))
})

export default connect(mapStateToProps, mapDispatchToProps)(Forecast)
