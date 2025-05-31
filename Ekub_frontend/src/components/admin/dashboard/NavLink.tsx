import { Link } from "react-router-dom";
import { PiLineVerticalLight } from "react-icons/pi";
import React from "react";

interface NavLinkProps {
  to: string;
  title: string;
  count: number;
  change: string;
  Icon: React.ElementType;
}

const NavLink: React.FC<NavLinkProps> = ({ to, title, count, change, Icon }) => (
  <div className="shadow-sm w-1/2 md:w-1/4 bg-white rounded-lg py-2">
    <Link to={to}>
      <div className="py-5 pr-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <PiLineVerticalLight size={70} color="#4B9B41" opacity={0.5} />
            <div className="flex flex-col gap-1 items-start">
              <h4 className="text-sm font-medium text-[#B2B5BB]">
                {title}
              </h4>
              <h4 className="font-semibold text-2xl">{count}</h4>
              <h2 className="font-medium text-sm text-primary opacity-50">{change}</h2>
            </div>
          </div>
          <div>
            <Icon size={35} color="#4B9B41" />
          </div>
        </div>
      </div>
    </Link>
  </div>
);

export default NavLink;