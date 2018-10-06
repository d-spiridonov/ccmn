import React, { Component } from 'react'
import { Collapse } from 'antd'


const Panel = Collapse.Panel

const Guide = () => (
  <div>
  <h2>Dashboard</h2>
  <Collapse accordion>
    <Panel header="Repeat Visitors" key="1">
      <p>Shows repeat visitors by hour or by day. You can see the following repeat visitor categories:</p>

      <p><b>- Daily</b> — Visitors who visited the selected site at least 5 days in the last 7 days;</p>

      <p><b>- Weekly</b> — Visitors who visited the selected site at least on 2 different weeks over the last 4 weeks;</p>

      <p><b>- First Time</b> — Visitors who visited the selected site for the first time;</p>

      <p><b>- Occasional</b> — Visitors who are not daily, weekly, or first-time visitors;</p>

      <p><b>- Yesterday</b> — Visitors who visited the site the previous day.</p>
    </Panel>
    <Panel header="Proximity" key="2">
      <p>- Shows information such as those pertaining to passersby, visitors, and connected devices, by hour (if it is a single day or last 3 days), or by day, for the given site.</p>
    </Panel>
    <Panel header="Dwell Time" key="3">
      <p>- Shows repeat visitors by hour or by day. You can see the following repeat visitor categories:</p>
      <p>- <b>Weekly</b> — Visitors who visited the selected site at least on 2 different weeks over the last 4 weeks;</p>
      <p>- <b>First Time</b> — Visitors who visited the selected site for the first time;</p>      
      <p>- <b>Occasional</b> — Visitors who are not daily, weekly, or first-time visitors;</p>      
      <p>- <b>Yesterday</b> — Visitors who visited the site the previous day.</p>
    </Panel>
    <Panel header="Proximity" key="2">
      <p>- Shows information such as those pertaining to passersby, visitors, and connected devices, by hour (if it is a single day or last 3 days), or by day, for the given site.</p>
    </Panel>
  </Collapse>
  <h2>Maps</h2>
  <Collapse accordion>
  <Panel header="Maps" key="1">
    <p>- Locate the visitors on the map in the real time;</p>
    <p>- Check the most populated places heatmap based on the historical data;</p>
    <p>- Get detailed information about particular visitor;</p>
  </Panel>
  </Collapse>
  <h2>Forecast</h2>
  <Collapse accordion>
  <Panel header="Forecast" key="1">
    <p>- Get the forecast for the week ahead based on the previous 2 months historial data.</p>
  </Panel>
  </Collapse>
  </div>
)

export default Guide
