import React from 'react'
import Hero from '../components/Hero'
import FeaturedInvesment from '../components/FeaturedInvesment'
import MarketData from '../components/MarketData'
import Info from '../components/Info'
import HowItWorks from '../components/HowItWorks'
import Faq from '../components/Faq'
import Footer from '../components/Footer'

const Home = () => {
  return (
    <>
      <Hero />
      <FeaturedInvesment />
      <MarketData />
      <Info />
      <HowItWorks />
      <Faq />
      <Footer />
    </>
  )
}

export default Home
