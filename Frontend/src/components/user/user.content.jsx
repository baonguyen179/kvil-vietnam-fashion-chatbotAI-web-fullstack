import { cn } from "@/lib/utils";
const UserContent = ({ children, className, style }) => {
    return (
        <main 
            className={cn(
                "flex-1 w-full min-h-[calc(100vh-80px-100px)]",
                "bg-background text-foreground",
                className
            )}
            style={style}
        >
            <div className="w-full">
                {children}
            </div>
        </main>
    );
};

export default UserContent;
