import React from 'react'

export const GreyOutZone: React.FC<{ isGreyedOut: boolean; children?: React.ReactNode }> = ({ isGreyedOut, children }) => (
  <div className={isGreyedOut ? 'greyout' : undefined}>
    <div className="cover" />
    {children}
  </div>
)
