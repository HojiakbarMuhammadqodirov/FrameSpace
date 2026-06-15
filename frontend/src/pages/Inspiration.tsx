import { Link } from 'react-router-dom'
import { House, ArrowLeft, Images, ArrowRight } from '@phosphor-icons/react'

const ROOMS = [
  { label: 'Living Room', style: 'Modern · Minimalist', img: 'https://www.marthastewart.com/thmb/lxfu2-95SWCS0jwciHs1mkbsGUM=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/modern-living-rooms-wb-1-bc45b0dc70e541f0ba40364ae6bd8421.jpg' },
  { label: 'Bedroom',     style: 'Scandinavian · Cozy',  img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTi2Eq9URdcBa217uRJA44G1GAZm71G-fKGmcZCp41BQz8Oa9DOB7Ooq1P4&s=10' },
  { label: 'Home Office', style: 'Industrial · Clean',   img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHuYkm6I97FnLgENno6KFqAcvtwPvtrHULA2oj5s0UKA&s=10' },
  { label: 'Dining Room', style: 'Warm · Traditional',   img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHo6YfBqzx0XnlkX3EEQJSM-rdeRjriMOC03t44-1AjQ&s=10' },
  { label: 'Studio Flat', style: 'Compact · Smart',      img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSIS4OfpT8YAnQeo0GqtU8_zwKV1d_e5wbA_pT2l3CXdcsoP--dCl_hyw&s=10' },
  { label: 'Kids Room',   style: 'Playful · Bright',     img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-bpfOLOZVbIhlyYBAvTEti5T0MKe9kYYngOiRlflErxhu4KB_7FaDMWbm&s=10' },
]

export default function Inspiration() {
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

      <main className="flex-1 px-8 md:px-16 py-12 max-w-5xl mx-auto w-full">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <Images size={18} weight="regular" className="text-brand-brown" />
            <span className="text-xs font-semibold text-brand-brown uppercase tracking-[0.15em]">Gallery</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-brand-dark tracking-tighter">Get inspired</h1>
          <p className="text-brand-grey-dark mt-2">Real rooms designed by FrameSpace users around the world.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {ROOMS.map(r => (
            <div key={r.label} className="group rounded-2xl border border-brand-grey overflow-hidden bg-surface-raised cursor-pointer hover:border-brand-brown hover:shadow-card-hover transition-all ease-spring duration-200">
              
              {/* FIX: Rasm konteynerining ichki qismi toʻgʻrilandi, haqiqiy img tagiga o'tildi */}
              <div className="h-40 w-full overflow-hidden relative">
                <img 
                  src={r.img} 
                  alt={r.label}
                  className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                  loading="lazy"
                />
                {/* Silliq qoraytirish overlay qatlami premium ko'rinish beradi */}
                <div className="absolute inset-0 bg-brand-dark/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              <div className="p-4 relative z-10 bg-surface-raised">
                <p className="font-medium text-sm text-brand-dark group-hover:text-brand-brown transition-colors duration-200">{r.label}</p>
                <p className="text-xs text-brand-grey-dark mt-0.5">{r.style}</p>
              </div>

            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link to="/gallery" className="btn-secondary text-sm px-6 py-2.5 inline-flex items-center gap-2">
            View full gallery <ArrowRight size={14} weight="bold" />
          </Link>
        </div>
      </main>
    </div>
  )
}