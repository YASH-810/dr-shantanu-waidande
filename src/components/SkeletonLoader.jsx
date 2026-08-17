"use client";

import React from 'react';

function SkeletonLine({ width = '100%', height = '12px', className = '' }) {
  return (
    <div
      className={`bg-muted/60 animate-pulse ${className}`}
      style={{ width, height, borderRadius: '4px' }}
    />
  );
}

function SkeletonBlock({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine
          key={i}
          width={i === lines - 1 ? '60%' : '100%'}
          height={i === 0 ? '16px' : '12px'}
        />
      ))}
    </div>
  );
}

function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-surface border border-border p-5 rounded-lg space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <SkeletonLine width="40%" height="18px" />
        <SkeletonLine width="60px" height="24px" />
      </div>
      <SkeletonBlock lines={3} />
      <div className="flex gap-2 pt-2">
        <SkeletonLine width="48%" height="36px" />
        <SkeletonLine width="48%" height="36px" />
      </div>
    </div>
  );
}

function SkeletonPatientDetail() {
  return (
    <div className="space-y-6">
      {/* Patient overview skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4 bg-surface p-5 rounded-lg border border-border space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <SkeletonLine width="60%" height="18px" />
            <SkeletonLine width="40px" height="14px" />
          </div>
          <SkeletonLine width="80%" height="20px" />
          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="space-y-1.5">
              <SkeletonLine width="50%" height="10px" />
              <SkeletonLine width="80%" height="14px" />
            </div>
            <div className="space-y-1.5">
              <SkeletonLine width="50%" height="10px" />
              <SkeletonLine width="70%" height="14px" />
            </div>
          </div>
          <SkeletonBlock lines={2} />
        </div>

        <div className="lg:col-span-8 bg-surface p-5 rounded-lg border border-border space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <SkeletonLine width="50%" height="18px" />
            <SkeletonLine width="100px" height="32px" />
          </div>
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    </div>
  );
}

export { SkeletonLine, SkeletonBlock, SkeletonCard, SkeletonPatientDetail };
