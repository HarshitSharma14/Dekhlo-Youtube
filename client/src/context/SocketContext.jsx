import { createContext, useContext, useEffect, useRef } from "react"
import { io, Socket } from "socket.io-client"
import { server } from "../utils/constants"
import { useAppStore } from "../store"

const SocketContext = createContext(null)

export const useSocket = () => {
    return useContext(SocketContext)
}

export const SocketProvider = ({ children }) => {
    const socket = useRef()

    const { channelInfo, setNotifications, setNotificationsPending } = useAppStore()

    useEffect(() => {
        console.log("first context")
        if (channelInfo) {
            console.log("second context")

            socket.current = io(import.meta.env.VITE_SERVER_URL, {
                withCredentials: true,
                query: {
                    channelId: channelInfo._id
                }
            })
            socket.current.on("connect", () => {
                console.log("connected to socket server")
            })

            socket.current.on("newNotification", (notification) => {
                console.log("New notification received:", notification);
                setNotifications(notification);
                setNotificationsPending(true)
            })

            return () => {
                socket.current.disconnect()
            }
        }
    }, [channelInfo])

    return (
        <SocketContext.Provider value={socket.current}>
            {children}
        </SocketContext.Provider>
    )
}