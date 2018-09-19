import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  Layout, Menu, Breadcrumb, Icon, Das
} from 'antd'
import { connect } from 'react-redux'
import { dispatch } from 'redux-act'
import moment from 'moment'
import { push } from 'react-router-redux'
import {
  getNumberOfOnlineUsers,
  getCountOfVisitorsToday,
  saveSelectedMenuItem
} from '../../reducers/cisco'

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
    this.props.getCountOfVisitorsToday()
    this.interval = setInterval(this.setDateAndTime, 1000)
    this.devicesConnectedInterval = setInterval(this.getTotalDevicesConnected, 10000)
  }

  componentWillUnmount() {
    clearInterval(this.interval)
    clearInterval(this.devicesConnectedInterval)
  }


  handleSelect = (event) => {
    this.props.saveSelectedMenuItem(event.key)
    this.props.push(`/dashboard/${event.key}`)
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

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={styles.headerItem}><b>CCMN</b></div>
            <div style={styles.headerItem}>{dateAndTime}</div>
            <div style={styles.headerItem}>Total Devices Connected: {onlineUsers}</div>
            <div style={styles.headerItem}>Visitors Today: {visitorsToday}</div>
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
              <Menu.Item key="2"><Icon type="pie-chart" />Metrics</Menu.Item>
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
})

const mapDispatchToProps = dispatch => ({
  getNumberOfOnlineUsers: () => dispatch(getNumberOfOnlineUsers()),
  getCountOfVisitorsToday: () => dispatch(getCountOfVisitorsToday()),
  push: path => dispatch(push(path)),
  saveSelectedMenuItem: selectedMenuItem => dispatch(saveSelectedMenuItem(selectedMenuItem)),
})

export default connect(mapStateToProps, mapDispatchToProps)(NavToolBar)
