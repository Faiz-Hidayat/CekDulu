// Adapted from the shadcn/ui Radix Select registry component.
// Copyright (c) 2023 shadcn
// SPDX-License-Identifier: MIT
// https://github.com/shadcn-ui/ui/blob/main/LICENSE.md

import * as SelectPrimitive from '@radix-ui/react-select'
import type { ComponentPropsWithRef } from 'react'
import { Icon } from '../ui'

export const Select = SelectPrimitive.Root

export function SelectTrigger({ children, className = '', ...props }:
  Omit<ComponentPropsWithRef<typeof SelectPrimitive.Trigger>, 'asChild'>) {
  return (
    <SelectPrimitive.Trigger {...props} data-slot="select-trigger" className={`select-trigger ${className}`}>
      {children}
      <SelectPrimitive.Icon data-slot="select-chevron" className="select-chevron">
        <Icon name="chevron" size={16} />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

export function SelectValue(props: ComponentPropsWithRef<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value {...props} data-slot="select-value" />
}

type SelectContentProps = Omit<ComponentPropsWithRef<typeof SelectPrimitive.Content>, 'asChild' | 'position'>

export function SelectContent({
  children,
  className = '',
  align = 'start',
  sideOffset = 6,
  collisionPadding = 8,
  ...props
}: SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        {...props}
        data-slot="select-content"
        className={`select-content ${className}`}
        position="popper"
        align={align}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
      >
        <SelectPrimitive.ScrollUpButton data-slot="select-scroll-up-button" data-direction="up" className="select-scroll-button">
          <Icon name="chevron" size={16} />
        </SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport data-slot="select-viewport" className="select-viewport">
          {children}
        </SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton data-slot="select-scroll-down-button" data-direction="down" className="select-scroll-button">
          <Icon name="chevron" size={16} />
        </SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

export function SelectItem({ children, className = '', onKeyDown, ...props }:
  Omit<ComponentPropsWithRef<typeof SelectPrimitive.Item>, 'asChild'>) {
  return (
    <SelectPrimitive.Item
      {...props}
      data-slot="select-item"
      className={`select-item ${className}`}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        // The trigger can regain focus during Enter; suppress its native click.
        if (event.key === 'Enter' && !event.defaultPrevented) {
          const nativeEvent = event.nativeEvent
          queueMicrotask(() => nativeEvent.preventDefault())
        }
      }}
    >
      <SelectPrimitive.ItemText data-slot="select-item-text">{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator data-slot="select-indicator" className="select-indicator">
        <Icon name="check" size={16} />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

export function SelectGroup(props: ComponentPropsWithRef<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group {...props} data-slot="select-group" />
}

export function SelectLabel({ className = '', ...props }: ComponentPropsWithRef<typeof SelectPrimitive.Label>) {
  return <SelectPrimitive.Label {...props} data-slot="select-label" className={`select-label ${className}`} />
}

export function SelectSeparator({ className = '', ...props }: ComponentPropsWithRef<typeof SelectPrimitive.Separator>) {
  return <SelectPrimitive.Separator {...props} data-slot="select-separator" className={`select-separator ${className}`} />
}
