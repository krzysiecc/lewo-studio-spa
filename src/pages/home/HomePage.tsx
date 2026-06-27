// pages/HomePage.tsx

// Copyright (c) 2026, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import ApartmentWalkthrough from "./ApartmentWalkthrough";

// Legacy intro sections — preserved for reference but disabled in favour of the
// black-and-white apartment walkthrough. The colored pop-up tiles lived in
// AboutIntro; they no longer render on the homepage.
// import Hero from "./Hero";
// import AboutIntro from "./AboutIntro";
// import ProjectsIntro from "./ProjectsIntro";
// import ContactIntro from "./ContactIntro";

export default function HomePage() {
  return (
    <>
      <ApartmentWalkthrough />
      {/*
      <Hero />
      <AboutIntro />
      <ProjectsIntro />
      <ContactIntro />
      */}
    </>
  );
}
