import React, { Component } from "react";
import Home from "./component/Home/Home.js";
import MrktPlace from "./component/MrktPlace/MrktPlace.js";
import Navbar from "./component/utils/navbar/Navbar.js"
import Footer from "./component/footer/Footer.js"
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import "./App.css";
//import './App.css';

function App() {
  return (
    <Router>
        <Navbar />
        <Switch>
        <Route path='/' exact component={Home} />
        <Route path='/MrktPlace' component={MrktPlace} />
        </Switch>
        <Footer />
    </Router>
  );
}

export default App;

// class App extends Component {
//   constructor(props) {    
//     super(props);

//     this.state = {
//       route: window.location.pathname.replace("/", ""),
//     };
//   }


//   renderHome() {
//     return (
//       <div>
//         <Home />
//       </div>    
//     );
//   }

//   renderMrktPlace() {
//     return (
//       <div>
//         <MrktPlace />
//       </div>    
//     );
//   }

//   render() {
//     return (
//       <div>
//         < Navbar/>
//           {this.state.route === '' && this.renderHome()}
//           {this.state.route === 'MrktPlace' && this.renderMrktPlace()}
//       </div>
//     );
//   }
// }

// export default App;

