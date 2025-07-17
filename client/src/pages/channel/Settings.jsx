import { Switch, Button } from "@mui/material";
import { Link } from "react-router-dom";

const Settings = () => {
  const handleDeleteChannel = () => {
    if (
      window.confirm(
        "Are you sure you want to delete your channel? This action cannot be undone."
      )
    ) {
      console.log("Channel deleted");
    }
  };

  const handleUpdateChannelInfo = () => {
    console.log("Redirect to update channel info");
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center  text-white">
      <div className="flex w-full pl-5 flex-col md:w-[80%] min-h-screen">
        <div className="pt-5 text-5xl font-sans font-medium">Settings</div>
        <div className="mt-5 pl-5  flex-row flex">
          <div>
            <Switch defaultChecked />
          </div>
          <div className="flex-col flex pl-3">
            <div className="text-lg">Watch history</div>
            <div className="text-sm text-gray-500">
              Save videos I watch to my watch history.
            </div>
          </div>
        </div>
        <div className="pt-5 pl-2 text-2xl font-sans font-normal">
          Notifications
        </div>
        <div className="mt-5 pl-5  flex-row flex">
          <div>
            <Switch defaultChecked />
          </div>
          <div className="flex-col flex pl-3">
            <div className="text-lg">Subscriptions</div>
            <div className="text-sm text-gray-500">
              Notify me about new videos from my subscriptions.
            </div>
          </div>
        </div>
        <div className="mt-5 pl-5  flex-row flex">
          <div>
            <Switch defaultChecked />
          </div>
          <div className="flex-col flex pl-3">
            <div className="text-lg">New subscribers</div>
            <div className="text-sm text-gray-500">
              Notify me about my new subscribers.
            </div>
          </div>
        </div>
        <div className="mt-5 pl-5  flex-row flex">
          <div>
            <Switch defaultChecked />
          </div>
          <div className="flex-col flex pl-3">
            <div className="text-lg">Video Liked</div>
            <div className="text-sm text-gray-500">
              Notify me when someone likes my video.
            </div>
          </div>
        </div>

        <div className="mt-5 pl-5  flex-row flex">
          <div>
            <Switch defaultChecked />
          </div>
          <div className="flex-col flex pl-3">
            <div className="text-lg">Comment Liked</div>
            <div className="text-sm text-gray-500">
              Notify me when someone likes my comment.
            </div>
          </div>
        </div>

        <div className="mt-12 mb-10 mx-5 p-5 bg-gray-900 border border-red-700 shadow-lg rounded-xl">
          <div className="text-xl font-semibold text-red-500 mb-3">
            Danger Zone
          </div>
          <div className="text-sm text-gray-400 mb-5">
            These actions are irreversible. Proceed with caution.
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={handleDeleteChannel}
              className="w-full bg-red-600 hover:bg-red-700 text-black font-semibold py-2 px-4 rounded transition duration-300"
            >
              Delete Channel
            </button>

            <Link to="/profile-setup" className="w-full block">
              <button
                onClick={handleUpdateChannelInfo}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded transition duration-300"
              >
                Update Channel Info
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
