import React, {useEffect, useState} from "react";
import { Calendar } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "./UI/Avatar";
import { format } from "date-fns";
import { useFetchLoggedInUserQuery } from "../redux/slices/authSlice";
import { useSelector } from "react-redux";
import NotificationCenter from "../components/NotificationCenter";
import clsx from "clsx";
import UserProfile from "./UserProfile";

const Header = () => {
  const today = format(new Date(), "d MMM yyyy, EEEE");
  const { data } = useFetchLoggedInUserQuery();
  const { mode, header } = useSelector((state) => state.theme);
  const [greeting, setGreeting] = useState("");
  const [prefix, setPrefix] = useState("");
  const { role } = useSelector((state) => state.role);

  useEffect(() => {
    const currentHour = new Date().getHours();
    let greet = "";

    if (currentHour < 12) {
      greet = "Good Morning";
    } else if (currentHour < 18) {
      greet = "Good Afternoon";
    } else {
      greet = "Good Evening";
    }

    setGreeting(greet);
  }, []);

  useEffect(() => {
    let prefix = "";
    if(role === "Doctor"){
      prefix = "Dr";
    }
    setPrefix(prefix)
  }, [])

  return (
    <header
      className={clsx(
        "w-full h-16 px-4 flex items-center justify-between",
        header.color?.includes("gradient") && header.color
      )}
      style={{
        background: !header.color?.includes("gradient")
          ? header.color || (mode === "dark" ? "#020817" : "#ffffff")
          : undefined,
        color: mode === "dark" ? "white" : "black",
      }}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4 overflow-hidden">
        <div className="hidden lg:flex items-center gap-2 bg-teal-500 p-2 rounded-full">
          <Calendar className="h-5 w-5 text-white" />
        </div>

        <div className="truncate">
          <h1
            className={clsx(
              "text-lg lg:text-xl font-bold truncate",
              ["#ffffff", "#fbfbfb", "#efeaed", "#d3d5d7"].includes(header.color)
                ? "text-black"
                : "text-white"
            )}
          >
            Hello, {prefix} {data?.name} 👋
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{greeting}</p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center border rounded-md px-3 py-1.5 text-sm lg:text-md text-white dark:text-black ">
          <Calendar className="h-4 w-4 mr-2" />
          <span>{today}</span>
        </div>

        {/* Notification Bell */}
        <NotificationCenter />

        {/* Avatar */}
        <div className="flex items-center justify-end">
          {data && <UserProfile user={data} />}
        </div>
      </div>
    </header>
  );
};

export default Header;
