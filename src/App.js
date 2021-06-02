import React, { Component } from "react";
import Home from "./component/Home/Home.js";
import MrktPlace from "./component/MrktPlace/MrktPlace.js";

//import './App.css';


class App extends Component {
  constructor(props) {    
    super(props);

    this.state = {
      route: window.location.pathname.replace("/", ""),
    };
  }


  renderHome() {
    return (
      <div>
        <Home />
      </div>    
    );
  }

  renderMrktPlace() {
    return (
      <div>
        <MrktPlace />
      </div>    
    );
  }

  render() {
    return (
      <div>
          {this.state.route === '' && this.renderHome()}
          {this.state.route === 'MrktPlace' && this.renderMrktPlace()}
      </div>
    );
  }
}

export default App;

