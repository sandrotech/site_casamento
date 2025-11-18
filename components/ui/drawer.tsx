'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

function Drawer({ ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="drawer" {...props} />
}

function DrawerTrigger({ ...props }: React.ComponentProps<'button'>) {
  return <button data-slot="drawer-trigger" {...props} />
}

function DrawerPortal({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}

function DrawerClose({ ...props }: React.ComponentProps<'button'>) {
  return <button data-slot="drawer-close" {...props} />
}

function DrawerOverlay({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-overlay"
      className={cn(
        'fixed inset-0 z-50 bg-black/50',
        className,
      )}
      {...props}
    />
  )
}

function DrawerContent({ className, children, ...props }: React.ComponentProps<'div'>) {
  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <div
        data-slot="drawer-content"
        className={cn(
          'bg-background fixed z-50 flex h-auto flex-col inset-x-0 bottom-0 rounded-t-lg border-t',
          className,
        )}
        {...props}
      >
        <div className="bg-muted mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
        {children}
      </div>
    </DrawerPortal>
  )
}

function DrawerHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-header"
      className={cn(
        'flex flex-col gap-0.5 p-4 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center md:gap-1.5 md:text-left',
        className,
      )}
      {...props}
    />
  )
}

function DrawerFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn('mt-auto flex flex-col gap-2 p-4', className)}
      {...props}
    />
  )
}

function DrawerTitle({ className, ...props }: React.ComponentProps<'h3'>) {
  return (
    <h3 data-slot="drawer-title" className={cn('text-foreground font-semibold', className)} {...props} />
  )
}

function DrawerDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p data-slot="drawer-description" className={cn('text-muted-foreground text-sm', className)} {...props} />
  )
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
