import React, { Component } from 'react';

import FullCalendar from "@fullcalendar/react";
import listPlugin from "@fullcalendar/list";
import bootstrapPlugin from '@fullcalendar/bootstrap';
import $ from 'jquery';

export default class Cal extends React.Component {
  constructor(props) {
    super(props);
    this.updateEvents = this.updateEvents.bind(this);
  }
  componentDidMount() {
    this.updateEvents(this.props.events);
  }
  componentDidUpdate() {
    this.updateEvents(this.props.events);
  }
  updateEvents(eventsList) {
    console.log(eventsList);
    $('#calendar').fullCalendar('destroy');
    $('#calendar').fullCalendar(this.props);
  }
  render() {
    return <div id='calendar'></div>;
  }
}
