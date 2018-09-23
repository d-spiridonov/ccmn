import React from 'react'
import PropTypes from 'prop-types'
import 'antd/dist/antd.css'
import {
  Card, Input, Button, Form, Icon, message
} from 'antd'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import axios from 'axios'
import qs from 'query-string'
import { performLogin, setLoggedIn, saveUserMacAddress } from '../reducers/auth'
import { getAllClients } from '../reducers/cisco'
import './login.css'


const FormItem = Form.Item


const styles = {
  divWrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '15%',
  },
  input: {
    width: '50%',
    marginBottom: 5,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  buttons: {
    marginTop: 10,
  },
  card: {
    width: 600,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
}

class Login extends React.Component {
  static propTypes = {
    push: PropTypes.func.isRequired,
    activeMacAddresses: PropTypes.array.isRequired,
    setLoggedIn: PropTypes.func.isRequired,
    saveUserMacAddress: PropTypes.func.isRequired,
    getAllClients: PropTypes.func.isRequired,
  }

  componentDidMount() {
    this.props.getAllClients()
  }

  state = {
    macAddress: '',
    macAddressError: false,
  }

  goToSignupPage = () => {
    this.props.push({ pathname: '/sign-up' })
  }

  onMacAddressChange = e => {
    this.setState({ macAddress: e.target.value })
  }

  goToDashboard = () => {
    this.props.push({ pathname: '/dashboard/dashboard' })
  }

  backButtonClicked = () => {
    const queryString = qs.stringify(
      {
        emailIds: this.emailIds
      },
      { arrayFormat: 'bracket' }
    )
    this.props.push({
      pathname: '/manage/integrations/hubspot/ctalist/',
      search: queryString
    })
  }

  handleLoginByMacAddress = () => {
    const macAddress = this.state.macAddress ? this.state.macAddress.toLowerCase() : ''
    const foundDevice = this.props.activeMacAddresses.find(device => (device.macAddress == macAddress))
    if (foundDevice) {
      this.props.saveUserMacAddress(foundDevice)
      this.props.setLoggedIn()
      const queryString = qs.stringify({ login: 'macAddress' })
      this.props.push({ pathname: '/dashboard/dashboard', search: queryString })
    } else {
      this.macAddressError()
      this.setState({
        macAddressError: true
      })
    }
  }

  handleAnonymousLogin = () => {
    this.props.setLoggedIn()
    const queryString = qs.stringify({ login: 'anonymous' })
    this.props.push({ pathname: '/dashboard/dashboard', search: queryString })
  }

  macAddressError = () => {
    message.error('No such MAC address found')
  }

  render() {
    const { macAddressError } = this.state

    return (
      <div style={styles.divWrapper}>
        <Card title="CCMN" style={styles.card}>
          <p>
            Cisco is the worldwide leader in IT and networking. Cisco helps
            companies of all sizes and people to connect, communicate, and
            collaborate. Many companies have provided public APIs as a means for
            others to access their infrastructure. During the realization of
            this project, you can practice with API and make your own app or
            program. You must develop solutions that will use real-time
            intelligence gathered from the UNIT Factory Wi-Fi network to enable
            people and their devices to interact more effectively through
            real-time contextual information related to such parameters as
            locations, availability of users, or mobile device assets.
          </p>
          <Form style={styles.form}>
            <Input
              style={styles.input}
              prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
              value={this.state.macAddress}
              onChange={this.onMacAddressChange}
              type="macAddress"
              placeholder="MAC address"
              className={macAddressError ? 'error' : null}
            />
            <div style={{ display: 'flex', flexDirection: 'column', width: 180 }}>
              <Button
                style={styles.buttons}
                onClick={this.handleLoginByMacAddress}
                type="primary"
              >
              Login By MAC Address
              </Button>
              <Button
                onClick={this.handleAnonymousLogin}
                style={styles.buttons}
              >
              Login Anonymously
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  activeMacAddresses: state.cisco.activeMacAddresses
})

const mapDispatchToProps = dispatch => ({
  push: path => dispatch(push(path)),
  performLogin: params => dispatch(performLogin(params)),
  setLoggedIn: () => dispatch(setLoggedIn(true)),
  saveUserMacAddress: userDevice => dispatch(saveUserMacAddress(userDevice)),
  getAllClients: () => dispatch(getAllClients()),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login)
