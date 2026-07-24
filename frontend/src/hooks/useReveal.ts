import { useEffect } from 'react'

/**
 * Activates [data-reveal] scroll-entry animations on the page.
 * Elements get `.revealed` when they enter the viewport (styles in index.css).
 */
export function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]')
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target) }
      }),
      { threshold: 0.1 }
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])
}
