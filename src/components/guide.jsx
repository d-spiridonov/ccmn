import React, { Component } from 'react'
import { Collapse } from 'antd'


const Panel = Collapse.Panel

const Guide = () => (
  <Collapse accordion>
    <Panel header="Repeat Visitors" key="1">
      <p>Shows repeat visitors by hour or by day. You can see the following repeat visitor categories:</p>

      <p>Daily—Visitors who visited the selected site at least 5 days in the last 7 days.</p>

      <p>Weekly—Visitors who visited the selected site at least on 2 different weeks over the last 4 weeks.</p>

      <p>First Time—Visitors who visited the selected site for the first time.</p>

      <p>Occasional—Visitors who are not daily, weekly, or first-time visitors.</p>

      <p>Yesterday—Visitors who visited the site the previous day.</p>
    </Panel>
    <Panel header="This is panel header 2" key="2">
      <p>This is panel header 1</p>
    </Panel>
    <Panel header="This is panel header 3" key="3">
      <p>This is panel header 1</p>
    </Panel>
  </Collapse>
)

export default Guide
