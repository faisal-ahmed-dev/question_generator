import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const Global = () => {
  return (
    <div className=''>
      <div className="">
        <Navbar/>
          <div className='container min-h-[300px] md:min-h-[400px] '>
            <Outlet/>
          </div>
        <Footer/>
      </div>
    </div>
  )
}

export default Global