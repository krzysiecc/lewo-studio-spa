// pages/HomePage.tsx

// Copyright (c) 2025, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import Hero from "../components/home/Hero";
import AboutIntro from "../components/home/AboutIntro";
import ProjectsIntro from "../components/home/ProjectsIntro";
import ContactIntro from "../components/home/ContactIntro";

export default function HomePage() {
  return (
    <>
      <Hero />
      <AboutIntro />
      <ProjectsIntro />
      <ContactIntro />
    </>
  );
}
