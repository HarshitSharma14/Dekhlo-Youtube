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
export const LOGOUT_ROUTE = `${AUTH_ROUTE}/logout`;

export const CHANNEL_ROUTE = `${server}/channel`;
export const UPDATE_CHANNEL_INFO_ROUTE = `${CHANNEL_ROUTE}/update-profile`;
export const GET_CHANNEL_DETAILS = `${CHANNEL_ROUTE}/get-info`;
export const GET_SUBSCRIBED_CHANNEL = `${CHANNEL_ROUTE}/get-subscribedchannels`;
export const GET_CHANNEL_VIDEOS = `${CHANNEL_ROUTE}/videos`; // add channel id at the end of it
export const GET_CHANNEL_PLAYLIST = `${CHANNEL_ROUTE}/playlists`;
export const GET_MY_PLAYLISTS = `${CHANNEL_ROUTE}/myplaylist`;
export const SUBSCRIBE_CHANNEL = `${CHANNEL_ROUTE}/subscribe`;
export const CHANNEL_WATCH_HISTORY = `${CHANNEL_ROUTE}/watch-history`;
export const PLAYLIST_VIDEOS = `${CHANNEL_ROUTE}/playlist`;
export const ADD_VIDEO_TO_PLAYLISTS = `${CHANNEL_ROUTE}/add-to-playlist`;
export const UNSUBSCRIBE_CHANNEL = `${CHANNEL_ROUTE}/unsubscribe`;
export const TOGGLE_BELL = `${CHANNEL_ROUTE}/toggle-bell`;
export const UPDATE_VIDEO_INFO = `${CHANNEL_ROUTE}/update-videoinfo`;
export const GET_PLAYLIST_VIDEOS = `${CHANNEL_ROUTE}/playlist`;
export const GET_NOTIFICATIONS = `${CHANNEL_ROUTE}/get-notifications`;
export const CHANGE_ISREAD = `${CHANNEL_ROUTE}/change-isread`;

export const VIDEO_ROUTE = `${server}/video`;

export const GET_VIDEO_DETAILS = `${VIDEO_ROUTE}/video-details`;
export const GET_VIDEO = `${VIDEO_ROUTE}/get-video`;
export const LIKE_UNLIKE = `${VIDEO_ROUTE}/like-unlike`;
export const GET_COMMENTS = `${VIDEO_ROUTE}/get-comments`;
export const PUT_COMMENT = `${VIDEO_ROUTE}/put-comment`;
export const GET_WATCH_NEXT = `${VIDEO_ROUTE}/get-watch-next`;
export const SEARCH_VIDEO_ROUTE = `${VIDEO_ROUTE}/search-video`;
export const AUTOCOMPLETE_ROUTE = `${VIDEO_ROUTE}/autocomplete`;
