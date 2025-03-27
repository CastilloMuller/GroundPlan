import Link from 'next/link';
import React from 'react'

const Nav = () => {
  return (
    <div className='p-4 shadow-md flex justify-between fixed top-0 w-full bg-white z-50'>
      <h1 className="text-3xl font-bold">Grondplan Creator</h1>
      <div className='flex gap-4 items-center'>
      <Link href="/">Home</Link>
      <Link href="/user">View all</Link>
      </div>
    </div>
  )
}

export default Nav;
