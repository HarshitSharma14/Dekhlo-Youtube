import { formatDistanceToNow } from "date-fns";

export const formatUploadTime = (uploadTime) => {
  return formatDistanceToNow(new Date(uploadTime), { addSuffix: true });
};
