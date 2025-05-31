type ImageType = "avatar" | "banner" | "category" | "guarantee" | "payment";
export const imageUrl = (type: ImageType, url: string) =>
  `${process.env.MEDIA_URL}/${type}/${url}`;
