import React, { Component } from "react";
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  Container,
  Row,
  Col,
  Jumbotron
} from "reactstrap";
import { ClipLoader } from "react-spinners";
import LoadingOverlay from "react-loading-overlay";

import Paper from "@material-ui/core/Paper";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import DoneIcon from "@material-ui/icons/Done";
import Grid from "@material-ui/core/Grid";
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import { Transition } from 'semantic-ui-react'

import { HashRouter as Router, Route, Link } from "react-router-dom";

import { Statistic, List, Image, Header } from "semantic-ui-react";
import CountUp from "react-countup";

import sanitizeHtml from "sanitize-html";
import linkifyHtml from "linkifyjs/html";

import FullCalendar from "@fullcalendar/react";
import listPlugin from "@fullcalendar/list";
import bootstrapPlugin from "@fullcalendar/bootstrap";
import jQuery from "jquery";
import Input from "@material-ui/core/Input";
import TextField from "@material-ui/core/TextField";
import { Feed } from "semantic-ui-react";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Typography from "@material-ui/core/Typography";

import "./App.css";
import wheel from "./img/wheel.png";
import welcome from "./img/bowtie.png";
import calendar from "./img/calendar.png";
import handshake from "./img/handshake.png";
import plant from "./img/plant.png";
import "@fullcalendar/core/main.css";
import "@fullcalendar/list/main.css";
import "@fullcalendar/bootstrap/main.css";
import "font-awesome/css/font-awesome.min.css";
import "semantic-ui-css/semantic.min.css";

import { AutoRotatingCarousel } from "material-auto-rotating-carousel";
import { Slide } from "material-auto-rotating-carousel";
const { red, blue, green } = require("@material-ui/core/colors");
const Button = require("@material-ui/core/Button").default;

const API = "/api";
//const API = "http://hadriel.caths.cam.ac.uk:1337/api";

const stockPics = ["ade", "chris", "christian", "daniel", "elliot", "helen"];

