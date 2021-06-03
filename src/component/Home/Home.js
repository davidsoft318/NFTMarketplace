import "./Home.css";
import React, { Component } from 'react'
import "../utils/metamaskButton"
import { OnboardingButton } from "../utils/metamaskButton";
export default class Home extends Component {

  render(){
  return (
    <>
    <div className='header'>
      Hello World!
      <a className='btn' href='/MrktPlace'> MrktPlace</a>

    </div>
    <div>
        < OnboardingButton/>
      </div>
    </>
   )
 }
}