import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Route, Redirect, withRouter } from 'react-router-dom'
import ReactRouterPropTypes from 'react-router-prop-types'

const AuthenticatedRoute = ({ component: Component, isLoggedIn, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      isLoggedIn ? (
        <Component {...props} />
      ) : (
        <Redirect to={{ pathname: '/', state: { from: props.location } }} />
      )
    }
  />
)

function mapStateToProps(state) {
  return {
    isLoggedIn: state.auth.isLoggedIn,
  }
}

export default withRouter(
  connect(
    mapStateToProps,
    null
  )(AuthenticatedRoute)
)

AuthenticatedRoute.propTypes = {
  component: PropTypes.func.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  location: ReactRouterPropTypes.location.isRequired,
}
