'use client';

import React from 'react';
import ViewerStream from '~/components/live/viewer-stream';
import Sidebar from '~/components/layout/sidebar';

const WatchPage = () => {
    return (
        <div className="flex h-screen bg-black overflow-hidden relative font-body">
             <Sidebar />
             
             <div className="flex-1 flex flex-col relative z-20 pointer-events-none md:pointer-events-auto">
                 <div className="flex-1 overflow-hidden relative flex items-center justify-center">
                    <div className="w-full max-w-md h-full md:h-[90%] md:rounded-3xl overflow-hidden relative shadow-2xl border border-gray-800">
                        <ViewerStream />
                    </div>
                 </div>
             </div>
        </div>
    );
};

export default WatchPage;
