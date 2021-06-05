import "./Home.css";
import React, { Component } from 'react'
import { OnboardingButton } from "../utils/metamaskButton";
export default class Home extends Component {

  render(){
  return (

    <div className='header'>
      Hello World!
      < OnboardingButton/>
    </div>

   )
 }
}