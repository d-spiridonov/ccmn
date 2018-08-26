import React from 'react'
import PropTypes from 'prop-types'
import 'antd/dist/antd.css'
import {
  Card, Input, Button, Form, Icon
} from 'antd'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import axios from 'axios'
import { performLogin } from '../reducers/auth'

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
    marginBottom: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  buttons: {
    marginTop: 10,
    marginBottom: 10,
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
  }

  state = {
    username: '',
    password: '',
  }

  goToSignupPage = () => {
    this.props.push({ pathname: '/sign-up' })
  }

  onUsernameChange = e => {
    this.setState({ username: e.target.value })
  }

  onPasswordChange = e => {
    this.setState({ password: e.target.value })
  }

  handleLogin = () => {
    axios
      .post('/auth/login/', {
        username: this.state.username,
        password: this.state.password,
      })
      .then(res => console.log(res))
  }

  goToDashboard = () => {
    this.props.push({ pathname: '/dashboard/map' })
  }

  render() {
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
              value={this.state.username}
              onChange={this.onUsernameChange}
              type="username"
              placeholder="Username"
            />
            <Input
              style={styles.input}
              prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
              value={this.state.password}
              onChange={this.onPasswordChange}
              type="password"
              placeholder="Password"
            />
            <Button
              style={styles.buttons}
              onClick={this.handleLogin}
              type="primary"
            >
              Login
            </Button>
            <Button
              onClick={this.goToSignupPage}
              style={styles.buttons}
              type="primary"
            >
              Get Your Access
            </Button>
            <Button
              onClick={this.goToDashboard}
              style={styles.buttons}
              type="primary"
            >
              Login Anonymously
            </Button>
          </Form>
        </Card>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  push: path => dispatch(push(path)),
  performLogin: params => dispatch(performLogin(params)),
})

export default connect(
  null,
  mapDispatchToProps
)(Login)
