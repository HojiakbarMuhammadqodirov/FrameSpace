export interface User {
  id: string
  name: string
  email: string
  preferences: {
    style: RoomStyle
    budget: BudgetRange
    unit: 'meters' | 'feet'
  }
  createdAt?: string
}

export type RoomStyle = 'minimalist' | 'modern' | 'cozy' | 'luxury' | 'industrial' | 'scandinavian'
export type BudgetRange = 'budget' | 'mid-range' | 'premium'
export type RoomType = 'living' | 'bedroom' | 'dining' | 'office' | 'kitchen' | 'bathroom'
export type FloorType = 'hardwood' | 'carpet' | 'tile' | 'concrete' | 'laminate'
export type WallType = 'north' | 'south' | 'east' | 'west'
export type ViewMode = 'free' | 'front' | 'side-left' | 'side-right' | 'top' | 'default'

export interface RoomWindow {
  _id?: string
  wall: WallType
  position: number
  width: number
  height: number
  sillHeight: number
  style: 'single' | 'double' | 'bay' | 'sliding'
}

export interface RoomDoor {
  _id?: string
  wall: WallType
  position: number
  width: number
  style: 'single' | 'double' | 'sliding'
}

export interface RoomDimensions {
  width: number
  depth: number
  height: number
}

export interface RoomStyleConfig {
  wallColor: string
  wallMaterial: string
  floorType: FloorType
  floorColor: string
  ceilingColor: string
}

export interface Room {
  _id: string
  userId: string
  name: string
  shape: 'rectangle' | 'l-shape' | 'square' | 'custom'
  dimensions: RoomDimensions
  windows: RoomWindow[]
  doors: RoomDoor[]
  style: RoomStyleConfig
  roomType: RoomType
  stylePreference: RoomStyle
  budget: BudgetRange
  createdAt: string
  updatedAt: string
}

export interface FurnitureDimensions {
  width: number  // cm
  depth: number  // cm
  height: number // cm
}

export interface FurnitureItem {
  _id: string
  name: string
  category: string
  price: number
  priceRange: BudgetRange
  image: string
  dimensions: FurnitureDimensions
  colors: string[]
  materials: string[]
  styleTags: string[]
  roomTypes: string[]
  source: string
  sourceUrl: string
  description: string
  rating: number
  score?: number
  reason?: string
}

export interface Position3D {
  x: number
  y: number
  z: number
}

export interface PlacedFurniture {
  _id?: string
  furnitureId: string
  name: string
  position: Position3D
  rotation: number
  scale: number
  color: string
  material: string
  furnitureData?: FurnitureItem
}

export interface Design {
  _id: string
  userId: string
  roomId: string | Room
  name: string
  furnitureLayout: PlacedFurniture[]
  thumbnail: string
  isShared: boolean
  shareToken: string
  totalCost: number
  notes: string
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
}

export interface RoomState {
  currentRoom: Room | null
  rooms: Room[]
  isLoading: boolean
}

export interface FurnitureState {
  catalog: FurnitureItem[]
  recommendations: FurnitureItem[]
  placedFurniture: PlacedFurniture[]
  selectedId: string | null
  isLoading: boolean
  totalCost: number
}

export interface DesignState {
  currentDesign: Design | null
  designs: Design[]
  isLoading: boolean
}

export interface UIState {
  viewMode: ViewMode
  activeTab: 'room' | 'furniture' | 'recommendations' | 'cart'
  showGrid: boolean
  snapToGrid: boolean
  sidebarOpen: boolean
  furnitureCategory: string
}

export interface ApiResponse<T> {
  data?: T
  message?: string
  errors?: { msg: string; param: string }[]
}
