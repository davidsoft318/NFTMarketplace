import "./Home.css";
import React from 'react'

export default function Home() {
  return (
    <>
    <div className='header'>
      Hello World!
      <button className='btn'
    type="button"
    onClick={(e) => {
      e.preventDefault();
      window.location.href='/MrktPlace';
      }}
> MrktPlace</button>
    </div>
    </>
   )
}
