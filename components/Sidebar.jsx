"use client";

import Link from "next/link";
import { MoreHorizontal, SquarePen } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Search from "./Search";
import { dummyChats } from "@/constants";
import { useState } from "react";

const Sidebar = ({ chats = dummyChats, isCollapsed, onSelectChat }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredChats = dummyChats.filter(
    (chat) =>
      chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.lastMessage.text.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div
      data-collapsed={isCollapsed}
      className="relative group flex flex-col h-full bg-muted/10 dark:bg-muted/20 gap-4 p-2 data-[collapsed=true]:p-2"
    >
      {!isCollapsed && (
        <div className="flex justify-between p-2 items-center">
          <div className="flex gap-2 items-center text-lg">
            <p className="font-bold">Chats</p>
            {/* <span className="text-zinc-300">({chats.length})</span> */}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex text-sm font-semibold border gap-1.5 border-gray-200 px-4 py-2 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-5 h-5 "
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              New
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40">
              <DropdownMenuItem>New Chat</DropdownMenuItem>
              <DropdownMenuItem>Create Group</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>New Update</DropdownMenuItem>
              <DropdownMenuItem>Add Contact</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      <div className="pt-4">
        <Search
          searchTerm={searchTerm}
          filteredChats={filteredChats}
          setSearchTerm={setSearchTerm}
        />
      </div>
      <nav className="grid gap-1 mb-10 group-[[data-collapsed=true]]:justify-center">
        {filteredChats.map((chat, index) =>
          isCollapsed ? (
            <TooltipProvider key={index}>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <button
                    // onClick={() => onSelectChat(chat.id)}
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "icon" }),
                      "h-11 w-11"
                    )}
                  >
                    <Avatar>
                      <AvatarImage
                        src={chat.avatar}
                        alt={chat.name}
                        className="w-10 h-10"
                      />
                    </Avatar>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="flex gap-4">
                  {chat.name}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <div className="border-b border-gray-300">
              <button
                key={index}
                // onClick={() => onSelectChat(chat.id)}
                className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-100 w-full dark:hover:bg-gray-800"
              >
                <Avatar>
                  <AvatarImage
                    src={chat.avatar}
                    alt={chat.name}
                    className="w-10 h-10"
                  />
                </Avatar>

                <div className="flex flex-col py-1 font-bold text-left max-w-full w-full">
                  <span>{chat.name}</span>
                  {chat.lastMessage && (
                    <div className="flex gap-1">
                      <svg
                        width="12"
                        height="7"
                        viewBox="0 0 12 7"
                        fill="blue"
                        xmlns="http://www.w3.org/2000/svg"
                        class="w-6 h-6"
                      >
                        <path
                          d="M5.801 4.88L6.507 5.586L10.74 1.353L11.447 2.06L6.507 7L3.325 3.818L4.032 3.111L5.0945 4.1735L5.801 4.8795V4.88ZM5.802 3.466L8.278 0.989502L8.983 1.6945L6.507 4.171L5.802 3.466ZM4.3885 6.2935L3.682 7L0.5 3.818L1.207 3.111L1.9135 3.8175L1.913 3.818L4.3885 6.2935Z"
                          fill="blue"
                        ></path>
                      </svg>

                      <div className="text-zinc-400 text-xs truncate pt-1">
                        <p>
                          {chat.lastMessage.sender}: {chat.lastMessage.text}
                        </p>
                      </div>
                      {chat.number && (
                        <span className="w-6 h-6 flex items-center justify-center bg-green-300 rounded-full ml-auto">
                          {chat.number}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            </div>
          )
        )}
      </nav>
    </div>
  );
};

export default Sidebar;
