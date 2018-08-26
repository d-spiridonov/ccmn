import React from 'react'
import { Button } from 'antd'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { logout } from '../../reducers/auth'
import 'antd/dist/antd.css'

const Logout = ({ logout }) => <Button onClick={() => logout()}>Logout</Button>

Logout.propTypes = {
  logout: PropTypes.func.isRequired,
}

const mapDispatchToProps = dispatch => ({
  logout: () => dispatch(logout()),
})

export default connect(
  null,
  mapDispatchToProps
)(Logout)
