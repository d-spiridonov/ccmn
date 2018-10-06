import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import moment from 'moment'
import predict from 'predict'
import { Line, Bar } from 'react-chartjs-2'
import { Layout } from 'antd'
import { getDailyStatsForForecasting } from '../../reducers/cisco'

const { Header, Content, Footer, } = Layout

// we take the last 2 months to get a forecast
const startDate = moment().subtract(56, 'days').format('YYYY-MM-DD')
const endDate = moment().subtract(1, 'days').format('YYYY-MM-DD')

class Forecast extends Component {
  static propTypes = {
    getDailyStatsForForecasting: PropTypes.func.isRequired,
    dailyForecastingStats: PropTypes.object.isRequired,
  }

  state = {
    forecast: [],
  }

  componentDidMount() {
    this.props.getDailyStatsForForecasting({ startDate, endDate })
      .then(() => {
        this.runForecast()
      })
  }

  // sorting array so that current day + preceding day will be at the bottom of the array

  sortArray = forecast => {
    const currentDay = moment().day()
    let daysBeforeAndCurrentDay = []
    if (currentDay !== 1) {
      // start from -2 from current day, so that the foreast is show from the next day
      for (let current = currentDay + 2; current < 7; current++) {
        const currentDay = forecast.shift()
        daysBeforeAndCurrentDay.push(currentDay)
        forecast.push(currentDay)
      }
    }
    return forecast
  }

  runForecast = () => {
    const forecast = []
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
      forecast.push(Math.floor(this.getForecastedDay(currentDayArray)))
    }
    const sortedForecast = this.sortArray(forecast)
    // removing the first element of the array (sunday) and moving it to the end
    this.setState({
      forecast: sortedForecast || [],
    })
  }

  getForecastedDay = currentDayArray => {
    const lr = predict.linearRegression(currentDayArray, [0, 1, 2, 3, 4, 5, 6, 7])
    return lr.predict(8)
  }

  getWeekDayNames = () => {
    let weekdaysArray = []
    for (let i = 1; i < 8; i++) {
      const currentDay = moment().add(i, 'days')
      weekdaysArray.push(currentDay.format('dddd') + ', ' + currentDay.format("MMM Do YY"))
    }
    return weekdaysArray
  }

  forecastData = (forecastFirstDay, forecastLastDay) => {
    return({
      labels: this.getWeekDayNames(),
      datasets: [{
        data: this.state.forecast,
        label: `Weekly visitors forecast for the week ${forecastFirstDay} - ${forecastLastDay}`,
        backgroundColor: 'rgba(74, 191, 191, 1)',
        borderColor: ['rgba(53, 162, 235, 0.4)'],
        fill: false,
      }]
  })
  }

  render() {
    const forecastFirstDay = moment().add(1, 'day').format("MMM Do YY")
    const forecastLastDay = moment().add(8, 'day').format("MMM Do YY")
    return (
      <Content>
        <h2>Weekly visitors forecast for the week {forecastFirstDay} - {forecastLastDay}</h2>
        <div className="chart-box">
          {this.state.forecast.length ? <Bar data={this.forecastData(forecastFirstDay, forecastLastDay)} width={100} height={40} /> : null}
        </div>
      </Content>
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
