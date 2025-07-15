import { useAppStore } from "../store";
import { Menu as MenuIcon } from "@mui/icons-material";

const YoutubeIconSection = () => {
  const { toggelSidebar } = useAppStore();
  return (
    <div
      className="flex items-center ml-4 "
      style={{
        height: "100%",
      }}
    >
      <button
        onClick={toggelSidebar}
        aria-label="menu"
        className=" text-white hover:bg-gray-700  rounded-full w-10 h-10"
      >
        <MenuIcon fontSize="medium" />
      </button>
      <button
        onClick={() => navigate("/")}
        className="w-[123px] h-[56px] cursor-default text-white font-bold text-2xl"
      >
        <span className="yt-icon-shape flex justify-center items-center">
          <img src="/assets/logo.png" className="w-[93px] h-[20px]" />
        </span>
      </button>
    </div>
  );
};

export default YoutubeIconSection;
