import React, { useEffect, useState, useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { motion, AnimatePresence } from "framer-motion";
import {
  SiTesla,
  SiSpacex,
  SiBitcoin,
  SiEthereum,
  SiSolana,
  SiDogecoin,
  SiBinance,
  SiCardano,
  SiRipple,
} from "react-icons/si";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { X } from "lucide-react";
import api from "../../../config/api";
import { userGetDashboardData } from "../../Services/authServices";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip);

const Investments = () => {
  const [investments, setInvestments] = useState([]);
  const [highlight, setHighlight] = useState({});
  const [selected, setSelected] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [countdowns, setCountdowns] = useState({});

  const cryptoList = ["bitcoin","ethereum","solana","dogecoin","binancecoin","cardano","ripple"];
  const cryptoColors = ["#F7931A","#627EEA","#9945FF","#C2A878","#F3BA2F","#0033AD","#00AAE4"];
  const cryptoIcons = {
    bitcoin: SiBitcoin,
    ethereum: SiEthereum,
    solana: SiSolana,
    dogecoin: SiDogecoin,
    binancecoin: SiBinance,
    cardano: SiCardano,
    ripple: SiRipple,
  };

  // Convert time to readable format
  const formatTime = (ms) => {
    if (ms <= 0) return "Completed";

    const h = Math.floor(ms / (1000 * 60 * 60));
    const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((ms % (1000 * 60)) / 1000);

    return `${h}h ${m}m ${s}s`;
  };

  // Countdown Effect
  useEffect(() => {
    const interval = setInterval(() => {
      const updated = {};

      investments.forEach((inv) => {
        if (inv.status === "approved" || inv.status === "active") {
          const created = new Date(inv.createdAt).getTime();
          const endTime = created + 24 * 60 * 60 * 1000; // 24 hours
          const remaining = endTime - Date.now();
          updated[inv._id] = formatTime(remaining);
        }
      });

      setCountdowns(updated);
    }, 1000);

    return () => clearInterval(interval);
  }, [investments]);


  const fetchInvestments = async () => {
    try {
      const data = await userGetDashboardData();

      const totalInvested = data.payments.reduce((a,b)=>a+(b.amount||0),0);
      const monthlyReturns = data.payments.filter(p=>p.status==="approved"||p.status==="completed").reduce((a,b)=>a+(b.profit||0),0);
      const activeAssets = data.payments.length;
      const growthRate = activeAssets ? ((monthlyReturns/totalInvested)*100).toFixed(1) : 0;

      setStatsData([
        { title: "Total Invested", value: `$${totalInvested.toLocaleString()}`, color: "#A72703" },
        { title: "Monthly Returns", value: `$${monthlyReturns.toLocaleString()}`, color: "#16A34A" },
        { title: "Active Assets", value: `${activeAssets}`, color: "#1D4ED8" },
        { title: "Growth Rate", value: `${growthRate}%`, color: "#EAB308" },
      ]);

      const investmentsData = data.payments.map(p => ({
        ...p,
        chartData: Array(7).fill(p.amount || 0),
        latestPrice: p.amount,
        roi: 0,
        trend: "neutral",
      }));

      setInvestments(investmentsData);
    } catch (err) {
      console.error("Error fetching investments:", err);
    }
  };

  const fetchMarketData = async () => {
    try {
      const updated = [...investments];
      await Promise.all(updated.map(async (inv)=>{
        if(inv.symbol==="Tesla"||inv.symbol==="SpaceX"){
          const symbol = inv.symbol==="Tesla"?"TSLA":"SPCE";
          const res = await api.get(`/api/market/stock?symbol=${symbol}`);
          const price = res.data.data.c;
          const delta = price - (inv.latestPrice || price);
          inv.trend = delta>0?"up":delta<0?"down":"neutral";
          inv.latestPrice = price;
          inv.roi = ((price-inv.amount)/inv.amount)*100;
          inv.chartData = [...(inv.chartData||[]),price].slice(-20);
          if(delta!==0){ setHighlight(prev=>({...prev,[inv.symbol]:true})); setTimeout(()=>setHighlight(prev=>({...prev,[inv.symbol]:false})),800); }
        }
      }));

      const cryptoIds = cryptoList.join(",");
      const cryptoRes = await api.get(`/api/market/crypto?ids=${cryptoIds}`);
      const prices = cryptoRes.data.data.prices;

      updated.forEach(inv=>{
        if(inv.symbol==="Crypto"){
          cryptoList.forEach(id=>{
            const price = prices[id]?.usd||0;
            if(!inv.chartData) inv.chartData=[];
            const delta = price-(inv.latestPrice||price);
            inv.trend = delta>0?"up":delta<0?"down":"neutral";
            inv.latestPrice = price;
            inv.roi = ((price-inv.amount)/inv.amount)*100;
            inv.chartData=[...inv.chartData,price].slice(-20);
            if(delta!==0){ setHighlight(prev=>({...prev,[id]:true})); setTimeout(()=>setHighlight(prev=>({...prev,[id]:false})),800);}
          });
        }
      });

      setInvestments(updated);
    } catch(err){
      console.error("Error fetching market data:",err);
    }
  };

  useEffect(()=>{ fetchInvestments(); }, []);
  useEffect(()=>{
    if(!investments.length) return;
    fetchMarketData();
    const interval = setInterval(fetchMarketData,30000);
    return ()=>clearInterval(interval);
  },[investments]);

  const chartOptions = {
    responsive:true,
    maintainAspectRatio:false,
    plugins:{legend:{display:false}},
    scales:{x:{display:false},y:{display:false}},
    animation:{duration:600,easing:"easeInOutCubic"}
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">My Investments</h1>
        <p className="text-gray-600">Track your active investments, market performance, and monthly growth.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData && statsData.map((s,i)=>(
          <div key={i} className="p-5 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500 text-sm">{s.title}</p>
            <p className="text-gray-800 font-semibold text-lg" style={{color:s.color}}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Investment Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {investments.map((inv,i)=>{
          const Icon = inv.symbol==="Tesla"?SiTesla:inv.symbol==="SpaceX"?SiSpacex:cryptoIcons[cryptoList[i%cryptoList.length]];
          const color = inv.symbol==="Tesla"?"#1D4ED8":inv.symbol==="SpaceX"?"#A72703":cryptoColors[i%cryptoColors.length];
          
          return(
            <motion.div key={i} onClick={()=>setSelected(inv)} className={`bg-white p-5 rounded-xl shadow-sm`}>
              
              {/* Top */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg" style={{backgroundColor:`${color}15`,color}}>
                    <Icon className="w-5 h-5"/>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{inv.symbol}</h3>
                    <p className="text-sm text-gray-500">Invested: ${inv.amount}</p>

                    {/* COUNTDOWN TIMER */}
                    {(inv.status === "approved" || inv.status === "active") && (
                      <p className="text-xs text-red-600 mt-1 font-semibold">
                        ⏳ {countdowns[inv._id] || "Loading..."}
                      </p>
                    )}
                  </div>
                </div>

                <div className={`flex items-center gap-1 text-sm font-semibold ${inv.trend==="up"?"text-green-600":inv.trend==="down"?"text-red-500":"text-gray-400"}`}>
                  {inv.trend==="up"?<FaArrowUp className="w-4 h-4"/>:inv.trend==="down"?<FaArrowDown className="w-4 h-4"/>:null}
                  <span>{inv.roi.toFixed(1)}%</span>
                </div>
              </div>

              {/* Chart */}
              <div className="h-28">
                <Line 
                  data={{
                    labels:Array(inv.chartData.length).fill(""),
                    datasets:[{
                      data:inv.chartData,
                      borderColor:color,
                      backgroundColor:`${color}20`,
                      fill:true,
                      tension:0.4
                    }]
                  }} 
                  options={chartOptions}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center">
            <motion.div className="bg-white w-[90%] max-w-lg rounded-2xl p-6 shadow-lg relative">
              <button onClick={()=>setSelected(null)} className="absolute top-4 right-4 text-gray-500">
                <X className="w-5 h-5"/>
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-gray-100 text-gray-700">
                  <SiTesla />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">{selected.symbol}</h2>
                  <p className="text-gray-500 text-sm">Investment Details</p>
                </div>
              </div>

              {/* Chart */}
              <div className="h-40 mb-4">
                <Line 
                  data={{
                    labels:Array(selected.chartData.length).fill(""),
                    datasets:[{
                      data:selected.chartData,
                      borderColor:"#1D4ED8",
                      backgroundColor:"#1D4ED020",
                      fill:true,
                      tension:0.4
                    }]
                  }}
                  options={chartOptions}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Invested</p>
                  <p className="font-medium text-gray-800">${selected.amount}</p>
                </div>
                <div>
                  <p className="text-gray-500">Profit</p>
                  <p className="font-medium text-green-600">${((selected.roi/100)*selected.amount).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-500">ROI</p>
                  <p className="font-medium text-green-600">{selected.roi.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <p className="font-medium text-gray-800">{selected.status}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Investments;
