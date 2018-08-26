import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  Layout, Menu, Breadcrumb, Icon
} from 'antd'
import { connect } from 'react-redux'
import { dispatch } from 'redux-act'
import moment from 'moment'
import {
  getNumberOfOnlineUsers,
  getCountOfVisitorsToday
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
    // getCountOfVisitorsToday: PropTypes.func.isRequired,
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
    // this.props.getCountOfVisitorsToday()
    this.interval = setInterval(this.setDateAndTime, 1000)
    this.devicesConnectedTimeout = setInterval(this.getTotalDevicesConnected, 15000)
  }

  componentWillUnmount() {
    clearInterval(this.interval)
    clearInterval(this.devicesConnectedTimeout)
  }

  render() {
    const { children, onlineUsers, visitorsToday } = this.props
    const { dateAndTime } = this.state

    return (
      <Layout style={{ height: '100%' }}>
        <Header className="header">
          <div className="logo" />

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={styles.headerItem}><b>CCMN</b></div>
            <div style={styles.headerItem}>{dateAndTime}</div>
            <div style={styles.headerItem}>Total Devices Connected: {onlineUsers}</div>
            <div style={styles.headerItem}>Connected today: {visitorsToday}</div>
            <div style={styles.headerItem}>New connections:</div>
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
              defaultSelectedKeys={['1']}
            >
              <Menu.Item key="1">option1</Menu.Item>
              <Menu.Item key="2">option2</Menu.Item>
              <Menu.Item key="3">option3</Menu.Item>
              <Menu.Item key="4">option4</Menu.Item>
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
  visitorsToday: state.cisco.visitorsToday
})

const mapDispatchToProps = dispatch => ({
  getNumberOfOnlineUsers: () => dispatch(getNumberOfOnlineUsers()),
  getCountOfVisitorsToday: () => dispatch(getCountOfVisitorsToday())
})

export default connect(mapStateToProps, mapDispatchToProps)(NavToolBar)
