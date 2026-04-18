import { cn } from "@/lib/utils";
const UserContent = ({ children, className }) => {
    return (
        <main 
            className={cn(
                "flex-1 w-full min-h-[calc(100vh-80px-100px)]",
                "bg-background text-foreground",
                className
            )}
        >
            <div className="w-full">
                {children}
            </div>
        </main>
    );
};

export default UserContent;
