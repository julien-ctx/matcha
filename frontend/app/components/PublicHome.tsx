"use client"

import React, { useEffect, useRef, useState } from 'react'
import './PublicHome.css'

export default function PublicHome() {
    const images = ['/front1.webp', '/front2.webp', '/front3.webp', '/front4.webp', '/front5.webp', '/front6.webp', '/front7.webp', '/front8.webp', '/front9.webp'];
    const [offset, setOffset] = useState(0);
    const containerRef = useRef(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);


    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         setOffset(prevOffset => {
    //             const maxOffset = containerRef.current.scrollWidth - containerRef.current.offsetWidth;
    //             return (prevOffset + 1) % maxOffset; // Reset when reaching the end
    //         });
    //     }, 10); // Adjust the speed by changing the interval time

    //     return () => clearInterval(interval);
    // }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex(prevIndex => {
                // Calculate next index, looping back to 0 after the last image
                return (prevIndex + 1) % images.length;
            });
        }, 4000); // 3000ms display time + 1000ms transition time

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="overflow-y-scroll w-full min-h-full h-full relative page-container">
            <div className="h-full w-full overflow-hidden relative">
                <div className="w-full h-full" style={{ transform: `translateX(-${currentImageIndex * 100}%)`, transition: 'transform 1s ease-out' }}>
                    {images.map((src, index) => (
                        <div className="image-container absolute w-full h-full inset-0 " style={{ left: `${index * 100}%` }}>
                            <img key={index} src={src} alt={`front ${index + 1}`} className=" w-full h-full object-cover"  />
                        </div>
                    ))}
                </div>
                <h1 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-8xl text-nowrap font-jersey10">&nbsp;Find your love with us&nbsp;</h1>
            </div>
            <footer className="h-1/3 w-full">sodiidofs</footer>
        </div>
    );
    return (
        <div className="h-full w-full">
            <div className="w-full h-full relative">
                <div ref={containerRef} className="whitespace-nowrap" style={{ transform: `translateX(-${offset}px)` }}>
                    {images.map((src, index) => (
                        <img key={index} src={src} alt={`front ${index + 1}`} className="w-full inline-block object-cover h-full" />
                    ))}
                </div>

                <img className="h-full w-full object-cover pointer-events-none" src="/front1.webp" alt="front" />
                <h1 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-8xl text-nowrap font-jersey10">&nbsp;Find your love with us&nbsp;</h1>
            </div>
        </div>
    )
}