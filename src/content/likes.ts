export type LikeItem = {
  id: string;
  kind: "Song";
  title: string;
  creator: string;
  /** YouTube watch URL — required */
  href: string;
  /**
   * Official YouTube video thumbnail (served by Google/YouTube).
   * We do not host or redistribute label artwork; the image is tied to the linked video.
   */
  imageSrc: string;
  imageAlt: string;
};

function youtubeThumb(videoId: string) {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Songs for the home "I Like It, You Might Like It" section.
 * Images: YouTube CDN thumbnails only (no local album-art copies).
 */
export const likesContent = {
  title: "I Like It, You Might Like It",
  intro: "I have no favorites.",
  items: [
    {
      id: "song-orbit",
      kind: "Song",
      title: "Orbit",
      creator: "Colin Benders",
      href: "https://www.youtube.com/watch?v=Jlm7Gw4aIQo",
      imageSrc: youtubeThumb("Jlm7Gw4aIQo"),
      imageAlt: "YouTube thumbnail for Colin Benders — Orbit",
    },
    {
      id: "song-palladium",
      kind: "Song",
      title: "Palladium",
      creator: "Alan Braxe & Fred Falke",
      href: "https://www.youtube.com/watch?v=SYxmyWaxd_Y",
      imageSrc: youtubeThumb("SYxmyWaxd_Y"),
      imageAlt: "YouTube thumbnail for Alan Braxe & Fred Falke — Palladium",
    },
    {
      id: "song-she-found-now",
      kind: "Song",
      title: "She Found Now",
      creator: "My Bloody Valentine",
      href: "https://www.youtube.com/watch?v=xG8HEknM3zc",
      imageSrc: youtubeThumb("xG8HEknM3zc"),
      imageAlt: "YouTube thumbnail for my bloody valentine — she found now (visualiser)",
    },
  ] satisfies LikeItem[],
};
