// Copyright (c) 2025, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.


import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function Hero() {
  const nameRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (nameRef.current) {
      gsap.fromTo(
        nameRef.current,
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: 'power2.out', delay: 0.4 }
      )
    }
  }, [])

  return (
    <section className="min-h-screen bg-seashell text-coffee flex flex-col items-center justify-center px-4">
      <h1
        ref={nameRef}
        className="text-7xl md:text-9xl font-extrabold tracking-tight text-thulian text-center"
      >
        Lena Wojewódzka
      </h1>
    </section>
  )
}
