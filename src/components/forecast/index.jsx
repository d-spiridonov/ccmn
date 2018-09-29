import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import moment from 'moment'
import predict from 'predict'
import { getDailyStatsForForecasting } from '../../reducers/cisco'

// we take the last 2 months to get a forecast
const startDate = moment().subtract(56, 'days').format('YYYY-MM-DD')
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
    // giterate over the days to get the array of sunday/mondays/tuesdays etc..
    for (let day = 0; day < 7; day++) {
      let currentDayArray = []
      Object.keys(this.props.dailyForecastingStats).forEach((key, index) => {
        const momentDay = moment(key)
        if (momentDay.weekday() === day) {
          currentDayArray.push(this.props.dailyForecastingStats[key])
        }
      })
      // get the forecast for each day of the week starting from Sunday
      forecast[day] = this.getForecastedDay(currentDayArray)
    }
  }

  getForecastedDay = currentDayArray => {
    const lr = predict.linearRegression(currentDayArray, [0, 1, 2, 3, 4, 5, 6, 7])
    return lr.predict(8)
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
