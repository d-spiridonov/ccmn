import React from 'react'
import PropTypes from 'prop-types'
import NavToolBar from './navToolBar'

const Nav = ({ children }) => (
  <div>
    <NavToolBar>
      {children}
    </NavToolBar>
  </div>
)

Nav.propTypes = {
  children: PropTypes.any,
}

export default Nav
