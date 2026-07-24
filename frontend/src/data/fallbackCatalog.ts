import type { FurnitureItem } from '../types'

// Bundled catalog shown ONLY when the backend can't be reached at all (network
// error). When the backend is up but MongoDB is down, the API already serves
// its own fallback list with `offline: true` — this is the last-resort copy so
// the Shop page is never empty. Images are full Unsplash URLs (used directly).
const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=480&h=360&fit=crop&crop=center&auto=format&q=75`

type Seed = Omit<FurnitureItem, 'colors' | 'materials' | 'styleTags' | 'roomTypes' | 'priceRange' | 'dimensions'> &
  Partial<Pick<FurnitureItem, 'colors' | 'materials' | 'styleTags' | 'roomTypes' | 'priceRange' | 'dimensions'>>

const seeds: Seed[] = [
  { _id: 'fb-sofa-kivik', name: 'KIVIK 3-Seat Sofa', category: 'sofa', price: 699, source: 'IKEA', rating: 4.3, image: img('1555041469-a586c61ea9bc'), sourceUrl: 'https://www.ikea.com', description: 'Comfortable 3-seat sofa with deep seats.' },
  { _id: 'fb-sofa-ektorp', name: 'EKTORP 2-Seat Sofa', category: 'sofa', price: 549, source: 'IKEA', rating: 4.5, image: img('1493663284031-b7e3aefcae8e'), sourceUrl: 'https://www.ikea.com', description: 'Classic sofa with a timeless look.' },
  { _id: 'fb-sofa-chesterfield', name: 'Velvet Chesterfield Sofa', category: 'sofa', price: 1899, source: 'Wayfair', rating: 4.7, image: img('1616486338812-3dadae4b4ace'), sourceUrl: 'https://www.wayfair.com', description: 'Luxurious tufted Chesterfield sofa.' },
  { _id: 'fb-chair-poang', name: 'POÄNG Armchair', category: 'chair', price: 149, source: 'IKEA', rating: 4.7, image: img('1586023492125-27b2c045efd7'), sourceUrl: 'https://www.ikea.com', description: 'Classic armchair with bent birch frame.' },
  { _id: 'fb-chair-eames', name: 'Eames Style Lounge Chair', category: 'chair', price: 799, source: 'Wayfair', rating: 4.8, image: img('1567538096621-38d2284b23ff'), sourceUrl: 'https://www.wayfair.com', description: 'Iconic mid-century modern lounge chair.' },
  { _id: 'fb-chair-strandmon', name: 'STRANDMON Wing Chair', category: 'chair', price: 349, source: 'IKEA', rating: 4.6, image: img('1611967164521-abae8fba4668'), sourceUrl: 'https://www.ikea.com', description: 'Comfortable wing chair for reading.' },
  { _id: 'fb-table-hemnes', name: 'HEMNES Coffee Table', category: 'table', price: 179, source: 'IKEA', rating: 4.5, image: img('1598300042247-d088f8ab3a91'), sourceUrl: 'https://www.ikea.com', description: 'Solid wood coffee table with storage.' },
  { _id: 'fb-table-marble', name: 'Marble Round Coffee Table', category: 'table', price: 449, source: 'Wayfair', rating: 4.6, image: img('1598300042247-d088f8ab3a91'), sourceUrl: 'https://www.wayfair.com', description: 'Elegant round marble-top coffee table.' },
  { _id: 'fb-desk-bekant', name: 'BEKANT Sit/Stand Desk', category: 'desk', price: 499, source: 'IKEA', rating: 4.4, image: img('1593642632559-0c6d3fc62b89'), sourceUrl: 'https://www.ikea.com', description: 'Electric sit/stand desk for home office.' },
  { _id: 'fb-bed-malm', name: 'MALM Bed Frame Queen', category: 'bed', price: 299, source: 'IKEA', rating: 4.4, image: img('1505693416388-ac5ce068fe85'), sourceUrl: 'https://www.ikea.com', description: 'Clean-lined bed frame with storage.' },
  { _id: 'fb-bed-platform', name: 'Upholstered Platform Bed', category: 'bed', price: 899, source: 'Wayfair', rating: 4.7, image: img('1631049307264-da0ec9d70304'), sourceUrl: 'https://www.wayfair.com', description: 'Luxurious upholstered platform bed.' },
  { _id: 'fb-tv-besta', name: 'BESTA TV Unit', category: 'tv-stand', price: 299, source: 'IKEA', rating: 4.5, image: img('1598928506311-c55ded91a20c'), sourceUrl: 'https://www.ikea.com', description: 'Modular TV unit with cable management.' },
  { _id: 'fb-shelf-kallax', name: 'KALLAX Shelf Unit 4×4', category: 'shelf', price: 89, source: 'IKEA', rating: 4.6, image: img('1618220048045-10a6dbdf83e0'), sourceUrl: 'https://www.ikea.com', description: '4×4 cube shelf unit, perfect for storage.' },
  { _id: 'fb-wardrobe-pax', name: 'PAX Wardrobe 200cm', category: 'wardrobe', price: 399, source: 'IKEA', rating: 4.5, image: img('1558997519-83ea9252edf8'), sourceUrl: 'https://www.ikea.com', description: 'Modular wardrobe with sliding doors.' },
  { _id: 'fb-storage-sideboard', name: 'Mid-Century Sideboard', category: 'storage', price: 599, source: 'Wayfair', rating: 4.7, image: img('1600121848594-d8644e57abab'), sourceUrl: 'https://www.wayfair.com', description: 'Retro-inspired sideboard with brass handles.' },
  { _id: 'fb-light-arc', name: 'Arc Floor Lamp', category: 'lighting', price: 189, source: 'Wayfair', rating: 4.5, image: img('1524758631624-e2822e304c36'), sourceUrl: 'https://www.wayfair.com', description: 'Elegant arc floor lamp with marble base.' },
  { _id: 'fb-rug-berber', name: 'Moroccan Berber Rug', category: 'rug', price: 249, source: 'Wayfair', rating: 4.7, image: img('1600585152220-90363fe7e115'), sourceUrl: 'https://www.wayfair.com', description: 'Handmade Moroccan berber wool rug.' },
  { _id: 'fb-plant-fiddle', name: 'Fiddle Leaf Fig Tree', category: 'plant', price: 89, source: 'Wayfair', rating: 4.4, image: img('1545241047-6083a3684587'), sourceUrl: 'https://www.wayfair.com', description: 'Statement fiddle leaf fig in decorative pot.' },
  { _id: 'fb-decor-mirror', name: 'Full-Length Floor Mirror', category: 'decor', price: 199, source: 'Wayfair', rating: 4.6, image: img('1631679706909-1844bbd07221'), sourceUrl: 'https://www.wayfair.com', description: 'Freestanding full-length mirror.' },
  { _id: 'fb-decor-vase', name: 'Ceramic Vase Set', category: 'decor', price: 49, source: 'Wayfair', rating: 4.4, image: img('1526057565006-20beab8dd2ed'), sourceUrl: 'https://www.wayfair.com', description: 'Set of 3 sculptural ceramic vases.' },
]

export const fallbackCatalog: FurnitureItem[] = seeds.map(s => ({
  priceRange: 'mid-range',
  dimensions: { width: 100, depth: 60, height: 80 },
  colors: [],
  materials: [],
  styleTags: [],
  roomTypes: [],
  ...s,
})) as FurnitureItem[]
