// Adapted from the shadcn/ui Radix Checkbox registry component.
// Copyright (c) 2023 shadcn
// SPDX-License-Identifier: MIT
// https://github.com/shadcn-ui/ui/blob/main/LICENSE.md

import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import type { ComponentPropsWithRef } from 'react'
import { Icon } from '../ui'

type CheckboxProps = Omit<ComponentPropsWithRef<typeof CheckboxPrimitive.Root>, 'asChild' | 'children'>

export function Checkbox({ className = '', ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root {...props} data-slot="checkbox" className={`checkbox-control ${className}`}>
      <CheckboxPrimitive.Indicator data-slot="checkbox-indicator" className="checkbox-indicator">
        <Icon name="check" size={14} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}
