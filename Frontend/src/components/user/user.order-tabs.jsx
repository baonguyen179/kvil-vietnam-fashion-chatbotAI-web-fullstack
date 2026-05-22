import React from 'react';
import { cn } from '@/lib/utils';

const UserOrderTabs = ({ status, setStatus, statusTabs }) => {
    return (
        <div className="flex items-center gap-2 border-b border-[#eeeeee] overflow-x-auto no-scrollbar">
            {statusTabs.map((tab) => (
                <button
                    key={tab.value}
                    onClick={() => setStatus(tab.value)}
                    className={cn(
                        "px-6 py-4 text-sm font-medium transition-all relative min-w-fit",
                        status === tab.value ? "text-[#785254]" : "text-[#888888] hover:text-[#1c1c19]"
                    )}
                >
                    {tab.label}
                    {status === tab.value && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#785254]" />
                    )}
                </button>
            ))}
        </div>
    );
};

export default UserOrderTabs;