export class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      msg: { title: "", body: "", open: false, closeMsg: "" },
      textchoice: false,
      loading: true,
      fOfficer: ["", ""],
      loadingmodal: false,
      calendarEvents: [{ title: "Loading...", start: new Date() }],
      preimg: [],
      open: false,
      isOpen: false,
      page: 0,
      isAdmin: false,
      crsid: "sm2030",
      myName: "Souradip Mookerjee",
      editingSeat: false,
      editingBooking: false
    };

    this.toggle = this.toggle.bind(this);
    this.actualGoto = this.actualGoto.bind(this);
    this.actualAddBooking = this.actualAddBooking.bind(this);
    this.calRef = React.createRef();
  }

  componentDidMount() {
    var usedBefore = localStorage.getItem("used-before") || false;

    fetch(API + "/formals_list", { credentials: 'include' })
      .then(response => response.json())
      .then(data => {
        if (data.disabled) {
          window.location.href = "/banned";
          return;
        }
        if (!data.isLoggedIn) {
          window.location.href = API + "/../login/formal";
          return;
        }
        this.setState(
          {
            open: !usedBefore,
            calendarEvents: data.res,
            loading: false,
            myName: data.myName,
            isAdmin: data.isAdmin,
            crsid: data.crsid,
            fOfficer: data.fOfficer
          },
          this.actualGoto
        );
      });
    window.onhashchange = this.actualGoto;
  }

  actualGoto() {
    var id = parseInt(window.location.hash.split("/")[1]);
    var e = this.calRef.current.getApi().getEvents();
    if (id > 0) {
      for (var a of e) {
        if (a.extendedProps.ID == id) this.loadEvent(a);
      }
    } else {
      this.setState({ page: 0 });
    }
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  startUsing() {
    localStorage.setItem("used-before", true);
  }

  renderEventTitle() {
    if (this.state.event) {
      var time = this.state.event.start.toLocaleTimeString();
      return (
        <div className="tophead">
          <Header as="h1">
            {this.state.event.title}
            <Header.Subheader>
              {this.state.event.start.toLocaleDateString()}
            </Header.Subheader>
          </Header>
        </div>
      );
    } else {
      return "";
    }
  }

  renderEventMenu() {
    if (this.state.event && this.state.event.extendedProps.description) {
      return linkifyHtml(
        sanitizeHtml(this.state.event.extendedProps.description.trim())
          .split("\r")
          .join("")
          .split("\n")
          .join("<br />")
          .split("Menu:")
          .join("<p><h3>Menu:</h3></p>")
          .split("Menu:</h3></p><br /><br />")
          .join("Menu:</h3></p>")
      );
    } else return "";
  }

  adminButton() {
    if (this.state.isAdmin) {
      return (
        <NavItem>
          <NavLink href="/formal/admin">Admin</NavLink>
        </NavItem>
      );
    }
  }

  random(seed) {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }

  getEventColor() {
    if (this.state.event.extendedProps.status == "Open") return "green";
    if (this.state.event.extendedProps.status == "Upcoming") return "blue";

    return "red";
  }

  loadEvent(event, doscroll = false) {
    var a = [];
    for (var b of event.extendedProps.booked) {
      var choice = stockPics[Math.floor(this.random(b.id) * stockPics.length)];
      if (b.veg == "Y" && b.diets == "") b.diets = "Vegetarian";
      //    	if(b.veg == "Y" && b.diets != "" && b.diets != "Vegetarian") b.diets = "Vegetarian and " + b.diets
      if (b.type == "owner") {
        b.guestname = b.firstname + " " + b.lastname;
        b.img = "https://mcr.caths.cam.ac.uk/api/pic/" + b.crsid;
      } else {
        b.img = `https://react.semantic-ui.com/images/avatar/small/${choice}.jpg`;
      }
      if (b.crsid == this.state.crsid) {
        a.push(b);
      }
    }
    if (a.length > 0) a.unshift(a.pop());
    if (doscroll) document.body.scrollTo(0, 0);
    this.setState(
      {
        page: 1,
        event: event,
        mybookings: a,
        editingSeat: false,
        editingBooking: false
      },
      this.updateButtons
    );
  }

  isCrsidPresent(booking) {
    for (var r of booking) {
      if (r.crsid == this.state.crsid) {
        return true;
      }
    }
    return false;
  }

  handleCloseModal = () => {
    if(this.state.msg.closeFunc) {
        this.state.msg.closeFunc()
    }
    this.handleCloseModalN()
  };

  handleCloseModalN = () => {
    this.setState({
      msg: {
        title: this.state.msg.title,
        body: this.state.msg.body,
        closeMsg: this.state.msg.closeMsg,
        el: this.state.msg.el,
        open: false
      }
    });
  };

  handleCloseModalSeating = () => {
    this.toggleEditingSeat()
  };

  showRules() {
    this.setState({
      msg: {
        title: "Formal Hall Rules",
        body:
          '<p><b>As described in section 9 of the <a href="http://www.caths.cam.ac.uk/students/deans-notice">Dean\'s Notice</a></b></p>\
<p>\
    Formal Hall is an occasion on which all members of St Catharine\'s should wear gowns. Members and their guests must be dressed in suitably smart dress. "Smart dress" is defined without reference to considerations of gender identity or expression. This means a suit (or trousers and jacket), a shirt with a collar, a tie, and shoes (not trainers or sandals), or equivalently formal dress. The staff are instructed to refuse admission to anyone coming to Formal Hall improperly dressed.\
</p>\
<p>\
    No one may leave his or her seat before grace without permission, except in case of medical emergency or when evacuation of Hall is necessary. Before entering Hall those dining should ensure that they are sufficiently comfortable to remain seated till the grace.\
</p>\
<p>\
    Junior Members and their Guests are required to abide by the Formal Hall Code of Behaviour. The Code can be found on the College website, and a copy is displayed outside Hall.\
</p>\
<p>\
    Toasts are not permitted at Formal Hall. At other formal dinners (<i>e.g.</i> club or society dinners), toasts are only permitted when serving staff are not in the room. When staff enter the room any toast in progress is to be brought to a swift conclusion and students are to remain seated while food and drink are served or crockery <i>etc.</i> cleared away. This is for the safety of students and staff.\
</p>\
<p>\
    No more than five guests can be signed into Hall at any one time.\
</p>\
<p>\
    <b>Bear in mind that formal halls held outside of St. Catharine\'s are likely to have their own rules of which you will be informed. If in doubt, contact the Formal Hall Officer for further information.</b></p>',
        closeMsg: "I agree",
        open: true
      }
    });
  }


  confirmRules(agreed) {
    this.setState({
      msg: {
        title: "Formal Hall Rules",
        body:
          '<p><b>As described in section 9 of the <a href="http://www.caths.cam.ac.uk/students/deans-notice">Dean\'s Notice</a></b></p>\
<p>\
    Formal Hall is an occasion on which all members of St Catharine\'s should wear gowns. Members and their guests must be dressed in suitably smart dress. "Smart dress" is defined without reference to considerations of gender identity or expression. This means a suit (or trousers and jacket), a shirt with a collar, a tie, and shoes (not trainers or sandals), or equivalently formal dress. The staff are instructed to refuse admission to anyone coming to Formal Hall improperly dressed.\
</p>\
<p>\
    No one may leave his or her seat before grace without permission, except in case of medical emergency or when evacuation of Hall is necessary. Before entering Hall those dining should ensure that they are sufficiently comfortable to remain seated till the grace.\
</p>\
<p>\
    Junior Members and their Guests are required to abide by the Formal Hall Code of Behaviour. The Code can be found on the College website, and a copy is displayed outside Hall.\
</p>\
<p>\
    Toasts are not permitted at Formal Hall. At other formal dinners (<i>e.g.</i> club or society dinners), toasts are only permitted when serving staff are not in the room. When staff enter the room any toast in progress is to be brought to a swift conclusion and students are to remain seated while food and drink are served or crockery <i>etc.</i> cleared away. This is for the safety of students and staff.\
</p>\
<p>\
    No more than five guests can be signed into Hall at any one time.\
</p>\
<p>\
    <b>Bear in mind that formal halls held outside of St. Catharine\'s are likely to have their own rules of which you will be informed. If in doubt, contact the Formal Hall Officer for further information.</b></p>',
        closeMsg: "I agree", denyMsg: "Cancel",
        open: true, closeFunc: agreed
      }
    });
  }

  toggleEditingSeat() {
    if (this.state.editingSeat || this.state.seatingPrompt) {
      // save then finish
      var seating = jQuery("#seatreq").val();
      var seating2 = jQuery("#seatreq2").val();
      if(this.state.seatingPrompt) { seating = seating2; }
      var tt = this;
      fetch(API + "/formal_edit_seat", {
        method: "post", credentials: 'include',
        body: JSON.stringify({
          fid: this.state.event.extendedProps.ID,
          seating: seating,
          id: this.state.mybookings[0].id
        })
      })
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          var a = tt.state.mybookings;
          a[0].seat = seating;
          tt.setState({ editingSeat: false, mybookings: a, seatingPrompt: false }, tt.updateButtons);
        });
    } else {
      // open ediitng
      this.setState({ editingSeat: true }, this.updateButtons);
    }
  }

  toggleEditBooking() {
    if (this.state.editingBooking) {
      // save then finish
      this.setState({ loadingmodal: true });
      var names = [],
        diets = [],
        ids = [];
      for (var e of jQuery(".names input")) {
        names.push(e.value);
      }
      names.unshift("");
      for (var e of jQuery(".diets input")) {
        diets.push(e.value);
      }
      for (var e of jQuery(".diets")) {
        ids.push(jQuery(e).data("id"));
      }
      console.log(names);
      console.log(diets);
      console.log(ids);
      var tt = this;
      fetch(API + "/formal_edit_booking", { credentials: 'include',
        method: "post",
        body: JSON.stringify({
          fid: this.state.event.extendedProps.ID,
          names: names,
          diets: diets,
          ids: ids
        })
      })
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          tt.setState({ loadingmodal: false });
          var a = tt.state.mybookings;
          for (var n in a) {
            if (n == 0) {
              a[n].guestname = tt.state.myName;
              a[n].img =
                "https://mcr.caths.cam.ac.uk/api/pic/" + tt.state.crsid;
            } else a[n].guestname = names[n];
            a[n].diets = diets[n];
            a[n].diets = diets[n];
          }
          tt.setState(
            { editingBooking: false, mybookings: a },
            tt.updateButtons
          );
        })
        .catch(function() {
          tt.setState({ loadingmodal: false });
        });
    } else {
      // open ediitng
      this.setState({ editingBooking: true }, this.updateButtons);
    }
  }

  updatePage() {}

  actualAddBooking() {
    var tt = this;
    this.setState({ loadingmodal: true });
    fetch(API + "/formal_add_booking", {
      method: "post", credentials: 'include',
      body: JSON.stringify({ fid: this.state.event.extendedProps.ID })
    })
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        tt.setState({ loadingmodal: false, seatingPrompt: (tt.state.event.extendedProps.seatplan == "Y" && tt.state.mybookings.length == 0) });
        console.log(data);
        if (data.status == 0) {
          // update booking
          var cevents = tt.state.calendarEvents;
          var ev = null;
          for (var a of cevents) {
            if (a.ID == tt.state.event.extendedProps.ID) {
              a.booked = data.b;
              ev = a;
            }
          }
          tt.setState({ calendarEvents: cevents }, function() {
            tt.calRef.current
              .getApi()
              .getEventSources()[0]
              .refetch();
            tt.actualGoto();
          });
        } else {
          // show error in data.msg
          tt.setState({
            msg: {
              title: "Error",
              body: "<p>" + data.msg + "</p>",
              closeMsg: "Ok",
              open: true
            }
          });
        }
      })
      .catch(function() {
        tt.setState({ loadingmodal: false });
      });
  }

  addBooking() {
    this.confirmRules(this.actualAddBooking)
  }

  removeBooking() {
    var mb = this.state.mybookings;
    var last = mb[mb.length - 1];
    this.setState({ loadingmodal: true });
    var tt = this;
    fetch(API + "/formal_remove_booking", {
      method: "post", credentials: 'include',
      body: JSON.stringify({
        fid: this.state.event.extendedProps.ID,
        id: last.id
      })
    })
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        tt.setState({ loadingmodal: false });
        console.log(data);
        if (data.status == 0) {
          // update booking
          var cevents = tt.state.calendarEvents;
          var ev = null;
          for (var a of cevents) {
            if (a.ID == tt.state.event.extendedProps.ID) {
              a.booked = data.b;
              ev = a;
            }
          }
          tt.setState({ calendarEvents: cevents }, function() {
            console.log(tt.calRef.current);
            console.log(cevents);
            tt.calRef.current
              .getApi()
              .getEventSources()[0]
              .refetch();
            tt.actualGoto();
          });
        } else {
          // show error in data.msg
          tt.setState({
            msg: {
              title: "Error",
              body: "<p>" + data.msg + "</p>",
              closeMsg: "Ok",
              open: true
            }
          });
        }
      })
      .catch(function() {
        tt.setState({ loadingmodal: false });
      });
    // save then finish
    // this.setState({ mybookings: mb}, this.updateButtons)
  }

  updateButtons() {
    var noadd = false,
      noremove = false,
      noedit = false,
      mb = this.state.mybookings;
    if (mb.length >= this.state.event.extendedProps.guestlim + 1) {
      noadd = true;
    }
    if (mb.length == 0) {
      noremove = true;
      noedit = true;
    }
    if (this.state.editingSeat) {
      noedit = true;
      noadd = true;
      noremove = true;
    }
    if (this.state.editingBooking) {
      noadd = true;
      noremove = true;
    }
    var remain =
      this.state.event.extendedProps.places -
      this.state.event.extendedProps.booked.length;
    if (remain <= 0) {
      noadd = true;
    }
    // save then finish
    this.setState({ noadd: noadd, noremove: noremove, noedit: noedit });
  }

  showAttendees() {
    var list = "";
    var i = 0;
    console.log(this.state.event.extendedProps.booked);
    if (this.state.event.extendedProps.booked.length == 0) {
      list = [{ summary: "No bookings for this formal yet! You should go!" }];
    } else {
      list = [];
      var group = [];
      for (var a of this.state.event.extendedProps.booked) {
        if (a.type == "owner") {
          list.push({
            summary: (
              <div className="summary">
                <a className="summary" href={"/u/" + a.crsid}>
                  {sanitizeHtml(a.firstname + " " + a.lastname)}
                </a>
              </div>
            ),
            meta:
              group.length > 0 ? (
                "+ " + group.length + " guests"
              ) : (
                <span />
              ) /*, image: "https://mcr.caths.cam.ac.uk/api/pic/" + a.crsid.toLowerCase()*/
          });
          group = [];
        } else if (a.crsid != "MCRa" && a.crsid != "MCRb") {
          group.push(a);
        }
      }

      group = [];
      for (var a of this.state.event.extendedProps.booked) {
        if (a.crsid == "MCRa" || a.crsid == "MCRb") {
          group.push(a);
        }
      }
      list.push({
        summary: group.length > 0 ? "+ " + group.length + " MCR guests" : ""
      });
    }

    this.setState({
      msg: {
        title:
          this.state.event.title +
          " on " +
          this.state.event.start.toLocaleDateString(),
        body:
          "<p><b>Total attendees: " +
          this.state.event.extendedProps.booked.length +
          "</b></p>",
        el: <Feed events={list} />,
        closeMsg: "Dismiss",
        open: true
      }
    });
  }

  isBooked() {
    return this.isCrsidPresent(this.state.event.extendedProps.booked);
  }

  getInSameQuarter(a, dd) {
    var d = new Date(dd), d2 = new Date(a);
    var q1 = Math.floor(d.getMonth() / 3), q2 = Math.floor(d2.getMonth() / 3);
    return d.getFullYear() == d2.getFullYear() && q1 == q2;
  }

  renderPrice(bool) {
    // check for if booked once already this term
    var entitledToFree = false
    
    var y = new Date(this.state.event.start).getFullYear()
    var m = new Date(this.state.event.start).getMonth()

    if ( (y == 2020 && m >= 9) || (y == 2021 && m < 9)) // only for 2020/21
      entitledToFree = true

    var cevents = this.state.calendarEvents;
    var freeId = -1;
    for (var a of cevents) {
      var d = a.date;

      if (this.getInSameQuarter(d, this.state.event.start)) { // if this term
        if(this.isCrsidPresent(a.booked)) { // had a booking before and not this one
          entitledToFree = false
          if(freeId == -1 ) freeId = a.ID
        }
      }
    }
    if(freeId == this.state.event.extendedProps.ID) {
      entitledToFree = true;
    }

    if(bool) {
      return !entitledToFree
    }

    // otherwise
    if (this.state.mybookings.length > 0) {
      var totals = 0;
      totals += parseFloat(this.state.event.extendedProps.price);
      totals +=
        (parseFloat(this.state.event.extendedProps.price) +
          parseFloat(this.state.event.extendedProps.gcharge)) *
        (this.state.mybookings.length - 1);
        if(entitledToFree) {
          totals = 0
        }
        return (
          <Header.Subheader style={{ fontWeight: "bold" }}>
            Your total: £{totals.toFixed(2)}
          </Header.Subheader>
        );
    } else {
      return "";
    }
  }

  renderSidebar() {
    if (this.state.page == 0) {
      return (
        <div>
          <Header as="h2">
            Instructions
            <Header.Subheader>
              Though you probably know how to use this anyway...
            </Header.Subheader>
          </Header>
          <div style={{ textAlign: "justify" }}>
            <p>Click on a formal name to create/view your booking.</p>
            <p>
              The status of a formal must be Open for you to create/edit/delete
              your booking. Contact the formal hall officer otherwise.
            </p>
            <p>
              If you require more guests than the usual limit, contact the
              formal hall officer.
            </p>
          </div>
          <Header as="h2">
            Misc
            <Header.Subheader>
              In case you have any problems!
            </Header.Subheader>{" "}
          </Header>
          {this.state.fOfficer[0] != "" ? (
            <p>
              Your formal officer is:
              <br />
              <a href={this.state.fOfficer[1]}>
                <b>{this.state.fOfficer[0]}</b>
              </a>
              .
            </p>
          ) : (
            ""
          )}
          <Button onClick={() => this.showRules()}>Formal Hall Rules</Button>
          <br />
          <Button
            onClick={() =>
              (window.location.href =
                "http://www.caths.cam.ac.uk/students/hall-and-dining")
            }
          >
            Student Hall Menus
          </Button>
          <br />
          <Button onClick={() => this.setState({ open: true })}>
            Re-open tour
          </Button>
        </div>
      );
    } else if (this.state.page == 1) {
      return (
        <div>
          {this.state.event.extendedProps.status == "Open" ? (
            <div style={{ marginBottom: "25px" }} className="onlybig">
              <Fab
                variant="extended"
                color="primary"
                aria-label="Add"
                className={this.isBooked() ? "" : "fabbook"}
                disabled={this.isBooked()}
                onClick={() => this.addBooking()}
              >
                {this.isBooked() ? (
                  <div>
                    <DoneIcon />
                    Booked!
                  </div>
                ) : (
                  <div>
                    <AddIcon />
                    Book Now!
                  </div>
                )}
              </Fab>
            </div>
          ) : (
            ""
          )}

          <Statistic.Group size="tiny">
            <Statistic color={this.getEventColor()}>
              <Statistic.Label>status</Statistic.Label>
              <Statistic.Value>
                {this.state.event.extendedProps.status}
              </Statistic.Value>
            </Statistic>
          </Statistic.Group>
          <Statistic.Group size="tiny">
            <Statistic style={{ margin: "0 0 0 1.5em" }}>
              <Statistic.Value>
                <CountUp
                  end={this.state.event.extendedProps.places}
                  duration={0.75}
                />
              </Statistic.Value>
              <Statistic.Label>capacity</Statistic.Label>
            </Statistic>
            <Statistic>
              <Statistic.Value>
                <CountUp
                  end={this.state.event.extendedProps.booked.length}
                  duration={0.75}
                />
              </Statistic.Value>
              <Statistic.Label>going</Statistic.Label>
            </Statistic>
            <Statistic>
              <Statistic.Value>
                <CountUp
                  end={
                    this.state.event.extendedProps.places -
                    this.state.event.extendedProps.booked.length
                  }
                  duration={0.75}
                />
              </Statistic.Value>
              <Statistic.Label>places left</Statistic.Label>
            </Statistic>
          </Statistic.Group>
          <br />
          <br />
          <Button onClick={() => this.showAttendees()}>
            <span className="fa fa-search" /> &nbsp; &nbsp;{" "}
            {this.state.event.start < new Date() ? "Who went?" : "Who's going?"}
          </Button>
          <Button
            target="_blank"
            href={
              this.state.event
                ? "http://www.google.com/calendar/render?action=TEMPLATE&text=" +
                  this.state.event.title +
                  "&dates=" +
                  this.state.event.start
                    .toISOString()
                    .split("-")
                    .join("")
                    .split(".000")
                    .join("")
                    .split(":")
                    .join("") +
                  "/" +
                  this.state.event.start
                    .toISOString()
                    .split("-")
                    .join("")
                    .split(".000")
                    .join("")
                    .split(":")
                    .join("")
                    .split("T18")
                    .join("T20")
                    .split("T19")
                    .join("T21") +
                  "&ctz=Europe/London&details=Formal+Hall&location=St+Catharines+College,+Cambridge&trp=false&sprop=&sprop=name:"
                : ""
            }
          >
            <span className="fa fa-calendar" /> &nbsp; &nbsp;Add to calendar
          </Button>

          <Header as="h2">
            Your bookings
            <Header.Subheader>
              {this.state.event.extendedProps.status == "Closed"
                ? this.isBooked()
                  ? "View your booking for this formal below."
                  : "No booking found for this formal."
                : this.state.event.extendedProps.status == "Open"
                ? this.state.event.extendedProps.places -
                    this.state.event.extendedProps.booked.length <=
                    0 && !this.isBooked()
                  ? "Aw snap, looks like this event has sold out!"
                  : "Manage/edit your booking for this formal below."
                : "Not yet taking bookings. Check back soon!"}
            </Header.Subheader>
          </Header>

          {this.state.event.extendedProps.status == "Open" ? (
            <div>
              <Button
                onClick={() => this.addBooking()}
                disabled={this.state.noadd}
              >
                <span class="fa fa-plus" />
              </Button>
              {this.state.editingBooking ? (
                <div style={{ display: "inline-block" }}>
                  <Button
                    onClick={() => this.toggleEditBooking()}
                    color="primary"
                    variant="contained"
                    disabled={this.state.noedit}
                  >
                    <span class="fa fa-save" />
                  </Button>
                </div>
              ) : (
                <div style={{ display: "inline-block" }}>
                  <Button
                    onClick={() => this.toggleEditBooking()}
                    disabled={this.state.noedit}
                  >
                    <span class="fa fa-pencil" />
                  </Button>
                </div>
              )}
              <Button
                onClick={() => this.removeBooking()}
                disabled={this.state.noremove}
              >
                <span class="fa fa-minus" />
              </Button>
            </div>
          ) : (
            ""
          )}

          <List
            divided
            size="massive"
            verticalAlign="middle"
            style={{ textAlign: "left", width: "fit-content" }}
          >
            {this.state.mybookings.map(item => (
              <List.Item key={item.id} style={{ animation: "greenfade 0.4s ease" }}>
                <Image avatar src={item.img} />
                <List.Content>
                  {this.state.editingBooking ? (
                    <Header as="h3">
                      {item.type == "owner" ? (
                        item.guestname
                      ) : (
                        <TextField
                          class="names"
                          data-id={item.id}
                          placeholder="Name of your guest"
                          defaultValue={item.guestname}
                        />
                      )}
                      <Header.Subheader>
                        <TextField
                          class="diets"
                          data-id={item.id}
                          placeholder="Any dietaries?"
                          defaultValue={item.diets}
                        />
                      </Header.Subheader>
                    </Header>
                  ) : (
                    <Header as="h3">
                      {item.guestname}
                      <Header.Subheader>{item.diets}</Header.Subheader>
                    </Header>
                  )}
                </List.Content>
              </List.Item>
            ))}
          </List>

          <Header as="h2">
            Seating requests
            {this.state.event.extendedProps.seatplan == "" ? (
              <Header.Subheader>Not available for this event.</Header.Subheader>
            ) : this.state.event.extendedProps.status == "Upcoming" ? (
              <Header.Subheader>
                Seating requests will be allowed for this formal.
              </Header.Subheader>
            ) : this.isBooked() ? (
              <Header.Subheader>
                {" "}
                {(this.state.mybookings.length > 0 &&
                  this.state.mybookings[0].seat != "") ||
                this.state.event.extendedProps.status == "Open"
                  ? "We will try our best to accomodate!"
                  : "No requests made. We will still put you somewhere nice, don't worry!"}{" "}
              </Header.Subheader>
            ) : (
              <Header.Subheader>
                You can enter seating requests to this event if you have a
                booking.
              </Header.Subheader>
            )}
          </Header>

          {this.state.event.extendedProps.status == "Open" &&
          this.isBooked() &&
          this.state.event.extendedProps.seatplan == "Y" ? (
            <div>
              {" "}
              {this.state.editingSeat ? (
                <div>
                  <Button
                    onClick={() => this.toggleEditingSeat()}
                    style={{ marginBottom: "5px" }}
                    color="primary"
                    variant="contained"
                  >
                    <span class="fa fa-save" />
                  </Button>
                  <br />
                  <Input
                    id="seatreq"
                    placeholder="Enter seating request here."
                    defaultValue={this.state.mybookings[0].seat}
                  />
                </div>
              ) : (
                <div>
                  <Button
                    onClick={() => this.toggleEditingSeat()}
                    style={{ marginBottom: "5px" }}
                  >
                    <span class="fa fa-pencil" />
                  </Button>
                  <br />
                  <p style={{ padding: "5px" }}>
                    {this.state.mybookings.length > 0
                      ? this.state.mybookings[0].seat
                      : ""}
                  </p>
                </div>
              )}
            </div>
          ) : (
            ""
          )}
          <p>
            {this.state.mybookings.length > 0 &&
            this.state.mybookings[0].seat != "" &&
            this.state.event.extendedProps.status == "Closed"
              ? this.state.mybookings[0].seat
              : ""}
          </p>

          <Header as="h2">
            Price
            {this.renderPrice(true) ? 
            <Header.Subheader>
              For you: £
              {parseFloat(this.state.event.extendedProps.price).toFixed(2)}
            </Header.Subheader>
            : 
            <Header.Subheader>
              For you: £0.00 (one free formal once per term)
            </Header.Subheader>
             }
            {this.state.event.extendedProps.guestlim > 0 ? (
              <Header.Subheader>
                Guest surcharge: £
                {parseFloat(this.state.event.extendedProps.gcharge).toFixed(2)}
              </Header.Subheader>
            ) : (
              <Header.Subheader>
                No guest tickets allowed for this one, sorry!
              </Header.Subheader>
            )}
            {this.renderPrice()}
          </Header>
        </div>
      );
    }
    return "";
  }

  conditionalRenderFancyMenu(){
    return (
      <div>
         <FormGroup row 
        style={{ justifyContent: "flex-end" }}>
      <FormControlLabel
        control={
          <Checkbox
            checked={this.state.textchoice}
            onChange={(event) => { this.setState({textchoice: !this.state.textchoice}) }}
            value="checkedB"
            color="primary"
          />
        }
        label="Text only"
        />
      </FormGroup>

        { this.state.textchoice ? (
                        <Paper elevation={1} style={{ padding: "20px" }}>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: this.renderEventMenu()
                            }}
                          />
                        </Paper>
          ) : this.renderExtendedMenu()
        }
      </div>
    )
  }

  renderExtendedMenu() {
    var data = JSON.parse(this.state.event.extendedProps.ext_description);
    return (
      <div>
        <Paper elevation={1} style={{ padding: "20px" }}>
          {data.info.split("\n").map(function(item, key) {
            return (
              <span key={key}>
                {item}
                <br />
              </span>
            );
          })}
        </Paper>
        {data.starters ? (
          <div style={{ marginTop: "20px" }}>
            <Header style={{ color: "#999", marginBottom: "20px" }}>
              STARTERS
            </Header>
            <Grid container spacing={0} alignItems="center" justify="center">
              {data.starters.map(item => (
                <Grid item xs={item[0] == "OR" ? 1 : 4}>
                  {item[0] == "OR" ? (
                    "OR"
                  ) : (
                    <Card>
                      <CardActionArea>
                        {item[0] == "" ? (
                          ""
                        ) : (
                          <CardMedia
                            component="img"
                            height="140"
                            image={item[0]}
                          />
                        )}
                        <CardContent>
                          <Typography gutterBottom variant="h5" component="h2">
                            {item[1]}
                          </Typography>
                          {item[2]}
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  )}
                </Grid>
              ))}
            </Grid>
          </div>
        ) : (
          ""
        )}

        {data.main1 ? (
          <div style={{ marginTop: "20px" }}>
            <Header style={{ color: "#999", marginBottom: "20px" }}>
              MAINS
            </Header>
            <Grid container spacing={16} alignItems="center" justify="center">
              {data.main1.map(item => (
                <Grid item xs={item[0] == "OR" ? 1 : 4}>
                  {item[0] == "OR" ? (
                    "OR"
                  ) : (
                    <Card>
                      <CardActionArea>
                        {item[0] == "" ? (
                          ""
                        ) : (
                          <CardMedia
                            component="img"
                            height="140"
                            image={item[0]}
                          />
                        )}
                        <CardContent>
                          <Typography gutterBottom variant="h5" component="h2">
                            {item[1]}
                          </Typography>
                          {item[2]}
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  )}
                </Grid>
              ))}
            </Grid>
          </div>
        ) : (
          ""
        )}

        {data.main2 ? (
          <div style={{ marginTop: "20px" }}>
            <Grid container spacing={4} alignItems="center" justify="center">
              <Grid item xs={4}>
                WITH
              </Grid>
            </Grid>
            <Grid
              container
              spacing={16}
              alignItems="center"
              justify="center"
              style={{
                alignItems: "stretch",
                marginTop: "20px"
              }}
            >
              {data.main2.map(item => (
                <Grid item xs={item[0] == "OR" ? 1 : 4}>
                  {item[0] == "OR" ? (
                    "OR"
                  ) : (
                    <Card>
                      <CardActionArea>
                        {item[0] == "" ? (
                          ""
                        ) : (
                          <CardMedia
                            component="img"
                            height="140"
                            image={item[0]}
                          />
                        )}
                        <CardContent>
                          <Typography gutterBottom variant="h5" component="h2">
                            {item[1]}
                          </Typography>
                          {item[2]}
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  )}
                </Grid>
              ))}
            </Grid>{" "}
          </div>
        ) : (
          ""
        )}

        {data.dessert ? (
          <div style={{ marginTop: "20px" }}>
            <Header style={{ color: "#999", marginBottom: "20px" }}>
              DESSERTS
            </Header>
            <Grid
              container
              spacing={16}
              alignItems="center"
              justify="center"
              style={{
                alignItems: "stretch"
              }}
            >
              {data.dessert.map(item => (
                <Grid item xs={item[0] == "OR" ? 1 : 4}>
                  {item[0] == "OR" ? (
                    "OR"
                  ) : (
                    <Card>
                      <CardActionArea>
                        {item[0] == "" ? (
                          ""
                        ) : (
                          <CardMedia
                            component="img"
                            height="140"
                            image={item[0]}
                          />
                        )}
                        <CardContent>
                          <Typography gutterBottom variant="h5" component="h2">
                            {item[1]}
                          </Typography>
                          {item[2]}
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  )}
                </Grid>
              ))}
            </Grid>
          </div>
        ) : (
          ""
        )}

        {data.after ? (
          <div style={{ marginTop: "20px" }}>
            <Header style={{ color: "#999", marginBottom: "20px" }}>
              AFTER DINNER
            </Header>
            <Grid
              container
              spacing={16}
              alignItems="center"
              justify="center"
              style={{
                alignItems: "stretch"
              }}
            >
              {data.after.map(item => (
                <Grid item xs={item[0] == "OR" ? 1 : 4}>
                  {item[0] == "OR" ? (
                    "OR"
                  ) : (
                    <Card>
                      <CardActionArea>
                        {item[0] == "" ? (
                          ""
                        ) : (
                          <CardMedia
                            component="img"
                            height="140"
                            image={item[0]}
                          />
                        )}
                        <CardContent>
                          <Typography gutterBottom variant="h5" component="h2">
                            {item[1]}
                          </Typography>
                          {item[2]}
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  )}
                </Grid>
              ))}
              <Header
                style={{ color: "#999", marginBottom: "20px", fontSize: "92%" }}
              >
                Images are for representation only and may not reflect the
                actual food at formal.
              </Header>
            </Grid>
          </div>
        ) : (
          ""
        )}
      </div>
    );
  }

  render() {
    return (
      <div>
        <Router>
          <LoadingOverlay
            active={this.state.loadingmodal}
            spinner
            text="Working on it..."
          >
            <Navbar expand="md" style={{ background: "#8e2420" }}>
              <Container>
                <Row style={{ width: "100%" }} className="navbartop">
                  <Col>
                    <NavbarBrand href="/">
                      <img src={wheel} />
                    </NavbarBrand>
                  </Col>
                  <Col>
                    <NavbarToggler
                      onClick={this.toggle}
                      style={{
                        float: "right",
                        color: "white",
                        height: "40px",
                        position: "relative",
                        left: "20px"
                      }}
                      className="fa fa-bars"
                    />
                    <Collapse
                      isOpen={this.state.isOpen}
                      navbar
                      style={{ clear: "both" }}
                    >
                      <Nav className="ml-auto" navbar>
                        <NavItem>
                          <NavLink href="/">Back to main site</NavLink>
                        </NavItem>
                        {this.adminButton()}
                      </Nav>
                    </Collapse>
                  </Col>
                </Row>
              </Container>
            </Navbar>
            <Jumbotron
              style={{
                background: "#a62a25",
                color: "white",
                borderRadius: "0"
              }}
            >
              <Container>
                <Row>
                  <Col>
                    <h1>MCR Formals</h1>
                  </Col>
                </Row>
              </Container>
            </Jumbotron>
            <Container>
              <Row
                style={{
                  display: this.state.loading == true ? "flex" : "none",
                  textAlign: "center"
                }}
              >
                <Col style={{ minHeight: "60vh" }}>
                  <ClipLoader
                    css={{ margin: "20vh auto" }}
                    sizeUnit={"px"}
                    size={150}
                    color={"rgb(166, 42, 37)"}
                    loading={this.state.loading}
                  />
                </Col>
              </Row>
              <Row
                style={{
                  display: this.state.loading == false ? "flex" : "none"
                }}
              >
                <Col
                  md="9"
                  style={{ display: this.state.page == 0 ? "block" : "none" }}
                >
                  <FullCalendar
                    ref={this.calRef}
                    defaultView="listMonth"
                    themeSystem="bootstrap"
                    header={{
                      right: "today prev,next",
                      left: "title"
                    }}
                    buttonText={{
                      today: "This month"
                    }}
                    eventRender={info => {
                      if (info.event.start < new Date()) {
                        info.el.className += " old";
                      }
                      if (info.event.extendedProps.status == "Upcoming") {
                        info.el.className += " upcoming";
                      }
                      var toInject = [];
                      if (info.event.extendedProps.booked) {
                        toInject.push(
                          this.isCrsidPresent(info.event.extendedProps.booked)
                            ? '<span class="fa fa-check"></span>'
                            : ""
                        );

                        if (window.innerWidth > 794) {
                          toInject.push(info.event.extendedProps.places);
                        }
                        if (info.event.extendedProps.status == "Open")
                          toInject.push(
                            info.event.extendedProps.places -
                              info.event.extendedProps.booked.length
                          );
                        else toInject.push("");
                      }
                      for (var i = 0; i < toInject.length; i++) {
                        jQuery(info.el).append("<td>" + toInject[i] + "</td>");
                      }
                    }}
                    datesRender={info => {
                      if (this.state.calendarEvents.length > 1) {
                        var cols = ["Booked?", "Capacity", "Remaining"];

                        if (window.innerWidth < 794) {
                          cols = ["Booked?", "Remaining"];
                        }
                        var cstr = "";
                        for (var i = 0; i < cols.length; i++) {
                          cstr +=
                            '<td class="table-active maxw" colspan="1"><span class="fc-list-heading-main">' +
                            cols[i] +
                            "</span></td>";
                        }

                        jQuery(".table-active").attr(
                          "colspan",
                          3 + cols.length
                        );
                        jQuery(jQuery(".fc-list-heading")[0]).append(cstr);
                        jQuery(
                          jQuery(jQuery(".fc-list-heading")[0]).children()[0]
                        ).attr("colspan", 3);
                      } else {
                        jQuery(
                          ".fc-list-heading-main, .fc-list-item-time"
                        ).html("&nbsp;");
                      }
                    }}
                    eventClick={info => {
                      window.history.pushState(
                        "object or string",
                        "Formal",
                        "#/" + info.event.extendedProps.ID
                      );

                      this.loadEvent(info.event, true);
                    }}
                    listDayAltFormat={false}
                    plugins={[listPlugin, bootstrapPlugin]}
                    events={this.state.calendarEvents}
                    noEventsMessage="No formals scheduled here yet!"
                  />
                </Col>
                <Col
                  md="9"
                  style={{
                    display: this.state.page == 1 ? "block" : "none",
                    textAlign: "center"
                  }}
                >
                  <Row>
                    <Col xs="1" style={{ position: "absolute" }}>
                      <Button
                        onClick={() => {
                          this.setState({ page: 0 });
                          window.history.pushState(
                            "object or string",
                            "Formal",
                            "#/"
                          );
                        }}
                        style={{ zIndex: 10 }}
                      >
                        <span
                          className="fa fa-arrow-left fa-2x"
                          style={{ padding: "3px 8px" }}
                        />
                      </Button>
                    </Col>
                    <Col>
                      {this.renderEventTitle()}
                      <br />

                      {this.state.event &&
                      this.state.event.extendedProps.status == "Open" ? (
                        <div
                          style={{ marginBottom: "25px" }}
                          className="onlysmall"
                        >
                          <Fab
                            variant="extended"
                            color="primary"
                            aria-label="Add"
                            className={this.isBooked() ? "" : "fabbook"}
                            disabled={this.isBooked()}
                            onClick={() => this.addBooking()}
                          >
                            {this.isBooked() ? (
                              <div>
                                <DoneIcon />
                                Booked!
                              </div>
                            ) : (
                              <div>
                                <AddIcon />
                                Book Now!
                              </div>
                            )}
                          </Fab>
                        </div>
                      ) : (
                        ""
                      )}

                      {this.state.event &&
                      this.state.event.extendedProps.ext_description ? (
                        this.conditionalRenderFancyMenu()
                      ) : (
                        <Paper elevation={1} style={{ padding: "20px" }}>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: this.renderEventMenu()
                            }}
                          />
                        </Paper>
                      )}
                    </Col>
                  </Row>
                </Col>
                <Col md="3" className="sidebar">
                  <center>{this.renderSidebar()}</center>
                </Col>
              </Row>
            </Container>
            <br />
            <br />
            <AutoRotatingCarousel
              label="Get started"
              open={this.state.open}
              onClose={() => {
                this.setState({ open: false });
                this.startUsing();
              }}
              onStart={() => {
                this.setState({ open: false });
                this.startUsing();
              }}
              autoplay={false}
              style={{ position: "absolute" }}
            >
              <Slide
                media={<img src={welcome} />}
                mediaBackgroundStyle={{ backgroundColor: "rgb(166, 42, 37)" }}
                style={{ backgroundColor: "rgb(142, 36, 32)" }}
                title="Welcome."
                subtitle="To the all-new formal booking system."
              />
              <Slide
                media={<img src={calendar} />}
                mediaBackgroundStyle={{ backgroundColor: blue[400] }}
                style={{ backgroundColor: blue[600] }}
                title="Browse with a calendar"
                subtitle="The upcoming formals are organised by date. We'll even add them to your calendar if you'd like."
              />
              <Slide
                media={<img src={plant} />}
                mediaBackgroundStyle={{ backgroundColor: green[400] }}
                style={{ backgroundColor: green[600] }}
                title="Plant power."
                subtitle="We will remember your dietary preferences for next time so you don't need to keep entering it in."
              />
              <Slide
                media={<img src={handshake} />}
                mediaBackgroundStyle={{ backgroundColor: blue[400] }}
                style={{ backgroundColor: blue[600] }}
                title="Go with friends."
                subtitle="Tag your friends to a formal. We will prod them to book on too!"
              />
            </AutoRotatingCarousel>

            <Dialog
              open={this.state.msg.open}
              scroll="paper"
              style={{ zIndex: 130000000 }}
              onClose={this.handleCloseModal}
              aria-labelledby="scroll-dialog-title"
            >
              <DialogTitle id="scroll-dialog-title">
                {this.state.msg.title}
              </DialogTitle>
              <DialogContent>
                <DialogContentText>
                  <div
                    dangerouslySetInnerHTML={{ __html: this.state.msg.body }}
                  />
                  {this.state.msg.el ? this.state.msg.el : ""}
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={this.handleCloseModal} color="primary">
                  {this.state.msg.closeMsg}
                </Button>
                { this.state.msg.denyMsg ? (
                    
                <Button onClick={this.handleCloseModalN} color="secondary">
                  {this.state.msg.denyMsg}
                </Button>
                  ) : '' }
              </DialogActions>
            </Dialog>


            <Dialog
              open={this.state.seatingPrompt}
              scroll="paper"
              style={{ zIndex: 130000000 }}
              onClose={this.handleCloseModalSeating}
              aria-labelledby="scroll-dialog-title"
            >
              <DialogTitle id="scroll-dialog-title">
                Seating Requests
              </DialogTitle>
              <DialogContent>
                <DialogContentText>
                  This formal takes seating requests! Please enter them below.<br />
                  <Input
                    id="seatreq2"
                    placeholder="Enter seating request here."
                    defaultValue={this.state.mybookings && this.state.mybookings.length > 0 ? this.state.mybookings[0].seat : ''}
                  />
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={this.handleCloseModalSeating} color="primary">
                  Okay
                </Button>
              </DialogActions>
            </Dialog>

            <div className="ftr">
              Made with <span class="fa fa-heart" /> by{" "}
              <a href="https://github.com/souramoo">souradip</a>.
            </div>
          </LoadingOverlay>
        </Router>
      </div>
    );
  }
}

export default App;

