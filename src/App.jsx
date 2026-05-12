import { useState, useEffect, useMemo } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import FilterBar from './components/FilterBar'
import ProductGrid from './components/ProductGrid'
import Footer from './components/Footer'
import './App.css'

export default function App() {
  const [products, setProducts] = useState([])
  const [config, setConfig] = useState({})
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('./products.json').then(r => r.json()),
      fetch('./config.json').then(r => r.json()),
    ]).then(([prods, cfg]) => {
      setProducts(prods)
      setConfig(cfg)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
  }, [])

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = search === '' ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(search.toLowerCase())
      const matchFilter = filter === 'all' ||
        (filter === 'available' && p.status === 'available') ||
        (filter === 'sold' && p.status === 'sold')
      return matchSearch && matchFilter
    })
  }, [products, search, filter])

  const counts = useMemo(() => ({
    all: products.length,
    available: products.filter(p => p.status === 'available').length,
    sold: products.filter(p => p.status === 'sold').length,
  }), [products])

  return (
    <div className="app">
      <Header config={config} />
      <main>
        <Hero config={config} />
        <FilterBar
          search={search}
          onSearch={setSearch}
          filter={filter}
          onFilter={setFilter}
          counts={counts}
        />
        <ProductGrid
          products={filtered}
          config={config}
          loading={loading}
        />
      </main>
      <Footer config={config} />
    </div>
  )
}
