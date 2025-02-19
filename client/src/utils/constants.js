export const server = `${import.meta.env.VITE_SERVER_URL}/api/v1`;

export const GET_HOME_VIDEOS_ROUTE = `${server}/home/videos`;

export const CATEGORY_ENUM = [
  "news",
  "sports",
  "education",
  "entertainment",
  "music",
  "technology",
  "gaming",
  "motivation",
  "art",
  "others",
];
export const AUTH_ROUTE = `${server}/auth`;
export const GOOGLE_LOGIN_URL = `${AUTH_ROUTE}/login/google`;
export const LOGIN_ROUTE = `${AUTH_ROUTE}/login`;

export const CHANNEL_ROUTE = `${server}/channel`;
export const UPDATE_CHANNEL_INFO_ROUTE = `${CHANNEL_ROUTE}/update-profile`;
export const GET_CHANNEL_DETAILS = `${CHANNEL_ROUTE}/get-info`;
export const GET_SUBSCRIBED_CHANNEL = `${CHANNEL_ROUTE}/get-subscribedchannels`;
export const GET_CHANNEL_VIDEOS = `${CHANNEL_ROUTE}/videos`; // add channel id at the end of it
export const GET_CHANNEL_PLAYLIST = `${CHANNEL_ROUTE}/playlists`;
export const SUBSCRIBE_CHANNEL = `${CHANNEL_ROUTE}/subscribe`;
export const UNSUBSCRIBE_CHANNEL = `${CHANNEL_ROUTE}/unsubscribe`;
export const TOGGLE_BELL = `${CHANNEL_ROUTE}/toggle-bell`;
export const UPDATE_VIDEO_INFO = `${CHANNEL_ROUTE}/update-videoinfo`;

export const VIDEO_ROUTE = `${server}/video`;

export const GET_VIDEO_DETAILS = `${VIDEO_ROUTE}/video-details`;
export const GET_VIDEO = `${VIDEO_ROUTE}/get-video`;
export const GET_PLAY_NEXT = `${VIDEO_ROUTE}/get-play-next`;
export const LIKE_UNLIKE = `${VIDEO_ROUTE}/like-unlike`;
export const GET_COMMENTS = `${VIDEO_ROUTE}/get-comments`;
export const PUT_COMMENT = `${VIDEO_ROUTE}/put-comment`;
