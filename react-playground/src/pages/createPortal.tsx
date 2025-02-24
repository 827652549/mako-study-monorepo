"use client"
import React from 'react'
import { createPortal } from 'react-dom';

export default function List() {
  return (
    <div>
      <div>
        <p>这个子节点被放置在父节点 div 中。</p>
        {createPortal(
          <p>这个子节点1被放置在 document body 中。</p>,
          document.body
        )}
        {createPortal(
          <p>这个子节点2被放置在 document body 中。</p>,
          document.body
        )}
      </div>
    </div>)
}