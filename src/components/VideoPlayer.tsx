interface VideoPlayerProps {
  url: string;
  title?: string;
  className?: string;
}

const getEmbedUrl = (url: string): { type: "youtube" | "vimeo" | "direct"; embedUrl: string } => {
  if (!url) return { type: "direct", embedUrl: "" };

  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/);
  if (ytMatch) return { type: "youtube", embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1` };

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return { type: "vimeo", embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?dnt=1` };

  // Direct video file
  return { type: "direct", embedUrl: url };
};

const VideoPlayer = ({ url, title, className = "" }: VideoPlayerProps) => {
  if (!url) return null;

  const { type, embedUrl } = getEmbedUrl(url);

  if (type === "direct") {
    return (
      <div className={`relative w-full rounded-xl overflow-hidden bg-black ${className}`}>
        <video
          src={embedUrl}
          title={title}
          controls
          className="w-full h-full"
          style={{ maxHeight: "480px" }}
        />
      </div>
    );
  }

  return (
    <div className={`relative w-full rounded-xl overflow-hidden bg-black ${className}`} style={{ paddingTop: "56.25%" }}>
      <iframe
        src={embedUrl}
        title={title || "Video"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full border-0"
      />
    </div>
  );
};

export default VideoPlayer;
