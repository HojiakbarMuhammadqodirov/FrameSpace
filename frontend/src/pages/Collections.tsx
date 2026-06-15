import { Link } from 'react-router-dom'
import { House, ArrowLeft, Swatches } from '@phosphor-icons/react'

const COLLECTIONS = [
  { name: 'Scandinavian Calm',   desc: 'Clean lines, neutral tones, and natural materials.', img: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgmVSeMir-y_v8zvsvYbwYmylBsiNV0HcFM6nomdb1OUQeWLAuV_lAENe4jfzTAX6t2Tht7K_g35spmJNa85h00hEsj2H6IeRcORY-C7A0zuxKXztDjL2P97uCHtQYYbCLvjhe8KVJgdaDH2iMY53hy5XbgphkwdzxBjqGBhp1ufpcNGgrmu0BpYJJsftA/s750/Simple%20swedish%20home-10.jpg' },
  { name: 'Industrial Loft',     desc: 'Raw textures, steel accents, and warm Edison lighting.', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPbTgAcieJMFXiETspVCMct91mrPvS6aEDYZ5RcttRXlkd0DuASE160PY&s=10' },
  { name: 'Coastal Retreat',     desc: 'Breezy fabrics, light wood, and ocean-inspired hues.', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSD3_plh_LAGebW64dBy-6cfQpdhGiRTXB9jnteV1i_OTcSOifwpXXlWCmy&s=10' },
  { name: 'Modern Minimalist',   desc: 'Less is more — functional beauty in every piece.', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvWkM8Qr1KZAEN4UFopr_kwJRJBVM9Xsd83YL7B7vXM4FOikoaT3n5cffn&s=10' },
]

export default function Collections() {
  return (
    <div className="min-h-[100dvh] bg-brand-grey-light flex flex-col">
      <header className="flex justify-center pt-6 px-6">
        <div className="flex items-center gap-4 px-5 py-3 bg-surface-raised/90 backdrop-blur-2xl rounded-full border border-brand-grey shadow-float">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-brown rounded-md flex items-center justify-center">
              <House size={13} weight="fill" className="text-white" />
            </div>
            <span className="font-semibold text-brand-dark text-sm tracking-tight">FrameSpace</span>
          </Link>
          <div className="w-px h-4 bg-brand-grey" />
          <Link to="/" className="flex items-center gap-1.5 text-xs text-brand-grey-dark hover:text-brand-dark transition-colors">
            <ArrowLeft size={12} weight="bold" /> Back home
          </Link>
        </div>
      </header>

      <main className="flex-1 px-8 md:px-16 py-12 max-w-4xl mx-auto w-full">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <Swatches size={18} weight="regular" className="text-brand-brown" />
            <span className="text-xs font-semibold text-brand-brown uppercase tracking-[0.15em]">Curated styles</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-brand-dark tracking-tighter">Collections</h1>
          <p className="text-brand-grey-dark mt-2">Pre-styled room themes designed by our in-house team.</p>
        </div>

       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  {COLLECTIONS.map(c => (
    <div key={c.name} className="group p-1.5 rounded-[1.25rem] bg-brand-dark/[0.03] border border-brand-grey cursor-pointer transition-all duration-300 hover:border-brand-brown/30">
      <div className="rounded-[calc(1.25rem-0.375rem)] overflow-hidden bg-brand-grey-light flex flex-col">
        
        {/* Rasm konteyneri va WOW effektli animatsiya */}
        <div className="h-36 w-full overflow-hidden relative">
          <img 
            src={c.img} 
            alt={c.name}
            className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.06]" 
          />
          {/* Silliq qoraytirish qatlami (Overlay) rasm ustiga vizual chuqurlik beradi */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Matnlar qismi */}
        <div className="bg-surface-raised p-5 relative z-10 flex-1">
          <h3 className="font-semibold text-brand-dark text-sm tracking-tight mb-1 group-hover:text-brand-brown transition-colors duration-200">
            {c.name}
          </h3>
          <p className="text-xs text-brand-grey-dark leading-relaxed">
            {c.desc}
          </p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-[10px] text-brand-brown font-medium bg-brand-brown/10 px-2 py-0.5 rounded-full">
              Coming soon
            </span>
          </div>
        </div>

      </div>
    </div>
  ))}
</div>
      </main>
    </div>
  )
}
