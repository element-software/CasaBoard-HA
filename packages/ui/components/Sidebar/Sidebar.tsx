import Clock from "@repo/ui/components/Clock/index";
import Thermostat from "@repo/ui/components/Thermostat/index";
import Image from "next/image";

export const Sidebar = ({ children, thermostat }: { children: React.ReactNode, thermostat: string }) => {
  return (
    <>
      <div>
        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex flex-col gap-y-5 overflow-y-auto p-8 pb-4">
            <div className="flex flex-col">
              <Clock />
            </div>
            <div className="flex flex-1 flex-col w-full">
              <Thermostat entityId={thermostat}/>
            </div>
            <div className="flex flex-1 flex-row w-full text-center items-center justify-center gap-2 text-theme-text text-xs">
              Powered by 
              <Image src="https://element-connect.co.uk/wp-content/uploads/2024/02/EC-Logo-V2-Trimmed-White.png" alt="ec" width={100} height={100} />
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute bg-theme-background left-0 top-0 w-screen h-screen opacity-35" style={{ zIndex: "-1" }} />
            <div className="lg:pl-64">
              {children}
          </div>
        </div>
      </div>
    </>
  );
}
