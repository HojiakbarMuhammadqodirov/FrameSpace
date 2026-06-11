import {
  Armchair, Table, Monitor, Bed, Books, Package, Lamp,
  Plant, PaintBrush, House, GridNine, ShoppingCart, ArrowSquareOut, X, FilePdf,
} from '@phosphor-icons/react'
import useStore from '../../store/useStore'

function CategoryIcon({ category, size = 18 }: { category: string; size?: number }) {
  const w = 'regular' as const
  switch (category) {
    case 'sofa': case 'chair': return <Armchair size={size} weight={w} />
    case 'table':              return <Table size={size} weight={w} />
    case 'desk':               return <Monitor size={size} weight={w} />
    case 'bed':                return <Bed size={size} weight={w} />
    case 'shelf':              return <Books size={size} weight={w} />
    case 'wardrobe': case 'storage': return <Package size={size} weight={w} />
    case 'lighting':           return <Lamp size={size} weight={w} />
    case 'rug':                return <GridNine size={size} weight={w} />
    case 'plant':              return <Plant size={size} weight={w} />
    case 'decor':              return <PaintBrush size={size} weight={w} />
    default:                   return <House size={size} weight={w} />
  }
}

async function exportCartPDF(items: { name: string; itemData?: { category?: string; price?: number; source?: string } | null }[], total: number, roomName?: string) {
  const { jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default
  const doc = new jsPDF()

  // Header
  doc.setFontSize(18)
  doc.setTextColor(28, 26, 23)
  doc.text('FrameSpace — Furniture Cart', 14, 22)
  if (roomName) {
    doc.setFontSize(11)
    doc.setTextColor(138, 132, 124)
    doc.text(roomName, 14, 30)
  }

  // Table
  autoTable(doc, {
    startY: roomName ? 38 : 32,
    head: [['Item', 'Category', 'Source', 'Price']],
    body: items.map(i => [
      i.name,
      i.itemData?.category || '—',
      i.itemData?.source || '—',
      i.itemData?.price ? `$${i.itemData.price.toLocaleString()}` : '—',
    ]),
    foot: [['', '', 'Total estimate', `$${total.toLocaleString()}`]],
    styles: { font: 'helvetica', fontSize: 10 },
    headStyles: { fillColor: [200, 149, 90], textColor: 255 },
    footStyles: { fillColor: [247, 244, 240], textColor: [28, 26, 23], fontStyle: 'bold' },
  })

  doc.save(`framespace-cart-${Date.now()}.pdf`)
}

export default function CartPanel() {
  const { placedFurniture, catalog, removeFurniture, totalCost, currentRoom } = useStore()

  const items = placedFurniture.map(pf => ({
    ...pf,
    itemData: pf.furnitureData || catalog.find(c => c._id === pf.furnitureId),
  }))

  if (items.length === 0) return (
    <div className="p-4 text-center">
      <div className="w-12 h-12 bg-brand-brown/10 rounded-xl flex items-center justify-center mx-auto mb-3">
        <ShoppingCart size={24} weight="regular" className="text-brand-brown" />
      </div>
      <p className="text-sm font-medium text-brand-dark mb-1">Cart is empty</p>
      <p className="text-xs text-brand-grey-dark">Add items from the Browse or AI tabs</p>
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-brand-grey flex-shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-brand-dark">{items.length} items</span>
          <span className="text-base font-bold text-brand-brown font-mono tabular-nums">
            ${totalCost().toLocaleString()}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3 p-2 bg-surface-raised rounded-xl border border-brand-grey">
            <div className="w-10 h-10 rounded-lg bg-brand-grey flex items-center justify-center text-brand-grey-dark flex-shrink-0">
              {item.itemData
                ? <CategoryIcon category={item.itemData.category} size={16} />
                : <Package size={16} weight="regular" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-brand-dark truncate">{item.name}</p>
              {item.color && (
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-3 h-3 rounded-full inline-block border border-brand-grey" style={{ background: item.color }} />
                  <span className="text-xs text-brand-grey-dark">{item.material || item.color}</span>
                </div>
              )}
              {item.itemData && (
                <p className="text-xs font-bold text-brand-brown font-mono">${item.itemData.price.toLocaleString()}</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              {item.itemData?.sourceUrl && (
                <a href={item.itemData.sourceUrl} target="_blank" rel="noopener noreferrer"
                  className="text-brand-brown hover:text-brand-brown-dark transition-colors ease-spring duration-150">
                  <ArrowSquareOut size={13} weight="regular" />
                </a>
              )}
              <button
                onClick={() => removeFurniture(item._id || item.furnitureId)}
                className="text-brand-grey-dark hover:text-red-500 transition-colors ease-spring duration-150"
              >
                <X size={13} weight="regular" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-brand-grey space-y-2 flex-shrink-0">
        <div className="flex justify-between text-sm">
          <span className="text-brand-grey-dark">Total estimate</span>
          <span className="font-bold text-brand-dark font-mono tabular-nums">${totalCost().toLocaleString()}</span>
        </div>
        <button
          onClick={() => exportCartPDF(items, totalCost(), currentRoom?.name)}
          className="btn-secondary w-full text-xs flex items-center justify-center gap-1.5"
        >
          <FilePdf size={13} weight="regular" />
          Export PDF
        </button>
      </div>
    </div>
  )
}
