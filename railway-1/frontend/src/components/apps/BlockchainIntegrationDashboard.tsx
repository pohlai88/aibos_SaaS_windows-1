'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link, Shield, Vote, Coins, Database, Network, BarChart3, Plus, Settings, Activity,
  CheckCircle, AlertTriangle, Clock, TrendingUp, Star, Code, Globe, Lock, Zap
} from 'lucide-react';

import {
  blockchainIntegration,
  BlockchainType,
  TransactionStatus,
  SmartContractStatus,
  GovernanceStatus,
  TokenType,
  BlockchainNetwork,
  BlockchainTransaction,
  SmartContract,
  AIGovernance,
  AIToken,
  AIModelNFT,
  DecentralizedMarketplace,
  BlockchainMetrics
} from '@/lib/blockchain-integration';

interface BlockchainIntegrationDashboardProps {
  className?: string;
}

export default function BlockchainIntegrationDashboard({ className = '' }: BlockchainIntegrationDashboardProps) {
  const [blockchainMetrics, setBlockchainMetrics] = useState<BlockchainMetrics | null>(null);
  const [networks, setNetworks] = useState<BlockchainNetwork[]>([]);
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
  const [contracts, setContracts] = useState<SmartContract[]>([]);
  const [governance, setGovernance] = useState<AIGovernance[]>([]);
  const [tokens, setTokens] = useState<AIToken[]>([]);
  const [nfts, setNfts] = useState<AIModelNFT[]>([]);
  const [marketplaces, setMarketplaces] = useState<DecentralizedMarketplace[]>([]);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'networks' | 'transactions' | 'governance' | 'tokens' | 'marketplace' | 'create'>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(10000);

  const [networkForm, setNetworkForm] = useState({
    name: '',
    type: 'ethereum' as BlockchainType,
    chainId: 1,
    rpcUrl: '',
    explorerUrl: '',
    aiEnhanced: true,
    quantumResistant: false
  });

  useEffect(() => {
    initializeBlockchainData();
    const interval = setInterval(() => {
      if (autoRefresh) refreshBlockchainData();
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const initializeBlockchainData = useCallback(async () => {
    setIsLoading(true);
    try {
      await refreshBlockchainData();
    } catch (err) {
      console.error('Init error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshBlockchainData = useCallback(async () => {
    try {
      // Real API call to backend blockchain endpoint
      const response = await fetch('/api/blockchain-integration/metrics', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Blockchain API error: ${response.status}`);
      }

      const data = await response.json();
      setBlockchainMetrics(data.metrics);
      setNetworks(data.networks || []);
      setTransactions(data.transactions || []);
      setContracts(data.contracts || []);
      setGovernance(data.governance || []);
      setTokens(data.tokens || []);
      setNfts(data.nfts || []);
      setMarketplaces(data.marketplaces || []);
    } catch (err) {
      console.error('Blockchain API error:', err);
      // Set empty state on error
      setBlockchainMetrics(null);
      setNetworks([]);
      setTransactions([]);
      setContracts([]);
      setGovernance([]);
      setTokens([]);
      setNfts([]);
      setMarketplaces([]);
    }
  }, []);

  const createNetwork = useCallback(async () => {
    if (!networkForm.name || !networkForm.rpcUrl || !networkForm.explorerUrl) return;
    setIsLoading(true);
    try {
      // Real API call to create blockchain network
      const response = await fetch('/api/blockchain-integration/networks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(networkForm),
      });

      if (!response.ok) {
        throw new Error(`Create network API error: ${response.status}`);
      }

      const network = await response.json();
      setNetworks(prev => [...prev, network]);
      setNetworkForm({ name: '', type: 'ethereum', chainId: 1, rpcUrl: '', explorerUrl: '', aiEnhanced: true, quantumResistant: false });
      await refreshBlockchainData();
    } catch (err) {
      console.error('Create network API error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [networkForm, refreshBlockchainData]);

  const renderOverview = () => {
    if (!blockchainMetrics) {
      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-gray-900 p-12 rounded-lg border border-gray-700 text-center">
            <Link className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <h3 className="text-xl text-white mb-2">No Blockchain Data Available</h3>
            <p className="text-gray-400 mb-6">Start by creating your first blockchain network to enable decentralized AI governance.</p>
            <button
              onClick={() => setSelectedTab('create')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            >
              Create Network
            </button>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Total Transactions" value={blockchainMetrics.totalTransactions} icon={Activity} color="blue" />
          <MetricCard title="Active Networks" value={blockchainMetrics.activeNetworks} icon={Network} color="green" />
          <MetricCard title="AI Enhancement" value={`${(blockchainMetrics.aiEnhancementRate * 100).toFixed(1)}%`} icon={Star} color="purple" />
          <MetricCard title="Marketplace Volume" value={`$${blockchainMetrics.marketplaceVolume.toLocaleString()}`} icon={TrendingUp} color="orange" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg text-white mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Blockchain Metrics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Deployed Contracts</span>
                <span className="text-blue-400 font-semibold">{blockchainMetrics.deployedContracts}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Governance Proposals</span>
                <span className="text-green-400 font-semibold">{blockchainMetrics.governanceProposals}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Total Tokens</span>
                <span className="text-purple-400 font-semibold">{blockchainMetrics.totalTokens}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Quantum Optimization</span>
                <span className="text-orange-400 font-semibold">{(blockchainMetrics.quantumOptimizationRate * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg text-white mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => setSelectedTab('create')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Create Network
              </button>
              <button
                onClick={() => setSelectedTab('governance')}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                View Governance
              </button>
              <button
                onClick={() => setSelectedTab('marketplace')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
              >
                Open Marketplace
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderNetworks = () => {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg text-white mb-4">Blockchain Networks</h3>
          {networks.length === 0 ? (
            <div className="text-center py-8">
              <Network className="w-12 h-12 mx-auto mb-3 text-gray-500" />
              <p className="text-gray-400 mb-4">No networks configured yet</p>
              <p className="text-sm text-gray-500">Create your first blockchain network to start decentralized operations.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {networks.map(network => (
                <div key={network.id} className="bg-gray-800 p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-semibold">{network.name}</h4>
                      <p className="text-gray-400 text-sm">Chain ID: {network.chainId}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {network.aiEnhanced && <span className="text-blue-400 text-xs">AI</span>}
                      {network.quantumResistant && <span className="text-purple-400 text-xs">Quantum</span>}
                      <span className={`px-2 py-1 rounded text-xs ${
                        network.isActive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                      }`}>
                        {network.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center mt-3 space-x-2">
                    <span className="text-sm text-gray-500">Type: {network.type}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">TPS: {network.performance.tps}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">Block Time: {network.performance.blockTime}s</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{network.updatedAt.toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const renderTransactions = () => {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg text-white mb-4">Blockchain Transactions</h3>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 mx-auto mb-3 text-gray-500" />
              <p className="text-gray-400 mb-4">No transactions found</p>
              <p className="text-sm text-gray-500">Transactions will appear here when blockchain operations are performed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.slice(0, 10).map(transaction => (
                <div key={transaction.id} className="bg-gray-800 p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-semibold">Transaction {transaction.hash.slice(0, 8)}...</h4>
                      <p className="text-gray-400 text-sm">From: {transaction.from.slice(0, 8)}... To: {transaction.to.slice(0, 8)}...</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {transaction.aiEnhanced && <span className="text-blue-400 text-xs">AI</span>}
                      {transaction.quantumOptimized && <span className="text-purple-400 text-xs">Quantum</span>}
                      <span className={`px-2 py-1 rounded text-xs ${
                        transaction.status === 'confirmed' ? 'bg-green-600 text-white' :
                        transaction.status === 'pending' ? 'bg-yellow-600 text-white' :
                        'bg-red-600 text-white'
                      }`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center mt-3 space-x-2">
                    <span className="text-sm text-gray-500">Value: {transaction.value} ETH</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">Gas: {transaction.gasUsed}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">Block: {transaction.blockNumber}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{transaction.timestamp.toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const renderGovernance = () => {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg text-white mb-4">AI Governance Proposals</h3>
          {governance.length === 0 ? (
            <div className="text-center py-8">
              <Vote className="w-12 h-12 mx-auto mb-3 text-gray-500" />
              <p className="text-gray-400 mb-4">No governance proposals yet</p>
              <p className="text-sm text-gray-500">AI governance proposals will appear here for decentralized decision making.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {governance.map(proposal => (
                <div key={proposal.id} className="bg-gray-800 p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-semibold">{proposal.title}</h4>
                      <p className="text-gray-400 text-sm">{proposal.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {proposal.aiEnhanced && <span className="text-blue-400 text-xs">AI</span>}
                      {proposal.quantumOptimized && <span className="text-purple-400 text-xs">Quantum</span>}
                      <span className={`px-2 py-1 rounded text-xs ${
                        proposal.status === 'approved' ? 'bg-green-600 text-white' :
                        proposal.status === 'voting' ? 'bg-blue-600 text-white' :
                        proposal.status === 'proposed' ? 'bg-yellow-600 text-white' :
                        'bg-red-600 text-white'
                      }`}>
                        {proposal.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center mt-3 space-x-2">
                    <span className="text-sm text-gray-500">Type: {proposal.type}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">Proposer: {proposal.proposer.slice(0, 8)}...</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">Votes: {proposal.voting.totalVotes}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{proposal.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const renderTokens = () => {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg text-white mb-4">AI Tokens</h3>
          {tokens.length === 0 ? (
            <div className="text-center py-8">
              <Coins className="w-12 h-12 mx-auto mb-3 text-gray-500" />
              <p className="text-gray-400 mb-4">No tokens created yet</p>
              <p className="text-sm text-gray-500">AI tokens will appear here for governance and utility purposes.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tokens.map(token => (
                <div key={token.id} className="bg-gray-800 p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-semibold">{token.name} ({token.symbol})</h4>
                      <p className="text-gray-400 text-sm">Contract: {token.contractAddress.slice(0, 8)}...</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {token.aiEnhanced && <span className="text-blue-400 text-xs">AI</span>}
                      {token.quantumOptimized && <span className="text-purple-400 text-xs">Quantum</span>}
                      <span className="text-sm text-gray-300">{token.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center mt-3 space-x-2">
                    <span className="text-sm text-gray-500">Supply: {token.totalSupply.toLocaleString()}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">Circulating: {token.circulatingSupply.toLocaleString()}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">Decimals: {token.decimals}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{token.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const renderMarketplace = () => {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg text-white mb-4">Decentralized AI Marketplace</h3>
          {marketplaces.length === 0 ? (
            <div className="text-center py-8">
              <Globe className="w-12 h-12 mx-auto mb-3 text-gray-500" />
              <p className="text-gray-400 mb-4">No marketplaces available</p>
              <p className="text-sm text-gray-500">Decentralized marketplaces will appear here for AI model trading.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {marketplaces.map(marketplace => (
                <div key={marketplace.id} className="bg-gray-800 p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-semibold">{marketplace.name}</h4>
                      <p className="text-gray-400 text-sm">Contract: {marketplace.contractAddress.slice(0, 8)}...</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {marketplace.aiEnhanced && <span className="text-blue-400 text-xs">AI</span>}
                      {marketplace.quantumOptimized && <span className="text-purple-400 text-xs">Quantum</span>}
                      <span className="text-sm text-gray-300">Active</span>
                    </div>
                  </div>
                  <div className="flex items-center mt-3 space-x-2">
                    <span className="text-sm text-gray-500">Volume: ${marketplace.performance.totalVolume.toLocaleString()}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">Transactions: {marketplace.performance.totalTransactions}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">Listings: {marketplace.performance.activeListings}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{marketplace.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const renderCreate = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
        <h3 className="text-lg text-white mb-4">Create Blockchain Network</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Network Name</label>
            <input
              className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
              placeholder="Enter network name"
              value={networkForm.name}
              onChange={e => setNetworkForm({ ...networkForm, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2">Blockchain Type</label>
            <select
              className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
              value={networkForm.type}
              onChange={e => setNetworkForm({ ...networkForm, type: e.target.value as BlockchainType })}
            >
              <option value="ethereum">Ethereum</option>
              <option value="polygon">Polygon</option>
              <option value="solana">Solana</option>
              <option value="polkadot">Polkadot</option>
              <option value="cosmos">Cosmos</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2">Chain ID</label>
            <input
              className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
              type="number"
              placeholder="Enter chain ID"
              value={networkForm.chainId}
              onChange={e => setNetworkForm({ ...networkForm, chainId: parseInt(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2">RPC URL</label>
            <input
              className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
              placeholder="Enter RPC URL"
              value={networkForm.rpcUrl}
              onChange={e => setNetworkForm({ ...networkForm, rpcUrl: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2">Explorer URL</label>
            <input
              className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700"
              placeholder="Enter explorer URL"
              value={networkForm.explorerUrl}
              onChange={e => setNetworkForm({ ...networkForm, explorerUrl: e.target.value })}
            />
          </div>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={networkForm.aiEnhanced}
                onChange={e => setNetworkForm({ ...networkForm, aiEnhanced: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-300">AI Enhanced</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={networkForm.quantumResistant}
                onChange={e => setNetworkForm({ ...networkForm, quantumResistant: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-300">Quantum Resistant</span>
            </label>
          </div>
          <button
            onClick={createNetwork}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            disabled={isLoading || !networkForm.name || !networkForm.rpcUrl || !networkForm.explorerUrl}
          >
            {isLoading ? 'Creating...' : 'Create Network'}
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className={`min-h-screen bg-gray-950 text-white p-6 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold flex items-center">
              <Link className="w-8 h-8 mr-3 text-blue-400" />
              Blockchain Integration
            </h1>
            <button onClick={refreshBlockchainData} className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded">
              <Activity className="w-4 h-4 inline-block mr-1" /> Refresh
            </button>
          </div>
        </motion.div>

        <div className="mb-6">
          <div className="flex space-x-1 overflow-x-auto">
            {['overview', 'networks', 'transactions', 'governance', 'tokens', 'marketplace', 'create'].map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab as any)}
                className={`px-4 py-2 rounded whitespace-nowrap ${
                  selectedTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {selectedTab === 'overview' && renderOverview()}
          {selectedTab === 'networks' && renderNetworks()}
          {selectedTab === 'transactions' && renderTransactions()}
          {selectedTab === 'governance' && renderGovernance()}
          {selectedTab === 'tokens' && renderTokens()}
          {selectedTab === 'marketplace' && renderMarketplace()}
          {selectedTab === 'create' && renderCreate()}
        </AnimatePresence>
      </div>
    </div>
  );
}

const MetricCard = ({ title, value, icon: Icon, color }: { title: string; value: React.ReactNode; icon: any; color: string }) => (
  <div className={`bg-${color}-500/20 p-4 border border-${color}-500/30 rounded-lg`}>
    <div className="flex justify-between items-center">
      <div>
        <p className={`text-sm text-${color}-300`}>{title}</p>
        <p className={`text-2xl font-bold text-${color}-100`}>{value}</p>
      </div>
      <Icon className={`w-8 h-8 text-${color}-400`} />
    </div>
  </div>
);
