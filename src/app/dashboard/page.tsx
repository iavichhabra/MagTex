"use client";

import { useEffect, useState } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { VULNVAULT_REGISTRY, VULNVAULT_ABI } from "@/lib/contracts";
import { Listing } from "@/types";
import { ReportCard } from "@/components/report-card";
import { BadgeDisplay } from "@/components/badge-display";
import { ConnectSocials } from "@/components/connect-socials";
import { Shield, DollarSign, FileText, BarChart3, TrendingUp, Users, ArrowUpRight, Percent } from "lucide-react";
import { getListingViews, fetchSellerSales, SaleEvent } from "@/lib/analytics-utils";

export default function Dashboard() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [activeTab, setActiveTab] = useState<"researcher" | "buyer" | "analytics">("researcher");
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [purchased, setPurchased] = useState<Listing[]>([]);
  const [sales, setSales] = useState<SaleEvent[]>([]);
  const [loadingSales, setLoadingSales] = useState(false);
  const [stats, setStats] = useState({
    reputation: 0n,
    earnings: 0n,
    tips: 0n,
  });

  // Analytics selections
  const [selectedReportId, setSelectedReportId] = useState<string>("all");
  const [funnelData, setFunnelData] = useState({ views: 0, interested: 0, approved: 0, purchased: 0 });
  const [earningsChartData, setEarningsChartData] = useState<{ label: string; amount: number; cumulative: number }[]>([]);
  const [globalAnalytics, setGlobalAnalytics] = useState({ totalViews: 0, totalSales: 0, conversion: 0, totalRevenue: 0 });

  // Funnel and Chart loaders
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!publicClient || !address) return;

      const [rep, earnings, tips] = await Promise.all([
        publicClient.readContract({
          address: VULNVAULT_REGISTRY,
          abi: VULNVAULT_ABI,
          functionName: "reputationScore",
          args: [address],
        }),
        publicClient.readContract({
          address: VULNVAULT_REGISTRY,
          abi: VULNVAULT_ABI,
          functionName: "totalEarnings",
          args: [address],
        }),
        publicClient.readContract({
          address: VULNVAULT_REGISTRY,
          abi: VULNVAULT_ABI,
          functionName: "totalTips",
          args: [address],
        }),
      ]);

      setStats({ reputation: rep, earnings, tips });

      const sellerIds = await publicClient.readContract({
        address: VULNVAULT_REGISTRY,
        abi: VULNVAULT_ABI,
        functionName: "getSellerListings",
        args: [address],
      });

      const buyerIds = await publicClient.readContract({
        address: VULNVAULT_REGISTRY,
        abi: VULNVAULT_ABI,
        functionName: "getBuyerListings",
        args: [address],
      });

      const fetchListings = async (ids: readonly bigint[]) => {
        const result: Listing[] = [];
        for (const id of ids) {
          const data = await publicClient.readContract({
            address: VULNVAULT_REGISTRY,
            abi: VULNVAULT_ABI,
            functionName: "listings",
            args: [id],
          });
          let metadata;
          try {
            const res = await fetch(
              `https://gateway.pinata.cloud/ipfs/${data[4]}`
            );
            metadata = await res.json();
          } catch {}
          result.push({
            id: Number(id),
            seller: data[0],
            ipId: data[1],
            cdrUUID: data[2],
            price: data[3],
            metadataURI: data[4],
            active: data[5],
            licenseTermsId: data[6],
            createdAt: data[7],
            metadata,
          });
        }
        return result;
      };

      const [sellerData, buyerData] = await Promise.all([
        fetchListings(sellerIds),
        fetchListings(buyerIds),
      ]);

      setMyListings(sellerData);
      setPurchased(buyerData);

      // Fetch sales logs
      setLoadingSales(true);
      const sellerListingIdsNumeric = sellerData.map((l) => l.id);
      const salesLogs = await fetchSellerSales(publicClient, address, sellerListingIdsNumeric);
      setSales(salesLogs);
      setLoadingSales(false);
    };

    fetchData();
  }, [publicClient, address]);

  // Handle analytics page calculations
  useEffect(() => {
    if (!publicClient || myListings.length === 0) return;

    const computeAnalytics = async () => {
      setLoadingAnalytics(true);
      
      let targetListingIds = myListings.map(l => l.id);
      if (selectedReportId !== "all") {
        targetListingIds = [Number(selectedReportId)];
      }

      // Calculate funnel metrics
      let totalViews = 0;
      let totalInterested = 0;
      let totalApproved = 0;
      let totalPurchased = 0;

      for (const id of targetListingIds) {
        totalViews += getListingViews(id);

        try {
          // On-chain expressed interest count
          const interested = await publicClient.readContract({
            address: VULNVAULT_REGISTRY,
            abi: VULNVAULT_ABI,
            functionName: "getInterestedBuyers",
            args: [BigInt(id)],
          });
          totalInterested += interested.length;

          // On-chain approved count (among the interested ones)
          for (const buyer of interested) {
            const isApproved = await publicClient.readContract({
              address: VULNVAULT_REGISTRY,
              abi: VULNVAULT_ABI,
              functionName: "whitelistedBuyers",
              args: [BigInt(id), buyer],
            });
            if (isApproved) {
              totalApproved++;
            }
          }
        } catch (e) {
          console.error("Error reading listing analytics:", id, e);
        }

        // On-chain purchases
        const purchases = sales.filter(s => s.listingId === id);
        totalPurchased += purchases.length;
      }

      setFunnelData({
        views: totalViews,
        interested: totalInterested,
        approved: totalApproved,
        purchased: totalPurchased,
      });

      // Calculate global analytics stats
      const totalRevenue = targetListingIds.reduce((sum, id) => {
        const listing = myListings.find(l => l.id === id);
        const lPurchases = sales.filter(s => s.listingId === id);
        return sum + (listing ? Number(listing.price) * lPurchases.length : 0);
      }, 0);

      setGlobalAnalytics({
        totalViews,
        totalSales: totalPurchased,
        conversion: totalViews > 0 ? (totalPurchased / totalViews) * 100 : 0,
        totalRevenue: totalRevenue / 1e18,
      });

      // Compute earnings over time data (last 7 days)
      const chartPoints = [];
      let cumulativeSum = 0;

      // Filter sales to selected ones
      const targetSales = sales.filter(s => targetListingIds.includes(s.listingId));

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const label = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
        
        // Find sales for this day
        const daySales = targetSales.filter(s => s.timestamp.toDateString() === d.toDateString());
        const dayAmount = daySales.reduce((acc, s) => acc + Number(s.amount) / 1e18, 0);

        cumulativeSum += dayAmount;

        chartPoints.push({
          label,
          amount: dayAmount,
          cumulative: cumulativeSum,
        });
      }

      setEarningsChartData(chartPoints);
      setLoadingAnalytics(false);
    };

    computeAnalytics();
  }, [publicClient, selectedReportId, myListings, sales]);

  if (!address) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <Shield className="mx-auto mb-4 h-12 w-12 text-vault-gray-600" />
        <p className="font-mono text-vault-gray-400">Connect wallet to view dashboard</p>
      </div>
    );
  }

  // Earnings SVG math
  const svgWidth = 500;
  const svgHeight = 200;
  const paddingLeft = 45;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 30;
  const plotWidth = svgWidth - paddingLeft - paddingRight;
  const plotHeight = svgHeight - paddingTop - paddingBottom;
  
  const maxCumulative = Math.max(...earningsChartData.map(d => d.cumulative), 1);
  const points = earningsChartData.map((d, i) => {
    const x = paddingLeft + (i / 6) * plotWidth;
    const y = svgHeight - paddingBottom - (d.cumulative / maxCumulative) * plotHeight;
    return { x, y, ...d };
  });

  const pathD = points.length > 0 
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ")
    : "";

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingBottom} L ${points[0].x} ${svgHeight - paddingBottom} Z`
    : "";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Profile summary card */}
      <div className="mb-8 border border-vault-gray-800 bg-vault-gray-950 p-6 rounded-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-vault-accent/5 to-transparent pointer-events-none" />

        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between relative z-10">
          <div>
            <h1 className="font-mono text-2xl font-bold text-vault-white tracking-wider">DASHBOARD</h1>
            <p className="mt-1 font-mono text-xs text-vault-gray-500">
              {address.slice(0, 6)}...{address.slice(-4)}
            </p>
            {/* Dynamic Social Connector */}
            <ConnectSocials />
          </div>
          <BadgeDisplay
            profile={{
              address,
              reputationScore: stats.reputation,
              totalEarnings: stats.earnings,
              totalTips: stats.tips,
              listings: myListings.map((l) => l.id),
              badges: [],
            }}
          />
        </div>

        {/* Global Statistics */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-vault-gray-800 pt-6">
          <div>
            <p className="font-mono text-2xl font-bold text-vault-white">
              {stats.reputation.toString()}
            </p>
            <p className="font-mono text-[9px] uppercase tracking-wider text-vault-gray-500">REPORTS FILED</p>
          </div>
          <div>
            <p className="font-mono text-2xl font-bold text-vault-accent">
              {sales.length}
            </p>
            <p className="font-mono text-[9px] uppercase tracking-wider text-vault-gray-500 font-bold">REPORTS SOLD</p>
          </div>
          <div>
            <p className="font-mono text-2xl font-bold text-vault-white">
              {(stats.earnings / 10n ** 18n).toString()} IP
            </p>
            <p className="font-mono text-[9px] uppercase tracking-wider text-vault-gray-500">TOTAL EARNINGS</p>
          </div>
          <div>
            <p className="font-mono text-2xl font-bold text-vault-white">
              {(stats.tips / 10n ** 18n).toString()} IP
            </p>
            <p className="font-mono text-[9px] uppercase tracking-wider text-vault-gray-500">TIPS RECEIVED</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 md:gap-4 border-b border-vault-gray-800 pb-px overflow-x-auto whitespace-nowrap scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        <button
          onClick={() => setActiveTab("researcher")}
          className={`border-b-2 px-6 py-3 font-mono text-xs font-bold tracking-wider uppercase transition-colors ${
            activeTab === "researcher"
              ? "border-vault-accent text-vault-accent"
              : "border-transparent text-vault-gray-500 hover:text-vault-white"
          }`}
        >
          RESEARCHER PROFILE
        </button>
        <button
          onClick={() => setActiveTab("buyer")}
          className={`border-b-2 px-6 py-3 font-mono text-xs font-bold tracking-wider uppercase transition-colors ${
            activeTab === "buyer"
              ? "border-vault-accent text-vault-accent"
              : "border-transparent text-vault-gray-500 hover:text-vault-white"
          }`}
        >
          PURCHASED REPORTS
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`border-b-2 px-6 py-3 font-mono text-xs font-bold tracking-wider uppercase transition-colors flex items-center gap-1.5 ${
            activeTab === "analytics"
              ? "border-vault-accent text-vault-accent"
              : "border-transparent text-vault-gray-500 hover:text-vault-white"
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          ANALYTICS DASHBOARD
        </button>
      </div>

      {/* Researcher listings tab */}
      {activeTab === "researcher" && (
        <div>
          <h2 className="mb-4 font-mono text-xs font-bold tracking-widest text-vault-white flex items-center gap-2 uppercase">
            <FileText className="h-4 w-4" />
            My Published Reports ({myListings.length})
          </h2>
          {myListings.length === 0 ? (
            <p className="font-mono text-xs text-vault-gray-600">No reports submitted yet</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myListings.map((l) => (
                <ReportCard key={l.id} listing={l} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Buyer listings tab */}
      {activeTab === "buyer" && (
        <div>
          <h2 className="mb-4 font-mono text-xs font-bold tracking-widest text-vault-white flex items-center gap-2 uppercase">
            <Shield className="h-4 w-4" />
            Purchased Access ({purchased.length})
          </h2>
          {purchased.length === 0 ? (
            <p className="font-mono text-xs text-vault-gray-600">No purchases yet</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {purchased.map((l) => (
                <ReportCard key={l.id} listing={l} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Analytics Dashboard tab */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Controls / Filter */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border border-vault-gray-800 bg-vault-gray-950 p-4 rounded-lg">
            <div>
              <h3 className="font-mono text-sm font-bold text-vault-white uppercase tracking-wider">Report Selector</h3>
              <p className="font-mono text-[10px] text-vault-gray-500">Filter your charts and stats by a specific listing</p>
            </div>
            
            <div className="relative">
              <select
                value={selectedReportId}
                onChange={(e) => setSelectedReportId(e.target.value)}
                className="appearance-none border border-vault-gray-800 bg-vault-black py-2 px-8 font-mono text-xs text-vault-white focus:border-vault-white focus:outline-none cursor-pointer rounded min-w-[200px]"
              >
                <option value="all">ALL REPORTS ({myListings.length})</option>
                {myListings.map(l => (
                  <option key={l.id} value={l.id}>
                    ID {l.id}: {l.metadata?.title?.slice(0, 20) || "Untitled"}...
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-vault-white" />
            </div>
          </div>

          {/* Stats overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Views card */}
            <div className="border border-vault-gray-800 bg-vault-gray-950 p-5 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-vault-gray-500 uppercase">VIEWS</span>
                <Users className="h-4 w-4 text-vault-gray-400" />
              </div>
              <p className="font-mono text-2xl font-bold text-vault-white">
                {loadingAnalytics ? "..." : globalAnalytics.totalViews}
              </p>
              <p className="font-mono text-[9px] text-vault-gray-600 mt-1 flex items-center gap-0.5">
                <ArrowUpRight className="h-3 w-3" /> Simulated base + local tracking
              </p>
            </div>

            {/* Sales card */}
            <div className="border border-vault-gray-800 bg-vault-gray-950 p-5 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-vault-gray-500 uppercase">SALES</span>
                <Shield className="h-4 w-4 text-vault-accent" />
              </div>
              <p className="font-mono text-2xl font-bold text-vault-accent">
                {loadingAnalytics ? "..." : globalAnalytics.totalSales}
              </p>
              <p className="font-mono text-[9px] text-vault-gray-600 mt-1 flex items-center gap-0.5">
                On-chain purchase events
              </p>
            </div>

            {/* Conversion card */}
            <div className="border border-vault-gray-800 bg-vault-gray-950 p-5 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-vault-gray-500 uppercase">CONVERSION</span>
                <Percent className="h-4 w-4 text-vault-gray-400" />
              </div>
              <p className="font-mono text-2xl font-bold text-vault-white">
                {loadingAnalytics ? "..." : `${globalAnalytics.conversion.toFixed(1)}%`}
              </p>
              <p className="font-mono text-[9px] text-vault-gray-600 mt-1">
                Views to purchase ratio
              </p>
            </div>

            {/* Revenue card */}
            <div className="border border-vault-gray-800 bg-vault-gray-950 p-5 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-vault-gray-500 uppercase">REVENUE</span>
                <DollarSign className="h-4 w-4 text-vault-gray-400" />
              </div>
              <p className="font-mono text-2xl font-bold text-vault-white">
                {loadingAnalytics ? "..." : `${globalAnalytics.totalRevenue} IP`}
              </p>
              <p className="font-mono text-[9px] text-vault-gray-600 mt-1">
                Accumulated from purchases
              </p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Interest Funnel chart */}
            <div className="border border-vault-gray-800 bg-vault-gray-950 p-6 rounded-lg">
              <h4 className="font-mono text-sm font-bold text-vault-white uppercase tracking-wider mb-2">Interest Funnel</h4>
              <p className="font-mono text-[10px] text-vault-gray-500 mb-6">Views → Interest → Whitelisted → Purchase Conversion</p>
              
              {loadingAnalytics ? (
                <div className="h-48 flex items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-vault-gray-800 border-t-vault-white" />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Views bar */}
                  <div>
                    <div className="flex justify-between font-mono text-[11px] mb-1">
                      <span className="text-vault-gray-400">1. VIEWS</span>
                      <span className="text-vault-white font-bold">{funnelData.views}</span>
                    </div>
                    <div className="h-6 w-full bg-vault-black border border-vault-gray-900 overflow-hidden relative flex items-center">
                      <div className="h-full bg-vault-gray-800 w-full" />
                      <span className="absolute left-2.5 font-mono text-[10px] text-vault-white font-bold">100%</span>
                    </div>
                  </div>

                  {/* Express Interest bar */}
                  <div>
                    <div className="flex justify-between font-mono text-[11px] mb-1">
                      <span className="text-vault-gray-400">2. EXPRESS INTEREST (ON-CHAIN)</span>
                      <span className="text-vault-white font-bold">{funnelData.interested}</span>
                    </div>
                    <div className="h-6 w-full bg-vault-black border border-vault-gray-900 overflow-hidden relative flex items-center">
                      <div 
                        className="h-full bg-vault-accent/30 border-r-2 border-vault-accent" 
                        style={{ width: `${funnelData.views > 0 ? (funnelData.interested / funnelData.views) * 100 : 0}%` }}
                      />
                      <span className="absolute left-2.5 font-mono text-[10px] text-vault-accent font-bold">
                        {funnelData.views > 0 ? ((funnelData.interested / funnelData.views) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </div>

                  {/* Approved bar */}
                  <div>
                    <div className="flex justify-between font-mono text-[11px] mb-1">
                      <span className="text-vault-gray-400">3. APPROVED WHITELISTS (ON-CHAIN)</span>
                      <span className="text-vault-white font-bold">{funnelData.approved}</span>
                    </div>
                    <div className="h-6 w-full bg-vault-black border border-vault-gray-900 overflow-hidden relative flex items-center">
                      <div 
                        className="h-full bg-vault-accent/50 border-r-2 border-vault-accent" 
                        style={{ width: `${funnelData.views > 0 ? (funnelData.approved / funnelData.views) * 100 : 0}%` }}
                      />
                      <span className="absolute left-2.5 font-mono text-[10px] text-vault-accent font-bold">
                        {funnelData.views > 0 ? ((funnelData.approved / funnelData.views) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </div>

                  {/* Purchased bar */}
                  <div>
                    <div className="flex justify-between font-mono text-[11px] mb-1">
                      <span className="text-vault-gray-400">4. COMPLETED PURCHASES (ON-CHAIN)</span>
                      <span className="text-vault-white font-bold">{funnelData.purchased}</span>
                    </div>
                    <div className="h-6 w-full bg-vault-black border border-vault-gray-900 overflow-hidden relative flex items-center">
                      <div 
                        className="h-full bg-vault-accent border-r-2 border-vault-white shadow-[0_0_10px_rgba(188,149,104,0.3)]" 
                        style={{ width: `${funnelData.views > 0 ? (funnelData.purchased / funnelData.views) * 100 : 0}%` }}
                      />
                      <span className="absolute left-2.5 font-mono text-[10px] text-black font-bold">
                        {funnelData.views > 0 ? ((funnelData.purchased / funnelData.views) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Earnings Chart */}
            <div className="border border-vault-gray-800 bg-vault-gray-950 p-6 rounded-lg">
              <h4 className="font-mono text-sm font-bold text-vault-white uppercase tracking-wider mb-2">Earnings Over Time</h4>
              <p className="font-mono text-[10px] text-vault-gray-500 mb-6">Cumulative Revenue (IP) over the last 7 days</p>

              {loadingAnalytics ? (
                <div className="h-48 flex items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-vault-gray-800 border-t-vault-white" />
                </div>
              ) : (
                <div className="relative">
                  <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} width="100%" className="overflow-visible">
                    <defs>
                      <linearGradient id="earnings-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#bc9568" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#bc9568" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((r, index) => {
                      const y = paddingTop + r * plotHeight;
                      const val = ((1 - r) * maxCumulative).toFixed(1);
                      return (
                        <g key={index} className="opacity-30">
                          <line
                            x1={paddingLeft}
                            y1={y}
                            x2={svgWidth - paddingRight}
                            y2={y}
                            stroke="#4b5563"
                            strokeWidth="0.5"
                            strokeDasharray="4 4"
                          />
                          <text
                            x={paddingLeft - 8}
                            y={y + 3}
                            className="font-mono text-[8px] fill-vault-gray-400 text-right"
                            textAnchor="end"
                          >
                            {val}
                          </text>
                        </g>
                      );
                    })}

                    {/* Area path */}
                    {areaD && (
                      <path d={areaD} fill="url(#earnings-grad)" />
                    )}

                    {/* Line path */}
                    {pathD && (
                      <path d={pathD} fill="none" stroke="#bc9568" strokeWidth="2.5" />
                    )}

                    {/* Data Points */}
                    {points.map((p, i) => (
                      <g key={i} className="group/point">
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r="4.5"
                          className="fill-vault-black stroke-vault-accent stroke-2 hover:r-6 cursor-pointer transition-all"
                        />
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r="9"
                          className="fill-vault-accent opacity-0 hover:opacity-10 cursor-pointer"
                        />
                        {/* Hover Tooltip inside SVG */}
                        <g className="opacity-0 group-hover/point:opacity-100 transition-opacity pointer-events-none">
                          <rect
                            x={p.x - 35}
                            y={p.y - 30}
                            width="70"
                            height="22"
                            rx="3"
                            fill="#0d0d0d"
                            stroke="#bc9568"
                            strokeWidth="0.75"
                          />
                          <text
                            x={p.x}
                            y={p.y - 16}
                            textAnchor="middle"
                            className="font-mono text-[8px] fill-vault-white font-bold"
                          >
                            {p.cumulative.toFixed(2)} IP
                          </text>
                        </g>
                      </g>
                    ))}

                    {/* X Axis Labels */}
                    {points.map((p, i) => (
                      <text
                        key={i}
                        x={p.x}
                        y={svgHeight - 10}
                        textAnchor="middle"
                        className="font-mono text-[8px] fill-vault-gray-500 uppercase"
                      >
                        {p.label}
                      </text>
                    ))}

                    {/* Bottom axis line */}
                    <line
                      x1={paddingLeft}
                      y1={svgHeight - paddingBottom}
                      x2={svgWidth - paddingRight}
                      y2={svgHeight - paddingBottom}
                      stroke="#374151"
                      strokeWidth="1"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
