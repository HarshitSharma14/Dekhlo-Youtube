import { formatDistanceToNow } from "date-fns";

export const formatUploadTime = (uploadTime) => {
  try {
    return formatDistanceToNow(new Date(uploadTime), { addSuffix: true });
  } catch (error) {
    return 0;
  }
};
