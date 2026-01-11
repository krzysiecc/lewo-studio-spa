// pages/HomePage.tsx

// Copyright (c) 2026, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import Hero from "./Hero";
import AboutIntro from "./AboutIntro";
import ProjectsIntro from "./ProjectsIntro";
import ContactIntro from "./ContactIntro";

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
