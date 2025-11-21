import React from 'react'
import Dashboard from './Dashboard/Dashboard'
import Finance from './Dashboard/Finance'
import Investments from './Dashboard/Investments'
import Markets from './Dashboard/Markets'
import Performance from './Dashboard/Performance'
import Settings from './Dashboard/Settings'

const Outlet = () => {
  return (
    <div>
      <Dashboard />
      <Finance />
      <Investments />
      <Markets />
      <Performance />
      <Settings />
    </div>
  )
}

export default Outlet
