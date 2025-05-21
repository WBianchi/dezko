import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveHeader({
  title,
  subtitle,
  actions,
  className,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4", className)}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight break-words sm:text-2xl md:text-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
          {actions}
        </div>
      )}
    </div>
  );
}

export function ResponsiveFilters({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col sm:flex-row gap-2 sm:items-center flex-wrap mb-4", className)}>
      {children}
    </div>
  );
}

export function ResponsiveTable({
  children,
  className,
}: ResponsiveContainerProps) {
  return (
    <div className={cn("overflow-auto rounded-lg border bg-white dark:bg-gray-950 -mx-4 sm:mx-0", className)}>
      {children}
    </div>
  );
}

export function ResponsiveStats({
  children,
  className,
}: ResponsiveContainerProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {children}
    </div>
  );
}

export function ResponsiveForm({
  children,
  className,
}: ResponsiveContainerProps) {
  return (
    <div className={cn("grid gap-6", className)}>
      {children}
    </div>
  );
}

export function ResponsiveTwoColumns({
  left,
  right,
  reversed = false,
  className,
}: {
  left: ReactNode;
  right: ReactNode;
  reversed?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-3 gap-6", className)}>
      <div className={cn("lg:col-span-2", reversed ? "lg:order-2" : "")}>
        {left}
      </div>
      <div className={cn("", reversed ? "lg:order-1" : "")}>
        {right}
      </div>
    </div>
  );
}

export function ResponsiveCard({
  children,
  className,
}: ResponsiveContainerProps) {
  return (
    <div className={cn("rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-950", className)}>
      {children}
    </div>
  );
}

export function ResponsiveContainer({
  children,
  className,
}: ResponsiveContainerProps) {
  return (
    <div className={cn("flex-1 space-y-4 p-3 sm:p-6", className)}>
      {children}
    </div>
  );
}
