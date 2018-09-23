import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  Layout, Menu, Breadcrumb, Icon, Das, message, Button
} from 'antd'
import { connect } from 'react-redux'
import { dispatch } from 'redux-act'
import moment from 'moment'
import { push } from 'react-router-redux'
import qs from 'query-string'
import {
  getNumberOfOnlineUsers,
  getCountOfVisitorsToday,
  saveSelectedMenuItem
} from '../../reducers/cisco'
import { resetStore } from '../../reducers/reset'

const { Header, Content, Sider } = Layout
const styles = {
  headerItem: {
    color: 'white',
  }
}
class NavToolBar extends React.Component {
  state = {
    collapsed: false,
    dateAndTime: null,
  }

  static propTypes = {
    children: PropTypes.any,
    getNumberOfOnlineUsers: PropTypes.func.isRequired,
    onlineUsers: PropTypes.number.isRequired,
    visitorsToday: PropTypes.number.isRequired,
    getCountOfVisitorsToday: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
    selectedMenuItem: PropTypes.string.isRequired,
    saveSelectedMenuItem: PropTypes.func.isRequired,
    location: PropTypes.object,
    userDevice: PropTypes.object,
    resetStore: PropTypes.func.isRequired,
  }

  toggle = () => {
    this.setState(prevState => ({
      collapsed: !prevState.collapsed,
    }))
  }

  setDateAndTime = () => {
    this.setState({
      dateAndTime: moment().format('MMMM Do YYYY, h:mm:ss a')
    })
  }

  getTotalDevicesConnected = () => {
    this.props.getNumberOfOnlineUsers()
  }

  componentDidMount() {
    const newLogin = qs.parse(this.props.location.search, { arrayFormat: 'bracket' }).login
    const name = qs.parse(this.props.location.search, { arrayFormat: 'bracket' }).name
    if (newLogin) this.showSuccessMessage(newLogin, name)
    this.handleSelect({ key: this.props.selectedMenuItem })
    this.props.getCountOfVisitorsToday()
    this.interval = setInterval(this.setDateAndTime, 1000)
    this.devicesConnectedInterval = setInterval(this.getTotalDevicesConnected, 10000)
  }

  componentWillUnmount() {
    clearInterval(this.interval)
    clearInterval(this.devicesConnectedInterval)
  }

  getMacFloor = mac => {
    const floorString = mac.mapInfo.mapHierarchyString
    if (floorString.includes('1st_floor')) return '1st floor'
    if (floorString.includes('2nd_floor')) return '2nd floor'
    return '3rd floor'
  }

  showSuccessMessage = (login, name) => {
    if (login == 'macAddress' && this.props.userDevice) {
      const macFloor = this.getMacFloor(this.props.userDevice)
      message.success(`Welcome, ${name}. We are glad to see you on the ${macFloor}!`)
    } else {
      message.success('Welcome, Anonymous!')
    }
  }

  handleSelect = (event) => {
    this.props.saveSelectedMenuItem(event.key)
    this.props.push(`/dashboard/${event.key}`)
  }

  handleLogout = () => {
    this.props.resetStore()
    this.props.push('/')
  }

  render() {
    const {
      children, onlineUsers, visitorsToday, selectedMenuItem
    } = this.props
    const { dateAndTime } = this.state

    return (
      <Layout style={{ height: '100%' }}>
        <Header className="header">
          <div className="logo" />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={styles.headerItem}><b>CCMN</b></div>
            <div style={styles.headerItem}>{dateAndTime}</div>
            <div style={styles.headerItem}>Total Devices Connected: {onlineUsers}</div>
            <div style={styles.headerItem}>Visitors Today: {visitorsToday}</div>
            <Button onClick={this.handleLogout} ghost style={styles.headerItem}>Log Out <Icon style={{ color: 'white' }} type="logout" theme="outlined" /></Button>
          </div>

        </Header>
        <Layout style={{ height: '100%' }}>
          <Sider
            trigger={null}
            collapsible
            collapsed={this.state.collapsed}
          >
            <div className="logo" />
            <Menu
              mode="inline"
              theme="dark"
              selectedKeys={[selectedMenuItem]}
              onSelect={this.handleSelect}
            >
              <Menu.Item key="guide"><Icon type="info-circle" theme="outlined" />Guide</Menu.Item>
              <Menu.Item key="dashboard"><Icon type="dashboard" />Dashboard</Menu.Item>
              <Menu.Item key="map"><Icon type="compass" />Maps</Menu.Item>
              <Menu.Item key="4"><Icon type="area-chart" />Analytics</Menu.Item>
            </Menu>
          </Sider>
          <Layout>
            <Content style={{
              background: '#fff', padding: 24, margin: 0, minHeight: 280
            }}
            >
              {children}
            </Content>
          </Layout>
        </Layout>
      </Layout>
    )
  }
}

const mapStateToProps = state => ({
  onlineUsers: state.cisco.onlineUsers,
  visitorsToday: state.cisco.visitorsToday,
  selectedMenuItem: state.cisco.selectedMenuItem,
  userDevice: state.auth.userDevice,
})

const mapDispatchToProps = dispatch => ({
  getNumberOfOnlineUsers: () => dispatch(getNumberOfOnlineUsers()),
  getCountOfVisitorsToday: () => dispatch(getCountOfVisitorsToday()),
  push: path => dispatch(push(path)),
  saveSelectedMenuItem: selectedMenuItem => dispatch(saveSelectedMenuItem(selectedMenuItem)),
  resetStore: () => dispatch(resetStore())
})

export default connect(mapStateToProps, mapDispatchToProps)(NavToolBar)
