import React from 'react'
import 'antd/dist/antd.css'
import input from 'antd/lib/input'
import { Card, Input, Button, Form, Icon } from 'antd'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import PropTypes from 'prop-types'
import { signup } from '../reducers/auth'

const styles = {
  divWrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '15%',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  input: {
    marginBottom: 10,
  },
  card: {
    width: 600,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  buttons: {
    marginTop: 10,
    marginBottom: 10,
  },
}
class SignUp extends React.Component {
  static propTypes = {
    signup: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)
    this.firstName = ''
    this.lastName = ''
    this.username = ''
    this.website = ''
    this.email = ''
  }

  handleSignUp = () => {
    this.props
      .signup({
        firstName: this.firstName,
        lastName: this.lastName,
        username: this.username,
        password: this.password,
        email: this.email,
        website: this.website,
      })
      .then(res => {
        this.props.push({ pathname: '/dashboard' })
      })
  }

  onNameChange = e => {
    this.firstName = e.target.value
  }

  onLastNameChange = e => {
    this.lastName = e.target.value
  }

  onWebsiteChange = e => {
    this.website = e.target.value
  }

  onEmailChange = e => {
    this.email = e.target.value
  }

  onUsernameChange = e => {
    this.username = e.target.value
  }

  onPasswordChange = e => {
    this.password = e.target.value
  }

  render() {
    return (
      <div style={styles.divWrapper}>
        <Card title="CCMN" style={styles.card}>
          <Form style={styles.form}>
            <p>Get your access</p>
            <Input
              style={styles.input}
              onChange={this.onNameChange}
              prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="First Name"
            />
            <Input
              style={styles.input}
              onChange={this.onLastNameChange}
              prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Last Name"
            />
            <Input
              style={styles.input}
              onChange={this.onUsernameChange}
              prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Username"
            />
            <Input
              style={styles.input}
              onChange={this.onPasswordChange}
              type="password"
              prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Password"
            />
            <Input
              style={styles.input}
              onChange={this.onWebsiteChange}
              prefix={<Icon style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Company Website URL"
            />
            <Input
              style={styles.input}
              onChange={this.onEmailChange}
              prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Email"
            />
            <Button
              style={styles.buttons}
              onClick={this.handleSignUp}
              type="primary"
            >
              Get My Access Link
            </Button>
          </Form>
        </Card>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  signup: params => dispatch(signup(params)),
  push: path => dispatch(push(path)),
})

export default connect(
  null,
  mapDispatchToProps
)(SignUp)
