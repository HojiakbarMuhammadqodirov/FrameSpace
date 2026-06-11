import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  User, Room, FurnitureItem, PlacedFurniture, Design, ViewMode,
} from '../types'

interface AppStore {
  // Auth
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  clearAuth: () => void

  // Rooms
  rooms: Room[]
  currentRoom: Room | null
  setRooms: (rooms: Room[]) => void
  setCurrentRoom: (room: Room | null) => void
  upsertRoom: (room: Room) => void
  removeRoom: (id: string) => void

  // Furniture catalog
  catalog: FurnitureItem[]
  recommendations: FurnitureItem[]
  setCatalog: (items: FurnitureItem[]) => void
  setRecommendations: (items: FurnitureItem[]) => void

  // Placed furniture
  placedFurniture: PlacedFurniture[]
  selectedFurnitureId: string | null
  setPlacedFurniture: (items: PlacedFurniture[]) => void
  addFurniture: (item: PlacedFurniture) => void
  updateFurniture: (id: string, updates: Partial<PlacedFurniture>) => void
  removeFurniture: (id: string) => void
  setSelectedFurniture: (id: string | null) => void
  clearPlacedFurniture: () => void

  // Undo/redo history
  history: PlacedFurniture[][]
  historyIndex: number
  pushSnapshot: () => void
  undo: () => void
  redo: () => void

  // Designs
  designs: Design[]
  currentDesign: Design | null
  setDesigns: (designs: Design[]) => void
  setCurrentDesign: (design: Design | null) => void
  upsertDesign: (design: Design) => void
  removeDesign: (id: string) => void

  // UI
  viewMode: ViewMode
  activeTab: 'room' | 'furniture' | 'recommendations' | 'cart'
  showGrid: boolean
  snapToGrid: boolean
  sidebarOpen: boolean
  furnitureCategory: string
  setViewMode: (mode: ViewMode) => void
  setActiveTab: (tab: 'room' | 'furniture' | 'recommendations' | 'cart') => void
  toggleGrid: () => void
  toggleSnap: () => void
  setSidebarOpen: (open: boolean) => void
  setFurnitureCategory: (cat: string) => void

  // Computed
  totalCost: () => number
}

const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      token: null,
      setAuth: (user, token) => {
        localStorage.setItem('fs_token', token)
        localStorage.setItem('fs_user', JSON.stringify(user))
        set({ user, token })
      },
      clearAuth: () => {
        localStorage.removeItem('fs_token')
        localStorage.removeItem('fs_user')
        set({ user: null, token: null, currentRoom: null, placedFurniture: [], currentDesign: null })
      },

      // Rooms
      rooms: [],
      currentRoom: null,
      setRooms: rooms => set({ rooms }),
      setCurrentRoom: room => set({ currentRoom: room }),
      upsertRoom: room => set(s => ({
        rooms: s.rooms.find(r => r._id === room._id)
          ? s.rooms.map(r => r._id === room._id ? room : r)
          : [room, ...s.rooms],
        currentRoom: s.currentRoom?._id === room._id ? room : s.currentRoom,
      })),
      removeRoom: id => set(s => ({
        rooms: s.rooms.filter(r => r._id !== id),
        currentRoom: s.currentRoom?._id === id ? null : s.currentRoom,
      })),

      // Furniture catalog
      catalog: [],
      recommendations: [],
      setCatalog: catalog => set({ catalog }),
      setRecommendations: recommendations => set({ recommendations }),

      // Placed furniture
      placedFurniture: [],
      selectedFurnitureId: null,
      setPlacedFurniture: items => set({ placedFurniture: items }),
      addFurniture: item => set(s => {
        const snapshot = [...s.placedFurniture]
        const newHistory = [...s.history.slice(0, s.historyIndex + 1), snapshot].slice(-50)
        return {
          placedFurniture: [...s.placedFurniture, item],
          history: newHistory,
          historyIndex: newHistory.length - 1,
        }
      }),
      updateFurniture: (id, updates) => set(s => ({
        placedFurniture: s.placedFurniture.map(f =>
          (f._id || f.furnitureId) === id ? { ...f, ...updates } : f
        ),
      })),
      removeFurniture: id => set(s => {
        const snapshot = [...s.placedFurniture]
        const newHistory = [...s.history.slice(0, s.historyIndex + 1), snapshot].slice(-50)
        return {
          placedFurniture: s.placedFurniture.filter(f => (f._id || f.furnitureId) !== id),
          selectedFurnitureId: s.selectedFurnitureId === id ? null : s.selectedFurnitureId,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        }
      }),
      setSelectedFurniture: id => set({ selectedFurnitureId: id }),
      clearPlacedFurniture: () => set({ placedFurniture: [], selectedFurnitureId: null, history: [], historyIndex: -1 }),

      // Undo/redo history
      history: [],
      historyIndex: -1,
      pushSnapshot: () => set(s => {
        const snapshot = [...s.placedFurniture]
        const newHistory = [...s.history.slice(0, s.historyIndex + 1), snapshot].slice(-50)
        return { history: newHistory, historyIndex: newHistory.length - 1 }
      }),
      undo: () => set(s => {
        if (s.historyIndex < 0) return {}
        const newIndex = s.historyIndex - 1
        const restored = newIndex >= 0 ? [...s.history[newIndex]] : []
        return { historyIndex: newIndex, placedFurniture: restored }
      }),
      redo: () => set(s => {
        if (s.historyIndex >= s.history.length - 1) return {}
        const newIndex = s.historyIndex + 1
        return { historyIndex: newIndex, placedFurniture: [...s.history[newIndex]] }
      }),

      // Designs
      designs: [],
      currentDesign: null,
      setDesigns: designs => set({ designs }),
      setCurrentDesign: design => set({ currentDesign: design }),
      upsertDesign: design => set(s => ({
        designs: s.designs.find(d => d._id === design._id)
          ? s.designs.map(d => d._id === design._id ? design : d)
          : [design, ...s.designs],
      })),
      removeDesign: id => set(s => ({ designs: s.designs.filter(d => d._id !== id) })),

      // UI
      viewMode: 'default',
      activeTab: 'room',
      showGrid: true,
      snapToGrid: false,
      sidebarOpen: true,
      furnitureCategory: '',
      setViewMode: mode => set({ viewMode: mode }),
      setActiveTab: tab => set({ activeTab: tab }),
      toggleGrid: () => set(s => ({ showGrid: !s.showGrid })),
      toggleSnap: () => set(s => ({ snapToGrid: !s.snapToGrid })),
      setSidebarOpen: open => set({ sidebarOpen: open }),
      setFurnitureCategory: cat => set({ furnitureCategory: cat }),

      // Computed
      totalCost: () => {
        const { placedFurniture, catalog } = get()
        return placedFurniture.reduce((sum, pf) => {
          const item = catalog.find(c => c._id === pf.furnitureId)
          return sum + (item?.price ?? pf.furnitureData?.price ?? 0)
        }, 0)
      },
    }),
    {
      name: 'framespace-store',
      partialize: state => ({ user: state.user, token: state.token }),
    }
  )
)

export default useStore
