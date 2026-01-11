// utils/fxBridge.ts

// Copyright (c) 2026, Krzysztof Wiłnicki
// All rights reserved.

// We move this object to a separate file so HMR doesn't break
// when editing the React components that use it.
export const fxBridge = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update: (_isHovered: boolean, _color: string) => {
    // Placeholder: implementation is injected by ShadowyClouds
  },
};
